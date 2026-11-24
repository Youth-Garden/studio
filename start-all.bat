@echo off
setlocal
set SCRIPT_DIR=%~dp0
set PROFILE_DIR=%SCRIPT_DIR%gemini_isolated_profile

echo ========================================================
echo   STARTING ALL AGENT SERVICES (AkiMCP + Studio + Chrome)
echo ========================================================

echo [1/3] Starting AkiMCP Server...
start "AkiMCP Server" cmd /c "node \"%APPDATA%\npm\node_modules\@akinet\akimcp\bin\akimcp.js\" --no-browser"

echo [2/3] Starting Studio Flow Gateway (Port 8000)...
start "Studio Flow Gateway" cmd /c "cd /d \"%SCRIPT_DIR%server\" && .venv\Scripts\uvicorn.exe app:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Chrome Debug (Port 9222)...
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%"
set CHROME_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe
if not exist "%CHROME_EXE%" set CHROME_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe

start "" "%CHROME_EXE%" --remote-debugging-port=9222 --user-data-dir="%PROFILE_DIR%" https://gemini.google.com/app

echo All services launched!
