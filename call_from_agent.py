import requests
import json
import time

# Endpoint của Local Studio
API_URL = "http://localhost:8000/api/agent/generate"

# Dữ liệu Agent AI gửi sang
payload = {
    "prompt": "Create a high-detail fantasy magic stone covered with green moss, isolated on clean background, 2D game asset style",
    "title": "Agent Demo - Magic Moss Stone",
    "remove_bg": True,
    "model_name": "birefnet-general",
    "preset": "youtube_thumbnail",  # 1280x720
    "bg_color": "#1e1e2e"
}

print("[Agent] Đang gửi yêu cầu tạo banner tới Local Studio...")
response = requests.post(API_URL, json=payload)
print("[Agent] Response:", response.status_code, response.json())

job_id = response.json().get("job_id")

if job_id:
    print(f"[Agent] Đang theo dõi tiến trình Job ID: {job_id}...")
    while True:
        time.sleep(2)
        status_res = requests.get(f"http://localhost:8000/api/jobs/{job_id}").json()
        print(f"[Agent] Trạng thái: {status_res['status']} ({status_res['progress']}%)")
        
        if status_res["status"] == "completed":
            print("\n🎉 [Agent] Xử lý hoàn tất!")
            print(f"Ảnh Raw từ Gemini: http://localhost:8000/media/raw/{status_res['raw_filename']}")
            print(f"Ảnh Tách nền BiRefNet: http://localhost:8000/media/transparent/{status_res['transparent_filename']}")
            print(f"Banner Thành phẩm: http://localhost:8000/media/output/{status_res['output_filename']}")
            break
        elif status_res["status"] == "failed":
            print("❌ [Agent] Thất bại:", status_res.get("error"))
            break
