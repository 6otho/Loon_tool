/*
作者：@xream @keywos @wuhu_zzz @ TEXAS @整点猫咪 技术指导：整点薯条 
网络测速脚本 - 默认5MB测试流量
参数说明：
title：标题（默认：网络测速）
iconfast、iconmid、iconslow：测速快中慢时的图标
colorlow、colormid、colorhigh：延迟低中高时的图标颜色
mb：每次测试消耗的流量（默认5MB）
*/

// ===================== 精简环境适配器 =====================
function Env(name) {
  // 环境检测
  this.isSurge = () => typeof $environment !== 'undefined' && $environment['surge-version'];
  this.isLoon = () => typeof $loon !== 'undefined';
  this.isStash = () => typeof $environment !== 'undefined' && $environment['stash-version'];
  this.isQuanX = () => typeof $task !== 'undefined';
  
  // 面板类型检测
  this.isPanel = () => this.isSurge() && typeof $input !== 'undefined' && $input.purpose === 'panel';
  this.isTile = () => this.isStash() && typeof $script !== 'undefined' && $script.type === 'tile';
  
  // 网络请求方法
  this.http = {
    get: (options) => {
      return new Promise((resolve, reject) => {
        if (this.isSurge() || this.isLoon() || this.isStash()) {
          $httpClient.get(options, (error, response, body) => {
            error ? reject(error) : resolve({ status: response.status, headers: response.headers, body });
          });
        } else if (this.isQuanX()) {
          $task.fetch(options).then(
            response => resolve({ status: response.statusCode, headers: response.headers, body: response.body }),
            error => reject(error)
          );
        }
      });
    }
  };
  
  // 通知方法
  this.msg = (title, subtitle, body) => {
    if (this.isSurge() || this.isLoon() || this.isStash()) {
      $notification.post(title, subtitle, body);
    } else if (this.isQuanX()) {
      $notify(title, subtitle, body);
    }
  };
  
  // 日志方法
  this.log = console.log;
  this.logErr = (error) => console.error(`❌ ${name} 错误:`, error);
  
  // 工具方法
  this.lodash_get = (obj, path, defaultValue) => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let result = obj;
    for (const key of keys) {
      result = result[key];
      if (result === undefined) return defaultValue;
    }
    return result;
  };
  
  // 结束方法
  this.done = (value = {}) => {
    if (this.isSurge() || this.isLoon() || this.isStash() || this.isQuanX()) {
      $done(value);
    }
  };
}

const $ = new Env('网络测速');
// ===================== 精简环境适配器结束 =====================

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
    await notify('网络测速', '面板', '开始测速...');
  }
  
  // 默认使用5MB测试流量（用户可通过 &mb= 参数自定义）
  const mb = $.lodash_get(arg, 'mb') || 5;
  const bytes = mb * 1024 * 1024;
  
  // 智能超时设置：基础5秒 + 每MB增加1秒（5MB => 10秒超时）
  const downloadTimeout = 5000 + mb * 1000;
  console.log(`📊 测试数据量: ${mb}MB, 超时时间: ${downloadTimeout / 1000}秒`);
  
  try {
    let start = Date.now();
    const res = await $.http.get({
      url: `https://speed.cloudflare.com/__down?bytes=${bytes}`,
      node: $environment.params.node,
      timeout: downloadTimeout
    });
    
    const end = Date.now();
    const duration = (end - start) / 1000;
    const speed = mb / duration;
    
    const pingstart = Date.now();
    const ping = await $.http.get({
      url: `http://cp.cloudflare.com/generate_204`,
      node: $environment.params.node,
      timeout: 3000
    });
    
    const pingt = Date.now() - pingstart;
    console.log(`⏱️ 延迟时间: ${pingt}ms`);
    console.log(`⏱️ 下载耗时: ${duration.toFixed(2)}s`);
    
    // 计算速率和延迟对应的图标和颜色
    const a = Diydecide(0, 50, 100, Math.round(speed * 8));
    const b = Diydecide(0, 100, 200, pingt) + 3;
    
    let shifts = {
      '1': arg?.iconslow || 'tortoise',       // 默认慢速图标
      '2': arg?.iconmid || 'hare',            // 默认中速图标
      '3': arg?.iconfast || 'bird',           // 默认快速图标
      '4': arg?.colorlow || '#06D6A0',        // 默认低延迟颜色
      '5': arg?.colormid || '#FFD166',        // 默认中延迟颜色
      '6': arg?.colorhigh || '#EF476F'        // 默认高延迟颜色
    };
    
    icon = shifts[a];
    color = shifts[b];
    console.log(`🎯 图标: ${shifts[a]}`);
    console.log(`🎨 颜色: ${shifts[b]}`);
    
    // 标题默认为中文"网络测速"
    title = arg?.title || "网络测速";
    
    // 格式化测速结果
    const downloadMbps = Math.round(speed * 8 * 10) / 10;
    const downloadMBs = Math.round(speed * 10) / 10;
    
    content = `节点：${$environment.params.nodeInfo.name}\n`;
    content += `下行速率：${downloadMbps} Mbps (${downloadMBs} MB/s)\n`;
    content += `测试耗时：${duration.toFixed(2)}秒\n`;
    content += `网络延迟：${pingt} ms\n`;
    content += `测试时间：${new Date().toTimeString().split(' ')[0]}`;
    
    if ($.isTile()) {
      await notify('网络测速', '面板', '测速完成');
    } else if (!$.isPanel()) {
      await notify('网络测速', title, content);
    }
  } catch (e) {
    $.logErr(e);
    const msg = `${e.message || e.error || e}`;
    title = `❌ 测速失败`;
    content = `原因: ${msg}\n请检查网络或节点状态`;
    await notify('网络测速', title, content);
  }
})()
.finally(async () => {
  // 确保返回结果给面板
  const result = { 
    title, 
    content, 
    icon, 
    'icon-color': color,
    ...arg 
  };
  
  $.log(JSON.stringify(result, null, 2));
  $.done(result);
});

// 通知函数
async function notify(title, subt, desc, opts) {
  if ($.lodash_get(arg, 'notify') !== 'false') {
    $.msg(title, subt, desc, opts);
  }
}

// 确定变量所在区间
function Diydecide(x, y, z, item) {
  let array = [x, y, z];
  array.push(item);
  return array.sort((a, b) => a - b).findIndex(i => i === item);
}
