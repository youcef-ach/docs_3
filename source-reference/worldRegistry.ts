/**
 * Canonical First-Party World Route Registry (Milestone 17, realigned Milestone 18)
 *
 * M18 taxonomy (docs/M18_IMPLEMENTATION_PLAN.md):
 * - discover(0): discover, discover-followings, discover-topics, map (owner)
 * - base(1): base (Home/Dashboard), profile, squads, guilds + map alias (non-owning)
 * - academy(2): empty (future Learning Paths / Workshops)
 * - playground(3): quests, bounties
 * - horizon(4): empty (future Home / Categories / Library)
 *
 * Map alias rationale: /map has ONE canonical owner (discover) because
 * ROUTE_TO_WORLD forbids duplicates and RouteMatch must stay single-identity.
 * Base exposes the same /map URL as a navigation alias (placement), not ownership.
 * World = ownership; Navigation Entry = placement. See docs/M18_IMPLEMENTATION_PLAN.md §2.
 *
 * Authoritative single source of truth for:
 * 1. World definitions and deterministic ordering.
 * 2. Route -> World ownership (navigation only; aliases excluded).
 * 3. World-owned navigation entries (+ non-owning aliases) and navigation item IDs.
 *
 * Architectural Boundary Rules:
 * - Pure contract: zero React, zero DOM, zero CSS, zero side-effects.
 * - Single responsibility: strictly limited to world identity and route/navigation metadata.
 * - This module MUST NEVER evolve to own React components, APIs, stores, permissions,
 *   themes, or feature flags.
 * - Component composition belongs in the composition root (src/composition/pageComponents.ts).
 */

import type { AppRoute, RouteMatch } from './routes';

// ─── 1. World Identity ────────────────────────────────────────────────────────

export type MajaraWorld =
  | 'discover'
  | 'base'
  | 'academy'
  | 'playground'
  | 'horizon';

// ─── 2. Strongly Typed Navigation Item Identifiers ────────────────────────────

export type NavigationItemId =
  | 'discover'
  | 'discover-followings'
  | 'discover-topics'
  | 'map'
  | 'quests'
  | 'bounties'
  | 'profile'
  | 'squads'
  | 'guilds'
  | 'base';

// ─── 3. World Contracts ───────────────────────────────────────────────────────

export interface WorldDefinition {
  readonly id: MajaraWorld;
  readonly label: string;
  /** Deterministic display order for world-level navigation (e.g. world switcher) */
  readonly order: number;
  /** Landing route for navigation into this world. null if world has no routes yet. */
  readonly landingRoute: AppRoute | null;
}

export interface WorldNavEntry {
  readonly route: AppRoute;
  readonly label: string;
  /** Relative display order within the world's navigation surface (strictly ascending) */
  readonly order: number;
  /** Canonical visual navigation item identity (presentation-neutral) */
  readonly navigationItemId: NavigationItemId;
  /**
   * Non-owning alias marker (M18 Map pattern).
   * When set, this entry is placement-only: it renders in navigation and links to
   * the same canonical URL, but does NOT claim route ownership and is excluded
   * from ROUTE_TO_WORLD / getAllRegisteredRoutes / deriveWorldFromRoute.
   */
  readonly aliasOf?: AppRoute;
}

export interface WorldRegistration {
  readonly definition: WorldDefinition;
  readonly navigation: readonly WorldNavEntry[];
  /** Non-owning navigation aliases (placement without ownership). */
  readonly aliases?: readonly WorldNavEntry[];
}

// ─── 4. The Authoritative World Registry ─────────────────────────────────────

export const WORLD_REGISTRY: Record<MajaraWorld, WorldRegistration> = {
  discover: {
    definition: {
      id: 'discover',
      label: 'Discover',
      order: 0,
      landingRoute: 'discover',
    },
    navigation: [
      { route: 'discover', label: 'Feed', order: 0, navigationItemId: 'discover' },
      { route: 'discover-followings', label: 'Followings', order: 1, navigationItemId: 'discover-followings' },
      { route: 'discover-topics', label: 'Topics', order: 2, navigationItemId: 'discover-topics' },
      { route: 'map', label: 'Map', order: 3, navigationItemId: 'map' },
    ],
  },
  base: {
    definition: {
      id: 'base',
      label: 'Base',
      order: 1,
      landingRoute: 'base',
    },
    navigation: [
      { route: 'base', label: 'Base Home', order: 0, navigationItemId: 'base' },
      { route: 'profile', label: 'My Profile', order: 1, navigationItemId: 'profile' },
      { route: 'squads', label: 'Squad', order: 2, navigationItemId: 'squads' },
      { route: 'guilds', label: 'Guilds', order: 3, navigationItemId: 'guilds' },
    ],
    // Same Map experience as Discover (decision 4). Non-owning alias: placement
    // in Base nav without duplicating route ownership, component, or URL.
    aliases: [
      { route: 'map', label: 'Map', order: 4, navigationItemId: 'map', aliasOf: 'map' },
    ],
  },
  academy: {
    definition: {
      id: 'academy',
      label: 'Academy',
      order: 2,
      landingRoute: null,
    },
    navigation: [], // Future: Learning Paths, Workshops (decision 9)
  },
  playground: {
    definition: {
      id: 'playground',
      label: 'Playground',
      order: 3,
      landingRoute: 'quests',
    },
    navigation: [
      { route: 'quests', label: 'Quests', order: 0, navigationItemId: 'quests' },
      { route: 'bounties', label: 'Bounties', order: 1, navigationItemId: 'bounties' },
    ],
  },
  horizon: {
    definition: {
      id: 'horizon',
      label: 'Horizon',
      order: 4,
      landingRoute: null,
    },
    navigation: [], // Future: Home, Categories, Library (decision 11)
  },
};

// ─── 5. Immutable Derived Lookups (Fail-Loud Duplicate Construction) ─────────
// Ownership comes from `navigation` only. `aliases` are placement-only and
// never claim ownership (M18 Map pattern: discover owns /map, base aliases it).

const routeToWorld = new Map<AppRoute, MajaraWorld>();

for (const [worldId, registration] of Object.entries(WORLD_REGISTRY)) {
  for (const entry of registration.navigation) {
    if (entry.aliasOf !== undefined) {
      throw new Error(
        `Alias entry "${entry.route}" must live in "aliases", not "navigation" (world "${worldId}")`
      );
    }
    if (routeToWorld.has(entry.route)) {
      throw new Error(
        `Duplicate world route registration: "${entry.route}" is already registered in "${routeToWorld.get(entry.route)}", cannot re-register in "${worldId}"`
      );
    }
    routeToWorld.set(entry.route, worldId as MajaraWorld);
  }
  for (const alias of registration.aliases ?? []) {
    if (alias.aliasOf === undefined) {
      throw new Error(
        `Alias entry "${alias.route}" in world "${worldId}" must set "aliasOf"`
      );
    }
    if (!routeToWorld.has(alias.aliasOf)) {
      throw new Error(
        `Alias "${alias.route}" in world "${worldId}" points at unowned route "${alias.aliasOf}"`
      );
    }
  }
}

/**
 * Route -> World lookup derived immutably from WORLD_REGISTRY.
 * Private to this module; callers use deriveWorldFromRoute.
 */
const ROUTE_TO_WORLD: ReadonlyMap<AppRoute, MajaraWorld> = routeToWorld;

/**
 * Pure derivation: computes MajaraWorld from a RouteMatch.
 * Returns null for non-route matches (not-found, shell gates).
 *
 * Invariant: Zero independent world state. World is always derived from RouteMatch.
 */
export function deriveWorldFromRoute(match: RouteMatch): MajaraWorld | null {
  if (match.kind !== 'route') return null;
  return ROUTE_TO_WORLD.get(match.route) ?? null;
}

/**
 * Returns the navigation entries in their canonical registry order,
 * merging owned navigation with non-owning aliases (M18 Map pattern).
 */
export function getWorldNavigation(world: MajaraWorld): readonly WorldNavEntry[] {
  const reg = WORLD_REGISTRY[world];
  return [...reg.navigation, ...(reg.aliases ?? [])].sort((a, b) => a.order - b.order);
}

/**
 * Returns the non-owning navigation aliases for a world (placement only).
 */
export function getWorldAliases(world: MajaraWorld): readonly WorldNavEntry[] {
  return WORLD_REGISTRY[world].aliases ?? [];
}

/**
 * Returns all world definitions, deterministically sorted by order (M18).
 * Includes worlds with landingRoute === null (academy, horizon): the switcher
 * renders them as disabled/non-navigable entries instead of fake pages.
 */
export function getNavigableWorlds(): readonly WorldDefinition[] {
  return Object.values(WORLD_REGISTRY)
    .map((reg) => reg.definition)
    .sort((a, b) => a.order - b.order);
}

/**
 * Returns only worlds with a landing route (implemented worlds).
 */
export function getImplementedWorlds(): readonly (WorldDefinition & { landingRoute: AppRoute })[] {
  return getNavigableWorlds().filter(
    (def): def is WorldDefinition & { landingRoute: AppRoute } => def.landingRoute !== null
  );
}

/**
 * Returns all routes registered across all worlds.
 */
export function getAllRegisteredRoutes(): readonly AppRoute[] {
  return Array.from(ROUTE_TO_WORLD.keys());
}
