import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageCircle,
  Search,
  Lock,
  EyeOff,
  Flame,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const MatchesView: React.FC = () => {
  const { matches, openChatWithMatch, ghostSettings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = matches.filter(m =>
    m.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.profile.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 pb-28 space-y-6">
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
  );
};
