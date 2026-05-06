# Deck Spec Schema

`scripts/build_visual_pptx.js` 读取一个 JSON spec，并输出可编辑 `.pptx`。

## 顶层字段

```json
{
  "title": "Deck title",
  "subtitle": "Optional subtitle",
  "author": "Codex",
  "theme": {
    "background": "F7F4EF",
    "foreground": "17202A",
    "accent": "1F8A70",
    "accent_2": "E76F51",
    "muted": "6B7280",
    "panel": "FFFFFF",
    "font_face": "Aptos"
  },
  "slides": []
}
```

颜色用 6 位十六进制，不带 `#` 也可以。

## 支持的 layout

### title

```json
{
  "layout": "title",
  "title": "主标题",
  "subtitle": "副标题",
  "kicker": "Visual deck system"
}
```

### content

```json
{
  "layout": "content",
  "title": "页面标题",
  "body": "一段说明",
  "bullets": ["要点一", "要点二"]
}
```

### image_text

```json
{
  "layout": "image_text",
  "title": "页面标题",
  "body": "一段说明",
  "bullets": ["要点一", "要点二"],
  "image": "/absolute/path/transparent_asset.png"
}
```

`image` 支持绝对路径，也支持相对 spec 文件的相对路径。

### bar_chart

```json
{
  "layout": "bar_chart",
  "title": "页面标题",
  "body": "图表口径说明",
  "chart": {
    "labels": ["网站", "PPT", "App"],
    "values": [42, 68, 55],
    "unit": "%"
  }
}
```

当前 helper 用 PPT 形状绘制条形图，便于用户继续编辑。

### comparison

```json
{
  "layout": "comparison",
  "title": "方案对比",
  "items": [
    {"title": "方案 A", "body": "说明"},
    {"title": "方案 B", "body": "说明"}
  ]
}
```

### timeline

```json
{
  "layout": "timeline",
  "title": "执行节奏",
  "steps": [
    {"label": "1", "body": "确认主题"},
    {"label": "2", "body": "确认风格"}
  ]
}
```

### closing

```json
{
  "layout": "closing",
  "title": "下一步",
  "body": "交付 PPTX"
}
```
