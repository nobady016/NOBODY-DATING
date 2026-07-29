export type Gender = 'woman' | 'man' | 'non-binary' | 'everyone';

export type RelationshipGoal =
  | 'Long-term relationship'
  | 'Short-term fun'
  | 'Dating to marry'
  | 'Coffee & casual chats'
  | 'Still figuring it out';

export interface DatingProfile {
  id: string;
  name: string;
  age: number;
  gender: 'woman' | 'man' | 'non-binary';
  bio: string;
  photos: string[];
  videoIntroUrl?: string;
  voiceNoteUrl?: string;
  job: string;
  company?: string;
  education: string;
  heightCm: number;
  locationName: string;
  distanceKm: number;
  relationshipGoal: RelationshipGoal;
  interests: string[];
  lifestyle: {
    drinking?: string;
    smoking?: string;
    workout?: string;
    pets?: string;
    zodiac?: string;
    diet?: string;
  };
  languages: string[];
  isVerified: boolean;
  compatibilityScore?: number;
  compatibilityReasons?: string[];
  vibeSummary?: string;
  isGhostModeActive?: boolean;
  isOnline?: boolean;
  lastSeenText?: string;
  hasHiddenPhotos?: boolean;
  requireApprovalToView?: boolean;
}

export interface GhostSettings {
  alwaysInvisible: boolean;
  hideOnlineStatus: boolean;
  hideLastSeen: boolean;
  hideTypingIndicator: boolean;
  hideReadReceipts: boolean;
  hideActiveStatus: boolean;
  invisibleBrowsing: boolean; // View profiles without appearing in their stack
  hideFromSwipeStack: boolean;
  locationBlur: boolean; // Show approximate distance only e.g. ~3 km
  privateLikes: boolean; // Likes stay hidden until mutual
  secretMatches: boolean; // Matches hidden from public profile
  hiddenPhotos: boolean; // Photos blurred until approved
  profileApprovalRequired: boolean;
  chatLockEnabled: boolean;
  pinCode: string | null;
  biometricLockEnabled: boolean;
  temporaryIncognitoMinutes: number | null; // e.g. 30 mins active
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'icebreaker' | 'call_log';
  mediaUrl?: string;
  voiceDurationSec?: number;
  isRead: boolean;
  isGhostMessage?: boolean;
  replyToId?: string;
}

export interface Match {
  id: string;
  profile: DatingProfile;
  matchedAt: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isSecretMatch?: boolean;
  isPrivateChatLocked?: boolean;
}

export interface SafetyReport {
  id: string;
  targetUserId: string;
  targetUserName: string;
  reason: 'fake_profile' | 'harassment' | 'inappropriate_content' | 'spam' | 'other';
  comment: string;
  status: 'pending' | 'reviewed' | 'actioned';
  reportedAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeMatchesToday: number;
  incognitoUsersCount: number;
  reportsPendingCount: number;
  aiModerationScans: number;
}
