import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DatingProfile } from '../types';
import {
  Heart,
  X,
  Star,
  RotateCcw,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Flag,
  ChevronLeft,
  Info,
  CheckCircle2,
  Volume2,
  Lock,
  Video
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

export const DiscoverSwipe: React.FC = () => {
  const {
    profilesStack,
    swipeLeft,
    swipeRight,
    superlike,
    rewindLastSwipe,
    resetSwipeStack,
    ghostSettings,
    reportUser,
    blockUser,
    setActiveTab
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState<Record<string, number>>({});
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<DatingProfile | null>(null);
  const [reportModalProfile, setReportModalProfile] = useState<DatingProfile | null>(null);
  const [reportReason, setReportReason] = useState<'fake_profile' | 'harassment' | 'inappropriate_content' | 'spam' | 'other'>('harassment');
  const [reportComment, setReportComment] = useState('');
  const [aiIcebreaker, setAiIcebreaker] = useState<string | null>(null);
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);

  const topProfile = profilesStack[0];

  const handleNextPhoto = (profileId: string, maxPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex(prev => ({
      ...prev,
      [profileId]: ((prev[profileId] || 0) + 1) % maxPhotos
    }));
  };

  const handlePrevPhoto = (profileId: string, maxPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex(prev => ({
      ...prev,
      [profileId]: ((prev[profileId] || 0) - 1 + maxPhotos) % maxPhotos
    }));
  };

  const handleGenerateIcebreaker = async (profile: DatingProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGeneratingIcebreaker(true);
    setAiIcebreaker(null);
    try {
      const res = await fetch('/api/ai/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchName: profile.name,
          matchBio: profile.bio,
          matchInterests: profile.interests,
          matchJob: profile.job
        })
      });
      const data = await res.json();
      if (data.icebreakers && data.icebreakers.length > 0) {
        setAiIcebreaker(data.icebreakers[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  const submitReport = () => {
    if (reportModalProfile) {
      reportUser(reportModalProfile.id, reportModalProfile.name, reportReason, reportComment);
      setReportModalProfile(null);
      setReportComment('');
    }
  };

  if (!topProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 animate-bounce">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">You've Seen Everyone Nearby!</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            You've explored all active profiles in your radius. Reset the stack to review them again or adjust Ghost Mode settings.
          </p>
        </div>
        <button
          onClick={resetSwipeStack}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-500/20 hover:scale-105 transition"
        >
          Reset Swipe Stack
        </button>
      </div>
    );
  }

  const currentPhotoIdx = activePhotoIndex[topProfile.id] || 0;

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-28 relative space-y-3">
      {/* Omegle Quick Video Chat Launch Banner */}
      <div
        onClick={() => setActiveTab('omegle')}
        className="bg-black/80 border border-[#FF4E00]/40 rounded-2xl p-3 flex items-center justify-between cursor-pointer hover:border-[#FF4E00] transition group shadow-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-full bg-[#FF4E00]/10 border border-[#FF4E00]/40 text-[#FF4E00] group-hover:scale-110 transition-transform">
            <Video className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-sm font-bold text-white">Omegle Random Video Chat</span>
              <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-ping" />
            </div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
              Instant 1-on-1 Video Match • 24,180 Online
            </span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#FF4E00] text-white font-mono text-[10px] font-bold uppercase tracking-wider group-hover:opacity-90 transition">
          Join Live ⚡
        </span>
      </div>

      {/* Swipe Stack Container */}
      <div className="relative h-[560px] w-full">
        <AnimatePresence>
          <motion.div
            key={topProfile.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, x: -200 }}
            className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-[#121721] shadow-2xl flex flex-col select-none"
          >
            {/* Top Photo & Carousel Nav */}
            <div className="relative flex-1 bg-[#050505] overflow-hidden group">
              <img
                src={topProfile.photos[currentPhotoIdx]}
                alt={topProfile.name}
                className="w-full h-full object-cover transition-transform duration-500"
              />

              {/* Top Photo Indicators */}
              <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 z-20">
                {topProfile.photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      idx === currentPhotoIdx ? 'bg-[#D4AF37] shadow-sm' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Photo Tap Controls */}
              <div
                onClick={e => handlePrevPhoto(topProfile.id, topProfile.photos.length, e)}
                className="absolute top-0 bottom-0 left-0 w-1/3 z-10 cursor-pointer"
              />
              <div
                onClick={e => handleNextPhoto(topProfile.id, topProfile.photos.length, e)}
                className="absolute top-0 bottom-0 right-0 w-1/3 z-10 cursor-pointer"
              />

              {/* Top Badges (Distance, Verified, Compatibility) */}
              <div className="absolute top-6 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono tracking-wider border border-white/10 uppercase">
                  <MapPin className="w-3 h-3 text-[#FF4E00]" />
                  <span>
                    {ghostSettings.locationBlur
                      ? `~${topProfile.distanceKm} km away`
                      : `${topProfile.distanceKm}km • ${topProfile.locationName}`}
                  </span>
                </div>

                {topProfile.compatibilityScore && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#00FF85]/10 backdrop-blur-md text-[#00FF85] text-[10px] font-mono border border-[#00FF85]/30 uppercase tracking-widest font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>{topProfile.compatibilityScore}% Match</span>
                  </div>
                )}
              </div>

              {/* Gradient Bottom Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />

              {/* Card Footer Info with Editorial Typography */}
              <div className="absolute bottom-3 left-4 right-4 z-20 space-y-2 pointer-events-auto">
                <div className="flex items-end justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-4xl sm:text-5xl font-serif italic text-white leading-none">
                      {topProfile.name},{' '}
                      <span className="text-[#D4AF37] font-serif not-italic">{topProfile.age}</span>
                    </h2>
                    <p className="text-xs text-white/60 tracking-wide line-clamp-1">
                      {topProfile.bio}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProfileDetail(topProfile)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition shrink-0"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {/* Pill Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-wider text-white/80 font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-[#D4AF37]" />
                    <span>{topProfile.job}</span>
                  </span>
                  {topProfile.interests.slice(0, 3).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-wider text-white/80 font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* AI Opener Trigger */}
                <div className="pt-1">
                  <button
                    onClick={e => handleGenerateIcebreaker(topProfile, e)}
                    className="w-full py-1.5 px-3 rounded-full bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 text-white/90 text-[10px] uppercase tracking-widest font-mono flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>{isGeneratingIcebreaker ? 'Generating Opener...' : 'AI Icebreaker Opener'}</span>
                  </button>

                  {aiIcebreaker && (
                    <div className="mt-2 p-2.5 rounded-2xl bg-[#0a0a14] border border-[#D4AF37]/30 text-xs text-zinc-200 italic font-serif">
                      "{aiIcebreaker}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Editorial Swipe Action Controls */}
      <div className="flex items-center justify-between gap-3 mt-6">
        {/* Rewind */}
        <button
          onClick={rewindLastSwipe}
          className="w-12 h-12 rounded-full border border-white/20 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          title="Rewind Last Swipe"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Pass (Dislike) */}
        <button
          onClick={() => swipeLeft(topProfile.id)}
          className="w-14 h-14 rounded-full border border-[#FF4E00]/40 text-[#FF4E00] hover:bg-[#FF4E00]/10 flex items-center justify-center transition-colors shrink-0"
          title="Pass"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Connect Emotionally (Like) - Gold Pill */}
        <button
          onClick={() => swipeRight(topProfile.id)}
          className="flex-1 h-[54px] bg-[#D4AF37] text-black rounded-full flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform shadow-xl shadow-[#D4AF37]/10"
          title="Connect Emotionally"
        >
          <Heart className="w-4 h-4 fill-black" />
          <span>Connect</span>
        </button>

        {/* Super Like */}
        <button
          onClick={() => superlike(topProfile.id)}
          className="w-14 h-14 rounded-full border border-sky-400/40 text-sky-400 hover:bg-sky-400/10 flex items-center justify-center transition-colors shrink-0"
          title="Super Like"
        >
          <Star className="w-5 h-5 fill-sky-400/20" />
        </button>
      </div>

      {/* Profile Full Detail Modal */}
      {selectedProfileDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-[#121721] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 text-left shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedProfileDetail(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photos Carousel */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{selectedProfileDetail.name}, {selectedProfileDetail.age}</h2>
                {selectedProfileDetail.isVerified && <ShieldCheck className="w-5 h-5 text-sky-400" />}
              </div>
              <p className="text-xs text-zinc-400">{selectedProfileDetail.job} • {selectedProfileDetail.education}</p>

              <div className="grid grid-cols-2 gap-2">
                {selectedProfileDetail.photos.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-full h-40 object-cover rounded-2xl border border-white/5"
                  />
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">About Me</h3>
              <p className="text-sm text-zinc-200 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5">
                {selectedProfileDetail.bio}
              </p>
            </div>

            {/* Relationship Goals */}
            <div className="bg-gradient-to-r from-purple-950/40 to-rose-950/40 p-3.5 rounded-2xl border border-purple-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider block">Relationship Goal</span>
                <span className="text-sm font-bold text-white">{selectedProfileDetail.relationshipGoal}</span>
              </div>
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />
            </div>

            {/* AI Compatibility Breakdown */}
            {selectedProfileDetail.compatibilityReasons && (
              <div className="bg-[#1B132B] p-4 rounded-2xl border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Compatibility Analysis</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{selectedProfileDetail.compatibilityScore}%</span>
                </div>
                <p className="text-xs text-purple-200/80 italic">{selectedProfileDetail.vibeSummary}</p>
                <ul className="space-y-1 pt-1">
                  {selectedProfileDetail.compatibilityReasons.map((r, i) => (
                    <li key={i} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lifestyle Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lifestyle & Details</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedProfileDetail.lifestyle).map(([key, val]) => (
                  <div key={key} className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 capitalize block">{key}</span>
                    <span className="font-semibold text-zinc-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Options */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setReportModalProfile(selectedProfileDetail)}
                className="text-xs text-rose-400 flex items-center gap-1.5 font-semibold hover:underline"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report or Block Profile</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Safety Report Modal */}
      {reportModalProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Report {reportModalProfile.name}</h3>
            <p className="text-xs text-zinc-400">Help us keep NOBADY safe and respectful.</p>

            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="harassment">Harassment or Abuse</option>
              <option value="fake_profile">Fake Profile or Impersonation</option>
              <option value="inappropriate_content">Inappropriate Content/Photos</option>
              <option value="spam">Spam or Commercial Promotion</option>
              <option value="other">Other</option>
            </select>

            <textarea
              value={reportComment}
              onChange={e => setReportComment(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setReportModalProfile(null)}
                className="flex-1 py-2 bg-white/10 text-zinc-300 font-bold rounded-xl text-xs hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="flex-1 py-2 bg-rose-500 text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition"
              >
                Submit & Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
