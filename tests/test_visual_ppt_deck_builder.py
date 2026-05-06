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
                                "claim": "透明素材应该像积木一样被复用，而不是被烤死在整页截图里。",
                                "body": "每个素材都可以叠加到网页、PPT、海报和产品界面。",
                                "bullets": ["纯色底生图", "透明背景清理", "组合到页面"],
                                "image": str(asset_path),
                                "source": "内部流程样例，2026-05",
                            },
                            {
                                "layout": "bar_chart",
                                "title": "素材复用效率",
                                "claim": "可编辑图表让同一套素材能进入更多业务文档。",
                                "body": "用形状绘制的图表可继续编辑。",
                                "chart": {
                                    "labels": ["网站", "PPT", "App"],
                                    "values": [42, 68, 55],
                                    "unit": "%",
                                    "source": "示例数据，仅用于流程测试",
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
                slide_one_xml = pptx_zip.read("ppt/slides/slide1.xml").decode("utf-8")
                self.assertNotIn("<a:t>Topic</a:t>", slide_one_xml)
                self.assertNotIn("<a:t>Style</a:t>", slide_one_xml)
                self.assertNotIn("<a:t>Assets</a:t>", slide_one_xml)

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

    def test_style_candidate_helper_writes_five_visual_boards(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            output_dir = tmp_path / "style-candidates"

            subprocess.run(
                [
                    self.node_executable(),
                    str(
                        repo_root
                        / "skills"
                        / "visual-ppt-deck-builder"
                        / "scripts"
                        / "build_style_candidates.js"
                    ),
                    "--output-dir",
                    str(output_dir),
                    "--topic",
                    "普通人用 Codex 做视觉方案",
                ],
                check=True,
            )

            boards = sorted(output_dir.glob("style-board-*.svg"))
            self.assertEqual(len(boards), 5)
            self.assertTrue((output_dir / "style-candidates.md").is_file())
            for board in boards:
                content = board.read_text(encoding="utf-8")
                self.assertIn("<svg", content)
                self.assertIn("style board", content)

    def test_commercial_deck_quality_gate_accepts_rich_spec(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            spec_path = tmp_path / "commercial_spec.json"
            report_path = tmp_path / "qa_report.json"
            spec_path.write_text(
                json.dumps(self.commercial_spec(), ensure_ascii=False, indent=2),
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
                        / "validate_deck_quality.js"
                    ),
                    "--spec",
                    str(spec_path),
                    "--report",
                    str(report_path),
                ],
                check=True,
            )

            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertTrue(report["ok"])
            self.assertEqual(report["slide_count"], 8)
            self.assertGreaterEqual(report["layout_count"], 6)

    def test_commercial_deck_quality_gate_rejects_missing_claims_and_sources(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            spec = self.commercial_spec()
            spec["slides"][2].pop("claim")
            spec["slides"][4].pop("source")
            spec["slides"][4]["chart"].pop("source")
            spec["slides"][0]["kicker"] = "Topic"
            spec_path = tmp_path / "bad_commercial_spec.json"
            report_path = tmp_path / "bad_qa_report.json"
            spec_path.write_text(json.dumps(spec, ensure_ascii=False), encoding="utf-8")

            result = subprocess.run(
                [
                    self.node_executable(),
                    str(
                        repo_root
                        / "skills"
                        / "visual-ppt-deck-builder"
                        / "scripts"
                        / "validate_deck_quality.js"
                    ),
                    "--spec",
                    str(spec_path),
                    "--report",
                    str(report_path),
                ],
                text=True,
                capture_output=True,
            )

            self.assertNotEqual(result.returncode, 0)
            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertFalse(report["ok"])
            self.assertTrue(any("claim" in error for error in report["errors"]))
            self.assertTrue(any("source" in error for error in report["errors"]))
            self.assertTrue(any("placeholder" in error for error in report["errors"]))

    def test_preview_helper_writes_slide_svgs_and_contact_sheet(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            spec_path = tmp_path / "commercial_spec.json"
            preview_dir = tmp_path / "preview"
            spec_path.write_text(
                json.dumps(self.commercial_spec(), ensure_ascii=False, indent=2),
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
                        / "build_deck_preview.js"
                    ),
                    "--spec",
                    str(spec_path),
                    "--output-dir",
                    str(preview_dir),
                ],
                check=True,
            )

            self.assertTrue((preview_dir / "contact-sheet.svg").is_file())
            slides = sorted(preview_dir.glob("slide-*.svg"))
            self.assertEqual(len(slides), 8)
            contact_sheet = (preview_dir / "contact-sheet.svg").read_text(encoding="utf-8")
            slide_two = (preview_dir / "slide-02.svg").read_text(encoding="utf-8")
            self.assertIn("AI 编程工具", contact_sheet)
            self.assertIn("<tspan", slide_two)
            self.assertNotIn("…", slide_two)

    def node_modules_path(self):
        return "/Users/dw/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules"

    def commercial_spec(self):
        return {
            "title": "AI 编程工具进入企业研发流程的商业化落地方案",
            "subtitle": "从个人提效走向组织级交付能力",
            "author": "Codex",
            "theme": {
                "background": "F5F7FA",
                "foreground": "17202A",
                "accent": "1769AA",
                "accent_2": "D65A31",
                "muted": "667085",
                "panel": "FFFFFF",
                "font_face": "Aptos",
            },
            "slides": [
                {
                    "layout": "title",
                    "title": "AI 编程工具进入企业研发流程的商业化落地方案",
                    "subtitle": "面向 CTO、研发负责人和业务负责人",
                    "kicker": "组织级研发提效方案",
                },
                {
                    "layout": "executive_summary",
                    "title": "一页结论",
                    "claim": "AI 编程工具的商业价值不在“多写代码”，而在缩短需求到上线的反馈回路。",
                    "points": [
                        {"label": "01", "title": "先收口场景", "body": "从测试补齐、遗留代码解释、内部工具开发切入。"},
                        {"label": "02", "title": "再建治理", "body": "权限、代码审查、数据边界和产出验收必须同步上线。"},
                        {"label": "03", "title": "最后规模化", "body": "用指标证明收益，再扩到更多团队和业务线。"},
                    ],
                    "source": "项目方法论样例，2026-05",
                },
                {
                    "layout": "content",
                    "title": "当前痛点",
                    "claim": "企业真正卡住的不是工具采购，而是缺少可复制的接入流程。",
                    "body": "个人试用很快能看到效率，但组织推广会遇到权限、质量、知识沉淀和审查责任问题。",
                    "bullets": ["需求表达不稳定", "代码审查压力上升", "知识只留在对话里", "试点收益难量化"],
                    "source": "企业研发流程访谈模板，2026-05",
                },
                {
                    "layout": "architecture",
                    "title": "组织级接入架构",
                    "claim": "把 AI 编程工具放进研发流水线，而不是放任它成为个人外挂。",
                    "layers": [
                        {"title": "业务入口", "body": "需求卡片、设计稿、故障单、数据分析任务"},
                        {"title": "AI 工作台", "body": "代码生成、测试补齐、文档同步、变更说明"},
                        {"title": "治理层", "body": "权限、审计、上下文脱敏、模型路由、成本控制"},
                        {"title": "交付层", "body": "代码仓库、CI、评审、发布、知识库沉淀"},
                    ],
                    "source": "内部架构假设，2026-05",
                },
                {
                    "layout": "metrics",
                    "title": "价值测算口径",
                    "claim": "先用三个可观测指标判断试点是否值得扩大。",
                    "metrics": [
                        {"value": "20-35%", "label": "需求到 PR 周期下降", "body": "仅统计试点场景，不外推到全部研发。"},
                        {"value": "15-25%", "label": "测试补齐耗时下降", "body": "以同类模块和同类复杂度对比。"},
                        {"value": "2周", "label": "最小试点周期", "body": "能覆盖一次完整需求闭环。"},
                    ],
                    "chart": {
                        "labels": ["开发", "测试", "文档", "评审"],
                        "values": [28, 22, 34, 12],
                        "unit": "%",
                        "source": "示例测算模型，非外部事实",
                    },
                    "source": "示例测算模型，非外部事实",
                },
                {
                    "layout": "comparison",
                    "title": "工具路线对比",
                    "claim": "不同路线适合不同成熟度，不能只按模型热度采购。",
                    "items": [
                        {"title": "IDE 助手", "body": "上手最快，适合个人提效和局部代码生成。"},
                        {"title": "Agent 工作流", "body": "适合跨文件任务，但需要更强审查和回滚机制。"},
                        {"title": "企业平台", "body": "治理完整，但接入成本和组织改造更高。"},
                    ],
                    "source": "路线对比框架，2026-05",
                },
                {
                    "layout": "roadmap",
                    "title": "90 天落地路线",
                    "claim": "商业化落地要小步验证，避免一上来全员铺开。",
                    "phases": [
                        {"period": "第 1-2 周", "title": "选场景", "body": "挑选高频、低风险、可衡量的研发任务。"},
                        {"period": "第 3-4 周", "title": "跑闭环", "body": "形成需求、生成、审查、发布、复盘链路。"},
                        {"period": "第 5-8 周", "title": "建治理", "body": "补权限、审计、成本、知识库沉淀。"},
                        {"period": "第 9-12 周", "title": "扩团队", "body": "按指标决定扩展范围和培训节奏。"},
                    ],
                    "source": "试点计划样例，2026-05",
                },
                {
                    "layout": "risk_next_steps",
                    "title": "风险与下一步",
                    "claim": "下一步不是买更多账号，而是把试点做成可验收的业务项目。",
                    "risks": ["敏感代码和数据进入不受控上下文", "生成代码绕过评审责任", "只看速度不看返工成本"],
                    "actions": ["确定 2 个试点团队", "定义 5 个验收指标", "建立 AI 产出审查清单"],
                    "source": "项目治理清单，2026-05",
                },
            ],
        }


if __name__ == "__main__":
    unittest.main()
