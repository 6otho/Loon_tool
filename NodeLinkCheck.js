const a = 'NodeLinkCheck';
const b = 'RebuildNodeLineJsonByRE';
const c = new Env(a);
let d;
if (typeof $argument != 'undefined') {
  d = Object.fromEntries($argument.split('&').map(n => n.split('=')));
}
let e = a;
let f = '-';
let g;
!(async () => {
  const [n, o] = await Promise.all([i(), h()]);
  c.log('出口IP信息', c.toStr(n));
  c.log('节点名信息', c.toStr(o));
  const p = c.lodash_get(o, 'policy');
  if (p) {
    c.log('节点名称', p);
    const q = c.getjson(b);
    const r = c.lodash_get(q, p);
    // 原来的入口地址
    const sOriginal = c.lodash_get(r, 'server');
    // 直接覆盖为你自己的后端地址
    let s = 'subk.v5oo.eu.org';
    const t = c.lodash_get(r, 'type');
    c.log('入口server信息', s);
    if (!s) {
      throw new Error('请先从Sub-Store订阅');
    }
    const u = await i(s);
    c.log('入口IP信息', c.toStr(u));
    const v = [l(c.lodash_get(u, 'countryCode')), c.lodash_get(u, 'city'), c.lodash_get(u, 'isp')].join(' ');
    const w = [l(c.lodash_get(n, 'countryCode')), c.lodash_get(n, 'city'), c.lodash_get(n, 'isp')].join(' ');
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
      const D = (c.lodash_get(inIpInfo, 'country') + ' ' + c.lodash_get(inIpInfo, 'regionName') + ' ' + c.lodash_get(inIpInfo, 'city')).replace(/(\中\国\ |\中\华\人\民\共\和\国\ |\中\華\人\民\共\和\國\ )/g, '');
      const E = (c.lodash_get(outIpInfo, 'country') + ' ' + c.lodash_get(outIpInfo, 'regionName') + ' ' + c.lodash_get(outIpInfo, 'city')).replace(/(\中\国\ |\中\华\人\民\共\和\国\ |\中\華\人\民\共\和\國\ )/g, '');
      if (C == A && C == 'CN') {
        f = '· ' + y + ' ➟ ' + '国内代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + E + '\n· ' + '国内IP：' + B;
      } else if (C == A && C != 'CN') {
        f = '· ' + y + ' ➟ ' + '直连代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + E + '\n· ' + '出口IP：' + B;
      } else if (C != A && A == 'CN') {
        var p = /IEPL/gi;
        var s = /IPLC/gi;
        var v = /\专\线/gi;
        if ($environment.params.search(p) != -0x1) {
          f = '· ' + y + ' ➟ ' + 'IEPL专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else if ($environment.params.search(s) != -0x1) {
          f = '· ' + y + ' ➟ ' + 'IPLC专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else if ($environment.params.search(v) != -0x1) {
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
      const y = c.lodash_get(nodeInfo, 'type').toUpperCase();
      const z = c.lodash_get(inIpInfo, 'query');
      const A = c.lodash_get(inIpInfo, 'countryCode');
      const B = c.lodash_get(outIpInfo, 'query');
      const C = c.lodash_get(outIpInfo, 'countryCode');
      const D = (c.lodash_get(inIpInfo, 'country') + ' ' + c.lodash_get(inIpInfo, 'regionName') + ' ' + c.lodash_get(inIpInfo, 'city')).replace(/(\中\国\ |\中\华\人\民\共\和\国\ |\中\華\人\民\共\和\國\ )/g, '');
      const E = (c.lodash_get(outIpInfo, 'country') + ' ' + c.lodash_get(outIpInfo, 'regionName') + ' ' + c.lodash_get(outIpInfo, 'city')).replace(/(\中\国\ |\中\华\人\民\共\和\国\ |\中\華\人\民\共\和\國\ )/g, '');
      if (C == A && C == 'CN') {
        f = '· ' + y + ' ➟ ' + '国内代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + E + '\n· ' + '国内IP：' + B;
      } else if (C == A && C != 'CN') {
        f = '· ' + y + ' ➟ ' + '直连代理' + ' ➟ ' + policy + '\n· ' + '您' + ' ➟ ' + E + '\n· ' + '出口IP：' + B;
      } else if (C != A && A == 'CN') {
        var p = /IEPL/gi;
        var s = /IPLC/gi;
        var v = /\专\线/gi;
        if ($environment.params.search(p) != -0x1) {
          f = '· ' + y + ' ➟ ' + 'IEPL专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else if ($environment.params.search(s) != -0x1) {
          f = '· ' + y + ' ➟ ' + 'IPLC专线' + ' ➟ ' + policy + '\n· ' + D + ' ➟ ' + E + '\n· ' + z + ' ➟ ' + B;
        } else if ($environment.params.search(v) != -0x1) {
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
    const F_x = { ...d };
    F_x['title'] = F;
    F_x['content'] = f;
    c.done(F_x);
  }
});
