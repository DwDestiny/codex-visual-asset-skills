#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const slide_width = 1280;
const slide_height = 720;

function parse_args(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--spec") {
      args.spec = argv[index + 1];
      index += 1;
    } else if (token === "--output-dir") {
      args.output_dir = argv[index + 1];
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
    "  node build_deck_preview.js --spec /absolute/path/deck_spec.json --output-dir /absolute/path/preview",
  ].join("\n");
}

function read_json(file_path) {
  if (!file_path || !fs.existsSync(file_path)) {
    throw new Error(`missing spec file: ${file_path || ""}`);
  }
  return JSON.parse(fs.readFileSync(file_path, "utf8"));
}

function normalize_color(value, fallback) {
  const raw_value = String(value || fallback || "").replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw_value)) return fallback;
  return raw_value.toUpperCase();
}

function normalize_theme(theme = {}) {
  return {
    background: normalize_color(theme.background, "F5F7FA"),
    foreground: normalize_color(theme.foreground, "17202A"),
    accent: normalize_color(theme.accent, "1769AA"),
    accent_2: normalize_color(theme.accent_2, "D65A31"),
    muted: normalize_color(theme.muted, "667085"),
    panel: normalize_color(theme.panel, "FFFFFF"),
    font_face: String(theme.font_face || "Aptos"),
  };
}

function escape_xml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function short_text(value, max_length = 72) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max_length) return text;
  return `${text.slice(0, max_length - 1)}…`;
}

function text(x, y, content, options = {}) {
  return `<text x="${x}" y="${y}" font-family="${escape_xml(options.font || "Aptos")}" font-size="${options.size || 28}" font-weight="${options.weight || "400"}" fill="#${options.color || "17202A"}">${escape_xml(content)}</text>`;
}

function wrap_lines(value, max_chars) {
  const text_value = String(value || "").replace(/\s+/g, " ").trim();
  if (!text_value) return [];
  const lines = [];
  let buffer = "";
  Array.from(text_value).forEach((char) => {
    const char_weight = /[\x00-\x7F]/.test(char) ? 0.55 : 1;
    const current_weight = Array.from(buffer).reduce(
      (sum, item) => sum + (/[\x00-\x7F]/.test(item) ? 0.55 : 1),
      0
    );
    if (buffer && current_weight + char_weight > max_chars) {
      lines.push(buffer.trim());
      buffer = char;
    } else {
      buffer += char;
    }
  });
  if (buffer.trim()) lines.push(buffer.trim());
  return lines;
}

function wrapped_text(x, y, content, options = {}) {
  const lines = wrap_lines(content, options.max_chars || 24).slice(0, options.max_lines || 6);
  if (lines.length === 0) return "";
  const line_height = options.line_height || Math.round((options.size || 24) * 1.35);
  const tspans = lines.map((line, index) => {
    const dy = index === 0 ? 0 : line_height;
    return `<tspan x="${x}" dy="${dy}">${escape_xml(line)}</tspan>`;
  }).join("");
  return `<text x="${x}" y="${y}" font-family="${escape_xml(options.font || "Aptos")}" font-size="${options.size || 24}" font-weight="${options.weight || "400"}" fill="#${options.color || "17202A"}">${tspans}</text>`;
}

function rect(x, y, w, h, fill, options = {}) {
  const stroke = options.stroke ? ` stroke="#${options.stroke}" stroke-width="${options.stroke_width || 2}"` : "";
  const radius = options.radius ? ` rx="${options.radius}"` : "";
  const opacity = options.opacity == null ? "" : ` opacity="${options.opacity}"`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#${fill}"${stroke}${radius}${opacity}/>`;
}

function render_bullets(items, x, y, theme, max_items = 4) {
  if (!Array.isArray(items)) return "";
  return items.slice(0, max_items).map((item, index) => {
    const y_pos = y + index * 58;
    return [
      rect(x, y_pos - 18, 12, 12, theme.accent_2, { radius: 6 }),
      wrapped_text(x + 28, y_pos, item, { size: 22, color: theme.foreground, max_chars: 24, max_lines: 2 }),
    ].join("\n");
  }).join("\n");
}

function render_slide_body(slide, theme) {
  const layout = String(slide.layout || "content");
  if (layout === "title") {
    return [
      rect(760, 96, 390, 470, theme.panel, { stroke: theme.accent, radius: 12 }),
      text(804, 170, "01 确定主题", { size: 26, weight: 700, color: theme.foreground }),
      text(804, 240, "02 选择风格", { size: 26, weight: 700, color: theme.foreground }),
      text(804, 310, "03 生成素材", { size: 26, weight: 700, color: theme.foreground }),
      text(804, 380, "04 交付文件", { size: 26, weight: 700, color: theme.foreground }),
      wrapped_text(804, 510, slide.kicker || "视觉化交付系统", { size: 24, weight: 700, color: theme.accent, max_chars: 14, max_lines: 2 }),
    ].join("\n");
  }
  if (layout === "executive_summary") {
    const points = Array.isArray(slide.points) ? slide.points : [];
    return points.slice(0, 3).map((point, index) => {
      const x = 90 + index * 380;
      return [
        rect(x, 230, 320, 300, theme.panel, { stroke: index % 2 === 0 ? theme.accent : theme.accent_2, radius: 10 }),
        text(x + 28, 285, point.label || `0${index + 1}`, { size: 23, weight: 700, color: index % 2 === 0 ? theme.accent : theme.accent_2 }),
        wrapped_text(x + 28, 345, point.title, { size: 30, weight: 700, color: theme.foreground, max_chars: 9, max_lines: 2 }),
        wrapped_text(x + 28, 415, point.body, { size: 22, color: theme.muted, max_chars: 14, max_lines: 4 }),
      ].join("\n");
    }).join("\n");
  }
  if (layout === "architecture") {
    const layers = Array.isArray(slide.layers) ? slide.layers : [];
    return layers.slice(0, 4).map((layer, index) => {
      const y = 220 + index * 82;
      return [
        rect(100, y, 1080, 56, index % 2 === 0 ? theme.panel : theme.background, { stroke: index % 2 === 0 ? theme.accent : theme.accent_2, radius: 8 }),
        wrapped_text(128, y + 30, layer.title, { size: 21, weight: 700, color: theme.foreground, max_chars: 8, max_lines: 2 }),
        wrapped_text(360, y + 30, layer.body, { size: 20, color: theme.muted, max_chars: 33, max_lines: 2 }),
      ].join("\n");
    }).join("\n");
  }
  if (layout === "metrics") {
    const metrics = Array.isArray(slide.metrics) ? slide.metrics : [];
    return metrics.slice(0, 4).map((metric, index) => {
      const x = 105 + index * 285;
      return [
        text(x, 285, metric.value, { size: 46, weight: 800, color: index % 2 === 0 ? theme.accent : theme.accent_2 }),
        wrapped_text(x, 335, metric.label, { size: 22, weight: 700, color: theme.foreground, max_chars: 9, max_lines: 2 }),
        wrapped_text(x, 400, metric.body, { size: 18, color: theme.muted, max_chars: 14, max_lines: 3 }),
      ].join("\n");
    }).join("\n");
  }
  if (layout === "comparison") {
    const items = Array.isArray(slide.items) ? slide.items : [];
    return items.slice(0, 3).map((item, index) => {
      const x = 95 + index * 380;
      return [
        rect(x, 230, 330, 300, theme.panel, { stroke: index % 2 === 0 ? theme.accent : theme.accent_2, radius: 10 }),
        wrapped_text(x + 28, 300, item.title, { size: 30, weight: 700, color: theme.foreground, max_chars: 10, max_lines: 2 }),
        wrapped_text(x + 28, 385, item.body, { size: 21, color: theme.muted, max_chars: 15, max_lines: 4 }),
      ].join("\n");
    }).join("\n");
  }
  if (layout === "roadmap") {
    const phases = Array.isArray(slide.phases) ? slide.phases : [];
    return phases.slice(0, 4).map((phase, index) => {
      const x = 95 + index * 285;
      return [
        rect(x, 230, 245, 320, theme.panel, { stroke: index % 2 === 0 ? theme.accent : theme.accent_2, radius: 10 }),
        wrapped_text(x + 22, 285, phase.period, { size: 20, weight: 700, color: index % 2 === 0 ? theme.accent : theme.accent_2, max_chars: 8, max_lines: 2 }),
        wrapped_text(x + 22, 340, phase.title, { size: 26, weight: 700, color: theme.foreground, max_chars: 8, max_lines: 2 }),
        wrapped_text(x + 22, 420, phase.body, { size: 19, color: theme.muted, max_chars: 11, max_lines: 4 }),
      ].join("\n");
    }).join("\n");
  }
  if (layout === "risk_next_steps") {
    return [
      text(100, 235, "主要风险", { size: 30, weight: 700, color: theme.foreground }),
      render_bullets(slide.risks, 105, 300, theme, 4),
      text(700, 235, "下一步动作", { size: 30, weight: 700, color: theme.foreground }),
      render_bullets(slide.actions, 705, 300, theme, 4),
      `<line x1="640" y1="220" x2="640" y2="555" stroke="#${theme.accent}" stroke-width="3" opacity="0.45"/>`,
    ].join("\n");
  }
  if (layout === "bar_chart") {
    const chart = slide.chart || {};
    const labels = Array.isArray(chart.labels) ? chart.labels : [];
    const values = Array.isArray(chart.values) ? chart.values.map(Number) : [];
    const max_value = Math.max(...values, 1);
    return labels.map((label, index) => {
      const x = 120 + index * 190;
      const h = (values[index] / max_value) * 230;
      return [
        rect(x, 540 - h, 110, h, index % 2 === 0 ? theme.accent : theme.accent_2, { radius: 6 }),
        text(x - 12, 585, short_text(label, 8), { size: 18, color: theme.muted }),
      ].join("\n");
    }).join("\n");
  }
  return [
    rect(720, 180, 420, 360, theme.panel, { stroke: theme.accent, radius: 10 }),
    wrapped_text(100, 250, slide.body, { size: 24, color: theme.muted, max_chars: 28, max_lines: 3 }),
    render_bullets(slide.bullets, 110, 340, theme, 4),
  ].join("\n");
}

function render_slide_svg(slide, theme, index, total) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${slide_width}" height="${slide_height}" viewBox="0 0 ${slide_width} ${slide_height}">`,
    rect(0, 0, slide_width, slide_height, theme.background),
    rect(0, 0, 12, slide_height, theme.accent),
    wrapped_text(70, 86, slide.title, { font: theme.font_face, size: 40, weight: 800, color: theme.foreground, max_chars: 25, max_lines: 2, line_height: 48 }),
    slide.claim ? wrapped_text(72, 158, slide.claim, { font: theme.font_face, size: 23, weight: 700, color: theme.accent, max_chars: 42, max_lines: 2, line_height: 31 }) : "",
    render_slide_body(slide, theme),
    slide.source ? text(72, 680, short_text(slide.source, 70), { font: theme.font_face, size: 13, color: theme.muted }) : "",
    text(1140, 680, `${index}/${total}`, { font: theme.font_face, size: 16, color: theme.muted }),
    "</svg>",
  ].join("\n");
}

function render_contact_sheet(spec, theme) {
  const cols = 2;
  const thumb_w = 540;
  const thumb_h = 304;
  const gap = 36;
  const margin = 52;
  const rows = Math.ceil(spec.slides.length / cols);
  const width = margin * 2 + cols * thumb_w + (cols - 1) * gap;
  const height = 110 + rows * thumb_h + (rows - 1) * gap + margin;
  const thumbs = spec.slides.map((slide, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = margin + col * (thumb_w + gap);
    const y = 100 + row * (thumb_h + gap);
    const layout = String(slide.layout || "content");
    return [
      rect(x, y, thumb_w, thumb_h, theme.background, { stroke: "CDD5DF", radius: 10 }),
      rect(x, y, 8, thumb_h, theme.accent),
      text(x + 24, y + 42, `${index + 1}. ${short_text(slide.title, 22)}`, { size: 24, weight: 800, color: theme.foreground }),
      text(x + 24, y + 78, layout, { size: 15, weight: 700, color: theme.accent }),
      slide.claim ? text(x + 24, y + 120, short_text(slide.claim, 34), { size: 18, weight: 700, color: theme.foreground }) : "",
      text(x + 24, y + 245, short_text(slide.source || slide.subtitle || slide.body, 38), { size: 14, color: theme.muted }),
    ].join("\n");
  }).join("\n");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    rect(0, 0, width, height, "FFFFFF"),
    text(margin, 58, `${short_text(spec.title, 38)} · 预览总览`, { size: 32, weight: 800, color: theme.foreground }),
    thumbs,
    "</svg>",
  ].join("\n");
}

function build_preview(spec_path, output_dir) {
  const spec = read_json(spec_path);
  if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
    throw new Error("spec.slides must be a non-empty array");
  }
  const theme = normalize_theme(spec.theme || {});
  const absolute_output = path.resolve(output_dir || "preview");
  fs.mkdirSync(absolute_output, { recursive: true });
  spec.slides.forEach((slide, index) => {
    const file_name = `slide-${String(index + 1).padStart(2, "0")}.svg`;
    fs.writeFileSync(
      path.join(absolute_output, file_name),
      `${render_slide_svg(slide, theme, index + 1, spec.slides.length)}\n`,
      "utf8"
    );
  });
  fs.writeFileSync(
    path.join(absolute_output, "contact-sheet.svg"),
    `${render_contact_sheet(spec, theme)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({ ok: true, output_dir: absolute_output, slide_count: spec.slides.length }, null, 2));
}

function main() {
  try {
    const args = parse_args(process.argv);
    if (args.help) {
      console.log(usage());
      return;
    }
    build_preview(args.spec, args.output_dir);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
