from typing import Dict, Any
from .base_node import BaseNode

class TriggerNode(BaseNode):
    node_type = "triggerNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        # Prioritize prompt passed dynamically via webhook/API payload over the static config on canvas
        prompt = (
            context.get("initial_payload", {}).get("prompt")
            or inputs.get("prompt")
            or self.config.get("prompt")
            or "A fantasy item"
        )
        mode = self.config.get("mode", "gemini_prompt")
        print(f"[TriggerNode:{self.node_id}] Nhận input prompt: '{prompt}' (Mode: {mode})")
        return {
            "prompt": prompt,
            "mode": mode,
            "status": "success"
        }
