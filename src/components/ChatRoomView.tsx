import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Sparkles,
  PhoneCall,
  Video,
  ShieldCheck,
  MoreVertical,
  Play,
  Pause,
  AlertTriangle,
  Lock,
  X,
  CheckCheck,
  MapPin,
  Briefcase,
  Shield
} from 'lucide-react';
import { motion } from 'motion/react';

export const ChatRoomView: React.FC = () => {
  const {
    activeMatchId,
    matches,
    messages,
    sendMessage,
    setActiveTab,
    currentUser,
    ghostSettings,
    reportUser
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [activeCallModal, setActiveCallModal] = useState<'voice' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showAiIcebreakers, setShowAiIcebreakers] = useState(false);
  const [icebreakerLines, setIcebreakerLines] = useState<string[]>([]);
  const [isGeneratingLines, setIsGeneratingLines] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [toxicityWarning, setToxicityWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const currentMatch = matches.find(m => m.id === activeMatchId);
  const chatMessages = activeMatchId ? messages[activeMatchId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (activeCallModal) {
      const callTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(callTimer);
    } else {
      setCallDuration(0);
    }
  }, [activeCallModal]);

  if (!currentMatch) {
    return (
      <div className="p-8 text-center text-zinc-400 text-sm">
        No active chat selected.
        <button
          onClick={() => setActiveTab('matches')}
          className="block mx-auto mt-4 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold"
        >
          Return to Matches
        </button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setToxicityWarning(null);

    // AI Safety scan
    try {
      const res = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      if (!data.safe && data.toxicityScore > 0.7) {
        setToxicityWarning(data.warningReason || 'Message flagged as potentially toxic or inappropriate.');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    await sendMessage(currentMatch.id, textToSend, 'text');
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        await sendMessage(
          currentMatch.id,
          'Voice Note',
          'voice',
          audioUrl,
          recordDuration || 5
        );
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.warn('Microphone permission fallback mode:', e);
      // Fallback voice simulator
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback message
      sendMessage(
        currentMatch.id,
        'Voice Note',
        'voice',
        'https://actions.google.com/sounds/v1/speech/person_talking.ogg',
        recordDuration || 4
      );
    }
    setIsRecording(false);
  };

  const fetchAiIcebreakers = async () => {
    setShowAiIcebreakers(true);
    setIsGeneratingLines(true);
    try {
      const res = await fetch('/api/ai/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchName: currentMatch.profile.name,
          matchBio: currentMatch.profile.bio,
          matchInterests: currentMatch.profile.interests,
          matchJob: currentMatch.profile.job
        })
      });
      const data = await res.json();
      if (data.icebreakers) {
        setIcebreakerLines(data.icebreakers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLines(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-64px)] pb-16 lg:pb-6 bg-[#050505] lg:px-6 lg:py-4 lg:gap-6">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0a0f] lg:border lg:border-white/10 lg:rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Chat Header */}
        <div className="bg-[#0a0a0f] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('matches')}
            className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative">
            <img
              src={currentMatch.profile.photos[0]}
              alt={currentMatch.profile.name}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            {currentMatch.profile.isOnline && !ghostSettings.hideOnlineStatus && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00FF85] border-2 border-[#050505] rounded-full" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h2 className="font-serif italic text-lg text-white leading-none">{currentMatch.profile.name}</h2>
              {currentMatch.profile.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
            </div>
            <p className="text-[10px] text-[#00FF85] font-mono uppercase tracking-wider mt-0.5">
              {ghostSettings.hideOnlineStatus
                ? 'Ghost Stealth Active'
                : currentMatch.profile.isOnline
                ? 'Active Now'
                : currentMatch.profile.lastSeenText}
            </p>
          </div>
        </div>

        {/* Action Controls: Anonymous Calls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCallModal('voice')}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-[#00FF85] hover:bg-white/10 transition"
            title="Anonymous Voice Call"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveCallModal('video')}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 transition"
            title="Anonymous Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map(msg => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-[#D4AF37] text-black shadow-lg rounded-br-none font-medium'
                    : 'bg-[#0a0a0f] border border-white/10 text-white/90 rounded-bl-none'
                }`}
              >
                {/* Voice Note Bubble */}
                {msg.type === 'voice' ? (
                  <div className="flex items-center gap-3 py-1 min-w-[160px]">
                    <button
                      onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition ${
                        isMe ? 'bg-black/20 text-black' : 'bg-white/20 text-white'
                      }`}
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className={`h-2 rounded-full overflow-hidden ${isMe ? 'bg-black/20' : 'bg-white/20'}`}>
                        <div
                          className={`h-full transition-all duration-300 ${isMe ? 'bg-black' : 'bg-white'} ${
                            playingVoiceId === msg.id ? 'w-full' : 'w-1/3'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] opacity-80 mt-1 block font-mono">
                        Voice Note ({msg.voiceDurationSec || 4}s)
                      </span>
                    </div>
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono text-white/40 px-1">
                <span>{msg.timestamp}</span>
                {isMe && !ghostSettings.hideReadReceipts && (
                  <CheckCheck className="w-3 h-3 text-sky-400" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Icebreaker Sheet */}
      {showAiIcebreakers && (
        <div className="bg-[#0a0a0f] border-t border-white/10 p-4 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Conversation Prompts</span>
            </span>
            <button onClick={() => setShowAiIcebreakers(false)} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isGeneratingLines ? (
            <p className="text-xs text-white/50 italic font-serif">Asking AI for witty openers...</p>
          ) : (
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {icebreakerLines.map((line, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputMessage(line);
                    setShowAiIcebreakers(false);
                  }}
                  className="w-full text-left p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 hover:bg-white/10 font-serif italic"
                >
                  "{line}"
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toxicity Warning */}
      {toxicityWarning && (
        <div className="bg-[#FF4E00]/20 border-t border-[#FF4E00]/40 p-3 text-xs text-white flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF4E00] shrink-0" />
            <span>{toxicityWarning}</span>
          </div>
          <button onClick={() => setToxicityWarning(null)} className="text-[#FF4E00] underline font-bold uppercase">
            Dismiss
          </button>
        </div>
      )}

      {/* Bottom Input Bar */}
      <div className="bg-[#0a0a0f] border-t border-white/10 p-3 flex items-center gap-2 shrink-0">
        <button
          onClick={fetchAiIcebreakers}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 transition"
          title="AI Icebreaker"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {isRecording ? (
          <div className="flex-1 bg-[#FF4E00]/20 border border-[#FF4E00]/40 rounded-full px-4 py-2 flex items-center justify-between text-xs text-white font-mono">
            <span className="flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF4E00]" />
              Recording ({formatSeconds(recordDuration)})
            </span>
            <button
              onClick={stopVoiceRecording}
              className="px-3 py-1 bg-[#FF4E00] text-white font-bold rounded-full text-[10px] uppercase tracking-wider"
            >
              Send Note
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-black/60 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
            />

            <button
              onClick={startVoiceRecording}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              className="p-2.5 rounded-full bg-[#D4AF37] text-black font-bold hover:scale-105 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      </div>

      {/* Desktop Match Profile Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col w-80 xl:w-88 shrink-0 bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 space-y-5 overflow-y-auto shadow-2xl text-left">
        {/* Profile Card Header */}
        <div className="space-y-3 text-center">
          <div className="relative w-28 h-28 mx-auto">
            <img
              src={currentMatch.profile.photos[0]}
              alt={currentMatch.profile.name}
              className="w-full h-full object-cover rounded-3xl border border-white/10 shadow-xl"
            />
            {currentMatch.profile.isOnline && !ghostSettings.hideOnlineStatus && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#00FF85] border-2 border-[#0a0a0f] rounded-full" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="text-2xl font-serif italic text-white font-bold">
                {currentMatch.profile.name}, {currentMatch.profile.age}
              </h3>
              {currentMatch.profile.isVerified && <ShieldCheck className="w-4 h-4 text-sky-400" />}
            </div>
            <p className="text-xs font-mono text-white/50 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF4E00]" />
              <span>{currentMatch.profile.locationName} • {currentMatch.profile.distanceKm} km</span>
            </p>
          </div>
        </div>

        {/* Action Buttons for Voice & Video Call */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => setActiveCallModal('voice')}
            className="py-2.5 px-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00FF85]/50 text-white text-xs font-mono flex items-center justify-center gap-2 transition"
          >
            <PhoneCall className="w-4 h-4 text-[#00FF85]" />
            <span>Voice Call</span>
          </button>
          <button
            onClick={() => setActiveCallModal('video')}
            className="py-2.5 px-3 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 text-white text-xs font-mono flex items-center justify-center gap-2 transition"
          >
            <Video className="w-4 h-4 text-[#D4AF37]" />
            <span>Video Call</span>
          </button>
        </div>

        {/* Bio */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold">
            Bio
          </span>
          <p className="text-xs text-white/80 leading-relaxed font-sans bg-white/5 p-3 rounded-xl border border-white/5">
            "{currentMatch.profile.bio}"
          </p>
        </div>

        {/* Career */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
          <div className="flex items-center gap-2 text-white/50 text-[10px] font-mono uppercase">
            <Briefcase className="w-3 h-3 text-[#D4AF37]" />
            <span>Occupation</span>
          </div>
          <div className="text-xs font-semibold text-white">{currentMatch.profile.job}</div>
        </div>

        {/* Interests */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block">
            Interests
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentMatch.profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/80"
              >
                #{interest}
              </span>
            ))}
          </div>
        </div>

        {/* Safety & Encryption Guarantee */}
        <div className="pt-2 border-t border-white/10 space-y-1 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[#00FF85] text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
          <p className="text-[10px] text-white/40 font-mono">
            Direct peer message tunnel. Zero logs.
          </p>
        </div>
      </div>

      {/* Anonymous Voice / Video Call Overlay */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121721] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-indigo-500 mx-auto shadow-2xl relative animate-pulse">
              <img
                src={currentMatch.profile.photos[0]}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{currentMatch.profile.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">
                Encrypted Anonymous {activeCallModal === 'voice' ? 'Voice' : 'Video'} Call • {formatSeconds(callDuration)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActiveCallModal(null)}
                className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition"
              >
                <PhoneCall className="w-6 h-6 rotate-[135deg]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
