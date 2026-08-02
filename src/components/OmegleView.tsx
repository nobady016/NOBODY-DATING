import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  onSnapshot,
  deleteDoc,
  query,
  limit,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  SkipForward,
  Square,
  ShieldAlert,
  UserPlus,
  Tag,
  Zap,
  Camera,
  Send,
  Volume2,
  VolumeX,
  Smile,
  Globe,
  CheckCircle2,
  X,
  Share2,
  Copy,
  Users,
  Sparkles,
  Link as LinkIcon,
  EyeOff,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Stranger {
  id: string;
  name: string;
  location: string;
  interests: string[];
  videoBgUrl?: string;
  greetingMessage?: string;
  isRealUser: boolean;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
  ]
};

const DEMO_STRANGERS: Stranger[] = [
  {
    id: 'demo_1',
    name: 'Stranger (Siddharth)',
    location: 'Delhi, India',
    interests: ['Music', 'Gaming', 'Tech'],
    videoBgUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    greetingMessage: 'Namaste! Welcome to NOBODY live video chat!',
    isRealUser: false
  },
  {
    id: 'demo_2',
    name: 'Stranger (Ananya)',
    location: 'Mumbai, India',
    interests: ['Design', 'Movies', 'Travel'],
    videoBgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    greetingMessage: 'Hey! Loved connecting here. How is your day going?',
    isRealUser: false
  },
  {
    id: 'demo_3',
    name: 'Stranger (Rohan)',
    location: 'Bengaluru, India',
    interests: ['Coding', 'Startup', 'Coffee'],
    videoBgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    greetingMessage: 'Yo! Awesome WebRTC video chat connection!',
    isRealUser: false
  }
];

const GHOST_DEMO_STRANGERS: Stranger[] = [
  {
    id: 'ghost_demo_1',
    name: 'Ghost Stranger (Spectre)',
    location: 'Stealth Encrypted Vault',
    interests: ['Anonymity', 'Cybersecurity', 'Nightlife'],
    videoBgUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=800',
    greetingMessage: '👻 Ghost Mode active! Pure anonymous 1-on-1 stealth connection.',
    isRealUser: false
  },
  {
    id: 'ghost_demo_2',
    name: 'Ghost Stranger (Shadow)',
    location: 'Encrypted Relay Node',
    interests: ['Privacy', 'Crypto', 'AI'],
    videoBgUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800',
    greetingMessage: '⚡ Ghost-to-Ghost encrypted video room. Real identity remains completely hidden!',
    isRealUser: false
  }
];

export const OmegleView: React.FC = () => {
  const { currentUser, ghostSettings, updateGhostSetting, reportUser, addMatchFromStranger } = useApp();

  // Match Pool Mode (Ghost Mode vs Normal Mode Pool)
  const [matchPoolMode, setMatchPoolMode] = useState<'ghost' | 'normal'>(
    ghostSettings.alwaysInvisible ? 'ghost' : 'normal'
  );

  // Synchronize pool mode if ghostSettings changes globally
  useEffect(() => {
    setMatchPoolMode(ghostSettings.alwaysInvisible ? 'ghost' : 'normal');
  }, [ghostSettings.alwaysInvisible]);

  // Match State
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [role, setRole] = useState<'caller' | 'callee' | 'demo' | null>(null);
  const [currentStranger, setCurrentStranger] = useState<Stranger | null>(null);
  const [isRealP2P, setIsRealP2P] = useState(false);

  // Direct Room Code Input
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const [showRoomCodeModal, setShowRoomCodeModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // User Media & WebRTC Controls
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isStrangerMuted, setIsStrangerMuted] = useState(false);
  const [camPermissionDenied, setCamPermissionDenied] = useState(false);
  const [activeArMask, setActiveArMask] = useState<'none' | 'ghost' | 'cyber' | 'blur'>('none');

  // Interest Tags
  const [tagInput, setTagInput] = useState('');
  const [interests, setInterests] = useState<string[]>(['Music', 'Coffee', 'Tech']);

  // Chat Log
  const [chatLog, setChatLog] = useState<{ sender: 'system' | 'you' | 'stranger'; text: string; time: string }[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [addedAsMatch, setAddedAsMatch] = useState(false);

  // Video Refs & WebRTC Instances
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubcribeRoomRef = useRef<(() => void) | null>(null);
  const unsubcribeMsgsRef = useRef<(() => void) | null>(null);

  // 1. Initialize Webcam & Audio Stream
  useEffect(() => {
    async function setupLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setCamPermissionDenied(false);
      } catch (err) {
        console.warn('Webcam permission error or restricted:', err);
        setCamPermissionDenied(true);
      }
    }

    setupLocalStream();

    return () => {
      cleanUpWebRTC();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Sync Cam & Mic Toggle with Stream
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isCamOn;
      });
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
    }
  }, [isCamOn, isMicOn]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Clean up existing WebRTC connections and Firebase listeners
  const cleanUpWebRTC = () => {
    if (unsubcribeRoomRef.current) {
      unsubcribeRoomRef.current();
      unsubcribeRoomRef.current = null;
    }
    if (unsubcribeMsgsRef.current) {
      unsubcribeMsgsRef.current();
      unsubcribeMsgsRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  // 2. Start Global Matchmaking (Real WebRTC or Queue)
  const startMatching = async () => {
    cleanUpWebRTC();
    setIsSearching(true);
    setIsConnected(false);
    setCurrentStranger(null);
    setAddedAsMatch(false);
    setIsRealP2P(false);

    const isGhostMatching = matchPoolMode === 'ghost';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatLog([
      {
        sender: 'system',
        text: isGhostMatching
          ? '👻 Searching in GHOST MODE POOL... Strictly looking for live online Ghost Mode users only.'
          : '⚡ Searching in NORMAL MODE POOL... Looking for live online Normal Mode users.',
        time: nowTime
      }
    ]);

    try {
      // Query Firestore omegle_queue strictly filtered by isGhostMode
      const queueRef = collection(db, 'omegle_queue');
      const q = query(
        queueRef,
        where('isGhostMode', '==', isGhostMatching),
        limit(5)
      );
      const queueSnap = await getDocs(q);

      let foundWaitingRoom = false;

      for (const itemDoc of queueSnap.docs) {
        const queueData = itemDoc.data();
        const roomId = queueData.roomId;

        // Verify room exists and matches current mode
        const roomSnap = await getDoc(doc(db, 'omegle_rooms', roomId));
        if (roomSnap.exists()) {
          const roomData = roomSnap.data();
          if (roomData.status === 'waiting' && roomData.isGhostMode === isGhostMatching) {
            // Delete from queue so nobody else takes it
            await deleteDoc(doc(db, 'omegle_queue', itemDoc.id));
            // Join room as Callee
            await joinRoomAsCallee(roomId, isGhostMatching);
            foundWaitingRoom = true;
            break;
          }
        } else {
          // Clean up orphaned queue doc
          await deleteDoc(doc(db, 'omegle_queue', itemDoc.id)).catch(() => {});
        }
      }

      if (!foundWaitingRoom) {
        // No one waiting in this pool. Create a room as Caller
        const newRoomId = 'room_' + Math.random().toString(36).substring(2, 9);
        await createRoomAsCaller(newRoomId, isGhostMatching);
      }
    } catch (err) {
      console.warn('Firestore matchmaking queue error, falling back to instant caller room:', err);
      const fallbackRoomId = 'room_' + Math.random().toString(36).substring(2, 9);
      await createRoomAsCaller(fallbackRoomId, isGhostMatching);
    }
  };

  // 3. Create Room as Caller (Peer 1)
  const createRoomAsCaller = async (roomId: string, isGhostMatching: boolean) => {
    setCurrentRoomId(roomId);
    setRole('caller');

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks to PeerConnection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming Remote Stream track
    pc.ontrack = event => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
        setIsSearching(false);
        setIsRealP2P(true);
      }
    };

    const roomRef = doc(db, 'omegle_rooms', roomId);
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');

    // Collect ICE Candidates from local machine
    pc.onicecandidate = event => {
      if (event.candidate) {
        addDoc(callerCandidatesCollection, event.candidate.toJSON());
      }
    };

    // Create SDP Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const roomWithOffer = {
      roomId,
      isGhostMode: isGhostMatching,
      callerName: isGhostMatching ? 'Ghost Stranger' : (currentUser.name || 'Anonymous Stranger'),
      callerSDP: {
        type: offer.type,
        sdp: offer.sdp
      },
      status: 'waiting',
      createdAt: serverTimestamp()
    };

    await setDoc(roomRef, roomWithOffer);

    // Add to omegle_queue tagged with isGhostMode
    await addDoc(collection(db, 'omegle_queue'), {
      roomId,
      isGhostMode: isGhostMatching,
      createdAt: serverTimestamp()
    });

    // Listen to room doc for Callee SDP Answer
    const unsubRoom = onSnapshot(roomRef, async snapshot => {
      const data = snapshot.data();
      if (data && !pc.currentRemoteDescription && data.calleeSDP) {
        // Enforce mode match
        if (data.isGhostMode !== isGhostMatching) {
          console.warn('Mismatched mode attempt blocked.');
          return;
        }

        const rtcSessionDescription = new RTCSessionDescription(data.calleeSDP);
        await pc.setRemoteDescription(rtcSessionDescription);

        setCurrentStranger({
          id: 'real_' + (data.calleeName || 'Peer'),
          name: data.calleeName || (isGhostMatching ? 'Ghost Stranger' : 'Live Stranger'),
          location: isGhostMatching ? 'Stealth Encrypted Vault' : 'Worldwide Online',
          interests: interests,
          isRealUser: true
        });

        setIsConnected(true);
        setIsSearching(false);
        setIsRealP2P(true);

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatLog(prev => [
          ...prev,
          {
            sender: 'system',
            text: isGhostMatching
              ? `👻 Ghost-to-Ghost Encrypted Video Call Connected! (${data.calleeName || 'Ghost Stranger'})`
              : `⚡ Real 1-on-1 WebRTC Video Connection Established! (${data.calleeName || 'Live Stranger'})`,
            time
          }
        ]);
      }
    });
    unsubcribeRoomRef.current = unsubRoom;

    // Listen for Callee ICE Candidates
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
    onSnapshot(calleeCandidatesCollection, snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const candidateData = change.doc.data();
          await pc.addIceCandidate(new RTCIceCandidate(candidateData));
        }
      });
    });

    // Setup live chat listener
    listenToRoomChat(roomId);

    // If no human joins within 8s, notify
    setTimeout(() => {
      if (!pc.remoteDescription) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatLog(prev => [
          ...prev,
          {
            sender: 'system',
            text: isGhostMatching
              ? `⌛ Waiting in GHOST POOL for another Ghost Mode user... Room Code: "${roomId}"`
              : `⌛ Waiting in NORMAL POOL for a live stranger... Room Code: "${roomId}"`,
            time
          }
        ]);
      }
    }, 8000);
  };

  // 4. Join Room as Callee (Peer 2)
  const joinRoomAsCallee = async (roomId: string, isGhostMatching: boolean) => {
    setCurrentRoomId(roomId);
    setRole('callee');

    const roomRef = doc(db, 'omegle_rooms', roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      startMatching();
      return;
    }

    const roomData = roomSnap.data();

    // STRICT ISOLATION ENFORCEMENT
    if (roomData.isGhostMode !== isGhostMatching) {
      console.warn(`Mode mismatch! Room isGhostMode=${roomData.isGhostMode}, User isGhostMode=${isGhostMatching}`);
      startMatching();
      return;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle Remote Stream track
    pc.ontrack = event => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
        setIsSearching(false);
        setIsRealP2P(true);
      }
    };

    // Collect ICE Candidates
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
    pc.onicecandidate = event => {
      if (event.candidate) {
        addDoc(calleeCandidatesCollection, event.candidate.toJSON());
      }
    };

    // Set Remote SDP Offer from Caller
    await pc.setRemoteDescription(new RTCSessionDescription(roomData.callerSDP));

    // Create SDP Answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Write Answer back to Firestore room
    await setDoc(
      roomRef,
      {
        calleeName: isGhostMatching ? 'Ghost Stranger' : (currentUser.name || 'Anonymous Stranger'),
        calleeSDP: {
          type: answer.type,
          sdp: answer.sdp
        },
        status: 'connected'
      },
      { merge: true }
    );

    // Listen for Caller ICE Candidates
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
    onSnapshot(callerCandidatesCollection, snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const candidateData = change.doc.data();
          await pc.addIceCandidate(new RTCIceCandidate(candidateData));
        }
      });
    });

    setCurrentStranger({
      id: 'real_' + (roomData.callerName || 'Peer'),
      name: roomData.callerName || (isGhostMatching ? 'Ghost Stranger' : 'Live Stranger'),
      location: isGhostMatching ? 'Stealth Encrypted Vault' : 'Worldwide Online',
      interests: interests,
      isRealUser: true
    });

    setIsConnected(true);
    setIsSearching(false);
    setIsRealP2P(true);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog(prev => [
      ...prev,
      {
        sender: 'system',
        text: isGhostMatching
          ? `👻 Ghost-to-Ghost Encrypted Video Call Connected! (${roomData.callerName || 'Ghost Stranger'})`
          : `⚡ Real 1-on-1 WebRTC Video Connection Established! (${roomData.callerName || 'Live Stranger'})`,
        time
      }
    ]);

    listenToRoomChat(roomId);
  };

  // 5. Connect via Direct Room Code (Join Room)
  const joinDirectRoomCode = async () => {
    if (!joinRoomInput.trim()) return;
    cleanUpWebRTC();
    setIsSearching(true);
    setShowRoomCodeModal(false);

    const isGhostMatching = matchPoolMode === 'ghost';
    const cleanCode = joinRoomInput.trim();
    await joinRoomAsCallee(cleanCode, isGhostMatching);
    setJoinRoomInput('');
  };

  // 6. Connect with Demo Companion
  const connectDemoCompanion = () => {
    cleanUpWebRTC();
    setIsSearching(false);
    setIsConnected(true);
    setRole('demo');
    setIsRealP2P(false);

    const isGhostMatching = matchPoolMode === 'ghost';
    const pool = isGhostMatching ? GHOST_DEMO_STRANGERS : DEMO_STRANGERS;
    const randomDemo = pool[Math.floor(Math.random() * pool.length)];
    setCurrentStranger(randomDemo);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog([
      {
        sender: 'system',
        text: isGhostMatching
          ? `👻 Connected in GHOST POOL with ${randomDemo.name}!`
          : `✨ Connected in NORMAL POOL with ${randomDemo.name}! (${randomDemo.location})`,
        time
      },
      {
        sender: 'stranger',
        text: randomDemo.greetingMessage || 'Hello! Welcome to NOBODY live video chat!',
        time
      }
    ]);
  };

  // 7. Listen to Realtime Chat Messages in Firestore
  const listenToRoomChat = (roomId: string) => {
    const msgsRef = collection(db, 'omegle_rooms', roomId, 'messages');
    const q = query(msgsRef, orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.senderId !== currentUser.id) {
            const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            setChatLog(prev => [...prev, { sender: 'stranger', text: data.text, time }]);
          }
        }
      });
    });

    unsubcribeMsgsRef.current = unsub;
  };

  // 8. Send Chat Message
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !isConnected) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = chatMessage.trim();
    setChatLog(prev => [...prev, { sender: 'you', text: userMsg, time }]);
    setChatMessage('');

    if (isRealP2P && currentRoomId) {
      // Send message to Firestore real-time subcollection
      try {
        await addDoc(collection(db, 'omegle_rooms', currentRoomId, 'messages'), {
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: userMsg,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('Error sending Firestore chat message:', err);
      }
    } else if (role === 'demo') {
      // Demo stranger replies dynamically
      setTimeout(() => {
        const replies = [
          "That's so cool! Tell me more about that 😄",
          "Haha totally agree! I was just thinking the same thing.",
          "Nice! What's your favorite thing to do on weekends?",
          "Awesome vibe! Glad we connected on NOBODY Omegle.",
          "Really? That sounds amazing! 🌟"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        setChatLog(prev => [...prev, { sender: 'stranger', text: randomReply, time }]);
      }, 1200);
    }
  };

  // Disconnect & Stop Call
  const stopCall = () => {
    cleanUpWebRTC();
    setIsSearching(false);
    setIsConnected(false);
    setCurrentStranger(null);
    setRole(null);
    setCurrentRoomId(null);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog(prev => [
      ...prev,
      { sender: 'system', text: 'Call ended. Click "Start Omegle Match" to find another stranger.', time }
    ]);
  };

  // Copy Room Link to Clipboard for Dual-Tab testing or sharing
  const copyRoomLink = () => {
    if (!currentRoomId) return;
    const roomCode = currentRoomId;
    navigator.clipboard.writeText(roomCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !interests.includes(tagInput.trim())) {
      setInterests([...interests, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setInterests(interests.filter(t => t !== tag));
  };

  const handleSaveMatch = () => {
    if (!currentStranger) return;
    addMatchFromStranger(currentStranger);
    setAddedAsMatch(true);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog(prev => [
      ...prev,
      {
        sender: 'system',
        text: `❤️ Connection saved! ${currentStranger.name} has been added to your Matches tab for permanent chat.`,
        time
      }
    ]);
  };

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 pb-28 space-y-4 text-left">
      {/* Header Banner */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-5 space-y-3 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-black border border-[#FF4E00] text-[#FF4E00]">
              <Video className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif italic text-white leading-none">NOBODY Omegle</h1>
                <span className="px-2 py-0.5 rounded-full bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00] text-[9px] font-mono font-bold uppercase tracking-widest">
                  Real WebRTC
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider mt-0.5">
                Global 1-on-1 Video Chat • Peer-to-Peer Encrypted
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#00FF85] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00FF85] animate-ping" />
              Live Online
            </span>
          </div>
        </div>

        {/* Room Code Direct Connect Bar */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-2xl text-xs font-mono">
          <div className="flex items-center gap-2 text-white/70">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span>Have a Room Code?</span>
          </div>
          <button
            onClick={() => setShowRoomCodeModal(true)}
            className="px-3 py-1 rounded-full bg-[#D4AF37] text-black font-bold uppercase tracking-wider text-[10px] hover:scale-105 transition"
          >
            Enter Code
          </button>
        </div>

        {/* Match Pool Mode Selector (Ghost vs Normal Mode Isolation) */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {matchPoolMode === 'ghost' ? (
                <div className="p-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37]">
                  <EyeOff className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 rounded-full bg-[#FF4E00]/20 border border-[#FF4E00]/50 text-[#FF4E00]">
                  <Zap className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                  {matchPoolMode === 'ghost' ? '👻 Ghost Mode Pool' : '⚡ Normal Mode Pool'}
                </span>
                <span className="text-[10px] text-white/50 block">
                  {matchPoolMode === 'ghost'
                    ? 'Matches ONLY with other Ghost Mode users'
                    : 'Matches ONLY with Normal public users'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  setMatchPoolMode('normal');
                  updateGhostSetting('alwaysInvisible', false);
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition ${
                  matchPoolMode === 'normal'
                    ? 'bg-[#FF4E00] text-white shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => {
                  setMatchPoolMode('ghost');
                  updateGhostSetting('alwaysInvisible', true);
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition flex items-center gap-1 ${
                  matchPoolMode === 'ghost'
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                Ghost
              </button>
            </div>
          </div>
        </div>

        {/* Interest Filter Tags */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/60">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#D4AF37]" />
              Matching Interests
            </span>
            <span>Match Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-2 rounded-2xl border border-white/10">
            {interests.map(t => (
              <span
                key={t}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1"
              >
                #{t}
                <button onClick={() => handleRemoveTag(t)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag..."
              className="bg-transparent text-xs text-white focus:outline-none font-mono flex-1 min-w-[80px] placeholder-white/30"
            />
          </div>
        </div>
      </div>

      {/* Main Video Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Remote Stranger Video Screen */}
        <div className="relative h-64 md:h-72 bg-[#0a0a0f] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-xl group">
          {/* Real WebRTC Remote Video Stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${
              isRealP2P && isConnected ? 'block' : 'hidden'
            }`}
          />

          {/* Demo Companion Fallback Image */}
          {!isRealP2P && isConnected && currentStranger && currentStranger.videoBgUrl && (
            <img
              src={currentStranger.videoBgUrl}
              alt={currentStranger.name}
              className="absolute inset-0 w-full h-full object-cover filter brightness-90"
            />
          )}

          {/* Radar Searching Animation */}
          {isSearching && (
            <div className="absolute inset-0 bg-[#05050a] flex flex-col items-center justify-center space-y-3 z-10 p-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#FF4E00] border-t-transparent animate-spin" />
                <Globe className="w-6 h-6 text-[#FF4E00] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-xs font-mono text-white/90 uppercase tracking-widest font-bold">
                  Searching WebRTC Stranger...
                </p>
                <p className="text-[10px] font-mono text-white/50 mt-1">
                  Exchanging SDP offers & ICE candidates across world
                </p>
              </div>

              {currentRoomId && (
                <div className="mt-2 bg-white/10 border border-white/10 p-2 rounded-xl text-[10px] font-mono space-y-1 w-full max-w-xs">
                  <div className="text-[#D4AF37] font-bold">Room Code: {currentRoomId}</div>
                  <button
                    onClick={copyRoomLink}
                    className="w-full py-1 rounded bg-[#D4AF37] text-black font-bold uppercase flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedLink ? 'Copied Room Code!' : 'Copy Code for 2nd Tab / Friend'}</span>
                  </button>
                  <button
                    onClick={connectDemoCompanion}
                    className="w-full py-1 rounded bg-white/10 text-white hover:bg-white/20 transition mt-1"
                  >
                    ⚡ Test with Demo Partner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty Placeholder State */}
          {!isConnected && !isSearching && (
            <div className="absolute inset-0 bg-[#05050a] flex flex-col items-center justify-center space-y-3 z-10 text-center p-6">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-white">Stranger Screen</h3>
                <p className="text-xs font-mono text-white/50 uppercase tracking-wider mt-1">
                  Click "Start Omegle Match" to connect live
                </p>
              </div>
            </div>
          )}

          {/* Stranger Overlay Header */}
          {isConnected && currentStranger && (
            <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00FF85] animate-ping" />
                <span className="font-serif italic text-sm text-white">{currentStranger.name}</span>
              </div>
              <span className="text-[10px] font-mono text-[#00FF85]">
                {isRealP2P ? '⚡ Live P2P WebRTC' : 'Demo Companion'}
              </span>
            </div>
          )}

          {/* Stranger Controls Footer */}
          {isConnected && currentStranger && (
            <div className="relative z-10 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsStrangerMuted(!isStrangerMuted)}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition"
              >
                {isStrangerMuted ? <VolumeX className="w-4 h-4 text-[#FF4E00]" /> : <Volume2 className="w-4 h-4 text-[#00FF85]" />}
              </button>

              <div className="flex items-center gap-2">
                {!addedAsMatch ? (
                  <button
                    onClick={handleSaveMatch}
                    className="px-3 py-1.5 rounded-full bg-[#D4AF37] text-black font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 shadow-lg hover:scale-105 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Save Match</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-full bg-[#00FF85]/20 border border-[#00FF85]/40 text-[#00FF85] font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matched!</span>
                  </span>
                )}

                <button
                  onClick={() => reportUser(currentStranger.id, currentStranger.name, 'inappropriate_content', 'Omegle report')}
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-[#FF4E00]/30 text-[#FF4E00] hover:bg-[#FF4E00]/20 transition"
                  title="Report"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Local Camera Screen */}
        <div className="relative h-64 md:h-72 bg-[#0a0a0f] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-xl">
          {isCamOn && !camPermissionDenied ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                activeArMask === 'blur' ? 'blur-md' : ''
              }`}
            />
          ) : (
            <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center space-y-2 text-white/50">
              <Camera className="w-8 h-8 text-white/30" />
              <span className="text-xs font-mono uppercase tracking-wider">
                {camPermissionDenied ? 'Camera Blocked' : 'Camera Powered Off'}
              </span>
            </div>
          )}

          {/* AR Masks */}
          {activeArMask === 'ghost' && (
            <div className="absolute inset-0 border-4 border-[#D4AF37]/50 rounded-3xl pointer-events-none flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-black/80 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-mono uppercase tracking-widest animate-pulse">
                ✨ Stealth Gold Mask
              </span>
            </div>
          )}
          {activeArMask === 'cyber' && (
            <div className="absolute inset-0 border-4 border-[#00FF85]/50 rounded-3xl pointer-events-none flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-black/80 border border-[#00FF85] text-[#00FF85] text-[10px] font-mono uppercase tracking-widest animate-pulse">
                ⚡ Cyber Neon Mask
              </span>
            </div>
          )}

          {/* User Video Header */}
          <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="font-mono text-[10px] text-white/80 uppercase tracking-wider">You ({currentUser.name})</span>
            <span className="text-[9px] font-mono text-[#00FF85] uppercase">Live HD</span>
          </div>

          {/* User Video Controls Footer */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCamOn(!isCamOn)}
                className={`p-2.5 rounded-full border transition ${
                  isCamOn ? 'bg-black/60 border-white/10 text-white' : 'bg-[#FF4E00] border-[#FF4E00] text-white'
                }`}
                title="Toggle Camera"
              >
                {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-full border transition ${
                  isMicOn ? 'bg-black/60 border-white/10 text-white' : 'bg-[#FF4E00] border-[#FF4E00] text-white'
                }`}
                title="Toggle Microphone"
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            {/* AR Filter Selection */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10 text-[9px] font-mono">
              <button
                onClick={() => setActiveArMask('none')}
                className={`px-2 py-1 rounded-full ${activeArMask === 'none' ? 'bg-white text-black font-bold' : 'text-white/60'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setActiveArMask('ghost')}
                className={`px-2 py-1 rounded-full ${activeArMask === 'ghost' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#D4AF37]'}`}
              >
                Gold
              </button>
              <button
                onClick={() => setActiveArMask('cyber')}
                className={`px-2 py-1 rounded-full ${activeArMask === 'cyber' ? 'bg-[#00FF85] text-black font-bold' : 'text-[#00FF85]'}`}
              >
                Cyber
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar (Start, Stop, Next, Share) */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-3 flex flex-wrap items-center gap-2 shadow-2xl">
        {!isConnected && !isSearching ? (
          <button
            onClick={startMatching}
            className="flex-1 py-3.5 rounded-full bg-[#FF4E00] text-white font-mono font-bold text-xs uppercase tracking-widest hover:opacity-90 transition shadow-xl flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Start Omegle Match</span>
          </button>
        ) : (
          <>
            <button
              onClick={stopCall}
              className="px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition flex items-center gap-1.5"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>

            <button
              onClick={startMatching}
              className="flex-1 py-3 rounded-full bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase tracking-widest hover:opacity-90 transition shadow-xl flex items-center justify-center gap-2"
            >
              <SkipForward className="w-4 h-4 fill-current" />
              <span>Next Stranger ⏭️</span>
            </button>

            {currentRoomId && (
              <button
                onClick={copyRoomLink}
                className="px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white font-mono text-xs uppercase hover:bg-white/20 transition flex items-center gap-1"
                title="Copy Room Code"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Live Text Chat Log */}
      <div className="bg-[#0a0a0f] rounded-3xl border border-white/10 p-4 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-[#FF4E00]" />
            <span>Omegle Live Text Chat</span>
          </span>
          <span className="text-[10px] font-mono text-white/40">Realtime Signaling</span>
        </div>

        {/* Chat Messages Log */}
        <div className="h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin font-sans text-xs">
          {chatLog.map((log, idx) => (
            <div key={idx} className="space-y-0.5">
              {log.sender === 'system' && (
                <div className="p-2 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-mono text-white/70 italic text-center">
                  {log.text}
                </div>
              )}
              {log.sender === 'you' && (
                <div className="flex justify-end">
                  <div className="bg-[#D4AF37] text-black font-medium p-2.5 rounded-2xl rounded-tr-none max-w-[80%] text-xs shadow-md">
                    <span className="font-mono text-[9px] uppercase block opacity-75 font-bold">You ({log.time})</span>
                    {log.text}
                  </div>
                </div>
              )}
              {log.sender === 'stranger' && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 text-white p-2.5 rounded-2xl rounded-tl-none max-w-[80%] text-xs">
                    <span className="font-mono text-[9px] text-[#FF4E00] uppercase block font-bold">Stranger ({log.time})</span>
                    {log.text}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <input
            type="text"
            value={chatMessage}
            onChange={e => setChatMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            disabled={!isConnected}
            placeholder={isConnected ? 'Type a message to stranger...' : 'Connect to a stranger to chat...'}
            className="flex-1 bg-black/60 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] disabled:opacity-40"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !chatMessage.trim()}
            className="p-2.5 rounded-full bg-[#D4AF37] text-black font-bold disabled:opacity-40 hover:scale-105 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Enter Direct Room Code Modal */}
      <AnimatePresence>
        {showRoomCodeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0f] border border-white/20 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setShowRoomCodeModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg text-white">Join Room Code</h3>
                  <p className="text-xs font-mono text-white/50">Enter code shared by a friend</p>
                </div>
              </div>

              <input
                type="text"
                value={joinRoomInput}
                onChange={e => setJoinRoomInput(e.target.value)}
                placeholder="e.g. room_abc123"
                className="w-full bg-black border border-white/20 rounded-2xl p-3 text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowRoomCodeModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={joinDirectRoomCode}
                  className="flex-1 py-3 rounded-2xl bg-[#D4AF37] text-black font-mono font-bold text-xs uppercase shadow-xl"
                >
                  Join Video Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
