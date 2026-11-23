# Technical Architecture & Dynamic Execution Guide

This document clarifies the system architecture, the relationship with **n8n concepts**, how the dynamic node execution works, and the roadmap for full n8n engine embedding.

---

## 1. Direct Answer: Is this n8n or Custom?

### The Truth:
* **The current interface is NOT the official `n8n` binary package.**
* It is a **custom lightweight React Flow implementation that follows the n8n Workflow Paradigm (Graph-as-Code & Webhook-driven)**.
* **Why this was built first**:
  - The official n8n application is an entire ecosystem written in TypeScript/Vue.js requiring Node.js servers, a SQLite/PostgreSQL database, and its own execution engine (typically running as a 1GB+ Docker container).
  - You previously stated: *"tôi kị cái vụ custom từ đầu lắm nhé có sẵn thì xài"* (I dislike building from scratch, use what's available).
  - To respect that while keeping your Python AI runtime (`rembg`, `BiRefNet`, `Playwright CDP`) connected directly on Windows without forcing Docker dependencies, we used **React Flow (`@xyflow/react`)**, which is the industry-standard open-source library used to build canvas workflows like n8n and LangFlow.

---

## 2. Is it as DYNAMIC as n8n?

### Current Dynamic Capabilities:
1. **JSON-Driven State (Graph as Code)**:
   - The entire canvas is loaded dynamically from `server/workflow.json`.
   - Any external Agent or backend script can generate or modify `server/workflow.json`, and the UI will immediately re-render those nodes and edges.
2. **Dynamic Node Configuration**:
   - Every parameter (Gemini Prompt, Canvas dimensions, Background color, AI model name) is bound to the Node's `data` payload and synchronized back to the backend via `POST /api/workflow`.
3. **Webhook Triggering**:
   - Other AI Agents do not need the UI; they can trigger the flow via `POST /api/workflow/execute` with dynamic JSON payloads.

### How to make the Execution 100% Dynamic (Node-to-Node DAG Runner):
Currently, the backend executes the pipeline in sequential stages defined in `queue_manager.py`:
`Trigger -> Gemini CDP -> BiRefNet -> Banner Framing -> Output`.

To achieve 100% dynamic execution like n8n's internal engine:
* The backend reads the `edges` array from `workflow.json`.
* It builds a **Directed Acyclic Graph (DAG)**.
* It executes nodes based on connection order:
  ```text
  If Node A -> Node B:
     Output_of_A becomes Input_of_B
  If Node A -> Node B and Node A -> Node C:
     Execute B and C in parallel or sequence with Output_of_A
  ```

---

## 3. Two Technical Paths Moving Forward

### Option A: Keep & Enhance the Lightweight Flow (Current Setup)
* **Stack**: React Flow + FastAPI + BiRefNet Python Worker.
* **Pros**:
  - Super lightweight, fast startup, zero Docker overhead.
  - Custom nodes tailored specifically for Banner Design, Image Matting, and Chrome CDP.
  - Native integration with Python AI packages.
* **Cons**:
  - You don't get n8n's 400+ built-in third-party service nodes (Slack, Airtable, Notion) unless written manually.

### Option B: Deploy Genuine Official n8n via Docker / NPM
* **Stack**: Official n8n Server (port `5678`) + Python FastAPI Microservice (port `8000`).
* **How it works**:
  1. We launch official n8n:
     ```bash
     npx n8n
     # or docker run -d --name n8n -p 5678:5678 n8nio/n8n
     ```
  2. You log in to `http://localhost:5678` (100% genuine n8n interface).
  3. We create a workflow in official n8n using:
     - **Webhook Node** (for external agents).
     - **HTTP Request Node** (calls `http://localhost:8000/api/gemini/generate`).
     - **HTTP Request Node** (calls `http://localhost:8000/api/birefnet/remove-bg`).
     - **HTTP Request Node** (calls `http://localhost:8000/api/banner/compose`).
* **Pros**: 100% genuine n8n, 400+ nodes, native schedule triggers, visual debugging on every node.
* **Cons**: Heavier footprint.

---

## 4. UI Layout Update
* Removed the redundant toggle button from the header navbar.
* Left only one toggle button inside the right sidebar header (`>`).
* Retained the interactive drag-to-resize divider between the canvas and sidebar.
