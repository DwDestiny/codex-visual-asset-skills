# Real Image Style Candidates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `visual-ppt-deck-builder` 的风格选择阶段从 SVG 假样机改成真实生图工作流：5 个风格各输出一张独立 PNG 候选图，并把最终 PPT 的图片层、透明素材层、可编辑文本/图表层拆清楚。

**Architecture:** `build_style_candidates.js` 不再画 SVG，也不生成一张总览拼图。它只生成风格候选提示包、manifest 和 PPT 图层契约；执行者必须用 Codex 生图能力逐张生成 5 张 PNG 样张，再用透明素材 skill 处理需要独立叠加的视觉元素。PPTX 主生成器继续负责把图片、文本、形状和图表组合成可编辑 deck。

**Tech Stack:** Node.js prompt/spec generator, Python `unittest`, Codex image generation, transparent PNG cleanup, existing Codex skill folder layout.

---

## Scope

### In Scope

- 修改 `skills/visual-ppt-deck-builder/scripts/build_style_candidates.js`。
- 修改 `tests/test_visual_ppt_deck_builder.py`。
- 修改 `skills/visual-ppt-deck-builder/SKILL.md`。
- 修改 `README.md` 中关于 PPT 风格候选的说明。
- 生成新的效果验收包，证明 helper 不再输出 SVG 风格图。

### Out of Scope

- 不重写 `build_visual_pptx.js`。
- 不把整页 PPT 烤成一张图。
- 不用 SVG、HTML、Canvas 或手绘形状冒充 AI 生图风格候选。
- 不新增外部 npm 依赖。

## Target Output Contract

运行：

```bash
node skills/visual-ppt-deck-builder/scripts/build_style_candidates.js \
  --output-dir /tmp/style-candidates \
  --topic "AI 编程工具进入企业研发流程的商业化落地方案"
```

必须创建：

- `/tmp/style-candidates/style-candidate-spec.json`
- `/tmp/style-candidates/style-candidates.md`
- `/tmp/style-candidates/prompts/style-sample-minimal-premium.md`
- `/tmp/style-candidates/prompts/style-sample-playful-anime.md`
- `/tmp/style-candidates/prompts/style-sample-data-analytics.md`
- `/tmp/style-candidates/prompts/style-sample-oriental-heritage.md`
- `/tmp/style-candidates/prompts/style-sample-future-tech.md`

不得创建：

- `style-overview.svg`
- `style-board-*.svg`
- 任意用 SVG 拼出来的风格候选图

每个候选必须定义：

- `slug`
- `name`
- `sample_image_path`，指向一张独立 PNG
- `prompt_file`
- `image_generation_prompt`
- `palette`，正好 5 个颜色
- `best_for`
- `visual_direction`
- `raster_layers`
- `transparent_assets`
- `editable_layers`
- `ppt_layering_contract`

五个候选名称必须是：

- `简约高级`
- `活泼动漫`
- `数据分析`
- `国潮东方`
- `未来科技`

硬约束：

- 5 个风格必须是 5 张独立 PNG，不合成一张大图给用户选。
- 风格样张必须由 Codex 生图生成，不允许用 SVG/HTML/CSS/Canvas 画假图。
- 图片里不能烤入可读正文、图表数字或关键标题；最终 PPT 的文字、图表、标签必须是可编辑对象。
- 透明角色、图标、装饰、产品物件必须走 `transparent-visual-assets` 清理成 PNG 后再叠加。

---

## Task 1: Failing Tests For Real Image Candidate Contract

任务编号：T1
任务目标：先写失败测试，证明旧 helper 仍在输出 SVG 假候选，而不是真实生图提示包和图层契约。
负责人智能体：主控 Codex
协作智能体：无
依赖任务：无
变更文件范围：`tests/test_visual_ppt_deck_builder.py`
TDD 步骤：新增 contract 测试，先运行失败。
验收命令：`python -m unittest tests.test_visual_ppt_deck_builder.visual_ppt_deck_builder_tests.test_style_candidate_helper_writes_real_image_prompt_packet`
验收标准：测试因缺少 `style-candidate-spec.json` 或仍输出 `.svg` 而失败。

### Steps

- [ ] 把旧的 `test_style_candidate_helper_writes_five_visual_boards` 改成 `test_style_candidate_helper_writes_real_image_prompt_packet`。
- [ ] 断言输出目录没有任何 `.svg`。
- [ ] 断言 spec JSON 有 5 个候选，每个候选都指向独立 `.png` 样张和独立 prompt 文件。
- [ ] 断言 markdown 明确包含“不得使用 SVG 拼凑”“Codex 生图”“文本可编辑”。
- [ ] 运行单测并确认红灯。

## Task 2: Implement Prompt Packet Generator

任务编号：T2
任务目标：把 style helper 改成 prompt/spec 生成器，不再生成 SVG 视觉稿。
负责人智能体：DeepSeek 子智能体
协作智能体：主控 Codex
依赖任务：T1
变更文件范围：`skills/visual-ppt-deck-builder/scripts/build_style_candidates.js`
TDD 步骤：在 T1 红灯后实现最小代码让测试通过。
验收命令：`node --check skills/visual-ppt-deck-builder/scripts/build_style_candidates.js && python -m unittest tests.test_visual_ppt_deck_builder.visual_ppt_deck_builder_tests.test_style_candidate_helper_writes_real_image_prompt_packet`
验收标准：生成 spec、markdown、5 个 prompt 文件；没有 SVG 输出；测试绿灯。

### Steps

- [ ] 删除所有 SVG render 函数。
- [ ] 定义 5 个候选对象，保留中文风格名和适用场景。
- [ ] 为每个候选生成一段明确的 Codex 生图提示词，要求输出一张 16:9 PPT 风格样张。
- [ ] 在每个候选里写清 raster 层、透明素材层和可编辑层。
- [ ] 写出 `style-candidate-spec.json`、`style-candidates.md` 和 5 个 prompt 文件。
- [ ] 控制台输出 manifest 摘要，方便执行者定位输出物。

## Task 3: Update Skill And README Contract

任务编号：T3
任务目标：把文档里的 SVG fallback 全部改掉，明确真实生图和可编辑 PPT 图层标准。
负责人智能体：主控 Codex
协作智能体：DeepSeek 审查
依赖任务：T2
变更文件范围：`skills/visual-ppt-deck-builder/SKILL.md`, `README.md`
TDD 步骤：依赖 T1/T2 contract 测试；文档修改后运行全量测试。
验收命令：`python -m unittest discover -s tests`
验收标准：文档没有继续鼓励 SVG 假图；风格候选、最终 PPT 图层和透明素材流程描述一致。

### Steps

- [ ] 删除 `SKILL.md` 里的 SVG fallback 说明。
- [ ] 写清：先生成 5 张独立 PNG 风格候选图，每张一个风格。
- [ ] 写清：最终 PPT 不能整页截图化，正文、图表、标签必须可编辑。
- [ ] 更新 README 的 PPT 使用说明。

## Task 4: Verification And Effect Packet

任务编号：T4
任务目标：生成新的验收包，证明当前能力已从假图方案切到真实生图准备流程。
负责人智能体：主控 Codex
协作智能体：测试智能体
依赖任务：T3
变更文件范围：`effect-tests/style-candidate-prompt-packet/`
TDD 步骤：运行全量测试后生成验收包并检查文件。
验收命令：`node skills/visual-ppt-deck-builder/scripts/build_style_candidates.js --output-dir effect-tests/style-candidate-prompt-packet --topic "AI 编程工具进入企业研发流程的商业化落地方案" && python -m unittest discover -s tests`
验收标准：验收包只有 spec、markdown 和 prompts；没有 SVG 假图；5 个 prompt 可直接交给 Codex 生图生成独立 PNG。

---

## Self-Review

- 覆盖了用户指出的四个核心问题：不使用 SVG 假图、5 个风格分开、视觉元素走生图/透明素材、最终 PPT 文本可编辑。
- 没有把参考图误解为最终要输出的一张总览图。
- 没有扩写 PPTX 主生成器，避免偏离本轮目标。
