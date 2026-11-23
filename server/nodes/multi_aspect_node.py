import asyncio
from pathlib import Path
from typing import Dict, Any
from PIL import Image
from .base_node import BaseNode
from config import OUTPUT_DIR
from pipeline import compose_banner

class MultiAspectNode(BaseNode):
    node_type = "multiAspectNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        image_path_str = inputs.get("image_path")
        if not image_path_str:
            raise ValueError(f"[MultiAspectNode:{self.node_id}] Không nhận được image_path từ node trước!")

        input_path = Path(image_path_str)
        job_id = context.get("job_id", "job")
        bg_color = self.config.get("bgColor", "#1e1e2e")

        # 3 kích thước chuẩn đa nền tảng
        aspects = {
            "youtube": (1280, 720, f"{job_id}_youtube_16_9.png"),
            "instagram": (1080, 1080, f"{job_id}_square_1_1.png"),
            "story": (1080, 1920, f"{job_id}_story_9_16.png"),
        }

        loop = asyncio.get_event_loop()
        outputs = {}

        print(f"[MultiAspectNode:{self.node_id}] Bắt đầu phân nhánh xuất đồng thời 3 kích thước...")

        for key, (w, h, filename) in aspects.items():
            out_path = OUTPUT_DIR / filename
            await loop.run_in_executor(
                None,
                compose_banner,
                input_path,
                out_path,
                w,
                h,
                bg_color,
                {"contrast": 1.05, "sharpness": 1.2}
            )
            outputs[key] = {
                "width": w,
                "height": h,
                "filename": filename,
                "path": str(out_path)
            }

        return {
            "image_path": str(OUTPUT_DIR / aspects["youtube"][2]),
            "output_filename": aspects["youtube"][2],
            "multi_aspects": outputs,
            "status": "success",
            "message": "Đã xuất xong 3 kích thước: 16:9 (YouTube), 1:1 (Square), 9:16 (Story)"
        }
