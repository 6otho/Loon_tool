/**
 * Trakt 客户端播放渠道劫持脚本
 */
const url = $request.url;
let body = $response.body;

(function () {
    if (!body) {
        $done({});
        return;
    }

    try {
        let data = JSON.parse(body);

        // 1. 匹配影视详情接口：提取片名并缓存
        // 示例: https://api.trakt.tv/movies/avatar-the-way-of-water-2022
        const isDetail = url.match(/^https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)(\?.*)?$/);
        if (isDetail && !url.includes("/watchnow") && data.title) {
            const cache = {
                title: data.title,
                year: data.year || ""
            };
            $persistentStore.write(JSON.stringify(cache), "trakt_latest_title");
            $done({ body });
            return;
        }

        // 2. 匹配播放源/流媒体提供商接口：注入 Infuse / VidHub 播放源
        // 示例: https://api.trakt.tv/movies/12345/watchnow
        const isWatchNow = url.match(/^https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)\/watchnow/);
        if (isWatchNow) {
            // 获取缓存的片名，如果没取到则提取 URL 中的 slug 替代
            let query = "";
            const cacheStr = $persistentStore.read("trakt_latest_title");
            if (cacheStr) {
                try {
                    query = JSON.parse(cacheStr).title;
                } catch (e) {}
            }
            if (!query) {
                query = decodeURIComponent(isWatchNow[2]).replace(/-/g, " ");
            }

            // 构造需要注入的播放器源 (App 会原生渲染并在点击时唤起 URL Scheme)
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
                }
            ];

            // Trakt API 返回格式可能直接是数组，也可能是按国家码分区的对象
            if (Array.isArray(data)) {
                data = [...customItems, ...data];
            } else if (typeof data === "object" && data !== null) {
                let hasKey = false;
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        data[key] = [...customItems, ...data[key]];
                        hasKey = true;
                    }
                }
                // 如果当前所在地区没有流媒体商（空列表），强制补一个默认区域
                if (!hasKey || Object.keys(data).length === 0) {
                    data["us"] = customItems;
                }
            }

            $done({ body: JSON.stringify(data) });
            return;
        }

        $done({ body });
    } catch (err) {
        $done({ body });
    }
})();
