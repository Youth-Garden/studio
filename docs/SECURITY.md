# Security Policy & Isolation Boundaries

This document defines the security guarantees, credential management, and execution sandboxing for the **Studio Flow** and **AkiMCP** ecosystem.

---

## 1. Zero-Credential Exposure Principle

1. **No Hardcoded Tokens in Git**:
   - The repository contains **zero personal access tokens, private API keys, or machine-specific filesystem usernames**.
   - All tools, scripts, and skills reference `%USERPROFILE%`, relative paths, or environment variables.

2. **Template-Based Configuration**:
   - Configuration templates (`mcp-config/setting.template.json`) provide safe defaults without leaking host usernames or internal network topologies.

---

## 2. Ingress & Tunnel Security

1. **Tailscale Funnel Authentication**:
   - Remote Web Agents (Gemini, Claude.ai) communicate with the local AkiMCP server exclusively over an encrypted HTTPS Tailscale Funnel.
   - Every connection is validated via standard **OAuth 2.0 Discovery** (`/.well-known/oauth-authorization-server`) and gated by a static master passphrase.

2. **AkiMCP Receipt Gatekeeper**:
   - Web Builder Agents cannot arbitrarily write or execute shell commands without obtaining a short-lived, cryptographically signed receipt token via `aki__akidevrule_context`.
   - Tool calls without a valid receipt are immediately rejected by the AkiMCP gatekeeper.

---

## 3. Local Execution Sandboxing & Allowlist

1. **Filesystem Boundaries**:
   - AkiMCP restricts read and write operations strictly to designated workspace folders defined in `setting.json` (e.g. `D:\learn`, `D:\work`).
   - System directories (`C:\Windows`, `Program Files`, registry hives) are strictly out-of-bounds.

2. **Shell Execution Allowlist**:
   - Only explicit, pre-approved developer binaries are executable through `aki__run_cmd`:
     - `git`, `npm`, `npx`, `node`, `python`, `tsc`, `bun`, `bunx`.
   - Destructive commands (`rmdir /s /q C:\`, `format`, `reg delete`) are blocked at the engine layer.

---

## 4. Chrome CDP Network Isolation

- Chrome remote debugging (`port 9222`) is bound strictly to `127.0.0.1` (localhost).
- External network adapters cannot connect directly to the CDP WebSocket port, preventing arbitrary remote browser hijacking.
