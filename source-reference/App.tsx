import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import {
  appMachine,
  AppRoute,
  StarThemeKey,
  RouteMatch,
  selectCurrentRoute,
  selectActiveBountyId,
  selectSelectedStarId,
  selectActiveGuildId,
} from './machines/appMachine';
import { STAR_THEMES } from './styles/theme.css';
import { routeLoadingFallback } from './styles/layout.css';
import { globalThemeAdapter } from './services/theme/themeAdapter';
import { authMachine } from './machines/authMachine';
import { AppLayout } from './components/AppLayout';
import { PluginInspector } from './components/PluginInspector';
import { NotFoundPage } from './components/NotFoundPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { OtpPage } from './features/auth/OtpPage';
import {
  DiscoverPage,
  DiscoverFollowingsPage,
  DiscoverTopicsPage,
  BaseHomePage,
  MapPage,
  QuestsPage,
  BountiesPage,
  SquadPage,
  GuildsPage,
  ProfilePage,
  OnboardingPage,
} from './composition/pageComponents';
import { useOnboardingGate } from './features/onboarding/application/useOnboardingGate';
import { serializeRouteToUrl } from './services/router/routeParser';
import { globalHistoryAdapter } from './services/router/browserHistoryAdapter';
import { isPreviewMode, PREVIEW_USER } from './dev/previewMode';

const RouteLoadingFallback: React.FC = () => (
  <div className={routeLoadingFallback}>
    <span>INITIALIZING SECTOR TELEMETRY...</span>
  </div>
);

export const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password' | 'otp'>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('hemisabdelwahab@gmail.com');

  // Single authoritative statechart instances
  const [appSnapshot, appSend] = useMachine(appMachine);
  const [authSnapshot, authSend] = useMachine(authMachine);

  const authUser = authSnapshot.context.user;
  const currentMatch = appSnapshot.context.currentMatch;
  const currentRoute = selectCurrentRoute(appSnapshot.context);
  const activeBountyId = selectActiveBountyId(appSnapshot.context);
  const selectedStarId = selectSelectedStarId(appSnapshot.context);
  const activeGuildId = selectActiveGuildId(appSnapshot.context);
  const theme = appSnapshot.context.theme;
  const locale = appSnapshot.context.locale;
  const sidebarCollapsed = appSnapshot.context.sidebarCollapsed;

  // Ephemeral plugin tab for discover.tabs slot (not a canonical route)
  const [activePluginTabId, setActivePluginTabId] = useState<string | null>(null);

  // Application-level Onboarding Gate (fail-closed, preserves M11 deep-link)
  const onboardingGate = useOnboardingGate({
    initialMatch: currentMatch,
    enabled: Boolean(authUser),
  });

  // 1. Browser History Integration & Initial URL Hydration (M18 D1: / -> /discover)
  useEffect(() => {
    // Initial hydration from URL
    const initialMatch = globalHistoryAdapter.getCurrentRoute();
    appSend({ type: 'NAVIGATE_MATCH', match: initialMatch });

    // If initial URL had trailing slash, legacy ?tab=, or root /, normalize via replace
    if (typeof window !== 'undefined') {
      const canonicalUrl = serializeRouteToUrl(initialMatch);
      const currentRawUrl = window.location.pathname + window.location.search;
      if (canonicalUrl !== currentRawUrl && initialMatch.kind === 'route') {
        globalHistoryAdapter.replaceRoute(initialMatch);
      }
    }

    // Subscribe to browser back/forward (popstate)
    const unlisten = globalHistoryAdapter.listen((match) => {
      setActivePluginTabId(null);
      appSend({ type: 'NAVIGATE_MATCH', match });
    });

    return unlisten;
  }, [appSend]);

  const handleNavigate = (to: AppRoute | RouteMatch) => {
    let match: RouteMatch;
    if (typeof to === 'string') {
      match = { kind: 'route', route: to } as RouteMatch;
    } else {
      match = to;
    }

    setActivePluginTabId(null);
    appSend({ type: 'NAVIGATE_MATCH', match });
    globalHistoryAdapter.pushRoute(match);
  };

  const handleToggleSidebar = () => {
    appSend({ type: 'TOGGLE_SIDEBAR' });
  };

  const handleThemeChange = (newTheme: StarThemeKey) => {
    appSend({ type: 'SET_THEME', theme: newTheme });
    globalThemeAdapter.syncStarTheme(newTheme);
  };

  const handleToggleLocale = () => {
    appSend({ type: 'TOGGLE_LOCALE' });
  };

  const handleSignOut = () => {
    authSend({ type: 'SIGN_OUT' });
    setAuthView('login');
  };

  const handleRequireAuth = () => {
    handleSignOut();
  };

  useEffect(() => {
    const onAuthRequired = () => {
      handleSignOut();
    };
    window.addEventListener('majara:auth-required', onAuthRequired);
    return () => window.removeEventListener('majara:auth-required', onAuthRequired);
  }, []);

  // PREVIEW MODE: Bypass auth gate for local visual inspection (dev-only, flag-gated)
  const effectiveUser = isPreviewMode ? PREVIEW_USER : authUser;

  // 1. Unauthenticated Gateway (Login / SignUp / Forgot Password / OTP)
  if (!effectiveUser) {
    return (
      <div className={STAR_THEMES[theme]}>
        {authView === 'login' && (
          <LoginPage
            onLogin={(credentials) => authSend({ type: 'SUBMIT', credentials })}
            onSwitchToSignUp={() => setAuthView('signup')}
            onSwitchToForgotPassword={() => setAuthView('forgot-password')}
            loading={
              authSnapshot.matches('authenticating') ||
              authSnapshot.matches('initializing')
            }
            errorMessage={authSnapshot.context.errorMessage}
            successMessage={authSnapshot.context.successMessage}
          />
        )}
        {authView === 'signup' && (
          <SignUpPage
            onSwitchToLogin={() => setAuthView('login')}
            onRegister={(payload) => {
              setPendingEmail(payload.email);
              authSend({ type: 'REGISTER', payload });
            }}
            loading={authSnapshot.matches('registering')}
            errorMessage={authSnapshot.context.errorMessage}
            successMessage={authSnapshot.context.successMessage}
          />
        )}
        {authView === 'forgot-password' && (
          <ForgotPasswordPage
            onSubmitEmail={(email) => {
              setPendingEmail(email);
              setAuthView('otp');
            }}
            onBackToLogin={() => setAuthView('login')}
            onResend={(email) => {
              setPendingEmail(email);
              setAuthView('otp');
            }}
          />
        )}
        {authView === 'otp' && (
          <OtpPage
            email={pendingEmail}
            onVerifyOtp={(code) => {
              window.alert(`Security code [${code}] verified. Redirecting to terminal...`);
              setAuthView('login');
            }}
            onBackToLogin={() => setAuthView('login')}
          />
        )}
      </div>
    );
  }

  // 2. Onboarding Gate (Application-level gate for authenticated nomads)
  // PREVIEW MODE: Skip onboarding gate entirely for local visual inspection
  if (!isPreviewMode) {
    if (onboardingGate.status === 'loading') {
      return (
        <div className={STAR_THEMES[theme]}>
          <RouteLoadingFallback />
        </div>
      );
    }

    if (onboardingGate.status === 'error') {
      return (
        <div className={STAR_THEMES[theme]}>
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              color: '#fff',
              fontFamily: 'monospace',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <h2 style={{ letterSpacing: '0.08em', margin: 0, color: '#ef4444' }}>
              TELEMETRY GATEWAY OFFLINE
            </h2>
            <p style={{ maxWidth: '500px', color: '#94a3b8', margin: 0 }}>
              {onboardingGate.errorMessage ||
                'Unable to verify operative onboarding status from the sector telemetry.'}
            </p>
            <button
              onClick={onboardingGate.retry}
              style={{
                padding: '10px 24px',
                borderRadius: '4px',
                border: '1px solid #38bdf8',
                background: '#38bdf8',
                color: '#050811',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.08em',
                fontFamily: 'monospace',
              }}
            >
              RETRY TELEMETRY CONNECTION
            </button>
          </div>
        </div>
      );
    }

    if (onboardingGate.status === 'onboarding' && onboardingGate.suggestions) {
      return (
        <div className={STAR_THEMES[theme]}>
          <React.Suspense fallback={<RouteLoadingFallback />}>
            <OnboardingPage
              suggestions={onboardingGate.suggestions}
              userCallsign={effectiveUser.callsign}
              onComplete={() => {
                const targetRoute = onboardingGate.handleComplete();
                handleNavigate(targetRoute);
              }}
            />
          </React.Suspense>
        </div>
      );
    }
  }

  // 3. Authenticated Multi-Page Application Shell (gate status === 'complete')
  return (
    <div className={STAR_THEMES[theme]}>
      <AppLayout
        currentMatch={currentMatch}
        currentRoute={currentRoute}
        theme={theme}
        locale={locale}
        sidebarCollapsed={sidebarCollapsed}
        userCallsign={effectiveUser.callsign}
        onNavigate={handleNavigate}
        onToggleSidebar={handleToggleSidebar}
        onThemeChange={handleThemeChange}
        onToggleLocale={handleToggleLocale}
        onSignOut={handleSignOut}
        activePluginTabId={activePluginTabId}
        onSelectPluginTab={setActivePluginTabId}
      >
        <React.Suspense fallback={<RouteLoadingFallback />}>
          {currentMatch.kind === 'not-found' ? (
            <NotFoundPage
              pathname={currentMatch.pathname}
              onNavigateHome={() => handleNavigate('discover')}
            />
          ) : (
            <>
              {currentRoute === 'discover' && (
                <DiscoverPage
                  onNavigate={handleNavigate}
                  activePluginTabId={activePluginTabId}
                />
              )}
              {currentRoute === 'discover-followings' && (
                <DiscoverFollowingsPage onNavigate={handleNavigate} />
              )}
              {currentRoute === 'discover-topics' && (
                <DiscoverTopicsPage onNavigate={handleNavigate} />
              )}
              {currentRoute === 'base' && (
                <BaseHomePage onNavigate={handleNavigate} />
              )}
              {currentRoute === 'map' && (
                <MapPage
                  onNavigate={handleNavigate}
                  selectedStarId={selectedStarId ?? undefined}
                  onSelectStar={(starId) =>
                    handleNavigate({ kind: 'route', route: 'map', starId })
                  }
                />
              )}
              {currentRoute === 'quests' && (
                <QuestsPage onRequireAuth={handleRequireAuth} />
              )}
              {currentRoute === 'bounties' && (
                <BountiesPage
                  selectedBountyId={activeBountyId ?? undefined}
                  onSelectBounty={(bountyId) =>
                    handleNavigate({ kind: 'route', route: 'bounties', bountyId })
                  }
                  onCloseBounty={() =>
                    handleNavigate({ kind: 'route', route: 'bounties' })
                  }
                />
              )}
              {currentRoute === 'squads' && (
                <SquadPage onNavigate={handleNavigate} />
              )}
              {currentRoute === 'guilds' && (
                <GuildsPage
                  selectedGuildId={activeGuildId ?? undefined}
                  onSelectGuild={(guildId) =>
                    handleNavigate({ kind: 'route', route: 'guilds', guildId })
                  }
                  onCloseGuild={() =>
                    handleNavigate({ kind: 'route', route: 'guilds' })
                  }
                  onNavigate={handleNavigate}
                />
              )}
              {currentRoute === 'profile' && (
                <ProfilePage userCallsign={effectiveUser.callsign} />
              )}
            </>
          )}
        </React.Suspense>
      </AppLayout>
      <PluginInspector onThemeChange={handleThemeChange} />
    </div>
  );
};

export default App;
