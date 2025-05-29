/*
作者：@xream @keywos @wuhu_zzz @TEXAS @整点猫咪 技术指导：整点薯条
整点花里胡哨
各种花里胡哨参数，通过 argument 传入，用 = 连接 key 及相应 value，用 & 链接各种 key，可以任意选择想填入的参数

title：标题
iconfast、iconmid、iconslow 分别对应测速快中慢时的图标
colorlow、colormid、colorhigh 分别对应延迟低中高时的图标颜色
mb 参数：每次测试消耗的流量，默认 10MB，可通过 &mb= 数值覆盖
配置实例：title=花里胡哨才是生产力&iconfast=bird&iconmid=hare&iconslow=tortoise&colorlow=#06D6A0&colormid=#FFD166&colorhigh=#EF476F

⚠️ 不想变化多端？？
可直接使用最基本的 panel 参数，title、icon、icon-color
配置实例：title=不想花里胡哨了&icon=hare&icon-color=#CDCDCD
*/
const $ = new Env('network-speed')
$.isPanel = () => $.isSurge() && typeof $input !== 'undefined' && $.lodash_get($input, 'purpose') === 'panel'
$.isTile = () => $.isStash() && typeof $script !== 'undefined' && $.lodash_get($script, 'type') === 'tile'

let arg = {}
if (typeof $argument !== 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}

let title = ''
let content = ''
let icon = ''
let color = ''

!(async () => {
  if ($.isTile()) {
    await notify('网络速率', '面板', '开始查询')
  }

  // 默认 10 MB，可通过 &mb= 数值覆盖
  const mb = parseInt($.lodash_get(arg, 'mb', '10'), 10)
  const bytes = mb * 1024 * 1024

  // 下载测速
  const start = Date.now()
  await $.http.get({
    url: https://speed.cloudflare.com/__down?bytes=${bytes},
    node: $environment.params.node,
    timeout: 5000  // 超时 5 秒
  })
  const end = Date.now()
  const duration = (end - start) / 1000
  const speedMbps = (mb / duration) * 8

  // 测延迟
  const pingStart = Date.now()
  await $.http.get({
    url: http://cp.cloudflare.com/generate_204,
    node: $environment.params.node,
    timeout: 5000  // 超时 5 秒
  })
  const pingTime = Date.now() - pingStart

  // 决定图标和颜色
  const a = Diydecide(0, 50, 100, Math.round(speedMbps))
  const b = Diydecide(0, 100, 200, pingTime) + 3
  const shifts = {
    '1': arg.iconslow,
    '2': arg.iconmid,
    '3': arg.iconfast,
    '4': arg.colorlow,
    '5': arg.colormid,
    '6': arg.colorhigh
  }
  icon = shifts[a]
  color = shifts[b]

  title = 'NetSpeed'
  content = 节点名称：${$environment.params.nodeInfo.name}
下行速率：${speedMbps.toFixed(2)} Mbps [${(speedMbps/8).toFixed(2)} MB/s]
测试耗时：${duration.toFixed(2)} s
网络延迟：${pingTime} ms
执行时间：${new Date().toTimeString().split(' ')[0]}

  if ($.isTile()) {
    await notify('网络速率', '面板', '查询完成')
  } else if (!$.isPanel()) {
    await notify('网络速率', title, content)
  }
})()
  .catch(async e => {
    $.logErr(e)
    const msg = e.message || String(e)
    title = '❌'
    content = msg
    await notify('网络速率', title, content)
    $.done({ title, content })
  })
  .finally(async () => {
    const result = { title, content, icon, 'icon-color': color, ...arg }
    $.log($.toStr(result))
    $.done(result)
  })

// 通知函数
async function notify(t, subt, desc, opts) {
  if ($.lodash_get(arg, 'notify')) {
    $.msg(t, subt, desc, opts)
  }
}

// 确定变量所在区间
function Diydecide(x, y, z, item) {
  return [x, y, z, item].sort((a, b) => a - b).findIndex(i => i === item)
}

// 环境封装
function Env(name, platform) {
  class Http {
    constructor(ctx) { this.env = ctx }
    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts
      const fn = method === 'POST' ? this.post : this.get
      return new Promise((resolve, reject) =>
        fn.call(this.env, opts, (err, resp, body) => err ? reject(err) : resolve({ resp, body }))
      )
    }
    get(opts) { return this.send(opts, 'GET') }
    post(opts) { return this.send(opts, 'POST') }
  }

  return new class {
    constructor(name, platform) {
      this.name = name
      this.http = new Http(this)
      this.dataFile = 'box.dat'
      this.logs = []
      this.isMute = false
      this.startTime = Date.now()
      Object.assign(this, platform)
    }

    // 平台判断
    isNode() { return typeof module !== 'undefined' && !!module.exports }
    isQuanX() { return typeof $task !== 'undefined' }
    isSurge() { return typeof $environment !== 'undefined' && $environment['surge-version'] }
    isLoon() { return typeof $loon !== 'undefined' }
    isShadowrocket() { return typeof $rocket !== 'undefined' }
    isStash() { return typeof $environment !== 'undefined' && $environment['stash-version'] }

    // 数据存取
    getdata(key) { return JSON.parse(this.getval(key) || '{}') }
    setdata(val, key) { return this.setval(JSON.stringify(val), key) }
    getval(key) {
      if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()) return $persistentStore.read(key)
      if (this.isQuanX()) return $prefs.valueForKey(key)
      if (this.isNode()) { this.data = this.loaddata(); return this.data[key] }
      return null
    }
    setval(val, key) {
      if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()) return $persistentStore.write(val, key)
      if (this.isQuanX()) return $prefs.setValueForKey(val, key)
      if (this.isNode()) { this.data = this.loaddata(); this.data[key] = val; this.writedata(); return true }
      return false
    }

    // 通知
    msg(title, subt, desc, opts) {
      const notify = t => {
        if (!t) return
        if (typeof t === 'string') return this.isLoon() ? t : this.isQuanX() ? { 'open-url': t } : { url: t }
        return t
      }
      if (!this.isMute) {
        if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()) {
          $notification.post(title, subt, desc, notify(opts))
        } else if (this.isQuanX()) {
          $notify(title, subt, desc, notify(opts))
        }
      }
    }

    // 结束脚本
    done(result = {}) {
      if (this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()) {
        $done(result)
      } else if (this.isQuanX()) {
        $done(result)
      } else if (this.isNode()) {
        process.exit(0)
      }
    }

    // Node 环境文件读写
    loaddata() {
      const fs = require('fs'), path = require('path');
      const filePath = path.resolve(process.cwd(), this.dataFile);
      return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {}
    }
    writedata() {
      const fs = require('fs'), path = require('path');
      fs.writeFileSync(path.resolve(process.cwd(), this.dataFile), JSON.stringify(this.data))
    }

    // 工具函数
    toStr(val) { return typeof val === 'object' ? JSON.stringify(val) : String(val) }
    log(...msgs) { console.log(...msgs) }
    logErr(err) { console.error(err) }
  }(name, platform)
}
