---
name: agent-delegation-workflow
description: Globally delegates mechanical coding, refactoring, and file modification tasks from an Architect agent (Orca, Claude, etc.) to an active Web/Desktop Builder Agent (Gemini, Claude.ai, ChatGPT, etc.) via Studio Flow Gateway, Browser CDP, and AkiMCP. Use whenever an execution plan is drafted in docs/plans/ and needs direct implementation on disk without manual copy-pasting.
---

# Global Agent Delegation & Execution Workflow (Architect ➔ Builder Agent)

This workflow defines the universal multi-agent delegation pattern:
- **The Architect (Orca, Claude Code, Antigravity CLI)**: Inspects requirements, analyzes the codebase, and writes an implementation specification into `docs/plans/[task]-plan.md`.
- **The Builder (Gemini Web, Claude.ai, ChatGPT via AkiMCP)**: Receives the plan via automated browser dispatch and executes mechanical file edits and builds directly on disk using AkiMCP.

---

## 1. Architectural Philosophy

1. **Decoupled Roles**:
   - The Architect remains lightweight and focused on system architecture, unpolluted by massive mechanical diffs.
   - The Builder operates with generous web quotas and specialized tool integrations (AkiMCP).

2. **Multi-Agent Agnostic**:
   - The dispatcher is not tied to any single provider. It automatically routes tasks to whatever Web Agent tab is active on the debugging browser instance (Gemini, Claude.ai, ChatGPT, Grok, etc.).

3. **Zero-Copy Automation**:
   - The Architect automatically executes the dispatch command. The user never needs to manually copy-paste instructions across windows.

---

## 2. Dispatch Command Reference

Whenever a plan file is ready (e.g. `docs/plans/feature-plan.md`):

### Primary Option: Studio Flow Gateway (Recommended)
Dispatch directly through the local Studio Flow orchestration endpoint:
```bash
curl.exe -s -X POST http://127.0.0.1:8000/api/agent/dispatch -H "Content-Type: application/json" -d "{\"plan_path\": \"docs/plans/feature-plan.md\"}"
```

### Fallback Option: System Dispatch CLI
Use the global system command if the Studio Flow server is offline:
```bash
dispatch_to_agent "docs/plans/feature-plan.md"
```

---

## 3. Plan Specification Standards

To ensure the Builder Agent acts with maximum autonomy, every plan MUST provide:
- **Target Files**: Explicit relative or workspace paths to inspect and modify.
- **Rules Context**: Any project-specific constraints (e.g. standard `<Button>` components, enum usage, i18n keys).
- **Clear Action Steps**: Ordered breakdown of what to change, file by file.
- **Verification**: Commands to verify the change (e.g. tests, linting, build).
- **AkiMCP Rule**: The Builder Agent MUST always invoke `aki__akidevrule_context` first to retrieve a valid receipt token before editing files.
