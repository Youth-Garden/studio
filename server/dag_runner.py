import asyncio
from typing import Dict, Any, List, Callable, Optional
from collections import defaultdict, deque
from nodes import create_node_instance

class DAGRunner:
    """
    Động cơ duyệt đồ thị Topological Sort (Kahn's Algorithm)
    Tự động phân tích các dây nối (edges), xác định thứ tự thực thi,
    và hỗ trợ chạy song song các node phân nhánh.
    """

    def __init__(self, workflow_data: Dict[str, Any], context: Dict[str, Any], on_node_status: Optional[Callable] = None):
        self.workflow_data = workflow_data
        self.context = context
        self.on_node_status = on_node_status  # Callback thông báo trạng thái node (running, success, error)
        
        self.nodes = {n["id"]: n for n in workflow_data.get("nodes", [])}
        self.edges = workflow_data.get("edges", [])

        # Xây dựng đồ thị kề (adjacency list) và tính bậc vào (in-degree)
        self.adj = defaultdict(list)
        self.in_degree = {nid: 0 for nid in self.nodes}

        for edge in self.edges:
            src = edge.get("source")
            tgt = edge.get("target")
            if src in self.nodes and tgt in self.nodes:
                self.adj[src].append(tgt)
                self.in_degree[tgt] += 1

        # Bộ nhớ lưu trữ kết quả đầu ra của từng Node
        self.node_outputs: Dict[str, Dict[str, Any]] = {}

    def get_execution_order(self) -> List[List[str]]:
        """
        Duyệt đồ thị theo từng tầng (Wave / Layer).
        Các node trong cùng 1 tầng độc lập với nhau và CÓ THỂ CHẠY SONG SONG.
        """
        in_deg = self.in_degree.copy()
        queue = deque([nid for nid, deg in in_deg.items() if deg == 0])
        layers = []

        visited_count = 0
        while queue:
            current_layer = []
            for _ in range(len(queue)):
                u = queue.popleft()
                current_layer.append(u)
                visited_count += 1
                for v in self.adj[u]:
                    in_deg[v] -= 1
                    if in_deg[v] == 0:
                        queue.append(v)
            layers.append(current_layer)

        if visited_count < len(self.nodes):
            raise ValueError("Đồ thị workflow bị vòng lặp kín (Cycle detected in workflow graph)!")

        return layers

    async def run(self) -> Dict[str, Any]:
        """Thực thi toàn bộ đồ thị DAG"""
        layers = self.get_execution_order()
        total_nodes = len(self.nodes)
        completed_nodes = 0

        print(f"[DAG Runner] Bắt đầu chạy workflow với {total_nodes} nodes qua {len(layers)} tầng thực thi.")

        for layer_idx, layer in enumerate(layers):
            print(f"[DAG Runner] Thực thi tầng {layer_idx + 1}: {layer}")
            
            # Chạy song song tất cả các node trong cùng 1 tầng
            tasks = [self._execute_single_node(node_id) for node_id in layer]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for node_id, res in zip(layer, results):
                if isinstance(res, Exception):
                    if self.on_node_status:
                        await self.on_node_status(node_id, "error", str(res))
                    raise res
                
                self.node_outputs[node_id] = res
                completed_nodes += 1
                if self.on_node_status:
                    await self.on_node_status(node_id, "success", res)

        # Trả về kết quả tổng hợp của tất cả các node
        final_summary = {}
        for nid, out in self.node_outputs.items():
            final_summary.update(out)
        return final_summary

    async def _execute_single_node(self, node_id: str) -> Dict[str, Any]:
        node_def = self.nodes[node_id]
        node_type = node_def.get("type")
        config = node_def.get("data", {})

        # Kiểm tra xem node có bị tạm tắt (bypassed) hay không
        if config.get("isBypassed"):
            print(f"[DAG Runner] Node [{node_id}] đang bị Bypass -> Chuyển tiếp dữ liệu không xử lý.")
            if self.on_node_status:
                await self.on_node_status(node_id, "success", {"bypassed": True})
            # Thu thập input từ các node trước và chuyển thẳng qua
            incoming_data = self._collect_inputs_for_node(node_id)
            return incoming_data

        if self.on_node_status:
            await self.on_node_status(node_id, "running", None)

        # Thu thập inputs từ các node đầu vào trỏ tới node này
        inputs = self._collect_inputs_for_node(node_id)

        # Khởi tạo instance và thực thi
        node_instance = create_node_instance(node_id, node_type, config)
        return await node_instance.execute(inputs, self.context)

    def _collect_inputs_for_node(self, node_id: str) -> Dict[str, Any]:
        """Thu thập toàn bộ dữ liệu output từ các node nối dây vào node_id"""
        merged_inputs = {}
        # Lấy initial payload từ context làm mặc định ban đầu
        merged_inputs.update(self.context.get("initial_payload", {}))

        for edge in self.edges:
            if edge.get("target") == node_id:
                src_id = edge.get("source")
                if src_id in self.node_outputs:
                    merged_inputs.update(self.node_outputs[src_id])

        return merged_inputs
