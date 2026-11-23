import asyncio
from pathlib import Path
from typing import Dict, Any
from .base_node import BaseNode
from config import RAW_DIR
from gemini_bridge import generate_image_via_gemini_cdp

class GeminiNode(BaseNode):
    node_type = "geminiNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = inputs.get("prompt") or self.config.get("prompt") or "A fantasy game item"
        job_id = context.get("job_id", "test_job")
        
        raw_filename = f"{job_id}_gemini_raw.png"
        raw_path = RAW_DIR / raw_filename

        print(f"[GeminiNode:{self.node_id}] Bắt đầu điều khiển Chrome CDP sinh ảnh cho prompt: {prompt}")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            generate_image_via_gemini_cdp,
            prompt,
            raw_path
        )

        return {
            "image_path": str(raw_path),
            "raw_filename": raw_filename,
            "prompt": prompt,
            "status": "success"
        }
