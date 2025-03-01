// NodeLinkCheck‑mini‑2.1 with custom backend for subscription
const a = 'NodeLinkCheck';
const b = 'RebuildNodeLineJsonByRE'; // 本来用于本地存储的 key，现在不再使用
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
    // —— 修改部分：通过自定义后端获取订阅数据替换原本的本地存储读取
    let subscriptionData;
    try {
      const customBackendUrl = "http://subk.v5oo.eu.org";
      let response = await c.http.get({ url: customBackendUrl });
      subscriptionData = JSON.parse(response.body);
      c.log("自定义后端返回的订阅数据", c.toStr(subscriptionData));
    } catch (error) {
      throw new Error("获取自定义后端订阅数据失败：" + error);
    }
    // 根据节点策略名称，从自定义后端数据中获取对应节点信息
    const r = c.lodash_get(subscriptionData, p);
    const s = c.lodash_get(r, 'server');
    const t = c.lodash_get(r, 'type');
    c.log('入口server信息', s);
    if (!s) {
      throw new Error('请先从Sub‑Store订阅');
    }
    const u = await i(s);
    c.log('入口IP信息', c.toStr(u));
    const v = [
      l(c.lodash_get(u, 'countryCode')),
      c.lodash_get(u, 'city'),
      c.lodash_get(u, 'isp')
    ].join(' ');
    const w = [
      l(c.lodash_get(n, 'countryCode')),
      c.lodash_get(n, 'city'),
      c.lodash_get(n, 'isp')
    ].join(' ');
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
  if (c.isSurge()) {
    const w = '代理链路检测';
    if (g) {
      const { policy, nodeInfo, server, type, inIpInfo, outIpInfo } = g;
      const y = c.lodash_get(nodeInfo, 'type').toUpperCase();
      const z = c.lodash_get(inIpInfo, 'query');
      const A = c.lodash_get(inIpInfo, 'countryCode');
      const B = c.lodash_get(outIpInfo, 'query');
      const C = c.lodash_get(outIpInfo, 'countryCode');
      const D = ([ c.lodash_get(inIpInfo, 'country'), c.lodash_get(inIpInfo, 'regionName'), c.lodash_get(inIpInfo, 'city') ]).join(' ').replace(/(中?国|中华人民共?和?国|中華人民共?和?國)/g, '');
      const E = ([ c.lodash_get(outIpInfo, 'country'), c.lodash_get(outIpInfo, 'regionName'), c.lodash_get(outIpInfo, 'city') ]).join(' ').replace(/(中?国|中华人民共?和?国|中華人民共?和?國)/g, '');
      if (C == A && C == 'CN') {
        f = '· ' + y + ' ➟ ' + '国内代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + E + '\n· ' + '国内IP：' + B;
      } else if (C == A && C != 'CN') {
        f = '· ' + y + ' ➟ ' + '直连代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + E + '\n· ' + '出口IP：' + B;
      } else if (C != A && A == 'CN') {
        var p_regex = /IEPL/gi;
        var s_regex = /IPLC/gi;
        var v_regex = /专线/gi;
        if ($environment.params.search(p_regex) != -1) {
          f = '· ' + y + ' ➟ ' + 'IEPL专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else if ($environment.params.search(s_regex) != -1) {
          f = '· ' + y + ' ➟ ' + 'IPLC专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else if ($environment.params.search(v_regex) != -1) {
          f = '· ' + y + ' ➟ ' + '内网专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else {
          f = '· ' + y + ' ➟ ' + '中转代理' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        }
      } else if (C != A && C == 'CN') {
        f = '· ' + y + ' ➟ ' + '回国代理' + ' ➟ ' + policy + '\n· ' + E + ' ➟ ' + D + '\n· ' + B + ' ➟ ' + z;
      } else {
        f = '⟦ 没匹配到节点类型 ⟧';
      }
    } else {
      f = f;
    }
    const x = { ...d };
    x['title'] = w;
    x['content'] = f;
    c.done(x);
  } else if (c.isQuanX()) {
    const F = '代理链路检测';
    let G;
    if (g) {
      const { policy, nodeInfo, server, type, inIpInfo, outIpInfo } = g;
      const I = c.lodash_get(nodeInfo, 'type').toUpperCase();
      const J = c.lodash_get(inIpInfo, 'query');
      const K = c.lodash_get(inIpInfo, 'countryCode');
      const L = c.lodash_get(outIpInfo, 'query');
      const M = c.lodash_get(outIpInfo, 'countryCode');
      const N = ([ c.lodash_get(inIpInfo, 'country'), c.lodash_get(inIpInfo, 'regionName'), c.lodash_get(inIpInfo, 'city') ]).join(' ').replace(/(中?国|中华人民共?和?国|中華人民共?和?國)/g, '');
      const O = ([ c.lodash_get(outIpInfo, 'country'), c.lodash_get(outIpInfo, 'regionName'), c.lodash_get(outIpInfo, 'city') ]).join(' ').replace(/(中?国|中华人民共?和?国|中華人民共?和?國)/g, '');
      const P = 'data:image/png;base64,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';
            if (X == V && X == 'CN') {
              R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><font color=#f00>-------------------------<br><b>⟦ 防火墙 ⟧</b><br>-------------------------</font><br><br><br><b>' + Y + '</b><br><small><small>' + U + '</small></small><br><br><br><font color=#f00>-------------------------<br><b>⟦ 防火墙 ⟧</b><br>-------------------------</font><br><br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
            } else if (X == V && X != 'CN') {
              R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>您</b><br><br><img style="height:auto;width:3%" src="' + a0 + '"><br><font color=#f00>-------------------------<br><b>⟦ <font style="text-decoration:line-through;">防火墙</font> ⟧</b><br>-------------------------</font><br><img style="height:auto;width:3%" src="' + a0 + '"><br><br><b>' + Z + '</b><br><small><small>' + W + '</small></small></br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
            } else if (X != V && V == 'CN') {
              var p_regex = /IEPL/gi;
              var s_regex = /IPLC/gi;
              var v_regex = /专线/gi;
              if ($environment.params.node.search(p_regex) != -1) {
                R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>' + Y + '</b><br><small><small>' + U + '</small></small><br><br><img style="height:auto;width:3%" src="' + a0 + '"><br><font color=#00b400>-------------------------<br><b>⟦ IEPL专线 ⟧</b><br>-------------------------</font><br><img style="height:auto;width:3%" src="' + a0 + '"><br><br><b>' + Z + '</b><br><small><small>' + W + '</small></small></br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
              } else if ($environment.params.node.search(s_regex) != -1) {
                R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>' + Y + '</b><br><small><small>' + U + '</small></small><br><br><img style="height:auto;width:3%" src="' + a0 + '"><br><font color=#00b400>-------------------------<br><b>⟦ IPLC专线 ⟧</b><br>-------------------------</font><br><img style="height:auto;width:3%" src="' + a0 + '"><br><br><b>' + Z + '</b><br><small><small>' + W + '</small></small></br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
              } else if ($environment.params.node.search(v_regex) != -1) {
                R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>' + Y + '</b><br><small><small>' + U + '</small></small><br><br><img style="height:auto;width:3%" src="' + a0 + '"><br><font color=#00b400>-------------------------<br><b>⟦ 内网专线 ⟧</b><br>-------------------------</font><br><img style="height:auto;width:3%" src="' + a0 + '"><br><br><b>' + Z + '</b><br><small><small>' + W + '</small></small></br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
              } else {
                R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>' + Y + '</b><br><small><small>' + U + '</small></small><br><br><img style="height:auto;width:3%" src="' + a0 + '"><br><font color=#f00>-------------------------<br><b>⟦ <font style="text-decoration:line-through;">防火墙</font> ⟧</b><br>-------------------------</font><br><img style="height:auto;width:3%" src="' + a0 + '"><br><br><b>' + Z + '</b><br><small><small>' + W + '</small></small></br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
              }
            } else if (X != V && X == 'CN') {
              R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><b>' + Z + '</b><br><small><small>' + W + '</small></small><br><br><img style="height:auto;width:3%" src="' + a0 + '"><br><font color=#f00>-------------------------<br><b>⟦ <font style="text-decoration:line-through;">防火墙</font> ⟧</b><br>-------------------------</font><br><img style="height:auto;width:3%" src="' + a0 + '"><br><br><b>' + Y + '</b><br><small><small>' + U + '</small></small></br></br>-----------------------------------</br></br><font color=#6959CD><small><b>' + T + '</b></font> ➟ ' + $environment.params.node + '</small></p>';
            } else {
              R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><font color=#f00>-------------------------<br><b>⟦ 没匹配到节点类型 ⟧</b><br>-------------------------</font></p>';
            }
          } else {
            R = '<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><font color=#f00>-------------------------<br><b>⟦ ' + f + ' ⟧</b><br>-------------------------</font></p>';
          }
          const S = { ...d };
          S['title'] = Q;
          S['htmlMessage'] = R;
          c.done(S);
        } else {
          const a1 = { ...d };
          a1['title'] = e;
          a1['content'] = f;
          c.done(a1);
        }
      }
    }
});

async function h() {
  if (c.isSurge()) {
    let n = c.lodash_get(d, 'policy');
    let o;
    if (n) {
      const q = await j(n);
      n = c.lodash_get(q, 'policy');
      o = c.lodash_get(q, 'path');
    }
    if (!n) {
      const r = await j(await k());
      n = c.lodash_get(r, 'policy');
      o = c.lodash_get(r, 'path');
    }
    const p = {};
    p['policy'] = n;
    p['path'] = o;
    return p;
  } else if (c.isQuanX()) {
    const s = {};
    s['policy'] = $environment.params;
    return s;
  } else if (c.isLoon()) {
    const t = {};
    t['policy'] = $environment.params.node;
    return t;
  } else {
    const u = {};
    u['policy'] = '';
    return u;
  }
}

async function i(n) {
  try {
    let o;
    let p;
    if (!n && c.isQuanX()) {
      const w = {};
      w['policy'] = $environment.params;
      o = w;
    }
    if (!n && c.isLoon()) {
      p = $environment.params.node;
    }
    const q = {};
    q['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36';
    const r = {};
    r['node'] = p;
    r['opts'] = o;
    r['url'] = 'http://ip-api.com/json/' + (n || '') + '?lang=zh-CN';
    r['headers'] = q;
    const s = await c.http.get(r);
    const t = c.lodash_get(s, 'status');
    c.log('↓ res statusCode');
    c.log(t);
    let u = String(c.lodash_get(s, 'body'));
    try {
      u = JSON.parse(u);
    } catch (x) {}
    c.log('↓ res body');
    c.log(c.toStr(u));
    const v = c.lodash_get(u, 'status');
    if (v !== 'success') {
      throw new Error('' + (c.lodash_get(u, 'message') || '未知错误'));
    }
    return u;
  } catch (y) {
    c.log(y);
    throw new Error('' + (c.lodash_get(y, 'message') || y));
  }
}

async function j(n, o) {
  if (!o) {
    o = [n];
  }
  let { policy } = await m('/v1/policy_groups/select?group_name=' + encodeURIComponent(n));
  if (policy) {
    o.push(policy);
    const p = await j(policy, o);
    policy = c.lodash_get(p, 'policy');
    o = c.lodash_get(p, 'path');
    const q = {};
    q['policy'] = policy;
    q['path'] = o;
    return q;
  } else {
    const r = {};
    r['policy'] = n;
    r['path'] = o;
    return r;
  }
}

async function k() {
  const n = await m('/v1/policies');
  return c.lodash_get(n, 'policy-groups.0') || c.lodash_get(n, 'proxies.0');
}

function l(n) {
  const o = n.toUpperCase().split('').map(p => 0x1f1a5 + p.charCodeAt());
  return String.fromCodePoint(...o);
}

function m(n = '', o = 'GET', p = null) {
  return new Promise(q => {
    $httpAPI(o, n, p, r => {
      q(r);
    });
  });
}

// Env mini
function Env(t, e) {
  class s {
    constructor(t) {
      this.env = t;
    }
    send(t, e = "GET") {
      t = typeof t === "string" ? { url: t } : t;
      let s = this.get;
      if (e === "POST") s = this.post;
      return new Promise((e, i) => {
        s.call(this, t, (t, s, r) => {
          t ? i(t) : e(s);
        });
      });
    }
    get(t) {
      return this.send.call(this.env, t);
    }
    post(t) {
      return this.send.call(this.env, t, "POST");
    }
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
    isNode() {
      return typeof module !== "undefined" && !!module.exports;
    }
    isQuanX() {
      return typeof $task !== "undefined";
    }
    isSurge() {
      return typeof $httpClient !== "undefined" && typeof $loon === "undefined";
    }
    isLoon() {
      return typeof $loon !== "undefined";
    }
    isShadowrocket() {
      return typeof $rocket !== "undefined";
    }
    isStash() {
      return typeof $environment !== "undefined" && $environment["stash-version"];
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t);
      } catch {
        return e;
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t);
      } catch {
        return e;
      }
    }
    getjson(t, e) {
      let s = e;
      const i = this.getdata(t);
      if (i) {
        try {
          s = JSON.parse(this.getdata(t));
        } catch {}
      }
      return s;
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e);
      } catch {
        return false;
      }
    }
    getScript(t) {
      return new Promise(e => {
        this.get({ url: t }, (t, s, i) => e(i));
      });
    }
    runScript(t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        r = r ? 1 * r : 20;
        r = e && e.timeout ? e.timeout : r;
        const [o, a] = i.split("@");
        const n = {
          url: `http://${a}/v1/scripting/evaluate`,
          body: { script_text: t, mock_type: "cron", timeout: r },
          headers: { "X-Key": o, Accept: "*/*" },
        };
        this.post(n, (t, e, i) => s(i));
      }).catch(t => this.logErr(t));
    }
    loaddata() {
      if (!this.isNode()) return {};
      {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile);
        const e = this.path.resolve(process.cwd(), this.dataFile);
        const s = this.fs.existsSync(t);
        const i = !s && this.fs.existsSync(e);
        if (!s && !i) return {};
        {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i));
          } catch (t) {
            return {};
          }
        }
      }
    }
    writedata() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs");
        this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile);
        const e = this.path.resolve(process.cwd(), this.dataFile);
        const s = this.fs.existsSync(t);
        const i = !s && this.fs.existsSync(e);
        const r = JSON.stringify(this.data);
        if (s) this.fs.writeFileSync(t, r);
        else if (i) this.fs.writeFileSync(e, r);
        else this.fs.writeFileSync(t, r);
      }
    }
    lodash_get(t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of i) {
        r = Object(r)[t];
        if (r === undefined) return s;
      }
      return r;
    }
    lodash_set(t, e, s) {
      if (Object(t) !== t) return t;
      if (!Array.isArray(e)) e = e.toString().match(/[^.[\]]+/g) || [];
      e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s;
      return t;
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t);
        const r = s ? this.getval(s) : "";
        if (r) {
          try {
            const t = JSON.parse(r);
            e = t ? this.lodash_get(t, i, "") : e;
          } catch (t) {
            e = "";
          }
        }
      }
      return e;
    }
    setdata(t, e) {
      let s = false;
      if (/^@/.test(e)) {
        const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e);
        const o = this.getval(i);
        const a = i ? (o === "null" ? null : o || "{}") : "{}";
        try {
          const t = JSON.parse(a);
          this.lodash_set(t, r, t);
          s = this.setval(JSON.stringify(t), i);
        } catch (e) {
          const o = {};
          this.lodash_set(o, r, t);
          s = this.setval(JSON.stringify(o), i);
        }
      } else {
        s = this.setval(t, e);
      }
      return s;
    }
    getval(t) {
      if (this.isSurge() || this.isLoon()) return $persistentStore.read(t);
      else if (this.isQuanX()) return $prefs.valueForKey(t);
      else if (this.isNode()) {
        this.data = this.loaddata();
        return this.data[t];
      } else return this.data && this.data[t] || null;
    }
    setval(t, e) {
      if (this.isSurge() || this.isLoon()) return $persistentStore.write(t, e);
      else if (this.isQuanX()) return $prefs.setValueForKey(t, e);
      else if (this.isNode()) {
        this.data = this.loaddata();
        this.data[e] = t;
        this.writedata();
        return true;
      } else return this.data && this.data[e] || null;
    }
    initGotEnv(t) {
      this.got = this.got ? this.got : require("got");
      this.cktough = this.cktough ? this.cktough : require("tough-cookie");
      this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar;
      if (t) {
        t.headers = t.headers ? t.headers : {};
        if (t.headers.Cookie === undefined && t.cookieJar === undefined) {
          t.cookieJar = this.ckjar;
        }
      }
    }
    get(t, e = () => {}) {
      if (t.headers) {
        delete t.headers["Content-Type"];
        delete t.headers["Content-Length"];
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          t.headers = t.headers || {};
          Object.assign(t.headers, { "X-Surge-Skip-Scripting": false });
        }
        $httpClient.get(t, (t, s, i) => {
          if (!t && s) {
            s.body = i;
            s.statusCode = s.status ? s.status : s.statusCode;
            s.status = s.statusCode;
          }
          e(t, s, i);
        });
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) {
          t.opts = t.opts || {};
          Object.assign(t.opts, { hints: false });
        }
        $task.fetch(t).then(t => {
          const { statusCode: s, statusCode: i, headers: r, body: o } = t;
          e(null, { status: s, statusCode: i, headers: r, body: o }, o);
        }, t => e(t && t.error || "UndefinedError"));
      } else if (this.isNode()) {
        let s = require("iconv-lite");
        this.initGotEnv(t);
        this.got(t).on("redirect", (t, e) => {
          try {
            if (t.headers["set-cookie"]) {
              const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
              if (s) {
                this.ckjar.setCookieSync(s, null);
                e.cookieJar = this.ckjar;
              }
            }
          } catch (t) {
            this.logErr(t);
          }
        }).then(t => {
          const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t;
          const n = s.decode(a, this.encoding);
          e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n);
        }, t => {
          const { message: i, response: r } = t;
          e(i, r, r && s.decode(r.rawBody, this.encoding));
        });
      }
    }
    post(t, e = () => {}) {
      const s = t.method ? t.method.toLowerCase() : "post";
      if (t.body && t.headers && !t.headers["Content-Type"]) {
        t.headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
      if (t.headers) {
        delete t.headers["Content-Length"];
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          t.headers = t.headers || {};
          Object.assign(t.headers, { "X-Surge-Skip-Scripting": false });
        }
        $httpClient[s](t, (t, s, i) => {
          if (!t && s) {
            s.body = i;
            s.statusCode = s.status ? s.status : s.statusCode;
            s.status = s.statusCode;
          }
          e(t, s, i);
        });
      } else if (this.isQuanX()) {
        t.method = s;
        if (this.isNeedRewrite) {
          t.opts = t.opts || {};
          Object.assign(t.opts, { hints: false });
        }
        $task.fetch(t).then(t => {
          const { statusCode: s, statusCode: i, headers: r, body: o } = t;
          e(null, { status: s, statusCode: i, headers: r, body: o }, o);
        }, t => e(t && t.error || "UndefinedError"));
      } else if (this.isNode()) {
        let i = require("iconv-lite");
        this.initGotEnv(t);
        const { url: r, ...o } = t;
        this.got[s](r, o).then(t => {
          const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t;
          const n = i.decode(a, this.encoding);
          e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n);
        }, t => {
          const { message: s, response: r } = t;
          e(s, r, r && i.decode(r.rawBody, this.encoding));
        });
      }
    }
    log(...t) {
      if (t.length > 0) {
        this.logs = [...this.logs, ...t];
      }
      console.log(t.join(this.logSeparator));
    }
    logErr(t, e = "") {
      const s = !(this.isSurge() || this.isQuanX() || this.isLoon());
      if (s) {
        this.log("", `❗️${this.name}, 错误!`, t.stack);
      } else {
        this.log("", `❗️${this.name}, 错误!`, t);
      }
    }
    wait(t) {
      return new Promise(e => setTimeout(e, t));
    }
    done(t = {}) {
      const e = new Date().getTime();
      const s = (e - this.startTime) / 1000;
      this.log("", `🔔${this.name}, 结束! ⏛ ${s} 秒`);
      this.log();
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(t);
      } else if (this.isNode()) {
        process.exit(1);
      }
    }
  }(t, e);
}
