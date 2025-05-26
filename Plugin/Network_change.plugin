#!name=网络切换
#!desc=网络切换提示
#!author=Ko整理
#!icon=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/Fancynetwork(1).png
#############################################
[Rule]
DOMAIN-SUFFIX,speedtest.cn,DIRECT
DOMAIN-SUFFIX,ip.im,DIRECT
DOMAIN-SUFFIX,ip.plus,DIRECT

[Script]
# 请求
http-request ^https?:\/\/net-lsp-x\.com script-path=https://raw.githubusercontent.com/6otho/Loon_tool/refs/heads/main/Script/network.js, timeout=120, tag=网络信息请求 𝕏

# 网络变化事件
network-changed script-path=https://raw.githubusercontent.com/6otho/Loon_tool/refs/heads/main/Script/network.js, timeout=120, tag=网络信息变化 𝕏, argument="TYPE=EVENT&icon=globe.asia.australia&icon-color=#6699FF&LAN=0&SSID=0&IPv6=0&MASK=0&DOMESTIC_IPv4=spcn&DOMESTIC_IPv6=ddnspod&LANDING_IPv4=ipapi&LANDING_IPv6=ipsb&PRIVACY=0&FLAG=1&ENTRANCE_DELAY=0&EVENT_DELAY=3"

[MITM]
hostname = net-lsp-x.com
