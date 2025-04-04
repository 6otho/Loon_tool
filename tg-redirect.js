// tg-redirect.js

if (typeof $request !== 'undefined') {
  // 获取传入的 jump 参数，默认为空
  let jump = $argument.jump || "";
  let url = $request.url;
  
  // 判断是否为 Telegram 链接
  if (/^(https:\/\/)?t\.me\/(.+)/.test(url)) {
    let redirectUrl = "";
    
    if (jump === "sg") {
      // 例如将 https://t.me/xxx 转换为 swiftgram://resolve?domain=xxx
      redirectUrl = url.replace(/^(https:\/\/)?t\.me\/(.+)/, "swiftgram://resolve?domain=$2");
    } else if (jump === "turrit") {
      // 例如转换为 turrit://xxx（根据实际客户端协议进行修改）
      redirectUrl = url.replace(/^(https:\/\/)?t\.me\/(.+)/, "turrit://$2");
    } else {
      // 若没有选择或者参数异常，直接跳转原链接
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
    // 如果 URL 不匹配，直接返回请求不作处理
    $done({});
  }
}
