/**
 * Canonical Application Page Component Composition Mapping (Milestone 17, realigned M18)
 *
 * Distinct authority from WORLD_REGISTRY:
 * - WORLD_REGISTRY owns "where does this route belong?" (route ownership & navigation)
 * - PAGE_COMPONENTS owns "what React component renders this route?"
 *
 * M18: discover feed/followings/topics and squad/guilds are separate canonical
 * routes reusing existing subviews/hooks (docs/M18_IMPLEMENTATION_PLAN.md).
 * BaseHomePage/CompassPage/SquadsGuildsPage detached (archived on disk).
 *
 * Invariant:
 * Object.keys(PAGE_COMPONENTS).sort() === getAllRegisteredRoutes().sort()
 * Neither module knows the other's implementation details.
 */

import React from 'react';
import type { AppRoute } from '../contracts/routes';

export const DiscoverPage = React.lazy(() =>
  import('../features/discover/DiscoverPage').then((m) => ({ default: m.DiscoverPage }))
);

export const DiscoverFollowingsPage = React.lazy(() =>
  import('../features/discover/DiscoverFollowingsPage').then((m) => ({ default: m.DiscoverFollowingsPage }))
);

export const DiscoverTopicsPage = React.lazy(() =>
  import('../features/discover/DiscoverTopicsPage').then((m) => ({ default: m.DiscoverTopicsPage }))
);

export const MapPage = React.lazy(() =>
  import('../features/map/MapPage').then((m) => ({ default: m.MapPage }))
);

export const QuestsPage = React.lazy(() =>
  import('../features/quests/QuestsPage').then((m) => ({ default: m.QuestsPage }))
);

export const BountiesPage = React.lazy(() =>
  import('../features/bounties/BountiesPage').then((m) => ({ default: m.BountiesPage }))
);

export const SquadPage = React.lazy(() =>
  import('../features/squads/SquadPage').then((m) => ({ default: m.SquadPage }))
);

export const GuildsPage = React.lazy(() =>
  import('../features/guilds/GuildsPage').then((m) => ({ default: m.GuildsPage }))
);

export const BaseHomePage = React.lazy(() =>
  import('../features/base-home/BaseHomePage').then((m) => ({ default: m.BaseHomePage }))
);

export const ProfilePage = React.lazy(() =>
  import('../features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

export const OnboardingPage = React.lazy(() =>
  import('../features/onboarding/OnboardingPage').then((m) => ({ default: m.OnboardingPage }))
);

/**
 * Explicit, typed mapping of all canonical AppRoutes to their lazy-loaded page components.
 * Record<AppRoute, ...> guarantees compile-time completeness.
 */
export const PAGE_COMPONENTS: Record<AppRoute, React.LazyExoticComponent<React.ComponentType<any>>> = {
  base: BaseHomePage,
  discover: DiscoverPage,
  'discover-followings': DiscoverFollowingsPage,
  'discover-topics': DiscoverTopicsPage,
  map: MapPage,
  quests: QuestsPage,
  bounties: BountiesPage,
  squads: SquadPage,
  guilds: GuildsPage,
  profile: ProfilePage,
};
