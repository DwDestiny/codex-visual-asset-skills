import json
import os
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path

from PIL import Image


repo_root = Path(__file__).resolve().parents[1]
runtime_node = Path(
    "/Users/dw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
)


class visual_ppt_deck_builder_tests(unittest.TestCase):
    def node_executable(self):
        if runtime_node.is_file():
            return str(runtime_node)
        return "node"

    def test_deck_spec_builds_editable_pptx_with_media(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            asset_path = tmp_path / "transparent_asset.png"
            image = Image.new("RGBA", (240, 180), (0, 0, 0, 0))
            for y_index in range(40, 140):
                for x_index in range(55, 185):
                    image.putpixel((x_index, y_index), (32, 140, 210, 255))
            image.save(asset_path)

            spec_path = tmp_path / "deck_spec.json"
            output_path = tmp_path / "visual_ppt_deck.pptx"
            spec_path.write_text(
                json.dumps(
                    {
                        "title": "AI 视觉素材生产线",
                        "subtitle": "透明素材到可编辑 PPTX",
                        "author": "Codex",
                        "theme": {
                            "background": "F7F4EF",
                            "foreground": "17202A",
                            "accent": "1F8A70",
                            "accent_2": "E76F51",
                            "muted": "6B7280",
                            "font_face": "Aptos",
                        },
                        "slides": [
                            {
                                "layout": "title",
                                "title": "AI 视觉素材生产线",
                                "subtitle": "先定主题，再定风格，最后交付 PPTX",
                            },
                            {
                                "layout": "image_text",
                                "title": "透明素材是视觉组件",
                                "body": "每个素材都可以叠加到网页、PPT、海报和产品界面。",
                                "bullets": ["纯色底生图", "透明背景清理", "组合到页面"],
                                "image": str(asset_path),
                            },
                            {
                                "layout": "bar_chart",
                                "title": "素材复用效率",
                                "body": "用形状绘制的图表可继续编辑。",
                                "chart": {
                                    "labels": ["网站", "PPT", "App"],
                                    "values": [42, 68, 55],
                                    "unit": "%",
                                },
                            },
                            {
                                "layout": "closing",
                                "title": "交付物",
                                "body": "可编辑 PPTX + 透明素材 + 风格说明。",
                            },
                        ],
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
                encoding="utf-8",
            )

            subprocess.run(
                [
                    self.node_executable(),
                    str(
                        repo_root
                        / "skills"
                        / "visual-ppt-deck-builder"
                        / "scripts"
                        / "build_visual_pptx.js"
                    ),
                    "--spec",
                    str(spec_path),
                    "--output",
                    str(output_path),
                ],
                check=True,
                env={**os.environ, "NODE_PATH": self.node_modules_path()},
            )

            self.assertTrue(output_path.is_file())
            self.assertGreater(output_path.stat().st_size, 10_000)
            with zipfile.ZipFile(output_path) as pptx_zip:
                entries = set(pptx_zip.namelist())
                slide_entries = [entry for entry in entries if entry.startswith("ppt/slides/slide")]
                media_entries = [entry for entry in entries if entry.startswith("ppt/media/")]
                self.assertGreaterEqual(len(slide_entries), 4)
                self.assertTrue(media_entries)
                self.assertIn("ppt/presentation.xml", entries)

    def test_deck_spec_requires_slides(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            spec_path = tmp_path / "bad_spec.json"
            output_path = tmp_path / "bad.pptx"
            spec_path.write_text(json.dumps({"title": "Bad"}), encoding="utf-8")

            result = subprocess.run(
                [
                    self.node_executable(),
                    str(
                        repo_root
                        / "skills"
                        / "visual-ppt-deck-builder"
                        / "scripts"
                        / "build_visual_pptx.js"
                    ),
                    "--spec",
                    str(spec_path),
                    "--output",
                    str(output_path),
                ],
                text=True,
                capture_output=True,
                env={**os.environ, "NODE_PATH": self.node_modules_path()},
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("slides", result.stderr)
            self.assertFalse(output_path.exists())

    def node_modules_path(self):
        return "/Users/dw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"


if __name__ == "__main__":
    unittest.main()
