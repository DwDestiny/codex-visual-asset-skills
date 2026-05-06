#!/usr/bin/env python3
"""Generate demo assets for the two Codex pet asset skills."""

from __future__ import annotations

import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


repo_root = Path(__file__).resolve().parents[1]
demo_root = repo_root / "demos"
source_dir = demo_root / "source"
transparent_dir = demo_root / "transparent-assets"
animation_dir = demo_root / "animation-sprite-set"
frame_dir = animation_dir / "frames"
qa_dir = animation_dir / "qa"
preview_dir = demo_root / "preview"

transparent_script = (
    repo_root
    / "skills"
    / "transparent-asset-generation"
    / "scripts"
    / "prepare_transparent_asset.py"
)
sprite_script = (
    repo_root / "skills" / "animation-sprite-set" / "scripts" / "compose_sprite_set.py"
)


def reset_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def draw_avatar(
    *,
    style: str,
    background: str,
    hair: str,
    jacket: str,
    accent: str,
    output_path: Path,
    arm_angle: float = 0.0,
    bob: int = 0,
) -> None:
    image = Image.new("RGBA", (512, 512), background)
    draw = ImageDraw.Draw(image)

    cx = 256
    cy = 248 + bob
    outline = "#1f2933"
    skin = "#f6c7a8"
    cheek = "#e88d84"

    if style == "watercolor":
        for radius, alpha in [(145, 36), (115, 48), (82, 64)]:
            overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            overlay_draw.ellipse(
                (cx - radius, cy - 118 - radius, cx + radius, cy - 118 + radius),
                fill=(*Image.new("RGB", (1, 1), accent).getpixel((0, 0)), alpha),
            )
            overlay = overlay.filter(ImageFilter.GaussianBlur(16))
            image.alpha_composite(overlay)
        draw = ImageDraw.Draw(image)

    if style == "pixel":
        outline_width = 8
        draw.rectangle((178, 118 + bob, 334, 274 + bob), fill=hair, outline=outline, width=outline_width)
        draw.rectangle((194, 160 + bob, 318, 292 + bob), fill=skin, outline=outline, width=outline_width)
        draw.rectangle((152, 300 + bob, 360, 438 + bob), fill=jacket, outline=outline, width=outline_width)
        draw.rectangle((210, 336 + bob, 302, 438 + bob), fill="#fff7ed", outline=outline, width=outline_width)
        draw.rectangle((214, 214 + bob, 230, 230 + bob), fill=outline)
        draw.rectangle((282, 214 + bob, 298, 230 + bob), fill=outline)
        draw.rectangle((232, 260 + bob, 280, 270 + bob), fill="#b45309")
        draw.rectangle((142, 318 + bob, 190, 390 + bob), fill=jacket, outline=outline, width=outline_width)
        hand_x = 366 + round(math.sin(arm_angle) * 10)
        hand_y = 218 - round(math.cos(arm_angle) * 48) + bob
        draw.line((344, 324 + bob, hand_x, hand_y), fill=outline, width=18)
        draw.rectangle((hand_x - 16, hand_y - 16, hand_x + 16, hand_y + 16), fill=skin, outline=outline, width=6)
        draw.rectangle((196, 142 + bob, 316, 178 + bob), fill=hair)
        draw.rectangle((166, 176 + bob, 202, 276 + bob), fill=hair)
        draw.rectangle((310, 176 + bob, 346, 276 + bob), fill=hair)
    else:
        outline_width = 5 if style != "line-art" else 6
        draw.ellipse((168, 112 + bob, 344, 304 + bob), fill=hair, outline=outline, width=outline_width)
        draw.rounded_rectangle(
            (190, 156 + bob, 322, 318 + bob),
            radius=54,
            fill=skin,
            outline=outline,
            width=outline_width,
        )
        draw.pieslice((154, 116 + bob, 358, 298 + bob), 190, 350, fill=hair, outline=outline, width=outline_width)
        draw.rounded_rectangle(
            (144, 306 + bob, 368, 454 + bob),
            radius=48,
            fill=jacket,
            outline=outline,
            width=outline_width,
        )
        draw.polygon(
            [(214, 318 + bob), (298, 318 + bob), (282, 454 + bob), (230, 454 + bob)],
            fill="#fff7ed",
            outline=outline,
        )
        draw.ellipse((210, 216 + bob, 226, 232 + bob), fill=outline)
        draw.ellipse((286, 216 + bob, 302, 232 + bob), fill=outline)
        draw.arc((226, 248 + bob, 286, 286 + bob), 20, 160, fill="#a43f3a", width=4)
        draw.ellipse((196, 242 + bob, 220, 256 + bob), fill=cheek)
        draw.ellipse((292, 242 + bob, 316, 256 + bob), fill=cheek)
        draw.line((168, 348 + bob, 120, 402 + bob), fill=outline, width=18)
        draw.ellipse((104, 388 + bob, 138, 422 + bob), fill=skin, outline=outline, width=4)
        hand_x = 372 + round(math.sin(arm_angle) * 18)
        hand_y = 210 - round(math.cos(arm_angle) * 58) + bob
        draw.line((344, 340 + bob, hand_x, hand_y), fill=outline, width=18)
        draw.ellipse((hand_x - 19, hand_y - 19, hand_x + 19, hand_y + 19), fill=skin, outline=outline, width=4)
        draw.arc((hand_x - 44, hand_y - 44, hand_x + 44, hand_y + 44), 250, 325, fill=accent, width=4)
        if style == "neon":
            glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
            glow_draw = ImageDraw.Draw(glow)
            glow_draw.rounded_rectangle((132, 294 + bob, 380, 466 + bob), radius=54, outline=accent, width=12)
            glow = glow.filter(ImageFilter.GaussianBlur(9))
            image.alpha_composite(glow)
            draw = ImageDraw.Draw(image)
            draw.rounded_rectangle((144, 306 + bob, 368, 454 + bob), radius=48, outline=outline, width=outline_width)

    image.save(output_path)


def run_transparent_cleanup(source_path: Path, output_path: Path, report_path: Path, background: str) -> None:
    subprocess.run(
        [
            sys.executable,
            str(transparent_script),
            "--input",
            str(source_path),
            "--output",
            str(output_path),
            "--background",
            background,
            "--threshold",
            "18",
            "--trim",
            "--padding",
            "12",
            "--report",
            str(report_path),
        ],
        check=True,
    )


def build_animation_demo() -> None:
    styles = {
        "style": "line-art",
        "background": "#00ff00",
        "hair": "#263238",
        "jacket": "#2f80ed",
        "accent": "#f59e0b",
    }
    frames = []
    for index, (angle, bob) in enumerate([(0.0, 2), (0.45, -2), (0.85, -4), (0.45, -2), (0.0, 2), (-0.25, 0)]):
        raw_path = source_dir / f"wave_source_{index:02d}.png"
        frame_path = frame_dir / f"wave_{index:02d}.png"
        report_path = qa_dir / f"wave_{index:02d}_transparent_report.json"
        draw_avatar(output_path=raw_path, arm_angle=angle, bob=bob, **styles)
        run_transparent_cleanup(raw_path, frame_path, report_path, styles["background"])
        frames.append(frame_path.name)

    manifest = {
        "cell_width": 192,
        "cell_height": 208,
        "columns": 6,
        "states": [
            {
                "name": "waving",
                "row": 0,
                "frames": frames,
                "durations_ms": [140, 120, 140, 120, 160, 180],
            }
        ],
    }
    manifest_path = animation_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    subprocess.run(
        [
            sys.executable,
            str(sprite_script),
            "--manifest",
            str(manifest_path),
            "--frames-dir",
            str(frame_dir),
            "--output-atlas",
            str(animation_dir / "waving-atlas.png"),
            "--output-dir",
            str(qa_dir),
            "--gif",
        ],
        check=True,
    )


def write_preview() -> None:
    preview_path = preview_dir / "index.html"
    preview_path.write_text(
        """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Codex Pet Asset Skills Demo</title>
  <style>
    :root { color-scheme: light; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: #f6f3ee; color: #1f2933; }
    main { max-width: 1120px; margin: 0 auto; padding: 36px 20px 48px; }
    h1 { font-size: 32px; margin: 0 0 10px; }
    h2 { font-size: 22px; margin-top: 34px; }
    p { line-height: 1.6; color: #52606d; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
    .card { background: #ffffff; border: 1px solid #ded7cd; border-radius: 8px; padding: 14px; }
    .checker {
      min-height: 220px; display: grid; place-items: center; border-radius: 6px;
      background-color: #fff;
      background-image: linear-gradient(45deg, #d8dee9 25%, transparent 25%),
        linear-gradient(-45deg, #d8dee9 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #d8dee9 75%),
        linear-gradient(-45deg, transparent 75%, #d8dee9 75%);
      background-size: 24px 24px;
      background-position: 0 0, 0 12px, 12px -12px, -12px 0;
    }
    img { max-width: 100%; max-height: 260px; object-fit: contain; }
    code { background: #eef2f6; padding: 2px 5px; border-radius: 4px; }
  </style>
</head>
<body>
<main>
  <h1>Codex Pet Asset Skills Demo</h1>
  <p>Transparent PNG assets and a waving animation generated with the repository scripts.</p>
  <h2>Transparent Assets</h2>
  <div class="grid">
    <div class="card"><div class="checker"><img src="../transparent-assets/line-art-designer.png" alt="line art designer"></div><p><code>line-art-designer.png</code></p></div>
    <div class="card"><div class="checker"><img src="../transparent-assets/pixel-heroine.png" alt="pixel heroine"></div><p><code>pixel-heroine.png</code></p></div>
    <div class="card"><div class="checker"><img src="../transparent-assets/neon-developer.png" alt="neon developer"></div><p><code>neon-developer.png</code></p></div>
    <div class="card"><div class="checker"><img src="../transparent-assets/watercolor-muse.png" alt="watercolor muse"></div><p><code>watercolor-muse.png</code></p></div>
  </div>
  <h2>Animation Sprite Set</h2>
  <div class="grid">
    <div class="card"><div class="checker"><img src="../animation-sprite-set/qa/waving.gif" alt="waving gif"></div><p><code>waving.gif</code></p></div>
    <div class="card"><div class="checker"><img src="../animation-sprite-set/waving-atlas.png" alt="waving atlas"></div><p><code>waving-atlas.png</code></p></div>
  </div>
</main>
</body>
</html>
""",
        encoding="utf-8",
    )


def main() -> None:
    reset_dir(source_dir)
    reset_dir(transparent_dir)
    reset_dir(animation_dir)
    reset_dir(frame_dir)
    reset_dir(qa_dir)
    reset_dir(preview_dir)

    variants = [
        ("line-art-designer", "line-art", "#ff00ff", "#4338ca", "#ffffff", "#0ea5e9"),
        ("pixel-heroine", "pixel", "#00ff00", "#3b2f2f", "#ef4444", "#facc15"),
        ("neon-developer", "neon", "#ff00ff", "#0f172a", "#111827", "#22d3ee"),
        ("watercolor-muse", "watercolor", "#00ff00", "#7c2d12", "#a7f3d0", "#60a5fa"),
    ]

    for name, style, background, hair, jacket, accent in variants:
        source_path = source_dir / f"{name}-source.png"
        output_path = transparent_dir / f"{name}.png"
        report_path = transparent_dir / f"{name}-report.json"
        draw_avatar(
            style=style,
            background=background,
            hair=hair,
            jacket=jacket,
            accent=accent,
            output_path=source_path,
        )
        run_transparent_cleanup(source_path, output_path, report_path, background)

    build_animation_demo()
    write_preview()


if __name__ == "__main__":
    main()
