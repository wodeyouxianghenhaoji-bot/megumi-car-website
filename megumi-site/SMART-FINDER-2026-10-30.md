# 智能找车悬浮面板 · 2026-10-30

## 范围及位置

按用户确认，新面板只放在电脑端右上角悬浮 WhatsApp / Instagram 按钮下方，随原按钮停留在屏幕内。原顶栏进入悬浮状态时显示，返回顶端恢复原顶栏时隐藏。三个入口默认收起，任意一种方式可独立咨询；额外提供缩小面板、重新选择、返回品牌和直接联系入口。

仅在 `dist/index.html` 增加新模块的样式/脚本引用与一个空 aside 容器。删除这两处注入后，HTML 与修改前内容完全相同。原有 CSS、JavaScript、配置、导航、Logo、车辆、动画、语言菜单、公司信息和部署配置均未修改。

## 功能

- **品牌**：20 个品牌；大屏每行 5 个，小屏每行 3 个。默认普通英文品牌文字卡片，未绘制、生成、模仿或下载任何未经确认授权的品牌 Logo。
- **车系**：按用户附件录入 460 个车系名称，包含停产/新旧名称；初始显示前 8 项，可查看全部、搜索，或输入其他车型。该清单是客户请求目录，不是车辆库存或保证能找到的车型。
- **类型**：SUV、Sedan、MPV、Hatchback、Coupe、Pickup、Van，选中即可咨询，也可补选品牌。
- **预算**：USD 5,000～200,000；默认 30,000，滑块每步 1,000；提供 5,000、10,000、25,000、50,000、100,000、200,000 快捷值。明确为最高车辆采购预算，不含国际运费/进口税。不搜索或伪造库存。
- **WhatsApp**：从原 `SITE_CONFIG.whatsapp` 读取用户提供的真实地址，仍为 `https://wa.me/819044600378`。选择会编码进预填消息，在新窗口打开，由客户确认发送；网站不发送消息、不保存客户选车内容。
- **排版**：黑色玻璃表面、平滑收放、明确选中状态、可滚动内容区、手机宽度限制、屏幕变小时降低占用。减少动态效果、键盘/屏幕阅读器、Escape 收起均有支持。

## 语言

新增面板有中文、英语、阿拉伯语、荷兰语、法语、德语、意大利语、葡萄牙语、俄语、西班牙语全部 10 份文案，含预算说明、搜索、按钮及 WhatsApp 消息。阿拉伯语只对本面板设置 RTL，不修改原页面的方向。

初次访问按 `navigator.languages` 顺序匹配，全部不支持时用英文；优先读取原手动语言偏好 `megumi-preferred-language`。监听顶部已有 `data-lang` 选项及跨标签页偏好更新，切换时保留本面板选车状态。

**现有页面实际仍是中文版本，其他语言菜单会显示“准备中”。本轮没有改写原语言系统，也没有声称原整页已完成自动识别/外语翻译。自动识别与完整翻译仅作用于新找车面板。**

## 文件与维护

- `dist/finder-data.json`：20 品牌及车系数据；添加车系只需编辑对应 `models` 数组。
- `dist/finder-i18n.js`：10 语种完整模块文案。
- `dist/smart-finder.js`：独立组件逻辑、选择状态、浏览器语言匹配、WhatsApp 消息及悬浮定位。
- `dist/smart-finder.css`：全部选择器限定于 `#smart-finder`，不修改其他区块。
- `dist/index.html`：仅新增资源引用与 aside 容器。
- 本说明：设计、范围、素材核实与验证记录。

没有数据库、付费 API、第三方图片热链接、新后台或新的部署配置。20 品牌名与车型名称只用于客户提出寻车需求，不表示官方授权关系。

## Logo 来源与授权核查

本轮查询厂商/官方媒体资源与使用条款。未获得明确可用于 MEGUMI 商业找车界面的 Logo 使用许可，因此按用户允许的降级方案，**20 个品牌全部显示普通英文名称**。不得把品牌官网下载、媒体用途或示例图误当作商用授权。数据中的 `logo` 目前全部为 `null`；将来取得许可后再单独接入官方原文件，不得重绘。

| 品牌 | 官方核查入口 | 本轮处理 |
|---|---|---|
| Toyota | https://global.toyota/en/terms-of-use/ ; https://brand.toyota.com/guidelines/visual/logos | 条款限制 Logo 复制等；文字展示 |
| Lexus | https://pressroom.toyota.com/album/logos/ ; https://global.toyota/en/terms-of-use/ | 有官方素材但未确认本网站商用授权；文字展示 |
| Honda | https://www.honda.com/terms-and-conditions | 未取得本网站 Logo 使用许可；文字展示 |
| Nissan | https://usa.nissannews.com/en-US/usa-legal-notices-and-terms | 媒体素材限编辑用途等；文字展示 |
| Mazda | https://newsroom.mazda.com/en/ ; https://www.mazda.com/en/faq/ | 媒体素材限编辑用途等；文字展示 |
| Subaru | https://www.subaru.co.jp/en/license/ | 官方说明需相关许可；文字展示 |
| Suzuki | https://www.globalsuzuki.com/foruse/ | Logo 等权利保留；未取得本网站许可；文字展示 |
| Mitsubishi | https://www.mitsubishi-motors.com/en/usage/ | 未取得本网站 Logo 使用许可；文字展示 |
| Daihatsu | https://www.daihatsu.com/copyright.html | 未取得本网站 Logo 使用许可；文字展示 |
| Mercedes-Benz | https://pressmaterial.mercedes-benz.com/legal-details | 标志等商标受保护，未取得本网站许可；文字展示 |
| BMW | https://www.presstopic.bmwgroup.com/en/sustainability-dialogues/legalInformation.html | 未取得本网站 Logo 使用许可；文字展示 |
| Audi | https://www.audi-mediacenter.com/ | 媒体门户不能作为本网站商用授权；条款链接未能读取；文字展示 |
| Porsche | https://newsroom.porsche.com/en_US/legal-notice.html | 使用受限制，未取得本网站许可；文字展示 |
| Volkswagen | https://www.volkswagen-newsroom.com/en/terms-of-service-35 ; https://www.vw.com/en/website-terms.html | 网站开放不授予标志使用许可；文字展示 |
| Land Rover | https://www.landroverusa.com/terms-and-conditions.html | 未取得本网站 Logo 使用许可；文字展示 |
| Jeep | https://www.jeep-japan.com/terms.html | 无授权转载受限制；文字展示 |
| Volvo | https://www.volvocars.com/en-al/legal/terms/terms-legal-notice/ | 未取得本网站 Logo 使用许可；文字展示 |
| MINI | https://www.mini.de/de_DE/home/footer/rechtlicher-hinweis.html | 商标权利保留，未取得本网站许可；文字展示 |
| Ferrari | https://www.ferrari.com/en-EN/legal | 官方站要求浏览器验证，未确认许可；文字展示 |
| Tesla | https://www.tesla.com/legal/additional-resources | 内容受版权/知识产权保护，未取得本网站许可；文字展示 |

交互参考：https://www.apple.com/shop/buy-iphone 。仅参考简洁选项、分层展开、清晰选中和直接咨询，没有复制苹果素材。

用户附件中的“已核对”表述没有当作本轮的独立核验结果。车系清单直接作为用户指定的初始数据使用，不声称覆盖全部历史车型，也不声称每款均能在日本找到。

## 验证

通过 DOM/逻辑测试：20 品牌逐一进入/返回并选择末位车系，460 个数据项计数，搜索/其他车系与特殊字符编码，7 类车型直接咨询及选品牌，预算实时值/快捷值/上下限，10 语言键完整性/文案/消息，阿拉伯语 RTL，浏览器多偏好回退与手动偏好优先，重置/缩小/Escape，悬浮显示隐藏及手机窄屏定位。

原站回归检查通过：2 车辆详情、8 品牌原区块、5 步流程、6 FAQ、10 原语言选项、地图地址切换、原联系按钮、轮播暂停、首屏/悬浮按钮逻辑、所有本地资源与锚点。

当前无可用浏览器，不能把 DOM/定位测试描述成真实手机、截图或动画视觉验收。页面与脚本继续是原 Cloudflare Pages 静态发布方式；发布状态以 GitHub 的 Cloudflare Pages 检查为准。

修改前恢复标签：`backup-before-smart-finder-20261030`（`11c6ce9`）。
