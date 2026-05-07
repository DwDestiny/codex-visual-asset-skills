#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const candidate_templates = [
  {
    slug: "minimal-premium",
    name: "简约高级",
    palette: ["#050505", "#4A4A4A", "#A7A7A7", "#E1E1E1", "#FFFFFF"],
    best_for: ["商业计划书", "融资路演", "咨询汇报"],
    visual_direction:
      "大量留白、黑白灰秩序、真实建筑线条和克制的商业咨询气质，适合严肃决策场景。",
    raster_layers: ["浅灰建筑摄影感背景", "低对比纸张纹理", "细线空间透视氛围"],
    transparent_assets: ["黑白线框图标组", "半透明建筑结构装饰", "咨询卡片角标"],
    editable_layers: ["封面主标题", "英文副标题", "章节标题", "数据标签", "图表坐标和注释"],
    prompt_seed:
      "premium minimalist business consulting PowerPoint direction, elegant grayscale, architectural glass building details, abundant white space, thin black lines, refined corporate presentation mood",
  },
  {
    slug: "playful-anime",
    name: "活泼动漫",
    palette: ["#FFC93C", "#FF9EB5", "#7BDDC8", "#8FD3FF", "#B9B2F8"],
    best_for: ["教育课程", "儿童产品", "社群活动"],
    visual_direction:
      "明亮色彩、圆润结构、可爱角色和轻松课堂氛围，适合学习、活动和年轻用户表达。",
    raster_layers: ["明亮教室场景背景", "柔和云朵和色块氛围", "课程页浅色纸面纹理"],
    transparent_assets: ["可爱学生角色", "课程徽章贴纸", "星星和学习道具装饰"],
    editable_layers: ["课程标题", "目标卡片文字", "按钮标签", "步骤编号", "图表解释文字"],
    prompt_seed:
      "playful anime education PowerPoint direction, cheerful classroom, cute original child character, rounded colorful cards, bright yellow pink blue palette, polished illustration quality",
  },
  {
    slug: "data-analytics",
    name: "数据分析",
    palette: ["#020B1D", "#061C3A", "#0B4F86", "#5B5FF0", "#12C7D6"],
    best_for: ["经营复盘", "增长分析", "行业报告"],
    visual_direction:
      "深色科技背景、高信息密度仪表盘、蓝色发光图表和清晰 KPI 层级，适合数据驱动叙事。",
    raster_layers: ["深蓝网格空间背景", "发光数据柱状图氛围", "暗色仪表盘底图"],
    transparent_assets: ["发光图表装饰", "KPI 卡片边框", "数据节点和连线元素"],
    editable_layers: ["报告标题", "KPI 数字", "图表标题", "坐标轴标签", "来源说明"],
    prompt_seed:
      "data analytics PowerPoint direction, dark navy dashboard, luminous blue bar charts and line graph, KPI cards, high information density, premium enterprise report mood",
  },
  {
    slug: "oriental-heritage",
    name: "国潮东方",
    palette: ["#B91C1C", "#171717", "#E8DCC7", "#F3EADB", "#FAF8F2"],
    best_for: ["品牌介绍", "文化项目", "消费品提案"],
    visual_direction:
      "宣纸质感、朱红墨黑、山水留白和当代表达，适合东方文化、品牌和消费品提案。",
    raster_layers: ["宣纸纹理背景", "水墨山水远景", "朱红印章氛围"],
    transparent_assets: ["水墨山石装饰", "朱红印章元素", "梅枝或器物剪影"],
    editable_layers: ["品牌标题", "理念卡片文字", "章节题签", "说明正文", "页脚日期"],
    prompt_seed:
      "oriental heritage PowerPoint direction, premium Chinese ink landscape, rice paper texture, vermilion seal accent, elegant modern brand presentation, calm cultural luxury",
  },
  {
    slug: "future-tech",
    name: "未来科技",
    palette: ["#0097A7", "#00D4D8", "#2F80ED", "#7C4DFF", "#03122B"],
    best_for: ["AI 发布会", "科技产品", "创新方案"],
    visual_direction:
      "深色空间、蓝绿霓虹、芯片平台和玻璃拟态卡片，适合 AI 产品发布和未来科技叙事。",
    raster_layers: ["深色宇宙科技背景", "AI 芯片平台主视觉", "蓝绿霓虹光轨"],
    transparent_assets: ["玻璃拟态产品卡片", "芯片和光效装饰", "科技图标组"],
    editable_layers: ["发布会标题", "产品卖点", "功能卡片文字", "时间地点", "图表标签"],
    prompt_seed:
      "future technology PowerPoint direction, dark cinematic AI product launch, cyan neon glow, holographic chip platform, glassmorphism cards, premium tech conference mood",
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
    "Writes a real-image prompt packet: style-candidate-spec.json, style-candidates.md, and five prompt files.",
    "The tool does not create SVG mockups or combined overview images.",
  ].join("\n");
}

function ensure_directory(directory_path) {
  fs.mkdirSync(directory_path, { recursive: true });
}

function build_sample_content(topic, candidate) {
  const shared_metrics = [
    { value: "01", label: "确认主题" },
    { value: "05", label: "风格候选" },
    { value: "PPTX", label: "最终交付" },
  ];
  const style_details = {
    "minimal-premium": {
      subtitle: "从模糊想法到可交付方案",
      section_title: "核心流程",
      body: "把主题、证据、视觉和交付物拆成可验收步骤。",
      bullets: ["先收束故事线", "再确认视觉风格", "最后输出可编辑 PPT"],
      chart_labels: ["主题", "大纲", "素材", "排版"],
    },
    "playful-anime": {
      subtitle: "轻松理解，马上上手",
      section_title: "学习目标",
      body: "用清晰步骤把 Codex 变成自己的创作搭档。",
      bullets: ["会提需求", "会选风格", "会验收结果"],
      chart_labels: ["兴趣", "理解", "练习", "作品"],
    },
    "data-analytics": {
      subtitle: "用数据看清交付效率",
      section_title: "关键指标",
      body: "用可量化节点判断视觉方案是否值得继续推进。",
      bullets: ["需求清晰度提升", "返工次数下降", "交付周期缩短"],
      chart_labels: ["输入", "生成", "验收", "交付"],
    },
    "oriental-heritage": {
      subtitle: "以东方美学组织现代内容",
      section_title: "方案脉络",
      body: "在留白、节奏和层级里呈现可信而克制的表达。",
      bullets: ["立意清楚", "结构有序", "画面留白"],
      chart_labels: ["起", "承", "转", "合"],
    },
    "future-tech": {
      subtitle: "AI 工作流产品化演示",
      section_title: "能力模块",
      body: "把创意、素材、排版和交付连接成一条自动化链路。",
      bullets: ["智能生成", "素材透明化", "文档可编辑"],
      chart_labels: ["输入", "推理", "生成", "发布"],
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

function build_prompt(candidate, topic) {
  const sample_content = build_sample_content(topic, candidate);
  return [
    `Codex image generation prompt for ${candidate.name}.`,
    "",
    `Create a single independent 16:9 PNG style sample for a PowerPoint deck about: ${topic}.`,
    `Visual direction: ${candidate.prompt_seed}.`,
    "Show a realistic slide design sample with readable sample text so the user can judge typography hierarchy, font personality, title scale, body rhythm, chart-label treatment, and layout density.",
    "Use the following sample Chinese content exactly where practical:",
    `Title: ${sample_content.title}`,
    `Subtitle: ${sample_content.subtitle}`,
    `Section title: ${sample_content.section_title}`,
    `Body: ${sample_content.body}`,
    `Bullets: ${sample_content.bullets.join(" / ")}`,
    `Metrics: ${sample_content.metrics.map((metric) => `${metric.value} ${metric.label}`).join(" / ")}`,
    `Chart labels: ${sample_content.chart_labels.join(" / ")}`,
    "Make the sample content legible enough to evaluate the Chinese font feeling and spacing. Minor model text imperfections are acceptable, but the slide should clearly show title, content cards, metrics, and chart-label areas.",
    "Final PPT text must remain editable: this PNG is only a style-selection sample; the final deck must recreate titles, body copy, charts, numbers, and labels as editable PPT objects above generated backgrounds and transparent assets.",
    "Avoid SVG-like flat vector construction. Make it look like a polished AI-generated presentation design reference.",
    `Palette: ${candidate.palette.join(", ")}.`,
    `Transparent assets to generate separately later: ${candidate.transparent_assets.join(", ")}.`,
    "Output should be a single polished raster image, not a contact sheet, not a collage of five styles.",
  ].join("\n");
}

function build_candidate(candidate, topic) {
  const prompt_file = `prompts/style-sample-${candidate.slug}.md`;
  return {
    slug: candidate.slug,
    name: candidate.name,
    sample_image_path: `generated/style-sample-${candidate.slug}.png`,
    prompt_file,
    image_generation_prompt: build_prompt(candidate, topic),
    palette: candidate.palette,
    best_for: candidate.best_for,
    visual_direction: candidate.visual_direction,
    sample_content: build_sample_content(topic, candidate),
    raster_layers: candidate.raster_layers,
    transparent_assets: candidate.transparent_assets,
    editable_layers: candidate.editable_layers,
    ppt_layering_contract:
      "Generated raster images provide background mood and visual texture only; titles, body copy, charts, labels, numbers, and key annotations must remain editable PPT objects layered above the image.",
  };
}

function write_prompt_file(output_dir, candidate) {
  const prompt_path = path.join(output_dir, candidate.prompt_file);
  ensure_directory(path.dirname(prompt_path));
  fs.writeFileSync(prompt_path, `${candidate.image_generation_prompt}\n`, "utf8");
}

function write_markdown(output_dir, topic, candidates) {
  const lines = [
    "# PPT 风格候选生图提示包",
    "",
    `主题：${topic}`,
    "",
    "硬规则：必须通过 Codex 生图生成 5 张独立 PNG，一张图只代表一个风格；不得使用 SVG 拼凑、网页样式、脚本形状或截图假装真实图片；候选图需要带标题和正文样本文案，用来检查字体层级、字号关系、内容承载和排版密度；最终 PPT 文本可编辑，最终 PPT 文本仍可编辑。",
    "",
    "使用方式：",
    "",
    "1. 打开每个 `prompts/style-sample-*.md`。",
    "2. 逐条调用 Codex 生图能力，生成对应的 PNG。",
    "3. 把生成结果保存到 `generated/style-sample-*.png`。",
    "4. 让用户从 5 张单独图片里选择风格，同时判断标题、正文、指标卡和图表标签是否符合预期。",
    "5. 被选中的方向进入逐页 PPT 生产，背景和装饰可用图片层，关键文字和图表必须用可编辑层。",
    "",
  ];
  for (const candidate of candidates) {
    lines.push(`## ${candidate.name}`);
    lines.push("");
    lines.push(`- 样张路径：\`${candidate.sample_image_path}\``);
    lines.push(`- 提示词：\`${candidate.prompt_file}\``);
    lines.push(`- 适合场景：${candidate.best_for.join("、")}`);
    lines.push(`- 视觉方向：${candidate.visual_direction}`);
    lines.push(`- 透明素材：${candidate.transparent_assets.join("、")}`);
    lines.push(`- 可编辑层：${candidate.editable_layers.join("、")}`);
    lines.push(`- 样本标题：${candidate.sample_content.title}`);
    lines.push(`- 样本正文：${candidate.sample_content.body}`);
    lines.push(`- 样本要点：${candidate.sample_content.bullets.join("、")}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(output_dir, "style-candidates.md"), `${lines.join("\n")}\n`, "utf8");
}

function write_spec(output_dir, topic, candidates) {
  const spec = {
    topic,
    candidate_count: candidates.length,
    delivery_contract: "five_independent_real_image_pngs",
    image_sample_rule:
      "Generate five separate PNG files with Codex image generation. Do not replace them with SVG mockups or one combined overview.",
    ppt_contract:
      "Use raster images for background mood and transparent visual assets; keep slide text, charts, labels, and key numbers editable in PPT.",
    candidates,
  };
  fs.writeFileSync(path.join(output_dir, "style-candidate-spec.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");
}

function main() {
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
  const topic = args.topic || "视觉型 PPT 方案";
  ensure_directory(output_dir);

  const candidates = candidate_templates.map((candidate) => build_candidate(candidate, topic));
  for (const candidate of candidates) {
    write_prompt_file(output_dir, candidate);
  }
  write_spec(output_dir, topic, candidates);
  write_markdown(output_dir, topic, candidates);

  console.log(
    JSON.stringify(
      {
        ok: true,
        output_dir,
        candidate_count: candidates.length,
        delivery_contract: "five_independent_real_image_pngs",
        spec: path.join(output_dir, "style-candidate-spec.json"),
        prompts: candidates.map((candidate) => path.join(output_dir, candidate.prompt_file)),
      },
      null,
      2
    )
  );
}

main();
