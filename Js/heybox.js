/**
 * 小黑盒（Heybox）签到脚本
 * 支持 Loon / Quantumult X / Surge
 */

const $ = new Env("小黑盒签到");
const cookieKey = "xhh_cookie";
const urlKey = "xhh_sign_url";

if (typeof $request !== "undefined") {
    // 1. 抓包模式：捕捉小黑盒请求中的 Cookie 和完整 URL（含 hkey 签名参数）
    getCookie();
} else {
    // 2. 定时任务模式：发起签到请求
    checkIn();
}

function getCookie() {
    if ($request.url && $request.headers) {
        const cookie = $request.headers["Cookie"] || $request.headers["cookie"];
        if (cookie) {
            $.setdata(cookie, cookieKey);
            $.setdata($request.url, urlKey);
            $.msg("小黑盒", "凭据获取成功 🟢", "已保存最新请求 Header 和签名参数");
        }
    }
    $.done();
}

function checkIn() {
    const cookie = $.getdata(cookieKey);
    const savedUrl = $.getdata(urlKey);

    if (!cookie) {
        $.msg("小黑盒签到", "签到失败 ❌", "未找到 Cookie，请先打开小黑盒 App 触发抓包");
        $.done();
        return;
    }

    // 构建签到请求（若无法获取具体签到URL，则退而求其次使用保存的带参URL或默认接口）
    let signUrl = savedUrl ? savedUrl.replace("/account/home_v2/", "/task/sign/") : "https://api.xiaoheihe.cn/task/sign/";

    const request = {
        url: signUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
            "Cookie": cookie,
            "Referer": "http://api.maxjia.com/"
        }
    };

    $.get(request, (error, response, data) => {
        if (error) {
            $.msg("小黑盒签到", "请求异常 ❌", error);
        } else {
            try {
                const res = JSON.parse(data);
                if (res.status === "ok") {
                    const streak = res.result?.sign_in_streak || 1;
                    $.msg("小黑盒签到", "签到成功 🎉", `已连续签到 ${streak} 天`);
                } else if (res.status === "login" || res.msg?.includes("已签到")) {
                    $.msg("小黑盒签到", "重复签到 ℹ️", res.msg || "今日已完成签到");
                } else {
                    $.msg("小黑盒签到", "签到提示 ⚠️", res.msg || `返回状态: ${res.status}`);
                }
            } catch (e) {
                $.msg("小黑盒签到", "解析失败 ❌", "返回数据非 JSON 格式");
            }
        }
        $.done();
    });
}

// 兼容不同软件环境的通用库封装
function Env(name) {
    const isLoon = typeof $loon !== "undefined";
    const isQuanX = typeof $task !== "undefined";
    
    return {
        name,
        getdata: (key) => {
            if (isLoon) return $persistentStore.read(key);
            if (isQuanX) return $prefs.valueForKey(key);
        },
        setdata: (val, key) => {
            if (isLoon) return $persistentStore.write(val, key);
            if (isQuanX) return $prefs.setValueForKey(val, key);
        },
        msg: (title, subtitle, body) => {
            if (isLoon) $notification.post(title, subtitle, body);
            if (isQuanX) $notify(title, subtitle, body);
        },
        get: (options, callback) => {
            if (isLoon) $httpClient.get(options, callback);
            if (isQuanX) {
                options.method = "GET";
                $task.fetch(options).then(
                    (response) => callback(null, response, response.body),
                    (reason) => callback(reason.error, null, null)
                );
            }
        },
        done: () => {
            if (isLoon) $done({});
            if (isQuanX) $done();
        }
    };
}
