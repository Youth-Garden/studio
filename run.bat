@echo off
setlocal enabledelayedexpansion
title Local Studio - Banner and Background Removal

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo ======================================================
echo       LOCAL STUDIO - BANNER AND BIREFNET ENGINE
echo ======================================================
echo Thu muc du an: %PROJECT_DIR%
echo.

echo [1/2] Dang khoi dong Backend FastAPI (Port 8000)...
start "Studio Server (Port 8000)" cmd /k "cd /d "%PROJECT_DIR%\server" && echo [FastAPI] Khoi chay uvicorn tren port 8000... && .venv\Scripts\python.exe -m uvicorn app:app --port 8000"

echo [2/2] Dang khoi dong Frontend Web UI (Port 5173)...
start "Studio Web UI (Port 5173)" cmd /k "cd /d "%PROJECT_DIR%\ui" && echo [Vite] Khoi chay Bun Dev Server tren port 5173... && bun dev --open"

echo.
echo ======================================================
echo Da khoi chay thanh cong ca 2 tien trinh:
echo - Backend:  http://localhost:8000/docs
echo - Frontend: http://localhost:5173
echo Kiem tra 2 cua so terminal vua bat len de theo doi log!
echo ======================================================
