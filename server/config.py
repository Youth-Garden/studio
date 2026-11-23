import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
RAW_DIR = STORAGE_DIR / "raw"
TRANSPARENT_DIR = STORAGE_DIR / "transparent"
OUTPUT_DIR = STORAGE_DIR / "output"
JOBS_FILE = STORAGE_DIR / "jobs.json"

for folder in [RAW_DIR, TRANSPARENT_DIR, OUTPUT_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# Preset kích thước Banner chuẩn
BANNER_PRESETS = {
    "youtube_thumbnail": {"width": 1280, "height": 720, "label": "YouTube Thumbnail (1280x720)"},
    "fhd_banner": {"width": 1920, "height": 1080, "label": "Full HD 16:9 (1920x1080)"},
    "fb_landscape": {"width": 1200, "height": 630, "label": "Facebook / Web Banner (1200x630)"},
    "square_post": {"width": 1080, "height": 1080, "label": "Square Social (1080x1080)"},
    "custom": {"width": 1280, "height": 720, "label": "Custom Size"}
}

# Model tách nền mặc định
DEFAULT_REMBG_MODEL = "birefnet-general"
