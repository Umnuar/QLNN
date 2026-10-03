# UI SYNC MASTER STATUS TRACKER

**Invariant Principle**: Copy FORM only, keep CONTENT intact.
- **Reference App (FORM source)**: `C:\Users\umnuar\Documents\Projects\QLHK`
- **Target App (CONTENT target)**: `C:\Users\umnuar\Documents\Projects\QLNN`
- **Active Git Branch**: `ui/full-sync` | **Baseline Tag**: `before-ui-sync`

---

## Task Matrix

| Task ID | Phase | Task Description | Subagent / Owner | Status | Result File | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `P0-STATUS-INIT` | Phase 0 | Initialize ui-sync tracking and run guide | Orchestrator | completed | `ui-sync/STATUS.md` | Master state initialized |
| `P0-HOWTO-RUN` | Phase 0 | Record runtime ports, scripts, credentials | Orchestrator | completed | `ui-sync/howto-run.md` | Documented dev & test procedures |
| `P0-RECON-REF` | Phase 0 | Reconnaissance of reference app (QLHK) | `A-recon-ref` | completed | `ui-sync/00_recon_ref.md` | Stack, router, CSS, tokens, icons |
| `P0-RECON-TARGET` | Phase 0 | Reconnaissance of target app (QLNN) | `A-recon-target` | completed | `ui-sync/00_recon_target.md` | Stack, routes, indicators, test baseline |
| `P0-MAP-CSS` | Phase 0 | High-level Page -> Component -> CSS Map | Orchestrator | completed | `ui-sync/map.md` | Cross-app structural mapping |
| `P0-GIT-BASELINE` | Phase 0 | Git baseline commit & tag creation | Orchestrator | completed | Git repository | Tag `before-ui-sync` created (commit 66df60b) |
| `P1-INV-SHELL` | Phase 1 | Inventory App Shell, Navigation & Layout states | `A-inv-shell` | completed | `ui-sync/00_screens_shell.md` | Header, Sidebar, Auth, Zoom, Ping |
| `P1-INV-PAGES` | Phase 1 | Inventory Primary Pages (Villages, Households, Analytics) | `A-inv-pages` | completed | `ui-sync/00_screens_pages.md` | All active view modes & statistics |
| `P1-INV-MODALS` | Phase 1 | Inventory Modals, Drawers, Filterbars, Dialogs | `A-inv-modals` | completed | `ui-sync/00_screens_modals.md` | 18 indicators form, 21-col preview, diffs |
| `P1-INV-CONSOLIDATE` | Phase 1 | Consolidate whole-screen & state inventory | Orchestrator | completed | `ui-sync/00_screens.md` | Complete coverage gate (114+ states) |
| `P2-DES-TOKENS` | Phase 2 | Extract design tokens (colors, typo, radii, shadows) | `A-design` | completed | `ui-sync/design-language/tokens.md` | Exact Tailwind & CSS variable values |
| `P2-DES-SHELL` | Phase 2 | Extract shell layout & navigation patterns | `A-design` | completed | `ui-sync/design-language/shell.md` | Header, Sidebar, responsive rules |
| `P2-DES-NAV-FILTER` | Phase 2 | Extract search, filterbars, dropdowns, pagination | `A-design` | completed | `ui-sync/design-language/patterns-nav-filter.md` | Filter islands, CustomSelect, badges |
| `P2-DES-DATA-FORM` | Phase 2 | Extract table & form input component patterns | `A-design` | completed | `ui-sync/design-language/patterns-data-form.md` | Sticky tables, cards, form inputs |
| `P2-DES-FEEDBACK` | Phase 2 | Extract feedback, drawers, modals, toasts, alerts | `A-design` | completed | `ui-sync/design-language/patterns-feedback.md` | Slide-over drawer, confirm dialogs, empty |
| `P3-APP-MAPPING` | Phase 3 | Whole-app component-to-pattern mapping matrix | `A-mapper` | completed | `ui-sync/01_mapping.md` | Target -> Reference pattern mapping (100% mapped) |
| `P3-APPROVAL-GATE` | Phase 3 | User presentation & formal approval gate | Orchestrator + User | completed | Artifact & User Approval | Formally approved by user |
| `P4-L1-FOUNDATION` | Phase 4 | Layer 1: Foundation tokens (Tailwind, index.css) | `L1-foundation` | completed | `ui-sync/layer1-tokens.md` | Non-breaking token adoption (Build & Test PASS) |
| `P4-L2-APP-SHELL` | Phase 4 | Layer 2: App Shell (AppLayout, Header, Sidebar) | `L2-shell` | completed | `ui-sync/layer2-shell.md` | Reskin shell keeping QLNN routes/menus (Build & Test PASS) |
| `P4-L3-PRIMITIVES` | Phase 4 | Layer 3: Shared primitives (Button, Select, Table, Modal) | `L3-primitives` | in_progress | `ui-sync/layer3-primitives.md` | Reusable UI building blocks |
| `P4-L4-AUTH` | Phase 4 | Layer 4 Screen Group: Login & Auth | `L4-auth` | pending | `ui-sync/layer4-auth.md` | Login form, error alerts, session |
| `P4-L4-VILLAGES` | Phase 4 | Layer 4 Screen Group: Villages & Territory | `L4-villages` | pending | `ui-sync/layer4-villages.md` | Banner, stat cards, village cards |
| `P4-L4-HOUSEHOLDS` | Phase 4 | Layer 4 Screen Group: Households & FilterBar & Form | `L4-households` | pending | `ui-sync/layer4-households.md` | 18 agricultural indicators, OCC, Drawer |
| `P4-L4-ANALYTICS` | Phase 4 | Layer 4 Screen Group: Analytics Dashboard | `L4-analytics` | pending | `ui-sync/layer4-analytics.md` | Summary cards, charts, village comparison |
| `P4-L4-RECYCLE-AUDIT` | Phase 4 | Layer 4 Screen Group: Recycle Bin & Audit Log | `L4-recycle-audit` | pending | `ui-sync/layer4-recycle-audit.md` | Restore, permanent delete, timeline diff |
| `P4-L4-SETTINGS` | Phase 4 | Layer 4 Screen Group: System Settings & Users | `L4-settings` | pending | `ui-sync/layer4-settings.md` | Profile, user management, backup/restore |
| `P5-VER-CONTENT` | Phase 5 | Independent Content Invariant Verification | `V-content` | pending | `ui-sync/verify-content.md` | 100% Vietnamese labels, columns, data intact |
| `P5-VER-VISUAL` | Phase 5 | Independent Visual Parity Audit | `V-visual` | pending | `ui-sync/verify-visual.md` | Token compliance, spacing, dark mode |
| `P5-VER-FUNCTIONAL` | Phase 5 | Independent Automated Test & Flow Verification | `V-functional` | pending | `ui-sync/verify-functional.md` | 100% tests pass, 0 console errors |
| `P5-VER-A11Y` | Phase 5 | Independent A11y & Responsive Viewport Audit | `V-a11y-responsive` | pending | `ui-sync/verify-a11y.md` | 360px, 768px, 1280px, 1920px checks |
| `P6-FINAL-REPORT` | Phase 6 | Final Synthesis & Before/After Report | Orchestrator | pending | `ui-sync/FINAL_REPORT.md` | Complete executive & technical handoff |
