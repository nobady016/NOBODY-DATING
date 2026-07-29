import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Send, Flame, X, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const MatchCelebrationModal: React.FC = () => {
  const { matchCelebration, closeMatchCelebration, currentUser, openChatWithMatch, matches, sendMessage } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isLoadingIcebreaker, setIsLoadingIcebreaker] = useState(false);

  useEffect(() => {
    if (matchCelebration) {
      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF4D6D', '#F59E0B', '#10B981', '#8B5CF6']
      });

      // Fetch AI Icebreakers from server endpoint
      fetchIcebreakers();
    }
  }, [matchCelebration]);

  const fetchIcebreakers = async () => {
    if (!matchCelebration) return;
    setIsLoadingIcebreaker(true);
    try {
      const res = await fetch('/api/ai/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchName: matchCelebration.name,
          matchBio: matchCelebration.bio,
          matchInterests: matchCelebration.interests,
          matchJob: matchCelebration.job,
          tone: 'Flirty, humorous, engaging'
        })
      });
      const data = await res.json();
      if (data.icebreakers) {
        setIcebreakers(data.icebreakers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingIcebreaker(false);
    }
  };

  if (!matchCelebration) return null;

  // Find match ID for chat trigger
  const matchedObj = matches.find(m => m.profile.id === matchCelebration.id);

  const handleSendQuickMessage = () => {
    if (matchedObj && messageInput.trim()) {
      sendMessage(matchedObj.id, messageInput.trim(), 'text');
      closeMatchCelebration();
      openChatWithMatch(matchedObj.id);
    } else if (matchedObj) {
      closeMatchCelebration();
      openChatWithMatch(matchedObj.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-[#121721] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={closeMatchCelebration}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest">
            <Flame className="w-3.5 h-3.5 fill-rose-500/20" />
            <span>It's a Match!</span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-purple-400">
            You and {matchCelebration.name}
          </h2>
          <p className="text-xs text-zinc-400">
            You both liked each other! Break the ice before it melts.
          </p>
        </div>

        {/* Dual Avatars with Pulsing Heart */}
        <div className="relative flex items-center justify-center py-4">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 to-amber-500 shadow-xl shadow-rose-500/30 -mr-4 z-10">
            <img
              src={currentUser.photos[0]}
              alt={currentUser.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg z-20 border-2 border-[#121721] animate-bounce">
            <Heart className="w-5 h-5 fill-white" />
          </div>

          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-rose-500 shadow-xl shadow-purple-500/30 -ml-4 z-10">
            <img
              src={matchCelebration.photos[0]}
              alt={matchCelebration.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* AI Icebreaker Suggestions */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Generated Openers</span>
            </span>
            {isLoadingIcebreaker && <span className="text-[10px] text-zinc-500">Generating...</span>}
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {icebreakers.map((line, idx) => (
              <button
                key={idx}
                onClick={() => setMessageInput(line)}
                className={`w-full text-left p-2.5 rounded-xl text-xs border transition ${
                  messageInput === line
                    ? 'bg-rose-500/20 border-rose-500/50 text-white'
                    : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                "{line}"
              </button>
            ))}
          </div>
        </div>

        {/* Quick Message Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder={`Say hi to ${matchCelebration.name}...`}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
          <button
            onClick={handleSendQuickMessage}
            className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold hover:opacity-90 transition shadow-lg shadow-rose-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={closeMatchCelebration}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline font-medium"
        >
          Keep Swiping
        </button>
      </motion.div>
    </div>
  );
};
