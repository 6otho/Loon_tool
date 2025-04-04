// tg-redirect.js

if (typeof $request !== 'undefined') {
  // 获取传入的 jump 参数，默认 sg
  let jump = ($argument && $argument.jump) ? $argument.jump.toLowerCase().trim() : "sg";
  let url = $request.url;

  if (/^(https:\/\/)?t\.me\/(.+)/.test(url)) {
    let redirectUrl = "";

    if (jump === "sg") {
      redirectUrl = url.replace(/^(https:\/\/)?t\.me\/(.+)/, "swiftgram://resolve?domain=$2");
    } else if (jump === "turrit") {
      redirectUrl = url.replace(/^(https:\/\/)?t\.me\/(.+)/, "turrit://$2");
    } else {
      redirectUrl = url;
    }

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
