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

@asynccontextmanager
async def lifespan(app: FastAPI):
    queue_mgr.start_worker()
    yield

app = FastAPI(title="Local Studio & Gemini Automation API", lifespan=lifespan)

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

class AgentPromptRequest(BaseModel):
    prompt: str
    title: Optional[str] = None
    remove_bg: Optional[bool] = True
    model_name: Optional[str] = "birefnet-general"
    preset: Optional[str] = "youtube_thumbnail"
    width: Optional[int] = 1280
    height: Optional[int] = 720
    bg_color: Optional[str] = "#1e1e2e"
    brightness: Optional[float] = 1.0
    contrast: Optional[float] = 1.0
    saturation: Optional[float] = 1.0
    sharpness: Optional[float] = 1.0

# 1. Endpoint dành cho Agent khác gọi vào (Chỉ cần truyền JSON prompt)
@app.post("/api/agent/generate")
async def agent_generate(req: AgentPromptRequest):
    """
    Endpoint chuẩn cho Agent AI bên ngoài gọi vào:
    Tự gõ prompt vào tab Gemini đang mở -> lấy ảnh -> tách nền BiRefNet -> tạo banner.
    """
    job_data = {
        "mode": "gemini_prompt",
        "prompt": req.prompt,
        "title": req.title or f"Gemini: {req.prompt[:30]}",
        "remove_bg": req.remove_bg,
        "model_name": req.model_name,
        "preset": req.preset,
        "width": req.width,
        "height": req.height,
        "bg_color": req.bg_color,
        "filters": {
            "brightness": req.brightness,
            "contrast": req.contrast,
            "saturation": req.saturation,
            "sharpness": req.sharpness
        }
    }
    job_id = await queue_mgr.add_job(job_data)
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Đã tiếp nhận yêu cầu từ Agent, đang xếp vào hàng đợi tương tác với Gemini."
    }

# 2. Endpoint upload ảnh thủ công từ Web UI
@app.post("/api/jobs/create")
async def create_job(
    file: UploadFile = File(...),
    title: str = Form("Banner Job"),
    remove_bg: bool = Form(True),
    model_name: str = Form("birefnet-general"),
    preset: str = Form("youtube_thumbnail"),
    width: int = Form(1280),
    height: int = Form(720),
    bg_color: str = Form("#1e1e2e"),
    brightness: float = Form(1.0),
    contrast: float = Form(1.0),
    saturation: float = Form(1.0),
    sharpness: float = Form(1.0),
):
    unique_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    raw_file_path = RAW_DIR / unique_name

    with open(raw_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    job_data = {
        "mode": "upload",
        "title": title,
        "raw_filename": unique_name,
        "remove_bg": remove_bg,
        "model_name": model_name,
        "preset": preset,
        "width": width,
        "height": height,
        "bg_color": bg_color,
        "filters": {
            "brightness": brightness,
            "contrast": contrast,
            "saturation": saturation,
            "sharpness": sharpness
        }
    }

    job_id = await queue_mgr.add_job(job_data)
    return {"job_id": job_id, "message": "Job đã được đưa vào hàng đợi"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
