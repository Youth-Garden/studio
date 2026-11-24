from typing import Dict, Type
from .base_node import BaseNode
from .trigger_node import TriggerNode
from .gemini_node import GeminiNode
from .birefnet_node import BirefnetNode
from .banner_node import BannerNode
from .output_node import OutputNode
from .multi_aspect_node import MultiAspectNode
from .watermark_node import WatermarkNode
from .telegram_node import TelegramNode
from .agent_builder_node import AgentBuilderNode

NODE_REGISTRY: Dict[str, Type[BaseNode]] = {
    "triggerNode": TriggerNode,
    "geminiNode": GeminiNode,
    "birefnetNode": BirefnetNode,
    "bannerNode": BannerNode,
    "outputNode": OutputNode,
    "multiAspectNode": MultiAspectNode,
    "watermarkNode": WatermarkNode,
    "telegramNode": TelegramNode,
    "agentBuilderNode": AgentBuilderNode,
}

def create_node_instance(node_id: str, node_type: str, config: dict) -> BaseNode:
    cls = NODE_REGISTRY.get(node_type)
    if not cls:
        raise ValueError(f"Không tìm thấy Node type: '{node_type}' trong hệ thống!")
    return cls(node_id=node_id, config=config)
