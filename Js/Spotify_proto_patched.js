// Spotify Premium Patch + Remove "Create" button
if (!$response.body) {
  $done({});
}

(async () => {
  const protobuf = await import('https://cdn.jsdelivr.net/npm/protobufjs@7.2.4/dist/protobuf.min.js');

  const parseProto = (buffer, schemaUrl, messageName) =>
    fetch(schemaUrl)
      .then(res => res.text())
      .then(proto => protobuf.parse(proto).root.lookupType(messageName).decode(buffer));

  const serializeProto = (object, schemaUrl, messageName) =>
    fetch(schemaUrl)
      .then(res => res.text())
      .then(proto => protobuf.parse(proto).root.lookupType(messageName).encode(object).finish());

  const isBootstrap = $request.url.includes("/bootstrap");

  const schemaUrl = isBootstrap
    ? "https://raw.githubusercontent.com/001ProMax/Surge/main/Script/Spotify_Bootstrap.proto"
    : "https://raw.githubusercontent.com/001ProMax/Surge/main/Script/Spotify_UCS.proto";

  const messageName = isBootstrap ? "BootstrapResponse" : "CustomizationResponse";

  const raw = new Uint8Array($response.body);

  try {
    const decoded = await parseProto(raw, schemaUrl, messageName);

    // 打补丁
    const attrs = isBootstrap
      ? decoded.accountAttributesSuccess?.accountAttributes
      : decoded.ucsResponseV0?.success?.customization?.success?.accountAttributesSuccess?.accountAttributes;

    if (attrs) {
      Object.assign(attrs, {
        ads: { boolValue: false },
        "offline": { boolValue: true },
        "player-license": { stringValue: "premium" },
        "streaming-rules": { stringValue: "" },
        "nft-disabled": { stringValue: "1" },
        "publish-playlist": { boolValue: false }, // << 屏蔽右下角“创建”按钮
        "type": { stringValue: "premium" }
      });
    }

    const encoded = await serializeProto(decoded, schemaUrl, messageName);
    $done({ body: encoded.buffer });

  } catch (e) {
    console.log("Spotify patch failed:", e);
    $done({});
  }
})();