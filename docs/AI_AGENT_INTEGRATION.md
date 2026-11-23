# Hướng Dẫn Tích Hợp API Studio Flow (Dành cho AI Agent & Bên Thứ 3)

Tài liệu này cung cấp đầy đủ thông tin để bất kỳ **AI Agent, Chatbot, Backend Server, Extension, hay Hệ thống tự động hóa (n8n, Zapier, Make)** có thể tích hợp và điều khiển toàn bộ pipeline tự động hóa đồ họa của Studio Flow.

---

## 1. Địa chỉ dịch vụ đang hoạt động
- **Backend API Server**: `http://localhost:8000`
- **Swagger / OpenAPI Documentation**: `http://localhost:8000/docs`
- **Frontend Dashboard & Canvas Editor**: `http://localhost:5173`

---

## 2. Luồng gọi chuẩn (Standard Integration Lifecycle)

```
[AI Agent / 3rd-party Client]
              │
              │  1. Gửi lệnh sinh ảnh & xử lý đồ họa
              ▼  POST /api/workflow/execute (hoặc Webhook)
     ┌─────────────────┐
     │  FastAPI Server │ ──► Trả về { "job_id": "...", "poll_url": "..." }
     └────────┬────────┘
              │  (Pipeline chạy ngầm: Gemini CDP -> BiRefNet AI -> Banner Framing)
              │
              │  2. Polling kiểm tra tiến độ mỗi 2-3s
              ▼  GET /api/jobs/{job_id}
     ┌─────────────────┐
     │  Job Completed  │ ──► Trả về { "status": "completed", "banner_url": "...", "transparent_url": "..." }
     └─────────────────┘
```

---

## 3. Chi tiết API Endpoints

### 3.1. Kích hoạt Workflow (Trigger Execution)
Khởi chạy quy trình tự động hóa đồ họa:
- **Method**: `POST`
- **URL**: `http://localhost:8000/api/workflow/execute`
- **Headers**: `Content-Type: application/json`
- **Request Body (JSON)**:

```json
{
  "prompt": "Create a high-detail 2D game asset of a fantasy glowing magic potion bottle, clean isolated background",
  "width": 1280,
  "height": 720,
  "bg_color": "#1e1e2e",
  "contrast": 1.05,
  "sharpness": 1.2
}
```

#### cURL mẫu:
```bash
curl -X POST "http://localhost:8000/api/workflow/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a futuristic sci-fi robot mascot",
    "width": 1280,
    "height": 720,
    "bg_color": "#18181b"
  }'
```

#### Response mẫu (200 OK):
```json
{
  "message": "Đã nhận yêu cầu chạy workflow qua Webhook!",
  "job_id": "893c5240",
  "status": "queued",
  "poll_url": "http://localhost:8000/api/jobs/893c5240"
}
```

---

### 3.2. Kiểm tra Tiến độ & Lấy Kết quả (Poll Job Status)
- **Method**: `GET`
- **URL**: `http://localhost:8000/api/jobs/{job_id}`

#### Response khi hoàn tất:
```json
{
  "id": "893c5240",
  "title": "Flow: Create a futuristic sci-fi robot",
  "status": "completed",
  "progress": 100,
  "node_status": {
    "node-trigger": "success",
    "node-gemini": "success",
    "node-birefnet": "success",
    "node-banner": "success",
    "node-output": "success"
  },
  "raw_url": "http://localhost:8000/media/raw/893c5240_gemini_raw.png",
  "transparent_url": "http://localhost:8000/media/transparent/893c5240_transparent.png",
  "banner_url": "http://localhost:8000/media/output/893c5240_banner.png",
  "error": null
}
```

---

### 3.3. Quản lý danh sách Workflow (Flow Management)
- **Lấy danh sách tất cả workflow**: `GET http://localhost:8000/api/workflows`
- **Lấy cấu hình chi tiết 1 workflow**: `GET http://localhost:8000/api/workflows/{workflow_id}`
- **Lưu hoặc tạo mới workflow**: `POST http://localhost:8000/api/workflows/{workflow_id}`
- **Xóa 1 workflow**: `DELETE http://localhost:8000/api/workflows/{workflow_id}`

---

## 4. Code Mẫu Tích Hợp Cho AI Agent / Backend

### 4.1. Python SDK / Client
```python
import time
import requests

SERVER_URL = "http://localhost:8000"

def run_studio_flow(prompt: str, width: int = 1280, height: int = 720, bg_color: str = "#1e1e2e"):
    # 1. Gửi lệnh chạy
    payload = {
        "prompt": prompt,
        "width": width,
        "height": height,
        "bg_color": bg_color
    }
    res = requests.post(f"{SERVER_URL}/api/workflow/execute", json=payload)
    res.raise_for_status()
    data = res.json()
    job_id = data["job_id"]
    print(f"🚀 Job đã kích hoạt: {job_id}")

    # 2. Polling chờ kết quả
    while True:
        status_res = requests.get(f"{SERVER_URL}/api/jobs/{job_id}")
        status_data = status_res.json()
        status = status_data.get("status")
        print(f"⏳ Trạng thái: {status} ({status_data.get('progress', 0)}%)")

        if status == "completed":
            print("✅ Xong! Link ảnh kết quả:")
            print(f"- Banner: {status_data['banner_url']}")
            print(f"- Ảnh tách nền PNG: {status_data['transparent_url']}")
            print(f"- Ảnh gốc: {status_data['raw_url']}")
            return status_data
        elif status == "failed":
            raise RuntimeError(f"Workflow lỗi: {status_data.get('error')}")

        time.sleep(2.5)

if __name__ == "__main__":
    run_studio_flow("A crystal glowing sword game asset, isolated")
```

---

### 4.2. TypeScript / Node.js Client
```typescript
async function runStudioFlow(prompt: string) {
  const SERVER = "http://localhost:8000";

  // 1. Trigger
  const res = await fetch(`${SERVER}/api/workflow/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      width: 1280,
      height: 720,
      bg_color: "#18181b"
    })
  });
  const { job_id } = await res.json();
  console.log("Job ID:", job_id);

  // 2. Poll
  while (true) {
    const jobRes = await fetch(`${SERVER}/api/jobs/${job_id}`);
    const job = await jobRes.json();

    if (job.status === "completed") {
      console.log("Banner URL:", job.banner_url);
      console.log("Transparent PNG URL:", job.transparent_url);
      return job;
    }
    if (job.status === "failed") {
      throw new Error(job.error || "Execution failed");
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
}
```

---

## 5. Hướng Dẫn Tích Hợp Trực Tiếp Cho AI Agent (Tool / Function Calling)
Nếu bạn tích hợp vào các hệ thống Agentic (như OpenAI Assistants API, Claude Tools, hay Antigravity):

### Định nghĩa Tool Schema (OpenAI / JSON Schema format):
```json
{
  "name": "generate_studio_banner",
  "description": "Tạo banner và hình ảnh game asset đã tách nền qua Studio Flow tự động",
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "Mô tả hình ảnh bằng tiếng Anh chi tiết"
      },
      "width": { "type": "integer", "default": 1280 },
      "height": { "type": "integer", "default": 720 },
      "bg_color": { "type": "string", "default": "#1e1e2e" }
    },
    "required": ["prompt"]
  }
}
```
Agent chỉ cần gửi request HTTP POST tới `http://localhost:8000/api/workflow/execute` và nhận lại kết quả URL ảnh hoàn chỉnh.
