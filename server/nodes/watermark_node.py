import asyncio
from pathlib import Path
from typing import Dict, Any
from PIL import Image, ImageDraw, ImageFont
from .base_node import BaseNode
from config import OUTPUT_DIR

class WatermarkNode(BaseNode):
    node_type = "watermarkNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        image_path_str = inputs.get("image_path")
        if not image_path_str:
            raise ValueError(f"[WatermarkNode:{self.node_id}] Không nhận được image_path từ node trước!")

        input_path = Path(image_path_str)
        job_id = context.get("job_id", "job")
        output_filename = f"{job_id}_watermarked.png"
        output_path = OUTPUT_DIR / output_filename

        text = self.config.get("text", "© Studio Flow AI")
        position = self.config.get("position", "bottom-right")  # bottom-right | bottom-left | center
        opacity = int(self.config.get("opacity", 180))  # 0 - 255

        def apply_wm():
            with Image.open(input_path).convert("RGBA") as base_img:
                # Tạo lớp overlay trong suốt
                overlay = Image.new("RGBA", base_img.size, (255, 255, 255, 0))
                draw = ImageDraw.Draw(overlay)
                
                # Tính toán kích thước font
                font_size = max(16, int(base_img.width * 0.025))
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except Exception:
                    font = ImageFont.load_default()

                bbox = draw.textbbox((0, 0), text, font=font)
                text_w = bbox[2] - bbox[0]
                text_h = bbox[3] - bbox[1]

                pad = 20
                if position == "bottom-right":
                    xy = (base_img.width - text_w - pad, base_img.height - text_h - pad)
                elif position == "bottom-left":
                    xy = (pad, base_img.height - text_h - pad)
                else:
                    xy = ((base_img.width - text_w) // 2, (base_img.height - text_h) // 2)

                # Vẽ viền bóng đen mờ và chữ trắng có opacity
                draw.text((xy[0] + 1, xy[1] + 1), text, fill=(0, 0, 0, opacity // 2), font=font)
                draw.text(xy, text, fill=(255, 255, 255, opacity), font=font)

                # Trộn layer
                watermarked = Image.alpha_composite(base_img, overlay)
                watermarked.save(output_path, format="PNG")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, apply_wm)

        print(f"[WatermarkNode:{self.node_id}] Đã chèn watermark: '{text}' vào vị trí {position}")

        return {
            "image_path": str(output_path),
            "output_filename": output_filename,
            "status": "success"
        }
