import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const FreeBanner: React.FC = () => {
  return (
    <div className="bg-white/5 backdrop-blur-md border-y border-white/10 px-4 py-2 text-[11px] text-white/80 flex items-center justify-between overflow-x-auto select-none tracking-wide">
      <div className="flex items-center gap-2 font-medium whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
        <span className="text-[#D4AF37] font-semibold uppercase tracking-wider text-[10px]">100% Free Guarantee:</span>
        <span className="text-white/60 text-[11px]">Unlimited Swipes • Incognito Ghost Mode • Free Voice Notes</span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#00FF85] font-mono uppercase tracking-widest shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>All Unlocked</span>
      </div>
    </div>
  );
};
