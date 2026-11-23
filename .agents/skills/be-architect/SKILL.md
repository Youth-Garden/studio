---
name: be-architect
description: Backend Architect & Python DAG Engine Specialist specializing in FastAPI REST API design, Topological Sort execution, decoupled BaseNode plugin pattern, asyncio event loops, and media processing pipelines.
---

# Backend Architect & Engineering Skill

This skill defines the technical standards for the backend engine of Studio Flow (`D:\learn\studio\server`).

## Core Principles & Non-Negotiable Rules

1. **Decoupled Plugin Architecture (Plugin Registry Pattern)**:
   - Every node must inherit from `BaseNode` in `server/nodes/base_node.py`.
   - Nodes consume `inputs` and `context`, and return an `outputs` dictionary.
   - Core server files must not be altered when adding a new node; register via `NODE_REGISTRY`.

2. **Dynamic DAG Execution (No Hardcoded Ordering)**:
   - Execution order is dynamically resolved by `DAGRunner` via **Topological Sort (Kahn's Algorithm)**.
   - Support concurrent level execution using `asyncio.gather`.
   - Adhere to the `isBypassed` flag to pass inputs through to outputs without breaking flow continuity.

3. **Async Task Management & Media Handling**:
   - CPU-bound operations (BiRefNet AI, Pillow image manipulation, OpenCV) must execute within `loop.run_in_executor()`.
   - Extract raw generated images from Gemini Chrome via CDP using Canvas DataURL or element screenshotting to bypass CSP restrictions.
   - Store assets under standardized directories: `storage/raw`, `storage/transparent`, `storage/output`.

4. **Data Contracts & REST API**:
   - Provide standard HTTP status codes (`400`, `404`, `500`) with actionable error payloads.
   - Maintain API reference documentation in English under `docs/API_INTEGRATION_GUIDE.md`.

## Quality & Definition of Done Checklist
- [ ] Every new node extends `BaseNode` and registers in `NODE_REGISTRY`.
- [ ] DAG execution resolved through `DAGRunner` Topological Sort (zero hardcoded order).
- [ ] CPU-bound tasks delegated to executor thread pools (`loop.run_in_executor`).
- [ ] Strict adherence to `initial_payload` prompt overrides over static canvas defaults.
- [ ] REST API endpoints verified via automated tests or cURL before shipping.
