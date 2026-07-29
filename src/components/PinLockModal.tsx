import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Fingerprint, KeyRound, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const PinLockModal: React.FC = () => {
  const { isPinModalOpen, setIsPinModalOpen, verifyPinAndUnlock, ghostSettings } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  if (!isPinModalOpen) return null;

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + digit;
      setPinInput(newPin);
      if (newPin.length === 4) {
        const success = verifyPinAndUnlock(newPin);
        if (!success) {
          setErrorMsg(true);
          setTimeout(() => {
            setPinInput('');
            setErrorMsg(false);
          }, 800);
        }
      }
    }
  };

  const handleBiometricUnlock = () => {
    verifyPinAndUnlock(ghostSettings.pinCode || '1234');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 max-w-xs w-full text-center space-y-6 shadow-2xl relative"
      >
        <button
          onClick={() => setIsPinModalOpen(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-full bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-black border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37]">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-2xl font-serif italic text-white">Security Lock</h3>
          <p className="text-xs font-mono text-white/50 uppercase tracking-wider mt-1">Enter 4-digit PIN</p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border transition-all ${
                i < pinInput.length
                  ? errorMsg
                    ? 'bg-[#FF4E00] border-[#FF4E00] animate-bounce'
                    : 'bg-[#D4AF37] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/50'
                  : 'bg-white/5 border-white/20'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-[#FF4E00] font-mono uppercase tracking-wider animate-pulse">Incorrect PIN. Try again.</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[200px] mx-auto text-sm font-mono font-bold">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBiometricUnlock}
            className="w-14 h-14 rounded-full bg-black border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center hover:bg-white/5 transition"
            title="Biometric Sensor"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleClear}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition text-xs font-mono"
          >
            CLR
          </button>
        </div>
      </motion.div>
    </div>
  );
};
