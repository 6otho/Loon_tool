/*
作者：@xream @keywos @wuhu_zzz @ TEXAS @整点猫咪 技术指导：整点薯条 
整点花里胡哨
各种花里胡哨参数，通过argument传入，用=连接key及相应value，用&链接各种key，可以任意选择想填入的参数
title：标题
iconfast、iconmid、iconslow 分别对应测速快中慢时的图标
colorlow、colormid、colorhigh 分别对应延迟低中高时的图标颜色
mb参数：每次测试消耗的流量，默认16MB，经测试最大可4MB参数：&mb=4
配置实例：title=花里胡哨才是生产力&iconfast=bird&iconmid=hare&iconslow=tortoise&colorlow=#06D6A0&colormid=#FFD166&colorhigh=#EF476F

⚠️不想变化多端？？
可直接使用最基本的panel参数，title、icon、icon-color
配置实例：titile=不想花里胡哨了&icon=hare&icon-color=#CDCDCD
*/
const $ = new Env('network-speed')
$.isPanel = () => $.isSurge() && typeof $input != 'undefined' && $.lodash_get($input, 'purpose') === 'panel'
$.isTile = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'tile'

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')))
}

let title = ''
let content = ''
!(async () => {
  if ($.isTile()) {
    await notify('网络速率', '面板', '开始查询')
  }

  // 默认 10 MB，可通过 &mb= 数值覆盖
  const mb = $.lodash_get(arg, 'mb') || 10
  const bytes = mb * 1024 * 1024

  let start = Date.now()
  const res = await $.http.get({
    url: `https://speed.cloudflare.com/__down?bytes=${bytes}`,
    node: $environment.params.node,
    timeout: 4000        // 超时 4 秒
  })
  const end = Date.now()
  const duration = (end - start) / 1000
  const speed = mb / duration  // MB/s

  // 测延迟
  const pingstart = Date.now()
  const ping = await $.http.get({
    url: `http://cp.cloudflare.com/generate_204`,
    node: $environment.params.node,
    timeout: 4000        // 同样 4 秒超时
  })
  const pingt = Date.now() - pingstart

  // 决定图标和颜色
  const a = Diydecide(0, 50, 100, round(Math.abs(speed * 8)))
  const b = Diydecide(0, 100, 200, pingt) + 3
  const shifts = {
    '1': arg?.iconslow,
    '2': arg?.iconmid,
    '3': arg?.iconfast,
    '4': arg?.colorlow,
    '5': arg?.colormid,
    '6': arg?.colorhigh
  }
  const icon = shifts[a]
  const color = shifts[b]

  title = `NetSpeed`
  content = `节点名称：${$environment.params.nodeInfo.name}
下行速率：${round(Math.abs(speed * 8))} Mbps [${round(Math.abs(speed), 2)} MB/s]
测试耗时：${round(duration, 2)} s
网络延迟：${pingt} ms
执行时间：${new Date().toTimeString().split(' ')[0]}`

  if ($.isTile()) {
    await notify('网络速率', '面板', '查询完成')
  } else if (!$.isPanel()) {
    await notify('网络速率', title, content)
  }
})()
  .catch(async e => {
    $.logErr(e)
    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    title = `❌`
    content = msg
    await notify('网络速率', title, content)
    const result = { title, content }
    $.done(result)
  })
  .finally(async () => {
    const result = { title, content, icon, 'icon-color': color, ...arg }
    $.log($.toStr(result))
    $.done(result)
  })

// 通知函数
async function notify(title, subt, desc, opts) {
  if ($.lodash_get(arg, 'notify')) {
    $.msg(title, subt, desc, opts)
  }
}

// 四舍五入
function createRound(methodName) {
  const func = Math[methodName]
  return (number, precision) => {
    precision = precision == null ? 0 : Math.min(Math.max(precision, -292), 292)
    if (precision) {
      let pair = `${number}e`.split('e')
      const value = func(`${pair[0]}e${+pair[1] + precision}`)
      pair = `${value}e`.split('e')
      return +`${pair[0]}e${+pair[1] - precision}`
    }
    return func(number)
  }
}
function round(...args) {
  return createRound('round')(...args)
}

// 确定变量所在区间
function Diydecide(x, y, z, item) {
  const arr = [x, y, z, item]
  return arr.sort((a, b) => a - b).findIndex(i => i === item)
}

// 环境封装（不动）
function Env(t, s) {
  class Http {
    constructor(ctx) { this.env = ctx }
    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts
      const fn = method === 'POST' ? this.post : this.get
      return new Promise((resolve, reject) =>
        fn.call(this.env, opts, (err, resp, body) => err ? reject(err) : resolve(resp))
      )
    }
    get(opts) { return this.send(opts, 'GET') }
    post(opts) { return this.send(opts, 'POST') }
  }

  return new class {
    constructor(name, platform) {
      this.name = name
      this.http = new Http(this)
      this.data = null
      this.dataFile = 'box.dat'
      this.logs = []
      this.isMute = false
      this.startTime = Date.now()
      Object.assign(this, platform)
    }
    // ...（剩余环境方法与原脚本一致，不必修改）...
  }(t, s)
}
