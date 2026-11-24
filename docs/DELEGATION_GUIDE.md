# Studio Flow & Multi-Agent Delegation Toolkit

A complete, self-contained multi-agent automation toolkit integrating **Architect Planning (Orca, Claude Code)** with **Mechanical Web Builder Execution (Gemini Web, Claude.ai)** via **Studio Flow Gateway**, **Chrome DevTools Protocol (CDP)**, and **AkiMCP**.

---

## 1. Directory Structure

```text
studio/
├── .agents/skills/             # Standardized agent skills for Orca / Claude Code
│   ├── agent-delegation-workflow/
│   ├── ba-analyst/
│   ├── be-architect/
│   └── fe-architect/
├── server/                     # FastAPI Backend Gateway & DAG Graph Engine (Port 8000)
├── ui/                         # ReactFlow Visual Canvas & Realtime Agent Dispatch Logs (Port 5173)
├── storage/                    # Saved workflows, jobs, and dispatch history
├── tools/                      # CLI dispatch commands (dispatch_to_agent.js / .cmd)
├── mcp-config/                 # Ready-to-use AkiMCP configuration templates
├── setup.bat                   # 1-Click Environment Setup for new computers
├── start-all.bat               # 1-Click launch AkiMCP + Studio Flow + Chrome Debug
└── stop-all.bat                # 1-Click shutdown all agent background tasks
```

---

## 2. Quick Setup on a New Machine

Clone the repository and run the setup script:

```cmd
git clone git@github.com:Youth-Garden/studio.git
cd studio
setup.bat
```

The installer automatically:
1. Installs `@akinet/akimcp` and `ws` globally.
2. Initializes `~/.aki/mcpsv/setting.json` and autonomous execution rules.
3. Deploys global agent skills into `~/.claude/skills/` and `~/.agents/skills/`.
4. Registers `studio/tools/` into your Windows User `PATH` (enabling the `dispatch_to_agent` command globally).

---

## 3. Daily Usage

1. **Launch Services**:
   - Double-click `start-all.bat` (Starts AkiMCP server, Studio Flow Gateway, and Chrome Debug on port 9222).
2. **Dispatch Tasks from Orca**:
   - In Orca / Claude Code:
     ```text
     $agent-delegation-workflow Plan and implement [task description]
     ```
   - Orca creates the plan in `docs/plans/[task]-plan.md` and automatically dispatches it via:
     ```bash
     curl.exe -s -X POST http://127.0.0.1:8000/api/agent/dispatch -H "Content-Type: application/json" -d "{\"plan_path\": \"docs/plans/[task]-plan.md\"}"
     ```
3. **Monitor Live Execution**:
   - Open Studio Flow Dashboard: `http://localhost:5173/flow/multi_agent_code_delegation`
   - Switch to the **Agent Logs** sidebar tab to view caller identity, execution status, and live output streams.
