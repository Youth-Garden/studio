from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseNode(ABC):
    """Lớp cơ sở cho toàn bộ các Node trong hệ thống Auto Flow"""
    
    node_type: str = "base"

    def __init__(self, node_id: str, config: Dict[str, Any]):
        self.node_id = node_id
        self.config = config

    @abstractmethod
    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Thực thi logic của Node.
        inputs: Dữ liệu nhận được từ các node đầu vào nối tới node này
        context: Thông tin toàn cục của Job (job_id, storage paths, v.v.)
        return: Dict chứa kết quả đầu ra của node này (sẽ truyền cho các node kế tiếp)
        """
        pass
