import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DatingProfile,
  GhostSettings,
  Match,
  ChatMessage,
  SafetyReport,
  AdminMetrics
} from '../types';
import { INITIAL_PROFILES } from '../data/initialProfiles';
import { auth, db, testConnection } from '../firebase';
import { onAuthStateChanged, signInAnonymously, signOut, sendEmailVerification, User } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: DatingProfile;
  isOnboardingComplete: boolean;
  isLoggedIn: boolean;
  ghostSettings: GhostSettings;
  profilesStack: DatingProfile[];
  matches: Match[];
  messages: Record<string, ChatMessage[]>;
  activeTab: 'discover' | 'matches' | 'chat' | 'profile' | 'ghost' | 'admin' | 'omegle';
  activeMatchId: string | null;
  matchCelebration: DatingProfile | null;
  reports: SafetyReport[];
  blockedUserIds: string[];
  isPinModalOpen: boolean;
  pinLockTargetMatchId: string | null;
  adminMetrics: AdminMetrics;
  postSignupMessage: string | null;

  // Actions
  loginWithUser: (userData: { id: string; name: string; age?: number; gender?: string; photoUrl?: string }) => void;
  logoutUser: () => void;
  deleteUserAccount: () => Promise<void>;
  sendVerificationEmail: (customUser?: User) => Promise<{ success: boolean; message: string }>;
  setPostSignupMessage: (msg: string | null) => void;
  setActiveTab: (tab: 'discover' | 'matches' | 'chat' | 'profile' | 'ghost' | 'admin' | 'omegle') => void;
  openChatWithMatch: (matchId: string) => void;
  closeMatchCelebration: () => void;
  swipeLeft: (profileId: string) => void;
  swipeRight: (profileId: string) => void;
  superlike: (profileId: string) => void;
  rewindLastSwipe: () => void;
  sendMessage: (
    matchId: string,
    text: string,
    type?: 'text' | 'image' | 'voice' | 'icebreaker' | 'call_log',
    mediaUrl?: string,
    voiceDurationSec?: number
  ) => Promise<void>;
  updateGhostSetting: <K extends keyof GhostSettings>(key: K, value: GhostSettings[K]) => void;
  updateCurrentUser: (updates: Partial<DatingProfile>) => void;
  reportUser: (targetUserId: string, targetUserName: string, reason: SafetyReport['reason'], comment: string) => void;
  blockUser: (targetUserId: string) => void;
  completeOnboarding: (profileData: Partial<DatingProfile>) => void;
  resetOnboarding: () => void;
  resetSwipeStack: () => void;
  verifyPinAndUnlock: (inputPin: string) => boolean;
  setIsPinModalOpen: (open: boolean) => void;
}

const DEFAULT_GHOST_SETTINGS: GhostSettings = {
  alwaysInvisible: false,
  hideOnlineStatus: true,
  hideLastSeen: true,
  hideTypingIndicator: true,
  hideReadReceipts: true,
  hideActiveStatus: true,
  invisibleBrowsing: false,
  hideFromSwipeStack: false,
  locationBlur: true,
  privateLikes: true,
  secretMatches: false,
  hiddenPhotos: false,
  profileApprovalRequired: false,
  chatLockEnabled: false,
  pinCode: '1234',
  biometricLockEnabled: true,
  temporaryIncognitoMinutes: null,
};

const DEFAULT_USER: DatingProfile = {
  id: 'user_me',
  name: 'Alex Rivera',
  age: 25,
  gender: 'man',
  job: 'Product Engineer',
  company: 'NOBADY Studio',
  education: 'B.S. Software & Interaction Design',
  heightCm: 181,
  locationName: 'Metropolitan Arts Center',
  distanceKm: 0,
  relationshipGoal: 'Long-term relationship',
  bio: 'Building the world’s sleekest dating experience. Obsessed with mechanical keyboards, specialty coffee, synthwave vinyls, and late-night city photography.',
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000'
  ],
  interests: ['Product Design', 'Specialty Coffee', 'Vinyl Records', 'City Photography', 'Fitness', 'Travel'],
  lifestyle: {
    drinking: 'Socially',
    smoking: 'Never',
    workout: '4x weekly',
    pets: 'Dog lover 🐕',
    zodiac: 'Libra ♎',
    diet: 'Omnivore'
  },
  languages: ['English', 'Spanish'],
  isVerified: true,
  isOnline: true,
  lastSeenText: 'Active now'
};

const INITIAL_MATCHES: Match[] = [
  {
    id: 'match_1',
    profile: INITIAL_PROFILES[0], // Aria Vance
    matchedAt: 'Just now',
    unreadCount: 1,
    lastMessage: 'Hey Alex! I saw your bio — designing and espresso is my exact vibe too ☕✨',
    lastMessageTime: '10:42 AM',
    isSecretMatch: false,
    isPrivateChatLocked: false
  },
  {
    id: 'match_2',
    profile: INITIAL_PROFILES[2], // Elena Rostova
    matchedAt: '2 hours ago',
    unreadCount: 0,
    lastMessage: 'Your choice of synthwave and coffee is poetically accurate! Have you heard of the latest vinyl release?',
    lastMessageTime: 'Yesterday',
    isSecretMatch: true,
    isPrivateChatLocked: false
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  match_1: [
    {
      id: 'msg_1_1',
      matchId: 'match_1',
      senderId: 'profile_1',
      text: 'Hey Alex! I saw your bio — designing and espresso is my exact vibe too ☕✨',
      timestamp: '10:42 AM',
      type: 'text',
      isRead: true
    }
  ],
  match_2: [
    {
      id: 'msg_2_1',
      matchId: 'match_2',
      senderId: 'user_me',
      text: 'Hi Elena! Classical music and tea talks sound so peaceful. What violin piece are you working on lately?',
      timestamp: 'Yesterday 8:15 PM',
      type: 'text',
      isRead: true
    },
    {
      id: 'msg_2_2',
      matchId: 'match_2',
      senderId: 'profile_2',
      text: 'Your choice of synthwave and coffee is poetically accurate! Have you heard of the latest vinyl release?',
      timestamp: 'Yesterday 8:20 PM',
      type: 'text',
      isRead: true
    }
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DatingProfile>(() => {
    const saved = localStorage.getItem('nobady_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('nobady_is_logged_in') === 'true';
  });

  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('nobady_onboarding_done') === 'true';
  });

  const [postSignupMessage, setPostSignupMessage] = useState<string | null>(null);

  const sendVerificationEmail = async (customUser?: User) => {
    const targetUser = customUser || auth.currentUser;
    if (!targetUser) {
      const msg = 'No user is currently signed in to send verification email.';
      setPostSignupMessage(msg);
      return { success: false, message: msg };
    }

    try {
      await sendEmailVerification(targetUser);
      const msg = `📩 Verification email sent to ${targetUser.email || 'your email'}! Please check your inbox (and Spam folder) and click the link to verify your email address before gaining full access.`;
      setPostSignupMessage(msg);
      return { success: true, message: msg };
    } catch (err: any) {
      console.error('Error in sendVerificationEmail flow:', err);
      let msg = err.message || 'Failed to send verification email.';
      if (err.code === 'auth/too-many-requests') {
        msg = 'Too many verification email requests sent. Please check your Gmail inbox or Spam folder, or wait a few minutes before requesting again.';
      }
      setPostSignupMessage(msg);
      return { success: false, message: msg };
    }
  };

  const loginWithUser = (userData: { id: string; name: string; age?: number; gender?: string; photoUrl?: string }) => {
    setCurrentUser(prev => ({
      ...prev,
      id: userData.id,
      name: userData.name || prev.name,
      age: userData.age || prev.age,
      gender: (userData.gender as any) || prev.gender,
      photos: userData.photoUrl ? [userData.photoUrl, ...prev.photos] : prev.photos
    }));
    setIsLoggedIn(true);
    localStorage.setItem('nobady_is_logged_in', 'true');
  };

  const logoutUser = () => {
    signOut(auth).catch(() => {});
    setIsLoggedIn(false);
    localStorage.removeItem('nobady_is_logged_in');
  };

  const deleteUserAccount = async () => {
    try {
      if (auth.currentUser) {
        await deleteDoc(doc(db, 'profiles', auth.currentUser.uid));
        await auth.currentUser.delete();
      }
    } catch (e) {
      console.warn('Account deletion cleanup:', e);
    } finally {
      logoutUser();
      localStorage.clear();
    }
  };

  const [ghostSettings, setGhostSettings] = useState<GhostSettings>(() => {
    const saved = localStorage.getItem('nobady_ghost_settings');
    return saved ? JSON.parse(saved) : DEFAULT_GHOST_SETTINGS;
  });

  const [profilesStack, setProfilesStack] = useState<DatingProfile[]>(INITIAL_PROFILES);
  const [swipedHistory, setSwipedHistory] = useState<{ profile: DatingProfile; action: 'left' | 'right' | 'super' }[]>([]);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'chat' | 'profile' | 'ghost' | 'admin' | 'omegle'>('discover');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<DatingProfile | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinLockTargetMatchId, setPinLockTargetMatchId] = useState<string | null>(null);

  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics>({
    totalUsers: 14820,
    activeMatchesToday: 3240,
    incognitoUsersCount: 8910,
    reportsPendingCount: 2,
    aiModerationScans: 15400
  });

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        signInAnonymously(auth).catch(err => {
          console.warn('Firebase anonymous auth optional setup:', err);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('nobady_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nobady_ghost_settings', JSON.stringify(ghostSettings));
  }, [ghostSettings]);

  useEffect(() => {
    localStorage.setItem('nobady_onboarding_done', isOnboardingComplete ? 'true' : 'false');
  }, [isOnboardingComplete]);

  const updateGhostSetting = <K extends keyof GhostSettings>(key: K, value: GhostSettings[K]) => {
    setGhostSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateCurrentUser = (updates: Partial<DatingProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const openChatWithMatch = (matchId: string) => {
    const matchObj = matches.find(m => m.id === matchId);
    if (matchObj && ghostSettings.chatLockEnabled && matchObj.isPrivateChatLocked) {
      setPinLockTargetMatchId(matchId);
      setIsPinModalOpen(true);
      return;
    }
    setActiveMatchId(matchId);
    setActiveTab('chat');
  };

  const closeMatchCelebration = () => {
    setMatchCelebration(null);
  };

  const swipeLeft = (profileId: string) => {
    const target = profilesStack.find(p => p.id === profileId);
    if (!target) return;
    setSwipedHistory(prev => [...prev, { profile: target, action: 'left' }]);
    setProfilesStack(prev => prev.filter(p => p.id !== profileId));
  };

  const swipeRight = (profileId: string) => {
    const target = profilesStack.find(p => p.id === profileId);
    if (!target) return;
    setSwipedHistory(prev => [...prev, { profile: target, action: 'right' }]);
    setProfilesStack(prev => prev.filter(p => p.id !== profileId));

    // Simulate Match Event
    const isMatch = true; // Every like triggers the celebration!
    if (isMatch) {
      const newMatch: Match = {
        id: `match_${Date.now()}`,
        profile: target,
        matchedAt: 'Just now',
        unreadCount: 0,
        lastMessage: 'You matched!',
        lastMessageTime: 'Just now',
        isSecretMatch: ghostSettings.secretMatches,
        isPrivateChatLocked: ghostSettings.chatLockEnabled
      };
      setMatches(prev => [newMatch, ...prev]);
      setMessages(prev => ({
        ...prev,
        [newMatch.id]: [
          {
            id: `msg_init_${Date.now()}`,
            matchId: newMatch.id,
            senderId: 'system',
            text: `✨ You and ${target.name} matched! Say hi with an AI Icebreaker!`,
            timestamp: 'Just now',
            type: 'text',
            isRead: true
          }
        ]
      }));
      setMatchCelebration(target);
    }
  };

  const superlike = (profileId: string) => {
    const target = profilesStack.find(p => p.id === profileId);
    if (!target) return;
    setSwipedHistory(prev => [...prev, { profile: target, action: 'super' }]);
    setProfilesStack(prev => prev.filter(p => p.id !== profileId));

    // Superlike instant match celebration
    const newMatch: Match = {
      id: `match_${Date.now()}`,
      profile: target,
      matchedAt: 'Just now',
      unreadCount: 0,
      lastMessage: 'Super Liked! ⭐',
      lastMessageTime: 'Just now',
      isSecretMatch: ghostSettings.secretMatches,
      isPrivateChatLocked: ghostSettings.chatLockEnabled
    };
    setMatches(prev => [newMatch, ...prev]);
    setMessages(prev => ({
      ...prev,
      [newMatch.id]: [
        {
          id: `msg_init_${Date.now()}`,
          matchId: newMatch.id,
          senderId: 'system',
          text: `⭐ You Super Liked ${target.name}!`,
          timestamp: 'Just now',
          type: 'text',
          isRead: true
        }
      ]
    }));
    setMatchCelebration(target);
  };

  const rewindLastSwipe = () => {
    if (swipedHistory.length === 0) return;
    const last = swipedHistory[swipedHistory.length - 1];
    setSwipedHistory(prev => prev.slice(0, prev.length - 1));
    setProfilesStack(prev => [last.profile, ...prev]);
  };

  const sendMessage = async (
    matchId: string,
    text: string,
    type: 'text' | 'image' | 'voice' | 'icebreaker' | 'call_log' = 'text',
    mediaUrl?: string,
    voiceDurationSec?: number
  ) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      mediaUrl,
      voiceDurationSec,
      isRead: true,
      isGhostMessage: ghostSettings.hideTypingIndicator
    };

    setMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg]
    }));

    setMatches(prev =>
      prev.map(m =>
        m.id === matchId
          ? {
              ...m,
              lastMessage: type === 'voice' ? '🎤 Voice Note' : text,
              lastMessageTime: 'Just now'
            }
          : m
      )
    );

    // AI/Auto reply simulation after 1.5 seconds if text message sent
    if (type === 'text' || type === 'icebreaker') {
      setTimeout(() => {
        const replyResponses = [
          `That's so thoughtful! Tell me more about that 😊`,
          `Haha I love that! We definitely share the exact same wavelength. ✨`,
          `Great minds think alike! Are you free for coffee or tea this weekend? ☕`,
          `That totally made my day! What are your plans for tonight? 🌟`
        ];
        const randomReply = replyResponses[Math.floor(Math.random() * replyResponses.length)];
        const autoMsg: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          matchId,
          senderId: matches.find(m => m.id === matchId)?.profile.id || 'partner',
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          isRead: false
        };

        setMessages(p => ({
          ...p,
          [matchId]: [...(p[matchId] || []), autoMsg]
        }));

        setMatches(p =>
          p.map(m =>
            m.id === matchId
              ? {
                  ...m,
                  lastMessage: randomReply,
                  lastMessageTime: 'Just now',
                  unreadCount: activeMatchId === matchId ? 0 : m.unreadCount + 1
                }
              : m
          )
        );
      }, 1500);
    }
  };

  const reportUser = (
    targetUserId: string,
    targetUserName: string,
    reason: SafetyReport['reason'],
    comment: string
  ) => {
    const newReport: SafetyReport = {
      id: `report_${Date.now()}`,
      targetUserId,
      targetUserName,
      reason,
      comment,
      status: 'pending',
      reportedAt: new Date().toLocaleDateString()
    };
    setReports(prev => [newReport, ...prev]);
    setAdminMetrics(prev => ({
      ...prev,
      reportsPendingCount: prev.reportsPendingCount + 1
    }));
    blockUser(targetUserId);
  };

  const blockUser = (targetUserId: string) => {
    setBlockedUserIds(prev => [...prev, targetUserId]);
    setProfilesStack(prev => prev.filter(p => p.id !== targetUserId));
    setMatches(prev => prev.filter(m => m.profile.id !== targetUserId));
  };

  const completeOnboarding = (profileData: Partial<DatingProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...profileData }));
    setIsOnboardingComplete(true);
    setActiveTab('discover');
  };

  const resetOnboarding = () => {
    setIsOnboardingComplete(false);
  };

  const resetSwipeStack = () => {
    setProfilesStack(INITIAL_PROFILES);
    setSwipedHistory([]);
  };

  const verifyPinAndUnlock = (inputPin: string) => {
    if (inputPin === (ghostSettings.pinCode || '1234')) {
      setIsPinModalOpen(false);
      if (pinLockTargetMatchId) {
        setActiveMatchId(pinLockTargetMatchId);
        setActiveTab('chat');
        setPinLockTargetMatchId(null);
      }
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isOnboardingComplete,
        isLoggedIn,
        ghostSettings,
        profilesStack,
        matches,
        messages,
        activeTab,
        activeMatchId,
        matchCelebration,
        reports,
        blockedUserIds,
        isPinModalOpen,
        pinLockTargetMatchId,
        adminMetrics,
        postSignupMessage,
        loginWithUser,
        logoutUser,
        deleteUserAccount,
        sendVerificationEmail,
        setPostSignupMessage,
        setActiveTab,
        openChatWithMatch,
        closeMatchCelebration,
        swipeLeft,
        swipeRight,
        superlike,
        rewindLastSwipe,
        sendMessage,
        updateGhostSetting,
        updateCurrentUser,
        reportUser,
        blockUser,
        completeOnboarding,
        resetOnboarding,
        resetSwipeStack,
        verifyPinAndUnlock,
        setIsPinModalOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
