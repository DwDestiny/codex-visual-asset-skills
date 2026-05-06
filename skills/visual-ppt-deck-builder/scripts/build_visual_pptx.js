#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

function parse_args(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--spec") {
      args.spec = argv[index + 1];
      index += 1;
    } else if (token === "--output") {
      args.output = argv[index + 1];
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
    "  node build_visual_pptx.js --spec /absolute/path/deck_spec.json --output /absolute/path/deck.pptx",
    "",
    "The spec must contain title and a non-empty slides array.",
  ].join("\n");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function read_json(file_path) {
  if (!file_path || !fs.existsSync(file_path)) {
    throw new Error(`missing spec file: ${file_path || ""}`);
  }
  return JSON.parse(fs.readFileSync(file_path, "utf8"));
}

function normalize_color(value, fallback) {
  const raw_value = String(value || fallback || "").replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw_value)) {
    return String(fallback || "000000").replace(/^#/, "");
  }
  return raw_value.toUpperCase();
}

function normalize_spec(spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("spec must be a JSON object");
  }
  if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
    throw new Error("spec.slides must be a non-empty array");
  }
  const theme = spec.theme || {};
  return {
    title: String(spec.title || "Untitled deck"),
    subtitle: String(spec.subtitle || ""),
    author: String(spec.author || ""),
    theme: {
      background: normalize_color(theme.background, "F7F4EF"),
      foreground: normalize_color(theme.foreground, "17202A"),
      accent: normalize_color(theme.accent, "1F8A70"),
      accent_2: normalize_color(theme.accent_2, "E76F51"),
      muted: normalize_color(theme.muted, "6B7280"),
      panel: normalize_color(theme.panel, "FFFFFF"),
      font_face: String(theme.font_face || "Aptos"),
    },
    slides: spec.slides,
  };
}

function ensure_output_path(output_path) {
  if (!output_path) {
    throw new Error("missing --output path");
  }
  const absolute_output = path.resolve(output_path);
  fs.mkdirSync(path.dirname(absolute_output), { recursive: true });
  return absolute_output;
}

function add_background(slide, theme, slide_data) {
  const background = normalize_color(slide_data.background, theme.background);
  slide.background = { color: background };
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: slide_width,
    h: slide_height,
    fill: { color: background },
    line: { color: background, transparency: 100 },
  });
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.12,
    h: slide_height,
    fill: { color: theme.accent },
    line: { color: theme.accent, transparency: 100 },
  });
}

function add_footer(slide, theme, slide_number, total_slides) {
  slide.addText(`${slide_number}/${total_slides}`, {
    x: 11.9,
    y: 7.06,
    w: 0.85,
    h: 0.18,
    fontFace: theme.font_face,
    fontSize: 7,
    color: theme.muted,
    align: "right",
    margin: 0,
  });
}

function add_title(slide, theme, title, options = {}) {
  slide.addText(String(title || ""), {
    x: options.x || 0.72,
    y: options.y || 0.58,
    w: options.w || 11.7,
    h: options.h || 0.8,
    fontFace: theme.font_face,
    fontSize: options.font_size || 27,
    bold: true,
    color: theme.foreground,
    margin: 0,
    fit: "shrink",
  });
}

function add_body(slide, theme, body, box) {
  if (!body) return;
  slide.addText(String(body), {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontFace: theme.font_face,
    fontSize: box.font_size || 14,
    color: box.color || theme.muted,
    valign: "top",
    breakLine: false,
    margin: 0,
    fit: "shrink",
  });
}

function add_bullets(slide, theme, bullets, box) {
  if (!Array.isArray(bullets) || bullets.length === 0) return;
  const runs = bullets.map((bullet) => ({
    text: String(bullet),
    options: { bullet: { type: "ul" }, breakLine: true },
  }));
  slide.addText(runs, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontFace: theme.font_face,
    fontSize: box.font_size || 13,
    color: theme.foreground,
    margin: 0.05,
    breakLine: false,
    fit: "shrink",
  });
}

function resolve_asset_path(asset_path, spec_dir) {
  if (!asset_path) return null;
  const candidate = path.isAbsolute(asset_path)
    ? asset_path
    : path.resolve(spec_dir, asset_path);
  if (!fs.existsSync(candidate)) {
    throw new Error(`missing image asset: ${candidate}`);
  }
  return candidate;
}

function add_image(slide, image_path, box) {
  if (!image_path) return;
  slide.addImage({
    path: image_path,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
  });
}

function add_title_slide(pptx, theme, slide_data, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  slide.addShape("rect", {
    x: 0.72,
    y: 0.82,
    w: 0.72,
    h: 0.12,
    fill: { color: theme.accent_2 },
    line: { color: theme.accent_2, transparency: 100 },
  });
  add_title(slide, theme, slide_data.title, {
    x: 0.72,
    y: 1.3,
    w: 10.9,
    h: 1.25,
    font_size: 34,
  });
  add_body(slide, theme, slide_data.subtitle || slide_data.body || "", {
    x: 0.75,
    y: 2.7,
    w: 6.8,
    h: 0.9,
    font_size: 15,
    color: theme.muted,
  });
  slide.addShape("rect", {
    x: 8.25,
    y: 1.1,
    w: 3.75,
    h: 4.9,
    fill: { color: theme.panel, transparency: 9 },
    line: { color: theme.accent, transparency: 45 },
    radius: 0.18,
  });
  slide.addShape("arc", {
    x: 8.75,
    y: 1.62,
    w: 2.65,
    h: 2.65,
    line: { color: theme.accent, pt: 3 },
    adjustPoint: 0.22,
  });
  slide.addText(slide_data.kicker || "Visual deck system", {
    x: 8.65,
    y: 4.82,
    w: 2.95,
    h: 0.32,
    fontFace: theme.font_face,
    fontSize: 11,
    color: theme.foreground,
    bold: true,
    align: "center",
    margin: 0,
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_content_slide(pptx, theme, slide_data, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  add_title(slide, theme, slide_data.title);
  add_body(slide, theme, slide_data.body || "", {
    x: 0.76,
    y: 1.55,
    w: 5.45,
    h: 1.2,
    font_size: 14,
    color: theme.muted,
  });
  add_bullets(slide, theme, slide_data.bullets, {
    x: 0.82,
    y: 3.05,
    w: 5.2,
    h: 2.55,
    font_size: 14,
  });
  slide.addShape("rect", {
    x: 7.0,
    y: 1.48,
    w: 4.9,
    h: 4.55,
    fill: { color: theme.panel, transparency: 7 },
    line: { color: theme.accent, transparency: 58 },
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_image_text_slide(pptx, theme, slide_data, spec_dir, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  add_title(slide, theme, slide_data.title);
  add_body(slide, theme, slide_data.body || "", {
    x: 0.76,
    y: 1.55,
    w: 5.35,
    h: 1.1,
    font_size: 14,
    color: theme.muted,
  });
  add_bullets(slide, theme, slide_data.bullets, {
    x: 0.84,
    y: 2.9,
    w: 4.95,
    h: 2.7,
    font_size: 13.5,
  });
  slide.addShape("rect", {
    x: 6.65,
    y: 1.28,
    w: 5.45,
    h: 5.15,
    fill: { color: theme.panel, transparency: 4 },
    line: { color: "D8DEE9", transparency: 20 },
  });
  add_image(slide, resolve_asset_path(slide_data.image, spec_dir), {
    x: 7.0,
    y: 1.6,
    w: 4.75,
    h: 4.45,
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_bar_chart_slide(pptx, theme, slide_data, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  add_title(slide, theme, slide_data.title);
  add_body(slide, theme, slide_data.body || "", {
    x: 0.76,
    y: 1.45,
    w: 10.6,
    h: 0.55,
    font_size: 13,
    color: theme.muted,
  });
  const chart = slide_data.chart || {};
  const labels = Array.isArray(chart.labels) ? chart.labels : [];
  const values = Array.isArray(chart.values) ? chart.values.map(Number) : [];
  if (labels.length === 0 || values.length === 0 || labels.length !== values.length) {
    throw new Error(`bar_chart slide requires chart.labels and chart.values with same length: ${slide_data.title || ""}`);
  }
  const max_value = Math.max(...values, 1);
  const chart_x = 1.05;
  const chart_y = 2.3;
  const chart_w = 10.95;
  const chart_h = 3.75;
  const gap = 0.28;
  const bar_w = (chart_w - gap * (values.length - 1)) / values.length;
  slide.addShape("line", {
    x: chart_x,
    y: chart_y + chart_h,
    w: chart_w,
    h: 0,
    line: { color: "CBD5E1", pt: 1 },
  });
  values.forEach((value, index) => {
    const bar_h = (value / max_value) * (chart_h - 0.45);
    const x_position = chart_x + index * (bar_w + gap);
    const y_position = chart_y + chart_h - bar_h;
    const fill_color = index % 2 === 0 ? theme.accent : theme.accent_2;
    slide.addShape("rect", {
      x: x_position,
      y: y_position,
      w: bar_w,
      h: bar_h,
      fill: { color: fill_color },
      line: { color: fill_color, transparency: 100 },
    });
    slide.addText(`${value}${chart.unit || ""}`, {
      x: x_position,
      y: y_position - 0.32,
      w: bar_w,
      h: 0.24,
      fontFace: theme.font_face,
      fontSize: 11,
      bold: true,
      color: theme.foreground,
      align: "center",
      margin: 0,
    });
    slide.addText(String(labels[index]), {
      x: x_position,
      y: chart_y + chart_h + 0.18,
      w: bar_w,
      h: 0.28,
      fontFace: theme.font_face,
      fontSize: 10,
      color: theme.muted,
      align: "center",
      margin: 0,
      fit: "shrink",
    });
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_comparison_slide(pptx, theme, slide_data, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  add_title(slide, theme, slide_data.title);
  const items = Array.isArray(slide_data.items) ? slide_data.items : [];
  const item_count = Math.max(items.length, 1);
  const card_w = Math.min(3.55, 10.9 / item_count - 0.2);
  items.forEach((item, index) => {
    const x_position = 0.9 + index * (card_w + 0.32);
    slide.addShape("rect", {
      x: x_position,
      y: 1.75,
      w: card_w,
      h: 4.55,
      fill: { color: theme.panel, transparency: 3 },
      line: { color: index % 2 === 0 ? theme.accent : theme.accent_2, transparency: 35 },
    });
    slide.addText(String(item.title || ""), {
      x: x_position + 0.22,
      y: 2.06,
      w: card_w - 0.44,
      h: 0.42,
      fontFace: theme.font_face,
      fontSize: 15,
      bold: true,
      color: theme.foreground,
      margin: 0,
      fit: "shrink",
    });
    add_body(slide, theme, item.body || "", {
      x: x_position + 0.22,
      y: 2.78,
      w: card_w - 0.44,
      h: 2.5,
      font_size: 12,
      color: theme.muted,
    });
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_timeline_slide(pptx, theme, slide_data, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  add_title(slide, theme, slide_data.title);
  const steps = Array.isArray(slide_data.steps) ? slide_data.steps : [];
  slide.addShape("line", {
    x: 1.12,
    y: 3.75,
    w: 10.75,
    h: 0,
    line: { color: theme.accent, pt: 2 },
  });
  steps.forEach((step, index) => {
    const x_position = 1.05 + index * (10.45 / Math.max(steps.length - 1, 1));
    slide.addShape("ellipse", {
      x: x_position - 0.16,
      y: 3.58,
      w: 0.32,
      h: 0.32,
      fill: { color: index % 2 === 0 ? theme.accent : theme.accent_2 },
      line: { color: "FFFFFF", pt: 1 },
    });
    slide.addText(String(step.label || step.title || ""), {
      x: x_position - 0.8,
      y: 4.05,
      w: 1.6,
      h: 0.35,
      fontFace: theme.font_face,
      fontSize: 11,
      bold: true,
      color: theme.foreground,
      align: "center",
      margin: 0,
      fit: "shrink",
    });
    add_body(slide, theme, step.body || "", {
      x: x_position - 0.9,
      y: 4.5,
      w: 1.8,
      h: 0.85,
      font_size: 9,
      color: theme.muted,
    });
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_closing_slide(pptx, theme, slide_data, slide_index, total_slides) {
  const slide = pptx.addSlide();
  add_background(slide, theme, slide_data);
  slide.addShape("rect", {
    x: 0.75,
    y: 1.25,
    w: 11.2,
    h: 4.8,
    fill: { color: theme.panel, transparency: 5 },
    line: { color: theme.accent, transparency: 45 },
  });
  add_title(slide, theme, slide_data.title, {
    x: 1.15,
    y: 2.1,
    w: 8.8,
    h: 0.95,
    font_size: 30,
  });
  add_body(slide, theme, slide_data.body || "", {
    x: 1.18,
    y: 3.25,
    w: 6.8,
    h: 0.9,
    font_size: 15,
    color: theme.muted,
  });
  add_footer(slide, theme, slide_index, total_slides);
}

function add_slide_by_layout(pptx, theme, slide_data, spec_dir, slide_index, total_slides) {
  const layout = String(slide_data.layout || "content");
  if (layout === "title") {
    add_title_slide(pptx, theme, slide_data, slide_index, total_slides);
  } else if (layout === "image_text") {
    add_image_text_slide(pptx, theme, slide_data, spec_dir, slide_index, total_slides);
  } else if (layout === "bar_chart") {
    add_bar_chart_slide(pptx, theme, slide_data, slide_index, total_slides);
  } else if (layout === "comparison") {
    add_comparison_slide(pptx, theme, slide_data, slide_index, total_slides);
  } else if (layout === "timeline") {
    add_timeline_slide(pptx, theme, slide_data, slide_index, total_slides);
  } else if (layout === "closing" || layout === "section") {
    add_closing_slide(pptx, theme, slide_data, slide_index, total_slides);
  } else {
    add_content_slide(pptx, theme, slide_data, slide_index, total_slides);
  }
}

async function build_deck(spec_path, output_path) {
  const spec_dir = path.dirname(path.resolve(spec_path));
  const spec = normalize_spec(read_json(spec_path));
  const absolute_output = ensure_output_path(output_path);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = spec.author || "Codex";
  pptx.subject = spec.subtitle || spec.title;
  pptx.title = spec.title;
  pptx.company = "Codex";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: spec.theme.font_face,
    bodyFontFace: spec.theme.font_face,
    lang: "zh-CN",
  };

  spec.slides.forEach((slide_data, index) => {
    add_slide_by_layout(
      pptx,
      spec.theme,
      slide_data,
      spec_dir,
      index + 1,
      spec.slides.length
    );
  });

  await pptx.writeFile({ fileName: absolute_output, compression: true });
  console.log(
    JSON.stringify(
      {
        ok: true,
        output: absolute_output,
        slide_count: spec.slides.length,
      },
      null,
      2
    )
  );
}

async function main() {
  let args;
  try {
    args = parse_args(process.argv);
  } catch (error) {
    fail(`${error.message}\n\n${usage()}`);
  }
  if (args.help) {
    console.log(usage());
    return;
  }
  try {
    await build_deck(args.spec, args.output);
  } catch (error) {
    fail(error.message);
  }
}

main();
