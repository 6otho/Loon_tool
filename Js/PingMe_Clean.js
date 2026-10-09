// PingMe_Clean.js
const storeKey = 'pingme_accounts_v1';
const isLoon = typeof $loon !== "undefined";

if (isLoon) {
    $persistentStore.write("", storeKey); 
    $notification.post("PingMe 清理", "✅ 历史账号数据已清空", "请重新打开 PingMe App 获取最新的账号数据！");
} else {
    $prefs.removeValueForKey(storeKey); 
    $notify("PingMe 清理", "✅ 历史账号数据已清空", "请重新打开 PingMe App 获取最新的账号数据！");
}

console.log("PingMe 历史账号数据已清空，请重新抓包获取！");
$done();
