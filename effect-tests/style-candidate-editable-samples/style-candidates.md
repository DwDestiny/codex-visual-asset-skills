# PPT 风格候选真实样板包

主题：2026 AI 应用趋势调研

硬规则：每个候选必须先生成真实 PPTX 样板，再从 PPTX 导出 PNG 预览。PNG 预览只用于选择风格；真正可复用的是 PPTX 样板、背景素材、透明素材和分层契约。标题、正文、指标、图表标签必须文本可编辑，不允许把正式页面整页生图后交给用户选。

使用方式：

1. 先查看 `samples/style-sample-*.pptx`，确认文字、指标和图表标签能在 PowerPoint 中直接编辑。
2. 再查看 `previews/style-sample-*.png`，让用户从 5 张单独预览里选择风格。
3. 如需提高画面质感，按 `prompts/background-*.md` 生成无文字背景图，保存到 `assets/background-*.png` 后重新运行本工具。
4. 被选中的方向进入逐页 PPT 生产，沿用同一套 PPT 分层结构，而不是重新临摹一张整页图片。

## 简约高级

- PPTX 样板：`samples/style-sample-minimal-premium.pptx`
- PNG 预览：`previews/style-sample-minimal-premium.png`
- 背景提示词：`prompts/background-minimal-premium.md`
- 背景素材：`assets/background-minimal-premium.png`
- 适合场景：商业计划书、融资路演、咨询汇报
- 视觉方向：大量留白、黑白灰秩序、真实建筑线条和克制的商业咨询气质，适合严肃决策场景。
- 透明素材：黑白线框图标组、半透明建筑结构装饰、咨询卡片角标
- 可编辑层：封面主标题、英文副标题、章节标题、数据标签、图表坐标和注释
- 样本标题：2026 AI 应用趋势调研
- 样本正文：AI 应用正在从工具采购转向流程重构，真正的价值来自业务场景、数据闭环和组织协同。
- 分层契约：标题、副标题、正文、要点、指标数字、指标标签和图表标签必须作为 PPT 文本对象生成，用户能在 PowerPoint 中直接改。

## 活泼动漫

- PPTX 样板：`samples/style-sample-playful-anime.pptx`
- PNG 预览：`previews/style-sample-playful-anime.png`
- 背景提示词：`prompts/background-playful-anime.md`
- 背景素材：`assets/background-playful-anime.png`
- 适合场景：教育课程、儿童产品、社群活动
- 视觉方向：明亮色彩、圆润结构、可爱角色和轻松课堂氛围，适合学习、活动和年轻用户表达。
- 透明素材：可爱学生角色、课程徽章贴纸、星星和学习道具装饰
- 可编辑层：课程标题、目标卡片文字、按钮标签、步骤编号、图表解释文字
- 样本标题：2026 AI 应用趋势调研
- 样本正文：用轻量案例解释 AI 应用趋势，让非技术团队也能判断哪些场景值得优先试点。
- 分层契约：标题、副标题、正文、要点、指标数字、指标标签和图表标签必须作为 PPT 文本对象生成，用户能在 PowerPoint 中直接改。

## 数据分析

- PPTX 样板：`samples/style-sample-data-analytics.pptx`
- PNG 预览：`previews/style-sample-data-analytics.png`
- 背景提示词：`prompts/background-data-analytics.md`
- 背景素材：`assets/background-data-analytics.png`
- 适合场景：经营复盘、增长分析、行业报告
- 视觉方向：深色科技背景、高信息密度仪表盘、蓝色发光图表和清晰 KPI 层级，适合数据驱动叙事。
- 透明素材：发光图表装饰、KPI 卡片边框、数据节点和连线元素
- 可编辑层：报告标题、KPI 数字、图表标题、坐标轴标签、来源说明
- 样本标题：2026 AI 应用趋势调研
- 样本正文：企业采用 AI 的竞争点，正从模型能力转向数据资产、流程嵌入和投入产出监控。
- 分层契约：标题、副标题、正文、要点、指标数字、指标标签和图表标签必须作为 PPT 文本对象生成，用户能在 PowerPoint 中直接改。

## 国潮东方

- PPTX 样板：`samples/style-sample-oriental-heritage.pptx`
- PNG 预览：`previews/style-sample-oriental-heritage.png`
- 背景提示词：`prompts/background-oriental-heritage.md`
- 背景素材：`assets/background-oriental-heritage.png`
- 适合场景：品牌介绍、文化项目、消费品提案
- 视觉方向：宣纸质感、朱红墨黑、山水留白和当代表达，适合东方文化、品牌和消费品提案。
- 透明素材：水墨山石装饰、朱红印章元素、梅枝或器物剪影
- 可编辑层：品牌标题、理念卡片文字、章节题签、说明正文、页脚日期
- 样本标题：2026 AI 应用趋势调研
- 样本正文：新技术落地不是一阵风，而是从器、术、法到组织文化的一次长期演进。
- 分层契约：标题、副标题、正文、要点、指标数字、指标标签和图表标签必须作为 PPT 文本对象生成，用户能在 PowerPoint 中直接改。

## 未来科技

- PPTX 样板：`samples/style-sample-future-tech.pptx`
- PNG 预览：`previews/style-sample-future-tech.png`
- 背景提示词：`prompts/background-future-tech.md`
- 背景素材：`assets/background-future-tech.png`
- 适合场景：AI 发布会、科技产品、创新方案
- 视觉方向：深色空间、蓝绿霓虹、芯片平台和玻璃拟态卡片，适合 AI 产品发布和未来科技叙事。
- 透明素材：玻璃拟态产品卡片、芯片和光效装饰、科技图标组
- 可编辑层：发布会标题、产品卖点、功能卡片文字、时间地点、图表标签
- 样本标题：2026 AI 应用趋势调研
- 样本正文：下一代 AI 应用将围绕多模态输入、智能执行、可信审计和生态连接展开。
- 分层契约：标题、副标题、正文、要点、指标数字、指标标签和图表标签必须作为 PPT 文本对象生成，用户能在 PowerPoint 中直接改。

