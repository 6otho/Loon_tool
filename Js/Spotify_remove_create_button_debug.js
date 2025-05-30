// 移除Spotify右下角"创建"按钮 (调试版)
console.log("脚本开始执行");
if (!$response.body) {
    console.log("无响应体，退出");
    $done({});
}

(async () => {
    try {
        console.log("开始加载protobuf库");
        const protobuf = await import('https://cdn.jsdelivr.net/npm/protobufjs@7.2.4/dist/protobuf.min.js');
        console.log("protobuf库加载成功");
        
        const url = $request.url;
        console.log(`请求URL: ${url}`);
        
        const isBootstrap = url.includes("/bootstrap");
        console.log(`请求类型: ${isBootstrap ? "Bootstrap" : "UCS"}`);
        
        const schemaUrl = isBootstrap 
            ? "https://raw.githubusercontent.com/001ProMax/Surge/main/Script/Spotify_Bootstrap.proto"
            : "https://raw.githubusercontent.com/001ProMax/Surge/main/Script/Spotify_UCS.proto";
        
        console.log(`使用proto文件: ${schemaUrl}`);
        
        const messageName = isBootstrap ? "BootstrapResponse" : "CustomizationResponse";
        console.log(`消息类型: ${messageName}`);
        
        const raw = new Uint8Array($response.body);
        console.log(`原始响应长度: ${raw.length}字节`);
        
        // 获取proto定义
        console.log("开始获取proto定义");
        const protoResponse = await fetch(schemaUrl);
        if (!protoResponse.ok) {
            throw new Error(`获取proto失败: ${protoResponse.status}`);
        }
        const protoText = await protoResponse.text();
        console.log(`proto文件获取成功，长度: ${protoText.length}字符`);
        
        // 解析proto
        console.log("开始解析proto");
        const root = protobuf.parse(protoText).root;
        const messageType = root.lookupType(messageName);
        if (!messageType) {
            throw new Error(`未找到消息类型: ${messageName}`);
        }
        console.log(`消息类型解析成功`);
        
        // 解码响应
        console.log("开始解码响应");
        const decoded = messageType.decode(raw);
        console.log("响应解码成功");
        
        // 定位accountAttributes
        console.log("定位accountAttributes...");
        let attrs;
        if (isBootstrap) {
            attrs = decoded.accountAttributesSuccess?.accountAttributes;
            console.log(`Bootstrap路径: ${attrs ? "找到" : "未找到"}`);
        } else {
            // UCS路径较长，需要逐级检查
            console.log("检查UCS路径...");
            const ucsResponse = decoded.ucsResponseV0;
            const success = ucsResponse?.success;
            const customization = success?.customization;
            const customizationSuccess = customization?.success;
            attrs = customizationSuccess?.accountAttributesSuccess?.accountAttributes;
            
            console.log(`UCS路径状态:
  ucsResponseV0: ${ucsResponse ? "存在" : "缺失"}
  success: ${success ? "存在" : "缺失"}
  customization: ${customization ? "存在" : "缺失"}
  customizationSuccess: ${customizationSuccess ? "存在" : "缺失"}
  accountAttributes: ${attrs ? "找到" : "未找到"}`);
        }
        
        // 修改属性
        if (attrs) {
            console.log("找到accountAttributes，准备修改publish-playlist属性");
            console.log(`修改前: publish-playlist = ${attrs["publish-playlist"]?.boolValue}`);
            
            attrs["publish-playlist"] = { boolValue: false };
            
            console.log(`修改后: publish-playlist = ${attrs["publish-playlist"]?.boolValue}`);
        } else {
            console.log("未找到accountAttributes，无法修改");
            $done({});
            return;
        }
        
        // 编码响应
        console.log("开始编码修改后的响应");
        const encoded = messageType.encode(decoded).finish();
        console.log(`编码成功，新长度: ${encoded.length}字节`);
        
        $done({ body: encoded.buffer });
        
    } catch (e) {
        console.log(`脚本执行出错: ${e.stack || e}`);
        $done({});
    }
})();