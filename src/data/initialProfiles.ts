import { DatingProfile } from '../types';

export const INITIAL_PROFILES: DatingProfile[] = [
  {
    id: 'profile_1',
    name: 'Aria Vance',
    age: 24,
    gender: 'woman',
    job: 'Lead UI/UX Designer',
    company: 'Creative Studio',
    education: 'B.Des in Visual Communication',
    heightCm: 168,
    locationName: 'Downtown Metropolitan',
    distanceKm: 2.4,
    relationshipGoal: 'Long-term relationship',
    bio: 'Designing interfaces by day, hunting for the best espresso & vinyl records by night. Looking for someone who gets excited about spontaneous midnight drives and genuine deep conversations.',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1000'
    ],
    interests: ['UI/UX Design', 'Indie Rock', 'Espresso', 'Photography', 'Bouldering', 'Vinyl Records'],
    lifestyle: {
      drinking: 'Socially',
      smoking: 'Never',
      workout: '3-4 times a week',
      pets: 'Has 1 rescue cat 🐱',
      zodiac: 'Scorpio ♏',
      diet: 'Flexitarian'
    },
    languages: ['English', 'Spanish', 'French'],
    isVerified: true,
    compatibilityScore: 96,
    compatibilityReasons: [
      'Both passionate about design and creative culture',
      'Matching interest in outdoor bouldering and coffee spots',
      'Aligned long-term relationship goals'
    ],
    vibeSummary: 'Instant artistic resonance with shared love for aesthetics, music, and authentic connection.',
    isOnline: true,
    lastSeenText: 'Active now'
  },
  {
    id: 'profile_2',
    name: 'Julian Sterling',
    age: 27,
    gender: 'man',
    job: 'Architectural Engineer',
    company: 'Urban Form Studio',
    education: 'M.Arch Architecture',
    heightCm: 184,
    locationName: 'Westside Arts District',
    distanceKm: 4.1,
    relationshipGoal: 'Dating to marry',
    bio: 'Passionate about sustainable architecture, jazz concerts, and cooking Italian dinners from scratch. Let’s swap favorite travel stories over a glass of wine.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1000'
    ],
    interests: ['Architecture', 'Jazz', 'Italian Cuisine', 'Trail Running', 'Museums', 'Wine Tasting'],
    lifestyle: {
      drinking: 'Weekend enthusiast',
      smoking: 'Never',
      workout: 'Daily runner',
      pets: 'Loves dogs 🐶',
      zodiac: 'Taurus ♉',
      diet: 'Omnivore'
    },
    languages: ['English', 'Italian'],
    isVerified: true,
    compatibilityScore: 92,
    compatibilityReasons: [
      'Shared appreciation for art, design & travel',
      'Matching values on family and long-term stability',
      'Love for culinary experiments and cozy dinners'
    ],
    vibeSummary: 'Warm, grounded, and sophisticated vibe focused on building something enduring.',
    isOnline: false,
    lastSeenText: '12m ago'
  },
  {
    id: 'profile_3',
    name: 'Elena Rostova',
    age: 25,
    gender: 'woman',
    job: 'Classical Violinist & Composer',
    company: 'Philharmonic Orchestra',
    education: 'Conservatory of Music',
    heightCm: 172,
    locationName: 'Old Town Cultural Quarter',
    distanceKm: 1.8,
    relationshipGoal: 'Long-term relationship',
    bio: 'Music is my love language. If you can appreciate a quiet sunset concert, late-night tea talks, and impromptu museum trips, we will get along poetically.',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1000'
    ],
    interests: ['Classical Music', 'Violin', 'Poetry', 'Matcha Tea', 'Art Galleries', 'Astronomy'],
    lifestyle: {
      drinking: 'Rarely',
      smoking: 'Never',
      workout: 'Yoga & Pilates',
      pets: 'None yet',
      zodiac: 'Pisces ♓',
      diet: 'Vegetarian'
    },
    languages: ['English', 'Russian', 'German'],
    isVerified: true,
    compatibilityScore: 94,
    compatibilityReasons: [
      'Complementary creative minds and deep emotional intelligence',
      'Shared love for peaceful arts, matcha, and night walks',
      'Mutual desire for honest, romantic communication'
    ],
    vibeSummary: 'Deeply soul-touching and artistic connection with gentle romantic warmth.',
    isOnline: true,
    lastSeenText: 'Active now'
  },
  {
    id: 'profile_4',
    name: 'Kai Chen',
    age: 26,
    gender: 'man',
    job: 'AI Research Scientist',
    company: 'Quantum Dynamics Lab',
    education: 'Ph.D. Computer Science',
    heightCm: 180,
    locationName: 'Innovation Hub',
    distanceKm: 3.2,
    relationshipGoal: 'Coffee & casual chats',
    bio: 'Training neural nets by day, brewing specialty pour-overs by night. Big fan of sci-fi novels, synthwave music, and stargazing away from city lights.',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000'
    ],
    interests: ['Artificial Intelligence', 'Specialty Coffee', 'Sci-Fi Books', 'Stargazing', 'Synthwave', 'Gaming'],
    lifestyle: {
      drinking: 'Socially',
      smoking: 'Never',
      workout: 'Gym & Swimming',
      pets: 'Cat lover 🐱',
      zodiac: 'Aquarius ♒',
      diet: 'Omnivore'
    },
    languages: ['English', 'Mandarin'],
    isVerified: true,
    compatibilityScore: 89,
    compatibilityReasons: [
      'High intellectual curiosity and technological affinity',
      'Love for quiet sci-fi discussions & artisanal coffee',
      'Easygoing attitude towards exploring chemistry'
    ],
    vibeSummary: 'Curious, clever, and intellectually stimulating partner.',
    isOnline: false,
    lastSeenText: '1h ago'
  },
  {
    id: 'profile_5',
    name: 'Maya Lin',
    age: 23,
    gender: 'woman',
    job: 'Environmental Documentary Filmmaker',
    company: 'Earth Story Media',
    education: 'B.A. Cinema & Ecology',
    heightCm: 165,
    locationName: 'Eco-District',
    distanceKm: 5.8,
    relationshipGoal: 'Still figuring it out',
    bio: 'Documenting ocean reefs and mountain wilderness. Always looking for fellow adventurers who don’t mind getting mud on their boots and sleeping under starry skies.',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=1000'
    ],
    interests: ['Filmmaking', 'Hiking', 'Scuba Diving', 'Ecology', 'Photography', 'Camping'],
    lifestyle: {
      drinking: 'Occasional craft beer',
      smoking: 'Never',
      workout: 'Outdoor trekking',
      pets: 'Has a Golden Retriever 🐕',
      zodiac: 'Sagittarius ♐',
      diet: 'Plant-based'
    },
    languages: ['English', 'Japanese'],
    isVerified: true,
    compatibilityScore: 91,
    compatibilityReasons: [
      'Boundless enthusiasm for nature, travel, and storytelling',
      'Shared values regarding environmental sustainability',
      'Spontaneous spirit that thrives on adventure'
    ],
    vibeSummary: 'Vibrant, free-spirited, and ecologically minded explorer.',
    isOnline: true,
    lastSeenText: 'Active now'
  }
];
