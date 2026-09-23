/**
 * @name: Trakt 详情页简介注入播放器跳转按钮 (Markdown 方案)
 * @author: 6otho
 */

const url = $request.url;
let body = $response.body;

(function () {
    if (!body) {
        $done({});
        return;
    }

    try {
        // 匹配 Trakt 电影与剧集详情请求 (兼容 ?extended=full 等各种参数)
        const isDetail = /https?:\/\/api\.trakt\.tv\/(movies|shows)\/([^\/?#]+)/.test(url);
        const isExcluded = url.includes("/watchnow") || url.includes("/comments") || url.includes("/ratings") || url.includes("/stats");

        if (isDetail && !isExcluded) {
            let data = JSON.parse(body);

            if (data && data.title) {
                const title = data.title;
                const encodedTitle = encodeURIComponent(title);

                // 构造 Markdown 格式的快捷跳转按钮
                const buttons = [
                    `[▶️ Infuse](infuse://search?q=${encodedTitle})`,
                    `[VidHub](vidhub://search?query=${encodedTitle})`,
                    `[Forward](forward://search?query=${encodedTitle})`
                ].join("  |  ");

                const jumpBlock = `\n\n🎬 快捷播放：\n${buttons}`;

                // 直接追加在影视简介（overview）的最后
                if (data.overview) {
                    data.overview = data.overview + jumpBlock;
                } else {
                    data.overview = jumpBlock;
                }

                $done({ body: JSON.stringify(data) });
                return;
            }
        }

        $done({ body });
    } catch (e) {
        $done({ body });
    }
})();
