import React, { useState } from 'react';
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
import { Workspace } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'app' | 'landing' | 'auth'>('app');
  const [currentTab, setCurrentTab] = useState('dashboard');

  const [workspace, setWorkspace] = useState<Workspace>({
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
  });

  if (currentView === 'landing') {
    return <LandingPageView onEnterApp={() => setCurrentView('app')} />;
  }

  if (currentView === 'auth') {
    return <AuthView onLoginSuccess={() => setCurrentView('app')} />;
  }

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      workspace={workspace}
      onViewLanding={() => setCurrentView('landing')}
      onViewAuth={() => setCurrentView('auth')}
    >
      {currentTab === 'dashboard' && (
        <DashboardView 
          workspace={workspace} 
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
        <SettingsView workspace={workspace} />
      )}
    </AppShell>
  );
};

export default App;
