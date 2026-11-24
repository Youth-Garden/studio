# Developer & User Guide: Studio Flow Platform

A comprehensive operating manual for the **Studio Flow** visual canvas and **Multi-Agent Delegation Gateway**.

---

## 1. System Topology & Dual-Mode Execution

Studio Flow operates in two complementary modes:

### Mode A: Visual DAG Asset Pipeline
- **Inputs**: Text prompts, image uploads, or webhook triggers.
- **Processing Nodes**:
  - `TriggerNode`: Ingests parameters.
  - `GeminiNode`: Generates raw imagery via Chrome CDP.
  - `BirefnetNode`: Removes backgrounds with sub-pixel alpha accuracy.
  - `BannerNode`: Frames subject to canvas presets (16:9, 1:1, 4:5) with enhancements.
  - `OutputNode`: Writes composed assets to `storage/output/` and serves via HTTP static mounts.

### Mode B: Multi-Agent Code Delegation Gateway
- **Endpoint**: `POST /api/agent/dispatch`
- **Payload**:
  ```json
  {
    "plan_path": "docs/plans/feature-plan.md",
    "caller": "Orca Architect",
    "extra_note": "Implement immediately without confirmation"
  }
  ```
- **Lifecycle**:
  1. Gateway receives the request and appends an entry to `storage/agent_dispatch_logs.json`.
  2. The `AgentBuilderNode` connects to the local Chrome DevTools Protocol port (`9222`).
  3. Locates an available web agent session (Gemini, Claude, ChatGPT).
  4. Injects the plan file link with receipt execution instructions and triggers the send event.
  5. The web agent interacts with AkiMCP (`port 9999`) to apply edits to disk.

---

## 2. Environment Setup

### Prerequisites
- Windows 10/11 (64-bit).
- Python 3.10 to 3.12 (virtual environment at `server/.venv`).
- Bun (v1.2+) or Node.js (v18+).
- Google Chrome or Microsoft Edge.
- Tailscale (optional, required only for remote web agent OAuth ingress).

### Running Manually
1. **Backend**:
   ```powershell
   cd server
   .\.venv\Scripts\Activate.ps1
   uvicorn app:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Frontend UI**:
   ```powershell
   cd ui
   bun run dev
   ```

---

## 3. Realtime Logs & Monitoring

1. Open the UI Canvas at `http://localhost:5173`.
2. Expand the right sidebar.
3. Switch between tabs:
   - **Config**: Inspect and adjust parameters for the currently selected node.
   - **Jobs**: Track historical batch image generation jobs and error traces.
   - **Agent Logs**: View realtime incoming delegation dispatches, plan paths, caller names, and raw execution terminal logs.
