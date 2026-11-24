import asyncio
import json
import urllib.request
import urllib.parse
from pathlib import Path
from typing import Dict, Any, List, Optional
from .base_node import BaseNode

CDP_PORT = 9222
SUPPORTED_AGENTS = [
    "gemini.google.com",
    "claude.ai",
    "chatgpt.com",
    "chat.openai.com",
    "grok.com"
]

def fetch_json(url: str, timeout: float = 2.0) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": "StudioFlow/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode())

def create_new_tab(url: str = "https://gemini.google.com/app", port: int = CDP_PORT) -> Dict[str, Any]:
    encoded_url = urllib.parse.quote(url, safe="")
    req = urllib.request.Request(f"http://127.0.0.1:{port}/json/new?{encoded_url}", method="PUT")
    with urllib.request.urlopen(req, timeout=5.0) as response:
        return json.loads(response.read().decode())

class TabPoolManager:
    """Quản lý và điều phối các Tab Web Agent trên trình duyệt Chrome Debug."""

    @staticmethod
    async def list_agent_tabs(port: int = CDP_PORT) -> List[Dict[str, Any]]:
        try:
            tabs = fetch_json(f"http://127.0.0.1:{port}/json")
            agent_tabs = [
                t for t in tabs
                if t.get("type") == "page" and any(pattern in t.get("url", "") for pattern in SUPPORTED_AGENTS)
            ]
            return agent_tabs
        except Exception as e:
            print(f"[TabPool Error] Không thể kết nối CDP {port}: {e}")
            return []

    @staticmethod
    async def get_or_create_idle_tab(port: int = CDP_PORT, max_tabs: int = 4) -> Dict[str, Any]:
        tabs = await TabPoolManager.list_agent_tabs(port)
        
        # Nếu chưa có tab nào, mở tab mới
        if not tabs:
            print("[TabPool] Không tìm thấy tab nào, đang tạo tab mới...")
            new_tab = create_new_tab("https://gemini.google.com/app", port)
            await asyncio.sleep(4)
            return new_tab

        # Hiện tại trả về tab đầu tiên nếu có 1 tab, hoặc nếu cần scale có thể kiểm tra trạng thái
        return tabs[0]

class AgentBuilderNode(BaseNode):
    """
    Node điều phối nhiệm vụ tới Builder Agent (Gemini / Claude / ChatGPT)
    thông qua Chrome DevTools Protocol và AkiMCP.
    """
    node_type: str = "agentBuilderNode"

    async def execute(self, inputs: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        plan_path = inputs.get("plan_path") or self.config.get("plan_path")
        extra_note = inputs.get("extra_note") or self.config.get("extra_note", "")
        max_tabs = int(self.config.get("max_tabs", 3))

        if not plan_path:
            raise ValueError("[AgentBuilderNode] Thiếu đường dẫn file plan (plan_path)!")

        abs_plan = Path(plan_path).resolve()
        if not abs_plan.exists():
            raise FileNotFoundError(f"[AgentBuilderNode] File plan không tồn tại: {abs_plan}")

        print(f"[AgentBuilderNode] Đang điều phối plan: {abs_plan} sang Web Agent...")

        # Sử dụng dispatcher Node script toàn cục
        import subprocess
        cmd = [
            "node",
            r"C:\Users\Tran Hoang Quan\bin\dispatch_to_agent.js",
            str(abs_plan),
            extra_note
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()

        stdout_str = stdout.decode(errors="replace")
        stderr_str = stderr.decode(errors="replace")

        if proc.returncode != 0:
            print(f"[AgentBuilderNode Error] {stderr_str}")
            raise RuntimeError(f"Dispatch thất bại: {stderr_str or stdout_str}")

        print(f"[AgentBuilderNode Success] {stdout_str.strip()}")

        return {
            "status": "dispatched",
            "plan_path": str(abs_plan),
            "output": stdout_str.strip(),
            "target": "Web Agent (AkiMCP)"
        }
