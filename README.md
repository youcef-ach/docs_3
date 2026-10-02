# MAJARA Platform — Architecture Reference & Source-of-Truth Repository

This repository contains the authoritative architectural specifications, core rulebooks, and foundational TypeScript source references from the **MAJARA Frontend Platform** (`AdvancedComputingSociety/frontend`). It serves as an authoritative knowledge base for architectural synthesis, structured extraction, and digital twin platform engineering.

---

## Directory Structure

```text
/
├── AGENTS.md                              # Authority Rulebook & Invariants (v3.1 Unified Baseline)
├── docs/
│   ├── frontend_architecture_standard.md  # Master Sealed Architectural Standard (v3.3)
│   ├── BOUNDARIES.md                      # Package Boundaries & 6 Mechanical Dependency Gates
│   ├── DEVELOPER_GUIDE.md                 # 10-Step Feature Blueprint & Operations Manual
│   ├── PERFORMANCE.md                     # Platform Performance Charter & Runtime Budgets
│   ├── EXTENSIBILITY.md                   # Extensibility Architecture (Bundles, Packs, Plugins & Slots)
│   ├── M18_IMPLEMENTATION_PLAN.md         # Milestone 18 Realignment & Shared Map Alias Pattern
│   ├── TAXONOMY_RECONCILIATION.md         # Product Taxonomy Rationale & Canonical Routing Decisions
│   └── PAGE_INTEGRATION_AUDIT.md          # Comprehensive Page, Interaction & Form Contract Audit
│
├── source-reference/
│   ├── worldRegistry.ts                   # Pure World Registry Contract & Navigation Metadata
│   ├── routes.ts                          # Canonical Route Definitions & Discriminated Union RouteMatch
│   ├── pageComponents.ts                  # Route-to-Component Lazy Composition Root
│   ├── theme.css.ts                       # Scoped Vanilla Extract Theme Contract (vars) & Star Lenses
│   └── App.tsx                            # Root Application Shell, History Adapter & Slot Host
│
└── README.md                              # Repository Index & Documentation Guide
```

---

## 1. Documentation Index & Classification

### [`AGENTS.md`](./AGENTS.md)
* **Classification**: **Authoritative / Canonical** (v3.1 Unified Baseline)
* **Purpose**: The mandatory rulebook governing the entire frontend. Enforces architectural boundaries, the technical stack (React 19.3, Vite 6, Turborepo, Tauri Mobile, Vanilla Extract, TypeBox, XState v5), auth invariants (Ory Kratos & Keto), cardinal geography, dual currencies (ZAD/ATHAR), and device runtime constraints.

### [`docs/frontend_architecture_standard.md`](./docs/frontend_architecture_standard.md)
* **Classification**: **Authoritative / Canonical** (v3.3 Sealed Architectural Standard)
* **Purpose**: Master architecture reference codifying the **Canonical Reference Flow**:
  $$\text{Backend HTTP} \rightarrow \text{Pure HTTP Transport} \rightarrow \text{TypeBox Precompiled DTO} \rightarrow \text{Repository/Hooks Flow} \rightarrow \text{Presentation} \rightarrow \text{CI Hard Gates}$$
  Classifies all rules into `[Implementation Fact]`, `[MAJARA Standard]`, `[General Recommendation]`, and `[Planned]`.

### [`docs/BOUNDARIES.md`](./docs/BOUNDARIES.md)
* **Classification**: **Authoritative / Canonical** (Repository Boundaries & Dependency Rulebook)
* **Purpose**: Codifies repository zones (`apps/`, `packages/`, `plugins/`, `packs/`, `bundles/`, `tooling/`), one-way dependency rules, the Package Promotion Rule, and the **6 automated boundary gates** enforced in CI.

### [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md)
* **Classification**: **Authoritative / Canonical** (Feature Reference Manual)
* **Purpose**: The step-by-step **10-Step Feature Blueprint** showing how to build any new route or feature from OpenAPI discovery to TypeBox contracts, granular transports, flow hooks, Vanilla Extract styling, and multi-layer automated tests.

### [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md)
* **Classification**: **Authoritative / Canonical** (Performance Charter & Runtime Architecture)
* **Purpose**: Establishes performance philosophy over blanket guarantees. Details supported device tiers, 14 performance principles, explicit budgets ($<180\text{ kB}$ gzip initial JS, $\text{LCP} < 2.0\text{s}$, $\text{CLS} < 0.05$), and plugin initialization contracts ($\le 50\text{ms}$).

### [`docs/EXTENSIBILITY.md`](./docs/EXTENSIBILITY.md)
* **Classification**: **Authoritative / Canonical** (Extensibility System Specification)
* **Purpose**: Formalizes the hierarchy of deployment bundles, catalog feature packs, code plugins, and type-safe host slots (`<Slot name="..." />`), along with fault-isolation error boundaries.

### [`docs/M18_IMPLEMENTATION_PLAN.md`](./docs/M18_IMPLEMENTATION_PLAN.md)
* **Classification**: **Authoritative Implementation Plan** (Milestone 18 Realignment)
* **Purpose**: Defines the 5 canonical worlds (`discover`, `base`, `academy`, `playground`, `horizon`), the canonical root route (`/` $\rightarrow$ `/discover`), and the **Shared Map Non-Owning Alias Pattern** where `/map` is owned by `discover` and exposed in `base` via an alias.

### [`docs/TAXONOMY_RECONCILIATION.md`](./docs/TAXONOMY_RECONCILIATION.md)
* **Classification**: **Authoritative Context & Decision Rationale**
* **Purpose**: Deep-dive record explaining why transient query tabs (`?tab=`) were replaced with canonical deep-linkable routes, why Compass cardinal navigation was deferred, and why the world switcher exposes all 5 worlds deterministically.

### [`docs/PAGE_INTEGRATION_AUDIT.md`](./docs/PAGE_INTEGRATION_AUDIT.md)
* **Classification**: **Authoritative Quality Audit** (Post-M18 Baseline)
* **Purpose**: Comprehensive field-by-field audit of all newly created and modified pages, interaction behaviors, and form fields (`CreateQuestModal`) against backend `openapi.yaml` contracts.

---

## 2. Source Code References (`source-reference/`)

These 5 canonical TypeScript/CSS modules represent the core architectural patterns in executable code:

1. **[`source-reference/worldRegistry.ts`](./source-reference/worldRegistry.ts)**:
   - Pure contract: zero React, zero DOM, zero styling dependencies.
   - Authoritative source for world identities, deterministic ordering, route ownership, and non-owning navigation aliases.
2. **[`source-reference/routes.ts`](./source-reference/routes.ts)**:
   - Canonical route array (`CANONICAL_APP_ROUTES`), discriminated union `RouteMatch`, and route parsing helpers.
3. **[`source-reference/pageComponents.ts`](./source-reference/pageComponents.ts)**:
   - Composition root declaring `React.lazy` imports for all canonical routes.
   - Enforced by automated boundary test: `Object.keys(PAGE_COMPONENTS).sort() === getAllRegisteredRoutes().sort()`.
4. **[`source-reference/theme.css.ts`](./source-reference/theme.css.ts)**:
   - Vanilla Extract theme contract (`vars`) formalizing color hierarchies, chamfer dimensions, glowing shadows, and the Star Context lenses (Deep Space Navy, Afrobot Forge, The Canvas, ACS Synapse).
5. **[`source-reference/App.tsx`](./source-reference/App.tsx)**:
   - Root application shell, history normalization adapter, route guard gates, top navigation HUD, and layout composition.

---

## 3. Core Architectural Invariants

* **Single Route Identity**: Routing state is exclusively represented by `RouteMatch`. World identity is purely derived via `deriveWorldFromRoute(routeMatch)` with zero independent `currentWorld` state.
* **Separation of Registry vs. Composition**: `worldRegistry.ts` owns *where routes belong* (navigation hierarchy); `pageComponents.ts` owns *what component renders*.
* **Zero Runtime CSS**: All styling is scoped at build-time with Vanilla Extract (`@vanilla-extract/css`). Zero TailwindCSS, zero raw string styles.
* **JIT Validation on Hot Paths**: TypeBox (`@sinclair/typebox`) compiles schemas into high-performance JIT validators; zero Zod on the hot path.
* **Tauri Mobile WebView Reality**: Single unified React 19 webview codebase across Web, Desktop, and Mobile. Compositor-only animations (`transform`, `opacity`) and list virtualization ($>50$ items) prevent WebView layout thrashing.
