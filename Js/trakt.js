/**
 * @name: Trakt 官方客户端播放源注入 (Infuse / VidHub / SenPlayer / Fileball)
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
        const isWatchNow = url.includes("/watchnow");
        const isDetail = /https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)(\?.*)?$/.test(url);

        // 1. 拦截影视详情页：提取片名并建立精确缓存
        if (isDetail && !isWatchNow) {
            let data = JSON.parse(body);
            if (data && data.title) {
                const mediaInfo = {
                    title: data.title,
                    year: data.year || "",
                    imdb: data.ids?.imdb || ""
                };
                const jsonStr = JSON.stringify(mediaInfo);
                // 全局最新缓存
                $persistentStore.write(jsonStr, "trakt_latest_media");
                // 精准 Slug 与 ID 缓存
                if (data.ids?.slug) {
                    $persistentStore.write(jsonStr, `trakt_media_${data.ids.slug}`);
                }
                if (data.ids?.trakt) {
                    $persistentStore.write(jsonStr, `trakt_media_${data.ids.trakt}`);
                }
            }
            $done({ body });
            return;
        }

        // 2. 拦截“Where to Watch / 播放源”接口：注入播放器跳转
        if (isWatchNow) {
            const match = url.match(/https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)/);
            const idOrSlug = match ? match[2] : null;

            let media = null;
            // 优先读取精准缓存
            if (idOrSlug) {
                const specific = $persistentStore.read(`trakt_media_${idOrSlug}`);
                if (specific) {
                    try { media = JSON.parse(specific); } catch (e) {}
                }
            }
            // 次选读取最近浏览缓存
            if (!media) {
                const latest = $persistentStore.read("trakt_latest_media");
                if (latest) {
                    try { media = JSON.parse(latest); } catch (e) {}
                }
            }

            // 容错处理：若缓存未命中，直接从 URL 中的 slug 还原片名
            let query = (media && media.title) ? media.title : "";
            if (!query && idOrSlug) {
                query = decodeURIComponent(idOrSlug).replace(/-\d{4}$/, "").replace(/-/g, " ").trim();
            }

            // 构造注入的播放器列表（自带 Infuse、VidHub、SenPlayer、Fileball）
            const customItems = [
                {
                    source: "infuse",
                    name: "Infuse 搜索",
                    link: `infuse://search?q=${encodeURIComponent(query)}`,
                    type: "link",
                    uhd: true
                },
                {
                    source: "vidhub",
                    name: "VidHub 搜索",
                    link: `vidhub://search?query=${encodeURIComponent(query)}`,
                    type: "link",
                    uhd: true
                },
                {
                    source: "senplayer",
                    name: "SenPlayer 搜索",
                    link: `senplayer://search?keyword=${encodeURIComponent(query)}`,
                    type: "link",
                    uhd: true
                },
                {
                    source: "fileball",
                    name: "Fileball 搜索",
                    link: `fileball://search?query=${encodeURIComponent(query)}`,
                    type: "link",
                    uhd: true
                }
            ];

            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                data = {};
            }

            // 兼容 Trakt API 的不同数据格式（数组、国家键值对象或空对象）
            if (Array.isArray(data)) {
                data = [...customItems, ...data];
            } else if (typeof data === "object" && data !== null) {
                const keys = Object.keys(data);
                // 若 Trakt 原本无流媒体源（空对象），补全常见地区以保证按钮正常渲染
                if (keys.length === 0) {
                    data["us"] = customItems;
                    data["cn"] = customItems;
                } else {
                    for (const k of keys) {
                        if (Array.isArray(data[k])) {
                            data[k] = [...customItems, ...data[k]];
                        } else {
                            data[k] = customItems;
                        }
                    }
                }
            } else {
                data = customItems;
            }

            $done({ body: JSON.stringify(data) });
            return;
        }

        $done({ body });
    } catch (err) {
        $done({ body });
    }
})();
