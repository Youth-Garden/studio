import requests
import json
import time

url = "http://localhost:8000/api/workflow/execute"
payload = {
    "prompt": "Create a high-detail 2D game asset of a fantasy stone block covered in lush green moss, top-down isometric view, isolated clean background",
    "width": 1280,
    "height": 720,
    "bg_color": "#1e1e2e"
}

res = requests.post(url, json=payload)
data = res.json()
print("Kích hoạt Workflow thành công! Job ID:", data.get("job_id"))
job_id = data.get("job_id")

if job_id:
    for i in range(90):
        time.sleep(3)
        job_res = requests.get(f"http://localhost:8000/api/jobs/{job_id}")
        if job_res.status_code == 200:
            job = job_res.json()
            status = job.get("status")
            progress = job.get("progress")
            node_status = job.get("node_status", {})
            print(f"[{i*3}s] Status: {status} ({progress}%) | Nodes: {node_status}")
            if status in ["completed", "failed"]:
                if status == "failed":
                    print("LỖI:", job.get("error"))
                else:
                    print("THÀNH CÔNG! Output banner:", job.get("banner_url"))
                break
