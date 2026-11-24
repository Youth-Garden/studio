@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   STUDIO FLOW ^& MULTI-AGENT TOOLKIT 1-CLICK INSTALLER
echo ========================================================

set SCRIPT_DIR=%~dp0
set TOOLS_DIR=%SCRIPT_DIR%tools
set SKILLS_SRC=%SCRIPT_DIR%skills\agent-delegation-workflow
set MCP_SRC=%SCRIPT_DIR%mcp-config

echo [1/5] Checking environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js first.
    pause
    exit /b 1
)

echo [2/5] Installing global packages (AkiMCP ^& WebSocket)...
cmd.exe /c npm install -g @akinet/akimcp ws

echo [3/5] Setting up AkiMCP configuration...
set AKI_CONFIG_DIR=%USERPROFILE%\.aki\mcpsv
if not exist "%AKI_CONFIG_DIR%" mkdir "%AKI_CONFIG_DIR%"
if not exist "%AKI_CONFIG_DIR%\setting.json" (
    copy /Y "%MCP_SRC%\setting.template.json" "%AKI_CONFIG_DIR%\setting.json"
)
copy /Y "%MCP_SRC%\AGENT_GLOBAL_RULES.md" "%AKI_CONFIG_DIR%\AGENT_GLOBAL_RULES.md"

echo [4/5] Deploying global agent skills for Orca / Claude...
set CLAUDE_SKILLS_DIR=%USERPROFILE%\.claude\skills\agent-delegation-workflow
set AGENTS_SKILLS_DIR=%USERPROFILE%\.agents\skills\agent-delegation-workflow
if not exist "%CLAUDE_SKILLS_DIR%" mkdir "%CLAUDE_SKILLS_DIR%"
if not exist "%AGENTS_SKILLS_DIR%" mkdir "%AGENTS_SKILLS_DIR%"
copy /Y "%SKILLS_SRC%\SKILL.md" "%CLAUDE_SKILLS_DIR%\SKILL.md"
copy /Y "%SKILLS_SRC%\SKILL.md" "%AGENTS_SKILLS_DIR%\SKILL.md"

echo [5/5] Adding tools to User PATH...
powershell -NoProfile -Command ^
    "$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User');" ^
    "if ($currentPath -notlike '*%TOOLS_DIR%*') {" ^
    "    [Environment]::SetEnvironmentVariable('Path', $currentPath + ';%TOOLS_DIR%', 'User');" ^
    "    Write-Host 'Added %TOOLS_DIR% to User PATH successfully!';" ^
    "} else {" ^
    "    Write-Host 'Tools directory is already in User PATH.';" ^
    "}"

echo ========================================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ========================================================
echo You can now use 'dispatch_to_agent' command anywhere.
pause
