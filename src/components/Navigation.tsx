import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  MessageCircle,
  EyeOff,
  User,
  ShieldCheck,
  Lock,
  Video
} from 'lucide-react';
import { motion } from 'motion/react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, ghostSettings, matches, setIsPinModalOpen } = useApp();

  const totalUnread = matches.reduce((acc, m) => acc + m.unreadCount, 0);

  return (
    <>
      {/* Top Editorial Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-md md:max-w-xl mx-auto flex items-end justify-between">
          {/* Brand & Editorial Eyebrow */}
          <div
            onClick={() => setActiveTab('discover')}
            className="flex flex-col cursor-pointer group select-none"
          >
            <span className="text-[9px] uppercase tracking-[0.35em] text-white/40 font-semibold mb-0.5">
              The Future of Connection
            </span>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="NOBODY Logo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-[#FF4E00]/50 shadow-lg group-hover:scale-105 transition-transform"
              />
              <h1 className="text-3xl font-serif italic tracking-tighter leading-none text-white group-hover:text-[#D4AF37] transition-colors">
                NOBODY
              </h1>
              <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30">
                100% Free
              </span>
            </div>
          </div>

          {/* Identity Status & Quick Actions */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => setActiveTab('ghost')}
              className="flex flex-col items-end cursor-pointer group"
            >
              <span className="text-[9px] uppercase tracking-widest text-white/50 mb-0.5 font-mono">
                Identity Status
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20 transition">
                <div className={`w-2 h-2 rounded-full ${ghostSettings.alwaysInvisible ? 'bg-purple-400 animate-pulse' : 'bg-[#00FF85] animate-pulse'}`} />
                <span className="text-[10px] font-mono tracking-tight uppercase text-white/90">
                  {ghostSettings.alwaysInvisible ? 'Ghost Mode ON' : 'Stealth Active'}
                </span>
              </div>
            </div>

            {/* Quick Security Lock */}
            {ghostSettings.chatLockEnabled && (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 transition"
                title="Lock App"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Editorial Bottom Navigation */}
      <nav className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-md md:max-w-xl mx-auto pointer-events-auto">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full h-16 flex items-center justify-between px-6 shadow-2xl">
            {/* Discover */}
            <button
              onClick={() => setActiveTab('discover')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'discover'
                  ? 'text-[#D4AF37]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
              {activeTab === 'discover' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Omegle Video Chat */}
            <button
              onClick={() => setActiveTab('omegle')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'omegle'
                  ? 'text-[#FF4E00]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <div className="relative">
                <Video className="w-4 h-4 text-[#FF4E00]" />
                <span className="absolute -top-1 -right-1.5 bg-[#FF4E00] w-2 h-2 rounded-full animate-ping" />
              </div>
              <span className="hidden sm:inline">Omegle</span>
              {activeTab === 'omegle' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#FF4E00]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Matches */}
            <button
              onClick={() => setActiveTab('matches')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'matches' || activeTab === 'chat'
                  ? 'text-[#D4AF37]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <div className="relative">
                <MessageCircle className="w-4 h-4" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#FF4E00] text-white text-[9px] font-mono font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Matches</span>
              {(activeTab === 'matches' || activeTab === 'chat') && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Ghost Mode */}
            <button
              onClick={() => setActiveTab('ghost')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'ghost'
                  ? 'text-[#D4AF37]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span className="hidden sm:inline">Ghost</span>
              {activeTab === 'ghost' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'profile'
                  ? 'text-[#D4AF37]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Admin */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === 'admin'
                  ? 'text-[#D4AF37]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
              {activeTab === 'admin' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
