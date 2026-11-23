# Studio Flow - Developer & Integration API Guide

Studio Flow is a Graph-as-Code Workflow Automation engine designed for automated AI image generation (via Gemini Browser Automation), deep edge matting (BiRefNet SOTA segmentation), and graphic framing.

External services, microservices, backend platforms, and AI agents can seamlessly trigger workflows, query execution statuses, and retrieve generated assets via standard REST APIs.

---

## 1. Architecture Overview

```
[External Client / AI Agent]
         │
         ▼ (HTTP POST /api/workflow/execute)
  ┌──────────────┐
  │ FastAPI Host │  ◄── Port 8000
  └──────┬───────┘
         │ (Job Queue - concurrency: 1)
         ├── 1. Gemini Web CDP (Browser Remote Debugging via port 9222)
         ├── 2. BiRefNet AI Engine (Local PyTorch / ONNX Session)
         ├── 3. PIL Framing & Filter Engine
         ▼
  [Static Media Store (/media/raw, /media/transparent, /media/output)]
```

---

## 2. API Endpoints Reference

### 2.1 Trigger Workflow Execution
Start an asynchronous workflow job.

- **Endpoint**: `POST /api/workflow/execute`
- **Headers**: `Content-Type: application/json`
- **Request Body Parameters**:

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | `string` | `"A fantasy moss stone"` | Text prompt dispatched to Gemini for image creation |
| `width` | `integer` | `1280` | Canvas width of the final banner output (px) |
| `height` | `integer` | `720` | Canvas height of the final banner output (px) |
| `bg_color` | `string` | `"#1e1e2e"` | Hex color string for banner background |
| `contrast` | `float` | `1.05` | Image contrast multiplier (1.0 = neutral) |
| `sharpness` | `float` | `1.2` | Image sharpness factor (1.0 = neutral) |

#### cURL Example:
```bash
curl -X POST "http://localhost:8000/api/workflow/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a high-detail 2D game asset of a fantasy stone block covered in lush green moss, top-down isometric view, isolated clean background",
    "width": 1280,
    "height": 720,
    "bg_color": "#1e1e2e",
    "contrast": 1.05,
    "sharpness": 1.2
  }'
```

#### Response (HTTP 200):
```json
{
  "message": "Đã nhận yêu cầu chạy workflow qua Webhook!",
  "job_id": "ca44780d",
  "status": "queued",
  "poll_url": "http://localhost:8000/api/jobs/ca44780d"
}
```

---

### 2.2 Poll Job Status & Results
Check the execution status and retrieve output URLs.

- **Endpoint**: `GET /api/jobs/{job_id}`
- **Response**:

```json
{
  "id": "ca44780d",
  "title": "Flow: Create a high-detail 2D game a",
  "status": "completed",
  "progress": 100,
  "node_status": {
    "node-trigger": "success",
    "node-gemini": "success",
    "node-birefnet": "success",
    "node-banner": "success",
    "node-output": "success"
  },
  "raw_filename": "ca44780d_gemini_raw.png",
  "transparent_filename": "ca44780d_transparent.png",
  "output_filename": "ca44780d_banner.png",
  "banner_url": "http://localhost:8000/media/output/ca44780d_banner.png",
  "transparent_url": "http://localhost:8000/media/transparent/ca44780d_transparent.png",
  "raw_url": "http://localhost:8000/media/raw/ca44780d_gemini_raw.png",
  "error": null
}
```

**Job Status Values**:
- `queued`: Waiting in queue.
- `processing`: Currently executing tasks.
- `completed`: Successfully processed all steps.
- `failed`: Job encountered an error (check `error` message).

---

### 2.3 List All Historical Jobs
- **Endpoint**: `GET /api/jobs`
- **Response**: List of all recorded executions sorted by timestamp descending.

---

### 2.4 Workflow Configuration Management
- **`GET /api/workflow`**: Returns active React Flow JSON graph.
- **`POST /api/workflow`**: Overwrite active graph structure (`nodes` and `edges`).

---

## 3. Client Integration SDK Examples

### Python Integration
```python
import time
import requests

SERVER_URL = "http://localhost:8000"

def execute_studio_flow(prompt: str, width=1280, height=720, bg_color="#1e1e2e"):
    payload = {
        "prompt": prompt,
        "width": width,
        "height": height,
        "bg_color": bg_color
    }
    
    resp = requests.post(f"{SERVER_URL}/api/workflow/execute", json=payload)
    resp.raise_for_status()
    job_id = resp.json()["job_id"]
    print(f"[*] Job queued: {job_id}")

    # Polling loop
    while True:
        status_resp = requests.get(f"{SERVER_URL}/api/jobs/{job_id}").json()
        status = status_resp.get("status")
        progress = status_resp.get("progress", 0)
        print(f" -> Progress: {progress}% [{status}]")

        if status == "completed":
            print(f"[+] Done! Banner URL: {SERVER_URL}/media/output/{status_resp['output_filename']}")
            return status_resp
        elif status == "failed":
            raise RuntimeError(f"Workflow failed: {status_resp.get('error')}")

        time.sleep(2)

if __name__ == "__main__":
    result = execute_studio_flow("A cyberpunk glowing neon helmet, 2D game asset")
```

### TypeScript / Node.js Integration
```typescript
import axios from 'axios';

const SERVER_URL = 'http://localhost:8000';

async function runStudioFlow(prompt: string) {
  const { data } = await axios.post(`${SERVER_URL}/api/workflow/execute`, {
    prompt,
    width: 1280,
    height: 720,
    bg_color: '#1b1b1b',
  });

  const jobId = data.job_id;
  console.log(`Dispatched Job ID: ${jobId}`);

  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      const res = await axios.get(`${SERVER_URL}/api/jobs/${jobId}`);
      const job = res.data;

      if (job.status === 'completed') {
        clearInterval(timer);
        resolve(`${SERVER_URL}/media/output/${job.output_filename}`);
      } else if (job.status === 'failed') {
        clearInterval(timer);
        reject(new Error(job.error));
      }
    }, 2000);
  });
}
```
