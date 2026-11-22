import asyncio
import json
import uuid
import time
from pathlib import Path
from typing import Dict, Any, Optional
from config import BASE_DIR, RAW_DIR, TRANSPARENT_DIR, OUTPUT_DIR
from pipeline import remove_background, compose_banner
from gemini_bridge import generate_image_via_gemini_cdp

JOBS_FILE = BASE_DIR / "storage" / "jobs.json"

class QueueManager:
    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.jobs: Dict[str, Dict[str, Any]] = self._load_jobs()
        self.is_running = False
        self._worker_task: Optional[asyncio.Task] = None

    def _load_jobs(self) -> Dict[str, Dict[str, Any]]:
        if JOBS_FILE.exists():
            try:
                with open(JOBS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_jobs(self):
        try:
            with open(JOBS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.jobs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Lỗi lưu jobs.json:", e)

    def start_worker(self):
        if not self.is_running:
            self.is_running = True
            self._worker_task = asyncio.create_task(self._process_queue())
            print("[Worker] Task queue worker đã khởi động (concurrency = 1)")

    async def add_job(self, job_data: dict) -> str:
        job_id = str(uuid.uuid4())[:8]
        job_info = {
            "id": job_id,
            "created_at": time.time(),
            "status": "queued",
            "progress": 0,
            "mode": job_data.get("mode", "upload"),  # "upload" hoặc "gemini_prompt"
            "prompt": job_data.get("prompt"),
            "title": job_data.get("title", f"Banner-{job_id}"),
            "raw_filename": job_data.get("raw_filename"),
            "remove_bg": job_data.get("remove_bg", True),
            "model_name": job_data.get("model_name", "birefnet-general"),
            "preset": job_data.get("preset", "youtube_thumbnail"),
            "width": job_data.get("width", 1280),
            "height": job_data.get("height", 720),
            "bg_color": job_data.get("bg_color", "#1e1e2e"),
            "filters": job_data.get("filters", {}),
            "transparent_filename": None,
            "output_filename": None,
            "error": None
        }
        self.jobs[job_id] = job_info
        self._save_jobs()
        await self.queue.put(job_id)
        return job_id

    async def _process_queue(self):
        while self.is_running:
            job_id = await self.queue.get()
            try:
                await self._execute_job(job_id)
            except Exception as e:
                print(f"[Worker] Lỗi xử lý job {job_id}: {e}")
                if job_id in self.jobs:
                    self.jobs[job_id]["status"] = "failed"
                    self.jobs[job_id]["error"] = str(e)
                    self._save_jobs()
            finally:
                self.queue.task_done()

    async def _execute_job(self, job_id: str):
        job = self.jobs[job_id]
        print(f"[Worker] Bắt đầu xử lý Job: {job_id} - {job['title']} (Mode: {job['mode']})")
        job["status"] = "processing"
        job["progress"] = 5
        self._save_jobs()

        loop = asyncio.get_event_loop()

        # Bước 0: Nếu là mode gemini_prompt -> Tương tác với tab Gemini để lấy ảnh
        if job["mode"] == "gemini_prompt":
            job["progress"] = 15
            self._save_jobs()
            raw_filename = f"{job_id}_gemini_raw.jpg"
            raw_path = RAW_DIR / raw_filename

            print(f"[Worker] Đang tương tác với tab Gemini để sinh ảnh cho prompt: {job['prompt']}...")
            await loop.run_in_executor(
                None,
                generate_image_via_gemini_cdp,
                job["prompt"],
                raw_path
            )
            job["raw_filename"] = raw_filename
            job["progress"] = 35
            self._save_jobs()
        else:
            raw_path = RAW_DIR / job["raw_filename"]
            if not raw_path.exists():
                raise FileNotFoundError(f"Không tìm thấy ảnh gốc: {job['raw_filename']}")

        current_subject_path = raw_path

        # Bước 1: Tách nền bằng BiRefNet (nếu bật)
        if job["remove_bg"]:
            job["progress"] = 45
            self._save_jobs()
            
            transparent_filename = f"{job_id}_transparent.png"
            trans_path = TRANSPARENT_DIR / transparent_filename
            
            await loop.run_in_executor(
                None,
                remove_background,
                raw_path,
                trans_path,
                job["model_name"]
            )
            
            job["transparent_filename"] = transparent_filename
            current_subject_path = trans_path
            job["progress"] = 75
            self._save_jobs()

        # Bước 2: Framing Banner, Resize & Filter
        output_filename = f"{job_id}_banner.png"
        out_path = OUTPUT_DIR / output_filename

        await loop.run_in_executor(
            None,
            compose_banner,
            current_subject_path,
            out_path,
            int(job["width"]),
            int(job["height"]),
            job["bg_color"],
            job["filters"]
        )

        job["output_filename"] = output_filename
        job["status"] = "completed"
        job["progress"] = 100
        self._save_jobs()
        print(f"[Worker] Hoàn thành Job: {job_id}")

queue_mgr = QueueManager()
