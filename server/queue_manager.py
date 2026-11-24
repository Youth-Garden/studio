import asyncio
import json
import time
import uuid
from pathlib import Path
from typing import Dict, Any, Optional

from config import JOBS_FILE, RAW_DIR, TRANSPARENT_DIR, OUTPUT_DIR
from workflow_manager import load_workflow
from dag_runner import DAGRunner

class QueueManager:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.jobs: Dict[str, dict] = self._load_jobs()
        self.is_running = False
        self._worker_task = None

    def _load_jobs(self) -> Dict[str, dict]:
        if JOBS_FILE.exists():
            try:
                with open(JOBS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_jobs(self):
        JOBS_FILE.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(JOBS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.jobs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[QueueManager] Lỗi lưu jobs: {e}")

    def start_worker(self):
        if not self.is_running:
            self.is_running = True
            self._worker_task = asyncio.create_task(self._process_queue())
            print("[Worker] DAG Execution Queue Worker đã khởi động (concurrency = 1)")

    async def add_job(self, job_data: dict, custom_workflow: Optional[dict] = None) -> str:
        job_id = str(uuid.uuid4())[:8]
        # Sử dụng custom_workflow nếu có, fallback về workflow mặc định
        current_workflow = custom_workflow or load_workflow()
        node_status = {n["id"]: "idle" for n in current_workflow.get("nodes", [])}

        job_info = {
            "id": job_id,
            "created_at": time.time(),
            "status": "queued",
            "progress": 0,
            "node_status": node_status,
            "mode": job_data.get("mode", "gemini_prompt"),
            "prompt": job_data.get("prompt"),
            "title": job_data.get("title", f"Banner-{job_id}"),
            "width": job_data.get("width", 1280),
            "height": job_data.get("height", 720),
            "bg_color": job_data.get("bg_color", "#1e1e2e"),
            "raw_filename": None,
            "transparent_filename": None,
            "output_filename": None,
            "workflow_snapshot": current_workflow,
            "initial_payload": job_data,
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
                await self._execute_dag_job(job_id)
            except Exception as e:
                print(f"[Worker] Lỗi xử lý job {job_id}: {e}")
                if job_id in self.jobs:
                    self.jobs[job_id]["status"] = "failed"
                    self.jobs[job_id]["error"] = str(e)
                    self._save_jobs()
            finally:
                self.queue.task_done()

    async def _execute_dag_job(self, job_id: str):
        job = self.jobs[job_id]
        print(f"[DAG Worker] Bắt đầu xử lý Job qua DAG: {job_id} - {job['title']}")
        job["status"] = "processing"
        job["progress"] = 10
        self._save_jobs()

        # Context truyền cho toàn bộ các node
        context = {
            "job_id": job_id,
            "initial_payload": job.get("initial_payload", {})
        }

        # Callback cập nhật trạng thái node real-time
        async def on_node_status(node_id: str, status: str, result_or_err: Any):
            job["node_status"][node_id] = status
            if status == "success" and isinstance(result_or_err, dict):
                if result_or_err.get("raw_filename"):
                    job["raw_filename"] = result_or_err["raw_filename"]
                if result_or_err.get("transparent_filename"):
                    job["transparent_filename"] = result_or_err["transparent_filename"]
                if result_or_err.get("output_filename"):
                    job["output_filename"] = result_or_err["output_filename"]
            
            # Tính toán % tiến độ hoàn thành dựa trên số node xong
            total = len(job["node_status"])
            done = sum(1 for s in job["node_status"].values() if s == "success")
            job["progress"] = min(95, int((done / max(1, total)) * 100))
            self._save_jobs()

        workflow_data = job.get("workflow_snapshot") or load_workflow()

        # Chạy động cơ DAG Runner
        runner = DAGRunner(workflow_data, context, on_node_status=on_node_status)
        final_results = await runner.run()

        # Cập nhật kết quả cuối cùng
        job["status"] = "completed"
        job["progress"] = 100
        if final_results.get("output_filename"):
            job["output_filename"] = final_results["output_filename"]
        if final_results.get("transparent_filename"):
            job["transparent_filename"] = final_results["transparent_filename"]
        if final_results.get("raw_filename"):
            job["raw_filename"] = final_results["raw_filename"]

        self._save_jobs()
        print(f"[DAG Worker] Hoàn thành trọn vẹn Job: {job_id}")

queue_mgr = QueueManager()
