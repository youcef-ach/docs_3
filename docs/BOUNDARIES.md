# MAJARA Repository Architectural Boundaries & Dependency Rulebook (v3.1 Baseline)

This document is the **authoritative architectural specification** for repository boundaries, package granularities, and dependency directions in the MAJARA Frontend Platform.

---

## 1. Repository Architectural Zones

The repository is structured into five architectural zones:

```text
apps/          Application shells and composition roots
packages/      Reusable platform/domain libraries with independent contracts
plugins/       Optional modular feature extensions (T1 Host / T2 Sandboxed)
packs/         Declarative plugin collections (JSON/YAML only; zero executable code)
bundles/       Declarative product/tenant presets (JSON/YAML only; zero executable code)
tooling/       Build, development, verification, and linting infrastructure
```

### Dependency Hierarchy & Direction

```text
                    ┌─────────────────────────┐
                    │      Apps / Shells      │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
         MAJARA Application              Platform Packages
            / Features                      / Contracts
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                           Pure Contracts
```

### Core Invariant Rules

1. **One-Way Dependency**: Application and domain code may depend on platform code. Platform code (`@platform/*`) must **never** depend on or import MAJARA application or domain code.
2. **Plugin Sandboxing**: Plugins may depend only on public contracts (`@platform/plugin-sdk`, `@platform/design-tokens`, `@majara/domain-sdk`, `@platform/layout-engine`). Plugins must **never** import host application internals (`apps/*`, `src/features/*`, internal components).
3. **Declarative Bundles/Packs**: Bundles and Packs contain configuration only. They must not contain executable components, services, or business logic.
4. **Transport Independence**: Transport layers (`api-client`, `src/services/api`) never contain UI fallback policy or mock branches in production paths.

---

## 2. Mechanical Boundary Enforcement (CI Hard Gates)

Architectural boundaries must not rely solely on developer vigilance. The repository mechanically enforces these 6 non-negotiable dependency rules via automated tests (`tests/boundaries.test.ts`):

```text
1. @platform/*  ─X→ @majara/*
   Platform packages must remain completely unaware of the MAJARA domain.

2. @platform/*  ─X→ src/features/* / apps/*
   Platform packages must not import application features or shell internals.

3. plugins/*     ─X→ apps/*
   Plugins must not import application shell components or bootstrapping.

4. plugins/*     ─X→ src/features/*
   Plugins must not import internal feature components (e.g., QuestsPage, Modal).

5. ui-*          ─X→ api-client
   Presentational UI packages and components must not import backend transports.

6. src/*         ─X→ *apiClient*
   Monolithic transport client is forbidden; network calls must use granular domain transports.
```

Any pull request or commit violating these rules fails `npm test` immediately with explicit file and line diagnostics.

> **Operational Implementation Guide**: For the concrete, step-by-step 10-step blueprint on how to implement new features within these boundaries, consult [`docs/DEVELOPER_GUIDE.md`](file:///c:/Users/achou/Documents/GitHub/frontend/docs/DEVELOPER_GUIDE.md).

---

## 3. Package Creation & Promotion Rules

To prevent premature package fragmentation while maintaining clean boundaries:

### The Package Promotion Rule

> **Promote to `packages/` when there is a genuine independent boundary or a second real consumer—not simply because another client exists.**

- **Feature Layer vs. Packages**: Application-specific features (`src/features/quests`, `src/features/discover`) belong in the application source tree until a genuine independent consumer (such as a second application or tooling) or an independent release/versioning requirement warrants promotion.
- **Contract & API Placement**: `src/contracts` and `src/services/api` remain in the application codebase while `apps/web` is the sole consumer. When a second real consumer emerges (e.g., tooling, CLI, or an extracted desktop/mobile shell requiring direct API consumption), they are promoted to `@platform/api-contracts` and `@platform/api-client`.
- **Granularity Threshold**: Do not create a new package merely because a file or folder is large. Create a package only when:
  1. It has an independent public contract.
  2. It is shared by multiple independent consumers.
  3. It requires an independent versioning or release lifecycle.
  4. It represents a genuine architectural boundary (e.g. pure domain without React/DOM dependencies).

---

## 4. Architectural Ownership Matrix

Every file in the repository must have exactly one architectural owner:

| Layer | Path | Ownership / Responsibility | Permitted Imports | Forbidden Imports |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Contracts** | `packages/plugin-contracts` | Stable TypeBox schemas for manifests, capabilities, RPC | Pure schema libraries (`@sinclair/typebox`) | Any application or domain code |
| **Platform Primitives** | `packages/design-tokens`, `packages/theme-engine`, `packages/layout-engine` | Visual tokens, runtime theme cascade, slot registry | `@platform/design-tokens`, `@platform/plugin-contracts` | `@majara/*`, `src/features/*`, `apps/*` |
| **Platform Runtime** | `packages/plugin-runtime`, `packages/plugin-sdk`, `packages/bundle-engine` | Plugin lifecycle, developer SDK, bundle hydration | `@platform/*` primitives and contracts | `@majara/*`, `src/features/*`, `apps/*` |
| **Pure Domain** | `packages/domain` | Nomads, Stars, Guilds, Quests, Compass geometry | Pure algorithms, standard library | React, DOM, HTTP, UI, Tauri, `@platform/plugin-runtime` |
| **Domain SDK** | `packages/domain-sdk` | Context lens stores (`useStarLens`), Compass helpers | `@majara/domain`, `@platform/theme-engine` | `apps/*`, `src/features/*` |
| **API Contracts** | `src/contracts/` | OpenAPI DTO schemas and precompiled TypeBox runtime validators | `@sinclair/typebox` | UI components, React hooks, fetch/XHR |
| **API Transport** | `src/services/api/` | HTTP transport, credentials, ApiError, upload strategy | `src/contracts/`, `apiError.ts` | React, UI components, mock fallbacks |
| **Feature Layer** | `src/features/<name>/` | ViewModels, repository policy, state machine hooks, UI | Platform packages, domain packages, contracts, transport | Downward internal leakage into platform |
| **World Registry** | `src/contracts/worldRegistry.ts` | World identity, route ownership, navigation metadata (pure contract) | `src/contracts/routes.ts` | React, DOM, page components, APIs, stores, permissions |
| **App Shell & Composition** | `src/App.tsx`, `src/components/`, `src/composition/` | Composition root, routing, auth gates, layout host, `PAGE_COMPONENTS` mapping | Everything in packages, features, and services | Must not be imported by packages or plugins |
| **Plugins** | `plugins/official/`, `plugins/community/` | Feature extensions contributing to declared slots | `@platform/plugin-sdk`, `@platform/design-tokens`, `@majara/domain-sdk` | `apps/*`, `src/features/*`, internal components |

---

## 5. Frontend vs. External Backend Responsibility Boundary

The Go backend (`majara-backend`) is an external dependency and contractual boundary:

### Frontend Responsibilities
- API contracts consumed and precompiled from OpenAPI specification (`/v1/academy/quests`, `/v1/attempts`, `/v1/uploads`).
- Precompiled TypeBox runtime response validation (zero TypeScript casts at network boundary).
- Error normalization (`ApiError`, verbatim gate denial messages).
- Monotonic request sequencing (`RequestSequencer`, ADR-028) & `AbortController` query cancellation.
- Headless attempt state machine & double-submission guards (`useQuestFlow`).
- Advisory upload validation ($\le 10\text{ MiB}$, MIME allowlist) and upload progress reporting (`IUploadTransport`).
- Star Lens dynamic context resolution and soft 2-block sorting preservation.
- Decoupled authentication recovery (`onRequireAuth` / `majara:auth-required`).

### Backend Responsibilities (Strictly Out-of-Scope for Frontend)
- Ory Kratos AuthN session lifecycle & identity storage.
- Ory Keto ReBAC relation tuples & permission evaluations.
- Database schemas, migrations, and transactional integrity (Postgres 18, Ent ORM).
- Idempotent ZAD minting, escrow holding, and ledger movements.
- Object storage persistence, ClamAV anti-virus scanning, and SigV4 verification (MinIO).
- HTTP API implementation in Go 1.27 / Echo v5.

---

## 6. Definition of Done for Architectural Boundaries

A feature or pull request is boundary-compliant when:
- [x] All 5 mechanical boundary rules pass automated CI test validation (`npm test`).
- [x] Zero platform packages import MAJARA domain or application code.
- [x] Zero plugins import application shell or feature internals.
- [x] Transport layers never silently convert 401/403/500 into mock success data.
- [x] DTOs are mapped into normalized ViewModels before reaching presentation (zero raw DTO leakage).
- [x] New packages are introduced only upon meeting the genuine boundary / second consumer promotion rule.
