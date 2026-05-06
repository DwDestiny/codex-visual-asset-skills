# Codex Visual Asset Skills

<p align="center">
  <a href="#中文">中文</a>
  ·
  <a href="#english">English</a>
</p>

<p align="center">
  <a href="https://github.com/DwDestiny/codex-visual-asset-skills/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
  <img alt="Codex skills" src="https://img.shields.io/badge/Codex-skills-black.svg">
  <img alt="npx skills" src="https://img.shields.io/badge/npx-skills-blue.svg">
</p>

<a id="中文"></a>

## 中文

从 OpenAI 官方 `hatch-pet` 工作流里拆出来并扩展成三段通用视觉素材能力：

- `transparent-visual-assets`：用 Codex 生图生成纯色背景素材，再清理成透明 PNG。
- `sprite-animation-assets`：规划连续帧，把透明帧组合成 GIF 预览和 spritesheet/atlas。
- `visual-ppt-deck-builder`：先确认主题、大纲和 5 套图片风格候选，再用透明素材、图表和排版组合成可编辑 PPTX。

一句话：需要完整 Codex 自定义宠物包时继续用 `hatch-pet`；只想做透明素材、动画素材或视觉型 PPTX 时，用这些更轻。

### 安装

安装全部 skill 到 Codex 全局目录：

```bash
npx skills add DwDestiny/codex-visual-asset-skills --skill '*' -g -a codex -y
```

只安装其中一个：

```bash
npx skills add DwDestiny/codex-visual-asset-skills --skill transparent-visual-assets -g -a codex -y
npx skills add DwDestiny/codex-visual-asset-skills --skill sprite-animation-assets -g -a codex -y
npx skills add DwDestiny/codex-visual-asset-skills --skill visual-ppt-deck-builder -g -a codex -y
```

先查看仓库里有哪些 skill：

```bash
npx skills add DwDestiny/codex-visual-asset-skills --list
```

### 快速使用

```text
Use $transparent-visual-assets to create a transparent PNG cartoon character asset for my website.
```

```text
Use $sprite-animation-assets to turn this character into a waving GIF and transparent spritesheet.
```

```text
Use $visual-ppt-deck-builder to create an editable PPTX deck about AI visual asset production.
```

### 使用场景

只要素材需要叠到网页、PPT、App、海报、视频或游戏界面上，透明背景就很有用。下面这些案例都来自同一套流程：先用 Codex 生图生成纯色底源图，再清成透明 PNG。

| 场景 | 适合做什么 | 示例 |
| --- | --- | --- |
| 网站设计素材 | Landing page、产品官网、博客插画、功能区装饰、空状态插画 | ![website design asset](demos/use-cases/website-design.png) |
| PPT / 汇报图表 | 路演页、数据页、业务复盘、图表旁的视觉解释元素 | ![presentation chart asset](demos/use-cases/presentation-chart.png) |
| App / 产品引导 | Onboarding、权限说明、功能引导、发布说明里的产品插画 | ![product onboarding asset](demos/use-cases/product-onboarding.png) |
| 电商 / 社媒贴纸 | 商品页角标、促销贴纸、社媒封面、小红书/公众号配图元素 | ![ecommerce stickers asset](demos/use-cases/ecommerce-stickers.png) |
| 游戏 / 互动 UI | 小角色、道具、背包图标、按钮素材、轻动画帧素材 | ![game UI assets](demos/use-cases/game-ui-assets.png) |

### Demo 效果

透明素材处理：这几张不是脚本画的占位图，而是先用 Codex 生图模型生成纯色背景源图，再清成透明 PNG。

| Polished Anime | Watercolor | Cyberpunk |
| --- | --- | --- |
| ![polished anime character](demos/transparent-assets/polished-teal.png) | ![watercolor tablet character](demos/transparent-assets/watercolor-tablet.png) | ![cyberpunk avatar character](demos/transparent-assets/cyberpunk-avatar.png) |

连续动画素材：先用 Codex 生图模型生成同一角色的动作条，再拆帧、去背景、剔除破坏尾段连续性的源帧，检查同一只手的动作连续性，最后组合成 GIF 和 atlas。

| GIF Preview | Transparent Atlas |
| --- | --- |
| ![greeting wave gif](demos/sprite-animation-assets/qa/greeting_wave.gif) | ![greeting wave atlas](demos/sprite-animation-assets/greeting-wave-atlas.png) |

逐帧 QA：

![greeting wave contact sheet](demos/sprite-animation-assets/qa/greeting-wave-contact-sheet.png)

PPTX skill demo：`visual-ppt-deck-builder` 会把确认后的 deck spec 组合成可编辑 PowerPoint，示例文件在：

```text
demos/visual-ppt-deck-builder/sample-visual-ppt-deck.pptx
```

本地预览页：

```text
demos/preview/index.html
```

### 三个 skill 分别解决什么

`transparent-visual-assets` 会指导 Codex：

1. 先生成可抠背景的纯色底素材。
2. 避免棋盘格、阴影、地面、文字、光晕和漂浮杂点。
3. 调用脚本移除纯色背景，输出透明 PNG 和报告。

核心脚本：

```bash
python ~/.codex/skills/transparent-visual-assets/scripts/prepare_transparent_asset.py --help
```

`sprite-animation-assets` 会指导 Codex：

1. 先定义状态、帧数、cell 尺寸和循环节奏。
2. 保持同一个角色或物体在每一帧里的身份一致。
3. 调用脚本组合 spritesheet/atlas，并导出 GIF 预览。

核心脚本：

```bash
python ~/.codex/skills/sprite-animation-assets/scripts/compose_sprite_set.py --help
```

`visual-ppt-deck-builder` 会指导 Codex：

1. 先确认主题、大纲、风格、张数和每页内容。
2. 通过 5 套图片候选确认视觉方向。
3. 逐页生成背景、文案、透明素材、图表和排版，并交付可编辑 PPTX。

核心脚本：

```bash
node ~/.codex/skills/visual-ppt-deck-builder/scripts/build_visual_pptx.js --help
node ~/.codex/skills/visual-ppt-deck-builder/scripts/build_style_candidates.js --help
node ~/.codex/skills/visual-ppt-deck-builder/scripts/validate_deck_quality.js --help
node ~/.codex/skills/visual-ppt-deck-builder/scripts/build_deck_preview.js --help
```

### 仓库结构

```text
skills/
  transparent-visual-assets/
    SKILL.md
    scripts/prepare_transparent_asset.py
    references/prompt-and-cleanup.md
  sprite-animation-assets/
    SKILL.md
    scripts/compose_sprite_set.py
    references/sprite-atlas-layouts.md
  visual-ppt-deck-builder/
    SKILL.md
    scripts/build_visual_pptx.js
    scripts/build_style_candidates.js
    scripts/validate_deck_quality.js
    scripts/build_deck_preview.js
    references/deck-spec-schema.md
    references/research-notes.md
demos/
  source-model/
  transparent-assets/
  use-cases/
  sprite-animation-assets/
  visual-ppt-deck-builder/
  preview/
  process_model_demo_assets.py
tests/
  test_asset_scripts.py
```

### 边界

这三个 skill 不替代官方 `hatch-pet`。如果你要的是完整 Codex 自定义宠物包，包括 `pet.json`、完整 8x9 atlas、QA contact sheet、预览视频和 app-ready packaging，继续用 `hatch-pet`。

如果你只需要可复用素材：

- 单张透明 PNG：用 `transparent-visual-assets`
- 连续帧 / GIF / spritesheet：用 `sprite-animation-assets`
- 视觉型 PPTX：用 `visual-ppt-deck-builder`

<p align="right"><a href="#codex-visual-asset-skills">返回顶部</a> · <a href="#english">English</a></p>

---

<a id="english"></a>

## English

Three general visual-asset skills extracted from and extended beyond the reusable asset-production parts of OpenAI's official `hatch-pet` workflow:

- `transparent-visual-assets` — generate a flat-background image with Codex, then clean it into a transparent PNG.
- `sprite-animation-assets` — plan continuous frames and package transparent frames into GIF previews and spritesheet atlases.
- `visual-ppt-deck-builder` — confirm the topic, outline, five image-based style candidates, slide plan, visual assets, layout, and export an editable PPTX.

In short: use `hatch-pet` when you need a complete Codex custom pet package; use these smaller skills when you need transparent assets, animation assets, or visual PPTX decks.

### Install

Install all three skills globally for Codex:

```bash
npx skills add DwDestiny/codex-visual-asset-skills --skill '*' -g -a codex -y
```

Install only one:

```bash
npx skills add DwDestiny/codex-visual-asset-skills --skill transparent-visual-assets -g -a codex -y
npx skills add DwDestiny/codex-visual-asset-skills --skill sprite-animation-assets -g -a codex -y
npx skills add DwDestiny/codex-visual-asset-skills --skill visual-ppt-deck-builder -g -a codex -y
```

List available skills before installing:

```bash
npx skills add DwDestiny/codex-visual-asset-skills --list
```

### Quick Use

```text
Use $transparent-visual-assets to create a transparent PNG cartoon character asset for my website.
```

```text
Use $sprite-animation-assets to turn this character into a waving GIF and transparent spritesheet.
```

```text
Use $visual-ppt-deck-builder to create an editable PPTX deck about AI visual asset production.
```

### Use Cases

Transparent assets are useful anywhere a visual needs to be layered over a website, slide deck, app screen, poster, video, or game UI. The examples below use the same workflow: generate a flat-background source image with Codex, then clean it into a transparent PNG.

| Scenario | Useful for | Example |
| --- | --- | --- |
| Website design assets | Landing pages, product sites, blog illustrations, feature sections, empty states | ![website design asset](demos/use-cases/website-design.png) |
| Slides and report charts | Pitch decks, analytics pages, business reviews, visual chart explainers | ![presentation chart asset](demos/use-cases/presentation-chart.png) |
| App and product onboarding | Onboarding, permission explainers, feature tours, release-note visuals | ![product onboarding asset](demos/use-cases/product-onboarding.png) |
| Ecommerce and social stickers | Product-page badges, promo stickers, social covers, newsletter graphics | ![ecommerce stickers asset](demos/use-cases/ecommerce-stickers.png) |
| Game and interactive UI | Small characters, inventory items, button assets, light animation frame material | ![game UI assets](demos/use-cases/game-ui-assets.png) |

### Demo

Transparent assets: these are not script-drawn placeholders. They start as Codex model-generated source images on flat removable backgrounds, then get cleaned into alpha PNGs.

| Polished Anime | Watercolor | Cyberpunk |
| --- | --- | --- |
| ![polished anime character](demos/transparent-assets/polished-teal.png) | ![watercolor tablet character](demos/transparent-assets/watercolor-tablet.png) | ![cyberpunk avatar character](demos/transparent-assets/cyberpunk-avatar.png) |

Animation sprite set: generate a continuous action strip with Codex, split it into frames, remove the background, drop any source frame that breaks tail continuity, check same-hand motion, then package it into a GIF preview and atlas.

| GIF Preview | Transparent Atlas |
| --- | --- |
| ![greeting wave gif](demos/sprite-animation-assets/qa/greeting_wave.gif) | ![greeting wave atlas](demos/sprite-animation-assets/greeting-wave-atlas.png) |

Frame-by-frame QA:

![greeting wave contact sheet](demos/sprite-animation-assets/qa/greeting-wave-contact-sheet.png)

PPTX skill demo: `visual-ppt-deck-builder` turns a confirmed deck spec into an editable PowerPoint file:

```text
demos/visual-ppt-deck-builder/sample-visual-ppt-deck.pptx
```

Local preview page:

```text
demos/preview/index.html
```

### What They Do

`transparent-visual-assets` helps Codex:

1. Generate a source image on a removable flat background.
2. Avoid checkerboards, shadows, floor planes, text, glow, and detached particles.
3. Remove the flat background and write a transparent PNG plus a cleanup report.

Core script:

```bash
python ~/.codex/skills/transparent-visual-assets/scripts/prepare_transparent_asset.py --help
```

`sprite-animation-assets` helps Codex:

1. Define states, frame counts, cell sizes, and loop timing.
2. Keep the same subject identity across every frame.
3. Compose a transparent spritesheet/atlas and optional GIF previews.

Core script:

```bash
python ~/.codex/skills/sprite-animation-assets/scripts/compose_sprite_set.py --help
```

`visual-ppt-deck-builder` helps Codex:

1. Confirm topic, outline, style, slide count, and per-slide content.
2. Use five image-based candidates to lock the visual direction.
3. Generate backgrounds, copy, transparent assets, charts, and layouts, then deliver an editable PPTX.

Core script:

```bash
node ~/.codex/skills/visual-ppt-deck-builder/scripts/build_visual_pptx.js --help
node ~/.codex/skills/visual-ppt-deck-builder/scripts/build_style_candidates.js --help
node ~/.codex/skills/visual-ppt-deck-builder/scripts/validate_deck_quality.js --help
node ~/.codex/skills/visual-ppt-deck-builder/scripts/build_deck_preview.js --help
```

### Repository Layout

```text
skills/
  transparent-visual-assets/
    SKILL.md
    scripts/prepare_transparent_asset.py
    references/prompt-and-cleanup.md
  sprite-animation-assets/
    SKILL.md
    scripts/compose_sprite_set.py
    references/sprite-atlas-layouts.md
  visual-ppt-deck-builder/
    SKILL.md
    scripts/build_visual_pptx.js
    scripts/build_style_candidates.js
    scripts/validate_deck_quality.js
    scripts/build_deck_preview.js
    references/deck-spec-schema.md
    references/research-notes.md
demos/
  source-model/
  transparent-assets/
  use-cases/
  sprite-animation-assets/
  visual-ppt-deck-builder/
  preview/
  process_model_demo_assets.py
tests/
  test_asset_scripts.py
```

### Boundary

These skills do not replace the official `hatch-pet` skill. Use `hatch-pet` when you need a full Codex custom pet package with `pet.json`, a full 8x9 atlas, QA contact sheets, preview videos, and app-ready packaging.

Use these skills for reusable material steps:

- Single transparent PNG: `transparent-visual-assets`
- Frames / GIF / spritesheet: `sprite-animation-assets`
- Visual PPTX deck: `visual-ppt-deck-builder`

<p align="right"><a href="#codex-visual-asset-skills">Back to top</a> · <a href="#中文">中文</a></p>
