import { Video, User } from '../types';

// Drama/Movie poster-style thumbnail URLs (portrait orientation)
const POSTER_IMAGES = {
  romance1: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=600&fit=crop',
  romance2: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=600&fit=crop',
  romance3: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=600&fit=crop',
  thriller1: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
  thriller2: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
  thriller3: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
  drama1: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
  drama2: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
  drama3: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=600&fit=crop',
  action1: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&h=600&fit=crop',
  action2: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=600&fit=crop',
  fantasy1: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
  fantasy2: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
  fantasy3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  wedding1: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
  wedding2: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=600&fit=crop',
  sports1: 'https://images.unsplash.com/photo-1461896836934-28e4b76f67b9?w=400&h=600&fit=crop',
  sports2: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
  mafia1: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
  palace1: 'https://images.unsplash.com/photo-1551410224-699683e15636?w=400&h=600&fit=crop',
  palace2: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400&h=600&fit=crop',
  woman1: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
  woman2: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
  woman3: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
  couple1: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop',
  couple2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop',
  man1: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop',
  man2: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
  mysterious1: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
  city1: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=600&fit=crop',
  night1: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
};

// Mock users/channels for seeding
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'dora_hockey',
    displayName: 'Dora Mitchell',
    email: 'dora@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169a82b?w=150&h=150&fit=crop&crop=face',
    bio: 'Hockey enthusiast and college student. Creating sports romance content that makes your heart race! 🏒💕',
    verified: true,
    followersCount: 25000,
    followingCount: 345,
    videosCount: 58,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'user2',
    username: 'mystery_writer',
    displayName: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Mystery novelist and storyteller. Bringing thrilling tales to life! 🎭✨',
    verified: true,
    followersCount: 112000,
    followingCount: 89,
    videosCount: 34,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'user3',
    username: 'passion_drama',
    displayName: 'Marcus Chen',
    email: 'marcus@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Drama producer and director. Creating emotional stories that touch hearts 🎬❤️',
    verified: true,
    followersCount: 795000,
    followingCount: 234,
    videosCount: 156,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'user4',
    username: 'fantasy_realm',
    displayName: 'Sophie Kim',
    email: 'sophie@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    bio: 'Fantasy world builder. Werewolves, alphas, and magical romance await! 🐺✨',
    verified: true,
    followersCount: 458000,
    followingCount: 156,
    videosCount: 89,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'user5',
    username: 'action_zone',
    displayName: 'Jake Thompson',
    email: 'jake@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'Action & thriller content creator. Edge-of-your-seat entertainment! 💥🎬',
    verified: true,
    followersCount: 324000,
    followingCount: 198,
    videosCount: 67,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'user6',
    username: 'royal_tales',
    displayName: 'Isabella Wang',
    email: 'isabella@example.com',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    bio: 'Historical drama & palace intrigue specialist. Step into the royal court! 👑🏰',
    verified: true,
    followersCount: 567000,
    followingCount: 87,
    videosCount: 112,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'user7',
    username: 'romance_studio',
    displayName: 'Emma Davis',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    bio: 'Romance content creator. Love stories that make you believe in happily ever after 💕📖',
    verified: false,
    followersCount: 189000,
    followingCount: 234,
    videosCount: 45,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: 'user8',
    username: 'kdrama_world',
    displayName: 'Min-jun Park',
    email: 'minjun@example.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    bio: 'K-Drama enthusiast & content creator. Bringing Korean storytelling to the world! 🇰🇷🎭',
    verified: true,
    followersCount: 892000,
    followingCount: 45,
    videosCount: 234,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// Sample channels for display (derived from users who are creators)
export interface Channel {
  id: string;
  name: string;
  username: string;
  avatar: string;
  banner?: string;
  bio: string;
  category: string;
  verified: boolean;
  followersCount: number;
  videosCount: number;
  isFollowing?: boolean;
}

export const mockChannels: Channel[] = [
  {
    id: 'user1',
    name: 'Dora Mitchell',
    username: 'dora_hockey',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b169a82b?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1461896836934-28e4b76f67b9?w=800&h=300&fit=crop',
    bio: 'Hockey enthusiast and college student. Creating sports romance content! 🏒💕',
    category: 'Entertainment',
    verified: true,
    followersCount: 25000,
    videosCount: 58,
    isFollowing: true,
  },
  {
    id: 'user2',
    name: 'Elena Rodriguez',
    username: 'mystery_writer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&h=300&fit=crop',
    bio: 'Mystery novelist and storyteller. Bringing thrilling tales to life! 🎭✨',
    category: 'Entertainment',
    verified: true,
    followersCount: 112000,
    videosCount: 34,
    isFollowing: true,
  },
  {
    id: 'user3',
    name: 'Marcus Chen',
    username: 'passion_drama',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=300&fit=crop',
    bio: 'Drama producer and director. Creating emotional stories that touch hearts 🎬❤️',
    category: 'Entertainment',
    verified: true,
    followersCount: 795000,
    videosCount: 156,
    isFollowing: false,
  },
  {
    id: 'user4',
    name: 'Sophie Kim',
    username: 'fantasy_realm',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=300&fit=crop',
    bio: 'Fantasy world builder. Werewolves, alphas, and magical romance await! 🐺✨',
    category: 'Entertainment',
    verified: true,
    followersCount: 458000,
    videosCount: 89,
    isFollowing: true,
  },
  {
    id: 'user5',
    name: 'Jake Thompson',
    username: 'action_zone',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&h=300&fit=crop',
    bio: 'Action & thriller content creator. Edge-of-your-seat entertainment! 💥🎬',
    category: 'Entertainment',
    verified: true,
    followersCount: 324000,
    videosCount: 67,
    isFollowing: false,
  },
  {
    id: 'user6',
    name: 'Isabella Wang',
    username: 'royal_tales',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1551410224-699683e15636?w=800&h=300&fit=crop',
    bio: 'Historical drama & palace intrigue specialist. Step into the royal court! 👑🏰',
    category: 'Entertainment',
    verified: true,
    followersCount: 567000,
    videosCount: 112,
    isFollowing: true,
  },
  {
    id: 'user7',
    name: 'Emma Davis',
    username: 'romance_studio',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=300&fit=crop',
    bio: 'Romance content creator. Love stories that make you believe in happily ever after 💕📖',
    category: 'Entertainment',
    verified: false,
    followersCount: 189000,
    videosCount: 45,
    isFollowing: false,
  },
  {
    id: 'user8',
    name: 'Min-jun Park',
    username: 'kdrama_world',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=300&fit=crop',
    bio: 'K-Drama enthusiast & content creator. Bringing Korean storytelling to the world! 🇰🇷🎭',
    category: 'Entertainment',
    verified: true,
    followersCount: 892000,
    videosCount: 234,
    isFollowing: true,
  },
];

// Get followed channels
export const getFollowedChannels = (): Channel[] => {
  return mockChannels.filter(channel => channel.isFollowing);
};

// Get all channels
export const getAllChannels = (): Channel[] => {
  return mockChannels;
};

// Get channel by ID
export const getChannelById = (id: string): Channel | undefined => {
  return mockChannels.find(channel => channel.id === id);
};

// Get videos by channel/user ID
export const getVideosByChannelId = (channelId: string): Video[] => {
  return mockVideos.filter(video => video.userId === channelId);
};

// Comprehensive video data for all categories
export const mockVideos: Video[] = [
  // Core Popular Videos
  {
    id: 'v1',
    title: 'A Deal With The Hockey Captain',
    description: 'Nerdy college girl Dora joins the hockey team as an assistant, secretly in love with Leo.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.sports2,
    duration: 3480,
    views: 28400000,
    likes: 892000,
    comments: 15600,
    shares: 8900,
    userId: 'user1',
    user: mockUsers[0],
    tags: ['romance', 'sports', 'college', 'love triangle', 'young adult', 'hot'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-15',
  },
  {
    id: 'v2',
    title: 'Wife on the Run, Again!',
    description: 'Sarah discovers her husband\'s secret identity and must flee with her children.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.thriller1,
    duration: 2640,
    views: 16200000,
    likes: 284000,
    comments: 12300,
    shares: 5600,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['thriller', 'action', 'family', 'hidden identity', 'marshal', 'suspense'],
    isLiked: true,
    isFollowing: true,
    createdAt: '2024-06-20',
  },
  {
    id: 'v3',
    title: 'Divorced at the Wedding Day',
    description: 'Emma discovers shocking truth about her fiancé minutes before walking down the aisle.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    thumbnailUrl: POSTER_IMAGES.wedding1,
    duration: 4200,
    views: 130000000,
    likes: 485000,
    comments: 89600,
    shares: 34500,
    userId: 'user3',
    user: mockUsers[2],
    tags: ['drama', 'romance', 'betrayal', 'wedding', 'family bonds', 'revenge', 'hot'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-25',
  },
  {
    id: 'v4',
    title: 'Haunted by Shadows of You',
    description: 'A woman discovers her late husband\'s dark secrets that continue to haunt her.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.mysterious1,
    duration: 3240,
    views: 8600000,
    likes: 444000,
    comments: 23400,
    shares: 12300,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['thriller', 'betrayal', 'mystery', 'hot', 'wife chasing'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-28',
  },
  {
    id: 'v5',
    title: 'The Hacker\'s Revenge Code',
    description: 'When a brilliant hacker\'s sister is kidnapped, he must use all his skills.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.action2,
    duration: 2040,
    views: 12000000,
    likes: 978000,
    comments: 23400,
    shares: 12300,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['thriller', 'technology', 'action', 'hidden identity'],
    isLiked: false,
    isFollowing: true,
    createdAt: '2024-07-02',
  },
  // Romance Category Videos
  {
    id: 'v11',
    title: 'Infertile Alpha\'s Pregnant Mate',
    description: 'Luna discovers she\'s mated to an Alpha who believes he can never have children.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.fantasy1,
    duration: 3240,
    views: 5400000,
    likes: 1456000,
    comments: 45600,
    shares: 19800,
    userId: 'user1',
    user: mockUsers[0],
    tags: ['fantasy', 'romance', 'werewolf', 'new', 'alpha'],
    isLiked: true,
    isFollowing: false,
    createdAt: '2024-07-01',
  },
  {
    id: 'v12',
    title: 'The Rejected Luna is the Alpha',
    description: 'Banished and broken, she returns as the most powerful Alpha ever seen.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.woman1,
    duration: 2700,
    views: 12300000,
    likes: 567000,
    comments: 23400,
    shares: 11200,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['fantasy', 'werewolf', 'revenge', 'hot', 'alpha', 'luna'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-30',
  },
  // New Release Videos
  {
    id: 'v13',
    title: 'Cuteness Overload: The Empire Trembles',
    description: 'A little girl\'s innocent charm brings down the most powerful empire.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.palace1,
    duration: 1800,
    views: 128000,
    likes: 12800,
    comments: 890,
    shares: 456,
    userId: 'user3',
    user: mockUsers[2],
    tags: ['drama', 'family intrigue', 'revenge', 'new', 'palace'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-07-02',
  },
  {
    id: 'v14',
    title: 'Dawn of Defiance',
    description: 'A strong heroine rises against all odds to challenge the corrupt system.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.woman2,
    duration: 2400,
    views: 62700,
    likes: 6270,
    comments: 345,
    shares: 189,
    userId: 'user1',
    user: mockUsers[0],
    tags: ['drama', 'revenge', 'strong heroine', 'new', 'defiance'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-07-02',
  },
  {
    id: 'v15',
    title: 'He Who Shaped the Empire',
    description: 'The untold story of a brilliant strategist who built an empire from shadows.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.man1,
    duration: 3600,
    views: 110000,
    likes: 11000,
    comments: 567,
    shares: 234,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['drama', 'historical', 'royalty', 'new', 'empire'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-07-02',
  },
  {
    id: 'v16',
    title: 'Palace of Poisoned Grace',
    description: 'In the imperial palace, grace can be deadly and every smile hides a dagger.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.palace2,
    duration: 2100,
    views: 7900,
    likes: 790,
    comments: 89,
    shares: 45,
    userId: 'user3',
    user: mockUsers[2],
    tags: ['drama', 'palace intrigue', 'revenge', 'new', 'historical'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-07-02',
  },
  // Additional Popular Videos
  {
    id: 'v17',
    title: 'Mafia\'s 90-Day Bride',
    description: 'Forced into a contract marriage with a ruthless mafia boss.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.mafia1,
    duration: 4500,
    views: 11900000,
    likes: 890000,
    comments: 34500,
    shares: 17800,
    userId: 'user1',
    user: mockUsers[0],
    tags: ['romance', 'mafia', 'contract marriage', 'hot', 'bride'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-28',
  },
  {
    id: 'v18',
    title: 'Loving You From the Football Sidelines',
    description: 'A dedicated team manager falls for the star quarterback.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.romance1,
    duration: 3300,
    views: 5500000,
    likes: 445000,
    comments: 18900,
    shares: 9800,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['romance', 'sports', 'football', 'exclusive', 'love triangle'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-30',
  },
  {
    id: 'v19',
    title: 'For Love and Nothing Less',
    description: 'A woman with a secret baby must choose between past love and future happiness.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.couple1,
    duration: 2700,
    views: 1840000,
    likes: 184000,
    comments: 8900,
    shares: 4500,
    userId: 'user3',
    user: mockUsers[2],
    tags: ['romance', 'secret baby', 'wife chasing', 'drama'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-25',
  },
  // Counterattack Category
  {
    id: 'v20',
    title: 'The Ashes of His Name (DUBBED)',
    description: 'A tale of forbidden love and redemption set against war-torn kingdom.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.drama1,
    duration: 5400,
    views: 45600000,
    likes: 2340000,
    comments: 89600,
    shares: 45600,
    userId: 'user1',
    user: mockUsers[0],
    tags: ['drama', 'romance', 'war', 'dubbed', 'hot', 'counterattack'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-20',
  },
  {
    id: 'v21',
    title: 'What Remains After Love Burns Out',
    description: 'After a devastating breakup, two former lovers must navigate intertwined lives.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.romance2,
    duration: 2880,
    views: 5100000,
    likes: 234000,
    comments: 12600,
    shares: 7800,
    userId: 'user3',
    user: mockUsers[2],
    tags: ['drama', 'romance', 'hidden identity', 'hot', 'counterattack'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-30',
  },
  {
    id: 'v22',
    title: 'When Lies Speak Again',
    description: 'A gripping tale of deception where truth becomes the most dangerous weapon.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.thriller2,
    duration: 2100,
    views: 2900000,
    likes: 234000,
    comments: 12600,
    shares: 6700,
    userId: 'user2',
    user: mockUsers[1],
    tags: ['thriller', 'revenge', 'deception', 'hot', 'mystery'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-28',
  },
  // Heroine Category
  {
    id: 'v23',
    title: 'Ex-Wife 2.0: Richer, Colder, Untouchable',
    description: 'After devastating divorce, she returns transformed - richer, colder, untouchable.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: POSTER_IMAGES.woman3,
    duration: 3600,
    views: 6100000,
    likes: 445000,
    comments: 23400,
    shares: 12300,
    userId: 'user3',
    user: mockUsers[2],
    tags: ['drama', 'revenge', 'strong heroine', 'hot', 'ex wife'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-30',
  },
  // Fantasy Category
  {
    id: 'v24',
    title: 'Reborn Under Siege',
    description: 'Given a second chance at life, she must navigate dangerous palace intrigue.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.fantasy2,
    duration: 2700,
    views: 3100000,
    likes: 278000,
    comments: 15600,
    shares: 8900,
    userId: 'user1',
    user: mockUsers[0],
    tags: ['fantasy', 'rebirth', 'toxic love', 'hot', 'palace'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-28',
  },
  // Additional videos for more variety
  {
    id: 'v25',
    title: 'The CEO\'s Secret Love',
    description: 'She never expected her one-night stand to be her new billionaire boss.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.man2,
    duration: 3000,
    views: 8500000,
    likes: 567000,
    comments: 34500,
    shares: 15600,
    userId: 'user7',
    user: mockUsers[6],
    tags: ['romance', 'ceo', 'office', 'hot', 'billionaire'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-22',
  },
  {
    id: 'v26',
    title: 'Midnight in Seoul',
    description: 'Two strangers meet at midnight, changing their fates forever.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.night1,
    duration: 2400,
    views: 4200000,
    likes: 345000,
    comments: 18900,
    shares: 9800,
    userId: 'user8',
    user: mockUsers[7],
    tags: ['romance', 'drama', 'new', 'korean'],
    isLiked: false,
    isFollowing: true,
    createdAt: '2024-07-01',
  },
  {
    id: 'v27',
    title: 'The Dragon Prince\'s Bride',
    description: 'A commoner girl is chosen to marry the most feared prince in the kingdom.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.fantasy3,
    duration: 3600,
    views: 7800000,
    likes: 489000,
    comments: 27800,
    shares: 14500,
    userId: 'user4',
    user: mockUsers[3],
    tags: ['fantasy', 'romance', 'royalty', 'hot', 'prince'],
    isLiked: false,
    isFollowing: true,
    createdAt: '2024-06-18',
  },
  {
    id: 'v28',
    title: 'Undercover Hearts',
    description: 'Two undercover agents fall in love, not knowing they\'re hunting each other.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.action1,
    duration: 2700,
    views: 6700000,
    likes: 423000,
    comments: 21500,
    shares: 11200,
    userId: 'user5',
    user: mockUsers[4],
    tags: ['action', 'romance', 'thriller', 'hot', 'spy'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-24',
  },
  // Videos for new channels
  {
    id: 'v29',
    title: 'Alpha\'s Forbidden Mate',
    description: 'An omega discovers she\'s mated to the most powerful alpha in the realm.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.fantasy1,
    duration: 3200,
    views: 9200000,
    likes: 678000,
    comments: 45600,
    shares: 23400,
    userId: 'user4',
    user: mockUsers[3],
    tags: ['fantasy', 'werewolf', 'romance', 'hot', 'alpha'],
    isLiked: true,
    isFollowing: true,
    createdAt: '2024-06-28',
  },
  {
    id: 'v30',
    title: 'The Royal Concubine\'s Revenge',
    description: 'Betrayed by the emperor, she plots her rise from concubine to empress.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.palace1,
    duration: 4200,
    views: 12400000,
    likes: 890000,
    comments: 56700,
    shares: 34500,
    userId: 'user6',
    user: mockUsers[5],
    tags: ['drama', 'historical', 'palace', 'revenge', 'hot'],
    isLiked: false,
    isFollowing: true,
    createdAt: '2024-06-25',
  },
  {
    id: 'v31',
    title: 'Love After the Storm',
    description: 'Two broken hearts find each other after devastating losses.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.couple2,
    duration: 2800,
    views: 5600000,
    likes: 423000,
    comments: 28900,
    shares: 15600,
    userId: 'user7',
    user: mockUsers[6],
    tags: ['romance', 'drama', 'healing', 'love'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-30',
  },
  {
    id: 'v32',
    title: 'My Secret Korean Boyfriend',
    description: 'An exchange student falls for a mysterious K-pop trainee.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.city1,
    duration: 2600,
    views: 18900000,
    likes: 1234000,
    comments: 89700,
    shares: 56700,
    userId: 'user8',
    user: mockUsers[7],
    tags: ['romance', 'korean', 'kpop', 'hot', 'new'],
    isLiked: true,
    isFollowing: true,
    createdAt: '2024-07-02',
  },
  {
    id: 'v33',
    title: 'The Mercenary\'s Heart',
    description: 'A cold-hearted mercenary meets the one person who can thaw his frozen heart.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.thriller3,
    duration: 3100,
    views: 7800000,
    likes: 534000,
    comments: 34500,
    shares: 18900,
    userId: 'user5',
    user: mockUsers[4],
    tags: ['action', 'thriller', 'romance', 'mercenary'],
    isLiked: false,
    isFollowing: false,
    createdAt: '2024-06-20',
  },
  {
    id: 'v34',
    title: 'Pack Wars: Rise of the Luna',
    description: 'When wolf packs go to war, one luna must rise to save them all.',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: POSTER_IMAGES.mysterious1,
    duration: 3800,
    views: 11200000,
    likes: 789000,
    comments: 56700,
    shares: 34500,
    userId: 'user4',
    user: mockUsers[3],
    tags: ['fantasy', 'werewolf', 'action', 'luna', 'hot'],
    isLiked: false,
    isFollowing: true,
    createdAt: '2024-06-15',
  },
];

// Categories for organizing content
export const categories = [
  { id: 'romance', name: 'Romance', color: '#FF69B4' },
  { id: 'drama', name: 'Drama', color: '#8A2BE2' },
  { id: 'thriller', name: 'Thriller', color: '#DC143C' },
  { id: 'action', name: 'Action', color: '#FF4500' },
  { id: 'fantasy', name: 'Fantasy', color: '#9370DB' },
  { id: 'comedy', name: 'Comedy', color: '#FFD700' },
  { id: 'sports', name: 'Sports', color: '#32CD32' },
  { id: 'college', name: 'College', color: '#20B2AA' },
  { id: 'counterattack', name: 'Counterattack', color: '#FF6347' },
  { id: 'heroine', name: 'Heroine', color: '#DA70D6' },
  { id: 'original+', name: 'Original+', color: '#FF1493' },
];

// Category filters for Categories tab
export const categoryFilters = {
  region: ['All', 'Local', 'Asian'],
  language: ['All', 'Dubbed', 'Subtitles Only'],
  pricing: ['All', 'Paid', 'Free'],
  genre: ['All', 'Werewolf', 'Hidden Identity', 'CEO', 'BL'],
  trending: ['Trending', 'Latest'],
};

// Helper functions for filtering and organizing content
export const getVideosByCategory = (category: string): Video[] => {
  switch (category) {
    case 'Popular':
      return mockVideos.filter(video =>
        video.views > 10000000 || video.tags.includes('hot')
      ).sort((a, b) => b.views - a.views);
    case 'New':
      return mockVideos.filter(video =>
        video.tags.includes('new') ||
        new Date(video.createdAt) > new Date('2024-07-01')
      );
    case 'Rankings':
      return [...mockVideos].sort((a, b) => b.likes - a.likes);
    case 'Categories':
      return mockVideos.filter(video =>
        video.tags.includes('hot') && video.views > 5000000
      );
    case 'Romance':
      return mockVideos.filter(video =>
        video.tags.includes('romance') || video.tags.includes('love triangle')
      );
    case 'Fantasy':
      return mockVideos.filter(video =>
        video.tags.includes('fantasy') || video.tags.includes('werewolf')
      );
    case 'Counterattack':
      return mockVideos.filter(video =>
        video.tags.includes('counterattack') || video.tags.includes('revenge')
      );
    case 'Heroine':
      return mockVideos.filter(video =>
        video.tags.includes('strong heroine') || video.tags.includes('heroine')
      );
    case 'Original+':
      return mockVideos.filter(video =>
        video.tags.includes('exclusive') || video.tags.includes('original')
      );
    default:
      return mockVideos;
  }
};

export const getFeaturedVideoForCategory = (category: string): Video | null => {
  const featured: Record<string, string> = {
    'Romance': 'A Deal With The Hockey Captain',
    'Fantasy': 'Infertile Alpha\'s Pregnant Mate',
    'Counterattack': 'The Ashes of His Name (DUBBED)',
    'Heroine': 'Divorced at the Wedding Day',
    'Original+': 'The Rejected Alpha Queen Comes Back',
  };

  const title = featured[category];
  return title ? mockVideos.find(v => v.title === title) || null : null;
};

export const getRankingsData = () => {
  return [
    {
      rank: 1,
      title: 'Divorced at the Wedding Day',
      categories: 'Family Bonds, Revenge',
      likes: 485000
    },
    {
      rank: 2,
      title: 'Haunted by Shadows of You',
      categories: 'Betrayal, Wife Chasing',
      likes: 444000
    },
    {
      rank: 3,
      title: 'Copyright attributes, sharing may lead to commercial infringement.',
      categories: 'Adventure, Action',
      likes: 336000
    },
    {
      rank: 4,
      title: 'Wife on the Run, Again!',
      categories: 'Hidden Identity, Marshal',
      likes: 284000
    },
    {
      rank: 5,
      title: 'A Deal With The Hockey Captain',
      categories: 'Love Triangle, Young Adult',
      likes: 200000
    },
    {
      rank: 6,
      title: 'For Love and Nothing Less',
      categories: 'Secret Baby, Wife Chasing',
      likes: 184000
    },
  ];
};

// Helper functions for formatting
export const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`;
  }
  return views.toString();
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getEpisodeInfo = (videoId: string): { current: number; total: number } => {
  const episodeMap: Record<string, { current: number; total: number }> = {
    'v1': { current: 1, total: 58 },
    'v2': { current: 3, total: 24 },
    'v3': { current: 1, total: 1 },
    'v4': { current: 1, total: 45 },
    'v5': { current: 1, total: 34 },
    'v11': { current: 2, total: 58 },
    'v12': { current: 1, total: 24 },
  };

  return episodeMap[videoId] || { current: 1, total: 1 };
};

// Home tab-specific content filters
export const getFollowingVideos = (): Video[] => {
  return mockVideos.filter(video => video.isFollowing);
};

export const getTrendingVideos = (): Video[] => {
  return [...mockVideos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
};

export const getDramaVideos = (): Video[] => {
  return mockVideos.filter(video =>
    video.tags.includes('drama') ||
    video.tags.includes('romance') ||
    video.tags.includes('betrayal')
  );
};

export const getLiveVideos = (): Video[] => {
  // For now, return some videos marked as "live" - in real app these would be actual live streams
  return mockVideos.slice(0, 4).map(video => ({
    ...video,
    isLive: true,
  }));
};
