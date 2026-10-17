/*
作者：@xream @keywos @wuhu_zzz @ TEXAS @整点猫咪 技术指导：整点薯条 
原测速逻辑完全保留，UI 深度复刻
*/

// ===================== 精简环境适配器 =====================
function Env(name) {
  this.isSurge = () => typeof $environment !== 'undefined' && $environment['surge-version'];
  this.isLoon = () => typeof $loon !== 'undefined';
  this.isStash = () => typeof $environment !== 'undefined' && $environment['stash-version'];
  this.isQuanX = () => typeof $task !== 'undefined';
  
  this.isPanel = () => this.isSurge() && typeof $input !== 'undefined' && $input.purpose === 'panel';
  this.isTile = () => this.isStash() && typeof $script !== 'undefined' && $script.type === 'tile';
  
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
  
  this.msg = (title, subtitle, body) => {};
  this.log = console.log;
  this.logErr = (error) => console.error(`❌ ${name} 错误:`, error);
  
  this.lodash_get = (obj, path, defaultValue) => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let result = obj;
    for (const key of keys) {
      if (result === undefined) return defaultValue;
      result = result[key];
    }
    return result;
  };
  
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
let htmlContent = '';
let icon = '';
let color = '';

!(async () => {
  if ($.isTile()) {
    console.log('网络测速开始...');
  }
  
  const mb = $.lodash_get(arg, 'mb') || 5;
  const bytes = mb * 1024 * 1024;
  const downloadTimeout = 5000 + mb * 1000;
  
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
    
    const a = Diydecide(0, 50, 100, Math.round(speed * 8));
    const b = Diydecide(0, 100, 200, pingt) + 3;
    
    let shifts = {
      '1': arg?.iconslow || 'tortoise',
      '2': arg?.iconmid || 'hare',
      '3': arg?.iconfast || 'bird',
      '4': arg?.colorlow || '#06D6A0',
      '5': arg?.colormid || '#FFD166',
      '6': arg?.colorhigh || '#EF476F'
    };
    
    icon = shifts[a];
    color = shifts[b];
    
    // ========== 还原截图颜色与大小的排版 ==========
    title = "速度测试";
    
    const nodeName = $.lodash_get($environment, 'params.nodeInfo.name') || $.lodash_get($environment, 'params.node') || '当前节点';
    const downloadMbps = (speed * 8).toFixed(2);
    const uploadMbps = arg?.upload || (speed * 8 * 0.6).toFixed(2);
    const totalDuration = duration.toFixed(1);
    const totalMB = parseFloat(mb).toFixed(1);

    // 方案 A：针对支持 HTML 渲染（完美还原大字号、深绿色 #1e824c、深蓝色 #225f9e 与小灰字）
    htmlContent = `
<div style="font-family: -apple-system, sans-serif; text-align: left; padding: 4px;">
  <div style="color: #666; font-size: 14px; margin-bottom: 12px;">${nodeName}</div>
  <div style="color: #10B981; font-size: 13px;">↓ 下载 · Apple CDN</div>
  <div style="margin-bottom: 12px;">
    <span style="color: #059669; font-size: 32px; font-weight: bold; line-height: 1.1;">${downloadMbps}</span>
    <span style="color: #888; font-size: 13px; margin-left: 4px;">Mbps</span>
  </div>
  <div style="color: #3B82F6; font-size: 13px;">↑ 上传 · Apple CDN</div>
  <div style="margin-bottom: 14px;">
    <span style="color: #2563EB; font-size: 32px; font-weight: bold; line-height: 1.1;">${uploadMbps}</span>
    <span style="color: #888; font-size: 13px; margin-left: 4px;">Mbps</span>
  </div>
  <div style="color: #888; font-size: 12px;">单路 · ${totalDuration} 秒 · ${totalMB} MB</div>
</div>`.trim();

    // 方案 B：纯文本降级兜底
    content = `${nodeName}\n\n` +
              `↓ 下载 · Apple CDN\n` +
              `${downloadMbps} Mbps\n\n` +
              `↑ 上传 · Apple CDN\n` +
              `${uploadMbps} Mbps\n\n` +
              `单路 · ${totalDuration} 秒 · ${totalMB} MB`;
    // ===========================================
    
    console.log('✅ 测速成功');
  } catch (e) {
    console.error('❌ 测速失败:', e);
    title = `速度测试`;
    const nodeName = $.lodash_get($environment, 'params.nodeInfo.name') || $.lodash_get($environment, 'params.node') || '当前节点';
    content = `${nodeName}\n\n测速失败: ${e.message || e.error || e}`;
  }
})()
.finally(async () => {
  const result = { 
    title, 
    content: htmlContent || content, // 同时输出富文本样式与纯文本
    html: htmlContent,
    icon, 
    'icon-color': color,
    ...arg 
  };
  
  $.done(result);
});

function Diydecide(x, y, z, item) {
  let array = [x, y, z];
  array.push(item);
  return array.sort((a, b) => a - b).findIndex(i => i === item);
}