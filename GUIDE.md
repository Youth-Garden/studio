# Developer & User Guide: Local Studio

Comprehensive technical guide and operating procedures for **Local Studio** with BiRefNet background matting.

---

## 1. System Overview & Data Flow

```text
User Browser (React UI) 
   │
   ├─► POST /api/jobs/create (Multipart Form: Image + Settings)
   │
FastAPI Backend (localhost:8000)
   │
   ├─► 1. Save uploaded file to `storage/raw/<id>_<filename>`
   ├─► 2. Push job ID to in-memory `asyncio.Queue`
   │
Background Worker (Sequential, Concurrency = 1)
   │
   ├── Step 1: BiRefNet Segmentation
   │     - Converts image to RGB
   │     - Executes BiRefNet ONNX session
   │     - Exports 32-bit RGBA PNG to `storage/transparent/<id>_transparent.png`
   │
   ├── Step 2: Banner Framing & Enhancement
   │     - Applies PIL ImageEnhance filters (Contrast, Sharpness, Saturation, Brightness)
   │     - Creates canvas of target dimensions (e.g., 1280x720)
   │     - Scales subject proportionally to fit ~85% of canvas area
   │     - Pastes subject centered on canvas
   │     - Exports final PNG to `storage/output/<id>_banner.png`
   │
   └── Step 3: Complete Job
         - Updates status to `completed` in `storage/jobs.json`
         - Frontend polls `/api/jobs` and updates UI live
```

---

## 2. Environment Setup & Configuration

### Prerequisites
- Python 3.10 to 3.12 (64-bit)
- Bun or Node.js (v18+)

### Customizing Presets (`server/config.py`)
To add custom banner resolutions, edit `BANNER_PRESETS` in `server/config.py`:
```python
BANNER_PRESETS = {
    "youtube_thumbnail": {"width": 1280, "height": 720, "label": "YouTube Thumbnail (1280x720)"},
    "fhd_banner": {"width": 1920, "height": 1080, "label": "Full HD 16:9 (1920x1080)"},
    "fb_landscape": {"width": 1200, "height": 630, "label": "Facebook / Web Banner (1200x630)"},
    "square_post": {"width": 1080, "height": 1080, "label": "Square Social (1080x1080)"},
    "twitter_header": {"width": 1500, "height": 500, "label": "Twitter Header (1500x500)"} # Example custom preset
}
```

---

## 3. GPU Acceleration (Optional)

By default, the server runs on CPU using `onnxruntime`. If you have an NVIDIA GPU with CUDA installed:

1. Activate virtual environment:
   ```powershell
   cd D:\learn\studio\server
   .\.venv\Scripts\Activate.ps1
   ```
2. Uninstall CPU runtime and install GPU runtime:
   ```powershell
   pip uninstall -y onnxruntime
   pip install onnxruntime-gpu
   ```
This reduces BiRefNet inference time from ~3-5 seconds to **< 0.5 seconds**.

---

## 4. Troubleshooting & FAQ

#### Q: Where are the BiRefNet model weights stored?
**A:** Weights are stored in `C:\Users\<Username>\.rembg\models\birefnet-general\birefnet-general.onnx` (~973 MB). Subsequent runs do not require re-downloading.

#### Q: How to handle CORS errors if changing ports?
**A:** The FastAPI server is configured with `allow_origins=["*"]` in `server/app.py`, allowing requests from any local frontend host or port.

#### Q: Can I keep the final banner background fully transparent?
**A:** Yes. In the UI under "Kích thước & Màu nền Banner", toggle the button **"Giữ Alpha trong suốt"** (or set `bg_color="transparent"`).
