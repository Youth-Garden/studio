from typing import Dict, Any
from .base_node import BaseNode

class OutputNode(BaseNode):
    node_type = "outputNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        output_filename = inputs.get("output_filename")
        transparent_filename = inputs.get("transparent_filename")
        raw_filename = inputs.get("raw_filename")

        print(f"[OutputNode:{self.node_id}] Đóng gói kết quả đầu ra: {output_filename}")

        return {
            "output_filename": output_filename,
            "transparent_filename": transparent_filename,
            "raw_filename": raw_filename,
            "status": "success",
            "message": "Hoàn tất xử lý toàn bộ chuỗi Flow!"
        }
