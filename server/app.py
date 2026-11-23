import shutil
import uuid
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from config import RAW_DIR, TRANSPARENT_DIR, OUTPUT_DIR, BANNER_PRESETS
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

# Webhook Endpoint để Agent khác hoặc nút "Run" trên Canvas gọi vào
@app.post("/api/workflow/execute")
async def execute_workflow(req: WorkflowExecuteRequest):
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
    job_id = await queue_mgr.add_job(job_data)
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Workflow đã được kích hoạt và đưa vào hàng đợi."
    }

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
