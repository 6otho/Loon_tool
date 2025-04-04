// tg-redirect.js

if (typeof $request !== 'undefined') {
  // 获取传入的 jump 参数，默认使用 "sg"
  let jump = ($argument && $argument.jump) ? $argument.jump.toLowerCase().trim() : "sg";
  let url = $request.url;

  // 判断是否为 Telegram 链接
  if (/^(https:\/\/)?t\.me\/(.+)/.test(url)) {
    let redirectUrl = "";

    if (jump === "sg") {
      // 将 Telegram 链接转换为 swiftgram 协议链接
      // 例如：https://t.me/xxx -> swiftgram://resolve?domain=xxx
      redirectUrl = url.replace(/^(https:\/\/)?t\.me\/(.+)/, "swiftgram://resolve?domain=$2");
    } else if (jump === "turrit") {
      // 将 Telegram 链接转换为 turrit 协议链接
      // 例如：https://t.me/xxx -> turrit://$2
      redirectUrl = url.replace(/^(https:\/\/)?t\.me\/(.+)/, "turrit://$2");
    } else {
      // 参数异常时直接使用原链接
      redirectUrl = url;
    }

    // 返回 302 重定向响应
    $done({
      response: {
        status: 302,
        headers: {
          Location: redirectUrl
        }
      }
    });
  } else {
    $done({});
  }
}
