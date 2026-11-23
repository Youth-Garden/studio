import asyncio
from pathlib import Path
from typing import Dict, Any
from .base_node import BaseNode
from config import OUTPUT_DIR
from pipeline import compose_banner

class BannerNode(BaseNode):
    node_type = "bannerNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        image_path_str = inputs.get("image_path")
        if not image_path_str:
            raise ValueError(f"[BannerNode:{self.node_id}] Không nhận được image_path từ node đầu vào!")

        input_path = Path(image_path_str)
        job_id = context.get("job_id", "test_job")
        output_filename = f"{job_id}_banner.png"
        output_path = OUTPUT_DIR / output_filename

        initial = context.get("initial_payload", {})
        width = int(self.config.get("width") or initial.get("width", 1280))
        height = int(self.config.get("height") or initial.get("height", 720))
        bg_color = self.config.get("bgColor") or initial.get("bg_color", "#1e1e2e")
        contrast = float(self.config.get("contrast") or initial.get("contrast", 1.05))
        sharpness = float(self.config.get("sharpness") or initial.get("sharpness", 1.2))

        print(f"[BannerNode:{self.node_id}] Tạo banner ({width}x{height}, bg: {bg_color})...")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            compose_banner,
            input_path,
            output_path,
            width,
            height,
            bg_color,
            {
                "contrast": contrast,
                "sharpness": sharpness
            }
        )

        return {
            "image_path": str(output_path),
            "output_filename": output_filename,
            "transparent_filename": inputs.get("transparent_filename"),
            "raw_filename": inputs.get("raw_filename"),
            "width": width,
            "height": height,
            "status": "success"
        }
