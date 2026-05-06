import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


repo_root = Path(__file__).resolve().parents[1]


class transparent_asset_generation_tests(unittest.TestCase):
    def test_chroma_key_cleanup_trims_and_preserves_asset_pixels(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            source_path = tmp_path / "source.png"
            output_path = tmp_path / "asset.png"
            report_path = tmp_path / "report.json"

            image = Image.new("RGB", (64, 64), "#ff00ff")
            for y in range(20, 44):
                for x in range(18, 42):
                    image.putpixel((x, y), (20, 80, 220))
            image.save(source_path)

            subprocess.run(
                [
                    sys.executable,
                    str(
                        repo_root
                        / "skills"
                        / "transparent-asset-generation"
                        / "scripts"
                        / "prepare_transparent_asset.py"
                    ),
                    "--input",
                    str(source_path),
                    "--output",
                    str(output_path),
                    "--background",
                    "#ff00ff",
                    "--threshold",
                    "8",
                    "--trim",
                    "--padding",
                    "2",
                    "--report",
                    str(report_path),
                ],
                check=True,
            )

            output = Image.open(output_path).convert("RGBA")
            self.assertEqual(output.mode, "RGBA")
            self.assertLess(output.width, 64)
            self.assertLess(output.height, 64)
            self.assertEqual(output.getpixel((0, 0)), (0, 0, 0, 0))
            self.assertGreater(output.getpixel((output.width // 2, output.height // 2))[3], 240)

            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertTrue(report["ok"])
            self.assertEqual(report["background_rgb"], [255, 0, 255])
            self.assertGreater(report["opaque_pixels"], 0)


class animation_sprite_set_tests(unittest.TestCase):
    def test_manifest_frames_compose_to_transparent_atlas_and_gifs(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            frame_dir = tmp_path / "frames"
            frame_dir.mkdir()

            frame_paths = []
            colors = [(220, 40, 40, 255), (40, 180, 90, 255), (40, 80, 220, 255)]
            for index, color in enumerate(colors):
                frame = Image.new("RGBA", (12, 12), (0, 0, 0, 0))
                for y in range(2, 10):
                    for x in range(2, 10):
                        frame.putpixel((x, y), color)
                path = frame_dir / f"frame_{index}.png"
                frame.save(path)
                frame_paths.append(path.name)

            manifest_path = tmp_path / "manifest.json"
            manifest_path.write_text(
                json.dumps(
                    {
                        "cell_width": 16,
                        "cell_height": 16,
                        "columns": 3,
                        "states": [
                            {
                                "name": "idle",
                                "row": 0,
                                "frames": frame_paths[:2],
                                "durations_ms": [120, 180],
                            },
                            {
                                "name": "working",
                                "row": 1,
                                "frames": frame_paths,
                                "durations_ms": [90, 90, 140],
                            },
                        ],
                    },
                    indent=2,
                ),
                encoding="utf-8",
            )

            atlas_path = tmp_path / "atlas.png"
            output_dir = tmp_path / "out"

            subprocess.run(
                [
                    sys.executable,
                    str(
                        repo_root
                        / "skills"
                        / "animation-sprite-set"
                        / "scripts"
                        / "compose_sprite_set.py"
                    ),
                    "--manifest",
                    str(manifest_path),
                    "--frames-dir",
                    str(frame_dir),
                    "--output-atlas",
                    str(atlas_path),
                    "--output-dir",
                    str(output_dir),
                    "--gif",
                ],
                check=True,
            )

            atlas = Image.open(atlas_path).convert("RGBA")
            self.assertEqual(atlas.size, (48, 32))
            unused_cell = atlas.crop((32, 0, 48, 16))
            self.assertEqual(unused_cell.getbbox(), None)
            self.assertTrue((output_dir / "idle.gif").is_file())
            self.assertTrue((output_dir / "working.gif").is_file())

            report = json.loads((output_dir / "sprite-set-report.json").read_text(encoding="utf-8"))
            self.assertTrue(report["ok"])
            self.assertEqual(report["atlas"]["columns"], 3)
            self.assertEqual(len(report["states"]), 2)


if __name__ == "__main__":
    unittest.main()
