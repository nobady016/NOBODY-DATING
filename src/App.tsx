import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { FreeBanner } from './components/FreeBanner';
import { DiscoverSwipe } from './components/DiscoverSwipe';
import { MatchesView } from './components/MatchesView';
import { ChatRoomView } from './components/ChatRoomView';
import { GhostModeHub } from './components/GhostModeHub';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { OmegleView } from './components/OmegleView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AuthLoginScreen } from './components/AuthLoginScreen';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import { PinLockModal } from './components/PinLockModal';

const MainAppContent: React.FC = () => {
  const { isLoggedIn, isOnboardingComplete, activeTab } = useApp();

  if (!isLoggedIn) {
    return <AuthLoginScreen />;
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Editorial Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[#FF4E00] rounded-full mix-blend-screen blur-[140px] opacity-25" />
        <div className="absolute top-1/2 -right-1/4 w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-[#7000FF] rounded-full mix-blend-screen blur-[120px] opacity-20" />
      </div>

      {/* Navigation Header */}
      <div className="relative z-20">
        <Navigation />
      </div>

      {/* 100% Free Guarantee Banner */}
      <div className="relative z-10">
        <FreeBanner />
      </div>

      {/* Main Tab Router View */}
      <main className="flex-1 w-full max-w-md md:max-w-xl mx-auto relative z-10">
        {activeTab === 'discover' && <DiscoverSwipe />}
        {activeTab === 'omegle' && <OmegleView />}
        {activeTab === 'matches' && <MatchesView />}
        {activeTab === 'chat' && <ChatRoomView />}
        {activeTab === 'ghost' && <GhostModeHub />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Overlays */}
      <MatchCelebrationModal />
      <PinLockModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
