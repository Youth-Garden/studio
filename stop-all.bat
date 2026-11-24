@echo off
echo ========================================================
echo   STOPPING ALL AGENT SERVICES
echo ========================================================

powershell -Command "Get-Process node, python | Where-Object { $_.CommandLine -like '*akimcp*' -or $_.CommandLine -like '*uvicorn*' } | Stop-Process -Force -ErrorAction SilentlyContinue"

echo All background agent services stopped.
pause
