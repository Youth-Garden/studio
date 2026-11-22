# Local Banner Studio (with SOTA BiRefNet AI Engine)

A self-hosted, offline-first Web Control Panel & Processing Pipeline for high-precision background removal (powered by **BiRefNet**) and automated banner composition.

---


## Key Features

1. **State-of-the-Art (SOTA) AI Background Removal**:
   - Integrates **BiRefNet** (`birefnet-general`), outperforming traditional models (U2Net, MODNet) on fine textures, fur, grass, and semi-transparent edges.
   - Also supports **IS-Net** (DIS) and **U2Net** as alternative options.
   - Runs 100% locally and offline without cloud API tokens, rate limits, or Captcha barriers.

2. **Sequential Background Worker (Concurrency = 1)**:
   - Uses an asynchronous in-memory queue to process heavy AI tasks one by one.
   - Prevents CPU/RAM spikes and system freezes when batching requests.

3. **Automated Banner Composition & Presets**:
   - Standard presets: **YouTube Thumbnail (1280x720)**, **Full HD (1920x1080)**, **Facebook / OpenGraph (1200x630)**, and **Square (1080x1080)**.
   - Subject auto-scaling with aspect ratio preservation and automatic centering.
   - Custom background colors or transparent alpha retention.

4. **Image Filtering & Enhancement**:
   - Real-time adjustment sliders for **Contrast**, **Sharpness**, **Saturation**, and **Brightness**.

5. **Modern Web UI Control Panel**:
   - Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.
   - 3-view comparison mode: **Raw Input** vs. **BiRefNet Transparent (Checkerboard background)** vs. **Final Banner Output**.
   - Real-time job status tracking (`queued`, `processing`, `completed`, `failed`).

---


## Project Architecture

```text
D:\learn\studio\
├── server\                     # Python FastAPI Backend
│   ├── .venv\                  # Python virtual environment
│   ├── app.py                  # API routes, CORS & static file mounts
│   ├── config.py               # Storage paths and banner presets
│   ├── pipeline.py             # BiRefNet integration and Pillow composition
│   ├── queue_manager.py        # Asynchronous job queue & state management
│   ├── requirements.txt        # Backend dependencies
│   └── test_birefnet.py        # Standalone verification script
├── ui\                         # React Frontend Control Panel
│   ├── src\
│   │   ├── App.tsx             # Main dashboard UI & live preview
│   │   ├── index.css           # Styling & checkerboard pattern
│   │   └── main.tsx            # App entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts
├── storage\                    # Persistent media storage
│   ├── raw\                    # Uploaded original images
│   ├── transparent\            # Alpha-preserved PNGs from BiRefNet
│   ├── output\                 # Composed banner outputs
│   └── jobs.json               # Job history database
├── run.bat                     # 1-click startup launcher for Windows
└── README.md                   # Project documentation
```

---


## Prerequisites & Installation

### Requirements

- **OS**: Windows 10 / 11 (64-bit)
- **Python**: 3.10+ (Tested on Python 3.11)
- **Node.js / Runtime**: Node v18+ or [Bun](https://bun.sh/) (Bun is recommended for fast startup)

---

### Step 1: Backend Setup

Navigate to the `server/` directory and create a virtual environment:

```powershell
cd D:\learn\studio\server

# 1. Create Python virtual environment
python -m venv .venv

# 2. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

_(Note: On the first run, `rembg` will automatically download the BiRefNet ONNX weights (~970MB) to `~/.rembg/models/birefnet-general/`)._

---

### Step 2: Frontend Setup

Navigate to the `ui/` directory and install JavaScript packages:

```powershell
cd D:\learn\studio\ui

# Using Bun (Recommended)
bun install

# Or using npm
npm install
```

---

## Running the Application

### Option 1: 1-Click Launch (Recommended)

Double-click the **`run.bat`** file in `D:\learn\studio\` or execute it in PowerShell:

```powershell
cd D:\learn\studio
.\run.bat
```

This will automatically launch:

- **FastAPI Server** at `http://localhost:8000`
- **Web UI Dashboard** at `http://localhost:5173` (and open your default browser)

---

### Option 2: Manual Start

**Terminal 1 (Backend):**

```powershell
cd D:\learn\studio\server
.\.venv\Scripts\Activate.ps1
uvicorn app:app --port 8000 --reload
```

**Terminal 2 (Frontend):**

```powershell
cd D:\learn\studio\ui
bun dev
```

---

## User Guide

1. **Upload an Image**:
   - Drag and drop or browse to select your source image (JPG, PNG, WEBP).
2. **Configure AI Removal**:
   - Toggle **BiRefNet Background Removal** (On by default).
   - Select model: `BiRefNet General` (recommended for highest detail) or `IS-Net`.
3. **Select Banner Dimension**:
   - Choose a preset (e.g., YouTube `1280x720`, Full HD `1920x1080`, Square `1080x1080`).
   - Pick a custom background color or select **Keep Alpha Transparent**.
4. **Adjust Color & Sharpness**:
   - Tune contrast, sharpness, saturation, or brightness sliders.
5. **Click "Process Banner"**:
   - The job is enqueued and processed sequentially.
   - Inspect the results across **Final Banner**, **BiRefNet Transparent**, and **Raw** tabs.
   - Click **Download** to save the final image.

---

## API Endpoints Reference

| Method | Endpoint                        | Description                                                        |
| ------ | ------------------------------- | ------------------------------------------------------------------ |
| `GET`  | `/api/jobs`                     | Retrieve all current and past jobs                                 |
| `GET`  | `/api/jobs/{job_id}`            | Retrieve real-time progress and status of a specific job           |
| `POST` | `/api/jobs/create`              | Submit multipart form with image file, preset, and filter settings |
| `GET`  | `/api/presets`                  | Get available banner sizes and AI models                           |
| `GET`  | `/media/output/{filename}`      | Serve processed banner image                                       |
| `GET`  | `/media/transparent/{filename}` | Serve transparent PNG image                                        |
| `GET`  | `/media/raw/{filename}`         | Serve original input image                                         |

---

## License

MIT License. Free for personal and commercial usage.
