#!name=小红书去广告与去水印
[URL Rewrite]
# 小红书 - 惊喜弹窗
^https:\/\/edith\.xiaohongshu\.com\/api\/sns\/v1\/surprisebox\/(?:get_style|open|submit_action) - reject-dict
^https?:\/\/www\.xiaohongshu\.com\/api\/marketing\/box\/trigger\? - reject-dict

# 小红书 - 信息流（搜索相关）
^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v\d\/search\/(banner|hot)_list script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书搜索页
^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v\d\/search\/(hint|trending)\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书搜索页
^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v\d\/search\/notes\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书搜索页

# 小红书 - 开屏广告
^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v\d\/system_service\/config\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书开屏广告
^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v\d\/system_service\/splash_config script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书开屏广告

# 小红书 - 详情页/小部件
^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v\d\/note\/widgets script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书详情页

# 小红书 - 图片/视频水印处理
^https?:\/\/(edith|rec|www)\.xiaohongshu\.com\/api\/sns\/v\d\/note\/(imagefeed|live_photo\/save) script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书图片视频水印
^https?:\/\/(edith|rec|www)\.xiaohongshu\.com\/api\/sns\/(v2\/note\/feed|v3\/note\/videofeed)\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书图片视频水印
^https?:\/\/(edith|rec|www)\.xiaohongshu\.com\/api\/sns\/(v4\/note\/videofeed|v10\/note\/video\/save)\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书图片视频水印

# 小红书 - 评论区图片及 live 图水印（存储与下载）
^https:\/\/edith\.xiaohongshu\.com\/api\/sns\/v5\/note\/comment\/list\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书评论区去水印存储
^https:\/\/edith\.xiaohongshu\.com\/api\/sns\/v1\/interaction\/comment\/video\/download\? script-response-body https://github.com/fmz200/wool_scripts/raw/main/Scripts/xiaohongshu/xiaohongshu.js, requires-body=true, timeout=60, tag=小红书评论区去水印下载

[MITM]
hostname = edith.xiaohongshu.com, www.xiaohongshu.com, ci.xiaohongshu.com, rec.xiaohongshu.com