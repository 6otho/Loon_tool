// Disney+ 检测脚本 for Loon

const BASE_URL_DISNEY = 'https://www.disneyplus.com';
const STATUS_COMING = 2; // 即将登陆
const STATUS_AVAILABLE = 1; // 支持解锁
const STATUS_NOT_AVAILABLE = 0; // 不支持解锁
const STATUS_TIMEOUT = -1; // 检测超时
const STATUS_ERROR = -2; // 检测异常

const link = {
    "media-url": "https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/img/southpark/7.png"
};

const policy = $environment.params || "";

console.log("策略组：" + policy);

function checkDisneyPlus(node) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", BASE_URL_DISNEY, true);
        xhr.timeout = 5000; // 设置超时时间为 5 秒
        xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36");
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(`${node} ➟ 支持`);
            } else {
                reject(`${node} ➟ 不支持`);
            }
        };
        xhr.onerror = function () {
            reject(`${node} ➟ 检测异常`);
        };
        xhr.ontimeout = function () {
            reject(`${node} ➟ 检测超时`);
        };
        xhr.send();
    });
}

function checkNodes(nodes) {
    const promises = nodes.map(node => checkDisneyPlus(node));
    Promise.allSettled(promises).then(results => {
        const supported = results.filter(result => result.status === 'fulfilled').map(result => result.value);
        const unsupported = results.filter(result => result.status === 'rejected').map(result => result.reason);
        const content = `
            <b>支持节点：</b><br>${supported.join('<br>')}<br><br>
            <b>不支持节点：</b><br>${unsupported.join('<br>')}
        `;
        $done({ title: "Disney+ 检测结果", htmlMessage: content });
    });
}

if (policy) {
    // 如果有策略组，获取该策略组下的节点
    const message = { action: "get_customized_policy", content: policy };
    $configuration.sendMessage(message).then(response => {
        if (response.error) {
            console.log(response.error);
            $done();
        } else {
            const nodes = response.ret[policy]?.candidates || [];
            if (nodes.length === 0) {
                $done({ title: "Disney+ 检测结果", htmlMessage: "无有效节点" });
            } else {
                checkNodes(nodes);
            }
        }
    });
} else {
    // 如果没有策略组，直接检测传入的节点列表
    const nodes = $environment.params ? $environment.params.split(',') : [];
    if (nodes.length === 0) {
        $done({ title: "Disney+ 检测结果", htmlMessage: "无有效节点" });
    } else {
        checkNodes(nodes);
    }
}
