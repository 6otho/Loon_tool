const { ui } = require('loon'); // 引入 Loon UI 模块

let cronSwitch = false; // 默认不开启 Cron 定时任务

// 创建 Cron 开关控件
ui.addSwitch({
  title: "启用定时任务",
  key: "cronSwitch", // 用于保存配置的 key
  value: cronSwitch,
  onChange: (value) => {
    cronSwitch = value; // 更新 Cron 开关状态
    console.log("Cron 开关状态：", cronSwitch);
  }
});

// 定时任务执行函数
function runCronTask(cronTask) {
  if (!cronSwitch || !cronTask.enable) {
    console.log(`定时任务: ${cronTask.tag} 已禁用，跳过执行！`);
    return; // 如果 Cron 开关关闭或者任务被禁用，则跳过定时任务
  }

  console.log(`执行定时任务: ${cronTask.tag}...`);
  // 在此处放置定时任务的实际逻辑，比如触发某些操作或执行请求
  // 例如，可以添加每次定时任务时要执行的脚本或 API 请求
}

// 下面是原始定时任务配置
const cronTasks = [
  {
    cron: "0 7,11,17 * * *",
    scriptPath: "https://gist.githubusercontent.com/Sliverkiss/33800a98dcd029ba09f8b6fc6f0f5162/raw/aliyun.js",
    tag: "阿里云盘签到",
    enable: false,
  },
  {
    cron: "30 1,8,12,17 * * *",
    scriptPath: "https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/kuaishou/ks_fruit.js",
    tag: "快手果园",
    enable: false,
  },
  {
    cron: "22 7 * * *",
    scriptPath: "https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/macat/macat_signin.js",
    tag: "马克喵签到",
    enable: false,
  },
  {
    cron: "19 7 * * *",
    scriptPath: "https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js",
    tag: "微博超话",
    enable: true,
  },
  {
    cron: "1 0 * * *",
    scriptPath: "https://raw.githubusercontent.com/wf021325/qx/master/task/ampDache.js",
    tag: "高德地图打车签到",
    enable: false,
  },
  // 其他 Cron 任务...
];

// 模拟 Cron 任务的定时执行
cronTasks.forEach((task) => {
  // 使用 setInterval 模拟定时任务的调度
  setInterval(() => {
    runCronTask(task); // 根据 Cron 开关执行相应的定时任务
  }, 10000); // 这里设置为 10 秒执行一次，实际应根据任务的 Cron 表达式来定制
});

// 以下是原有的配置文件，Cron 的启用状态现在通过 UI 控件控制
#!name=fmz200定时任务合集
#!desc=整合大部分定时任务Loon版
#!author=奶思
#!homepage=https://github.com/fmz200/wool_scripts
#!icon=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/author/NaiSi_01.png
#!raw-url=https://github.com/fmz200/wool_scripts/raw/main/Loon/script/tasks.scripts
#!tg-group=https://t.me/lanjieguanggao
#!date=2024-12-09 12:15:00
#############################################

// 定时任务配置
cron "0 7,11,17 * * *" script-path=https://gist.githubusercontent.com/Sliverkiss/33800a98dcd029ba09f8b6fc6f0f5162/raw/aliyun.js, timeout=300, tag=阿里云盘签到, img-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/AliYunDrive.png, enable=false
cron "30 1,8,12,17 * * *" script-path=https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/kuaishou/ks_fruit.js, timeout=300, tag=快手果园, img-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/kuaishou.png, enable=false
cron "22 7 * * *" script-path=https://raw.githubusercontent.com/fmz200/wool_scripts/main/Scripts/macat/macat_signin.js, timeout=10, tag=马克喵签到, img-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/Macat.png, enable=false
cron "19 7 * * *" script-path=https://raw.githubusercontent.com/toulanboy/scripts/master/weibo/weibotalk.js, timeout=300, tag=微博超话, img-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/WeiboTalk.png, enable=true
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/wf021325/qx/master/task/ampDache.js, timeout=300, tag=高德地图打车签到, img-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/GaodeMap.jpg, enable=false
