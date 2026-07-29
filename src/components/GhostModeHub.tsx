import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  EyeOff,
  Shield,
  Lock,
  MapPin,
  PhoneCall,
  Video,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';

export const GhostModeHub: React.FC = () => {
  const { ghostSettings, updateGhostSetting } = useApp();

  const [pinInput, setPinInput] = useState(ghostSettings.pinCode || '1234');
  const [showPinChange, setShowPinChange] = useState(false);
  const [testCallOpen, setTestCallOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  const handleSavePin = () => {
    if (pinInput.length >= 4) {
      updateGhostSetting('pinCode', pinInput);
      setShowPinChange(false);
    }
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Editorial Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a0a12] p-6 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#7000FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block mb-1">
              Signature Privacy Suite
            </span>
            <h1 className="text-3xl font-serif italic text-white leading-none">Ghost Mode</h1>
            <p className="text-xs text-white/60 mt-2 leading-relaxed max-w-xs">
              Complete stealth and control over your presence, distance, and messaging privacy.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Master Always Invisible Toggle */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm text-white block">Always Invisible Mode</span>
            <span className="text-[11px] text-white/50">
              Browse profiles without leaving a trace or appearing in stacks
            </span>
          </div>
          <button
            onClick={() => updateGhostSetting('alwaysInvisible', !ghostSettings.alwaysInvisible)}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
              ghostSettings.alwaysInvisible ? 'bg-[#D4AF37] justify-end' : 'bg-white/20 justify-start'
            }`}
          >
            <motion.div
              layout
              className="w-4 h-4 rounded-full bg-black shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Visibility & Presence Section */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
          <EyeOff className="w-4 h-4" />
          <span>Presence & Stealth Settings</span>
        </h2>

        <div className="space-y-3">
          {/* Hide Online Status */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-white">Hide Online Status</p>
              <p className="text-xs text-white/50">Never show green active dot to matches</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.hideOnlineStatus}
              onChange={e => updateGhostSetting('hideOnlineStatus', e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>

          {/* Hide Last Seen */}
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Hide Last Seen</p>
              <p className="text-xs text-white/50">Suppress last seen timestamps on chats</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.hideLastSeen}
              onChange={e => updateGhostSetting('hideLastSeen', e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>

          {/* Hide Typing Indicator */}
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Hide Typing Indicator</p>
              <p className="text-xs text-white/50">Don't reveal when you are typing a reply</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.hideTypingIndicator}
              onChange={e => updateGhostSetting('hideTypingIndicator', e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>

          {/* Hide Read Receipts */}
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Hide Read Receipts</p>
              <p className="text-xs text-white/50">Keep read checks invisible to senders</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.hideReadReceipts}
              onChange={e => updateGhostSetting('hideReadReceipts', e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Location & Discovery Blur */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF4E00] flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Location & Discovery Fuzzing</span>
        </h2>

        <div className="space-y-3">
          {/* Location Blur */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-white">Location Distance Blur</p>
              <p className="text-xs text-white/50">Shows approximate distance (e.g., "~3 km away")</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.locationBlur}
              onChange={e => updateGhostSetting('locationBlur', e.target.checked)}
              className="w-5 h-5 accent-[#FF4E00] rounded cursor-pointer"
            />
          </div>

          {/* Invisible Browsing */}
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Invisible Profile Browsing</p>
              <p className="text-xs text-white/50">View cards without appearing in their history</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.invisibleBrowsing}
              onChange={e => updateGhostSetting('invisibleBrowsing', e.target.checked)}
              className="w-5 h-5 accent-[#FF4E00] rounded cursor-pointer"
            />
          </div>

          {/* Private Likes */}
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <div>
              <p className="text-sm font-medium text-white">Private Secret Likes</p>
              <p className="text-xs text-white/50">Your likes stay hidden until mutual match</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.privateLikes}
              onChange={e => updateGhostSetting('privateLikes', e.target.checked)}
              className="w-5 h-5 accent-[#FF4E00] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Security & Chat Lock */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>Chat Security & Biometric Lock</span>
        </h2>

        <div className="space-y-3">
          {/* Lock Private Chats */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-white">Lock Private Matches</p>
              <p className="text-xs text-white/50">Require PIN or Biometrics to open chat</p>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.chatLockEnabled}
              onChange={e => updateGhostSetting('chatLockEnabled', e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>

          {/* Biometric Toggle */}
          <div className="flex items-center justify-between py-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
              <div>
                <p className="text-sm font-medium text-white">Biometric Touch/Face ID</p>
                <p className="text-xs text-white/50">Use device sensor simulation</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={ghostSettings.biometricLockEnabled}
              onChange={e => updateGhostSetting('biometricLockEnabled', e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>

          {/* PIN Setup */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-white/60 font-medium">Security PIN:</span>
              <span className="text-xs font-mono text-[#D4AF37] ml-2 font-bold">••••</span>
            </div>
            <button
              onClick={() => setShowPinChange(!showPinChange)}
              className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] hover:bg-white/10 transition font-mono uppercase tracking-wider"
            >
              {showPinChange ? 'Cancel' : 'Change PIN'}
            </button>
          </div>

          {showPinChange && (
            <div className="pt-2 flex items-center gap-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="4-digit PIN"
                className="w-32 bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-center font-mono text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={handleSavePin}
                className="px-4 py-1.5 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#D4AF37]/90 transition"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Anonymous Calling Feature */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#00FF85]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00FF85]">
              Anonymous Voice & Video Call
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00FF85]/10 border border-[#00FF85]/30 text-[#00FF85] font-mono uppercase">
            Encrypted
          </span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          Call matches directly over secure peer connections without revealing phone numbers or social handles.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              setCallType('voice');
              setTestCallOpen(true);
            }}
            className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#00FF85] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-white/10 transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Voice Call</span>
          </button>
          <button
            onClick={() => {
              setCallType('video');
              setTestCallOpen(true);
            }}
            className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-white/10 transition"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Call</span>
          </button>
        </div>
      </div>

      {/* Test Call Modal */}
      {testCallOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mx-auto relative animate-pulse text-[#D4AF37]">
              <Shield className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-serif italic text-white">
                Anonymous {callType === 'voice' ? 'Voice' : 'Video'} Channel
              </h3>
              <p className="text-xs text-[#00FF85] font-mono mt-1 uppercase tracking-widest">End-to-End Encrypted</p>
            </div>

            <div className="bg-black/60 p-3.5 rounded-2xl text-left text-xs text-white/70 space-y-1.5 font-mono border border-white/5">
              <p>⚡ Session ID: {Math.random().toString(36).substring(2, 9)}</p>
              <p>🛡️ IP Masking: Active (Cloud Relay)</p>
              <p>🎭 Audio Voice Shift: Warm Editorial Filter</p>
            </div>

            <button
              onClick={() => setTestCallOpen(false)}
              className="w-full py-3 bg-[#FF4E00] text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#FF4E00]/90 transition"
            >
              End Call
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
