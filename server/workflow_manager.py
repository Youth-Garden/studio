import json
import uuid
from pathlib import Path
from config import BASE_DIR

WORKFLOWS_DIR = BASE_DIR / "server" / "workflows"
WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_WORKFLOW_ID = "gemini_banner_pipeline"

DEFAULT_WORKFLOW = {
  "id": DEFAULT_WORKFLOW_ID,
  "name": "Gemini to BiRefNet Banner Flow",
  "description": "Tạo game asset qua Chrome Gemini CDP, tách nền AI BiRefNet và xuất banner 1280x720",
  "nodes": [
    {
      "id": "node-trigger",
      "type": "triggerNode",
      "position": { "x": 60, "y": 200 },
      "data": {
        "title": "1. Trigger / Input",
        "mode": "gemini_prompt",
        "prompt": "Create a high-detail 2D game asset of a fantasy stone block covered in lush green moss, top-down isometric view, isolated clean background",
        "webhookUrl": "http://localhost:8000/api/workflow/execute"
      }
    },
    {
      "id": "node-gemini",
      "type": "geminiNode",
      "position": { "x": 380, "y": 200 },
      "data": {
        "title": "2. Gemini Web CDP",
        "action": "attach_and_generate",
        "port": 9222,
        "targetUrl": "https://gemini.google.com/app"
      }
    },
    {
      "id": "node-birefnet",
      "type": "birefnetNode",
      "position": { "x": 700, "y": 200 },
      "data": {
        "title": "3. BiRefNet Tách Nền",
        "enabled": True,
        "modelName": "birefnet-general"
      }
    },
    {
      "id": "node-banner",
      "type": "bannerNode",
      "position": { "x": 1020, "y": 200 },
      "data": {
        "title": "4. Banner Framing & Filter",
        "preset": "youtube_thumbnail",
        "width": 1280,
        "height": 720,
        "bgColor": "#1e1e2e",
        "contrast": 1.05,
        "sharpness": 1.2
      }
    },
    {
      "id": "node-output",
      "type": "outputNode",
      "position": { "x": 1340, "y": 200 },
      "data": {
        "title": "5. Banner Output",
        "autoSave": True,
        "downloadEnabled": True
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-trigger", "target": "node-gemini", "animated": True },
    { "id": "e2-3", "source": "node-gemini", "target": "node-birefnet", "animated": True },
    { "id": "e3-4", "source": "node-birefnet", "target": "node-banner", "animated": True },
    { "id": "e4-5", "source": "node-banner", "target": "node-output", "animated": True }
  ]
}

def list_workflows() -> list:
    """Trả về danh sách tóm tắt tất cả các workflows trong thư mục"""
    results = []
    # Seed default nếu chưa có
    default_path = WORKFLOWS_DIR / f"{DEFAULT_WORKFLOW_ID}.json"
    if not default_path.exists():
        save_workflow_by_id(DEFAULT_WORKFLOW_ID, DEFAULT_WORKFLOW)

    for p in WORKFLOWS_DIR.glob("*.json"):
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
                results.append({
                    "id": p.stem,
                    "name": data.get("name", p.stem),
                    "description": data.get("description", "Workflow tự động hóa"),
                    "nodesCount": len(data.get("nodes", [])),
                    "edgesCount": len(data.get("edges", [])),
                    "updated_at": p.stat().st_mtime
                })
        except Exception as e:
            print(f"[Workflow Manager] Lỗi đọc file {p.name}: {e}")
    
    results.sort(key=lambda x: x["updated_at"], reverse=True)
    return results

def get_workflow_by_id(workflow_id: str) -> dict:
    target = WORKFLOWS_DIR / f"{workflow_id}.json"
    if target.exists():
        try:
            with open(target, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_WORKFLOW
    return DEFAULT_WORKFLOW

def save_workflow_by_id(workflow_id: str, flow_data: dict) -> dict:
    if not workflow_id:
        workflow_id = str(uuid.uuid4())[:8]
    target = WORKFLOWS_DIR / f"{workflow_id}.json"
    with open(target, "w", encoding="utf-8") as f:
        json.dump(flow_data, f, ensure_ascii=False, indent=2)
    return {"message": "Đã lưu workflow thành công", "id": workflow_id}

def delete_workflow_by_id(workflow_id: str) -> bool:
    target = WORKFLOWS_DIR / f"{workflow_id}.json"
    if target.exists() and workflow_id != DEFAULT_WORKFLOW_ID:
        target.unlink()
        return True
    return False

# Backward compatibility
def load_workflow() -> dict:
    return get_workflow_by_id(DEFAULT_WORKFLOW_ID)

def save_workflow(workflow: dict):
    save_workflow_by_id(DEFAULT_WORKFLOW_ID, workflow)
