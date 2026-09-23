/**
 * @name: Trakt & TMDb 官方客户端播放源注入 (Infuse 跳转)
 * @author: 6otho
 * @repository: https://github.com/6otho/Loon_tool
 */

const url = $request.url;
let body = $response.body;

(function () {
    if (!body) {
        $done({});
        return;
    }

    try {
        // ----------------------------------------------------
        // 场景 1：拦截 Trakt 影视详情，提取并全局缓存片名
        // ----------------------------------------------------
        if (url.includes("api.trakt.tv")) {
            const isDetail = /https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)(\?.*)?$/.test(url);
            const isWatchNow = url.includes("/watchnow");

            if (isDetail && !isWatchNow) {
                let data = JSON.parse(body);
                if (data && data.title) {
                    const mediaInfo = {
                        title: data.title,
                        tmdb_id: data.ids?.tmdb || ""
                    };
                    $persistentStore.write(JSON.stringify(mediaInfo), "trakt_latest_media");
                    if (data.ids?.tmdb) {
                        $persistentStore.write(JSON.stringify(mediaInfo), `trakt_tmdb_${data.ids.tmdb}`);
                    }
                }
                $done({ body });
                return;
            }

            // 针对部分使用 Trakt 自有 watchnow 的接口也做兜底注入
            if (isWatchNow) {
                let query = getCachedTitle();
                let data = JSON.parse(body);
                const customItems = [
                    {
                        source: "infuse",
                        name: "在 Infuse 中播放",
                        link: `infuse://search?q=${encodeURIComponent(query)}`,
                        type: "link",
                        uhd: true
                    }
                ];

                if (Array.isArray(data)) {
                    data = [...customItems, ...data];
                } else if (typeof data === "object" && data !== null) {
                    for (const k in data) {
                        if (Array.isArray(data[k])) data[k] = [...customItems, ...data[k]];
                    }
                    if (Object.keys(data).length === 0) data["us"] = customItems;
                }
                $done({ body: JSON.stringify(data) });
                return;
            }
        }

        // ----------------------------------------------------
        // 场景 2：拦截 Trakt iOS 客户端请求的 TMDb 播放源 (核心)
        // 接口: api.themoviedb.org/3/movie/{id}/watch/providers
        // ----------------------------------------------------
        if (url.includes("api.themoviedb.org") && url.includes("/watch/providers")) {
            let data = JSON.parse(body);
            let query = getCachedTitle();

            // 提取当前 TMDb ID
            const tmdbMatch = url.match(/\/watch\/providers/);
            if (!query) {
                const idMatch = url.match(/\/(movie|tv)\/([0-9]+)\/watch\/providers/);
                if (idMatch) {
                    const cachedByTmdb = $persistentStore.read(`trakt_tmdb_${idMatch[2]}`);
                    if (cachedByTmdb) query = JSON.parse(cachedByTmdb).title;
                }
            }

            // 构造注入到 TMDb 播放源的 Infuse 项目
            const infuseItem = {
                display_priority: 0,
                logo_path: "/1Z85L0nO9SvdRjT5h88e2Z0rI1G.jpg", // 官方流媒体通用图标
                provider_id: 999999,
                provider_name: "Infuse"
            };

            const infuseLink = `infuse://search?q=${encodeURIComponent(query || "movie")}`;

            // 如果整个影视没有任何流媒体源
            if (!data.results || Object.keys(data.results).length === 0) {
                data.results = {};
            }

            // 支持的地区列表：覆盖常见地区确保客户端必定渲染出图标
            const targetRegions = ["CN", "US", "HK", "TW", "GB", "CA", "AU", "JP"];

            // 遍历并强行塞入 Infuse
            for (const region of targetRegions) {
                if (!data.results[region]) {
                    data.results[region] = {
                        link: infuseLink,
                        flatrate: [infuseItem]
                    };
                } else {
                    data.results[region].link = infuseLink;
                    if (!data.results[region].flatrate) {
                        data.results[region].flatrate = [];
                    }
                    // 把 Infuse 插入到播放源的第一个位置
                    data.results[region].flatrate.unshift(infuseItem);
                }
            }

            $done({ body: JSON.stringify(data) });
            return;
        }

        $done({ body });
    } catch (e) {
        $done({ body });
    }

    // 辅助函数：提取缓存的片名
    function getCachedTitle() {
        try {
            const raw = $persistentStore.read("trakt_latest_media");
            if (raw) return JSON.parse(raw).title || "";
        } catch (e) {}
        return "";
    }
})();
