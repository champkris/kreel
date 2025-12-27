// Gift types and coin packages for Live Gifting and Wallet Top-up

export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number; // in coins
  animation?: 'bounce' | 'spin' | 'pulse' | 'shake' | 'float';
  category: 'basic' | 'premium' | 'special' | 'legendary';
  color: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  price: number; // in USD
  popular?: boolean;
  bestValue?: boolean;
}

export interface GiftGoal {
  id: string;
  title: string;
  targetCoins: number;
  currentCoins: number;
  reward: string;
}

export interface GiftLeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  totalGifts: number;
  totalCoins: number;
  rank: number;
  badge?: 'top1' | 'top3' | 'top10' | 'supporter';
}

// Available gifts for live streams
export const GIFTS: Gift[] = [
  // Basic gifts (1-50 coins)
  { id: 'heart', name: 'Heart', icon: '❤️', price: 1, animation: 'float', category: 'basic', color: '#FF6B6B' },
  { id: 'rose', name: 'Rose', icon: '🌹', price: 5, animation: 'float', category: 'basic', color: '#FF4757' },
  { id: 'star', name: 'Star', icon: '⭐', price: 10, animation: 'spin', category: 'basic', color: '#FFD700' },
  { id: 'clap', name: 'Applause', icon: '👏', price: 15, animation: 'bounce', category: 'basic', color: '#FFEAA7' },
  { id: 'fire', name: 'Fire', icon: '🔥', price: 25, animation: 'shake', category: 'basic', color: '#FF6348' },
  { id: 'kiss', name: 'Kiss', icon: '💋', price: 50, animation: 'pulse', category: 'basic', color: '#FF6B81' },

  // Premium gifts (100-500 coins)
  { id: 'diamond', name: 'Diamond', icon: '💎', price: 100, animation: 'spin', category: 'premium', color: '#74B9FF' },
  { id: 'crown', name: 'Crown', icon: '👑', price: 200, animation: 'bounce', category: 'premium', color: '#FFD700' },
  { id: 'gift', name: 'Gift Box', icon: '🎁', price: 300, animation: 'shake', category: 'premium', color: '#E84393' },
  { id: 'rocket', name: 'Rocket', icon: '🚀', price: 500, animation: 'float', category: 'premium', color: '#00D2D3' },

  // Special gifts (1000-5000 coins)
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', price: 1000, animation: 'pulse', category: 'special', color: '#A29BFE' },
  { id: 'unicorn', name: 'Unicorn', icon: '🦄', price: 2000, animation: 'bounce', category: 'special', color: '#FD79A8' },
  { id: 'castle', name: 'Castle', icon: '🏰', price: 3000, animation: 'shake', category: 'special', color: '#FDCB6E' },
  { id: 'sports_car', name: 'Sports Car', icon: '🏎️', price: 5000, animation: 'spin', category: 'special', color: '#E74C3C' },

  // Legendary gifts (10000+ coins)
  { id: 'yacht', name: 'Yacht', icon: '🛥️', price: 10000, animation: 'float', category: 'legendary', color: '#0984E3' },
  { id: 'jet', name: 'Private Jet', icon: '✈️', price: 20000, animation: 'float', category: 'legendary', color: '#6C5CE7' },
  { id: 'planet', name: 'Planet', icon: '🪐', price: 50000, animation: 'spin', category: 'legendary', color: '#00CEC9' },
];

// Coin packages for top-up
export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pack_1', coins: 100, bonusCoins: 0, price: 0.99 },
  { id: 'pack_2', coins: 500, bonusCoins: 25, price: 4.99 },
  { id: 'pack_3', coins: 1000, bonusCoins: 100, price: 9.99, popular: true },
  { id: 'pack_4', coins: 2500, bonusCoins: 350, price: 24.99 },
  { id: 'pack_5', coins: 5000, bonusCoins: 1000, price: 49.99, bestValue: true },
  { id: 'pack_6', coins: 10000, bonusCoins: 2500, price: 99.99 },
];

// Payment methods
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'apple_pay' | 'google_pay' | 'credit_card' | 'paypal' | 'stripe';
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'apple_pay', name: 'Apple Pay', icon: 'logo-apple', type: 'apple_pay' },
  { id: 'google_pay', name: 'Google Pay', icon: 'logo-google', type: 'google_pay' },
  { id: 'credit_card', name: 'Credit Card', icon: 'card', type: 'credit_card' },
  { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', type: 'paypal' },
];

// Quick send amounts
export const QUICK_SEND_AMOUNTS = [1, 5, 10, 25, 50, 100];

// Mock leaderboard data
export const MOCK_LEADERBOARD: GiftLeaderboardEntry[] = [
  { id: '1', userId: 'u1', username: 'DiamondFan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', totalGifts: 156, totalCoins: 125000, rank: 1, badge: 'top1' },
  { id: '2', userId: 'u2', username: 'SuperSupporter', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', totalGifts: 98, totalCoins: 85000, rank: 2, badge: 'top3' },
  { id: '3', userId: 'u3', username: 'GiftKing', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', totalGifts: 87, totalCoins: 72000, rank: 3, badge: 'top3' },
  { id: '4', userId: 'u4', username: 'LovelyFan', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', totalGifts: 65, totalCoins: 45000, rank: 4, badge: 'top10' },
  { id: '5', userId: 'u5', username: 'StarGazer', totalGifts: 42, totalCoins: 28000, rank: 5, badge: 'top10' },
];

// Mock gift goal
export const MOCK_GIFT_GOAL: GiftGoal = {
  id: 'goal1',
  title: 'Unlock Special Dance Performance',
  targetCoins: 50000,
  currentCoins: 32500,
  reward: 'Exclusive behind-the-scenes content',
};

// Format coin display
export const formatCoins = (coins: number): string => {
  if (coins >= 1000000) {
    return (coins / 1000000).toFixed(1) + 'M';
  }
  if (coins >= 1000) {
    return (coins / 1000).toFixed(1) + 'K';
  }
  return coins.toString();
};

// Format price display
export const formatPrice = (price: number): string => {
  return '$' + price.toFixed(2);
};
