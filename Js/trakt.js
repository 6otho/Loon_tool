/**
 * @name: Trakt 官方客户端播放源劫持注入 (修复版)
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
        // 1. 拦截影片/剧集详情：捕获片名
        // 匹配: /movies/xxx 或 /shows/xxx
        const isDetail = /https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)(\?.*)?$/.test(url);
        const isWatchNow = url.includes("/watchnow");

        if (isDetail && !isWatchNow) {
            let data = JSON.parse(body);
            if (data && data.title) {
                console.log(`[Trakt-Loon] 成功抓取片名: ${data.title}`);
                $persistentStore.write(data.title, "trakt_active_title");
            }
            $done({ body });
            return;
        }

        // 2. 拦截所有与播放源相关的请求 (包含带国家码和 justwatch_links 的路径)
        if (isWatchNow) {
            console.log(`[Trakt-Loon] 命中播放源接口: ${url}`);
            
            // 获取片名，若无则从 URL slug 提取
            let title = $persistentStore.read("trakt_active_title");
            if (!title) {
                const match = url.match(/\/(movies|shows)\/([^\/?#]+)/);
                if (match) {
                    title = decodeURIComponent(match[2]).replace(/-\d{4}$/, "").replace(/-/g, " ").trim();
                }
            }
            title = title || "movie";
            const infuseUrl = `infuse://search?q=${encodeURIComponent(title)}`;
            console.log(`[Trakt-Loon] 生成 Infuse 跳转目标: ${infuseUrl}`);

            let data = JSON.parse(body);

            // 构造合法的伪装播放源（使用 itunes / apple 作为 source，确保客户端必定有图标能渲染）
            const hijackItem = {
                source: "itunes", 
                name: "Infuse 播放",
                link: infuseUrl,
                type: "link",
                uhd: true
            };

            // 策略 A：返回数据是数组格式
            if (Array.isArray(data)) {
                // 如果原本就有流媒体源，顺便把现存所有的 link 都改掉，确保点哪个都跳 Infuse
                data.forEach(item => { item.link = infuseUrl; });
                // 将伪装的 Infuse 项插在第一位
                data.unshift(hijackItem);
            } 
            // 策略 B：返回数据是按国家分区的对象格式 {"us": [...], ...}
            else if (typeof data === "object" && data !== null) {
                const regions = Object.keys(data);
                if (regions.length === 0) {
                    // 原本无流媒体数据的影片，强制生成常用地区
                    data["us"] = [hijackItem];
                    data["cn"] = [hijackItem];
                } else {
                    for (const r of regions) {
                        if (Array.isArray(data[r])) {
                            data[r].forEach(item => { item.link = infuseUrl; });
                            data[r].unshift(hijackItem);
                        } else {
                            data[r] = [hijackItem];
                        }
                    }
                }
            } else {
                data = [hijackItem];
            }

            $done({ body: JSON.stringify(data) });
            return;
        }

        $done({ body });
    } catch (err) {
        console.log(`[Trakt-Loon] 脚本执行报错: ${err}`);
        $done({ body });
    }
})();
