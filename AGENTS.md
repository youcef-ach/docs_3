# AGENTS.md — Frontend Platform Implementation Rules (v3.1 Unified Baseline)

This document is the **authoritative rulebook** for the MAJARA Frontend Platform.
Every agent, developer, and automated pipeline modifying this repository MUST comply with these invariants.

---

## 1. Architectural Scope & Boundary Invariants

- **Scope Limit**: Frontend client application only (Web SPA, Desktop Kiosk, Mobile Container).
- **Backend Separation**: The backend (`majara-backend`) is an external Go 1.27 service running Echo v5, Ent ORM, Postgres 18, MinIO, Ory Kratos (AuthN), and Ory Keto (AuthZ). Do NOT touch or duplicate backend logic.
- **Contract Adherence**: All network payloads strictly follow `majara-backend/api/openapi.yaml` and `AGENTS.md § 16` of the backend repo.
- **Authoritative Boundaries Specification**: The authoritative package boundary and dependency rulebook lives in [`docs/BOUNDARIES.md`](file:///c:/Users/achou/Documents/GitHub/frontend/docs/BOUNDARIES.md).
- **Authoritative Developer Guide**: The step-by-step operational blueprint for building new features, routes, and pages lives in [`docs/DEVELOPER_GUIDE.md`](file:///c:/Users/achou/Documents/GitHub/frontend/docs/DEVELOPER_GUIDE.md).
- **Mechanical Boundary Gates**: All code MUST pass the 6 automated import boundary rules enforced in `tests/boundaries.test.ts`:
  1. `@platform/*  ─X→ @majara/*` (Platform packages never import MAJARA domain code)
  2. `@platform/*  ─X→ src/features/* / apps/*` (Platform packages never import app internals)
  3. `plugins/*     ─X→ apps/*` (Plugins never import application shell internals)
  4. `plugins/*     ─X→ src/features/*` (Plugins never import MAJARA application feature components)
  5. `ui-*          ─X→ api-client` (Presentational components never directly import API transport)
  6. `src/*         ─X→ *apiClient*` (Monolithic transport client is forbidden; network calls must use granular domain transports)
- **Package Promotion Invariant**: Code under `src/` (e.g. `src/contracts`, `src/services/api`, `src/features/*`) is promoted to `packages/` ONLY when there is a genuine independent boundary or a second real consumer—never simply because another client exists.

---

## 2. Core Technical Stack Invariants (v3.1)

| Layer | Standard | Strict Invariant |
| :--- | :--- | :--- |
| **Framework** | React 19.3 + TypeScript 5.7+ | Functional components with Hooks only. Zero class components. |
| **Build Tooling** | Vite 6 | ESM native development with proxy routing. |
| **Monorepo** | Turborepo + pnpm workspaces | Lightweight Rust caching; zero Nx daemon overhead. |
| **Mobile Strategy** | Tauri Mobile | **No React Native. No custom SDUI interpreters.** Single unified React 19 webview codebase across Web, Desktop, and Mobile. |
| **Styling** | Vanilla Extract (`@vanilla-extract/css`) | **Zero-runtime scoped CSS.** Zero TailwindCSS. Typed design tokens via `createThemeContract`. |
| **Validation** | TypeBox (`@sinclair/typebox`) | **No Zod on the hot path.** JIT-compiled schema validation emitting standard JSON Schema (Draft-07/2020-12). |
| **Lifecycle State** | XState v5 Statecharts | Finite state machines for boot, plugin loading, and offline queues. Zustand is reserved solely for ephemeral client UI state. |

---

## 3. Theming & The Star Toggle (ADR-005 & ADR-016)

- The Star is a **Context Lens**, not a destination.
- Persistent state: `preferredStarIds: string[]` (max 4).
- Transient state: `activeStarId: string | 'all_preferred'`.
- **Vanilla Extract Theme Contract**:
  - `themeContract` formalizes: `--color-gold`, `--color-cyan`, `--color-accent`, `--bg-panel`, etc.
  - Core themes: Deep Space Navy (`deepSpaceTheme`), Afrobot Forge (`forgeTheme`), The Canvas (`canvasTheme`), ACS Synapse (`synapseTheme`).
  - Runtime hydration: Injects CSS custom properties dynamically matching the contract when remote manifests load.
- **Soft 2-Block Sorting**:
  - Requests append `?active_star=<id>`.
  - Backend returns `block: 0` (prioritized) and `block: 1` (deprioritized). Prioritized items render first; deprioritized items are never hidden.

---

## 4. Authentication (Ory Kratos) & Authorization (Ory Keto)

### Ory Kratos (AuthN)
- **Browser Client**:
  - Initialized via `GET /kratos/self-service/login/browser` (`credentials: 'include'`).
  - Vite dev proxy routes `/kratos` $\rightarrow$ `http://localhost:4433`.
  - Form action URLs (`flow.ui.action`) MUST be rewritten to `/kratos/...` to maintain same-origin cookie integrity.
  - Submissions extract `csrf_token` and dispatch to Kratos action with `credentials: 'include'`.
  - On HTTP 400 validation error, extract user feedback from `ui.messages` or `ui.nodes[].messages` and update flow.

### Ory Keto (AuthZ)
- Zero client-side role guessing (no `isAdmin = true`).
- Access control evaluates backend relation tuples: `check(subject, relation, namespace, object)`.
- On HTTP 403, display backend error message verbatim without swallowing permission details.

---

## 5. Domain Invariants (Compass & Gamification)

- **Fixed Compass Geography (ADR-018)**:
  - North = Horizon, East = Workshop, West = Academy, South = Base.
  - In Arabic / RTL mode, text and reading order mirror, but the **cardinal directions of the Compass remain fixed**.
- **Dual Currency**:
  - **ZAD** (`int64`): Energy currency; spent on kits, equipment, and Observatory access.
  - **ATHAR** (`int`): Reputation currency; earned via Quests/Bounties; unlocks Guild ranks and tiers.
- **Offline Observatory Check-In (ADR-019)**:
  - Time-Key QR check-ins queue locally in IndexedDB if connectivity degrades, syncing automatically upon reconnection.
- **First-Party Worlds (M17)**:
  - Five worlds: Home, Base, Horizon, Academy, Playground.
  - Worlds are first-party product domains/workspaces, **NOT plugins**. The plugin architecture is reserved for modular extensibility.
  - World identity is purely derived from `RouteMatch` via `deriveWorldFromRoute()` — zero independent world state.
  - Authoritative world-route registry lives in [`src/contracts/worldRegistry.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/contracts/worldRegistry.ts). Route ownership, world definitions, and navigation metadata are defined there and nowhere else.
  - Two distinct authorities: `WORLD_REGISTRY` owns route ownership/navigation; `PAGE_COMPONENTS` ([`src/composition/pageComponents.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/composition/pageComponents.ts)) owns route-to-component mapping. Invariant: `Object.keys(PAGE_COMPONENTS).sort() === getAllRegisteredRoutes().sort()`.
  - Playground is declared with `landingRoute: null` and `navigation: []` — no fake routes or placeholder components.
  - Bounties route assignment to Horizon is a provisional M17 product navigation decision, distinct from backend Work domain semantics.

---

## 6. Code Style & Quality Invariants

- **Case Convention**: Network payloads use `snake_case`. Internal TypeScript uses `camelCase` and `PascalCase`.
- **Zero Raw CSS Strings**: All styling belongs in `.css.ts` Vanilla Extract modules or typed token contracts.
- **Strict Linting**: Zero unused variables, zero implicit `any`, zero suppressed TypeScript errors.
- **Feature Development Pipeline**: All new features, pages, and routes MUST follow the 10-step blueprint in [`docs/DEVELOPER_GUIDE.md`](file:///c:/Users/achou/Documents/GitHub/frontend/docs/DEVELOPER_GUIDE.md) using M15 as the canonical reference implementation.

---

## 7. Performance, Runtime Budgets & Device Invariants

- **Contract Language Invariant**:
  - The platform NEVER claims an unconditional "guarantee of 60 FPS across all devices".
  - The authoritative definition is: *"The platform is architected, constrained, and instrumented to achieve smooth performance within explicit budgets across supported device tiers."*
- **Core-First Boot Invariant**:
  - The core application shell and critical routes MUST boot with zero dependency on plugins.
  - Plugins MUST NEVER be eagerly loaded into the initial application bundle. Dynamic imports (`React.lazy`, async module hydration) are mandatory.
- **Tauri Mobile WebView Reality**:
  - Tauri Mobile renders via the mobile OS WebView (Android WebView / iOS WebKit), NOT native React Native primitives.
  - **Compositor-Only Animations**: Animations on hot paths MUST animate GPU-accelerated compositor properties only (`transform`, `opacity`). Layout reflow thrashing (`width`, `height`, `top`, `left`, `margin`) is strictly forbidden.
  - **Minimal DOM Depth & Virtualization**: Views must maintain shallow DOM depth. Any scrollable collection exceeding 50 items MUST use virtualization to prevent WebView memory exhaustion on lower-end devices.
- **Plugin Performance Contract**:
  - **Bounded Initialization**: A plugin's `initialize()` must execute in $\le 50\text{ms}$. Slow or hanging initializers transition to `DEGRADED`.
  - **Non-blocking RPC**: Communication with sandboxed runtimes or background workers MUST be non-blocking and rate-limited.
  - **Mandatory Lifecycle Cleanup**: Every plugin `dispose()` MUST cleanly unregister all slots, cancel timers, unsubscribe from event buses, and release references to avoid memory leaks.
- **Explicit Platform Budgets**:
  - Core Initial JS: $\le 180\text{ kB}$ gzip.
  - Largest Contentful Paint (LCP): $\le 2.0\text{s}$ on 4G networks.
  - Interaction to Next Paint (INP): $\le 150\text{ms}$.
  - Cumulative Layout Shift (CLS): $\le 0.05$ (dynamic plugin slot appearance must never cause layout thrashing).
