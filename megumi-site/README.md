> 2026-10-31: [Mobile finder, 11 languages, local/USD prices and localized WhatsApp](MOBILE-LANGUAGES-PRICES-2026-10-31.md). This supersedes earlier Chinese-only and fixed exchange-rate notes.

> 最新联系区域与透明小汽车更新：[CONTACT-UPDATE-2026-10-30.md](CONTACT-UPDATE-2026-10-30.md)。

> 最新视觉与交互更新：[VISUAL-UPDATE-2026-10-30.md](VISUAL-UPDATE-2026-10-30.md)。

> 最新中文版改版与维护说明：[UPDATE-2026-10-30.md](UPDATE-2026-10-30.md)。下文为旧版本历史记录；业务、价格、车辆及验证状态以最新说明为准。

# 惠澤株式会社 · 中文网站第一版

静态网站，无构建依赖。页面入口：`dist/index.html`。

本地预览：在此目录运行 `python -m http.server 8765 --directory dist`，然后打开 http://localhost:8765 。

## 常用修改

- `dist/config.js`：WhatsApp 国际号码（仅数字，例如日本国家代码 81）、Instagram 完整链接、车型、日元基准价、五步流程和 FAQ。
- `dist/style.css`：开头 `:root` 的颜色、字体、圆角和动画变量；`[data-theme=light]` 控制白天主题。
- `dist/index.html`：公司联系资料、买家感受示例、主要文案。
- `dist/rates.json`：日元换算数据快照。浏览器优先读取此文件，读取失败时使用脚本内相同快照。

## 第一版内容说明

- 仅中文。语言菜单展示各语言本名与旗帜；外语选项弹出准备中提示。尚未启用外语翻译和 IP 查询。
- 当地货币根据浏览器语言提供初始选择，访客手动选择会保留。无法从语言可靠判断的国家使用美元；缺少汇率的选项明确禁用。
- 汇率日期为 2026-10-26，来源 https://api.frankfurter.dev/v1/latest?base=JPY&symbols=USD,CNY,EUR,GBP,AUD,CAD 。这是参考快照，非实时结算汇率。
- 车辆参考价以日元为基准，美元及当地货币通过同一基准换算。当前为官方含税指导价参考，非公司最终出口报价。
- RX 350 version L 2WD：7,040,000 JPY，来源 https://global.toyota/jp/newsroom/lexus/44845649.html 。
- Crown Z 2.5L Hybrid FR：7,300,000 JPY，来源 https://toyota.jp/ucar/catalog/brand-TOYOTA/car-CROWN/ 。
- Alphard Z 2.5L 2WD：5,599,000 JPY，来源 https://toyota.jp/ucar/catalog/brand-TOYOTA/car-ALPHARD/202606/10163593/ 。
- 图片为品牌官网车型示意，不能作为特定现车或配置承诺；正式商用前应确认图片使用授权或替换自有素材。
- 买家感受已明确标注为示例。没有虚构实际客户、出口记录、销量或公司经验年限。
- 社交账号为空时打开说明弹窗，提供真实公司邮箱和电话。接入配置后直接跳转对应平台。
- 公司 Logo、地址、邮箱、电话以 http://www.megumi-favor.com/index.html 为准。总部和东京营业所地图可以切换。
- 本地偏好使用 localStorage；Google 地图与 Google Fonts 需要网络。浏览器不支持或禁用动画时保留可阅读内容，遵从减少动态效果设置。

## 验证记录

JavaScript 语法检查通过；本地 HTTP 返回 200；HTML ID、导航锚点和引用素材路径检查通过。当前会话未提供可用浏览器，未完成真实浏览器视觉及设备测试。

## 第二版调整

- 使用中性炭黑底色；`dist/refinements.css` 管理本轮排版及手机适配。
- 标题取消标点，中文文案精简，车辆使用整行宽「立即咨询」按钮。页面不再展示汇率日期及核价日期。
- 服务图标使用 Lucide，原始 SVG 与 ISC 许可证保存在 `dist/assets/icons/`，来源 https://lucide.dev/license 。
- 手机顶部重新排成公司信息行和两个完整联系按钮行；价格、说明、流程与地址提高字号和点击区域。
- 地图默认保留 Google 原生嵌入，明确展示完整地址与总部／东京营业所切换。
- 配置 `googleMapsApiKey` 后，`dist/company-map.js` 将启用 Google 深色地图与绿色道路线，并通过 Google Geocoder 定位完整地址。密钥应允许当前网站来源并启用 Maps JavaScript API 和 Geocoding API；密钥未配置、无效或定位失败时保留原生地图。
- 深色绿线的真实 Google 自定义地图尚待 API 密钥；没有使用假地图或对地图标签整体变色。
- 手机局域网端口设置被系统拒绝，未修改防火墙；免登录预览使用独立的 Cloudflare 临时隧道，仅提供 `dist` 目录。

## 第三版调整

- 顶部导航及两个联系按钮统一为白色半透明磨砂玻璃，深色字体，桌面和手机使用相同材质。
- 流程及问答动画改用车头朝右的侧视小车；服务列表继续使用 Lucide 图标。
- 没有 Google Maps API 密钥时使用真实日本街道底图（国土地理院淡色地图），仅底图配色做深色处理，明确标注来源及加工；Google 导航按钮和完整地址继续保留。地图不是涩谷的位置，展示的仍然是公司总部和东京营业所。
- 地图交互使用 Leaflet 1.9.4（BSD-2-Clause），库和许可证保存在 `dist/assets/leaflet/`。
- 总部坐标 35.86004426285616,139.97403263313527，与同一地址千葉県柏市柏3-6-3 的地图标记核对，来源 https://r.gnavi.co.jp/grzeter00000/map/ （使用 marker 数据，未使用地图 center 坐标）。东京坐标 35.7311336556,139.7638928043，来源 MapFan 的東京都荒川区西日暮里4-23-2 地址点。
- 地图数据：https://maps.gsi.go.jp/development/ichiran.html ；使用和加工说明：https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html 。

## 动态展示更新

- 首屏和服务区圆角图卡各有三张图，独立自动切换（6.5 秒），淡入淡出与缓慢推进；支持暂停、键盘和手机滑动。页面不可见或对应图区离开视口时停止自动切换，遵从减少动态效果设置。
- 公司品牌随页面正常滚动；滚动后只有 WhatsApp、Instagram 联系按钮固定在顶部。
- 跑车前进时亮白色前灯和前方光束，倒车时亮红色尾灯；停止后灯光熄灭。
- Pexels 集装箱：Giant Asparagus，https://www.pexels.com/photo/aerial-view-of-multicolored-shipping-containers-35516930/ 。
- Pexels 远洋货轮：Martin Hungerbühler，https://www.pexels.com/photo/container-ship-on-sea-20821680/ 。
- Pexels 货轮驾驶台近景：https://www.pexels.com/photo/an-aerial-shot-of-a-cargo-ship-11820857/ 。
- 素材按 https://www.pexels.com/license/ 用于场景展示，没有声明为公司自有船舶、港口或实际交付记录。
- 验证：两个轮播的独立切换、暂停及自动播放逻辑检查通过；前进／倒车灯状态检查通过。HTML 素材路径、SVG 引用和 JavaScript 语法检查通过；当前会话仍没有可用浏览器，未完成真实设备视觉验收。
