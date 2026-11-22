import requests
import time

url = "http://127.0.0.1:8000/api/jobs/create"
img_path = r"C:\Users\Tran Hoang Quan\.gemini\antigravity-cli\brain\8b102c42-734f-4f9f-8e49-7efd9592a451\.user_uploaded\uploaded_media_3_1795281369359.jpg"

with open(img_path, "rb") as f:
    files = {"file": ("rock.jpg", f, "image/jpeg")}
    data = {
        "title": "Test Banner Rock",
        "remove_bg": "true",
        "model_name": "birefnet-general",
        "preset": "youtube_thumbnail",
        "width": 1280,
        "height": 720,
        "bg_color": "#1e1e2e",
        "brightness": 1.0,
        "contrast": 1.05,
        "saturation": 1.1,
        "sharpness": 1.2
    }
    r = requests.post(url, data=data, files=files)
    print("API Response:", r.status_code, r.json())
    job_id = r.json().get("job_id")

if job_id:
    print("Dang theo doi trang thai job:", job_id)
    for _ in range(30):
        time.sleep(1)
        res = requests.get(f"http://127.0.0.1:8000/api/jobs/{job_id}").json()
        print(f"Status: {res.get('status')} | Progress: {res.get('progress')}%")
        if res.get("status") in ["completed", "failed"]:
            print("Final Job Info:", res)
            break
