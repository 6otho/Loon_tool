// NodeLinkCheck‑mini‑2.1 (改进版：支持自定义后端订阅数据，无论返回 JSON 或 JS代码)
const a = 'NodeLinkCheck';
const c = new Env(a);
let d;
if (typeof $argument != 'undefined') {
  d = Object.fromEntries($argument.split('&').map(n => n.split('=')));
}
let e = a;
let f = '-';
let g;

!(async () => {
  // 同时获取出口 IP 信息和节点策略信息
  const [n, o] = await Promise.all([i(), h()]);
  c.log('出口IP信息', c.toStr(n));
  c.log('节点名信息', c.toStr(o));
  const p = c.lodash_get(o, 'policy');
  if (p) {
    c.log('节点名称', p);
    // 从自定义后端获取订阅数据
    let subscriptionData;
    try {
      // 修改为你的自定义订阅地址，注意这里建议返回的是纯 JS 文件
      const customBackendUrl = "http://subk.v5oo.eu.org/subscription.js";
      const res = await c.http.get({ url: customBackendUrl });
      c.log("自定义后端返回原始数据", res.body);
      try {
        // 尝试按 JSON 格式解析
        subscriptionData = JSON.parse(res.body);
      } catch (jsonErr) {
        // 如果解析失败，则认为返回的是 JS 代码，采用 eval 执行
        let subData;
        // 定义 operator 函数，捕获订阅数组
        function operator(a) {
          subData = a;
        }
        // 执行返回的代码
        eval(res.body);
        // 将捕获的数组转换为对象，键为节点名
        subscriptionData = {};
        if (Array.isArray(subData)) {
          subData.forEach(item => {
            // 生成唯一名称，可根据需要调整
            subscriptionData[item.name] = item;
          });
        }
      }
      c.log("解析后的订阅数据", c.toStr(subscriptionData));
    } catch (error) {
      throw new Error("获取自定义后端订阅数据失败：" + error);
    }
    // 根据策略名称，从订阅数据中获取对应节点信息
    const r = c.lodash_get(subscriptionData, p);
    const s = c.lodash_get(r, 'server');
    const t = c.lodash_get(r, 'type');
    c.log('入口 server 信息', s);
    if (!s) {
      throw new Error('订阅数据中未找到 server 字段，请确认数据格式是否正确');
    }
    const u = await i(s);
    c.log('入口 IP 信息', c.toStr(u));
    const v = [ l(c.lodash_get(u, 'countryCode')), c.lodash_get(u, 'city'), c.lodash_get(u, 'isp') ].join(' ');
    const w = [ l(c.lodash_get(n, 'countryCode')), c.lodash_get(n, 'city'), c.lodash_get(n, 'isp') ].join(' ');
    e = (c.lodash_get(o, 'path') || []).join(' ➟ ');
    const x = {};
    x['policy'] = p;
    x['nodeInfo'] = r;
    x['server'] = s;
    x['type'] = t;
    x['inIpInfo'] = u;
    x['outIpInfo'] = n;
    g = x;
  }
})().catch(n => {
  console.log(n);
  console.log(c.toStr(n));
  e = '获取信息失败';
  f = '' + (c.lodash_get(n, 'message') || n);
}).finally(() => {
  // 以下输出逻辑保持原版，不再详细修改
  if (c.isSurge()) {
    const title = '代理链路检测';
    if (g) {
      const { policy, nodeInfo, server, type, inIpInfo, outIpInfo } = g;
      const nodeType = c.lodash_get(nodeInfo, 'type').toUpperCase();
      const inQuery = c.lodash_get(inIpInfo, 'query');
      const inCountry = c.lodash_get(inIpInfo, 'countryCode');
      const outQuery = c.lodash_get(outIpInfo, 'query');
      const outCountry = c.lodash_get(outIpInfo, 'countryCode');
      const inLocation = ([ c.lodash_get(inIpInfo, 'country'), c.lodash_get(inIpInfo, 'regionName'), c.lodash_get(inIpInfo, 'city') ]).join(' ').replace(/(中?国|中华人民共?和?国|中華人民共?和?國)/g, '');
      const outLocation = ([ c.lodash_get(outIpInfo, 'country'), c.lodash_get(outIpInfo, 'regionName'), c.lodash_get(outIpInfo, 'city') ]).join(' ').replace(/(中?国|中华人民共?和?国|中華人民共?和?國)/g, '');
      if (outCountry == inCountry && outCountry == 'CN') {
        f = '· ' + nodeType + ' ➟ ' + '国内代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + outLocation + '\n· ' + '国内IP：' + outQuery;
      } else if (outCountry == inCountry && outCountry != 'CN') {
        f = '· ' + nodeType + ' ➟ ' + '直连代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + outLocation + '\n· ' + '出口IP：' + outQuery;
      } else if (outCountry != inCountry && inCountry == 'CN') {
        f = '· ' + nodeType + ' ➟ ' + '中转代理' + ' ➟ ' + policy + '\n· ' + inLocation + ' ➟ ' + outLocation + '\n· ' + inQuery + ' ➟ ' + outQuery;
      } else if (outCountry != inCountry && outCountry == 'CN') {
        f = '· ' + nodeType + ' ➟ ' + '回国代理' + ' ➟ ' + policy + '\n· ' + outLocation + ' ➟ ' + inLocation + '\n· ' + outQuery + ' ➟ ' + inQuery;
      } else {
        f = '⟦ 没匹配到节点类型 ⟧';
      }
    } else {
      f = f;
    }
    const result = { ...d, title, content: f };
    c.done(result);
  } else if (c.isQuanX()) {
    const title = '代理链路检测';
    let message;
    if (g) {
      message = f; // 简化处理
    } else {
      message = f;
    }
    const result = { ...d, title, content: message };
    c.done(result);
  } else if (c.isLoon()) {
    const title = '代理链路检测';
    let htmlMessage = f; // 简化处理
    const result = { ...d, title, htmlMessage };
    c.done(result);
  } else {
    const result = { ...d, title: e, content: f };
    c.done(result);
  }
});

async function h() {
  if (c.isSurge()) {
    let policyName = c.lodash_get(d, 'policy');
    let path;
    if (policyName) {
      const q = await j(policyName);
      policyName = c.lodash_get(q, 'policy');
      path = c.lodash_get(q, 'path');
    }
    if (!policyName) {
      const r = await j(await k());
      policyName = c.lodash_get(r, 'policy');
      path = c.lodash_get(r, 'path');
    }
    return { policy: policyName, path };
  } else if (c.isQuanX()) {
    return { policy: $environment.params };
  } else if (c.isLoon()) {
    return { policy: $environment.params.node };
  } else {
    return { policy: '' };
  }
}

async function i(n = '') {
  try {
    let opts;
    let node;
    if (!n && c.isQuanX()) {
      opts = { policy: $environment.params };
    }
    if (!n && c.isLoon()) {
      node = $environment.params.node;
    }
    const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36' };
    const req = { node, opts, url: 'http://ip-api.com/json/' + n + '?lang=zh-CN', headers };
    const s = await c.http.get(req);
    c.log('↓ res statusCode', c.lodash_get(s, 'status'));
    let bodyStr = String(c.lodash_get(s, 'body'));
    try {
      bodyStr = JSON.parse(bodyStr);
    } catch (e) {}
    c.log('↓ res body', c.toStr(bodyStr));
    if (c.lodash_get(bodyStr, 'status') !== 'success') {
      throw new Error('' + (c.lodash_get(bodyStr, 'message') || '未知错误'));
    }
    return bodyStr;
  } catch (error) {
    c.log(error);
    throw new Error('' + (c.lodash_get(error, 'message') || error));
  }
}

async function j(n, o) {
  if (!o) { o = [n]; }
  let { policy } = await m('/v1/policy_groups/select?group_name=' + encodeURIComponent(n));
  if (policy) {
    o.push(policy);
    const p = await j(policy, o);
    policy = c.lodash_get(p, 'policy');
    o = c.lodash_get(p, 'path');
    return { policy, path: o };
  } else {
    return { policy: n, path: o };
  }
}

async function k() {
  const n = await m('/v1/policies');
  return c.lodash_get(n, 'policy-groups.0') || c.lodash_get(n, 'proxies.0');
}

function l(n) {
  return String.fromCodePoint(...n.toUpperCase().split('').map(p => 0x1f1a5 + p.charCodeAt()));
}

function m(n = '', method = 'GET', data = null) {
  return new Promise(resolve => {
    $httpAPI(method, n, data, result => {
      resolve(result);
    });
  });
}

// Env mini
function Env(t, e) {
  class s {
    constructor(t) { this.env = t; }
    send(t, method = "GET") {
      t = typeof t === "string" ? { url: t } : t;
      let fn = this.get;
      if (method === "POST") fn = this.post;
      return new Promise((resolve, reject) => {
        fn.call(this, t, (err, resp, body) => {
          err ? reject(err) : resolve(resp);
        });
      });
    }
    get(t) { return this.send.call(this.env, t); }
    post(t) { return this.send.call(this.env, t, "POST"); }
  }
  return new class {
    constructor(t, e) {
      this.name = t;
      this.http = new s(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = "\n";
      this.encoding = "utf-8";
      this.startTime = new Date().getTime();
      Object.assign(this, e);
      this.log("", `🔔${this.name}, 开始!`);
    }
    isNode() { return typeof module !== "undefined" && !!module.exports; }
    isQuanX() { return typeof $task !== "undefined"; }
    isSurge() { return typeof $httpClient !== "undefined" && typeof $loon === "undefined"; }
    isLoon() { return typeof $loon !== "undefined"; }
    isShadowrocket() { return typeof $rocket !== "undefined"; }
    isStash() { return typeof $environment !== "undefined" && $environment["stash-version"]; }
    toObj(t, e = null) { try { return JSON.parse(t); } catch { return e; } }
    toStr(t, e = null) { try { return JSON.stringify(t); } catch { return e; } }
    getjson(t, e) {
      let s = e;
      const data = this.getdata(t);
      if (data) { try { s = JSON.parse(this.getdata(t)); } catch {} }
      return s;
    }
    setjson(t, key) { try { return this.setdata(JSON.stringify(t), key); } catch { return false; } }
    getScript(t) { return new Promise(resolve => { this.get({ url: t }, (err, resp, body) => resolve(body)); }); }
    runScript(t, e) {
      return new Promise(resolve => {
        let api = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        api = api ? api.replace(/\n/g, "").trim() : api;
        let timeout = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        timeout = timeout ? 1 * timeout : 20;
        timeout = e && e.timeout ? e.timeout : timeout;
        const [key, host] = api.split("@");
        const req = {
          url: `http://${host}/v1/scripting/evaluate`,
          body: { script_text: t, mock_type: "cron", timeout },
          headers: { "X-Key": key, Accept: "*/*" }
        };
        this.post(req, (err, resp, body) => resolve(body));
      }).catch(err => this.logErr(err));
    }
    loaddata() {
      if (!this.isNode()) return {};
      this.fs = this.fs || require("fs");
      this.path = this.path || require("path");
      const filePath = this.path.resolve(this.dataFile);
      const cwdFilePath = this.path.resolve(process.cwd(), this.dataFile);
      const exists = this.fs.existsSync(filePath);
      const existsCwd = !exists && this.fs.existsSync(cwdFilePath);
      if (!exists && !existsCwd) return {};
      const finalPath = exists ? filePath : cwdFilePath;
      try { return JSON.parse(this.fs.readFileSync(finalPath)); } catch { return {}; }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs || require("fs");
        this.path = this.path || require("path");
        const filePath = this.path.resolve(this.dataFile);
        const cwdFilePath = this.path.resolve(process.cwd(), this.dataFile);
        const exists = this.fs.existsSync(filePath);
        const existsCwd = !exists && this.fs.existsSync(cwdFilePath);
        const dataStr = JSON.stringify(this.data);
        if (exists) this.fs.writeFileSync(filePath, dataStr);
        else if (existsCwd) this.fs.writeFileSync(cwdFilePath, dataStr);
        else this.fs.writeFileSync(filePath, dataStr);
      }
    }
    lodash_get(obj, path, defaultValue) {
      const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
      let result = obj;
      for (const key of keys) {
        result = Object(result)[key];
        if (result === undefined) return defaultValue;
      }
      return result;
    }
    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path.slice(0, -1).reduce((acc, key, i) =>
        Object(acc[key]) === acc[key] ? acc[key] : acc[key] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {},
        obj)[path[path.length - 1]] = value;
      return obj;
    }
    getdata(key) {
      let val = this.getval(key);
      if (/^@/.test(key)) {
        const [, k1, k2] = /^@(.*?)\.(.*?)$/.exec(key);
        const data = k1 ? this.getval(k1) : "";
        if (data) {
          try { const parsed = JSON.parse(data); val = this.lodash_get(parsed, k2, ""); } catch { val = ""; }
        }
      }
      return val;
    }
    setdata(val, key) {
      let success = false;
      if (/^@/.test(key)) {
        const [, k1, k2] = /^@(.*?)\.(.*?)$/.exec(key);
        const data = this.getval(k1);
        const initial = k1 ? (data === "null" ? null : data || "{}") : "{}";
        try {
          const parsed = JSON.parse(initial);
          this.lodash_set(parsed, k2, val);
          success = this.setval(JSON.stringify(parsed), k1);
        } catch (e) {
          const obj = {};
          this.lodash_set(obj, k2, val);
          success = this.setval(JSON.stringify(obj), k1);
        }
      } else {
        success = this.setval(val, key);
      }
      return success;
    }
    getval(key) {
      if (this.isSurge() || this.isLoon()) return $persistentStore.read(key);
      else if (this.isQuanX()) return $prefs.valueForKey(key);
      else if (this.isNode()) { this.data = this.loaddata(); return this.data[key]; }
      else return this.data && this.data[key] || null;
    }
    setval(val, key) {
      if (this.isSurge() || this.isLoon()) return $persistentStore.write(val, key);
      else if (this.isQuanX()) return $prefs.setValueForKey(val, key);
      else if (this.isNode()) {
        this.data = this.loaddata();
        this.data[key] = val;
        this.writedata();
        return true;
      } else return this.data && this.data[key] || null;
    }
    initGotEnv(req) {
      this.got = this.got || require("got");
      this.cktough = this.cktough || require("tough-cookie");
      this.ckjar = this.ckjar || new this.cktough.CookieJar;
      if (req) {
        req.headers = req.headers || {};
        if (req.headers.Cookie === undefined && req.cookieJar === undefined) {
          req.cookieJar = this.ckjar;
        }
      }
    }
    get(req, callback = () => {}) {
      if (req.headers) { delete req.headers["Content-Type"]; delete req.headers["Content-Length"]; }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) { req.headers = req.headers || {}; Object.assign(req.headers, { "X-Surge-Skip-Scripting": false }); }
        $httpClient.get(req, (err, resp, body) => {
          if (!err && resp) { resp.body = body; resp.statusCode = resp.status ? resp.status : resp.statusCode; resp.status = resp.statusCode; }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) { req.opts = req.opts || {}; Object.assign(req.opts, { hints: false }); }
        $task.fetch(req).then(response => {
          const { statusCode, headers, body } = response;
          callback(null, { status: statusCode, headers, body }, body);
        }, error => callback(error, null, null));
      } else if (this.isNode()) {
        let iconv = require("iconv-lite");
        this.initGotEnv(req);
        this.got(req).on("redirect", (res, next) => {
          try {
            if (res.headers["set-cookie"]) {
              const cookies = res.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
              if (cookies) { this.ckjar.setCookieSync(cookies, null); res.cookieJar = this.ckjar; }
            }
          } catch (e) { this.logErr(e); }
        }).then(response => {
          const { statusCode, headers, rawBody } = response;
          const body = iconv.decode(rawBody, this.encoding);
          callback(null, { status: statusCode, headers, body, rawBody }, body);
        }, error => {
          const { message, response } = error;
          callback(message, response, response && iconv.decode(response.rawBody, this.encoding));
        });
      }
    }
    post(req, callback = () => {}) {
      const method = req.method ? req.method.toLowerCase() : "post";
      if (req.body && req.headers && !req.headers["Content-Type"]) req.headers["Content-Type"] = "application/x-www-form-urlencoded";
      if (req.headers) { delete req.headers["Content-Length"]; }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) { req.headers = req.headers || {}; Object.assign(req.headers, { "X-Surge-Skip-Scripting": false }); }
        $httpClient[method](req, (err, resp, body) => {
          if (!err && resp) { resp.body = body; resp.statusCode = resp.status ? resp.status : resp.statusCode; resp.status = resp.statusCode; }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        req.method = method;
        if (this.isNeedRewrite) { req.opts = req.opts || {}; Object.assign(req.opts, { hints: false }); }
        $task.fetch(req).then(response => {
          const { statusCode, headers, body } = response;
          callback(null, { status: statusCode, headers, body }, body);
        }, error => callback(error, null, null));
      } else if (this.isNode()) {
        let iconv = require("iconv-lite");
        this.initGotEnv(req);
        const { url, ...options } = req;
        this.got[method](url, options).then(response => {
          const { statusCode, headers, rawBody } = response;
          const body = iconv.decode(rawBody, this.encoding);
          callback(null, { status: statusCode, headers, body, rawBody }, body);
        }, error => {
          const { message, response } = error;
          callback(message, response, response && iconv.decode(response.rawBody, this.encoding));
        });
      }
    }
    log(...args) { if (args.length > 0) { this.logs = [...this.logs, ...args]; } console.log(args.join(this.logSeparator)); }
    logErr(err, extra = "") { const isLocal = !(this.isSurge() || this.isQuanX() || this.isLoon()); isLocal ? this.log("", `❗️${this.name}, 错误!`, err.stack) : this.log("", `❗️${this.name}, 错误!`, err); }
    wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    done(result = {}) {
      const endTime = new Date().getTime();
      const duration = (endTime - this.startTime) / 1000;
      this.log("", `🔔${this.name}, 结束! ⏛ ${duration} 秒`);
      this.log();
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(result);
      } else if (this.isNode()) {
        process.exit(1);
      }
    }
  }(t, e);
}
