/**
 * Canonical Application Routing Contract (Milestone 11, realigned Milestone 18)
 *
 * M18 taxonomy (docs/M18_IMPLEMENTATION_PLAN.md):
 * - /                      -> discover (D1: Discover is home; canonical URL /discover)
 * - /discover              -> discover (Feed)
 * - /discover/followings   -> discover-followings
 * - /discover/topics       -> discover-topics
 * - /map                   -> map (canonical owner: discover; base exposes alias)
 * - /map/<starId>          -> map (focused star)
 * - /quests                -> quests (playground)
 * - /bounties              -> bounties (playground)
 * - /bounties/<bountyId>   -> bounties (focused bounty)
 * - /base                  -> base (Base Home/Dashboard)
 * - /squads                -> squads (base Squad)
 * - /guilds                -> guilds (base Guilds)
 * - /profile               -> profile (base Home/Profile)
 *
 * Removed in M18: 'home' (no Home world), 'compass' (deferred), DiscoverTab
 * query routing (Feed/Followings/Topics are separate canonical routes).
 *
 * Invariants:
 * 1. ZERO activeEventId (retired domain concept).
 * 2. Exactly one canonical representation per resource (path params for resources).
 * 3. Unknown routes modeled explicitly as { kind: 'not-found', pathname }.
 * 4. Pure, DOM-independent types safe for SSR environments.
 */

export const CANONICAL_APP_ROUTES = [
  'discover',
  'discover-followings',
  'discover-topics',
  'map',
  'quests',
  'bounties',
  'squads',
  'guilds',
  'base',
  'profile',
] as const;

export type AppRoute = (typeof CANONICAL_APP_ROUTES)[number];

export type RouteMatch =
  | { kind: 'route'; route: 'discover' }
  | { kind: 'route'; route: 'discover-followings' }
  | { kind: 'route'; route: 'discover-topics' }
  | { kind: 'route'; route: 'map'; starId?: string }
  | { kind: 'route'; route: 'quests' }
  | { kind: 'route'; route: 'bounties'; bountyId?: string }
  | { kind: 'route'; route: 'squads' }
  | { kind: 'route'; route: 'guilds'; guildId?: string }
  | { kind: 'route'; route: 'base' }
  | { kind: 'route'; route: 'profile' }
  | { kind: 'not-found'; pathname: string };

/**
 * Creates a valid RouteMatch from an AppRoute string, ensuring default required params.
 */
export function createRouteMatch(route: AppRoute): RouteMatch {
  return { kind: 'route', route } as RouteMatch;
}
