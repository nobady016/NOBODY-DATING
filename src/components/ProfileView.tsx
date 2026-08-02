import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  Edit3,
  Sparkles,
  Camera,
  Heart,
  Briefcase,
  GraduationCap,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  LogOut,
  Trash2,
  AlertTriangle,
  Upload,
  Plus,
  Star,
  Image as ImageIcon,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1000'
];

export const ProfileView: React.FC = () => {
  const { currentUser, updateCurrentUser, resetOnboarding, logoutUser, deleteUserAccount } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser.bio);
  const [jobInput, setJobInput] = useState(currentUser.job);
  const [companyInput, setCompanyInput] = useState(currentUser.company || '');
  const [educationInput, setEducationInput] = useState(currentUser.education);
  const [heightInput, setHeightInput] = useState(currentUser.heightCm.toString());
  const [goalInput, setGoalInput] = useState(currentUser.relationshipGoal);
  const [keywordsAi, setKeywordsAi] = useState('');
  const [generatedBios, setGeneratedBios] = useState<string[]>([]);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Photo state
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoMessage('❌ Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setPhotoMessage('❌ File size exceeds 12MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const existingPhotos = currentUser.photos || [];
        const newPhotos = [result, ...existingPhotos.filter(p => p !== result)];
        updateCurrentUser({ photos: newPhotos });
        setPhotoMessage('✅ Profile photo updated successfully!');
        setTimeout(() => setPhotoMessage(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customPhotoUrl.trim();
    if (!url) return;
    const existingPhotos = currentUser.photos || [];
    const newPhotos = [url, ...existingPhotos.filter(p => p !== url)];
    updateCurrentUser({ photos: newPhotos });
    setCustomPhotoUrl('');
    setPhotoMessage('✅ Image URL added as main profile photo!');
    setTimeout(() => setPhotoMessage(null), 3500);
  };

  const handleSetMainPhoto = (photoUrl: string) => {
    const existingPhotos = currentUser.photos || [];
    const newPhotos = [photoUrl, ...existingPhotos.filter(p => p !== photoUrl)];
    updateCurrentUser({ photos: newPhotos });
    setPhotoMessage('⭐ Main profile photo updated!');
    setTimeout(() => setPhotoMessage(null), 3000);
  };

  const handleRemovePhoto = (photoUrl: string) => {
    const existingPhotos = currentUser.photos || [];
    if (existingPhotos.length <= 1) {
      setPhotoMessage('❌ You must keep at least 1 profile photo.');
      setTimeout(() => setPhotoMessage(null), 3000);
      return;
    }
    const newPhotos = existingPhotos.filter(p => p !== photoUrl);
    updateCurrentUser({ photos: newPhotos });
    setPhotoMessage('Photo removed.');
    setTimeout(() => setPhotoMessage(null), 3000);
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const res = await fetch('/api/ai/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywordsAi,
          relationshipGoal: goalInput,
          interests: currentUser.interests
        })
      });
      const data = await res.json();
      if (data.bios) {
        setGeneratedBios(data.bios);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSaveProfile = () => {
    updateCurrentUser({
      bio: bioInput,
      job: jobInput,
      company: companyInput,
      education: educationInput,
      heightCm: parseInt(heightInput) || 180,
      relationshipGoal: goalInput as any
    });
    setIsEditing(false);
  };

  const handleRequestVerification = () => {
    setTimeout(() => {
      updateCurrentUser({ isVerified: true });
      setVerificationSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-6 text-center space-y-4 relative overflow-hidden shadow-2xl">
        <div className="relative w-32 h-32 mx-auto group">
          <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-[#FF4E00] via-[#D4AF37] to-white shadow-2xl overflow-hidden">
            <img
              src={currentUser.photos[0] || PRESET_PHOTOS[0]}
              alt={currentUser.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Quick Camera File Upload Overlay */}
          <label
            htmlFor="profile-header-photo-input"
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#D4AF37] text-black shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition border-2 border-[#0a0a0f] flex items-center justify-center z-10"
            title="Upload or Change Profile Photo"
          >
            <Camera className="w-4 h-4" />
            <input
              id="profile-header-photo-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>

          {currentUser.isVerified && (
            <span
              className="absolute top-0 right-0 p-1.5 rounded-full bg-sky-400 text-black shadow-lg border-2 border-[#0a0a0f]"
              title="Verified Profile"
            >
              <ShieldCheck className="w-4 h-4" />
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-white leading-none">
            {currentUser.name},{' '}
            <span className="text-[#D4AF37] font-serif not-italic">{currentUser.age}</span>
          </h1>
          <p className="text-xs text-white/60 mt-1 font-mono uppercase tracking-wider">
            {currentUser.job} • {currentUser.company}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 hover:bg-white/10 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>

          {!currentUser.isVerified && (
            <button
              onClick={handleRequestVerification}
              className="px-5 py-2.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 hover:bg-sky-500/20 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          )}
        </div>

        {photoMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-mono flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{photoMessage}</span>
          </motion.div>
        )}

        {verificationSuccess && (
          <div className="p-2.5 rounded-2xl bg-[#00FF85]/10 border border-[#00FF85]/30 text-xs text-[#00FF85] font-mono flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00FF85]" />
            <span>AI Face Scan Verified! Badge Unlocked.</span>
          </div>
        )}
      </div>

      {/* Profile Photo Management Gallery */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-4 text-left shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
              My Profile Photos ({currentUser.photos.length})
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white/50">Tap camera to upload</span>
        </div>

        {/* Current Photos Grid */}
        <div className="grid grid-cols-3 gap-3">
          {currentUser.photos.map((photo, index) => {
            const isMain = index === 0;
            return (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden h-28 border-2 transition group ${
                  isMain ? 'border-[#D4AF37] shadow-xl ring-2 ring-[#D4AF37]/30' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img src={photo} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                
                {/* Main badge */}
                {isMain ? (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#D4AF37] text-black text-[9px] font-mono font-bold uppercase flex items-center gap-1 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-black" />
                    <span>Main</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSetMainPhoto(photo)}
                    className="absolute top-1.5 left-1.5 p-1 rounded-full bg-black/70 hover:bg-[#D4AF37] text-white hover:text-black transition text-[9px] font-mono flex items-center gap-0.5 opacity-0 group-hover:opacity-100"
                    title="Set as Main Profile Photo"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemovePhoto(photo)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 hover:bg-red-500 text-white transition opacity-0 group-hover:opacity-100"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Device Upload Tile */}
          <label
            htmlFor="gallery-upload-input"
            className="h-28 rounded-2xl border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-[#D4AF37]"
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center px-1">Upload Photo</span>
            <input
              id="gallery-upload-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* URL Add Photo Option */}
        <form onSubmit={handleAddUrlPhoto} className="flex gap-2 pt-1">
          <input
            type="url"
            value={customPhotoUrl}
            onChange={e => setCustomPhotoUrl(e.target.value)}
            placeholder="Or paste photo URL..."
            className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-[#D4AF37] text-white hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition"
          >
            Add URL
          </button>
        </form>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Quick Presets</span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {PRESET_PHOTOS.map((presetUrl, idx) => (
              <button
                key={idx}
                onClick={() => handleSetMainPhoto(presetUrl)}
                className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 shrink-0 hover:border-[#D4AF37] hover:scale-105 transition"
              >
                <img src={presetUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-6 space-y-5 text-left">
          <h2 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            <span>Update Profile Details</span>
          </h2>

          <div className="space-y-3 text-xs">
            {/* Job */}
            <div>
              <label className="text-white/60 font-mono block mb-1">Occupation / Job Title</label>
              <input
                type="text"
                value={jobInput}
                onChange={e => setJobInput(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-white/60 font-mono block mb-1">Company / Studio</label>
              <input
                type="text"
                value={companyInput}
                onChange={e => setCompanyInput(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/60 font-mono block mb-1">Bio</label>
              <textarea
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* AI Bio Generator Box */}
            <div className="bg-[#05050a] border border-[#D4AF37]/30 p-4 rounded-3xl space-y-2">
              <span className="text-[#D4AF37] font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Bio Generator</span>
              </span>
              <input
                type="text"
                value={keywordsAi}
                onChange={e => setKeywordsAi(e.target.value)}
                placeholder="Keywords e.g. funny, tech, coffee lover"
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
              />
              <button
                onClick={handleGenerateBio}
                className="w-full py-2.5 rounded-full bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37]/90 transition"
              >
                {isGeneratingBio ? 'Generating Bios...' : 'Generate Bios'}
              </button>

              {generatedBios.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => setBioInput(b)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer text-white/80 border border-white/5 font-serif italic text-sm"
                >
                  "{b}"
                </div>
              ))}
            </div>

            {/* Relationship Goal */}
            <div>
              <label className="text-white/60 font-mono block mb-1">Relationship Goal</label>
              <select
                value={goalInput}
                onChange={e => setGoalInput(e.target.value as any)}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-white focus:outline-none"
              >
                <option value="Long-term relationship">Long-term relationship</option>
                <option value="Short-term fun">Short-term fun</option>
                <option value="Dating to marry">Dating to marry</option>
                <option value="Coffee & casual chats">Coffee & casual chats</option>
                <option value="Still figuring it out">Still figuring it out</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-3.5 rounded-full bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest hover:opacity-90 transition shadow-xl"
          >
            Save Profile Changes
          </button>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-4 text-left">
          {/* Bio Box */}
          <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">About Me</h2>
            <p className="text-sm text-white/80 leading-relaxed font-serif italic">{currentUser.bio}</p>
          </div>

          {/* Relationship Goal */}
          <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Looking For</span>
              <span className="text-base font-serif italic text-white">{currentUser.relationshipGoal}</span>
            </div>
            <Heart className="w-5 h-5 text-[#FF4E00] fill-[#FF4E00]/20" />
          </div>

          {/* Interests */}
          <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">My Interests</h2>
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map((interest, i) => (
                <span
                  key={i}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 text-white/80 border border-white/10 font-mono"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Google Play Store Data & Account Controls */}
          <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
              Google Play Account & Privacy Controls
            </h2>

            <div className="space-y-2 pt-1">
              <button
                onClick={logoutUser}
                className="w-full py-3 rounded-2xl bg-white/10 border border-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-[#D4AF37]" />
                <span>Sign Out of Account</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 rounded-2xl bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#FF4E00]/20 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account & Data (Permanent)</span>
              </button>
            </div>
          </div>

          {/* Re-run Onboarding Option */}
          <div className="pt-2 text-center">
            <button
              onClick={resetOnboarding}
              className="text-xs text-white/40 hover:text-[#D4AF37] font-mono uppercase tracking-widest underline"
            >
              Re-run Onboarding Wizard
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0f] border border-[#FF4E00]/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#FF4E00]/10 text-[#FF4E00] border border-[#FF4E00]/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg text-white">Delete Profile & Data?</h3>
                  <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Play Store Safety Compliance</p>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-sans">
                This will permanently remove your profile, chat messages, and matches from NOBODY servers. This action cannot be undone.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-mono text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUserAccount}
                  className="flex-1 py-3 rounded-2xl bg-[#FF4E00] text-white font-mono font-bold text-xs uppercase shadow-xl hover:opacity-90 transition"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
