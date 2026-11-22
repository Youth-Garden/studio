@echo off
title Mo Chrome Debug cho Gemini Studio
chcp 65001 > nul

echo ========================================================
echo       KHOI DONG CHROME VOI REMOTE DEBUGGING PORT 9222
echo ========================================================
echo.
echo Trinh duyet Chrome se duoc mo voi cong 9222 de Playwright co the ket noi.
echo Hay dang nhap tai khoan Google va vao: https://gemini.google.com/app
echo.

:: Thu cac duong dan Chrome pho bien
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="D:\learn\studio\chrome_profile" "https://gemini.google.com/app"
    goto :done
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="D:\learn\studio\chrome_profile" "https://gemini.google.com/app"
    goto :done
)

:: Neu dung Microsoft Edge thay cho Chrome
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    echo Khong tim thay Chrome, dang khoi dong Microsoft Edge...
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="D:\learn\studio\chrome_profile" "https://gemini.google.com/app"
    goto :done
)

echo [Loi] Khong tim thay Chrome hoac Edge tren may!
pause
exit /b

:done
echo Chrome da duoc khoi dong tai cong 9222!
