# M18 — World Taxonomy & Navigation Alignment (Implementation Plan)

> Sealed M17 preserved: single `RouteMatch`, no `currentWorld` state, pure `WORLD_REGISTRY`, split `PAGE_COMPONENTS`, generic `AppSidebar`, no second router, no `src/worlds/*`, no backend changes.

## 1. World → Area → canonical route → existing implementation → status

| World | Area | Canonical route | Existing implementation reused | Status |
|-------|------|-----------------|--------------------------------|--------|
| discover (0, landing `discover`) | Feed (Discover home) | `discover` → `/discover` | `discover/DiscoverPage.tsx:27` feed grid + `useDiscoverFlow`/`discoverRepository`/`discoverMappers` + `DiscoverSearchBar`/`SeasonLuminariesCard` | existing reusable; becomes landing; `/` canonicalizes here (D1) |
| discover | Followings | `discover-followings` → `/discover/followings` | `discover/components/FollowedOperativesView.tsx:1` + same `useDiscoverFlow.follows`/`discoverApi` | partially (view+data exist, route missing) → new thin `DiscoverFollowingsPage` wrapper |
| discover | Topics | `discover-topics` → `/discover/topics` | `discover/components/TopicsFeedView.tsx:1` | existing reusable → new thin `DiscoverTopicsPage` wrapper |
| discover | Map (canonical owner) | `map` → `/map`, `/map/:starId` | `map/MapPage.tsx:1` + `useMapFlow` + `useObservatoryFlow`/`offlineQueue`/`BookingModal`/`TimeKeyPassModal` | existing reusable unchanged; ownership moves `horizon→discover` |
| base (1, landing `profile`) | Home/Profile | `profile` → `/profile` | `profile/ProfilePage.tsx:27` + `useLogbookFlow`/`logbookRepository`/`logbookMappers` | existing reusable unchanged |
| base | Squad | `squads` → `/squads` | `squads/SquadsGuildsPage.tsx:81` squads section + `useSquadsFlow`/`squadRepository`/`MusterModal` | partially (co-hosted) → split `SquadPage` |
| base | Guilds | `guilds` → `/guilds` | `squads/SquadsGuildsPage.tsx:150` guilds section + `useGuildsFlow`/`guildRepository`/`guildMappers`/`GuildDetailModal` | partially (no route) → new `GuildsPage` |
| base | Map (alias) | `map` (alias) → `/map` (same URL) | same `MapPage` | existing reusable via alias; no duplicate |
| academy (2, landing `null`) | Learning Paths | — (future) | — | future/missing; world disabled in switcher |
| academy | Workshops | — (future) | — | future/missing |
| playground (3, landing `quests`) | Quests | `quests` → `/quests` | `quests/QuestsPage.tsx:1` + `useQuestFlow`/`questRepository`/`questMappers` | existing reusable; ownership `academy→playground` |
| playground | Bounties | `bounties` → `/bounties`, `/bounties/:bountyId` | `bounties/BountiesPage.tsx:1` + `useBountiesFlow`/`bountyRepository`/`bountyMappers` | existing reusable; ownership `horizon→playground` |
| horizon (4, landing `null`) | Home / Categories / Library | — (future) | — (`BaseHomePage` archived, not reused silently) | future/missing; world disabled |
| — (removed) | Compass | removed | `compass/CompassPage.tsx:1` kept on disk, detached | obsolete M17; deferred per decision 12 |
| — (removed) | Home world/route | removed (`/`→`discover`) | `dashboard/BaseHomePage.tsx:35` archived | obsolete M17; decision 1 |

Ordering: `discover(0), base(1), academy(2), playground(3), horizon(4)`.

## 2. Shared Map — why one owner + Base alias

`worldRegistry.ts:133` throws on duplicate `AppRoute` across worlds. Product requires Discover Map and Base Map to be the **exact same experience** (`MapPage`, decision 4). Duplicating route (`map` twice) would create two `RouteMatch` identities for one URL, two `PAGE_COMPONENTS` entries, divergent deep-links, and a second router by stealth — violating M17 §2.

Model: single canonical `AppRoute 'map'` owned by `discover` (`ROUTE_TO_WORLD.get('map')==='discover'`, `deriveWorldFromRoute({route:'map'})==='discover'`, `PAGE_COMPONENTS.map===MapPage`, URL `/map`). Base exposes it via **non-owning navigation alias**: `WorldRegistration.aliases` entry `{route:'map', aliasOf:'map'}` excluded from `ROUTE_TO_WORLD`/`getAllRegisteredRoutes`, included in `getWorldNavigation('base')`. Alias is placement (`Navigation Entry`), owner is identity (`Route`); concepts stay separate per brief §14. `isActive` in sidebar compares `currentRoute==='map'` so alias highlights correctly in both worlds.

## 3. D1 root route

`parseUrlToRoute('/')` returns `{kind:'route',route:'discover'}` (`routeParser.ts:70`); `serializeRouteToUrl({route:'discover'})` returns `/discover`. No `home` `AppRoute`/`RouteMatch`/`PAGE_COMPONENTS`. `App.tsx:82` hydration already normalizes via `serialize+replaceRoute`, so `/` → `/discover` replace on boot; `useOnboardingGate` fallback changes `home→discover`; `handleComplete` preserves `discover` match. Auth/onboarding/deep-link unaffected.

## 4. File diff (limited to scope)

* `src/contracts/routes.ts` — 9 routes, no `home`/`compass`/`DiscoverTab`; `RouteMatch` plain `discover` (+`discover-followings/topics`, `guilds`).
* `src/services/router/routeParser.ts` — `/→discover`, `/discover`, `/discover/followings`, `/discover/topics` (+legacy `?tab=` compat), `/guilds`, drop `/compass`; serializer + `isSameRouteMatch` updated.
* `src/contracts/worldRegistry.ts` — `MajaraWorld discover|base|academy|playground|horizon`; `NavigationItemId +discover-followings/topics/guilds`; `WorldNavEntry.aliasOf?`, `WorldRegistration.aliases?`; registry per §1; `getWorldNavigation` merges aliases; `getNavigableWorlds` returns all five (disabled via `landingRoute null`).
* `src/composition/pageComponents.ts` — drop `BaseHomePage/CompassPage/SquadsGuildsPage`; add `DiscoverFollowingsPage/DiscoverTopicsPage/SquadPage/GuildsPage` lazies (wrappers reusing views/hooks).
* New wrappers (reuse, no new domain): `discover/DiscoverFollowingsPage.tsx`, `discover/DiscoverTopicsPage.tsx`, `squads/SquadPage.tsx`, `guilds/GuildsPage.tsx`; `DiscoverPage.tsx` becomes feed-only (tab branches removed, plugin slot kept).
* `src/machines/appMachine.ts` — drop `DiscoverTab/SET_DISCOVER_TAB/selectDiscoverTab`; initial `discover`; collapse on `map` only; `selectCurrentRoute` fallback `discover`.
* `src/App.tsx` — drop tab state; plugin-tab ephemeral state (not URL); render 9 routes; `onNavigateHome→discover`.
* `src/components/AppSidebar.tsx` — all-five switcher with disabled pills; active-world nav via `getWorldNavigation` (aliases included); remove baseline tab sub-nav, keep plugin `discover.tabs` ephemeral section.
* `src/components/AppLayout.tsx` — drop compass variant; discover variant covers `discover*`; remove tab props pass-through (keep plugin props).
* `src/components/TopNavigation.tsx` + `sidebarNavData.tsx` — titles + renderers for 9 routes.
* `src/features/onboarding/.../useOnboardingGate.ts` — fallback `discover`.
* Tests: `worlds.test.ts` (9 routes, 5 worlds, alias exclusion, disabled worlds), `routing-deep-linking.test.ts` (new URLs + `/→discover` + legacy `?tab=`), plus grep-fixed suites referencing `home/compass/DiscoverTab`.
* Docs: this plan + `TAXONOMY_RECONCILIATION.md` link.
