// WeTalk_Clean.js
const storeKey = 'wetalk_accounts_v1';
const isLoon = typeof $loon !== "undefined";

if (isLoon) {
    $persistentStore.write("", storeKey); 
    $notification.post("WeTalk 清理", "✅ 历史账号数据已清空", "请重新打开 WeTalk App 获取最新的账号数据！");
} else {
    $prefs.removeValueForKey(storeKey); 
    $notify("WeTalk 清理", "✅ 历史账号数据已清空", "请重新打开 WeTalk App 获取最新的账号数据！");
}

console.log("WeTalk 历史账号数据已清空！");
$done();
