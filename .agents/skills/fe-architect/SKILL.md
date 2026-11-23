---
name: fe-architect
description: Frontend Architect & React Flow Specialist specializing in UI/UX construction for Studio Flow using React 19, TypeScript, Tailwind v4, @xyflow/react, strict Meta Neutral design system, and unified portal architecture.
---

# Frontend Architect & Engineering Skill

This skill defines the technical frontend standards for Studio Flow (`D:\learn\studio\ui`).

## Core Principles & Non-Negotiable Rules

1. **Strict Component Reusability & No Hardcoded Styles**:
   - Utilize standard Shared Components: `<Button variant="..." size="...">`, `<Card>`, `<Input>`, `<Textarea>`, `<Badge>`, `<StatusBadge>`, `<Accordion>`, `<Sheet>`, `<Tooltip>`, `<Toaster>`.
   - **Never manually override button classes** (`border`, `rounded`, `bg`, `shadow`) on `<Button>` components.
   - Adhere strictly to the **Meta Neutral Design Palette** (`#1b1b1b`, `#262626`, `#333333`, `#525252`, `#ffffff`, `#9e9e9e`) with Sky accents for active states.

2. **Unified Portal & Dialog Architecture (`usePortal`)**:
   - Modals, Popups, and Dialogs must open via `usePortal` (or `usePortalWithoutBackdrop`) and render centrally through `<PortalRenderer />`.
   - Never inject ad-hoc `fixed inset-0` overlays or duplicate backdrops directly inside components.
   - Dialogs must feature smooth 150-200ms scale-and-fade entry and exit transitions.

3. **Canvas & React Flow Ergonomics**:
   - Keep node components clean by separating view logic from toolbar actions (`NodeToolbar`).
   - Support accurate canvas coordinate projection (`screenToFlowPosition`) for palette placement.

4. **Code Cleanliness & Quality**:
   - Eliminate unused imports and sort dependencies cleanly.
   - Never open a browser automatically for UI testing; verify via code analysis, linting, and terminal builds.

## Quality & Definition of Done Checklist
- [ ] Zero inline `<svg>` in feature code; all icons consumed via `<Icons name="..." />`.
- [ ] No manual class overrides on `<Button>`; uses standard design variants and sizes.
- [ ] All modals, popups, and dialogs mounted through `usePortal` / `usePortalWithoutBackdrop`.
- [ ] Active and interactive states leverage shared `<Card isActive={...}>` with Sky accent tokens.
- [ ] Zero unused imports, clean TypeScript compilation (`bun run build`), no console errors.
