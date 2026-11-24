import shutil
import uuid
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from config import RAW_DIR, TRANSPARENT_DIR, OUTPUT_DIR, BANNER_PRESETS, BASE_DIR
from queue_manager import queue_mgr
from workflow_manager import (
    load_workflow, 
    save_workflow, 
    list_workflows, 
    get_workflow_by_id, 
    save_workflow_by_id, 
    delete_workflow_by_id
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    queue_mgr.start_worker()
    yield

app = FastAPI(title="Local Studio & Node Flow API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media/raw", StaticFiles(directory=str(RAW_DIR)), name="raw")
app.mount("/media/transparent", StaticFiles(directory=str(TRANSPARENT_DIR)), name="transparent")
app.mount("/media/output", StaticFiles(directory=str(OUTPUT_DIR)), name="output")

# API quản lý danh sách và chi tiết các Workflows (Dashboard Flow Hub)
@app.get("/api/workflows")
def get_all_workflows():
    return list_workflows()

@app.get("/api/workflows/{workflow_id}")
def get_single_workflow(workflow_id: str):
    return get_workflow_by_id(workflow_id)

@app.post("/api/workflows/{workflow_id}")
def update_single_workflow(workflow_id: str, flow: dict):
    return save_workflow_by_id(workflow_id, flow)

@app.delete("/api/workflows/{workflow_id}")
def remove_workflow(workflow_id: str):
    success = delete_workflow_by_id(workflow_id)
    if not success:
        raise HTTPException(status_code=400, detail="Không thể xóa workflow mặc định hoặc file không tồn tại")
    return {"message": "Đã xóa workflow"}

# API quản lý Workflow JSON (tương thích ngược)
@app.get("/api/workflow")
def get_workflow():
    return load_workflow()

@app.post("/api/workflow")
def update_workflow(flow: dict):
    save_workflow(flow)
    return {"message": "Đã lưu workflow thành công"}

class WorkflowExecuteRequest(BaseModel):
    prompt: Optional[str] = "A fantasy moss stone"
    width: Optional[int] = 1280
    height: Optional[int] = 720
    bg_color: Optional[str] = "#1e1e2e"
    contrast: Optional[float] = 1.05
    sharpness: Optional[float] = 1.2
    model_name: Optional[str] = "birefnet-general"
    workflow_id: Optional[str] = None
    workflow_data: Optional[dict] = None

# Webhook Endpoint để Agent khác hoặc nút "Run" trên Canvas gọi vào
@app.post("/api/workflow/execute")
async def execute_workflow(req: WorkflowExecuteRequest):
    # Ưu tiên lấy workflow snapshot được truyền từ client (canvas hiện tại) hoặc theo workflow_id
    custom_workflow = req.workflow_data
    if not custom_workflow and req.workflow_id:
        custom_workflow = get_workflow_by_id(req.workflow_id)

    job_data = {
        "mode": "gemini_prompt",
        "prompt": req.prompt,
        "title": f"Flow: {req.prompt[:30]}",
        "remove_bg": True,
        "model_name": req.model_name,
        "preset": "custom",
        "width": req.width,
        "height": req.height,
        "bg_color": req.bg_color,
        "filters": {
            "contrast": req.contrast,
            "sharpness": req.sharpness,
            "brightness": 1.0,
            "saturation": 1.1
        }
    }
    job_id = await queue_mgr.add_job(job_data, custom_workflow=custom_workflow)
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Workflow đã được kích hoạt và đưa vào hàng đợi."
    }

import json
import time

AGENT_LOGS_FILE = BASE_DIR / "storage" / "agent_dispatch_logs.json"

def load_agent_logs():
    if AGENT_LOGS_FILE.exists():
        try:
            with open(AGENT_LOGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_agent_log_entry(entry: dict):
    logs = load_agent_logs()
    logs.insert(0, entry)  # Mới nhất lên đầu
    # Giữ tối đa 100 log gần nhất
    logs = logs[:100]
    AGENT_LOGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(AGENT_LOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

class AgentDispatchRequest(BaseModel):
    plan_path: str
    extra_note: Optional[str] = ""
    target_agent: Optional[str] = "gemini"
    caller: Optional[str] = "Orca Architect"

@app.get("/api/agent/dispatch-logs")
def get_agent_dispatch_logs():
    return load_agent_logs()

@app.post("/api/agent/dispatch")
async def dispatch_plan_to_agent(req: AgentDispatchRequest):
    """
    Endpoint Gateway tập trung cho Orca, Claude Code hoặc bất kỳ Agent nào
    gửi yêu cầu thi công code sang Web Builder Agent (Gemini / Claude).
    """
    plan_file = Path(req.plan_path).resolve()
    if not plan_file.exists():
        raise HTTPException(status_code=400, detail=f"File plan không tồn tại: {req.plan_path}")

    log_entry = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": int(time.time()),
        "caller": req.caller or "Orca Architect",
        "plan_name": plan_file.name,
        "plan_path": str(plan_file),
        "extra_note": req.extra_note,
        "target_agent": req.target_agent or "gemini",
        "status": "processing",
        "output": None,
        "error": None
    }

    from nodes.agent_builder_node import AgentBuilderNode
    node = AgentBuilderNode(node_id="gateway_agent_builder", config={"plan_path": str(plan_file), "extra_note": req.extra_note})
    
    try:
        result = await node.execute(inputs={"plan_path": str(plan_file), "extra_note": req.extra_note}, context={})
        log_entry["status"] = "success"
        log_entry["output"] = result.get("output", "")
        save_agent_log_entry(log_entry)
        return {
            "success": True,
            "message": "Đã điều phối thành công sang Web Agent!",
            "details": result,
            "log": log_entry
        }
    except Exception as e:
        log_entry["status"] = "failed"
        log_entry["error"] = str(e)
        save_agent_log_entry(log_entry)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/presets")
def get_presets():
    return {
        "banner_presets": BANNER_PRESETS,
        "models": [
            {"id": "birefnet-general", "name": "BiRefNet General (Khuyên dùng - Chuẩn nét nhất)"},
            {"id": "isnet-general-use", "name": "IS-Net DIS (Tách viền chi tiết cao)"},
            {"id": "u2net", "name": "U2Net (Nhẹ, tốc độ nhanh)"}
        ]
    }

@app.get("/api/jobs")
def get_jobs():
    jobs_list = list(queue_mgr.jobs.values())
    jobs_list.sort(key=lambda x: x.get("created_at", 0), reverse=True)
    return jobs_list

@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    if job_id not in queue_mgr.jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return queue_mgr.jobs[job_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
