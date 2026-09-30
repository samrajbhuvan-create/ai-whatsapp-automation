import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useWorkspace } from './lib/hooks';
import { AppShell } from './components/AppShell';
import { DashboardView } from './components/DashboardView';
import { InboxView } from './components/InboxView';
import { TemplateBuilderView } from './components/TemplateBuilderView';
import { AIAgentStudioView } from './components/AIAgentStudioView';
import { ContactsView } from './components/contacts/ContactsView';
import { BroadcastsView } from './components/broadcasts/BroadcastsView';
import { AutomationsView } from './components/automations/AutomationsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthView } from './components/auth/AuthView';
import { LandingPageView } from './components/landing/LandingPageView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Workspace } from './types';

const DEFAULT_DEMO_WORKSPACE: Workspace = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Dressed Delights Ltd',
  slug: 'dressed-delights',
  industry: 'Retail & E-commerce',
  country: 'United States',
  phone_number: '+1 (555) 902-1144',
  quality_rating: 'GREEN',
  messaging_limit: '10,000',
  plan: 'Pro',
  usage_contacts: 4120,
  max_contacts: 10000,
  usage_ai_replies: 2840,
  max_ai_replies: 5000,
};

export const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'app' | 'landing' | 'auth' | 'onboarding'>('landing');
  const [currentTab, setCurrentTab] = useState('dashboard');
  // Track if user is in demo mode (no real session)
  const [isDemoMode, setIsDemoMode] = useState(false);

  const { workspace: dbWorkspace, loading: workspaceLoading, refetch: refetchWorkspace } = useWorkspace();

  // Active workspace: real DB workspace if signed in & loaded, otherwise demo workspace
  const activeWorkspace: Workspace = dbWorkspace || DEFAULT_DEMO_WORKSPACE;

  /**
   * Determines where to route an authenticated user:
   * - If they have a workspace with a waba_id → Dashboard
   * - If not → Onboarding Wizard (to connect Meta WhatsApp API)
   */
  const checkUserWorkspace = async (userId: string) => {
    try {
      // Step 1: get the user's profile to find their linked workspace
      const { data: profile } = await supabase
        .from('profiles')
        .select('workspace_id, workspaces(id, waba_id, phone_number)')
        .eq('id', userId)
        .maybeSingle();

      const ws = (profile as any)?.workspaces;

      // If their workspace has a connected WhatsApp account → go to dashboard
      if (ws?.waba_id) {
        setCurrentView('app');
        return;
      }

      // Step 2: if profile has a workspace_id but no waba_id in the join,
      // double-check the workspaces table directly (covers edge cases)
      if (profile?.workspace_id) {
        const { data: wsDirect } = await supabase
          .from('workspaces')
          .select('id, waba_id')
          .eq('id', profile.workspace_id)
          .maybeSingle();

        if (wsDirect?.waba_id) {
          setCurrentView('app');
          return;
        }
      }

      // No WhatsApp connected → guide through onboarding
      setCurrentView('onboarding');
    } catch {
      // On any error, send to onboarding so user can complete setup
      setCurrentView('onboarding');
    }
  };

  useEffect(() => {
    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserWorkspace(session.user.id);
      }
      setAuthLoading(false);
    });

    // 2. Listen for auth state changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) {
        if (event === 'SIGNED_IN') {
          setIsDemoMode(false);
          checkUserWorkspace(newSession.user.id);
        }
        refetchWorkspace();
      } else {
        // Signed out — only redirect if not in demo mode
        setIsDemoMode(prev => {
          if (!prev) setCurrentView('landing');
          return false;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchWorkspace]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDemoMode(false);
    setCurrentView('landing');
  };

  // Demo login: skip authentication, view the dashboard with demo data
  const handleDemoLogin = () => {
    setIsDemoMode(true);
    setCurrentView('app');
  };

  // Loading spinner while auth state resolves
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Initializing AutoWhatsApp AI...</p>
      </div>
    );
  }

  // ── LANDING PAGE ─────────────────────────────────────────────────────────────
  if (currentView === 'landing') {
    return (
      <LandingPageView
        onEnterApp={() => setCurrentView('auth')}
        onSignIn={() => setCurrentView('auth')}
      />
    );
  }

  // ── AUTH PAGE (Sign Up / Sign In) ────────────────────────────────────────────
  if (currentView === 'auth') {
    return (
      <AuthView
        onLoginSuccess={() => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              setIsDemoMode(false);
              checkUserWorkspace(user.id);
            } else {
              // Auth succeeded but no user returned — route to onboarding
              setCurrentView('onboarding');
            }
          });
          refetchWorkspace();
        }}
        onDemoLogin={handleDemoLogin}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // ── ONBOARDING WIZARD (Business Setup + Meta WABA Connection) ────────────────
  if (currentView === 'onboarding') {
    return (
      <OnboardingWizard
        onComplete={() => {
          refetchWorkspace();
          setCurrentView('app');
        }}
      />
    );
  }

  // ── CLIENT DASHBOARD (Authenticated + WABA Connected) ───────────────────────
  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      workspace={activeWorkspace}
      isDemoMode={isDemoMode}
      onSignOut={handleSignOut}
      onConnectWhatsApp={() => setCurrentView('onboarding')}
    >
      {currentTab === 'dashboard' && (
        <DashboardView
          workspace={activeWorkspace}
          onNavigate={(tab) => setCurrentTab(tab)}
          onConnectWhatsApp={() => setCurrentView('onboarding')}
        />
      )}

      {currentTab === 'inbox' && (
        <InboxView />
      )}

      {currentTab === 'templates' && (
        <TemplateBuilderView />
      )}

      {currentTab === 'contacts' && (
        <ContactsView />
      )}

      {currentTab === 'broadcasts' && (
        <BroadcastsView />
      )}

      {currentTab === 'automations' && (
        <AutomationsView />
      )}

      {currentTab === 'ai-agent' && (
        <AIAgentStudioView />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsView />
      )}

      {currentTab === 'settings' && (
        <SettingsView workspace={activeWorkspace} />
      )}
    </AppShell>
  );
};

export default App;
