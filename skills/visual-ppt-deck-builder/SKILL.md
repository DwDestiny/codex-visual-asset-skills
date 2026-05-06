---
name: visual-ppt-deck-builder
description: Build editable PPTX decks from a confirmed topic, outline, visual style, slide plan, generated backgrounds, copy, transparent visual assets, charts, and layouts. Use when the user asks to create a PowerPoint/PPT/PPTX deck, proposal, course deck, report deck, pitch deck, or slide presentation with AI-generated visuals and transparent-background assets.
---

# Visual PPT Deck Builder

## 核心判断

这个 skill 不是“把 Markdown 转成 PPT”。它负责把主题变成可交付的 PPTX：先定故事，再定风格，再逐页生成背景、文案、透明素材、图表和排版。最终交付必须是可编辑 `.pptx`，不能只交一组截图。

需要高 polish 的商业分析、投资人、经营复盘、战略叙事 deck 时，优先配合系统 `Presentations` skill；本 skill 负责更通用的“AI 视觉素材 + PPTX 编排”流程。

## 强制工作流

1. **确认主题**：主题、受众、使用场景、语气、是否有品牌或参考资料。
2. **确认大纲**：先给出章节和叙事顺序，不直接开做页面。
3. **确认风格**：结合用户偏好和主题，用 Codex 生图生成 5 张独立 PNG 风格候选图，一张图只代表一种风格。不要把 5 个风格塞进一张总览图给用户选。
4. **确认张数和每页内容**：输出 slide plan，逐页写清标题、核心信息、证明对象、需要生成的背景/透明素材/图表。
5. **逐张生成**：按确认后的风格逐页生成背景、文案、透明 PNG 素材、图表和页面布局。
6. **组合 PPTX**：优先使用可编辑文本、形状、图表和图片层。只有背景大图可以是 raster；正文、图表、关键标签不要糊成整页图。
7. **硬门禁验收**：先跑 deck spec 质量检查，再生成整套 SVG 预览图；未通过前不要交付。
8. **交付**：检查 PPTX 能打开、页数正确、媒体资源存在、文字不溢出、透明素材叠加正常。

## 风格候选要求

5 套候选图必须是真实图片形式，不要只列文字风格名，也不要用 SVG、HTML、CSS、Canvas 或 PPT 形状拼一张假图冒充生图。建议候选覆盖不同方向：

- 业务冷静型：适合经营复盘、战略汇报、董事会。
- 编辑杂志型：适合课程、品牌故事、公开演讲。
- 产品演示型：适合 App、SaaS、工具发布。
- 数据图表型：适合行业报告、趋势分析、投融资。
- 视觉叙事型：适合 AI 通识课、故事化培训、创意提案。

候选图通过后，把被选中的方向固化为 `visual_style`：色板、字体气质、背景策略、图表语言、透明素材策略、禁用元素。

如果当前环境无法直接保存 Codex 生图候选，先运行工具生成 5 套生图提示包和图层契约，再逐张调用 Codex 生图能力生成 PNG：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/visual-ppt-deck-builder/scripts/build_style_candidates.js" \
  --output-dir /absolute/path/style-candidates \
  --topic "<deck topic>"
```

工具会生成：

- `style-candidate-spec.json`：5 个风格候选、PNG 样张路径、透明素材策略和 PPT 图层契约。
- `style-candidates.md`：执行说明和用户确认清单。
- `prompts/style-sample-*.md`：逐张交给 Codex 生图的提示词。

这一步只生成提示包，不生成视觉假图。真正给用户看的必须是 5 张独立 PNG：`style-sample-minimal-premium.png`、`style-sample-playful-anime.png`、`style-sample-data-analytics.png`、`style-sample-oriental-heritage.png`、`style-sample-future-tech.png`。

风格样张可以展示封面气质、内容页节奏、图表语言和透明素材使用方式，但不要把最终可读正文、图表数字或关键标题烤进图片里。最终 PPT 中这些内容必须用可编辑文本、形状或图表层实现。

## 透明素材策略

需要透明背景素材时调用 `$transparent-visual-assets`：

- 人物、物体、图标、贴纸、图表装饰、流程节点、产品插画优先做透明 PNG。
- 背景可以单独生成，但不要把整页正文和图表烤进背景图。
- 图表如果要用户可编辑，优先用 PPT 原生形状或脚本绘制；如果是复杂示意插画，再用透明 PNG。

## PPTX 生成方式

有两条路线：

- **高端 deck 路线**：调用系统 `Presentations` skill，用 artifact-tool presentation JSX 构建、渲染、复核、导出 PPTX。
- **通用确定性路线**：使用本 skill 的 `scripts/build_visual_pptx.js`，从 JSON deck spec 生成可编辑 PPTX。

运行 helper：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/visual-ppt-deck-builder/scripts/build_visual_pptx.js" \
  --spec /absolute/path/deck_spec.json \
  --output /absolute/path/final_deck.pptx
```

如果在 Codex bundled runtime 里执行，优先使用：

```bash
/Users/dw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  "${CODEX_HOME:-$HOME/.codex}/skills/visual-ppt-deck-builder/scripts/build_visual_pptx.js" \
  --spec /absolute/path/deck_spec.json \
  --output /absolute/path/final_deck.pptx
```

Deck spec 写法见 `references/deck-spec-schema.md`。

商用 deck 交付前必须跑质量门禁：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/visual-ppt-deck-builder/scripts/validate_deck_quality.js" \
  --spec /absolute/path/deck_spec.json \
  --report /absolute/path/qa_report.json
```

同时生成可扫视的整套页面预览：

```bash
node "${CODEX_HOME:-$HOME/.codex}/skills/visual-ppt-deck-builder/scripts/build_deck_preview.js" \
  --spec /absolute/path/deck_spec.json \
  --output-dir /absolute/path/preview
```

预览目录会包含逐页 `slide-01.svg` 和 `contact-sheet.svg`。它不是最终 PPT 渲染，但能快速发现页型重复、空洞页面、模板词、缺来源和信息密度问题。

## 验收标准

- 用户已确认主题、大纲、风格、张数和每页内容。
- 有 5 套图片风格候选，且最终风格被明确选中。
- 商用 deck 至少 6 页，至少 5 种 layout；必须覆盖结论页、架构/路线页、指标/图表页、对比页、风险与下一步页。
- 除标题/章节/收尾页外，每页必须有 `claim`，也就是这一页真正想证明的一句话。
- PPTX 页数与 slide plan 一致。
- 标题、正文、图表标签是可编辑对象，不能全页截图化。
- 透明素材边缘干净，叠在深色、浅色背景上都能读清。
- 图表有明确口径；没有来源的数据不能伪装成事实。
- 不允许残留 `Topic`、`Style`、`Assets`、`TODO`、`TBD`、`占位` 这类模板词。
- 最终交付 `.pptx`，同时保留生成用的 deck spec、透明素材和关键源图。

## 需要时读取

- `references/research-notes.md`：开源 PPT 生成方案调研和取舍。
- `references/deck-spec-schema.md`：helper 支持的 JSON spec 格式。
