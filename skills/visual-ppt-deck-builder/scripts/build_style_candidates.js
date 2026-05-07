#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

let pptxgen_module;
try {
  pptxgen_module = require("pptxgenjs");
} catch (_error) {
  pptxgen_module = require(
    "/Users/dw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs"
  );
}

const PptxGenJS = pptxgen_module.default || pptxgen_module;
const slide_width = 13.333;
const slide_height = 7.5;

const candidate_templates = [
  {
    slug: "minimal-premium",
    name: "简约高级",
    palette: ["#050505", "#4A4A4A", "#A7A7A7", "#E1E1E1", "#FFFFFF"],
    best_for: ["商业计划书", "融资路演", "咨询汇报"],
    visual_direction: "大量留白、黑白灰秩序、真实建筑线条和克制的商业咨询气质，适合严肃决策场景。",
    raster_layers: ["浅灰建筑摄影感背景", "低对比纸张纹理", "细线空间透视氛围"],
    transparent_assets: ["黑白线框图标组", "半透明建筑结构装饰", "咨询卡片角标"],
    editable_layers: ["封面主标题", "英文副标题", "章节标题", "数据标签", "图表坐标和注释"],
    prompt_seed:
      "premium minimalist business consulting PowerPoint background, elegant grayscale, architectural glass building details, abundant white space, thin black lines, refined corporate presentation mood",
  },
  {
    slug: "playful-anime",
    name: "活泼动漫",
    palette: ["#FFC93C", "#FF9EB5", "#7BDDC8", "#8FD3FF", "#B9B2F8"],
    best_for: ["教育课程", "儿童产品", "社群活动"],
    visual_direction: "明亮色彩、圆润结构、可爱角色和轻松课堂氛围，适合学习、活动和年轻用户表达。",
    raster_layers: ["明亮教室场景背景", "柔和云朵和色块氛围", "课程页浅色纸面纹理"],
    transparent_assets: ["可爱学生角色", "课程徽章贴纸", "星星和学习道具装饰"],
    editable_layers: ["课程标题", "目标卡片文字", "按钮标签", "步骤编号", "图表解释文字"],
    prompt_seed:
      "playful anime education PowerPoint background, cheerful classroom, soft clouds, rounded colorful visual areas, bright yellow pink blue palette, polished illustration quality",
  },
  {
    slug: "data-analytics",
    name: "数据分析",
    palette: ["#020B1D", "#061C3A", "#0B4F86", "#5B5FF0", "#12C7D6"],
    best_for: ["经营复盘", "增长分析", "行业报告"],
    visual_direction: "深色科技背景、高信息密度仪表盘、蓝色发光图表和清晰 KPI 层级，适合数据驱动叙事。",
    raster_layers: ["深蓝网格空间背景", "发光数据柱状图氛围", "暗色仪表盘底图"],
    transparent_assets: ["发光图表装饰", "KPI 卡片边框", "数据节点和连线元素"],
    editable_layers: ["报告标题", "KPI 数字", "图表标题", "坐标轴标签", "来源说明"],
    prompt_seed:
      "data analytics PowerPoint background, dark navy dashboard atmosphere, luminous blue abstract charts without labels, premium enterprise report mood, subtle grid",
  },
  {
    slug: "oriental-heritage",
    name: "国潮东方",
    palette: ["#B91C1C", "#171717", "#E8DCC7", "#F3EADB", "#FAF8F2"],
    best_for: ["品牌介绍", "文化项目", "消费品提案"],
    visual_direction: "宣纸质感、朱红墨黑、山水留白和当代表达，适合东方文化、品牌和消费品提案。",
    raster_layers: ["宣纸纹理背景", "水墨山水远景", "朱红印章氛围"],
    transparent_assets: ["水墨山石装饰", "朱红印章元素", "梅枝或器物剪影"],
    editable_layers: ["品牌标题", "理念卡片文字", "章节题签", "说明正文", "页脚日期"],
    prompt_seed:
      "oriental heritage PowerPoint background, premium Chinese ink landscape, rice paper texture, vermilion accent, elegant modern brand presentation, calm cultural luxury, no text",
  },
  {
    slug: "future-tech",
    name: "未来科技",
    palette: ["#0097A7", "#00D4D8", "#2F80ED", "#7C4DFF", "#03122B"],
    best_for: ["AI 发布会", "科技产品", "创新方案"],
    visual_direction: "深色空间、蓝绿霓虹、芯片平台和玻璃拟态卡片，适合 AI 产品发布和未来科技叙事。",
    raster_layers: ["深色宇宙科技背景", "AI 芯片平台主视觉", "蓝绿霓虹光轨"],
    transparent_assets: ["玻璃拟态产品卡片", "芯片和光效装饰", "科技图标组"],
    editable_layers: ["发布会标题", "产品卖点", "功能卡片文字", "时间地点", "图表标签"],
    prompt_seed:
      "future technology PowerPoint background, dark cinematic AI product launch, cyan neon glow, holographic chip platform, glassmorphism atmosphere, premium tech conference mood, no text",
  },
];

function parse_args(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--output-dir") {
      args.output_dir = argv[index + 1];
      index += 1;
    } else if (token === "--topic") {
      args.topic = argv[index + 1];
      index += 1;
    } else if (token === "--help" || token === "-h") {
      args.help = true;
    } else {
      throw new Error(`unknown argument: ${token}`);
    }
  }
  return args;
}

function usage() {
  return [
    "Usage:",
    "  node build_style_candidates.js --output-dir /absolute/path/style-candidates --topic \"deck topic\"",
    "",
    "Writes five editable one-slide PPTX samples, five PNG previews exported from those PPTX files,",
    "background-only image prompts, and a style-candidate-spec.json contract.",
  ].join("\n");
}

function ensure_directory(directory_path) {
  fs.mkdirSync(directory_path, { recursive: true });
}

function strip_hash(color) {
  return String(color || "000000").replace(/^#/, "").toUpperCase();
}

function add_text(slide, value, options) {
  slide.addText(String(value || ""), {
    fontFace: options.font_face || "PingFang SC",
    fontSize: options.font_size || 16,
    bold: Boolean(options.bold),
    color: strip_hash(options.color || "111827"),
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    margin: options.margin == null ? 0 : options.margin,
    fit: "shrink",
    breakLine: false,
    valign: options.valign || "mid",
    align: options.align || "left",
  });
}

function add_open_metric_stat(slide, metric, index, theme, x, y, w, options = {}) {
  const accent = options.accent || (index % 2 === 0 ? theme.accent : theme.accent_2);
  const value_size = options.value_size || 20;
  slide.addShape("line", {
    x,
    y,
    w: options.line_width || 0.58,
    h: 0,
    line: { color: strip_hash(accent), transparency: options.line_transparency == null ? 10 : options.line_transparency, width: 2 },
  });
  add_text(slide, metric.value, {
    x,
    y: y + 0.14,
    w,
    h: 0.36,
    font_face: theme.font_face,
    font_size: value_size,
    bold: true,
    color: accent,
  });
  add_text(slide, metric.label, {
    x,
    y: y + 0.54,
    w,
    h: 0.25,
    font_face: theme.font_face,
    font_size: options.label_size || 7.8,
    bold: true,
    color: options.label_color || theme.foreground,
  });
}

function add_editable_chart(slide, content, theme, x, y, w, h, options = {}) {
  const values = [42, 64, 78, 91];
  const gap = 0.22;
  const bar_width = (w - gap * 5) / 4;
  if (options.axis) {
    slide.addShape("line", {
      x,
      y: y + h - 0.46,
      w,
      h: 0,
      line: { color: strip_hash(theme.axis || theme.muted), transparency: 30, width: 1 },
    });
  }
  content.chart_labels.forEach((label, index) => {
    const bar_height = (h - 0.46) * (values[index] / 100);
    const bar_x = x + gap + index * (bar_width + gap);
    const bar_y = y + h - 0.46 - bar_height;
    slide.addShape("rect", {
      x: bar_x,
      y: bar_y,
      w: bar_width,
      h: bar_height,
      fill: { color: strip_hash(index % 2 === 0 ? theme.accent : theme.accent_2), transparency: 0 },
      line: { color: strip_hash(index % 2 === 0 ? theme.accent : theme.accent_2), transparency: 100 },
    });
    add_text(slide, label, {
      x: bar_x - 0.04,
      y: y + h - 0.32,
      w: bar_width + 0.08,
      h: 0.18,
      font_face: theme.font_face,
      font_size: 6.8,
      color: theme.muted,
      align: "center",
    });
  });
}

function add_bullet_list(slide, bullets, theme, x, y, options = {}) {
  bullets.forEach((bullet, index) => {
    const bullet_y = y + index * (options.step || 0.32);
    slide.addShape("ellipse", {
      x,
      y: bullet_y + 0.04,
      w: 0.08,
      h: 0.08,
      fill: { color: strip_hash(index % 2 === 0 ? theme.accent : theme.accent_2) },
      line: { transparency: 100 },
    });
    add_text(slide, bullet, {
      x: x + 0.18,
      y: bullet_y - 0.02,
      w: options.w || 3.6,
      h: 0.18,
      font_face: theme.font_face,
      font_size: options.font_size || 8.2,
      color: theme.foreground,
    });
  });
}

function add_integrated_note(slide, candidate, theme, x, y, w) {
  slide.addShape("line", {
    x,
    y: y + 0.02,
    w: 0.52,
    h: 0,
    line: { color: strip_hash(theme.accent), transparency: 10, width: 1.5 },
  });
  add_text(slide, "文字、数字和图表标签均为 PPT 可编辑对象", {
    x: x + 0.68,
    y: y - 0.08,
    w,
    h: 0.18,
    font_face: theme.font_face,
    font_size: 7.4,
    color: theme.muted,
  });
  add_text(slide, candidate.name, {
    x: 10.8,
    y: 6.88,
    w: 1.0,
    h: 0.16,
    font_face: theme.font_face,
    font_size: 7.2,
    bold: true,
    color: theme.accent,
    align: "right",
  });
}

function add_background(slide, candidate, theme, output_dir) {
  slide.background = { color: strip_hash(theme.background) };
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: slide_width,
    h: slide_height,
    fill: { color: strip_hash(theme.background) },
    line: { color: strip_hash(theme.background), transparency: 100 },
  });
  const background_path = path.join(output_dir, candidate.background_asset_path);
  if (fs.existsSync(background_path)) {
    slide.addImage({ path: background_path, x: 0, y: 0, w: slide_width, h: slide_height, transparency: 0 });
  }
}

function theme_for(candidate) {
  const palette = candidate.palette.map(strip_hash);
  const dark_slugs = new Set(["data-analytics", "future-tech"]);
  const is_dark = dark_slugs.has(candidate.slug);
  if (candidate.slug === "playful-anime") {
    return {
      background: "FFF7E6",
      foreground: "1F2937",
      muted: "586174",
      accent: "F59E0B",
      accent_2: "FF7AA2",
      card_fill: "FFFFFF",
      card_transparency: 18,
      metric_fill: "FFF4D6",
      metric_transparency: 10,
      font_face: "PingFang SC",
    };
  }
  if (candidate.slug === "data-analytics") {
    return {
      background: palette[0],
      foreground: "FFFFFF",
      muted: "A7C3D9",
      accent: "6C72FF",
      accent_2: "12C7D6",
      card_fill: "071B34",
      card_transparency: 8,
      metric_fill: "08213C",
      metric_transparency: 10,
      axis: "2E6F9E",
      font_face: "PingFang SC",
    };
  }
  return {
    background: is_dark ? palette[0] : palette[4],
    foreground: is_dark ? "FFFFFF" : palette[0],
    muted: is_dark ? "A7C3D9" : "5D6673",
    accent: palette[0] === "020B1D" ? palette[3] : palette[0],
    accent_2: palette[1],
    card_fill: is_dark ? "071B34" : "FFFFFF",
    card_transparency: is_dark ? 8 : 0,
    metric_fill: is_dark ? "071B34" : "FFFFFF",
    metric_transparency: is_dark ? 8 : 0,
    axis: is_dark ? "315D82" : "A7A7A7",
    font_face: "PingFang SC",
  };
}

function build_sample_content(topic, candidate) {
  const shared_metrics = [
    { value: "73%", label: "企业已进入试点" },
    { value: "3x", label: "高频任务提效" },
    { value: "2026", label: "规模化落地窗口" },
  ];
  const style_details = {
    "minimal-premium": {
      subtitle: "董事会简报样张",
      section_title: "核心结论",
      body: "AI 应用正在从工具采购转向流程重构，真正的价值来自业务场景、数据闭环和组织协同。",
      bullets: ["从单点工具进入流程级改造", "高频知识工作先出现回报", "治理和复用能力决定放大速度"],
      chart_labels: ["工具", "流程", "数据", "组织"],
    },
    "playful-anime": {
      subtitle: "培训课程样张",
      section_title: "学习目标",
      body: "用轻量案例解释 AI 应用趋势，让非技术团队也能判断哪些场景值得优先试点。",
      bullets: ["看懂趋势", "识别场景", "设计试点"],
      chart_labels: ["认知", "体验", "练习", "复盘"],
    },
    "data-analytics": {
      subtitle: "行业研究报告样张",
      section_title: "关键指标",
      body: "企业采用 AI 的竞争点，正从模型能力转向数据资产、流程嵌入和投入产出监控。",
      bullets: ["试点数量增长", "复用组件增加", "ROI 口径更严格"],
      chart_labels: ["采纳", "复用", "成本", "收益"],
    },
    "oriental-heritage": {
      subtitle: "品牌战略解读样张",
      section_title: "趋势脉络",
      body: "新技术落地不是一阵风，而是从器、术、法到组织文化的一次长期演进。",
      bullets: ["以器入局", "以术成事", "以法固化"],
      chart_labels: ["起", "承", "转", "合"],
    },
    "future-tech": {
      subtitle: "AI 产品发布会样张",
      section_title: "能力模块",
      body: "下一代 AI 应用将围绕多模态输入、智能执行、可信审计和生态连接展开。",
      bullets: ["多模态入口", "自动化执行", "企业级治理"],
      chart_labels: ["输入", "推理", "执行", "审计"],
    },
  };
  const detail = style_details[candidate.slug];
  return {
    title: topic,
    subtitle: detail.subtitle,
    section_title: detail.section_title,
    body: detail.body,
    bullets: detail.bullets,
    metrics: shared_metrics,
    chart_labels: detail.chart_labels,
  };
}

function build_background_prompt(candidate, topic) {
  return [
    `Codex image generation prompt for ${candidate.name}.`,
    "",
    `Create a 16:9 PowerPoint background image only for a deck about: ${topic}.`,
    `Visual direction: ${candidate.prompt_seed}.`,
    "No readable text, no letters, no numbers, no fake UI labels, no chart labels, no titles, no subtitles.",
    "Reserve deliberate text-safe zones and chart-safe zones: low-detail, low-noise areas with smooth tonal transitions, not blank boxes.",
    "Leave clean whitespace where editable PPT title, body copy, open metric numbers, and chart labels can be placed later without any card frames.",
    "Build gentle light-to-dark or dark-to-light transition areas behind future text and chart strokes so the final PPT remains readable without adding rescue panels.",
    "This background image is only one raster asset layer. The final candidate preview must be produced by placing editable PPT text, shapes, charts, and labels above it.",
    `Palette reference: ${candidate.palette.join(", ")}.`,
    `Suggested transparent assets to generate separately later: ${candidate.transparent_assets.join(", ")}.`,
  ].join("\n");
}

function build_safe_zone_plan(candidate) {
  const dark_style = new Set(["data-analytics", "future-tech"]).has(candidate.slug);
  const light_style = new Set(["minimal-premium", "oriental-heritage", "playful-anime"]).has(candidate.slug);
  return {
    text_zone: light_style
      ? "左侧或中左侧保留低纹理浅色留白，使用深色主标题和中灰正文；人物、建筑、山水等高细节素材避开正文行高区域。"
      : "左侧保留低纹理深色留白，使用白色主标题和浅蓝灰正文；高亮元素只作为短线和关键数字使用。",
    chart_zone: dark_style
      ? "右侧图表落在平台光带或网格暗区，使用青色/紫色高亮线条，避免细标签压在高亮眩光中心。"
      : "右侧图表落在浅色留白或纸纹过渡区，使用深色/品牌强调色线条，避免柱体或折线压到复杂纹理。",
    transition_zone:
      "文本区和图表区之间必须有柔和明暗过渡或低对比纹理带，让内容像嵌入背景，而不是浮在一块临时矩形上。",
    text_color_rule: dark_style
      ? "深背景使用白色标题、浅蓝灰正文、青色重点；禁止在亮光束上放浅色小字。"
      : "浅背景使用近黑标题、中灰正文、品牌强调色重点；禁止在深色图片纹理上放小号正文。",
    chart_color_rule:
      "图表主线/主柱必须比背景高一个明确亮度层级，辅助线降低透明度；标签避开高纹理和强光区域。",
  };
}

function build_sample_slide_spec(candidate, content) {
  return {
    layout: "style_candidate_sample",
    title: content.title,
    subtitle: content.subtitle,
    section_title: content.section_title,
    body: content.body,
    bullets: content.bullets,
    metrics: content.metrics,
    chart_labels: content.chart_labels,
    integrated_surface_strategy:
      "用背景留白、开放式信息层、无容器图表和无描边指标数字组组成页面，避免把内容装进框里。",
    readable_area_strategy:
      "先让背景提供文本安全区、图表安全区和低纹理过渡区，再叠加可编辑文本和图表；不能靠加框补救可读性。",
    forbidden_large_panel_count: 0,
    forbidden_framed_metric_tile_count: 0,
  };
}

function build_candidate(candidate_template, topic) {
  const prompt_file = `prompts/background-${candidate_template.slug}.md`;
  const content = build_sample_content(topic, candidate_template);
  return {
    slug: candidate_template.slug,
    name: candidate_template.name,
    pptx_sample_path: `samples/style-sample-${candidate_template.slug}.pptx`,
    preview_png_path: `previews/style-sample-${candidate_template.slug}.png`,
    background_asset_path: `assets/background-${candidate_template.slug}.png`,
    transparent_asset_paths: [
      `assets/transparent-${candidate_template.slug}-accent-01.png`,
      `assets/transparent-${candidate_template.slug}-accent-02.png`,
    ],
    prompt_file,
    image_generation_prompt: build_background_prompt(candidate_template, topic),
    palette: candidate_template.palette,
    best_for: candidate_template.best_for,
    visual_direction: candidate_template.visual_direction,
    sample_content: content,
    sample_slide_spec: build_sample_slide_spec(candidate_template, content),
    raster_layers: candidate_template.raster_layers,
    transparent_assets: candidate_template.transparent_assets,
    editable_layers: candidate_template.editable_layers,
    editable_text_contract:
      "标题、副标题、正文、要点、指标数字、指标标签和图表标签必须作为 PPT 文本对象生成，用户能在 PowerPoint 中直接改。",
    asset_layer_contract:
      "背景和装饰只能作为独立 raster/transparent image assets 叠加，不得承载正式正文、关键数字或图表标签。",
    surface_strategy:
      "采用融合式版面：文本、指标和图表嵌入背景留白、光带或纸纹/玻璃层中，形成同一视觉系统。",
    readability_contract:
      "配色、配图和字色必须服务可读性：标题、正文、指标、图表线条都要落在背景预留的阅读安全区或图表安全区，过渡区域先由背景生成，不能靠加框补救。",
    safe_zone_plan: build_safe_zone_plan(candidate_template),
    no_plain_white_box_contract:
      "禁止大白框和容器框：不得用大面积矩形或指标描边框承载正文、指标和图表，浅色区域也必须依靠背景留白、纹理、细线和开放式布局。",
    large_surface_count: {
      content_panels: 0,
      chart_panels: 0,
      framed_metric_tiles: 0,
    },
  };
}

function add_sample_layout(slide, candidate, output_dir) {
  const theme = theme_for(candidate);
  const content = candidate.sample_content;
  add_background(slide, candidate, theme, output_dir);
  const is_dark = new Set(["data-analytics", "future-tech"]).has(candidate.slug);
  if (!fs.existsSync(path.join(output_dir, candidate.background_asset_path))) {
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: 0.09,
      h: slide_height,
      fill: { color: strip_hash(theme.accent) },
      line: { color: strip_hash(theme.accent), transparency: 100 },
    });
    if (candidate.slug === "playful-anime") {
      slide.addShape("arc", { x: 9.2, y: -0.4, w: 3.2, h: 2.2, fill: { color: "FFC93C", transparency: 0 }, line: { transparency: 100 } });
      slide.addShape("arc", { x: 10.8, y: 5.7, w: 2.6, h: 1.8, fill: { color: "8FD3FF", transparency: 0 }, line: { transparency: 100 } });
    } else if (candidate.slug === "oriental-heritage") {
      slide.addShape("line", { x: 8.0, y: 5.7, w: 3.5, h: -2.0, line: { color: "B91C1C", transparency: 25, width: 2 } });
      slide.addShape("rect", { x: 11.4, y: 1.0, w: 0.52, h: 0.52, fill: { color: "B91C1C" }, line: { transparency: 100 } });
    } else if (is_dark) {
      slide.addShape("line", { x: 7.2, y: 1.1, w: 4.8, h: 3.8, line: { color: strip_hash(theme.accent_2), transparency: 42, width: 1.5 } });
      slide.addShape("line", { x: 7.7, y: 5.8, w: 4.0, h: -4.1, line: { color: strip_hash(theme.accent), transparency: 35, width: 1.2 } });
    }
  }
  add_text(slide, "2026 RESEARCH", {
    x: 0.72,
    y: 0.46,
    w: 2.2,
    h: 0.18,
    font_face: theme.font_face,
    font_size: 7.5,
    bold: true,
    color: theme.accent,
  });
  add_text(slide, content.title, {
    x: 0.72,
    y: 0.76,
    w: 6.15,
    h: 0.85,
    font_face: theme.font_face,
    font_size: candidate.slug === "oriental-heritage" ? 25 : 25,
    bold: true,
    color: theme.foreground,
  });
  const is_playful = candidate.slug === "playful-anime";
  const is_oriental = candidate.slug === "oriental-heritage";
  add_text(slide, content.subtitle, {
    x: is_oriental ? 2.62 : 0.76,
    y: 1.6,
    w: is_oriental ? 3.35 : 4.5,
    h: 0.25,
    font_face: theme.font_face,
    font_size: 10.5,
    bold: true,
    color: theme.accent,
  });

  const section_x = is_playful ? 2.92 : is_oriental ? 3.18 : 0.82;
  const section_y = is_playful ? 2.26 : 2.32;
  const section_width = is_playful ? 3.95 : is_oriental ? 3.65 : 4.75;
  const bullet_width = is_playful ? 3.42 : is_oriental ? 3.2 : 3.8;
  const metric_start_x = is_playful ? 2.86 : is_oriental ? 2.34 : 0.78;
  const metric_gap = is_playful ? 1.78 : 1.84;
  const metric_y = is_oriental ? 5.12 : 5.18;
  const chart_x = is_oriental ? 7.55 : 7.35;
  const chart_y = is_playful ? 2.15 : 2.08;
  const chart_width = is_playful ? 3.95 : 4.08;
  const chart_height = is_playful ? 2.85 : 2.72;
  const divider_color = is_oriental ? "B91C1C" : is_playful ? "F59E0B" : theme.accent;
  slide.addShape("line", {
    x: section_x,
    y: section_y - 0.2,
    w: is_oriental ? 0.56 : 4.65,
    h: 0,
    line: { color: strip_hash(divider_color), transparency: is_playful ? 18 : 35, width: is_oriental ? 2 : 1.2 },
  });
  if (candidate.slug === "minimal-premium") {
    slide.addShape("line", { x: 6.82, y: 1.22, w: 0, h: 4.92, line: { color: "A7A7A7", transparency: 45, width: 1 } });
  }
  add_text(slide, content.section_title, {
    x: section_x,
    y: section_y,
    w: 1.8,
    h: 0.28,
    font_face: theme.font_face,
    font_size: 13,
    bold: true,
    color: theme.foreground,
  });
  add_text(slide, content.body, {
    x: section_x,
    y: section_y + 0.55,
    w: section_width,
    h: 0.66,
    font_face: theme.font_face,
    font_size: 11.2,
    color: theme.muted,
  });
  add_bullet_list(slide, content.bullets, theme, section_x + 0.02, section_y + 1.4, { w: bullet_width, font_size: 8.3, step: 0.32 });
  content.metrics.forEach((metric, index) => {
    add_open_metric_stat(slide, metric, index, theme, metric_start_x + index * metric_gap, metric_y, 1.34, {
      accent: is_oriental && index === 1 ? "171717" : undefined,
      line_transparency: is_playful ? 12 : 22,
      value_size: 18,
      label_color: is_dark ? "FFFFFF" : theme.foreground,
    });
  });
  add_text(slide, "趋势指数", {
    x: chart_x,
    y: chart_y - 0.62,
    w: 2.2,
    h: 0.26,
    font_face: theme.font_face,
    font_size: 13,
    bold: true,
    color: theme.foreground,
  });
  slide.addShape("line", {
    x: chart_x,
    y: chart_y - 0.2,
    w: chart_width,
    h: 0,
    line: { color: strip_hash(divider_color), transparency: 35, width: 1.2 },
  });
  add_editable_chart(slide, content, theme, chart_x - 0.08, chart_y + 0.2, chart_width, chart_height, { axis: true });
  add_integrated_note(slide, candidate, theme, chart_x, chart_y + chart_height + 0.82, 3.75);
}

async function write_candidate_pptx(output_dir, candidate) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Codex";
  pptx.subject = "Editable style candidate sample";
  pptx.title = `${candidate.sample_content.title} - ${candidate.name}`;
  pptx.company = "codex-visual-asset-skills";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: "PingFang SC",
    bodyFontFace: "PingFang SC",
    lang: "zh-CN",
  };
  const slide = pptx.addSlide();
  add_sample_layout(slide, candidate, output_dir);
  const pptx_path = path.join(output_dir, candidate.pptx_sample_path);
  ensure_directory(path.dirname(pptx_path));
  await pptx.writeFile({ fileName: pptx_path });
}

function write_png_fallback(preview_path) {
  const fallback_png_base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAUNJREFUeNrs0zERAAAIBDEw+idhAkcQWmhmnWWugoY9OQDg7wRAABBAAAQQAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQYAUYABNWAlL3dn3YAAAAAElFTkSuQmCC";
  fs.writeFileSync(preview_path, Buffer.from(fallback_png_base64, "base64"));
}

function render_preview_png(output_dir, candidate) {
  const pptx_path = path.join(output_dir, candidate.pptx_sample_path);
  const preview_path = path.join(output_dir, candidate.preview_png_path);
  const preview_dir = path.dirname(preview_path);
  ensure_directory(preview_dir);
  if (fs.existsSync("/usr/bin/qlmanage")) {
    const result = spawnSync("/usr/bin/qlmanage", ["-t", "-s", "1920", "-o", preview_dir, pptx_path], {
      encoding: "utf8",
    });
    const quicklook_path = path.join(preview_dir, `${path.basename(pptx_path)}.png`);
    if (result.status === 0 && fs.existsSync(quicklook_path)) {
      fs.renameSync(quicklook_path, preview_path);
      if (fs.existsSync("/usr/bin/sips")) {
        spawnSync("/usr/bin/sips", ["-z", "1080", "1920", preview_path], { encoding: "utf8" });
      }
      return;
    }
  }
  write_png_fallback(preview_path);
}

function write_prompt_file(output_dir, candidate) {
  const prompt_path = path.join(output_dir, candidate.prompt_file);
  ensure_directory(path.dirname(prompt_path));
  fs.writeFileSync(prompt_path, `${candidate.image_generation_prompt}\n`, "utf8");
}

function write_markdown(output_dir, topic, candidates) {
  const lines = [
    "# PPT 风格候选真实样板包",
    "",
    `主题：${topic}`,
    "",
    "硬规则：每个候选必须先生成真实 PPTX 样板，再从 PPTX 导出 PNG 预览。PNG 预览只用于选择风格；真正可复用的是 PPTX 样板、背景素材、透明素材和分层契约。标题、正文、指标、图表标签必须文本可编辑，不允许把正式页面整页生图后交给用户选。视觉上必须是融合式版面，禁止大白框贴背景。",
    "",
    "使用方式：",
    "",
    "1. 先查看 `samples/style-sample-*.pptx`，确认文字、指标和图表标签能在 PowerPoint 中直接编辑。",
    "2. 再查看 `previews/style-sample-*.png`，让用户从 5 张单独预览里选择风格。",
    "3. 如需提高画面质感，按 `prompts/background-*.md` 生成无文字背景图，保存到 `assets/background-*.png` 后重新运行本工具。",
    "4. 被选中的方向进入逐页 PPT 生产，沿用同一套 PPT 分层结构，而不是重新临摹一张整页图片。",
    "",
  ];
  for (const candidate of candidates) {
    lines.push(`## ${candidate.name}`);
    lines.push("");
    lines.push(`- PPTX 样板：\`${candidate.pptx_sample_path}\``);
    lines.push(`- PNG 预览：\`${candidate.preview_png_path}\``);
    lines.push(`- 背景提示词：\`${candidate.prompt_file}\``);
    lines.push(`- 背景素材：\`${candidate.background_asset_path}\``);
    lines.push(`- 适合场景：${candidate.best_for.join("、")}`);
    lines.push(`- 视觉方向：${candidate.visual_direction}`);
    lines.push(`- 透明素材：${candidate.transparent_assets.join("、")}`);
    lines.push(`- 可编辑层：${candidate.editable_layers.join("、")}`);
    lines.push(`- 样本标题：${candidate.sample_content.title}`);
    lines.push(`- 样本正文：${candidate.sample_content.body}`);
    lines.push(`- 分层契约：${candidate.editable_text_contract}`);
    lines.push(`- 融合策略：${candidate.surface_strategy}`);
    lines.push(`- 阅读安全区：${candidate.safe_zone_plan.text_zone}`);
    lines.push(`- 图表安全区：${candidate.safe_zone_plan.chart_zone}`);
    lines.push(`- 可读性契约：${candidate.readability_contract}`);
    lines.push(`- 白框约束：${candidate.no_plain_white_box_contract}`);
    lines.push(`- 大面积正文容器：${candidate.large_surface_count.content_panels}`);
    lines.push(`- 大面积图表容器：${candidate.large_surface_count.chart_panels}`);
    lines.push(`- 指标描边框：${candidate.large_surface_count.framed_metric_tiles}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(output_dir, "style-candidates.md"), `${lines.join("\n")}\n`, "utf8");
}

function write_spec(output_dir, topic, candidates) {
  const spec = {
    topic,
    candidate_count: candidates.length,
    delivery_contract: "editable_pptx_samples_with_png_previews",
    preview_rule: "PNG 预览必须由对应 PPTX 样板渲染导出，不能直接使用整页生图作为候选。",
    ppt_contract:
      "PPTX 样板中的标题、正文、指标、图表标签和关键注释必须可编辑；图片只承担背景、透明素材和装饰层。",
    visual_quality_contract:
      "候选必须达到融合式版面：背景、文本、指标和图表属于同一视觉系统；文字和图表要嵌入背景留白，禁止大白框、内容容器框和指标描边框。",
    readable_area_policy: {
      text_safe_zones_required: true,
      chart_safe_zones_required: true,
      low_detail_transition_required: true,
      min_body_text_contrast_ratio: 4.5,
      min_chart_stroke_contrast_ratio: 3.0,
      anti_rescue_box_rule: "不能靠加框补救可读性；必须先通过背景留白、低纹理过渡区和字色/线色选择解决。",
    },
    large_surface_policy: {
      max_large_content_panels: 0,
      max_large_chart_panels: 0,
      max_framed_metric_tiles: 0,
      allowed_open_metric_groups: true,
    },
    candidates,
  };
  fs.writeFileSync(path.join(output_dir, "style-candidate-spec.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");
}

async function main() {
  let args;
  try {
    args = parse_args(process.argv);
  } catch (error) {
    console.error(`${error.message}\n\n${usage()}`);
    process.exit(1);
  }
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.output_dir) {
    console.error(`missing --output-dir\n\n${usage()}`);
    process.exit(1);
  }

  const output_dir = path.resolve(args.output_dir);
  const topic = args.topic || "2026 AI 应用趋势调研";
  ensure_directory(output_dir);
  ensure_directory(path.join(output_dir, "assets"));

  const candidates = candidate_templates.map((candidate) => build_candidate(candidate, topic));
  for (const candidate of candidates) {
    write_prompt_file(output_dir, candidate);
    await write_candidate_pptx(output_dir, candidate);
    render_preview_png(output_dir, candidate);
  }
  write_spec(output_dir, topic, candidates);
  write_markdown(output_dir, topic, candidates);

  console.log(
    JSON.stringify(
      {
        ok: true,
        output_dir,
        candidate_count: candidates.length,
        delivery_contract: "editable_pptx_samples_with_png_previews",
        spec: path.join(output_dir, "style-candidate-spec.json"),
        pptx_samples: candidates.map((candidate) => path.join(output_dir, candidate.pptx_sample_path)),
        previews: candidates.map((candidate) => path.join(output_dir, candidate.preview_png_path)),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
