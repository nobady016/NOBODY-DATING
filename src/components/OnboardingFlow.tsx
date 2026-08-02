import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import appLogo from '../assets/images/nobody_heart_logo_1785665535054.jpg';
import { DatingProfile, Gender, RelationshipGoal } from '../types';
import {
  Flame,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Heart,
  MapPin,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000'
];

const INTEREST_OPTIONS = [
  'UI/UX Design', 'Specialty Coffee', 'Indie Music', 'Vinyl Records',
  'City Photography', 'Fitness', 'Hiking', 'Artificial Intelligence',
  'Italian Cuisine', 'Jazz', 'Bouldering', 'Stargazing', 'Travel'
];

export const OnboardingFlow: React.FC = () => {
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('Alex');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'woman' | 'man' | 'non-binary'>('man');
  const [interestedIn, setInterestedIn] = useState<Gender>('woman');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>('Long-term relationship');
  const [selectedPhoto, setSelectedPhoto] = useState(AVATAR_PRESETS[0]);
  const [job, setJob] = useState('Product Engineer');
  const [education, setEducation] = useState('B.S. Interaction Design');
  const [bio, setBio] = useState('Building the world’s sleekest dating experience. Passionate about coffee, design, and spontaneous city adventures.');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['UI/UX Design', 'Specialty Coffee', 'Fitness']);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const toggleInterest = (item: string) => {
    setSelectedInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(prev => prev + 1);
    } else {
      completeOnboarding({
        name,
        age,
        gender,
        relationshipGoal,
        photos: [selectedPhoto, AVATAR_PRESETS[1]],
        job,
        education,
        bio,
        interests: selectedInterests,
        isVerified: true
      });
    }
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const res = await fetch('/api/ai/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: 'design, coffee, travel, tech',
          relationshipGoal,
          interests: selectedInterests
        })
      });
      const data = await res.json();
      if (data.bios && data.bios.length > 0) {
        setBio(data.bios[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#D4AF37]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome & Age */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={appLogo}
                alt="NOBODY Logo"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
                className="w-14 h-14 rounded-2xl object-cover border border-[#FF4E00]/50 shadow-xl"
              />
              <div>
                <h1 className="text-3xl font-serif italic text-white">Welcome to NOBODY</h1>
                <p className="text-xs font-mono text-white/50 mt-0.5 uppercase tracking-wider">100% Free • Zero Paywalls</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 font-mono block mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-white/60 font-mono block mb-1">Your Age (18+ Required)</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value) || 18)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Gender & Interested In */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-3xl font-serif italic text-white">Identity & Preference</h2>
              <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">Select your gender and interested matches.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-white/50 block mb-2 font-mono uppercase tracking-widest text-[10px]">
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['woman', 'man', 'non-binary'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`p-3 rounded-2xl border capitalize font-mono text-xs transition ${
                        gender === g ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]' : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/50 block mb-2 font-mono uppercase tracking-widest text-[10px]">
                  Interested In
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['woman', 'man', 'everyone'] as const).map(i => (
                    <button
                      key={i}
                      onClick={() => setInterestedIn(i as Gender)}
                      className={`p-3 rounded-2xl border capitalize font-mono text-xs transition ${
                        interestedIn === i ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]' : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Relationship Goal */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-3xl font-serif italic text-white">Relationship Intent</h2>
              <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">Be clear about your intentions.</p>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {(
                [
                  'Long-term relationship',
                  'Dating to marry',
                  'Short-term fun',
                  'Coffee & casual chats',
                  'Still figuring it out'
                ] as RelationshipGoal[]
              ).map(goal => (
                <button
                  key={goal}
                  onClick={() => setRelationshipGoal(goal)}
                  className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                    relationshipGoal === goal
                      ? 'bg-black border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="font-serif italic text-sm text-white">{goal}</span>
                  <Heart className={`w-4 h-4 ${relationshipGoal === goal ? 'text-[#FF4E00] fill-[#FF4E00]' : 'text-white/20'}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Photo Selection */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-3xl font-serif italic text-white">Profile Avatar</h2>
              <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">Upload your photo or choose a preset style.</p>
            </div>

            {/* Custom Photo Upload Button */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-mono text-white/80">Upload custom photo from gallery</span>
              </div>
              <label className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition shrink-0">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        if (ev.target?.result) {
                          setSelectedPhoto(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {AVATAR_PRESETS.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPhoto(url)}
                  className={`relative rounded-2xl overflow-hidden h-36 border-2 cursor-pointer transition ${
                    selectedPhoto === url ? 'border-[#D4AF37] scale-105 shadow-2xl' : 'border-white/10 opacity-50'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {selectedPhoto === url && (
                    <div className="absolute top-2 right-2 p-1 bg-[#D4AF37] text-black rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Bio & AI Bio Generator */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <h2 className="text-3xl font-serif italic text-white">Bio & Details</h2>
              <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">Describe your personality.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-white/60 font-mono block mb-1">Occupation</label>
                <input
                  type="text"
                  value={job}
                  onChange={e => setJob(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-white/60 font-mono block mb-1">Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/60 font-mono block">Bio</label>
                  <button
                    onClick={handleGenerateBio}
                    className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingBio ? 'Generating...' : 'AI Magic Bio'}</span>
                  </button>
                </div>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37] font-serif italic"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: Interests */}
        {step === 6 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <h2 className="text-3xl font-serif italic text-white">Your Passions</h2>
              <p className="text-xs font-mono text-white/50 mt-1 uppercase tracking-wider">Select at least 3 interests.</p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
              {INTEREST_OPTIONS.map(item => {
                const isSelected = selectedInterests.includes(item);

                return (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition ${
                      isSelected
                        ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-full bg-[#D4AF37] text-black font-bold font-mono text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition shadow-xl"
          >
            <span>{step === 6 ? 'Launch NOBODY' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
