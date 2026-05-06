#!/usr/bin/env python3
"""Clean a flat-background image into a transparent PNG asset."""

from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path

from PIL import Image


def parse_hex_color(raw_value: str) -> tuple[int, int, int]:
    value = raw_value.strip()
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
        raise SystemExit(f"invalid --background value: {raw_value}; expected #RRGGBB")
    return tuple(int(value[index : index + 2], 16) for index in (1, 3, 5))


def color_distance(pixel: tuple[int, int, int], background_rgb: tuple[int, int, int]) -> float:
    red, green, blue = pixel
    return math.sqrt(
        (red - background_rgb[0]) ** 2
        + (green - background_rgb[1]) ** 2
        + (blue - background_rgb[2]) ** 2
    )


def infer_corner_background(image: Image.Image) -> tuple[int, int, int]:
    rgb_image = image.convert("RGB")
    width, height = rgb_image.size
    sample_points = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
    ]
    samples = [rgb_image.getpixel(point) for point in sample_points]
    return tuple(round(sum(pixel[channel] for pixel in samples) / len(samples)) for channel in range(3))


def remove_background(
    image: Image.Image,
    *,
    background_rgb: tuple[int, int, int],
    threshold: float,
) -> tuple[Image.Image, int, int]:
    rgba_image = image.convert("RGBA")
    pixels = rgba_image.load()
    transparent_pixels = 0
    opaque_pixels = 0

    for y_index in range(rgba_image.height):
        for x_index in range(rgba_image.width):
            red, green, blue, alpha = pixels[x_index, y_index]
            if alpha == 0:
                pixels[x_index, y_index] = (0, 0, 0, 0)
                transparent_pixels += 1
                continue
            if color_distance((red, green, blue), background_rgb) <= threshold:
                pixels[x_index, y_index] = (0, 0, 0, 0)
                transparent_pixels += 1
            else:
                opaque_pixels += 1

    return rgba_image, transparent_pixels, opaque_pixels


def trim_image(image: Image.Image, padding: int) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        return image
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def positive_float(raw_value: str) -> float:
    value = float(raw_value)
    if value < 0:
        raise argparse.ArgumentTypeError("value must be >= 0")
    return value


def non_negative_int(raw_value: str) -> int:
    value = int(raw_value)
    if value < 0:
        raise argparse.ArgumentTypeError("value must be >= 0")
    return value


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Source image with a flat removable background.")
    parser.add_argument("--output", required=True, help="Output transparent PNG path.")
    parser.add_argument(
        "--background",
        help="Background color to remove, as #RRGGBB. Defaults to the average corner color.",
    )
    parser.add_argument("--threshold", type=positive_float, default=24.0)
    parser.add_argument("--trim", action="store_true", help="Crop transparent edges after cleanup.")
    parser.add_argument("--padding", type=non_negative_int, default=0)
    parser.add_argument("--report", help="Optional JSON report path.")
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()
    report_path = Path(args.report).expanduser().resolve() if args.report else None

    if not input_path.is_file():
        raise SystemExit(f"input image does not exist: {input_path}")
    if output_path.suffix.lower() != ".png":
        raise SystemExit("output must be a .png file so transparency is preserved")

    try:
        with Image.open(input_path) as opened_image:
            source_image = opened_image.convert("RGBA")
    except Exception as exc:  # noqa: BLE001
        raise SystemExit(f"could not open input image: {exc}") from exc

    background_rgb = parse_hex_color(args.background) if args.background else infer_corner_background(source_image)
    cleaned_image, transparent_pixels, opaque_pixels = remove_background(
        source_image,
        background_rgb=background_rgb,
        threshold=args.threshold,
    )
    final_image = trim_image(cleaned_image, args.padding) if args.trim else cleaned_image

    output_path.parent.mkdir(parents=True, exist_ok=True)
    final_image.save(output_path)

    result = {
        "ok": opaque_pixels > 0,
        "input": str(input_path),
        "output": str(output_path),
        "background_rgb": list(background_rgb),
        "threshold": args.threshold,
        "trimmed": bool(args.trim),
        "padding": args.padding,
        "width": final_image.width,
        "height": final_image.height,
        "transparent_pixels": transparent_pixels,
        "opaque_pixels": opaque_pixels,
    }
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["ok"] else 1)


if __name__ == "__main__":
    main()
