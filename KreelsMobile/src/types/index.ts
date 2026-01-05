// User types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  videosCount: number;
  createdAt: string;
  updatedAt: string;
}

// Video types
export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  thumbnail?: string; // API uses thumbnail
  duration: number;
  views?: number;
  viewCount?: number; // API uses viewCount
  likes?: number;
  likeCount?: number; // API uses likeCount
  comments?: number;
  shares?: number;
  userId?: string;
  creatorId?: string; // API uses creatorId
  user?: User;
  creator?: User; // API uses creator
  tags?: string[];
  isLiked?: boolean;
  isFollowing?: boolean;
  createdAt: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: User;
  videoId: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}