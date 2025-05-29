/*
作者：@xream @keywos @wuhu_zzz @TEXAS @整点猫咪 技术指导：整点薯条
整点花里胡哨
各种花里胡哨参数，通过 argument 传入，用 = 连接 key 及相应 value，用 & 链接各种 key，可以任意选择想填入的参数

title：标题（示例：title=网络测速）
iconfast、iconmid、iconslow 分别对应测速快中慢时的图标
colorlow、colormid、colorhigh 分别对应延迟低中高时的图标颜色
mb 参数：每次测试消耗的流量，默认 10MB，可通过 &mb= 数值覆盖
配置实例：title=花里胡哨才是生产力&iconfast=bird&iconmid=hare&iconslow=tortoise&colorlow=#06D6A0&colormid=#FFD166&colorhigh=#EF476F

⚠️ 不想花里胡哨？？
可直接使用最基本的 panel 参数，title、icon、icon-color
配置实例：title=不想花里胡哨了&icon=hare&icon-color=#CDCDCD
*/
const $ = new Env('network-speed');
$.isPanel = () => $.isSurge() && typeof $input !== 'undefined' && $.lodash_get($input, 'purpose') === 'panel';
$.isTile = () => $.isStash() && typeof $script !== 'undefined' && $.lodash_get($script, 'type') === 'tile';

// 解析参数
let arg = {};
if (typeof $argument !== 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')));
}

let title = '';
let content = '';
let icon = '';
let color = '';

!(async () => {
  if ($.isTile()) {
    await notify('网络速率', '面板', '开始查询');
  }

  // 默认 10 MB，可通过 &mb= 数值覆盖
  const mb = arg.mb ? parseInt(arg.mb, 10) : 10;
  const bytes = mb * 1024 * 1024;

  // 下载测速
  const start = Date.now();
  await $.http.get({
    url: `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    node: $environment.params.node,
    timeout: 5000 // 超时 5 秒
  });
  const end = Date.now();
  const duration = (end - start) / 1000;
  const speedMbps = (mb / duration) * 8;

  // 测延迟
  const pingStart = Date.now();
  await $.http.get({
    url: 'http://cp.cloudflare.com/generate_204',
    node: $environment.params.node,
    timeout: 5000 // 超时 5 秒
  });
  const pingTime = Date.now() - pingStart;

  // 决定图标和颜色
  const a = Diydecide(0, 50, 100, Math.round(speedMbps));
  const b = Diydecide(0, 100, 200, pingTime) + 3;
  const shifts = {
    '1': arg.iconslow,
    '2': arg.iconmid,
    '3': arg.iconfast,
    '4': arg.colorlow,
    '5': arg.colormid,
    '6': arg.colorhigh
  };
  icon = shifts[a] || arg.icon;
  color = shifts[b] || arg['icon-color'];

  title = arg.title || '网络测速';
  content = `节点名称：${$environment.params.nodeInfo.name}
下行速率：${speedMbps.toFixed(2)} Mbps [${(speedMbps / 8).toFixed(2)} MB/s]
测试耗时：${duration.toFixed(2)} s
网络延迟：${pingTime} ms
执行时间：${new Date().toTimeString().split(' ')[0]}`;

  if ($.isTile()) {
    await notify('网络速率', '面板', '查询完成');
  } else if (!$.isPanel()) {
    await notify('网络速率', title, content);
  }
})()
  .catch(async e => {
    $.logErr(e);
    const msg = e.message || String(e);
    title = '❌';
    content = msg;
    await notify('网络速率', title, content);
    $.done({ title, content });
  })
  .finally(async () => {
    const result = { title, content, icon, 'icon-color': color, ...arg };
    $.log($.toStr(result));
    $.done(result);
  });

// 通知函数
async function notify(t, subt, desc, opts) {
  if (arg.notify === 'true') {
    $.msg(t, subt, desc, opts);
  }
}

// 确定变量所在区间
function Diydecide(x, y, z, item) {
  return [x, y, z, item].sort((a, b) => a - b).findIndex(i => i === item);
}

// 环境封装
function Env(name, platform) {
  class Http {
    constructor(ctx) { this.env = ctx; }
    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts;
      const fn = method === 'POST' ? this.post : this.get;
      return new Promise((resolve, reject) =>
        fn.call(this.env, opts, (err, resp, body) => err ? reject(err) : resolve({ resp, body }))
      );
    }
    get(opts) { return this.send(opts, 'GET'); }
    post(opts) { return this.send(opts, 'POST'); }
  }

  return new class {
    constructor(name, platform) {
      this.name = name;
      this.http = new Http(this);
      this.dataFile = 'box.dat';
      this.isMute = false;
      this.startTime = Date.now();
      Object.assign(this, platform);
    }

    isNode() { return typeof module !== 'undefined' && !!module.exports; }
    isQuanX() { return typeof $task !== 'undefined'; }
    isSurge() { return typeof $environment !== 'undefined' && $environment['surge-version']; }
    isLoon() { return typeof $loon !== 'undefined'; }
    isShadowrocket() { return typeof $rocket !== 'undefined'; }
    isStash() { return typeof $environment !== 'undefined' && $environment['stash-version']; }

    getdata(key) { try { return JSON.parse(this.getval(key)); } catch { return null; } }
    setdata(val, key) { return this.setval(JSON.stringify(val), key); }
    getval(key) {
      if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()) return $persistentStore.read(key);
      if (this.isQuanX()) return $prefs.valueForKey(key);
      if (this.isNode()) { const data = this.loaddata(); return data[key]; }
      return null;
    }
    setval(val, key) { /* 同上略 */ return true; }

    msg(title, subt, desc, opts) {
      if (this.isMute) return;
      if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()) $notification.post(title, subt, desc, opts);
      else if (this.isQuanX()) $notify(title, subt, desc, opts);
    }
    done(res = {}) { if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()||this.isQuanX()) $done(res); else process.exit(0); }
    loaddata() { try { return require('fs').existsSync(this.dataFile)?JSON.parse(require('fs').readFileSync(this.dataFile)):{};} catch{return{}} }
    toStr(v){return typeof v==='object'?JSON.stringify(v):String(v);} logErr(e){console.error(e);} log(..._){} }
  (name, platform);
}
