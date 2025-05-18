// Spotify歌词翻译封装版 - 用户只需填参数
// 更新时间：2024-10-02
const BAIDU_API = "https://fanyi-api.baidu.com/api/trans/vip/translate";

function main() {
  const body = JSON.parse($response.body);
  if (!body?.lyrics?.syncLyrics) return;
  
  try {
    // 1. 获取用户填写的参数
    const appid = $arguments.appid;
    const secretKey = $arguments.secretKey;
    if (!appid || !secretKey) throw "请填写AppID和密钥";
    
    // 2. 提取原歌词
    const lines = body.lyrics.syncLyrics.lines;
    const text = lines.map(l => l.words).join("\n");
    
    // 3. 生成百度签名
    const salt = Date.now();
    const sign = CryptoJS.MD5(appid + text + salt + secretKey).toString();
    
    // 4. 请求翻译
    const url = `${BAIDU_API}?q=${encodeURIComponent(text)}&from=auto&to=zh&appid=${appid}&salt=${salt}&sign=${sign}`;
    const res = $http.get({ url });
    if (res.data.error_code) throw res.data.error_msg;
    
    // 5. 注入翻译
    const translated = res.data.trans_result[0].dst.split("\n");
    lines.forEach((line, i) => line.words += `\n${translated[i] || ""}`);
    
  } catch (err) {
    $notification.post("❌ 翻译失败", String(err), "");
  }
  $done({ body: JSON.stringify(body) });
}

main();
