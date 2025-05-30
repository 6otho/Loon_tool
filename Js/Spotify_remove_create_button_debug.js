// 移除Spotify右下角"创建"按钮 (修复版)
if (!$response.body) $done({});

// 内联proto定义，避免依赖GitHub
const bootstrapProto = `
syntax = "proto3";

message BootstrapResponse {
    message AccountAttributesSuccess {
        message AccountAttributes {
            map<string, Value> attributes = 1;
        }
        AccountAttributes accountAttributes = 1;
    }
    AccountAttributesSuccess accountAttributesSuccess = 1;
}

message Value {
    oneof kind {
        bool boolValue = 1;
        string stringValue = 2;
    }
}
`;

const ucsProto = `
syntax = "proto3";

message CustomizationResponse {
    message UcsResponseV0 {
        message Success {
            message Customization {
                message Success {
                    message AccountAttributesSuccess {
                        message AccountAttributes {
                            map<string, Value> attributes = 1;
                        }
                        AccountAttributes accountAttributes = 1;
                    }
                    AccountAttributesSuccess accountAttributesSuccess = 1;
                }
                Success success = 1;
            }
            Customization customization = 1;
        }
        Success success = 1;
    }
    UcsResponseV0 ucsResponseV0 = 1;
}

message Value {
    oneof kind {
        bool boolValue = 1;
        string stringValue = 2;
    }
}
`;

(async () => {
  try {
    console.log("开始加载protobuf库");
    const protobuf = await import('https://cdn.jsdelivr.net/npm/protobufjs@7.2.4/dist/protobuf.min.js');
    console.log("protobuf库加载成功");
    
    const url = $request.url;
    console.log(`请求URL: ${url}`);
    
    const isBootstrap = url.includes("/bootstrap");
    console.log(`请求类型: ${isBootstrap ? "Bootstrap" : "UCS"}`);
    
    // 使用内联proto定义
    const protoText = isBootstrap ? bootstrapProto : ucsProto;
    const messageName = isBootstrap ? "BootstrapResponse" : "CustomizationResponse";
    console.log(`使用内联proto定义: ${messageName}`);
    
    const raw = new Uint8Array($response.body);
    console.log(`原始响应长度: ${raw.length}字节`);
    
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
        attrs = decoded.accountAttributesSuccess?.accountAttributes?.attributes;
        console.log(`Bootstrap路径: ${attrs ? "找到" : "未找到"}`);
    } else {
        // UCS路径
        attrs = decoded.ucsResponseV0?.success?.customization?.success?.accountAttributesSuccess?.accountAttributes?.attributes;
        
        console.log(`UCS路径状态:
  ucsResponseV0: ${decoded.ucsResponseV0 ? "存在" : "缺失"}
  success: ${decoded.ucsResponseV0?.success ? "存在" : "缺失"}
  customization: ${decoded.ucsResponseV0?.success?.customization ? "存在" : "缺失"}
  customizationSuccess: ${decoded.ucsResponseV0?.success?.customization?.success ? "存在" : "缺失"}
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
    console.log("脚本执行完成，响应已修改");
    
  } catch (e) {
    console.log(`脚本执行出错: ${e.stack || e.message}`);
    $done({});
  }
})();