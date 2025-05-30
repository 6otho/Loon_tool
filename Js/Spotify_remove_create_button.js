// 唯一功能：移除Spotify右下角"创建"按钮
if (!$response.body) $done({});

(async () => {
  const protobuf = await import('https://cdn.jsdelivr.net/npm/protobufjs@7.2.4/dist/protobuf.min.js');
  
  const isBootstrap = $request.url.includes("/bootstrap");
  const schemaUrl = isBootstrap 
    ? "https://raw.githubusercontent.com/001ProMax/Surge/main/Script/Spotify_Bootstrap.proto"
    : "https://raw.githubusercontent.com/001ProMax/Surge/main/Script/Spotify_UCS.proto";
  
  const messageName = isBootstrap ? "BootstrapResponse" : "CustomizationResponse";
  const raw = new Uint8Array($response.body);
  
  try {
    const root = await fetch(schemaUrl).then(r => r.text()).then(proto => protobuf.parse(proto).root);
    const decoded = root.lookupType(messageName).decode(raw);
    
    // 只定位和修改创建按钮相关属性
    const attrs = isBootstrap
      ? decoded.accountAttributesSuccess?.accountAttributes
      : decoded.ucsResponseV0?.success?.customization?.success?.accountAttributesSuccess?.accountAttributes;
    
    // 唯一修改：禁用创建按钮
    if (attrs) {
      attrs["publish-playlist"] = { boolValue: false };
    }
    
    const encoded = root.lookupType(messageName).encode(decoded).finish();
    $done({ body: encoded.buffer });
    
  } catch (e) {
    console.log(`Spotify创建按钮移除失败: ${e}`);
    $done({});
  }
})();