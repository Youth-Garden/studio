# Contribution Guidelines

We welcome contributions to **Studio Flow** and the **Multi-Agent Toolkit**. Please review these standards before submitting changes or pull requests.

---

## 1. Code Standards & Architecture

1. **Frontend (`ui/`)**:
   - Built on React 19, TypeScript, and Tailwind CSS.
   - Strictly follow the **Feature-Sliced / Component Layering** conventions:
     - Shared primitives live in `src/shared/components/` (use variant & size props; avoid arbitrary CSS overrides).
     - Modular features live in `src/features/[feature]/`.
   - Never commit `console.log` statements in production components.

2. **Backend (`server/`)**:
   - Python 3.10+ with FastAPI and Pydantic v2.
   - Keep node execution idempotent: every DAG Node in `server/nodes/` must inherit from `BaseNode` and return structured JSON dictionaries.

3. **Tools & Dispatcher (`tools/`)**:
   - Node.js scripts in `tools/` must avoid heavy dependencies and run out-of-the-box using built-in modules (`http`, `path`, `fs`) and globally installed `ws`.

---

## 2. Agent Skills Standards

When adding or modifying skills in `.agents/skills/`:
- **Format**: Each skill folder must contain a valid `SKILL.md` with YAML frontmatter (`name`, `description`).
- **Language**: All technical documentation, plans, and instructions MUST be written in **100% standard English**.
- **No Decorative Emojis**: Keep skills clean, professional, and free from unnecessary emojis in headings or instructions.

---

## 3. Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature-name`.
2. Verify all local tests and builds:
   ```cmd
   cd ui && bun run build
   cd ../server && python -m pytest (if tests exist)
   ```
3. Commit with clear semantic commit messages:
   - `feat:` for new capabilities.
   - `fix:` for bug fixes.
   - `docs:` for documentation updates.
4. Push to your branch and open a Pull Request against `main`.
