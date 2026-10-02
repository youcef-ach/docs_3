# Taxonomy Reconciliation — New Product Intent vs M17 Repository (2026-09-15)

> **Intent frozen:** DISCOVER (Feed, Followings, Topics, Map) | BASE (Home/Profile, Squad, Guilds, Jawaz deferred, Map same as Discover) | ACADEMY (Learning Paths, Workshops future) | PLAYGROUND (Quests, Bounties) | HORIZON (Home future, Categories future, Library future). No separate Home world. Discover home IS home. Compass deferred. World switcher must expose all five worlds even when landingRoute not yet implemented (no fake pages).

---

## 1. Canonical Routing Decisions (agreed before code moves)

### 1.1 Shared Map — single implementation, two navigations, one owner

`src/contracts/worldRegistry.ts:133-143` forbids duplicate `AppRoute` across worlds (throws).  
New intent says `Map` appears in **both** Discover and Base but is **exact same experience** (`src/features/map/MapPage.tsx:1` + `application/useMapFlow.ts:31`). Do NOT duplicate `MapPage`.

**Chosen model (sealed-compatible):**

* Keep single canonical `AppRoute 'map'` → single component `MapPage` (`src/composition/pageComponents.ts:28`, `src/services/router/routeParser.ts:125`) with URL `/map` + `/map/:starId` (`routeParser.ts:125-135`, `serializeRouteToUrl:189`).
* **Canonical owner = `discover`** (explorer surface). `WORLD_REGISTRY.discover` owns `map` entry (order 3).
* **Base entry = navigation alias** (not owner). Extend `WorldNavEntry` (`worldRegistry.ts:51`) with optional `aliasOf?: AppRoute` or allow `WorldNavEntry` with `isAlias: true` that **does not** insert into `ROUTE_TO_WORLD` (`worldRegistry.ts:133`). `deriveWorldFromRoute` (`worldRegistry.ts:158`) still returns `discover` for `/map`; Base sidebar renders alias link `href=/map` without contributing to ownership. Minimal diff: add `aliasRoutes?` field or `getWorldNavigation` union; `getAllRegisteredRoutes` (`worldRegistry.ts:184`) stays deduped. Alternative (alias owned by `base`, discovered links) equivalent — pick `discover` as less churn (current `horizon`→`discover` one-line move vs `base` also one-line). **Product alias choice is isomorphic; do not debate owner, enforce single owner + alias pattern.**

Implementation sketch (no code yet):

```ts
// worldRegistry.ts:51 — extend without breaking ownership
export interface WorldNavEntry { route: AppRoute; label:string; order:number; navigationItemId:NavigationItemId; aliasOf?: AppRoute }
export interface WorldRegistration { definition: WorldDefinition; navigation: readonly WorldNavEntry[]; aliases?: readonly WorldNavEntry[] }
```

Build alias ensures `routeToWorld.has(entry.route)` check skips aliases.

### 1.2 Feed / Followings / Topics — separate pages, not `?tab=` transient state

Current: single `AppRoute 'discover'` with `DiscoverTab 'feed'|'operatives'|'guilds'|'topics'` (`src/contracts/routes.ts:37-48`), parser `?tab=<tab>` (`routeParser.ts:83-89`), fallback to `feed`, UI `DiscoverPage.tsx:155-167` renders `activeTabId === 'feed'|'topics'|'following'` plus plugin tabs (`slots.ts:54` `BASELINE_DISCOVER_TABS feed|topics|following` mismatched vs `routes.ts:37` operative/guild). Intent says **separate pages**.

**Chosen model:**

* Replace tab state with **three distinct canonical AppRoutes** under `discover`:
  * `discover` (or `discover-feed`) → `/discover` (Feed) — keep `/` alias via `home` redirect if needed but `home` world is removed; `discover` landing is home.
  * `discover-followings` → `/discover/followings`
  * `discover-topics` → `/discover/topics`
* Each maps to dedicated lazy page reusing existing subviews (`FollowedOperativesView.tsx:1`, `TopicsFeedView.tsx:1`, plus feed grid `DiscoverPage.tsx:166-319`). Existing `DiscoverPage.tsx` feed logic becomes `DiscoverFeedPage`; `FollowedOperativesView` + `discoverRepository.ts`/`useDiscoverFlow.ts` (already separate data paths) become `DiscoverFollowingsPage`; `TopicsFeedView` becomes `DiscoverTopicsPage`. Shared shell (search bar, luminaries) can stay as composition.
* Parser adds branches for `/discover/followings`, `/discover/topics` (or keep query-param backward compat with redirect, but deprecate). Removes `DiscoverTab` query routing for these three; `DiscoverTabMetadata` / `resolveValidatedDiscoverTabId` (`slots.ts:69`) remains for **plugin-contributed** tabs only (`discover.tabs` slot) not baseline pages.
* Migration keeps `BASELINE_DISCOVER_TABS` as `discover` navigation entries (order 0..2), not plugin validation set.

**Why not keep `?tab=`:** Product says separate pages; query-param conflates canonical identity with transient state per `routes.ts:18` invariant (`path params = identity, query = transient`). Separate AppRoutes gives independent `RouteMatch`, independent world derivation, independent `PAGE_COMPONENTS` entries, and independent code-split chunks (budget `scripts/check-bundle-size.mjs:27` route chunk <50 kB).

### 1.3 World switcher — expose all five worlds always

Current: `getNavigableWorlds(): WorldDefinition[]` (`worldRegistry.ts:174`) filters `landingRoute !== null` → playground hidden (`playground: landingRoute null`, `worldRegistry.ts:125`), switcher in `AppSidebar.tsx:60` `getNavigableWorlds().map` hides it. New rule §12: switcher exposes **all five** even if landing not yet implemented, with cleanest product policy (no fake pages).

**Chosen policy:**

* Change `getNavigableWorlds` to return all five sorted by `order`, adding `isImplemented: boolean = definition.landingRoute !== null` to caller.
* `AppSidebar.tsx:99-151` renders world pills for all five; when `landingRoute === null` render disabled pill (`aria-disabled`, `cursor:not-allowed`, tooltip "COMING SOON") **without** creating fake `AppRoute` or `PAGE_COMPONENTS` entry. No placeholder component. Keeps `worldRegistry.ts:67` ordering deterministic and `tests/worlds.test.ts:129` expectation updated.
* Ordering: `discover(0) → base(1) → academy(2) → playground(3) → horizon(4)` (drop `home` world; renumber).

### 1.4 Compass deferred

Current `AppRoute 'compass'` (`routes.ts:33`, `worldRegistry.ts:100`, `pageComponents.ts:24` `CompassPage`) and `AppLayout.tsx:48` compass shell class are **not** in new taxonomy; compass cardinal semantics deferred. Keep `CompassPage.tsx:1` on disk but **remove** from `CANONICAL_APP_ROUTES`, `WORLD_REGISTRY`, `PAGE_COMPONENTS`, and `RouteMatch` in same migration that moves horizon. No world ownership decisions depend on it.

---

## 2. Detailed Reconciliation Table

Columns: World → Area (intent) → Existing feature/component (`src/...`) → Current route / subview (`routes.ts`/`routeParser.ts`) → Backend / domain (`src/contracts`, `src/services/api`) → Status (see §3 buckets).

| World | Area | Existing feature / component | Current route / subview | Backend / domain | Status |
|-------|------|------------------------------|-------------------------|------------------|--------|
| **DISCOVER** | **Home** (Discover home) | `BaseHomePage.tsx:35` (`features/dashboard/BaseHomePage.tsx`) — dashboard grid (operative card, podium `seasonBoard.topPodium/chaseList`, bookings `fetchMyBookings`, quick vectors) currently on `home` | `home` → `/` (`routes.ts:25` `CANONICAL_APP_ROUTES home`, `routeParser.ts:75` `/`) owned by obsolete `home` world (`worldRegistry.ts:68`) | `logbook`/`seasonBoard`/`observatories` via `useDashboardFlow.ts:13` (profile + seasonBoard + bookings) | **Obsolete M17 mapping** — no separate Home world (decision 1). `BaseHomePage` dashboard semantics belong to Base/Home or retired; Discover Home IS discover feed (see next row). `BaseHomePage` reusable only if reparented to Horizon Home (future) or removed; do not reuse as Discover home without product design. |
| **DISCOVER** | **Feed** | `DiscoverPage.tsx:27` feed grid (`feed.map→ ObservatoryQuestCard/NomadCommunityPostCard`), `DiscoverSearchBar.tsx`, `SeasonLuminariesCard.tsx`, `TopicAchievementCard.tsx`, `GuildSuggestionsCard.tsx` + `application/useDiscoverFlow.ts:1`, `discoverRepository.ts:1`, `discoverMappers.ts:1` | `discover#feed` → `/discover` (`routes.ts:37` `DiscoverTab feed` default, `routeParser.ts:88` `?tab=feed→/discover`) | `discoverApi fetchDiscoverFeed/fetchMyFollows/follow/unfollow`, `seasonBoardApi`, `guildApi/observatoryApi` enrichment | **Existing and reusable** — data layer fully implemented, 2-col `678+320` layout, pagination `hasMore/loadMoreFeed`, slot `feed.featured-card`. Keep but promote from tab to canonical `AppRoute` (new `discover` or `discover-feed`) in §1.2; no rebuild. |
| **DISCOVER** | **Followings** | `FollowedOperativesView.tsx:1` + `FollowedOperativeCard.tsx`, driven by `useDiscoverFlow.follows:1` + `FollowTargetViewModel` (`contracts/discover.ts:1` `CFeedItemList/CFollowList`) — UI present; also `discoverApi fetchMyFollows` tested | Currently `discover#following` → `/discover?tab=following` via `DiscoverPage.tsx:155` check but `routes.ts:37` has `operatives/guilds` (no `following`) → `isValidDiscoverTab('following')=false` (`routes.ts:46`) → parser fallback to `feed` (`routeParser.ts:88`), and `slots.ts:57` baseline has `following` mismatched | `GET /v1/me/follows`, `POST/DELETE /v1/follows` (`discoverApi.ts:1`), enrichment `fetchGuilds/fetchObservatories` (`discoverRepository.ts:1`) | **Partially implemented** — data + subview exist and reusable; route/tab wiring broken (mismatch + fallback). Action: add canonical `AppRoute 'discover-followings'` → `/discover/followings` (§1.2) reusing `FollowedOperativesView`. No new backend. |
| **DISCOVER** | **Topics** | `TopicsFeedView.tsx:1` + `TopicAchievementCard.tsx` etc., rendered at `DiscoverPage.tsx:151` when `activeTabId==='topics'` | `discover#topics` → `/discover?tab=topics` (`routes.ts:37` `topics` valid, `slots.ts:56` baseline `topics`, `routeParser.ts:88` passes) | `discoverApi` feed + `discoverMappers toFeedItemViewModel` | **Existing and reusable** — same promotion to `AppRoute 'discover-topics'` → `/discover/topics` as above; no data change. |
| **DISCOVER** | **Map** | `MapPage.tsx:1` (~1400 LOC HUD `1156x645` chamfer, draggable `pan`, `MAP_SLOTS[3]` `useMapFlow.ts:31`, observatory nodes, drawers `BookingModal/TimeKeyPassModal`) + `useMapFlow.ts:31`, `Observatories` offline queue (`offlineQueue.ts:1`) | `map` → `/map` + `/map/:starId` (`routes.ts:28` `map`+`starId?`, `routeParser.ts:125-135`) currently owned by **horizon** (`worldRegistry.ts:101`) | `starApi fetchStars/fetchStarDiscovery` (`catalog.ts Star/StarDiscovery`), `observatoryApi getObservatories/detail/book/checkin/me/bookings` | **Existing and reusable** — full HUD, offline Time-Key, star discovery dossier; keep implementation exactly, only move ownership `horizon→discover` (alias pattern §1.1) so Base alias can link. |
| **BASE** | **Home / Profile** | `ProfilePage.tsx:27` (`features/profile/ProfilePage.tsx`) + `LogbookHeader.tsx/OverviewSection/PortfolioSection/ExpeditionsSection/BadgesSection` + `application/useLogbookFlow.ts:1`, `logbookRepository.ts:1`, `logbookMappers.ts:1`, `profile.css.ts` | `profile` → `/profile` (`routes.ts:32`, `routeParser.ts:116`) owned by `base` (`worldRegistry.ts:88` `profile(0)`) | `logbookApi fetchLogbook/updateMe/privacy/display/portfolio/expeditions` (`contracts/logbook.ts:1` `CLogbook` TypeBox), `guilds` rank derivation `getRankOrder` | **Existing and reusable** — designated Base Home/Profile already-designed page per decision 2; retain as Base landing (`WORLD_REGISTRY.base.landingRoute: 'profile'` stays). No move. |
| **BASE** | **Squad** | `SquadsGuildsPage.tsx:81` squads section (`squadContainer/squadCard/musterBtn/leaveSquadBtn`), `MusterModal.tsx:1`, `application/useSquadsFlow.ts:1` (`TTL 30s` `squadRepository.ts:1`), `squadMappers.ts:1` | `squads` → `/squads` (`routes.ts:30`, `routeParser.ts:108`) owned by `base` (`worldRegistry.ts:89` `squads(1)`) | `squadApi fetchMySquads/createSquad/musterSquad/leaveSquad` (`contracts/squads.ts:1`) | **Partially implemented** — squad logic complete standalone but co-hosted with guilds in `SquadsGuildsPage`. Action: split into `SquadPage` (`src/features/squads/SquadPage.tsx`) reusing `useSquadsFlow`/`MusterModal`; keep `/squads` route under `base`. |
| **BASE** | **Guilds** | Guilds section inside same `SquadsGuildsPage.tsx:150` (`guildsGrid/guildCard/joinButton/inspectButton`, `GuildDetailModal.tsx:1`), libs `useGuildsFlow.ts:1` (4 caches 60/30s, 4 sequencers), `guildRepository.ts:1`, `guildMappers.ts:1` (`RANK_ORDER`, `toGuildVM`) | **No route** — guilds as `DiscoverTab 'guilds'` (`routes.ts:37`) but jamais routable as Base entry; rendered co-located, no `AppRoute 'guilds'` (`routes.ts:24`), not in `WORLD_REGISTRY` (`worldRegistry.ts:80-91`), not in `PAGE_COMPONENTS` (`pageComponents.ts:40` single `squads:SquadsGuildsPage`) | `guildApi fetchGuilds/detail/join/leave/badges/stats` (`contracts/guilds.ts:1`) | **Partially implemented** — pure domain/mappers/transport complete, UI co-located. Action: add canonical `AppRoute 'guilds'` → `/guilds` (or `/base/guilds` but keep flat `/guilds` per canonical flat routes) under `base` with own `GuildsPage` reusing `useGuildsFlow`/`GuildDetailModal`, separate chunk (`pageComponents.ts:40` `GuildsPage` lazy). |
| **BASE** | **Jawaz** | Mustermodal hint only `SquadsGuildsPage.tsx:106` "Jawaz muster", `MusterModal.tsx:1` proximity stub | No `AppRoute` (`routes.ts:24` none), no `WORLD_REGISTRY` entry, no `PAGE_COMPONENTS` | — (future) | **Future/missing — deferred** per decision 7. Keep no architecture; Jawaz stays in-proximity action inside squad muster, not separate route/world. |
| **BASE** | **Map** | **Same impl as Discover Map** (`MapPage.tsx:1`) | **Same canonical route** `map` → `/map` (no duplication) | Same as Discover Map | **Existing and reusable** — alias navigation entry from Base nav to canonical `/map` (§1.1). No duplicate impl. |
| **ACADEMY** | **Learning Paths** | `QuestsPage.tsx:1` + `QuestCardRow.tsx`, `QuestDetailsModal.tsx`, `application/useQuestFlow.ts:1` (headless attempt, `BrowserXhrUploadTransport`), `questRepository.ts:1` (fallback), `questMappers.ts:1` — current path envelope but oriented to quests/attempts, not paths/steps | `quests` → `/quests` (`routes.ts:29`, `routeParser.ts:100`) owned by `academy` (`worldRegistry.ts:114` `quests(0)`) | `questApi fetchRankedQuests?active_star=?` (2-block), `attemptApi`, `uploadApi`, `catalog.ts BackendQuest/CAttempt` | **Future/missing** for this area — current `quests` is Playground-oriented work, not Academy paths/steps. Academy pages require new spec; keep `questApi` but do **not** reuse `QuestsPage` as Learning Paths without spec. |
| **ACADEMY** | **Workshops** | `observatory` equipment booking UI (`MapPage` observatory drawer `BookingModal.tsx`, `useObservatoryFlow.ts:1`, `Observatories.css.ts`) — workshop-like resource booking but not Academy workshop curriculum | No route (`routes.ts:24` none under academy) | `observatoryApi bookEquipment/checkinBooking/fetchMyBookings` (`contracts/observatories.ts:1`) | **Future/missing** — physical workshop helpers exist (booking flow) but Academy Workshops is future curriculum page; no route/component; do not conflate booking drawer with Academy workshops. |
| **PLAYGROUND** | **Quests** | `QuestsPage.tsx:1` + `application/quest*` (`useQuestFlow`, `questRepository`, `requestSequencer`, `questMappers`), `QuestCardRow.css.ts` — mature M15 ref (`DEVELOPER_GUIDE.md:288`) | `quests` → `/quests` currently under `academy` (`worldRegistry.ts:114`); `RouteMatch route:'quests'` (`routes.ts:55`), `pageComponents.ts:33` `QuestsPage`, `App.tsx:345` mount | `GET /v1/academy/quests?active_star=` (2-block `block:0/1`), `GET /v1/me/attempts`, `POST /v1/quests/:id/start`, `POST /v1/attempts/:id/submit`, `POST /v1/uploads` | **Existing and reusable** — but **mis-owned** (academy→playground). Action: keep route/component/transport exactly, only move `WORLD_REGISTRY` ownership `academy[quests] → playground[quests(0)]`. No backend mismatch (backend says Academy owns `quests/attempts/paths` — brief §4 clarifies Academy owns quests semantically, but frontend product decision 9 intentionally puts Quests under Playground for product navigation; keep backend domain as academy-owned, frontend navigation is product layer). |
| **PLAYGROUND** | **Bounties** | `BountiesPage.tsx:1` + `BountyCard.tsx/BountyStatCard.tsx/BountyTagChip.tsx`, `application/useBountiesFlow.ts:1`, `bountyRepository.ts:1` (filters `zad_reward>0→ BountyVM`), `bountyMappers.ts:1` | `bounties` → `/bounties` + `/:bountyId` (`routes.ts:30` `bountyId?`, `routeParser.ts:138-151`) currently under **horizon** (`worldRegistry.ts:106` provisional comment) | `questApi fetchRankedQuests?active_star=` (reuse ranked quests filtered), `seasonBoardApi`, `observatoryApi` bookings | **Existing and reusable but mis-owned** — same as quests: keep impl, move `WORLD_REGISTRY` ownership `horizon[bounties] → playground[bounties(1)]` (ordered `quests0,bounties1`). Provisional comment `worldRegistry.ts:102-105` already flags this. |
| **HORIZON** | **Home** | — none; `BaseHomePage` dashboard could be candidate but not designed for Horizon | No route under horizon today (landing is `compass` `worldRegistry.ts:97`); no Horizon Home | — | **Future/missing** — decision 3 separate future page; do not reuse `BaseHomePage` silently. Deferred, no `AppRoute`. |
| **HORIZON** | **Categories** | `BountiesPage` internal category tags `BOUNTY_CATEGORIES ALL/DEVELOPMENT/HARDWARE/DESIGN/SECURITY` (`bounties/useBountiesFlow.ts`) but not routable | No `AppRoute 'categories'` (`routes.ts:24` none), not in `WORLD_REGISTRY`, not in `PAGE_COMPONENTS` | — | **Future/missing** — needs new routes/pages; do not invent. |
| **HORIZON** | **Library** | `seasonBoardApi`/`Book`/`Profile` portfolio artifacts (`ProfilePage portfolio` section) partially library-like but not Horizon library | No route | — | **Future/missing** |
| **(deferred)** | **Compass** | `CompassPage.tsx:1` SVG radar `524x524` + cardinal nav N:Horizon→`discover` etc., `OfflineQueueBanner` | `compass` → `/compass` (`routes.ts:27` `compass`, `routeParser.ts:92`, `worldRegistry.ts:100` `horizon` landing `compass`) | `useObservatoryFlow` docking state only | **Obsolete M17 mapping** — product decision 11 says deferred; compass cardinal geography should not dictate ownership now. Action: remove `compass` from `CANONICAL_APP_ROUTES`/`RouteMatch`/`WORLD_REGISTRY`/`PAGE_COMPONENTS` in same horizon migration (keep file on disk archived). `AppLayout` compass shell variant (`AppLayout.tsx:48`) can stay unused. |
| **Global** | **World switcher** | `AppSidebar.tsx:60` `getNavigableWorlds().map` + `World Switcher HUD` `114-151` + `getWorldNavigation` per-world buttons + `Discover sub-nav` (`AppSidebar.tsx:192` baseline+plugin tabs) | Derived from `WORLD_REGISTRY` (`worldRegistry.ts:174`) filtered `landingRoute!==null` → shows 4 worlds hiding `playground` | `worldRegistry.ts:21` `MajaraWorld` union includes `playground` | **Partially implemented** — needs policy extension §1.3 to expose all five (disabled when `landingRoute null`) and reordering `discover(0),base(1),academy(2),playground(3),horizon(4)` dropping `home` world. |

---

## 3. Status Buckets

### 3.1 Existing and reusable (preserve, reparent at most)

* **DISCOVER Feed** — `DiscoverPage` feed + `useDiscoverFlow`/`discoverRepository`/`discoverMappers` + `DiscoverSearchBar`/`SeasonLuminariesCard` → keep, promote to canonical route (§1.2).
* **DISCOVER Topics** — `TopicsFeedView`/`TopicAchievementCard` → keep, promote to route.
* **DISCOVER/BASE Map** — `MapPage` + `useMapFlow` (drag pan, dossier, star discovery) + `useObservatoryFlow`/`offlineQueue`/`BookingModal`/`TimeKeyPassModal` → keep verbatim, single owner + alias (§1.1).
* **BASE Home/Profile** — `ProfilePage` (`useLogbookFlow`/`logbookRepository`/`logbookMappers`, `LogbookHeader/Overview/Portfolio/Expeditions/Badges`, `profile.css.ts`) → keep as Base landing.
* **PLAYGROUND Quests** — `QuestsPage` + full `quest*` application stack (`useQuestFlow`/`questRepository`/`requestSequencer`/`questMappers`) → keep, move ownership academy→playground.
* **PLAYGROUND Bounties** — `BountiesPage` + `bounty*` stack → keep, move ownership horizon→playground.

### 3.2 Partially implemented (reuse subviews/libs, fix route/nav wiring, split)

* **DISCOVER Followings** — `FollowedOperativesView/FollowedOperativeCard` + `useDiscoverFlow.follows` + `discoverApi follows` exist and sound, but `DiscoverTab` union/validation broken (`routes.ts:37` vs `slots.ts:57` vs `DiscoverPage.tsx:155`). Fix by adding canonical `discover-followings` route reusing view.
* **BASE Squad** — squad domain (`useSquadsFlow`/`squadRepository`/`squadMappers`/`MusterModal`) is standalone-mature but co-hosted with guilds in `SquadsGuildsPage`. Split `SquadPage` from `GuildsPage`.
* **BASE Guilds** — guild domain (`useGuildsFlow`/`guildRepository`/`guildMappers` 4 caches + sequencers + `GuildDetailModal`) is mature but has no route/page; currently nested tab in `SquadsGuildsPage`. Promote to separate `GuildsPage` under `base`.
* **World switcher** — switcher renders 4 of 5 due to `landingRoute !== null` filter; needs all-five disabled-state policy (§1.3).

### 3.3 Future / missing (no fake pages — registry `landingRoute null`, disabled nav)

* **BASE Jawaz** — deferred; stays as in-person muster action inside squad flow, no route.
* **ACADEMY Learning Paths** — no route/component; requires backend `paths/steps/completions` spec before `contracts` + `services/api` + page.
* **ACADEMY Workshops** — same; future page (do not reuse booking drawer confusion).
* **HORIZON Home** — future distinct page (not `BaseHomePage`).
* **HORIZON Categories** — future page.
* **HORIZON Library** — future page.

### 3.4 Obsolete M17 mapping (remove from registry/routes when migrating)

* **`home` world** — `MajaraWorld 'home'` (`worldRegistry.ts:22`), definition order 0 `home` (`worldRegistry.ts:68`), navigation `home(0)+discover(1)` — Home world is explicitly gone per decision 1; dissolve `home` world, migrate `discover` ownership to new `discover` world (see §4).
* **`BaseHomePage` on `home` route** — `AppRoute 'home'` → `/` + `BaseHomePage` (`routes.ts:25`+`69` `home`, `pageComponents.ts:16`, `App.tsx:322` `BaseHomePage`) — product has no `/` Home world page; `home` route becomes alias to `/discover` or removed (do not invent; see D1 below).
* **`compass` under horizon** — `AppRoute 'compass'`/`CompassPage` as Horizon landing (`worldRegistry.ts:97` `landingRoute:compass`) — horizon landing should be Horizon Home (future); compass deferred (decision 11).
* **`quests` under academy** / **`bounties` under horizon** — provisional assignments noted earlier; both migrate to `playground`.
* **`DiscoverTab 'operatives'|'guilds'`** — semiotics pre-date new product; should be `followings` canonical (with `TopicsFeedView` separate).

### 3.5 Unresolved product decisions (intent now frozen, implementation needs spec)

Call these out to prevent silent architecture choices:

* **D1 — `/` (`home`) handling:** With no Home world, what does `/` do? Options: (a) redirect `/`→`/discover` (Discover home is Home), (b) keep `home` as alias route under `discover` (`worldRegistry.ts:67` alias pattern), (c) delete `home` `AppRoute` entirely and make `discover` world `landingRoute: 'discover'` → `/discover`. Recommendation: (c) keep `home` route only as legacy redirect `parseUrlToRoute('/')→{route:'discover',tab:'feed'}` or `serialize('/')→'/discover'` to avoid 404; `PAGE_COMPONENTS` then drops `home:BaseHomePage` (archive `BaseHomePage` for Horizon Home design reuse).
* **D2 — Discover feed vs search scope:** `DiscoverSearchBar` is `console.log` stub; how `discover?tab` plugin `discover.tabs` slot (`slots.ts:27`, `DiscoverPage.tsx:84`) correlates to new `discover-topics/followings` pages vs plugin tabs — keep `discover.tabs` only for plugin-contributed tabs (e.g. `official.star-forge` Forge lab) not baseline; resolve plugin tab validation fallback.
* **D3 — Map ownership choice alias direction:** Recommend Discover primary alias Base (§1.1) but product may prefer Base primary; alias mechanism handles either without duplication.

---

## 4. Proposed Registry Shape (before → after, no code yet)

**Before (M17)** — 5 worlds, 8 routes, mismatch:

```
home(0): home→/, discover→/discover(?tab)
base(1): profile→/profile, squads→/squads
horizon(2): compass→/compass, map→/map(:starId), bounties→/bounties(:bountyId) [provisional]
academy(3): quests→/quests
playground(4): — empty
```

**After (new intent, alias-aware)** — 5 worlds, 10→11 routes (net +2–3 after removals), no Home world, no compass:

```
discover(0): discover→/discover (Feed, landing), discover-followings→/discover/followings, discover-topics→/discover/topics, map→/map(:starId) [canonical owner]
  └─ alias: base.map → /map (non-owning alias entry)
base(1): profile→/profile (Home/Profile), squads→/squads (Squad), guilds→/guilds (Guilds)
  └─ alias: map→/map
academy(2): — empty for now (landingRoute null) until Learning Paths (/academy/paths) and Workshops (/academy/workshops) spec lands
playground(3): quests→/quests, bounties→/bounties(:bountyId) [moved from academy/horizon]
horizon(4): — empty for now (landingRoute null) until Home (/horizon), Categories (/horizon/categories), Library (/horizon/library)
```

`getNavigableWorlds()` → returns all five ordered `discover,base,academy,playground,horizon` with `isImplemented = landingRoute !== null`; `getAllRegisteredRoutes()` dedupes canonical owners only (aliases excluded).

Diff hits:

* `src/contracts/routes.ts:24-59` — add `MajaraWorld 'discover'` (replacing `home`), remove `home`, `compass`, `DiscoverTab`; add `discover-followings`, `discover-topics`, `guilds` (+ future stubs as deferred, NOT added).
* `src/contracts/worldRegistry.ts:21-129` — dissolve `home` world, create `discover` world, remove `compass`, add `discover-followings/topics`, add `guilds`, add `aliasOf` handling, update orders.
* `src/composition/pageComponents.ts:56` — drop `home:BaseHomePage`, `compass:CompassPage` (archive), add `discoverFollowings/TopicsPage`, `GuildsPage` lazies; split `SquadsGuildsPage`.
* `src/services/router/routeParser.ts:70-199` — add branches for `/discover/followings` etc, `/guilds`, drop `/compass`, add alias handling; keep `/`→`/discover` redirect for legacy.

---

## 5. File-by-file Impact (inspect, reuse, split — no broad refactors yet)

| File(s) | Action | Keep / split | Why |
|---------|--------|--------------|-----|
| `src/contracts/routes.ts:24,37,50,64` | Add `discover-followings`, `discover-topics`, `guilds`; remove `home`, `compass`, `DiscoverTab operatives/guilds→followings`; `MajaraWorld` add `discover`, drop `home` | Keep | Canonical vocabulary change; pure contract, zero DOM |
| `src/contracts/worldRegistry.ts:21,42,51,67,174` | Dissolve `home` world, create `discover` world (landing `discover`, nav `discover/followings/topics/map`), add `base.guilds`, move `quests/bounties→playground`, drop `compass`, add `aliasOf` + skip duplicate check for aliases, update `getNavigableWorlds` to return all five | Keep | Registry purity preserved |
| `src/composition/pageComponents.ts:16-65` | Drop `home/Compass`, add `DiscoverFollowingsPage`, `DiscoverTopicsPage`, `GuildsPage` lazies, split `SquadsGuildsPage` → `SquadPage` + `GuildsPage` (or keep `SquadsGuildsPage` as deprecated shim) | Split | Distinct PAGE_COMPONENTS authority intact |
| `src/services/router/routeParser.ts:70,160,205` | New branches `/discover/followings`, `/discover/topics`, `/guilds`; remove `/compass`; map alias tolerant; `serializeRouteToUrl` covers new; `isSameRouteMatch` branches | Keep | Pure SSR-safe parser only |
| `src/components/AppSidebar.tsx:60` | Consume `getNavigableWorlds` with `isImplemented` disabled pills; handle alias nav entries (alias `route→href` same `/map`) without world derivation breakage | Keep | Shell stays generic consumer |
| `src/features/discover/{DiscoverPage,DiscoverFollowingsPage,DiscoverTopicsPage}.tsx` | Refactor `DiscoverPage` feed-only; new wrappers reuse `FollowedOperativesView`/`TopicsFeedView` + `useDiscoverFlow`/`discoverRepository`/`discoverMappers` | Split | No data logic rebuild |
| `src/features/squads/{SquadPage,GuildsPage}.tsx` vs `SquadsGuildsPage.tsx:1` | Split `SquadsGuildsPage` into two lazy pages each consuming `useSquadsFlow`/`useGuildsFlow` grids + modals | Split | Separate Base entries per intent |
| `src/features/dashboard/BaseHomePage.tsx:35` | Archive or repurpose as Horizon Home candidate (future design) — do not delete yet, leave out of `PAGE_COMPONENTS` until Horizon Home spec | Keep on disk | Existing dashboard is sound but homeless under new taxonomy; deferred decision |
| `src/features/compass/CompassPage.tsx:1` | Keep file but remove from route/registry/composition (compass deferred D11) | Keep on disk | Cardinal geography should not drive ownership now |
| `src/features/{quests, bounties}` | No component change; only world ownership moves | Keep | Backend domain separation respected (Horizon economy vs Playground produce at product nav layer) |

Zero backend changes. Zero synthetic identities. Zero world↔feature dir restructuring (`src/worlds/*` still forbidden). All 6 boundary gates (`tests/boundaries.test.ts:64`) remain green.

---

## 6. World Switcher — Product/Navigation Policy (no fake pages)

Authoritative spec:

* Switcher data = `getNavigableWorlds()` returning **all five** `WorldDefinition` ordered `discover(0), base(1), academy(2), playground(3), horizon(4)`.
* Render: `landingRoute !== null` → enabled `<a href=serialize(createRouteMatch(landingRoute))>` as today (`AppSidebar.tsx:117`); `landingRoute === null` → disabled pill (`aria-disabled=true`, `title="COMING SOON"`, no navigation, dimmed `opacity 0.45`). No `PAGE_COMPONENTS` entry, no route stub, no fake component.
* Academy and Horizon will appear dimmed until their first real route lands (Learning Paths / Horizon Home). Playground will become enabled as soon as `quests/bounties` migrate (so landing can be `quests`). This satisfies "global world switcher should ultimately expose all five worlds" without violating promotion invariant (`docs/BOUNDARIES.md:81`).

---

## 7. Action Sequencing (no broad changes before reconciliation closed)

This reconciliation is the gate. Do not start migrations until this doc is reviewed:

1. **Patch `DiscoverTab` mismatch** (`routes.ts:37` vs `slots.ts:54`) as hotfix (1-line) if blocking followings — can land without full migration.
2. **Approve §1.1–1.4 canonical models** (alias, separate pages, all-five switcher, compass defer) — product + arch sign-off.
3. **Migrate worldRegistry/routes/pageComponents/routeParser together** as single PR (atomic switch from M17 to new intent) per §4/§5 table, updating `tests/worlds.test.ts:129` expectations and `tests/routing-deep-linking.test.ts:83` branches in same change to keep invariant `keys(PAGE_COMPONENTS)===getAllRegisteredRoutes()` green.
4. **Split DiscoverPage and SquadsGuildsPage** into dedicated lazy pages reusing existing subviews/hooks — parallel follow-up, no new contracts needed.

Until sign-off, keep M17 code running (pay the provisional comment `worldRegistry.ts:102-105` tax) rather than half-migrating worlds.

