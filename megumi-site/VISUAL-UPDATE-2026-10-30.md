# 玻璃质感与按钮更新 · 2026-10-30

本轮在原站继续修改，保留 GitHub → Cloudflare Pages 部署配置及真实公司资料。

## 完成内容

- 桌面首屏“帮我找车”由 210×62 增至至少 300×84 像素；移动端整行显示，高度至少 70 像素。
- 桌面滚动超过 80px 后，WhatsApp 与 Instagram 固定在右上角亮色玻璃底座内，每个按钮至少 225×82 像素；平板适度缩小。返回页面顶部恢复原导航。80px/24px 阈值避免临界位置闪动。
- 导航、优势、品牌、车系、车辆、流程、FAQ、地图和评价模块使用适量透明渐变、高光边框、模糊和柔和阴影。移动端降低模糊强度；不支持 backdrop-filter 时保留不透明可读背景。浅色模式使用白色和浅灰表面。
- 轮播每 10 秒切换，淡入淡出 1.8 秒；图片只从固定中心缓慢放大，不左右漂移，不循环来回缩放。保留暂停、键盘、滑动及减少动态效果支持。
- 使用不同的汽车、东京街景、集装箱和远洋运输图片。用户的两张实拍保留在车辆卡片和详情，不再重复铺满各展示区。首屏说明场景图不代表库存或交付记录。
- 两张五星示例卡片已恢复，清楚标注虚构人物/非真实客户反馈；未将虚构内容作为真实评价发布。提供真实客户授权内容后可以替换。

## 新图片来源

1. `dist/assets/automotive-scene.webp`：NØRR FØTOGRAFIE，汽车生活方式场景，不声称在日本拍摄或为公司现货。
   https://unsplash.com/photos/a-silver-sports-car-parked-on-the-side-of-a-road-SA9oLjDyOIo
2. `dist/assets/tokyo-car-scene.webp`：Michael Stevanus Hartono，东京银座汽车街景，不代表公司现货。
   https://unsplash.com/photos/a-city-street-at-night-with-cars-driving-on-it-xeFjLW277sc

上述两张图的页面均标记免费 Unsplash License，许可说明：https://unsplash.com/license 。图片已下载为本地 WebP，不依赖外链加载。原有三张 Pexels 运输图及许可证说明继续保留，见 README。

## 修改文件

- `dist/index.html`：图片分配、主按钮、场景图说明、两张示例卡片、样式与脚本版本。
- `dist/glass-refresh.css`：本轮玻璃表面、大小、深浅模式、移动端及动画样式。
- `dist/hero.css`：去除图片横向移动、统一单向缓慢缩放。
- `dist/hero.js`：轮播与淡出时间、悬浮联系按钮的滚动阈值。
- `dist/assets/automotive-scene.webp`、`dist/assets/tokyo-car-scene.webp`。
- `README.md` 与本说明。

## 验证

通过已有 JavaScript 语法和 DOM 交互检查、两辆车弹窗、5 步流程、6 条 FAQ、10 个语言选项、8 个品牌、全部本地图片/页面锚点、WhatsApp 与 Instagram 入口；新增检查了轮播/暂停、下滑放大/回顶恢复、两张五星卡片与明显的示例披露。

当前会话仍没有可用浏览器，不能把这些 DOM 检查当作截图或真实设备流畅度验收。部署结果以 GitHub Cloudflare Pages 检查为准。

本轮修改前恢复标签：`backup-before-glass-refresh-20261030`（`3bd28d7`）。
