/**
 * baidu-translate.js
 * A Loon/Surge/QuantumultX compatible script to translate text using Baidu Translate API
 * Usage in Loon:
 *   [Script]
 *   baidu-translate = script-path=https://raw.githubusercontent.com/your/repo/main/baidu-translate.js, requires-request-body=true
 * Configuration:
 *   env BAIDU_APP_ID and BAIDU_APP_KEY must be set in $environment
 *
 * The script reads the request body as JSON: { text: '', from: 'en', to: 'zh' }
 * and returns a JSON response: { translated: '...' }
 */

// Loon / Surge / QuantumultX compatibility
const isSurge = typeof $httpClient !== 'undefined';
const isQuanX = typeof $task !== 'undefined';
const isLoon = typeof $loon !== 'undefined';
const env = (key) => {
  if (isSurge || isLoon) {
    return $environment[key];
  } else if (isQuanX) {
    return $prefs.valueForKey(key);
  }
};

const APP_ID = env('BAIDU_APP_ID') || 'YOUR_APP_ID';
const API_KEY = env('BAIDU_APP_KEY') || 'YOUR_APP_KEY';
const API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

function md5(str) {
  if (isQuanX) {
    return $crypto.md5(str);
  } else {
    // Fallback: use JS implementation
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
  }
}

async function translate(text, from = 'auto', to = 'zh') {
  const salt = Date.now().toString();
  const sign = md5(APP_ID + text + salt + API_KEY);
  const params = `?q=${encodeURIComponent(text)}&from=${from}&to=${to}&appid=${APP_ID}&salt=${salt}&sign=${sign}`;
  const url = API_URL + params;

  return new Promise((resolve, reject) => {
    const callback = (error, response, data) => {
      if (error) return reject(error);
      try {
        const json = typeof data === 'string' ? JSON.parse(data) : data;
        if (json.error_code) {
          reject(`Error ${json.error_code}: ${json.error_msg}`);
        } else {
          const translated = json.trans_result.map(item => item.dst).join('\n');
          resolve(translated);
        }
      } catch (e) {
        reject(e);
      }
    };
    if (isSurge || isLoon) {
      $httpClient.get(url, callback);
    } else if (isQuanX) {
      $task.fetch({ url }).then(resp => callback(null, {}, resp.body)).catch(reject);
    }
  });
}

// Main
(async () => {
  let body;
  if (isSurge || isLoon) {
    body = JSON.parse($request.body);
  } else if (isQuanX) {
    body = JSON.parse($request.body);
  }
  const { text, from, to } = body;
  try {
    const translated = await translate(text, from, to);
    const result = { translated };
    if (isSurge || isLoon) {
      $done({ body: JSON.stringify(result) });
    } else if (isQuanX) {
      $done({ body: JSON.stringify(result) });
    }
  } catch (err) {
    if (isSurge || isLoon) {
      $done({ status: -1, body: err.toString() });
    } else if (isQuanX) {
      $done({ status: -1, body: err.toString() });
    }
  }
})();
