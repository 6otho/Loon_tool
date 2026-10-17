/*
作者：@xream @keywos @wuhu_zzz @ TEXAS @整点猫咪 技术指导：整点薯条 
修改：排版适配 Loon 速度测试原生样式
参数说明：
title：标题（默认：速度测试）
source：测速平台名称（默认：Apple CDN）
mb 或 down_mb：下载测试流量（默认5MB）
up_mb：上传测试流量（默认2MB，设为0则不测上传）
mode：测试方式文字（默认：单路）
iconfast、iconmid、iconslow：测速快中慢时的图标
colorlow、colormid、colorhigh：延迟低中高时的图标颜色
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
            error ? reject(error) : resolve({ status: response?.status, headers: response?.headers, body });
          });
        } else if (this.isQuanX()) {
          $task.fetch(options).then(
            response => resolve({ status: response.statusCode, headers: response.headers, body: response.body }),
            error => reject(error)
          );
        }
      });
    },
    post: (options) => {
      return new Promise((resolve, reject) => {
        if (this.isSurge() || this.isLoon() || this.isStash()) {
          $httpClient.post(options, (error, response, body) => {
            error ? reject(error) : resolve({ status: response?.status, headers: response?.headers, body });
          });
        } else if (this.isQuanX()) {
          options.method = 'POST';
          $task.fetch(options).then(
            response => resolve({ status: response.statusCode, headers: response.headers, body: response.body }),
            error => reject(error)
          );
        }
      });
    }
  };
  
  // 通知方法
  this.msg = (title, subtitle, body) => {};
  
  // 日志方法
  this.log = console.log;
  this.logErr = (error) => console.error(`❌ ${name} 错误:`, error);
  
  // 工具方法
  this.lodash_get = (obj, path, defaultValue) => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let result = obj;
    for (const key of keys) {
      if (result === undefined || result === null) return defaultValue;
      result = result[key];
    }
    return result !== undefined ? result : defaultValue;
  };
  
  // 结束方法
  this.done = (value = {}) => {
    if (this.isSurge() || this.isLoon() || this.isStash() || this.isQuanX()) {
      $done(value);
    }
  };
}

const $ = new Env('速度测试');
// ===================== 精简环境适配器结束 =====================

let arg = {};
if (typeof $argument !== 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')));
}

let title = arg?.title || "速度测试";
let content = '';
let icon = '';
let color = '';

!(async () => {
  const nodeTarget = $.lodash_get($environment, 'params.node');
  const nodeName = 
    $.lodash_get($environment, 'params.nodeInfo.name') || 
    nodeTarget || 
    arg?.node || 
    '当前节点';

  const sourceName = arg?.source || 'Apple CDN';
  const testMode = arg?.mode || '单路';
  
  // 测试流量大小设置
  const downMb = Number(arg?.down_mb || arg?.mb || 5);
  const upMb = Number(arg?.up_mb !== undefined ? arg.up_mb : 2); // 默认测 2MB 上传
  
  const downBytes = downMb * 1024 * 1024;
  const downTimeout = 5000 + downMb * 1000;
  
  let downloadMbps = '0.00';
  let uploadMbps = '--';
  let totalDuration = 0;
  let totalTraffic = downMb;
  let pingt = 0;

  try {
    // 1. 延迟测试
    const pingStart = Date.now();
    await $.http.get({
      url: 'http://cp.cloudflare.com/generate_204',
      node: nodeTarget,
      timeout: 3000
    });
    pingt = Date.now() - pingStart;

    // 2. 下行测速
    const downStart = Date.now();
    await $.http.get({
      url: `https://speed.cloudflare.com/__down?bytes=${downBytes}`,
      node: nodeTarget,
      timeout: downTimeout
    });
    const downEnd = Date.now();
    const downDuration = (downEnd - downStart) / 1000;
    const downSpeed = downMb / downDuration;
    downloadMbps = (downSpeed * 8).toFixed(2);
    totalDuration += downDuration;

    // 3. 上行测速（若 upMb > 0）
    if (upMb > 0) {
      try {
        const upBytes = upMb * 1024 * 1024;
        const upData = '0'.repeat(upBytes);
        const upStart = Date.now();
        await $.http.post({
          url: 'https://speed.cloudflare.com/__up',
          node: nodeTarget,
          headers: { 'Content-Type': 'text/plain' },
          body: upData,
          timeout: 5000 + upMb * 1500
        });
        const upEnd = Date.now();
        const upDuration = (upEnd - upStart) / 1000;
        const upSpeed = upMb / upDuration;
        uploadMbps = (upSpeed * 8).toFixed(2);
        totalDuration += upDuration;
        totalTraffic += upMb;
      } catch (upErr) {
        console.log('上行测速跳过或失败:', upErr?.message || upErr);
        uploadMbps = '--';
      }
    }

    // 状态判定：图标与配色
    const a = Diydecide(0, 50, 100, Math.round(Number(downloadMbps)));
    const b = Diydecide(0, 100, 200, pingt) + 3;
    
    const shifts = {
      '1': arg?.iconslow || 'tortoise',
      '2': arg?.iconmid || 'hare',
      '3': arg?.iconfast || 'speedometer',
      '4': arg?.colorlow || '#06D6A0',
      '5': arg?.colormid || '#FFD166',
      '6': arg?.colorhigh || '#EF476F'
    };
    
    icon = shifts[a];
    color = shifts[b];

    // 组装符合截图排版的面板文本
    content = `${nodeName}\n\n` +
              `↓ 下载 · ${sourceName}\n` +
              `${downloadMbps} Mbps\n\n` +
              `↑ 上传 · ${sourceName}\n` +
              `${uploadMbps} Mbps\n\n` +
              `${testMode} · ${totalDuration.toFixed(1)} 秒 · ${totalTraffic.toFixed(1)} MB`;

    console.log('✅ 测速成功');
  } catch (e) {
    console.error('❌ 测速失败:', e);
    title = '❌ 速度测试失败';
    content = `${nodeName}\n\n原因: ${e.message || e.error || e}\n请检查网络或节点连通性`;
  }
})()
.finally(async () => {
  const result = { 
    title, 
    content, 
    icon, 
    'icon-color': color,
    ...arg 
  };
  
  console.log('测速返回数据:\n', JSON.stringify(result, null, 2));
  $.done(result);
});

// 确定数值区间
function Diydecide(x, y, z, item) {
  let array = [x, y, z];
  array.push(item);
  return array.sort((a, b) => a - b).findIndex(i => i === item);
}