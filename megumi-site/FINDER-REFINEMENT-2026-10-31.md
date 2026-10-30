# 找车面板可读性与官方 Logo 更新 · 2026-10-31

- 下滑后默认展开“按品牌找车”；继续滚动、调整窗口和切换语言不会自动收起或重置已选状态。用户可主动切换其他入口或缩小面板。
- 删除 01/02/03 和车型序号，改用普通分类符号；10 种语言均明确说明品牌、车型、预算是任选一种，无需按顺序填写。
- 品牌卡片改为浅灰白底深色字，品牌名称 13px；入口标题 17px、说明 12px。蓝、青绿、暖金分别提示品牌、车型和预算。已计算品牌名对比度 13.73:1、说明文字 8.70:1、辅助说明 8.24:1。
- 20 个品牌均已接入官方原始标志、本地保存，没有 AI 生成、描摹、重绘、改色、图片热链接或第三方 Logo 站素材。
- 选择内容过长时可在面板内滚动，保留三个入口和底部联系操作；减少动态效果及手机适配规则保留。
- 原导航、两颗悬浮联系按钮、网站其他区域和部署配置没有修改。index.html 仅更新本模块资源版本号。

## 用户最新要求与来源记录

用户后续明确表示“logo不需要授权”，并要求继续按官网原文件接入，因此不再等待用户提供授权材料。本记录不把用户的这句话当成厂商授予许可，也不作所有商标均无需许可的法律结论；本站仅按用户要求展示品牌识别，不表示品牌官方认可 MEGUMI。

逐品牌来源、文件大小、SHA-256、提取方式见 `dist/assets/brand-logos/sources.json`。20 个标志文件合计约 212 KiB。下载文件的字节保持原样；Ferrari 为官方商店页内嵌 symbol 图形原样抽取到独立 SVG 容器，图形路径没有修改。Porsche 使用官方发布的盾徽照片，避免把媒体站的 newsroom 图标误作品牌标志。若文件加载异常，仍保留品牌名称。

| 品牌 | 项目文件 | 官方来源 |
|---|---|---|
| Toyota | `assets/brand-logos/toyota.svg` | https://brand.toyota.com/content/dam/brandhub/VIS_toyota_logo_horiz_black_RGB_2021.svg |
| Lexus | `assets/brand-logos/lexus.svg` | https://global.toyota/pages/contents/image/lexus_logo.svg |
| Honda | `assets/brand-logos/honda.png` | https://www.honda.co.jp/honda-touch-icon.png |
| Nissan | `assets/brand-logos/nissan.svg` | https://www.nissan-global.com/library/assets/img/hd_logo.svg |
| Mazda | `assets/brand-logos/mazda.svg` | https://www.mazda.co.jp/etc.clientlibs/mazda-co-jp/clientlibs/clientlib-site/resources/images/mazdalogo_black.svg |
| Subaru | `assets/brand-logos/subaru.webp` | https://www.subaru.co.jp/assets-ub/img/common/logo.webp |
| Suzuki | `assets/brand-logos/suzuki.svg` | https://www.globalsuzuki.com/img/common/suzukiLogo.svg |
| Mitsubishi | `assets/brand-logos/mitsubishi.png` | https://www.mitsubishi-motors.co.jp/apple-touch-icon.png |
| Daihatsu | `assets/brand-logos/daihatsu.webp` | https://www.daihatsu.co.jp/com_parts/img/logo-l.png |
| Mercedes-Benz | `assets/brand-logos/mercedes-benz.ico` | https://www.mercedes-benz.com.cn/favicon.ico |
| BMW | `assets/brand-logos/bmw.svg` | https://www.bmw.com.cn/etc.clientlibs/ds2-webcomponents/clientlibs/clientlib/resources/img/BMW_Grey_Logo.svg |
| Audi | `assets/brand-logos/audi.svg` | https://static.audi.com/assets/images/frontend/rings18-2GJCA2FU.svg |
| Porsche | `assets/brand-logos/porsche.jpg` | https://newsroom.porsche.com/.imaging/mte/porsche-templating-theme/teaser_720x406x2/dam/pnr/2023/Company/Porsche-Crest/Galerie-1/Wappen_neu1.jpg/jcr:content/Wappen_neu1.jpg |
| Volkswagen | `assets/brand-logos/volkswagen.png` | https://www.volkswagen.co.jp/etc.clientlibs/clientlibs/vwa-ngw18/ngw18-frontend/apps/resources/statics/favicons/apple-touch-icon.png |
| Land Rover | `assets/brand-logos/land-rover.png` | https://www.landroverusa.com/config/navigation/footer/_jcr_content/root/container/footercontainer/sub_footer/footer_subcontainer/image.coreimg.png/1785766954700/lr-logo---footer.png |
| Jeep | `assets/brand-logos/jeep.png` | https://www.jeep-japan.com/content/dam/cross-regional/apac/jeep/en_crossregional/global/header/logo-jeep.png |
| Volvo | `assets/brand-logos/volvo.svg` | https://www.volvocars.com/bimi-logo.svg |
| MINI | `assets/brand-logos/mini.svg` | https://www.miniusa.com/content/dam/mini/global-nav/mini-logo.svg |
| Ferrari | `assets/brand-logos/ferrari.svg` | https://store.ferrari.com/en-us/cavallino/ |
| Tesla | `assets/brand-logos/tesla.png` | https://www.tesla.cn/themes/custom/tesla_frontend/assets/favicons/favicon-196x196.png |

## 修改文件

- `dist/smart-finder.js`：默认展开、去序号、官方本地 Logo 显示和图片加载失败回退。
- `dist/smart-finder.css`：字体/对比度、分类色调、浅色品牌卡片、Logo 容器和滚动高度。
- `dist/finder-i18n.js`：10 种语言的独立选择方式说明。
- `dist/finder-data.json`：20 个本地 Logo 路径及显示底色。
- `dist/index.html`：仅本模块资源缓存版本。
- `dist/assets/brand-logos/`：20 个官方素材和 sources.json。
- 本说明，以及 SMART-FINDER-2026-10-30.md 的最新状态提示。

## 验证

更新后的模块测试通过：默认品牌展开、窗口变化后保留状态、20 品牌与 20 本地图像、460 车系、7 车身类型、预算/快捷金额/上下限、WhatsApp 预填、全部 10 语言及手动偏好、阿拉伯语 RTL、返回/重选/最小化/Escape。原始图像格式检查及全部文件 SHA-256 溯源检查通过。预览联系表已目视检查，移除了误取的媒体站图标。

当前无可用浏览器，未声称完成完整网页截图或手机实机视觉验收。恢复标签：backup-before-finder-contrast-20261030。
