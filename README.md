# Codex Pet Asset Skills

<p align="center">
  <a href="#中文">中文</a>
  ·
  <a href="#english">English</a>
</p>

<p align="center">
  <a href="https://github.com/DwDestiny/codex-pet-asset-skills/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
  <img alt="Codex skills" src="https://img.shields.io/badge/Codex-skills-black.svg">
  <img alt="npx skills" src="https://img.shields.io/badge/npx-skills-blue.svg">
</p>

<a id="中文"></a>

## 中文

从 OpenAI 官方 `hatch-pet` 工作流里拆出来的两个小 skill：

- `transparent-asset-generation`：用 Codex 生图生成纯色背景素材，再清理成透明 PNG。
- `animation-sprite-set`：规划连续帧，把透明帧组合成 GIF 预览和 spritesheet/atlas。

一句话：需要完整 Codex 宠物包时继续用 `hatch-pet`；只想做透明素材或动画素材时，用这两个更轻。

### 安装

安装两个 skill 到 Codex 全局目录：

```bash
npx skills add DwDestiny/codex-pet-asset-skills --skill '*' -g -a codex -y
```

只安装其中一个：

```bash
npx skills add DwDestiny/codex-pet-asset-skills --skill transparent-asset-generation -g -a codex -y
npx skills add DwDestiny/codex-pet-asset-skills --skill animation-sprite-set -g -a codex -y
```

先查看仓库里有哪些 skill：

```bash
npx skills add DwDestiny/codex-pet-asset-skills --list
```

### 快速使用

```text
Use $transparent-asset-generation to create a transparent PNG cartoon character asset for my website.
```

```text
Use $animation-sprite-set to turn this character into a waving GIF and transparent spritesheet.
```

### Demo 效果

透明素材处理：先生成纯色背景源图，再清成透明 PNG。

| Line Art | Pixel | Neon | Watercolor |
| --- | --- | --- | --- |
| ![line art designer](demos/transparent-assets/line-art-designer.png) | ![pixel heroine](demos/transparent-assets/pixel-heroine.png) | ![neon developer](demos/transparent-assets/neon-developer.png) | ![watercolor muse](demos/transparent-assets/watercolor-muse.png) |

连续动画素材：透明帧组合成 GIF 和 atlas。

| GIF Preview | Transparent Atlas |
| --- | --- |
| ![waving gif](demos/animation-sprite-set/qa/waving.gif) | ![waving atlas](demos/animation-sprite-set/waving-atlas.png) |

本地预览页：

```text
demos/preview/index.html
```

### 两个 skill 分别解决什么

`transparent-asset-generation` 会指导 Codex：

1. 先生成可抠背景的纯色底素材。
2. 避免棋盘格、阴影、地面、文字、光晕和漂浮杂点。
3. 调用脚本移除纯色背景，输出透明 PNG 和报告。

核心脚本：

```bash
python ~/.codex/skills/transparent-asset-generation/scripts/prepare_transparent_asset.py --help
```

`animation-sprite-set` 会指导 Codex：

1. 先定义状态、帧数、cell 尺寸和循环节奏。
2. 保持同一个角色或物体在每一帧里的身份一致。
3. 调用脚本组合 spritesheet/atlas，并导出 GIF 预览。

核心脚本：

```bash
python ~/.codex/skills/animation-sprite-set/scripts/compose_sprite_set.py --help
```

### 仓库结构

```text
skills/
  transparent-asset-generation/
    SKILL.md
    scripts/prepare_transparent_asset.py
    references/prompt-and-cleanup.md
  animation-sprite-set/
    SKILL.md
    scripts/compose_sprite_set.py
    references/codex-pet-rows.md
demos/
  transparent-assets/
  animation-sprite-set/
  preview/
tests/
  test_asset_scripts.py
```

### 边界

这两个 skill 不替代官方 `hatch-pet`。如果你要的是完整 Codex 自定义宠物包，包括 `pet.json`、完整 8x9 atlas、QA contact sheet、预览视频和 app-ready packaging，继续用 `hatch-pet`。

如果你只需要可复用素材：

- 单张透明 PNG：用 `transparent-asset-generation`
- 连续帧 / GIF / spritesheet：用 `animation-sprite-set`

<p align="right"><a href="#codex-pet-asset-skills">返回顶部</a> · <a href="#english">English</a></p>

---

<a id="english"></a>

## English

Two small skills extracted from the reusable asset-production parts of OpenAI's official `hatch-pet` workflow:

- `transparent-asset-generation` — generate a flat-background image with Codex, then clean it into a transparent PNG.
- `animation-sprite-set` — plan continuous frames and package transparent frames into GIF previews and spritesheet atlases.

In short: use `hatch-pet` when you need a complete Codex custom pet package; use these smaller skills when you only need transparent assets or animation assets.

### Install

Install both skills globally for Codex:

```bash
npx skills add DwDestiny/codex-pet-asset-skills --skill '*' -g -a codex -y
```

Install only one:

```bash
npx skills add DwDestiny/codex-pet-asset-skills --skill transparent-asset-generation -g -a codex -y
npx skills add DwDestiny/codex-pet-asset-skills --skill animation-sprite-set -g -a codex -y
```

List available skills before installing:

```bash
npx skills add DwDestiny/codex-pet-asset-skills --list
```

### Quick Use

```text
Use $transparent-asset-generation to create a transparent PNG cartoon character asset for my website.
```

```text
Use $animation-sprite-set to turn this character into a waving GIF and transparent spritesheet.
```

### Demo

Transparent assets: generate on a flat removable background, then clean into alpha PNGs.

| Line Art | Pixel | Neon | Watercolor |
| --- | --- | --- | --- |
| ![line art designer](demos/transparent-assets/line-art-designer.png) | ![pixel heroine](demos/transparent-assets/pixel-heroine.png) | ![neon developer](demos/transparent-assets/neon-developer.png) | ![watercolor muse](demos/transparent-assets/watercolor-muse.png) |

Animation sprite set: package transparent frames into a GIF preview and atlas.

| GIF Preview | Transparent Atlas |
| --- | --- |
| ![waving gif](demos/animation-sprite-set/qa/waving.gif) | ![waving atlas](demos/animation-sprite-set/waving-atlas.png) |

Local preview page:

```text
demos/preview/index.html
```

### What They Do

`transparent-asset-generation` helps Codex:

1. Generate a source image on a removable flat background.
2. Avoid checkerboards, shadows, floor planes, text, glow, and detached particles.
3. Remove the flat background and write a transparent PNG plus a cleanup report.

Core script:

```bash
python ~/.codex/skills/transparent-asset-generation/scripts/prepare_transparent_asset.py --help
```

`animation-sprite-set` helps Codex:

1. Define states, frame counts, cell sizes, and loop timing.
2. Keep the same subject identity across every frame.
3. Compose a transparent spritesheet/atlas and optional GIF previews.

Core script:

```bash
python ~/.codex/skills/animation-sprite-set/scripts/compose_sprite_set.py --help
```

### Repository Layout

```text
skills/
  transparent-asset-generation/
    SKILL.md
    scripts/prepare_transparent_asset.py
    references/prompt-and-cleanup.md
  animation-sprite-set/
    SKILL.md
    scripts/compose_sprite_set.py
    references/codex-pet-rows.md
demos/
  transparent-assets/
  animation-sprite-set/
  preview/
tests/
  test_asset_scripts.py
```

### Boundary

These skills do not replace the official `hatch-pet` skill. Use `hatch-pet` when you need a full Codex custom pet package with `pet.json`, a full 8x9 atlas, QA contact sheets, preview videos, and app-ready packaging.

Use these skills for reusable material steps:

- Single transparent PNG: `transparent-asset-generation`
- Frames / GIF / spritesheet: `animation-sprite-set`

<p align="right"><a href="#codex-pet-asset-skills">Back to top</a> · <a href="#中文">中文</a></p>
