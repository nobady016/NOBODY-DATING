import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { auth, db } from '../firebase';
import appLogo from '../assets/images/nobody_heart_logo_1785665535054.jpg';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  X,
  Globe,
  Video,
  Heart,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthLoginScreen: React.FC = () => {
  const { loginWithUser, sendVerificationEmail, postSignupMessage } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [ageInput, setAgeInput] = useState('22');

  // Play Store Policy Mandatory Checkboxes
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Firebase Forgot Password Reset Link Handler
  const handlePasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setErrorMessage('Please enter your email address to reset password.');
      return;
    }
    setResetLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setInfoMessage(`📩 Password reset link sent to ${targetEmail}. Please check your Gmail inbox (and Spam folder) to set a new password.`);
      setShowForgotPasswordModal(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = err.message || 'Failed to send password reset link.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address. Please check your spelling or Sign Up.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many reset attempts. Please wait a few minutes or check your email inbox.';
      }
      setErrorMessage(msg);
    } finally {
      setResetLoading(false);
    }
  };

  // Resend Firebase Verification Link to Gmail
  const handleResendEmail = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setResendLoading(true);

    try {
      if (auth.currentUser) {
        const res = await sendVerificationEmail(auth.currentUser);
        setInfoMessage(res.message);
      } else if (email && password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const res = await sendVerificationEmail(cred.user);
        setInfoMessage(res.message);
      } else {
        setErrorMessage('Please enter your Email and Password above to resend the verification link.');
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      let msg = err.message || 'Could not resend verification email.';
      if (err.code === 'auth/too-many-requests') {
        msg = 'Too many verification requests sent. Please check your Gmail inbox/spam or wait a few minutes.';
      }
      setErrorMessage(msg);
    } finally {
      setResendLoading(false);
    }
  };

  // Play Store Compliant Login / Sign Up Handler with Strict Email Verification
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setUnverifiedEmail(null);

    if (!ageConfirmed) {
      setErrorMessage('Google Play Policy requires users to be at least 18 years old.');
      return;
    }
    if (!termsAgreed) {
      setErrorMessage('You must accept the Terms of Service & Privacy Policy to proceed.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        // 1. Create account
        let user;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          user = userCredential.user;
        } catch (authErr: any) {
          console.error('Firebase createUser error:', authErr);
          let msg = authErr.message || 'Failed to create account.';
          if (authErr.code === 'auth/email-already-in-use') {
            msg = 'This email is already registered. Please click "Sign In" above to log in.';
          } else if (authErr.code === 'auth/invalid-email') {
            msg = 'Invalid email address format. Please enter a valid Gmail / Email address.';
          } else if (authErr.code === 'auth/weak-password') {
            msg = 'Password should be at least 6 characters long.';
          } else if (authErr.code === 'auth/operation-not-allowed') {
            msg = '🚨 Firebase Console Configuration Required:\n\nFirebase Project "gen-lang-client-0601145241" me Email/Password provider Disabled hai.\n\nSteps:\n1. console.firebase.google.com me Project "gen-lang-client-0601145241" open karein.\n2. Authentication -> Sign-in method -> Email/Password par click karein.\n3. Pehla switch "Enable" (Email/Password) turn ON karein aur SAVE click karein.\n4. Phir wapis aakar Sign Up karein.';
          }
          setErrorMessage(msg);
          setLoading(false);
          return;
        }

        // 2. Send Email Verification Link via AppContext authentication service
        let verificationMsg = `📩 Registration successful! A verification email has been sent to ${email}. Please check your inbox (and Spam folder) to verify your account before gaining full access.`;
        try {
          const res = await sendVerificationEmail(user);
          if (res.message) verificationMsg = res.message;
        } catch (verifyErr: any) {
          console.warn('Failed to send verification email:', verifyErr);
        }

        // 3. Save initial profile to Firestore with emailVerified: false
        const profileData = {
          uid: user.uid,
          name: fullName || 'NOBODY User',
          email: user.email,
          emailVerified: false,
          age: parseInt(ageInput) || 22,
          gender: 'Man',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'profiles', user.uid), profileData).catch(() => {});

        // 4. Do NOT auto-login! Inform user to check inbox & verify before gaining access
        setUnverifiedEmail(user.email);
        setInfoMessage(verificationMsg);
        setMode('signin');
      } else {
        // Sign In Mode
        let user;
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          user = userCredential.user;
        } catch (authErr: any) {
          console.error('Firebase signIn error:', authErr);
          let msg = authErr.message || 'Failed to sign in.';
          if (
            authErr.code === 'auth/invalid-credential' ||
            authErr.code === 'auth/wrong-password' ||
            authErr.code === 'auth/user-not-found'
          ) {
            msg = 'Incorrect email or password. Please check your credentials and try again.';
          } else if (authErr.code === 'auth/operation-not-allowed') {
            msg = '🚨 Firebase Console Configuration Required:\n\nFirebase Project "gen-lang-client-0601145241" me Email/Password provider Disabled hai.\n\nSteps:\n1. console.firebase.google.com me Project "gen-lang-client-0601145241" open karein.\n2. Authentication -> Sign-in method -> Email/Password par click karein.\n3. Pehla switch "Enable" (Email/Password) turn ON karein aur SAVE click karein.\n4. Phir wapis aakar Sign In karein.';
          }
          setErrorMessage(msg);
          setLoading(false);
          return;
        }

        // Reload user state to get latest emailVerified property from Firebase
        await user.reload().catch(() => {});

        // Strict Check: User MUST have verified their email
        if (!user.emailVerified) {
          setUnverifiedEmail(user.email);
          setErrorMessage(`⚠️ Your email (${user.email}) is NOT verified yet! Please check your Gmail inbox (or Spam folder) for the verification link, then click Sign In.`);
          setLoading(false);
          return;
        }

        // Email verified -> Update Firestore & proceed with login
        await setDoc(doc(db, 'profiles', user.uid), { emailVerified: true }, { merge: true }).catch(() => {});

        let userName = fullName || email.split('@')[0] || 'NOBODY User';
        let userAge = parseInt(ageInput) || 22;

        const userDoc = await getDoc(doc(db, 'profiles', user.uid)).catch(() => null);
        if (userDoc && userDoc.exists()) {
          const data = userDoc.data();
          userName = data.name || userName;
          userAge = data.age || userAge;
        }

        loginWithUser({
          id: user.uid,
          name: userName,
          age: userAge,
          gender: 'Man'
        });
      }
    } catch (err: any) {
      console.error('General auth error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Google Play Store Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    if (!ageConfirmed || !termsAgreed) {
      setErrorMessage('Please accept the 18+ Age & Terms of Service checkboxes to continue.');
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      loginWithUser({
        id: user.uid,
        name: user.displayName || 'Google User',
        age: 22,
        gender: 'Man'
      });
    } catch (err: any) {
      console.warn('Google Sign-In popup closed or cancelled:', err);
      setErrorMessage(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Editorial Glowing Canvas */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#FF4E00] rounded-full mix-blend-screen blur-[140px] opacity-30 animate-pulse" />
        <div className="absolute top-1/2 -right-1/4 w-[500px] h-[500px] bg-[#7000FF] rounded-full mix-blend-screen blur-[120px] opacity-25" />
      </div>

      <div className="max-w-md w-full bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl backdrop-blur-xl">
        {/* Play Store App Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-gradient-to-br from-[#FF4E00] via-[#D4AF37] to-[#7000FF] shadow-2xl">
            <img
              src={appLogo}
              alt="NOBODY App Logo"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
              className="w-16 h-16 rounded-xl object-cover"
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <h1 className="text-3xl font-serif italic text-white tracking-tight">NOBODY</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#00FF85]/10 border border-[#00FF85]/30 text-[#00FF85] text-[9px] font-mono font-bold uppercase tracking-widest">
              Google Play Verified
            </span>
          </div>
          <p className="text-xs font-mono text-white/50 uppercase tracking-wider">
            100% Free • Private Dating & Omegle Video
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 bg-black/60 p-1.5 rounded-full border border-white/10 font-mono text-xs">
          <button
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`py-2 rounded-full font-bold uppercase tracking-wider transition ${
              mode === 'signup' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            className={`py-2 rounded-full font-bold uppercase tracking-wider transition ${
              mode === 'signin' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-[#FF4E00]/10 border border-[#FF4E00]/40 text-[#FF4E00] text-xs font-mono flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{errorMessage}</span>
            </div>
            {(unverifiedEmail || errorMessage.includes('NOT verified')) && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="mt-1 px-3 py-1.5 bg-[#FF4E00]/20 hover:bg-[#FF4E00]/30 border border-[#FF4E00]/50 rounded-xl text-white text-[11px] font-bold self-start transition flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{resendLoading ? 'Sending Gmail link...' : 'Resend Verification Email to Gmail'}</span>
              </button>
            )}
          </div>
        )}

        {/* Info / Success Alert Box */}
        {(postSignupMessage || infoMessage) && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="whitespace-pre-line">{postSignupMessage || infoMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="mt-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl text-emerald-300 text-[11px] font-bold self-start transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{resendLoading ? 'Sending...' : 'Didn\'t get email? Resend Verification Link'}</span>
            </button>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-white/60 uppercase tracking-wider block mb-1">
                  Your Name / Pseudonym
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Siddharth / Alex"
                    className="w-full bg-black/70 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/60 uppercase tracking-wider block mb-1">
                  Age (Must be 18+)
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  required
                  value={ageInput}
                  onChange={e => setAgeInput(e.target.value)}
                  className="w-full bg-black/70 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono text-white/60 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-black/70 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-white/60 uppercase tracking-wider block">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotPasswordModal(true);
                  }}
                  className="text-[10px] font-mono text-[#D4AF37] hover:underline font-bold transition"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/70 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
              />
            </div>
          </div>

          {/* Google Play Safety & Compliance Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
            <label className="flex items-start gap-2.5 cursor-pointer text-white/80 hover:text-white">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={e => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-[#D4AF37] w-4 h-4 rounded"
              />
              <span className="text-[11px] leading-snug">
                I confirm I am <strong>18 years of age or older</strong> (Required by Google Play Safety Policy).
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-white/80 hover:text-white">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={e => setTermsAgreed(e.target.checked)}
                className="mt-0.5 accent-[#D4AF37] w-4 h-4 rounded"
              />
              <span className="text-[11px] leading-snug">
                I accept the{' '}
                <button
                  type="button"
                  onClick={() => setShowPoliciesModal(true)}
                  className="text-[#D4AF37] underline font-bold"
                >
                  Terms of Service & Privacy Policy
                </button>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : mode === 'signup' ? 'Create Account & Start' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0a0a0f] px-3 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Google & Guest Auth Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Play Store UGC Zero Tolerance Policy Notice */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-mono text-white/50 text-center leading-relaxed">
          <strong>Google Play Safety Notice:</strong> NOBODY maintains zero tolerance for objectionable content, harassment, or abusive users. Accounts violating safety standards will be immediately terminated.
        </div>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      <AnimatePresence>
        {showPoliciesModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0f] border border-white/20 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowPoliciesModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="p-2.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg text-white">Terms of Service & Privacy Policy</h3>
                  <p className="text-[10px] font-mono text-white/50">Google Play Store Compliant Terms</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-sans text-white/80 leading-relaxed">
                <h4 className="font-mono font-bold text-[#D4AF37] uppercase text-[11px]">1. Age Restriction (18+)</h4>
                <p>
                  You must be at least 18 years of age to access or use NOBODY Dating & Live Video Chat. Underage accounts will be deleted immediately upon discovery.
                </p>

                <h4 className="font-mono font-bold text-[#D4AF37] uppercase text-[11px]">2. User Conduct & Safety</h4>
                <p>
                  In compliance with Google Play Store User Generated Content policies, harassment, nudity, explicit content, hate speech, scamming, or abusive behavior is strictly prohibited. You may report or block any user instantly.
                </p>

                <h4 className="font-mono font-bold text-[#D4AF37] uppercase text-[11px]">3. Incognito & Data Privacy</h4>
                <p>
                  Your location and private chats are encrypted and secured. When using Ghost Mode, your profile remains hidden from public discovery stack until you choose to interact.
                </p>

                <h4 className="font-mono font-bold text-[#D4AF37] uppercase text-[11px]">4. Account & Data Deletion</h4>
                <p>
                  You retain full control over your personal data. You can permanently delete your profile, chat history, and media at any time directly from the Settings tab in the application.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => { setTermsAgreed(true); setShowPoliciesModal(false); }}
                  className="w-full py-3 rounded-full bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase shadow-xl"
                >
                  I Understand & Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0f] border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="p-2.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg text-white">Reset Password</h3>
                  <p className="text-[10px] font-mono text-white/50">Send password reset link to your email</p>
                </div>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-white/60 uppercase tracking-wider block mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black/70 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-sans"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="w-1/2 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-1/2 py-3 rounded-full bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase shadow-xl hover:opacity-90 disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
