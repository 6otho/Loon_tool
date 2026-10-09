// WeTalk_GetCookie.js (智能判定：新账号入库 / 老账号更新识别 + 5秒通知防抖)
const scriptName = 'WeTalk Cookie获取';
const storeKey = 'wetalk_accounts_v1';

const isLoon = typeof $loon !== "undefined" || typeof $httpClient !== "undefined";
const isQX = typeof $task !== "undefined";

function readVal(key) {
    if (isLoon) return $persistentStore.read(key);
    if (isQX) return $prefs.valueForKey(key);
    return null;
}

function writeVal(val, key) {
    if (isLoon) return $persistentStore.write(String(val), key);
    if (isQX) return $prefs.setValueForKey(String(val), key);
    return false;
}

function notify(title, subtitle, body) {
    if (isLoon) $notification.post(String(title), String(subtitle), String(body));
    if (isQX) $notify(String(title), String(subtitle), String(body));
}

// 5 秒防抖：避免 App 连续请求导致同一个账号瞬间连弹多次通知
function isDebounced(identifier, intervalMs = 5000) {
    const now = Date.now();
    const lastKey = `wetalk_cookie_notify_${identifier}`;
    let lastTime = 0;
    try {
        const val = readVal(lastKey);
        if (val) lastTime = parseInt(val, 10);
    } catch (e) {}

    if (now - lastTime < intervalMs) return true;
    writeVal(String(now), lastKey);
    return false;
}

function normalizeHeaderNameMap(headers) {
    const out = {};
    Object.keys(headers || {}).forEach(k => out[k] = headers[k]);
    return out;
}

function parseRawQuery(url) {
    const query = (url.split('?')[1] || '').split('#')[0];
    const rawMap = {};
    query.split('&').forEach(pair => {
        if (!pair) return;
        const idx = pair.indexOf('=');
        if (idx < 0) return;
        rawMap[pair.slice(0, idx)] = pair.slice(idx + 1);
    });
    return rawMap;
}

function loadStore() {
    const raw = readVal(storeKey);
    if (!raw) return { version: 1, accounts: {}, order: [] };
    try {
        const obj = JSON.parse(raw);
        if (!obj.accounts) obj.accounts = {};
        if (!Array.isArray(obj.order)) obj.order = Object.keys(obj.accounts);
        return obj;
    } catch (e) {
        return { version: 1, accounts: {}, order: [] };
    }
}

function saveStore(store) {
    writeVal(JSON.stringify(store), storeKey);
}

// ================= 主逻辑 =================
try {
    if (typeof $request !== 'undefined' && $request.url) {
        const paramsRaw = parseRawQuery($request.url);
        const headersMap = normalizeHeaderNameMap($request.headers || {});
        
        let baseUA = '';
        Object.keys(headersMap).forEach(k => { 
            if (k.toLowerCase() === 'user-agent') baseUA = headersMap[k]; 
        });

        // 判定 1：提取账号核心标识（优先邮箱，其次 ID / 手机号）
        let rawEmail = paramsRaw['email'] || '';
        let rawUid = paramsRaw['userId'] || paramsRaw['uid'] || paramsRaw['phone'] || paramsRaw['account'] || '';
        
        let email = '';
        try { email = rawEmail ? decodeURIComponent(rawEmail).trim() : ''; } catch (e) { email = rawEmail; }
        let uid = '';
        try { uid = rawUid ? decodeURIComponent(rawUid).trim() : ''; } catch (e) { uid = rawUid; }

        let userIdentifier = email || uid;

        // 判定 2：未登录空请求直接过滤丢弃
        if (!userIdentifier || userIdentifier === 'undefined' || userIdentifier === 'null') {
            console.log(`[${scriptName}] ⚠️ 捕获到请求，但未检测到登录邮箱或用户ID，已自动跳过`);
            $done({});
            return;
        }

        const store = loadStore();
        const now = Date.now();
        const fp = userIdentifier; // 唯一主键
        const existed = !!store.accounts[fp];

        // 判定 3：账号已存在（老账号更新）
        if (existed) {
            const oldAcc = store.accounts[fp];
            const accIndex = store.order.indexOf(fp) + 1;

            store.accounts[fp] = {
                id: fp,
                alias: userIdentifier,
                uaSeed: oldAcc.uaSeed !== undefined ? oldAcc.uaSeed : store.order.indexOf(fp),
                baseUA: baseUA || oldAcc.baseUA,
                capture: { url: $request.url, paramsRaw, headers: headersMap },
                createdAt: oldAcc.createdAt || now,
                updatedAt: now
            };
            saveStore(store);

            console.log(`[${scriptName}] 🔄 账号已存在: ${userIdentifier} (序号: ${accIndex}/${store.order.length})，数据已刷新`);

            if (!isDebounced(fp, 5000)) {
                notify(
                    `${scriptName} 🔄 账号已存在`,
                    `邮箱/账号: ${userIdentifier}`,
                    `📌 序号: 第 ${accIndex} 个账号 (库中共 ${store.order.length} 个)\n✅ Token 与 Cookie 凭证已静默更新完成！`
                );
            }
        } 
        // 判定 4：全新账号入库
        else {
            store.order.push(fp);
            store.accounts[fp] = {
                id: fp,
                alias: userIdentifier,
                uaSeed: store.order.length - 1,
                baseUA,
                capture: { url: $request.url, paramsRaw, headers: headersMap },
                createdAt: now,
                updatedAt: now
            };
            saveStore(store);

            const newTotal = store.order.length;
            console.log(`[${scriptName}] 🎉 新增账号成功: ${userIdentifier} (总账号数: ${newTotal})`);

            notify(
                `${scriptName} 🎉 发现新账号`,
                `邮箱/账号: ${userIdentifier}`,
                `✅ 账号已成功录入本地库！\n📊 当前库中共有 ${newTotal} 个有效账号`
            );
        }
    }
} catch (error) {
    console.log(`❌ [${scriptName}] 运行崩溃: \n${error.message}`);
} finally {
    $done({});
}
