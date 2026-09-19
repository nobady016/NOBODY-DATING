import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  Search,
  Lock,
  EyeOff,
  Flame,
  ShieldCheck,
  Sparkles,
  Video,
  Shield,
  Heart
} from 'lucide-react';

export const MatchesView: React.FC = () => {
  const { matches, openChatWithMatch, ghostSettings, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = matches.filter(m =>
    m.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profile.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-28 lg:pb-12 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Matches & Conversations list */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Search Header */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-full pl-11 pr-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] transition font-mono"
            />
          </div>

          {/* New Matches Row */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF4E00]" />
                <span>New Matches ({matches.length})</span>
              </h2>
              <span className="text-[10px] font-mono text-white/40 uppercase">100% Free</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {matches.map(m => (
                <div
                  key={m.id}
                  onClick={() => openChatWithMatch(m.id)}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#FF4E00] via-[#D4AF37] to-white group-hover:scale-105 transition-transform">
                      <img
                        src={m.profile.photos[0]}
                        alt={m.profile.name}
                        className="w-full h-full object-cover rounded-full border-2 border-[#050505]"
                      />
                    </div>
                    {m.profile.isOnline && !ghostSettings.hideOnlineStatus && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00FF85] border-2 border-[#050505] rounded-full" />
                    )}
                    {m.isSecretMatch && (
                      <span className="absolute -top-1 -right-1 p-1 bg-black border border-[#D4AF37] rounded-full text-[#D4AF37]">
                        <EyeOff className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-serif italic text-white group-hover:text-[#D4AF37] transition">
                    {m.profile.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>Conversations</span>
            </h2>

            <div className="space-y-2">
              {filteredMatches.length === 0 ? (
                <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-6 text-center text-white/40 text-xs font-mono">
                  No connections match your query.
                </div>
              ) : (
                filteredMatches.map(m => (
                  <div
                    key={m.id}
                    onClick={() => openChatWithMatch(m.id)}
                    className="bg-[#0a0a0f] hover:bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={m.profile.photos[0]}
                          alt={m.profile.name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                        {m.isPrivateChatLocked && (
                          <span className="absolute -bottom-1 -right-1 bg-black border border-[#D4AF37] p-1 rounded-full text-[#D4AF37]">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="text-left space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif italic text-lg text-white group-hover:text-[#D4AF37] transition leading-none">
                            {m.profile.name}
                          </span>
                          {m.profile.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-sky-400" />
                          )}
                          {m.isSecretMatch && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-black text-[#D4AF37] border border-[#D4AF37]/40 font-mono uppercase">
                              Secret
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 line-clamp-1">
                          {m.lastMessage || 'Connected! Say hi...'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1 shrink-0">
                      <span className="text-[10px] font-mono text-white/40">{m.lastMessageTime}</span>
                      {m.unreadCount > 0 && (
                        <span className="bg-[#FF4E00] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full block w-fit ml-auto">
                          {m.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Desktop Connection Hub Placeholder (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col bg-[#0a0a10] border border-white/10 rounded-3xl p-8 items-center justify-center text-center space-y-6 min-h-[540px] shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF4E00]/20 via-[#D4AF37]/20 to-[#00FF85]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-xl">
            <MessageCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-serif italic text-white font-bold">
              Select a Connection to Chat
            </h3>
            <p className="text-xs text-white/60 font-mono leading-relaxed">
              Click on any match from the list to exchange secure peer-to-peer messages, send HD voice notes, or initiate a private video call.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-lg text-left">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-1">
              <Shield className="w-4 h-4 text-[#00FF85]" />
              <div className="text-[11px] font-mono text-white font-bold uppercase">Encrypted</div>
              <div className="text-[10px] text-white/50">End-to-end secured chat rooms</div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-1">
              <EyeOff className="w-4 h-4 text-[#D4AF37]" />
              <div className="text-[11px] font-mono text-white font-bold uppercase">Stealth</div>
              <div className="text-[10px] text-white/50">Incognito mode & PIN lock</div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <div className="text-[11px] font-mono text-white font-bold uppercase">100% Free</div>
              <div className="text-[10px] text-white/50">Zero message limits or paywalls</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('omegle')}
              className="px-6 py-3 rounded-full bg-[#FF4E00] text-white font-mono font-bold text-xs uppercase tracking-widest hover:scale-105 transition flex items-center gap-2 shadow-xl shadow-[#FF4E00]/20"
            >
              <Video className="w-4 h-4" />
              <span>Launch Omegle Video Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
