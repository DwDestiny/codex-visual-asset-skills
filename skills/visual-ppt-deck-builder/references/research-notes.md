# 开源 PPT 生成方案调研

## 结论

本 skill 选择“工作流编排 + PptxGenJS helper”的路线。原因很直接：用户要的是可编辑 PPTX，而不是 Markdown 演示页、网页预览，或整页截图式导出。

## 候选方案

### PptxGenJS

- 来源：https://github.com/gitbrent/PptxGenJS
- 定位：用 JavaScript 生成 PowerPoint，支持 Node、浏览器、React/Vite/Electron 等环境。
- 优点：可生成 OOXML `.pptx`，支持文本、形状、图片、图表、表格和模板；本机 Codex runtime 已带 `pptxgenjs`。
- 取舍：适合做确定性 helper；审美、叙事和复杂排版仍交给 agent 先设计。

### OpenAI Presentations skill

- 来源：本机系统 skill `Presentations`。
- 定位：用 artifact-tool presentation JSX 构建高 polish、可渲染复核、可导出 PPTX 的商业 deck。
- 优点：质量门槛高，适合 investor/strategy/analytics 类型。
- 取舍：本 skill 不替代它，而是把“透明视觉素材 + PPTX 生产流程”沉淀成更通用入口。

### Marp

- 来源：https://github.com/marp-team/marp
- 定位：Markdown presentation ecosystem，Marp CLI 可转 HTML、PDF、PPTX 和图片。
- 优点：内容优先、轻量、适合技术分享。
- 取舍：适合从 Markdown 快速出讲稿，不适合作为强视觉、逐页素材编排的主路线。

### Slidev

- 来源：https://github.com/slidevjs/slidev
- 定位：开发者友好的 Markdown slides，支持主题、Vue 组件、Mermaid、图标和导出。
- 优点：互动和开发者演示强。
- 取舍：适合网页演示和代码型 presentation；对普通 PPTX 交付场景，复杂度偏高。

### Presenton

- 来源：https://github.com/presenton/presenton
- 定位：开源 AI presentation generator / API，支持自托管、多模型、自定义模板和 PPTX/PDF 导出。
- 优点：产品化程度高，适合整套服务或 API。
- 取舍：本仓库是 Codex skill，不引入一套服务；可借鉴“模型可替换、模板可控、PPTX/PDF 导出”的产品边界。

## 对本 skill 的调整

- 必须先让用户确认 5 套图片风格候选，再进入逐页生成。
- helper 只处理稳定导出，不承担风格发散。
- 透明素材用 `$transparent-visual-assets` 生产，PPTX 里作为图片层叠加。
- 图表默认用可编辑 PPT 形状或图表对象，复杂插画才用透明 PNG。
- README 应把这个 skill 定位成第三个业务能力，而不是 pet 或单纯图片处理能力。
