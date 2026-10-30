# 联系区域排版与透明小汽车 · 2026-10-30

## 排版

重新整理截图对应的联系区域，保留两处真实地址、公司名称、电话、邮箱、WhatsApp、Instagram 和原地图。标题和说明对齐；联系方式集中在左侧玻璃卡片，右侧地图与左侧等高，底部两栏展示总部/东京地址。手机端上下排列。原右上角孤立的邮件按钮改为卡片内的邮箱链接。

地图仍使用原国土地理院图层与既有坐标，默认缩放从 17 调整为 16，扩大周边范围；总部/东京切换及 Google 导航保持。

## 透明 PNG

最终文件：`dist/assets/beetle-sprite.png`，360×180，RGBA 透明背景，约 80 KiB。内置 ImageGen 生成，复制到项目后仅优化尺寸与 PNG 编码，保留透明 alpha；生成原图留存于 Codex generated_images。

香槟色甲壳虫侧视、车头朝右，替换流程及 FAQ 中旧的深色 SVG 小汽车，移除原 SVG 的不透明背景。保留流程中的滚动行驶动画与 FAQ 行驶动画，并遵从减少动态效果设置。

生成方式：内置 `image_gen`，`transparent_background: true`。
最终提示词：

> Create a single website animation sprite as a PNG with genuinely transparent alpha background. A charming classic Volkswagen Beetle style compact car, perfect orthographic side profile, front points RIGHT. Champagne ivory pearl body, rounded recognizable Beetle silhouette, small chrome bumpers, two clean black rubber tires with silver hubcaps, subtle warm metallic details. Elegant polished realistic miniature product-render style, not pixel art, not a flat icon. Side windows soft blue-gray, body LIGHT cream not black. Entire vehicle clearly visible, centered horizontally, tightly framed in a wide landscape canvas with just a small transparent margin. No ground, no floor, no backdrop, no rectangular white background, no cast ground shadow, no road, no headlight beam, no text, no license plate text, no watermark, no emblem. One car only. Designed to remain recognizable at 110 pixels wide against both white and dark website surfaces.

## 验证与版本

JavaScript 语法、DOM 交互、两车详情、品牌、语言选项、真实联系方式、地图地址切换、照片路径及页面锚点检查通过。PNG alpha 范围为 0–255，背景确为透明。

当前没有可用浏览器，因此没有声称完成截图或实机流畅度验收。

恢复标签：`backup-before-contact-layout-20261030`（`d2c20c5`）。原部署配置未改动。

修改文件：`dist/index.html`、`dist/app.js`、`dist/street-map.js`、新增 `dist/contact-refinement.css`、`dist/assets/beetle-sprite.png`、本说明和 README。
