#!/usr/bin/env bash

# Resolve project root in Windows format and Unix format
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -W 2>/dev/null || pwd)"

echo "======================================================"
echo "      LOCAL STUDIO - BANNER AND BIREFNET ENGINE       "
echo "======================================================"
echo "Project Path: $PROJECT_DIR"
echo ""

echo "[1/2] Dang khoi dong Backend FastAPI tai cong 8000..."
cmd.exe /c "start \"Studio Server (Port 8000)\" cmd /k \"cd /d $PROJECT_DIR\server && echo [FastAPI] Dang khoi chay uvicorn... && .venv\Scripts\python.exe -m uvicorn app:app --port 8000\""

echo "[2/2] Dang khoi dong Frontend Web UI tai cong 5173..."
cmd.exe /c "start \"Studio Web UI (Port 5173)\" cmd /k \"cd /d $PROJECT_DIR\ui && echo [Vite] Dang khoi chay Bun Dev Server... && bun dev --open\""

echo ""
echo "======================================================"
echo "Da khoi chay thanh cong ca 2 tien trinh:"
echo "- Backend:  http://localhost:8000/docs"
echo "- Frontend: http://localhost:5173"
echo "Kiem tra 2 cua so CMD vua mo de xem chi tiet log!"
echo "======================================================"
