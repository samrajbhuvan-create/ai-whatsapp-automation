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

  const { workspace: dbWorkspace, loading: workspaceLoading, refetch: refetchWorkspace } = useWorkspace();

  // Active workspace: real DB workspace if signed in & loaded, otherwise demo workspace
  const activeWorkspace: Workspace = dbWorkspace || DEFAULT_DEMO_WORKSPACE;


  const checkUserWorkspace = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('workspace_id, workspaces(id, waba_id, phone_number)')
        .eq('id', userId)
        .maybeSingle();

      const ws = (profile as any)?.workspaces;
      if (ws?.waba_id) {
        setCurrentView('app');
      } else {
        // Fallback check directly in workspaces table
        const { data: wsDirect } = await supabase
          .from('workspaces')
          .select('id, waba_id')
          .eq('id', userId)
          .maybeSingle();

        if (wsDirect?.waba_id) {
          setCurrentView('app');
        } else {
          setCurrentView('onboarding');
        }
      }
    } catch {
      setCurrentView('onboarding');
    }
  };

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkUserWorkspace(session.user.id);
      }
      setAuthLoading(false);
    });

    // 2. Auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) {
        if (event === 'SIGNED_IN') {
          checkUserWorkspace(newSession.user.id);
        }
        refetchWorkspace();
      } else {
        setCurrentView('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchWorkspace]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentView('landing');
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Initializing AutoWhatsApp AI...</p>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPageView
        onEnterApp={() => setCurrentView('app')}
        onSignIn={() => setCurrentView('auth')}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthView
        onLoginSuccess={() => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              checkUserWorkspace(user.id);
            } else {
              setCurrentView('app');
            }
          });
          refetchWorkspace();
        }}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

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

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      workspace={activeWorkspace}
      onViewLanding={() => setCurrentView('landing')}
      onViewAuth={() => setCurrentView('auth')}
      onViewOnboarding={() => setCurrentView('onboarding')}
    >
      {currentTab === 'dashboard' && (
        <DashboardView 
          workspace={activeWorkspace} 
          onNavigate={(tab) => setCurrentTab(tab)} 
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
