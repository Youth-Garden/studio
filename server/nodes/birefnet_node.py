import asyncio
from pathlib import Path
from typing import Dict, Any
from .base_node import BaseNode
from config import TRANSPARENT_DIR
from pipeline import remove_background

class BirefnetNode(BaseNode):
    node_type = "birefnetNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        # Lấy ảnh đầu vào từ node trước
        image_path_str = inputs.get("image_path")
        if not image_path_str:
            raise ValueError(f"[BirefnetNode:{self.node_id}] Không nhận được image_path từ node đầu vào!")
        
        input_path = Path(image_path_str)
        if not input_path.exists():
            raise FileNotFoundError(f"[BirefnetNode:{self.node_id}] File ảnh không tồn tại: {input_path}")

        job_id = context.get("job_id", "test_job")
        trans_filename = f"{job_id}_transparent.png"
        trans_path = TRANSPARENT_DIR / trans_filename

        model_name = self.config.get("modelName", "birefnet-general")
        print(f"[BirefnetNode:{self.node_id}] Đang tách nền bằng model: {model_name}...")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            remove_background,
            input_path,
            trans_path,
            model_name
        )

        return {
            "image_path": str(trans_path),
            "transparent_filename": trans_filename,
            "raw_filename": inputs.get("raw_filename"),
            "status": "success"
        }
