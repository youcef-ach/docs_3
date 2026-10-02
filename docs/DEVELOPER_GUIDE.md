# MAJARA Developer Architecture Guide & Feature Reference Manual

This document is the **authoritative operational manual** for building new features, routes, and pages across the MAJARA Frontend Platform.

It translates the architectural invariants, contracts, and mechanical gates established across **Milestones 1–15** into a concrete, repeatable blueprint.

> **Core Axiom**: When building a new feature in MAJARA, do not guess file structures, invent endpoints, or copy legacy patterns. Follow the 10-step pipeline below.

---

## 1. The 10-Step Feature Blueprint

Every new backend-backed page or feature in MAJARA follows this exact 10-step progression:

```text
Step 1: Backend Grounding & Contract Discovery
    ↓
Step 2: TypeBox Contract & JIT Validation
    ↓
Step 3: Granular HTTP Domain Transport
    ↓
Step 4: Application State & Flow Orchestrator
    ↓
Step 5: Pure View-Model Mappers (when needed)
    ↓
Step 6: Canonical URL Routing & Deep-Linking (M11)
    ↓
Step 7: Presentation Component & Lazy Loading
    ↓
Step 8: Zero-Runtime Vanilla Extract Styling
    ↓
Step 9: Automated Test Matrix (5-Layer Testing)
    ↓
Step 10: Mechanical CI Hard Gates
```

### Quick-Reference File Checklist

| Layer | File Path | Primary Responsibility |
|---|---|---|
| **Contract** | `src/contracts/<domain>.ts` | TypeBox schemas, JIT validators (`C...`), static TypeScript types |
| **Transport** | `src/services/api/<domain>Api.ts` | Granular HTTP methods, status checks, `parseApiError`, `AbortSignal` |
| **Orchestration** | `src/features/<feature>/application/use<Feature>Flow.ts` | State machines/hooks, request sequencing, concurrency, partial failure |
| **Mapper** *(opt)* | `src/features/<feature>/application/<feature>Mappers.ts` | Pure DTO $\rightarrow$ ViewModel transformations, formatting, accent fallbacks |
| **Styling** | `src/features/<feature>/<feature>.css.ts` | Scoped Vanilla Extract styles, `vars` tokens, scoped `createVar()` |
| **Presentation** | `src/features/<feature>/<Feature>Page.tsx` | Pure presentational React component, zero transport imports |
| **Routing** | `src/contracts/routes.ts` & `src/services/router/routeParser.ts` | Route enum, `CANONICAL_APP_ROUTES`, `RouteMatch` union, URL serializer/deserializer |
| **World Registry** | `src/contracts/worldRegistry.ts` | World identity, route ownership, navigation metadata, button IDs |
| **Composition** | `src/composition/pageComponents.ts` | `PAGE_COMPONENTS` route-to-component mapping, lazy chunk factories |
| **Integration** | `src/App.tsx` | Route guard / gate, `PAGE_COMPONENTS` rendering, AppLayout wiring |
| **Tests** | `tests/<feature>-flow.test.ts`, `tests/worlds.test.ts` | 5-layer integration test suite + world architecture gates (`node:test`) |

---

## Step-by-Step Implementation Guide

### Step 1: Backend Grounding & Contract Discovery

Before writing any frontend code, verify the backend contract against authoritative sources:

1. Inspect `majara-backend/api/openapi.yaml` and live `/docs`.
2. Inspect Go handlers in `majara-backend/internal/httpapi/handlers/*.go` and bounded context models in `majara-backend/internal/modules/*`.
3. **OpenAPI Gap Invariant**: If an endpoint or schema exists in Go handlers but is missing or incomplete in `openapi.yaml`, **do not invent or assume**. Ground your types in the Go structs and explicitly document the OpenAPI gap in your contract file header (see [`src/contracts/onboarding.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/contracts/onboarding.ts#L4-L15) as the canonical example).
4. **Domain Rules Invariant**:
   - **Soft 2-Block Star Sort**: Requests append `?active_star=<id>`. Backend returns `block: 0` (prioritized) and `block: 1` (deprioritized). Never filter out `block: 1` items.
   - **Dual Currency**: ZAD is `int64` (energy/spending); ATHAR is `int` (status/reputation). Never model ZAD as a float.
   - **Keto ReBAC**: Zero client-side role guessing. Access is backend-authorized. On 403, render backend error verbatim.
   - **Callsign vs Identity**: Callsign is `traits.username?.trim() || null`. Email is a private identity attribute. Kratos ID is an internal subject UUID. Never promote email or UUID to callsign.

---

### Step 2: TypeBox Contract Compilation

Place in `src/contracts/<domain>.ts`.

- **Invariant**: Use TypeBox (`@sinclair/typebox`). **No Zod on the hot path.**
- **Invariant**: Precompile all runtime validators using `TypeCompiler.Compile(...)`.
- **Invariant**: Pure contracts only—zero DOM or React dependencies. Safe for future SSR.

```typescript
import { Type, Static } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

export const EquipmentItemSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  category: Type.String(),
  hourly_zad: Type.Integer({ minimum: 0 }),
  is_operational: Type.Boolean(),
});

export type EquipmentItem = Static<typeof EquipmentItemSchema>;
export const CEquipmentItem = TypeCompiler.Compile(EquipmentItemSchema);
export const CEquipmentItemList = TypeCompiler.Compile(Type.Array(EquipmentItemSchema));
```

---

### Step 3: Granular HTTP Domain Transport

Place in `src/services/api/<domain>Api.ts`.

- **Rule 6 Boundary Invariant**: Network calls MUST use granular domain transports (`discoverApi.ts`, `questApi.ts`, `onboardingApi.ts`). Monolithic transport clients (`apiClient.ts` or imports matching `*apiClient*`) are forbidden by mechanical CI AST gates.
- **Invariant**: Every transport function must accept an optional `signal?: AbortSignal` and re-throw `DOMException` with `name === 'AbortError'`.
- **Invariant**: All authenticated requests MUST set `credentials: 'include'` and `Accept: 'application/json'`.
- **Invariant**: Non-OK responses must be parsed via `parseApiError(res)` returning a standardized `ApiError`.
- **No Overloaded Nulls**: Distinguish `404 Not Found`, empty collections `[]`, and unauthenticated errors. Never return `null` to swallow transport failures.
- **Pre-Validation**: Validate client-side invariants (e.g. 1–4 stars) before dispatching requests, throwing `ApiError(..., 400, { code: 'CLIENT_VALIDATION_ERROR' })`.

```typescript
import { EquipmentItem, CEquipmentItemList } from '../../contracts/equipment';
import { parseApiError, ApiError } from './apiError';

const API_BASE = '/api';

export async function fetchEquipmentList(
  observatoryId: string,
  signal?: AbortSignal
): Promise<EquipmentItem[]> {
  const url = `${API_BASE}/v1/observatories/${encodeURIComponent(observatoryId)}/equipment`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network connection failed',
      0,
      { details: err }
    );
  }

  if (!res.ok) {
    throw await parseApiError(res);
  }

  const data = await res.json();
  if (!CEquipmentItemList.Check(data)) {
    throw new ApiError('Equipment payload failed contract validation', 422, {
      code: 'CONTRACT_VALIDATION_ERROR',
      details: [...CEquipmentItemList.Errors(data)],
    });
  }

  return data;
}
```

---

### Step 4: Application State & Flow Orchestrator

Place in `src/features/<feature>/application/use<Feature>Flow.ts`.

- **Separation Invariant**: Application logic, request sequencing, and mutations belong in hooks/machines, NEVER in presentational UI components.
- **Monotonic Request Sequencing (ADR-028)**: For search/filters/pagination, use `RequestSequencer` so newer requests always supersede slower in-flight responses.
- **Non-Atomic Persistence & Concurrency (M15)**:
  - When persisting multi-step operations (e.g. preferences $\rightarrow$ follows $\rightarrow$ completion), model each phase explicitly.
  - For batch operations without a backend transaction endpoint, use bounded concurrency (`runWithConcurrency`, max 3 concurrent) to prevent overwhelming the host.
  - Handle idempotency (200/201) and support selective retries of failed items without duplicating successes.
- **Fail-Closed Gate Semantics**: Application gates (e.g. onboarding, maintenance) must fail closed. Network errors or schema rejections must NEVER be treated as successful completion.
- **Authentication Delegation**: 401 errors must dispatch `window.dispatchEvent(new CustomEvent('majara:auth-required'))` or propagate to the auth machine.

---

### Step 5: Pure View-Model Mappers (When Needed)

Place in `src/features/<feature>/application/<feature>Mappers.ts`.

- **When to Create**: Create mappers when backend DTOs need transformation for presentation (e.g., date formatting, rank badges, localized strings, star accent resolution).
- **When NOT to Create**: If backend DTO properties map 1:1 to UI without transformation, consume the DTO directly. Do not build speculative mapper layers.
- **Star Accent Presentation Boundary**:
  - `Star.accent_color` is runtime backend domain data.
  - Resolve accents using `@majara/domain` palette fallback if null/unmapped.
  - Accent colors are strictly local card-level presentation data—**never inject them into the global design-system theme contract (`vars`)**.

---

### Step 6: Canonical URL Routing, Deep-Linking & World Registration (M11 & M17)

When adding a new route, update the following four locations:
1. `src/contracts/routes.ts`: Add route to `CANONICAL_APP_ROUTES` and update `RouteMatch` union.
2. `src/services/router/routeParser.ts`: Update `parseUrlToRoute()` and `serializeRouteToUrl()`.
3. `src/contracts/worldRegistry.ts`: Register the route under its owning world in `WORLD_REGISTRY`, defining `route`, `label`, `order`, and `buttonId`.
4. `src/composition/pageComponents.ts`: Register the lazy component chunk in `PAGE_COMPONENTS`.

- **Canonical URL Invariant**:
  - Path parameters for resource identity: `/bounties/:id`, `/map/:starId`.
  - Query parameters for transient view state: `/discover?tab=guilds`.
  - Exactly one canonical representation per resource.
  - Unknown routes are modeled explicitly as `{ kind: 'not-found', pathname }`, never silently defaulted to home.
- **Two Distinct Authorities (M17)**:
  - `WORLD_REGISTRY` owns "where does this route belong?" (world identity, route ownership, navigation metadata).
  - `PAGE_COMPONENTS` owns "what React component renders this route?".
  - Invariant tested mechanically: `keys(PAGE_COMPONENTS) === getAllRegisteredRoutes()`.
- **Deep-Link Gate Preservation (M11 & M15)**:
  - When an un-onboarded or challenged user navigates to a deep link (e.g. `/map/star-forge-01`), the gate intercepts but **preserves the matched `RouteMatch`**.
  - Upon gate clearance, the app navigates directly to the preserved target (falling back to `home` only if `not-found`).

---

### Step 7: Presentation Components

Place in `src/features/<feature>/<Feature>Page.tsx`.

- **Boundary Invariant (Rule 5)**: Presentational components MUST NOT import API transport directly. All data and actions must be provided via application hooks or props.
- **Tauri Mobile & WebView Performance (§7)**:
  - Maintain shallow DOM depth.
  - Animations on hot paths MUST animate compositor-only properties (`transform`, `opacity`). Layout reflow thrashing (`width`, `height`, `top`, `left`, `margin`) is forbidden.
  - Scrollable collections exceeding 50 items must use virtualization.
- **Code-Splitting Invariant**: All feature pages must be lazy-loaded in `src/App.tsx` via `React.lazy()` with `<RouteLoadingFallback />`.

---

### Step 8: Zero-Runtime Vanilla Extract Styling

Place in `src/features/<feature>/<feature>.css.ts`.

- **Styling Invariants**:
  - **Zero TailwindCSS. Zero raw CSS strings.**
  - All styling belongs in `.css.ts` Vanilla Extract modules.
  - Reference typed design tokens via `import { vars } from '../../styles/theme.css'`.
  - **Zero `terminal.css.ts` imports**: The transitional facade `terminal.css.ts` is `@deprecated` and ratcheted in CI. New features must never import from it.
- **Dynamic Domain Data Styling**:
  - To style elements with runtime domain data (e.g. `star.accent_color`), declare a scoped CSS variable via `createVar()` in `<feature>.css.ts`.
  - Assign the variable inline in JSX: `style={{ [starAccentVar]: star.accent_color || '#38BDF8' } as React.CSSProperties}`.
  - Explicitly document that this inline style is for **runtime backend domain data**, not design tokens.

---

### Step 9: Automated Test Matrix (5-Layer Testing)

Place in `tests/<feature>-flow.test.ts`.

Every feature must implement comprehensive tests across 5 layers:

```text
Layer 1: Contract Validation  → Authentic payload passes; malformed payloads rejected.
Layer 2: Pure Mappers         → Correct ViewModel mapping, formatting, and fallbacks.
Layer 3: Pure Transport       → 200/201/204 success, 401/403/5xx errors, AbortError re-throw.
Layer 4: State Orchestration  → Concurrency bounds, request sequencing, partial-failure retry.
Layer 5: Route & Gate         → Fail-closed behavior, preserved RouteMatch, URL mapping.
```

- Tests use native Node.js test runner: `import { test, describe } from 'node:test'`.
- Mock `globalThis.fetch` inside tests and restore `originalFetch` in `finally` blocks.
- On abort tests, ensure the mock fetch rejects on `signal.aborted` with `new DOMException('The user aborted a request.', 'AbortError')`.

---

### Step 10: Mechanical CI Hard Gates

Before committing any feature, run and pass all 5 platform gates:

```bash
# 1. Typecheck (0 TypeScript errors)
pnpm typecheck

# 2. Architectural Boundary Gates (all 6 rules must pass)
pnpm check:boundaries

# 3. Full Test Suite (all test suites must pass)
pnpm test

# 4. Production Bundle Build
pnpm build

# 5. Performance Size Budget Gate
pnpm check:size
```

#### Explicit Performance Budgets (docs/PERFORMANCE.md)
- **Core Initial JS**: $\le 180.00\text{ kB}$ gzip (measured at `dist/assets/index-*.js`).
- **Route JS Chunks**: $\le 50.00\text{ kB}$ gzip per route.
- **Route CSS Chunks**: $\le 15.00\text{ kB}$ gzip per route.

---

## 2. Canonical Reference Implementation: Milestone 15

Milestone 15 (**First-Run Onboarding & Star Preference Sync**) is the repository's **canonical example of a new backend-backed feature**. Use it as the primary code reference when developing new pages:

```text
src/contracts/onboarding.ts                      ← TypeBox contract with OpenAPI gap documentation
src/services/api/onboardingApi.ts                ← Pure transport with invariant pre-validation & AbortError
src/features/onboarding/application/useOnboardingFlow.ts ← 3-phase persistence, bounded concurrency, retry
src/features/onboarding/application/useOnboardingGate.ts ← Fail-closed gate, M11 RouteMatch preservation
src/features/onboarding/onboarding.css.ts        ← Vanilla Extract with scoped starAccentVar
src/features/onboarding/OnboardingPage.tsx       ← 3-step wizard UI, shallow DOM, compositor animations
src/App.tsx                                      ← Gate mount, React.lazy chunk, RouteMatch navigation
tests/onboarding-flow.test.ts                    ← 20 tests covering all 5 architectural layers
```

---

## 3. Pattern Catalog & Milestone Precedents

| Architectural Concern | Reference Implementation | Milestone Precedent |
|---|---|:---:|
| **Multi-Step Persistence & Gate** | [`src/features/onboarding/OnboardingPage.tsx`](file:///c:/Users/achou/Documents/GitHub/frontend/src/features/onboarding/OnboardingPage.tsx) | M15 |
| **Documenting OpenAPI Gaps** | [`src/contracts/onboarding.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/contracts/onboarding.ts) | M15 |
| **Bounded Concurrency (`runWithConcurrency`)** | [`src/features/onboarding/application/useOnboardingFlow.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/features/onboarding/application/useOnboardingFlow.ts) | M15 |
| **Paginated Feed & Social Follows** | [`src/services/api/discoverApi.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/services/api/discoverApi.ts) | M7 |
| **View-Model Mappers & Accent Resolution** | [`src/features/discover/application/discoverMappers.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/features/discover/application/discoverMappers.ts) | M7 |
| **Monotonic Request Sequencing** | [`src/features/quests/application/requestSequencer.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/features/quests/application/requestSequencer.ts) | M9 |
| **Offline-Capable Check-in Queue** | [`packages/domain-sdk/src/offlineQueue.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/packages/domain-sdk/src/offlineQueue.ts) | M10 |
| **Bidirectional Router & Deep-Links** | [`src/services/router/routeParser.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/services/router/routeParser.ts) | M11 |
| **4-Theme Vanilla Extract Contract** | [`src/styles/theme.css.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/styles/theme.css.ts) | M12 |
| **Kratos Browser Auth & Session Hook** | [`src/services/kratosAuth.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/services/kratosAuth.ts) | M13 |
| **Callsign Null Safety & Zero Speculation** | [`src/features/dashboard/application/useDashboardFlow.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/src/features/dashboard/application/useDashboardFlow.ts) | M14 |
| **Mechanical Boundary Hard Gates** | [`tests/boundaries.test.ts`](file:///c:/Users/achou/Documents/GitHub/frontend/tests/boundaries.test.ts) | M1–M14 |

---

## 4. Abstraction Pragmatism: When NOT to Add Layers

MAJARA favors clarity and explicit boundaries over premature abstraction:

1. **Do NOT create Repositories speculatively**: If an application flow only performs standard API queries and simple state management, call the transport directly from the hook. Use a repository class only when coordinating multiple disparate sources (e.g. IndexedDB offline storage + network transport).
2. **Package Promotion Invariant (AGENTS.md §1)**: Code under `src/` is promoted to `packages/` **ONLY** when there is a genuine independent boundary or a second real consumer—never simply because another client might exist in the future.
3. **Do NOT promote domain values into Design Tokens**: Domain attributes (`accent_color`, status tags) belong in local view models and scoped CSS variables (`createVar()`). Only cross-cutting system constants belong in `vars` (`src/styles/theme.css.ts`).
4. **Do NOT mock in production paths**: Transport functions must never return synthetic mock data when an endpoint fails. Errors must propagate authentically.

---

## 5. Future SSR Readiness

The platform currently operates as a client-side SPA with Tauri WebView integration. To ensure seamless transition to future SSR without pretending SSR already exists:

1. **No `window` in Module Roots**: Code evaluated at module import time must never touch `window`, `document`, or `localStorage`. Guard all DOM/browser access in `useEffect` or inside event handlers.
2. **DOM-Independent Route Matching**: Route parsing (`routeParser.ts`) operates on pure pathname strings and query strings, not `window.location`.
3. **Pure TypeBox Contracts**: All contracts compile and run in pure Node.js environments (`node:test`) without requiring JSDOM or browser APIs.
