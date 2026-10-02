# MAJARA Frontend Platform Architectural Standard & Reference
**Document Version:** `3.3-SEALED-ARCHITECTURAL-STANDARD`  
**Repository:** `AdvancedComputingSociety/frontend`  
**Evaluation Baseline:** September 2026  
**Scope:** Frontend Client Architecture (Web SPA, Desktop Kiosk, Mobile Container)  

---

## Architectural Principles vs. Implementation Evolution

> [!IMPORTANT]
> **Architecture vs. Implementation**:
> This architectural standard defines **invariants, layer boundaries, and structural constraints**. Individual implementation files, folder arrangements, and internal utilities are allowed to evolve over time, provided that all core boundary rules, isolation guarantees, and layer contracts remain satisfied. **Architectural responsibilities are durable; file names and paths are implementation choices.**

---

## Architectural Taxonomy & Statement Classification

To serve both as an exact record of the current repository and as a reusable architecture standard for future projects, every major architectural statement in this document is classified into one of four categories:

1. `[Implementation Fact]`: Verified physical fact directly present in the active codebase, manifests, or configuration.
2. `[MAJARA Standard]`: A deliberate, non-negotiable architectural rule adopted by this specific project.
3. `[General Recommendation]`: A reusable architectural pattern recommended for future projects, but not universally mandatory.
4. `[Planned]`: Target architectural design that is planned or stubbed, but not yet fully implemented in production code.

---

## Architectural Glossary

- **Platform (`@platform/*`)**: Domain-agnostic infrastructure primitives, contracts, runtimes, and design token engines with zero knowledge of MAJARA or any specific tenant.
- **Pure Domain (`@majara/domain`)**: Pure, framework-free business rules, geometric invariants, static definitions, and domain algorithms. Contains zero React, DOM, HTTP, or styling dependencies.
- **Domain Platform (`@majara/domain-sdk`)**: React-specific bindings and context stores exposing Pure Domain rules to UI runtimes.
- **Application Shell (`src/App.tsx`, `src/components/`)**: The composition root, routing host, layout framework, statecharts, and extension slot anchors.
- **Feature (`src/features/<name>/`)**: A bounded vertical slice representing a business domain capability (e.g. Quests, Observatories, Guilds).
- **Contracts (`src/contracts/`, `@platform/plugin-contracts`)**: Precompiled TypeBox wire schemas, validation logic, and TypeScript DTO types. Zero UI state, zero HTTP.
- **Transport (`src/services/api/`)**: Pure network transport functions managing HTTP headers, session credentials, AbortSignals, status mapping, and ApiError translation.
- **Repository (`src/features/*/application/*Repository.ts`)**: Data-access policy coordinator managing in-memory caching, request sequencing, and cache invalidation matrices.
- **ViewModel**: A clean, normalized TypeScript data structure consumed exclusively by presentation components, stripped of ORM internals and transport quirks.
- **Presentation (`src/features/*/components/`)**: React components styled via scoped Vanilla Extract modules (`.css.ts`), consuming ViewModels only. May own local UI state, but never data-access policy.
- **Plugin (`plugins/*`)**: Independent, modular extension contributing components to declared host slots.
- **Declarative Configuration (`packs/*`, `bundles/*`)**: Pure JSON/YAML declarations grouping plugins or configuring tenant archetypes without executable code.

---

## The Canonical Reference Flow

The diagram below represents the authoritative runtime lifecycle for every network request through the architecture:

```text
               ┌────────────────────────────────────────────────────────┐
               │              Backend HTTP API (Go / Echo)              │
               └───────────────────────────┬────────────────────────────┘
                                           │ Wire Response (HTTP 200/201/204)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │              Layer 2: Pure HTTP Transport              │
               │  Receives Response, parses JSON, handles AbortSignals  │
               └───────────────────────────┬────────────────────────────┘
                                           │ Parsed JSON Data
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │           Layer 1: Precompiled TypeBox Contract        │
               │  CValidator.Check(data) returns boolean:               │
               │  - if false: transport raises ApiError(422) w/ details │
               │  - if true: passes validated DTO downstream            │
               └───────────────────────────┬────────────────────────────┘
                                           │ Validated DTO
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                  Layer 3: Application                  │
               │  ┌──────────────────────────────────────────────────┐  │
               │  │ Repository: In-Memory TTL Cache, RequestSequencer │  │
               │  ├──────────────────────────────────────────────────┤  │
               │  │ Mappers: toViewModel() strips edges, derives UI  │  │
               │  ├──────────────────────────────────────────────────┤  │
               │  │ use*Flow Hook: viewState, in-flight lock, actions│  │
               │  └──────────────────────────────────────────────────┘  │
               └───────────────────────────┬────────────────────────────┘
                                           │ ViewModels & Action Callbacks
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │              Layer 4: Presentation Components          │
               │   Accessible DOM, Local UI State, Vanilla Extract CSS  │
               └───────────────────────────┬────────────────────────────┘
                                           │ Rendered DOM
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │              Automated Release Verification            │
               │  Flow Integration Tests, Boundary Gates, Bundle Budget │
               └────────────────────────────────────────────────────────┘
```

---

## 1. Repository Structure & Workspace Topology

### 1.1 Directory Tree
`[Implementation Fact]` The repository is a Turborepo-orchestrated monorepo managed via `pnpm-workspace.yaml`.

```text
c:/Users/achou/Documents/GitHub/frontend/
├── .github/
│   └── workflows/
│       └── ci.yml                     # 9-stage CI verification pipeline
├── bundles/
│   └── official/
│       └── bundle.nomad-forge.json     # Declarative archetype presets (JSON only)
├── packs/
│   └── official/
│       └── pack.forge-domain.json      # Declarative catalog plugin grouping (JSON only)
├── packages/                          # Reusable platform & domain libraries
│   ├── bundle-engine/                 # Bundle & Pack resolution runtime
│   ├── design-tokens/                 # W3C semantic design tokens & whitelist filter
│   ├── domain/                        # Pure domain rules, compass geography, slots
│   ├── domain-sdk/                    # React hooks for Nomad domain context
│   ├── layout-engine/                 # <Slot />, SlotRegistry, PluginErrorBoundary
│   ├── plugin-contracts/              # TypeBox schemas for manifests & verification
│   ├── plugin-runtime/                # Plugin lifecycle coordinator & T1 loader
│   ├── plugin-sdk/                    # definePlugin(), PluginContext
│   └── theme-engine/                  # 4-layer design token cascade engine
├── plugins/                           # Modular feature extensions
│   └── official/
│       ├── shell-discover-nav/        # Discover sub-navigation contextual plugin
│       └── star-forge/                # Afrobot Forge Maker Station reference plugin
├── src/                               # Web Application Shell & Feature Implementations
│   ├── assets/                        # Static SVGs, textures, badges
│   ├── components/                    # AppLayout, AppSidebar, TopNavigation, HUD
│   ├── contracts/                     # Precompiled TypeBox OpenAPI contracts & DTOs
│   ├── features/                      # Vertical feature modules (Quests, Guilds, etc.)
│   ├── machines/                      # XState v5 statecharts (appMachine, authMachine)
│   ├── services/                      # HTTP transport, ApiError, Kratos auth client
│   ├── styles/                        # Vanilla Extract theme contracts & tokens
│   ├── App.tsx                        # Composition root, routing, auth gateway
│   └── main.tsx                       # Web DOM bootstrap
├── scripts/
│   ├── check-bundle-size.mjs          # Gzip performance budget release gate
│   └── test.mjs                       # Workspace-wide Node.js native test runner
├── tests/                             # Workspace integration and boundary test suites
│   ├── boundaries.test.ts             # 5 mechanical architectural boundary gates
│   ├── bounties-horizon-flow.test.ts  # Horizon flow integration tests
│   ├── discover-*.test.ts             # Discover presentation and tab tests
│   ├── guilds-squads-flow.test.ts     # Guilds and squads flow tests
│   ├── logbook-profile-flow.test.ts   # Logbook, privacy, and portfolio flow tests
│   ├── observatories-flow.test.ts     # Observatories, booking, and offline tests
│   ├── platform-proof-gate.test.ts    # 7-point platform proof gate tests
│   └── quests-flow-integration.test.ts# Quests and attempt integration tests
├── docs/
│   ├── BOUNDARIES.md                  # Authoritative package boundaries rulebook
│   ├── EXTENSIBILITY.md               # Extensibility architecture specification
│   └── PERFORMANCE.md                 # Performance charter & runtime budgets
├── AGENTS.md                          # Repository invariants & frontend rules
├── package.json                       # Root workspace manifest
├── pnpm-workspace.yaml                # Workspace package glob patterns
├── turbo.json                         # Turborepo task pipeline configuration
├── tsconfig.json                      # Strict TypeScript compiler options
└── vite.config.ts                     # Vite 6 + React + Vanilla Extract + dev proxies
```

### 1.2 Package Ownership & Permitted Dependencies

`[MAJARA Standard]` The table below distinguishes between what an architectural layer **Can Depend On** (mechanically permitted) versus what it **Should Normally Depend On** (architectural intent to prevent dependency creep):

| Package / Zone | Layer Classification | Can Depend On | Should Normally Depend On | Must Never Depend On |
| :--- | :--- | :--- | :--- | :--- |
| `packages/plugin-contracts` | Platform Core | Pure schema libraries (`@sinclair/typebox`) | `@sinclair/typebox` | Any domain, app, or UI code |
| `packages/design-tokens` | Platform Core | Pure token dictionaries, W3C standards | Pure constants | Styling engines, UI components, domain |
| `packages/theme-engine` | Platform Core | `@platform/design-tokens` | `@platform/design-tokens` | Domain terms, React JSX, API calls |
| `packages/layout-engine` | Platform Core | `@platform/plugin-contracts`, React primitives | Minimal React primitives | Domain models, feature views, API transports |
| `packages/plugin-sdk` | Platform Core | `@platform/plugin-contracts`, `@platform/design-tokens` | Platform contracts & tokens | App shell internals, private features |
| `packages/plugin-runtime`| Platform Core | Platform packages, `@platform/plugin-contracts` | Platform packages | UI components, backend API transports |
| `packages/domain` | Pure Domain | Standard library, pure algorithms | Pure constants | React, DOM, HTTP, Tauri, styling |
| `packages/domain-sdk` | Domain Platform | `@majara/domain`, `@platform/theme-engine` | `@majara/domain` | Feature views, app shell internals |
| `plugins/official/*` | Extensibility | `@platform/plugin-sdk`, `@platform/design-tokens`, `@majara/domain-sdk` | Public SDKs only | `src/features/*`, `src/components/*` |
| `packs/official/*` | Declarative Config| None (JSON files only) | None | Executable code of any kind |
| `bundles/official/*` | Declarative Config| None (JSON files only) | None | Executable code of any kind |
| `src/contracts/` | Application Core | `@sinclair/typebox` | `@sinclair/typebox` | React components, UI state, fetch calls |
| `src/services/api/` | Application Core | `src/contracts/`, `src/services/api/apiError.ts` | Contracts & error parser | React components, mock fallbacks |
| `src/features/*/application`| Domain Feature| Contracts, transports, domain packages | Local transport & contracts | UI presentation JSX, direct raw fetch |
| `src/features/*/components` | Presentation | Local application hooks, ViewModels, Vanilla Extract | Local ViewModels & styles | Transports (`*Api.ts`), raw DTOs |

> [!NOTE]
> **Implementation Fact vs. Planning Discrepancy (Apps Directory):**  
> `[Implementation Fact]` While `pnpm-workspace.yaml` and `BOUNDARIES.md` define an `apps/*` glob intended for application shells (e.g. `apps/web`), the current repository contains no `apps/` directory. The web application shell lives directly in `src/` at the root workspace package (`@majara/frontend`). Per the Package Promotion Rule, this code remains unified in `src/` until a second distinct consumer warrants extraction.

---

## 2. Application & Runtime Targets

### 2.1 Current Runtime Reality vs. Target Runtime Architecture

`[Implementation Fact]` **Current Runtime Reality**:
- The active application executes as a **Vite 6 single-page web application** in standard browser engines (Chromium, Firefox, WebKit, Safari).
- Bootstrapped via `src/main.tsx` and `index.html`.
- State managed via React 19 and XState v5.
- Dev proxies forward `/api` to Echo v5 (`http://localhost:8080`) and `/kratos` to Ory Kratos (`http://localhost:4433`).

`[Planned]` **Target Runtime Architecture**:
- **Tauri 2 Desktop Shell**: Packaging the React application into a native desktop container for Observatory administrative stations.
- **Tauri 2 Mobile Shell**: Packaging the React application into mobile OS WebViews (Android Chromium System WebView / iOS WebKit).
- **Embedded Edge Kiosk (Tier 3)**: Running on Raspberry Pi 5 edge devices at physical observatories with local SQLite storage.
- Current Repository Fact: No `src-tauri` directory is currently initialized in the frontend repository.

### 2.2 Rejection of React Native & Custom SDUI
`[MAJARA Standard]` The platform deliberately rejects React Native, Expo, and custom Server-Driven UI (SDUI) interpreters in favor of a single unified React 19 codebase running in OS WebViews.

`[General Recommendation]` When using an OS WebView container strategy on mobile:
1. **Compositor-Only Animations**: Animations on hot paths must animate GPU-accelerated compositor properties only (`transform`, `opacity`). Layout reflow thrashing (`width`, `height`, `top`, `left`, `margin`) is strictly forbidden.
2. **Shallow DOM Depth**: Avoid deeply nested DOM wrapper hierarchies.
3. **Virtualization on Demand**: Collections exceeding 50 items should be virtualized on mobile targets to prevent WebView memory exhaustion.

### 2.3 Cross-Platform Code Sharing
`[MAJARA Standard]` The architecture is intentionally designed to maximize code sharing across Web, Desktop, and Mobile while isolating target-specific bridges. Contracts, transports, repositories, mappers, XState statecharts, React 19 UI components, Vanilla Extract styles, and the extensibility engine are 100% shared across all targets.

---

## 3. Core Architectural Model & DTO Isolation

### 3.1 The 4-Layer Feature Architecture
`[MAJARA Standard]` Every feature module is decomposed into four discrete layers:

1. **Contracts Layer (`src/contracts/*.ts`)**: Precompiled TypeBox wire schemas, validation logic, and TypeScript DTO types.
2. **Transport Layer (`src/services/api/*Api.ts`)**: HTTP fetch execution, session credentials, AbortSignal handling, status normalization, and ApiError translation.
3. **Application Layer (`src/features/*/application/`)**:
   - **Repository**: Data-access policy (caching, sequencing, invalidation).
   - **Mappers**: Pure transformation functions converting DTOs into ViewModels.
   - **Application Hook (`use*Flow.ts`)**: React state binding, in-flight mutation locking, and event orchestration.
4. **Presentation Layer (`src/features/*/components/`)**: Presentational views styled with Vanilla Extract (`.css.ts`), consuming ViewModels only. May own local UI state, but never data-access policy.

### 3.2 DTO $\rightarrow$ ViewModel Isolation
`[MAJARA Standard]` **Rule**: The presentation layer must consume ViewModels, never raw transport DTOs.  
`[General Recommendation]` **Why**: Decouples UI semantics from backend representation. Changes in backend database column names or ORM edge structures do not ripple into UI presentation components.

`[MAJARA Standard]` **Backend Internals Scrubbing**:
> Backend-internal fields (such as `edges: {}`, `partner_ids`, `creator_profile_id`) may be consumed by mappers when necessary to derive presentation-safe values (such as partner chips or author labels), but are never exposed in ViewModels.

---

## 4. Contracts & Runtime Validation

### 4.1 Precompiled TypeBox Validation
`[Implementation Fact]` The platform uses `@sinclair/typebox` and `@sinclair/typebox/compiler`.  
`[MAJARA Standard]` All wire contracts must define:
1. A TypeBox schema (e.g. `BackendQuestSchema`).
2. An inferred static TypeScript type (`export type BackendQuest = Static<typeof BackendQuestSchema>;`).
3. A precompiled runtime validator (`export const CBackendQuest = TypeCompiler.Compile(BackendQuestSchema);`).

### 4.2 Runtime Validation Semantics
`[General Recommendation]` **Rule**: A precompiled validator's `Check(payload)` method returns a `boolean`; it does not throw on its own. The transport layer evaluates the boolean result and explicitly raises an `ApiError` when validation fails:

```typescript
const data = await res.json();
if (!CBackendQuest.Check(data)) {
  throw new ApiError('Backend payload failed contract validation', 422, {
    code: 'CONTRACT_VALIDATION_ERROR',
    details: [...CBackendQuest.Errors(data)],
  });
}
```

### 4.3 Why TypeScript Casts Are Forbidden
`[General Recommendation]` A TypeScript cast (`const data = await res.json() as MyType`) is completely erased at compile time and provides **zero runtime validation**. If a backend service omits a field, changes an enum, or returns `null`, an unvalidated cast causes fatal runtime crashes deep in leaf UI components.

---

## 5. HTTP / Transport Architecture

### 5.1 Standardized Transport Policies
`[MAJARA Standard]` Every HTTP transport function must adhere to four invariants:
1. **Session Credentials**: Authenticated browser API requests use `credentials: 'include'` according to the application's session transport policy.
2. **Cancellation**: Transports must accept an optional `AbortSignal`. Aborted requests must propagate native `DOMException ('AbortError')` cleanly without conversion to generic errors.
3. **Zero Mock Fallbacks**: Production transport paths must never return fallback mock data upon HTTP 4xx/5xx or network failure.
4. **UI Isolation**: Presentational UI modules must not import API transport modules directly.

### 5.2 The Standardized `ApiError` Class
`[Implementation Fact]` Implemented in `src/services/api/apiError.ts`:

```typescript
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, options?: { code?: string; requestId?: string; details?: unknown });

  get isUnauthorized(): boolean { return this.status === 401; }
  get isForbidden(): boolean { return this.status === 403; }
  get isNotFound(): boolean { return this.status === 404; }
  get isNetworkOrServer(): boolean { return this.status === 0 || this.status >= 500; }
}
```

### 5.3 Status Code Handling
- **200 OK**: Validates payload via `Check()`, returns DTO.
- **201 Created**: Validates response carrying created resource and tokens (e.g. `{ booking, time_key }`).
- **204 No Content**: Confirms success and returns `void` without attempting to parse JSON.
- **401 Unauthorized**: Identifies expired session; emits `majara:auth-required` event to trigger clean auth reset.
- **403 Forbidden**: Preserves backend ReBAC permission error message verbatim.
- **500 Server Error**: Raises `ApiError` with status $\ge 500$. Never converted to mock data.

---

## 6. Application / Repository Architecture

### 6.1 When a Repository Should Exist
`[General Recommendation]` **Rule**: Introduce a Repository when the feature has meaningful data-access policy beyond simple transport invocation.

Examples of meaningful data-access policy:
- In-memory caching with TTL freshness.
- Monotonic request sequencing to prevent race conditions.
- Targeted cache invalidation across related queries.
- Multi-query aggregation (e.g. loading bounties, leaderboards, and bookings in parallel).
- Offline queue persistence and synchronization.
- Mutation lifecycle coordination.

`[General Recommendation]` For a trivial, read-only endpoint with no caching, sequencing, or aggregation needs, a repository may be unnecessary; the application hook may call transport directly.

### 6.2 In-Flight Mutation Protection
`[General Recommendation]` **Rule**: Every mutation operation must have an authoritative in-flight guard preventing duplicate concurrent execution.  
`[Implementation Fact]` In MAJARA, this is implemented via React state flags or ref guards (`isSubmittingRef.current`) inside `use*Flow` hooks, discarding redundant user clicks before network dispatch.

---

## 7. Request Sequencing Architecture

### 7.1 Supersession Race Conditions
`[General Recommendation]` Rapid user interactions (such as switching tabs, typing in search bars, or selecting items in a master-detail view) dispatch overlapping asynchronous requests. If Request 1 takes 400ms and Request 2 takes 100ms, Request 1 can arrive last and overwrite newer data with obsolete state.

### 7.2 The Monotonic `RequestSequencer` Pattern (ADR-028)
`[Implementation Fact]` Implemented in `src/features/quests/application/requestSequencer.ts`:

```typescript
export class RequestSequencer {
  private currentSequence: number = 0;
  private currentController: AbortController | null = null;

  start(): [number, AbortSignal] {
    if (this.currentController) {
      this.currentController.abort(); // Cancel in-flight network request
    }
    this.currentSequence += 1;        // Monotonically increment sequence
    this.currentController = new AbortController();
    return [this.currentSequence, this.currentController.signal];
  }

  isLatest(sequence: number): boolean {
    return sequence === this.currentSequence;
  }

  abort(): void {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
    this.currentSequence += 1;
  }
}
```

### 7.3 Independent Sequencing Channels
`[MAJARA Standard]` **Rule**: One logical supersession domain $\rightarrow$ one sequencing channel.  
`[Implementation Fact]` In `GuildRepository`, 4 independent sequencers (`listSequencer`, `detailSequencer`, `statsSequencer`, `badgesSequencer`) ensure that a slower derived stats query for Guild A never discards or aborts a fast detail response for Guild A.

---

## 8. Cache Architecture

### 8.1 In-Memory Cache Matrix
`[General Recommendation]` **Core Principle**: Cache keys encode the dimensions that materially change the server representation.

`[Implementation Fact]` Verified cache policies in current repositories:

| Domain / Resource | Cache Key Format | TTL | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| **Guilds List** | `static:list` | 60s | Any guild join/leave or creation |
| **Guild Detail** | `guildId` | 30s | Join/leave on that specific guild |
| **Guild Stats** | `guildId` | 30s | Join/leave on that specific guild |
| **Guild Badges** | `guildId` | 60s | Manual refresh only |
| **Logbook** | `${viewerContextKey}:${username}` | 30s | Profile patch, privacy patch, portfolio mutations |
| **Observatories List** | `static:list` | 60s | Manual pull-to-refresh |
| **Observatory Detail** | `obsId` | 30s | Booking creation on that observatory |
| **Season Board** | `${quarter}` | 60s | Quarter switch (category filtering is local UI state) |

### 8.2 Viewer-Scoped Cache Isolation
`[MAJARA Standard]` Because the backend dynamically filters profile data according to who the viewer is (Owner vs. Peer Member vs. Anonymous Visitor), logbooks must be cached using a composite key: `${viewerContextKey}:${username}`. This prevents Viewer B from receiving private data previously cached by Viewer A.

### 8.3 Sensitive Credential Scrubbing
`[MAJARA Standard]` Time-Key credentials and temporary authorization tokens must **never be cached**. They exist in memory only for the duration of the check-in call or within the offline queue, and are scrubbed immediately upon confirmation.

---

## 9. Mutation Architecture

### 9.1 Non-Optimistic Lifecycle
`[MAJARA Standard]` Because MAJARA manages ZAD loyalty points, ReBAC permissions, and verifiable credentials, mutations are strictly non-optimistic:

```text
[Idle] 
  │ User action (click / submit)
  ▼
[Pending] (In-flight lock enabled, UI spinner active)
  │ Dispatches request with AbortSignal
  ▼
[Backend Confirmation] (HTTP 200/201/204 received & validated)
  │
  ├─► [Committed] (State updated with authoritative response)
  │      │
  │      ▼
  │   [Invalidation] (Targeted cache entries evicted)
  │
  └─► [Failure on 4xx/5xx] (Retain previous stable baseline state, 
                            surface ApiError message to user)
```

`[General Recommendation]` In non-optimistic mutation lifecycles, failed requests do not "rollback" mutated data because client state was never optimistically modified. Instead, the previous stable state is retained, in-flight locks are released, and the error is surfaced.

---

## 10. Authentication & Authorization Architecture

### 10.1 Universal Auth Principles vs. MAJARA Implementation
`[General Recommendation]` **Universal Principles**:
- **Authentication Boundary**: Client application handles session persistence and lifecycle state; authentication gateway is external.
- **Authorization Boundary**: Client application controls UI affordances based on known state, but **never computes or replaces backend authorization**.
- **UI Affordance Gating**: UI affordance gating is allowed when based on known application state (e.g. showing an `[Edit Profile]` button when `isOwner === true`); it is an ergonomic user-interface affordance, not a security boundary, and must never replace backend authorization.

`[MAJARA Standard]` **MAJARA Implementation (Ory Kratos & Ory Keto)**:
- **AuthN (Ory Kratos)**: Browser flow with `credentials: 'include'`. Action URLs (`flow.ui.action`) rewritten to same-origin `/kratos/...` proxy. CSRF tokens extracted from `ui.nodes`. HTTP 410 (`self_service_flow_expired`) auto-refreshes flow and retries once.
- **AuthZ (Ory Keto ReBAC)**: Backend evaluates relation tuples (`check(subject, relation, namespace, object)`). Zero client-side `isAdmin` flags. On HTTP 403 Forbidden, the backend error message is surfaced verbatim.

---

## 11. Privacy & Security Model

### 11.1 The Backend-Authoritative Projection Pattern
`[General Recommendation]` **Pattern**: The backend determines data visibility according to its internal security and privacy rules. The frontend interprets the resulting projection without attempting to reconstruct or evaluate the underlying privacy rules client-side.

### 11.2 Tri-State Section Visibility
`[Implementation Fact]` Implemented in `src/contracts/logbook.ts`:

```typescript
export interface SectionCollection<T> {
  status: 'visible' | 'hidden';
  items: T[];
}
```

This differentiates three essential states:
1. **Visible & Populated**: Section permitted to viewer; contains entries (`status: 'visible'`, `items.length > 0`).
2. **Visible & Empty**: Section permitted to viewer; user has not added entries (`status: 'visible'`, `items.length === 0`).
3. **Hidden / Omitted**: Section omitted by backend privacy filter (`status: 'hidden'`, `items: []`).

### 11.3 Opaque Time-Key Credentials
`[MAJARA Standard]` The Time-Key is an opaque backend-issued credential used for physical observatory access. The frontend does not decode, inspect, or interpret the credential; it treats the Time-Key as opaque and forwards it verbatim to the check-in endpoint or local offline queue.

---

## 12. Domain Feature Implementations & Maturity Assessment

`[MAJARA Standard]` Every major feature subsystem declares its authoritative maturity state:

| Feature Subsystem | Maturity Status | Evidence in Active Codebase |
| :--- | :--- | :--- |
| **Quests / Academy** | **Implemented & Stable** | Full 4-layer implementation: contracts (`catalog.ts`), transport (`questApi.ts`), repo (`questRepository.ts`), hook (`useQuestFlow.ts`), UI (`QuestsPage.tsx`). Soft 2-block sorting, quiz auto-grading, upload evidence validation. |
| **Observatories / Compass** | **Implemented & Stable** | Full 4-layer implementation: contracts (`observatories.ts`), transport (`observatoryApi.ts`), repo (`observatoryRepository.ts`), offline queue (`offlineQueue.ts`), UI (`CompassPage.tsx`). Fixed cardinal geography (ADR-018), offline Time-Key queue (ADR-019). |
| **Guilds / Squads** | **Implemented & Stable** | Full 4-layer implementation: contracts (`guilds.ts`, `squads.ts`), transports (`guildApi.ts`, `squadApi.ts`), repos (`guildRepository.ts`, `squadRepository.ts`), UI (`SquadsGuildsPage.tsx`). Rank progression ladder, non-optimistic join/leave, squad muster. |
| **Logbook / Profile** | **Implemented & Stable** | Full 4-layer implementation: contracts (`logbook.ts`), transport (`logbookApi.ts`), repo (`logbookRepository.ts`), hook (`useLogbookFlow.ts`), UI (`ProfilePage.tsx`). Portfolio CRUD, privacy patch, display mode, viewer-scoped cache. |
| **Bounties / Horizon** | **Implemented & Stable** | Full 4-layer implementation: contracts (`seasonBoard.ts`), transport (`seasonBoardApi.ts`), repo (`bountyRepository.ts`), hook (`useBountiesFlow.ts`), UI (`BountiesPage.tsx`). Dual currency (ZAD int64 vs ATHAR int), season board podium/chase. |
| **Discover / Canvas** | **Implemented / Evolving** | Implemented views (`DiscoverPage.tsx`, `DiscoverTabBar.tsx`), repo (`discoverRepository.ts`), and tests. Uses Hybrid Extensible Anchor pattern (`discover.tabs`). Marked evolving due to open test assertions in followings view. |
| **Spatial Map** | **Implemented / Evolving** | Interactive vector map canvas (`src/features/map/MapPage.tsx`). |
| **Events** | **Prototype / Stub** | Standalone modal prototype (`src/features/events/EventDetailModal.tsx`). Full ticket/application flows planned. |

---

## 13. Shared Capabilities & Package Promotion

### 13.1 The Package Promotion Rule
`[MAJARA Standard]` **Rule**: Promote code to `packages/` only when there is a genuine independent boundary or multiple real consumers—never simply because something "might be reusable."

### 13.2 Forbidden Feature-to-Feature Coupling
`[MAJARA Standard]` **Rule**: Direct internal imports between features (`src/features/A ─X→ src/features/B`) are strictly forbidden. Common logic must be promoted to a shared domain package (`@majara/domain`), platform primitive (`@platform/*`), or shared contracts module.

---

## 14. Plugin & Extensibility Architecture

### 14.1 Trust Tier Model (T0, T1, T2)
`[MAJARA Standard]`
- **T0 Core Host**: Host application shell (`src/`).
- **T1 Trusted**: Certified in-process React plugins (`T1_TRUSTED`, e.g. `official.star-forge`).
- **T2 Sandboxed**: Untrusted community extensions running in isolated iframes/workers with JSON-RPC messaging (`T2_SANDBOXED`).

### 14.2 Implemented Platform Packages
`[Implementation Fact]`
- `@platform/plugin-contracts`: TypeBox schemas for manifests, capabilities, packs, and bundles.
- `@platform/plugin-sdk`: `definePlugin()` helper, capability checking, typed slot declarations.
- `@platform/plugin-runtime`: `PluginRuntimeManager`, T1 trusted host loader, lifecycle management.
- `@platform/layout-engine`: `SlotRegistry`, `<Slot />`, and `<PluginErrorBoundary />`.
- `@platform/bundle-engine`: Resolves `Bundle -> Pack -> Plugin` manifests.

### 14.3 Implemented Facts vs. Planned Stubs
- `[Implementation Fact]` **IMPLEMENTED**:
  - T1 in-process React execution with slot mounting.
  - Priority-based slot contribution sorting (`priority` descending).
  - Crash isolation via `<PluginErrorBoundary />`.
  - Dynamic plugin load/unload and clean lifecycle disposal (`dispose()`).
  - Theme token cascade hydration.
- `[Planned]` **PLANNED / PROTOTYPE STUBS**:
  - T2 Sandboxed iframe execution (`StubPluginSandboxRuntime` is currently a prototype placeholder).
  - Cryptographic PKI verification (`MockPluginVerifier` currently simulates Ed25519 signatures without live x509 CRL checks).
  - Web Worker sandboxing and runtime watchdog timeouts.

---

## 15. Layout & Slot Architecture

### 15.1 The Hybrid Extensible Anchor Pattern
`[MAJARA Standard]` The platform resolves the tension between pixel-perfect Figma designs and open-ended plugin extensibility via the **Hybrid Extensible Anchor Pattern**:

$$\text{Hybrid Extensible Anchor} = \text{Core-Owned Structural Anchor} + \text{Plugin-Owned Optional Contributions}$$

```text
                     Discover Surface
                            │
                   ┌────────┴────────┐
                   │                 │
              Core Anchor      Plugin Registry
                   │                 │
            ┌──────┼──────┐     ┌────┴────────────────────────┐
            │      │      │     │                             │
           Feed  Topics Following official.star-forge.workbench official.synapse.radar
```

### 15.2 Structural Invariants
1. **Core Owns Layout & State**: The Core App renders the tab bar container, layout frames, accessibility attributes (`role="tab"`, `aria-selected`), and handles URL query synchronization (`?tab=...`).
2. **Plugins Contribute Descriptors**: Plugins contribute metadata descriptors (`tabId`, `label`, `priority`) and content components, but never render the enclosing navigation frame.
3. **Automatic Fallback on Unload**: If a plugin tab is active and the plugin or bundle is unloaded, the host immediately falls back to the baseline default tab (`feed`).

---

## 16. Design System & Theme Engine

### 16.1 Vanilla Extract Zero-Runtime Architecture
`[MAJARA Standard]`
- **Zero Runtime CSS-in-JS**: All styles compile at build time using `@vanilla-extract/css`.
- **Zero TailwindCSS**: Tailwind is completely excluded from the codebase.
- **Semantic Theme Contract**: `vars` (`src/styles/theme.css.ts`) establishes typed CSS custom properties.

### 16.2 The 4-Layer Theme Cascade
`[Implementation Fact]` Implemented in `@platform/theme-engine/src/cascade.ts`:

```text
Layer 0: Platform Base (Default Deep Space Navy #0B0F13, Gold #E6A23C)
   │
   ▼
Layer 1: Tenant Configuration (University / Observatory Brand)
   │
   ▼
Layer 2: Context Lens (Nomad Workspace Mode)
   │
   ▼
Layer 3: Star / Guild Modifiers (Forge Terracotta #C2410C, Synapse Cyan #06B6D4)
```

### 16.3 Whitelisted Override Filtering
`[MAJARA Standard]` To prevent malicious or visually destructive plugins from altering layout structure, `@platform/design-tokens` enforces a strict token override whitelist (`filterWhitelistedThemeOverrides`). Only approved accent, glow, and border highlight tokens can be overridden. Structural dimensions, fonts, and baseline background tokens cannot be modified.

---

## 17. Error Architecture

### 17.1 Normalized Error Model
`[Implementation Fact]` Every operational failure is parsed into `ApiError` with HTTP status, machine-readable code, and backend message.

### 17.2 The 500 Mock Fallback Invariant
`[MAJARA Standard]` **Rule**: HTTP 500 server errors, 401 unauthenticated errors, and 403 gate refusals must **never be silently converted into fake mock success**. A failed network request must surface an authentic error state or trigger auth recovery.

---

## 18. Testing Architecture

### 18.1 Test Infrastructure
`[Implementation Fact]`
- **Harness**: Native Node.js test runner (`node:test`) + strict assertions (`node:assert/strict`) executed via `tsx` (`scripts/test.mjs`).
- **Speed & Isolation**: All 21 test suites execute in ~13 seconds with zero external network or database dependencies.

### 18.2 Workspace Test Suite Inventory

| Suite | Category | Verifications |
| :--- | :--- | :--- |
| `tests/boundaries.test.ts` | Mechanical CI Gate | The 5 architectural import boundary rules |
| `tests/platform-proof-gate.test.ts` | Platform Proof | 7-point extensibility and lifecycle criteria |
| `tests/quests-flow-integration.test.ts`| Flow Integration | Quests, attempts, uploads, monotonic sequencing |
| `tests/observatories-flow.test.ts` | Flow Integration | Observatories, booking, Time-Key, offline queue |
| `tests/guilds-squads-flow.test.ts` | Flow Integration | Guilds, ranks, non-optimistic join, squad muster |
| `tests/logbook-profile-flow.test.ts` | Flow Integration | Logbook, privacy tri-state, viewer cache scoping |
| `tests/bounties-horizon-flow.test.ts`| Flow Integration | Horizon bounties, dual currency, season board |
| `tests/discover-*.test.ts` | Presentation & Tabs | Discover cards, Frame 99 tabs, topics/followings |
| `packages/*/tests/*.test.ts` | Unit Tests | Primitives across all 9 platform packages |
| `plugins/official/*/tests/*.test.ts` | Plugin Unit Tests | Manifests, slots, and theme overrides |

---

## 19. Mechanical Architecture Enforcement

### 19.1 The 5 Boundary Rules (`tests/boundaries.test.ts`)
`[MAJARA Standard]` Mechanically verified by the repository test/CI pipeline (`pnpm test`):

```text
Rule 1: @platform/*  ─X→  @majara/*
        Platform packages must remain completely unaware of domain concepts.

Rule 2: @platform/*  ─X→  src/features/* / apps/*
        Platform packages must never import application features or shell internals.

Rule 3: plugins/*     ─X→  apps/*
        Plugins must never import host shell composition roots or bootstrapping.

Rule 4: plugins/*     ─X→  src/features/*
        Plugins must never import internal application feature components.

Rule 5: Presentational UI  ─X→  API Transport
        Presentational UI modules must never import API transport functions.
```

### 19.2 Static Analysis Implementation
`[Implementation Fact]` Enforced by **static import-specifier text analysis using regex/pattern matching** across TypeScript source files in `packages/`, `plugins/`, and `src/components/` (inspecting `import ... from '...'`, `export ... from '...'`, and dynamic `import('...')`). Any violation immediately fails `pnpm test` with file and line diagnostics.

---

## 20. Performance Architecture

### 20.1 Explicit Performance Budgets (`scripts/check-bundle-size.mjs`)
`[MAJARA Standard]` Release gates enforced against production assets in `dist/assets/`:

| Asset Category | Target Budget (gzip) | Warning Threshold | Hard CI Failure |
| :--- | :--- | :--- | :--- |
| **Initial Core JS** | $< 180\text{ kB}$ | $\ge 200\text{ kB}$ | $> 250\text{ kB}$ |
| **Initial Core CSS** | $< 25\text{ kB}$ | $\ge 35\text{ kB}$ | $> 50\text{ kB}$ |
| **Route Chunk JS** | $< 50\text{ kB}$ | $\ge 70\text{ kB}$ | $> 90\text{ kB}$ |
| **Route Chunk CSS** | $< 15\text{ kB}$ | $\ge 20\text{ kB}$ | $> 30\text{ kB}$ |

`[General Recommendation]` These thresholds are project-specific release budgets. Future projects should establish their own budgets based on target devices, network conditions, and product requirements.

### 20.2 Route-Level Code Splitting
`[Implementation Fact]` All major views load lazily in `src/App.tsx` via `React.lazy` and `React.Suspense` with an explicit fallback (`RouteLoadingFallback`): `DiscoverPage`, `CompassPage`, `MapPage`, `QuestsPage`, `BountiesPage`, `SquadsGuildsPage`, `ProfilePage`.

---

## 21. CI & Release Gates

### 21.1 Local Verification vs. CI Release Verification
`[General Recommendation]` Distinguish local development checks from CI release pipelines:

- **Local Developer Verification**:
  ```bash
  pnpm run typecheck    # Fast local TypeScript compiler check
  pnpm test             # Fast execution of all 21 test suites (<15s)
  ```
- **CI Release Verification (`.github/workflows/ci.yml`)**:
  1. Checkout Repository
  2. Setup pnpm (v9)
  3. Setup Node.js (v20, cached)
  4. Frozen Lockfile Install (`pnpm install --frozen-lockfile`)
  5. Repository Hygiene Gate (verifies zero tracked `dist`, `node_modules`, `scratch`)
  6. Strict Typecheck Gate (`pnpm run typecheck`)
  7. Test Suites & Boundary Gate (`pnpm test`)
  8. Production Vite Bundle Build (`pnpm run build`)
  9. Platform Performance & Bundle Size Gate (`pnpm run check:size`)

---

## 22. File Ownership Rules

`[MAJARA Standard]` Practical placement guide:

| Requirement / Code Type | Exact Target Location |
| :--- | :--- |
| **OpenAPI Network DTO Schema** | `src/contracts/<domain>.ts` |
| **Precompiled TypeBox Validator** | `src/contracts/<domain>.ts` (`C<Entity> = TypeCompiler.Compile(...)`) |
| **HTTP Transport Function** | `src/services/api/<domain>Api.ts` |
| **DTO $\rightarrow$ ViewModel Mapper** | `src/features/<feature>/application/<feature>Mappers.ts` |
| **In-Memory Cache & Sequencing** | `src/features/<feature>/application/<feature>Repository.ts` |
| **React View State & In-Flight Lock** | `src/features/<feature>/application/use<Feature>Flow.ts` |
| **Presentational Feature View** | `src/features/<feature>/components/<Component>.tsx` |
| **Feature Vanilla Extract Styles** | `src/features/<feature>/components/<Component>.css.ts` |
| **Global Theme Contracts** | `src/styles/theme.css.ts` |
| **App Composition Root & Shell** | `src/App.tsx`, `src/components/AppLayout.tsx` |
| **Dynamic Plugin Manifest & Views** | `plugins/official/<name>/src/index.ts` |
| **Platform Primitive Package** | `packages/<primitive-name>/src/` |

---

## 23. Forbidden Patterns / Anti-Patterns

`[MAJARA Standard]` Non-negotiable guardrails:

### Anti-Pattern 1: Direct Transport Calls from UI Components
- **Why Bad**: Couples presentation to network transport, prevents caching, breaks request sequencing, and prevents unit testing.
- **Correct Pattern**: Components invoke callbacks exposed by `use*Flow` hooks, which delegate to Repositories.

### Anti-Pattern 2: Raw DTO Leakage into ViewModels
- **Why Bad**: Exposes internal ORM structures (`edges: {}`) and database nullability quirks to the UI.
- **Correct Pattern**: Mappers transform DTOs into clean ViewModels before data reaches React.

### Anti-Pattern 3: TypeScript Cast as Runtime Validation
- **Why Bad**: `as Type` generates zero JavaScript code. Corrupted backend JSON causes uncaught runtime exceptions in UI components.
- **Correct Pattern**: Compile schemas with `TypeCompiler.Compile()` and assert with `Check()`.

### Anti-Pattern 4: Hardcoded Business Facts or Domain Currencies
- **Why Bad**: Frontend invents prices, reward currencies (e.g. hardcoding Algerian Dinar DZD instead of authentic ZAD/ATHAR), or partner attributions.
- **Correct Pattern**: All tokenomics and partner attributes are backend-derived.

### Anti-Pattern 5: Invented Backend Endpoints
- **Why Bad**: Writing fetch calls to endpoints not present in the OpenAPI specification.
- **Correct Pattern**: Verify every endpoint against `openapi.yaml` before implementation.

### Anti-Pattern 6: Feature-to-Feature Internal Coupling
- **Why Bad**: Creates tangled horizontal dependencies between feature folders.
- **Correct Pattern**: Common logic promotes to `@majara/domain` or shared contract modules.

### Anti-Pattern 7: Optimistic Fake Success for Token/Permission Mutations
- **Why Bad**: ZAD energy and Keto ReBAC permissions are strictly authoritative on the backend. Optimistic commits cause confusing visual rollbacks.
- **Correct Pattern**: Non-optimistic progression: `idle -> pending -> confirmed -> committed`.

### Anti-Pattern 8: Mock Fallback Masking 500 / 401 Failures
- **Why Bad**: Masks fatal outages and broken sessions by displaying stale fake data.
- **Correct Pattern**: Propagate `ApiError` and display authentic error messages or trigger login recovery.

---

## 24. How to Implement a New Feature

`[General Recommendation]` Follow this repeatable 9-step workflow:

```text
Step 1: Inspect Backend OpenAPI Spec
        Identify endpoints, status codes, and schemas in majara-backend/api/openapi.yaml.
        │
Step 2: Define TypeBox Contract
        Create src/contracts/<feature>.ts with TypeBox schemas, export DTO types and C<Entity> compiled validators.
        │
Step 3: Implement Pure HTTP Transport
        Create src/services/api/<feature>Api.ts with fetch, credentials: 'include', AbortSignal, and ApiError parsing.
        │
Step 4: Create Pure Mappers
        Create src/features/<feature>/application/<feature>Mappers.ts to transform DTOs into ViewModels, stripping edges.
        │
Step 5: Create Repository (if needed)
        Create src/features/<feature>/application/<feature>Repository.ts with DI transport, in-memory cache, TTL, and RequestSequencer.
        │
Step 6: Build Orchestration Hook
        Create src/features/<feature>/application/use<Feature>Flow.ts managing viewState, in-flight locking, and actions.
        │
Step 7: Build Presentational UI
        Create src/features/<feature>/components/ using Vanilla Extract (.css.ts). Consume ViewModels only.
        │
Step 8: Write Comprehensive Tests
        Add integration tests in tests/<feature>-flow.test.ts verifying validation, mapping, caching, and error handling.
        │
Step 9: Validate Boundary & Performance Gates
        Run pnpm check:boundaries and pnpm check:size to guarantee architectural compliance.
```

---

## 25. Architectural Decision Rules

`[General Recommendation]` Reference guide for technical decisions:

1. **When does code become a shared package?** Only when there are multiple independent consumers or an isolated boundary (e.g. pure domain algorithms with zero DOM dependencies). Never extract speculatively.
2. **When should a Repository exist?** Whenever a feature manages cached read queries, requires request sequencing across navigation, or coordinates multi-step mutation invalidation.
3. **When should a `RequestSequencer` be used?** When multiple in-flight operations can race and only a particular generation/result remains authoritative.
4. **When is optimistic UI acceptable?** Only on purely local, non-authoritative client toggles (e.g. collapsing the sidebar or toggling local tab filters). Never on ledger movements, rank upgrades, or check-ins.
5. **When is fallback mock data permitted?** Only during initial offline design prototyping before API endpoints exist. Once an endpoint is specced, mock fallbacks must be removed.

---

## 26. Source of Truth & Evidence Index

`[Implementation Fact]` Primary file references for all architectural statements:

| Architectural Fact | Primary Source File | Exact Symbol / Line Reference |
| :--- | :--- | :--- |
| **Workspace Topology** | `pnpm-workspace.yaml` | Lines 1–7 (`packages: ['apps/*', 'packages/*', 'plugins/*']`) |
| **Mechanical Boundary Gates** | `tests/boundaries.test.ts` | Lines 63–213 (Rules 1, 2, 3, 4, 5 test definitions) |
| **Gzip Performance Budgets** | `scripts/check-bundle-size.mjs` | Lines 15–36 (`BUDGETS` constant) |
| **CI Release Pipeline** | `.github/workflows/ci.yml` | Lines 18–58 (Steps 1–9) |
| **Theme Contract Formalization**| `src/styles/theme.css.ts` | Lines 8–58 (`vars = createThemeContract(...)`) |
| **Multi-Layer Cascade Engine**| `packages/theme-engine/src/cascade.ts` | Lines 22–45 (`resolveEffectiveTheme(...)`) |
| **Slot Crash Isolation** | `packages/layout-engine/src/PluginErrorBoundary.tsx` | Lines 15–99 (`class PluginErrorBoundary`) |
| **Hybrid Extensible Anchor** | `packages/domain/src/slots.ts` | Lines 69–96 (`resolveValidatedDiscoverTabId(...)`) |
| **Monotonic Sequencer** | `src/features/quests/application/requestSequencer.ts` | Lines 9–51 (`class RequestSequencer`) |
| **Standardized ApiError** | `src/services/api/apiError.ts` | Lines 6–41 (`class ApiError`) |
| **Offline Check-in Queue** | `src/features/observatories/application/offlineQueue.ts` | Lines 24–193 (`class OfflineCheckinQueueManager`) |
| **Tri-State Privacy Model** | `src/contracts/logbook.ts` | Lines 224–227 (`interface SectionCollection<T>`) |
| **Viewer-Scoped Caching** | `src/features/profile/application/logbookRepository.ts` | Lines 50–52 (`makeCacheKey = ${viewerContextKey}:${username}`) |
| **Targeted Cache Invalidation**| `src/features/guilds/application/guildRepository.ts` | Lines 168–172 (`invalidateGuild(...)`) |
| **Non-Optimistic Mutations** | `tests/guilds-squads-flow.test.ts` | Lines 179–220 (`Test 9: Join Mutation State Progression`) |
| **Ory Kratos CSRF Action Rewrite**| `src/services/kratosAuth.ts` | Lines 185–192 (action URL pathname rewriting) |
