/**
 * K-Reels Ranking System
 * Based on 30 Dec 2025 requirements:
 * - Level 1-20: Rookie
 * - Level 21-50: Bronze
 * - Level 51-100: Silver
 * - Level 101-200: Gold
 * - Level 201+: Platinum
 */

export interface RankTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  minLevel: number;
  maxLevel: number;
  benefits: string[];
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    icon: '🌱',
    color: '#22c55e', // Green
    minLevel: 1,
    maxLevel: 20,
    benefits: [
      'Create and share content',
      'Join clubs',
      'Participate in challenges',
    ],
  },
  {
    id: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    color: '#cd7f32', // Bronze
    minLevel: 21,
    maxLevel: 50,
    benefits: [
      'All Rookie benefits',
      'Create fan clubs',
      'Higher challenge rewards',
      'Custom profile badge',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '🥈',
    color: '#c0c0c0', // Silver
    minLevel: 51,
    maxLevel: 100,
    benefits: [
      'All Bronze benefits',
      'Priority content review',
      'Access to exclusive challenges',
      'Revenue sharing eligibility',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '🥇',
    color: '#ffd700', // Gold
    minLevel: 101,
    maxLevel: 200,
    benefits: [
      'All Silver benefits',
      'Verified creator badge',
      'Featured content priority',
      'Direct monetization',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: '💎',
    color: '#e5e4e2', // Platinum
    minLevel: 201,
    maxLevel: 999,
    benefits: [
      'All Gold benefits',
      'Official creator status',
      'Priority support',
      'Co-creation opportunities',
    ],
  },
];

/**
 * Get rank tier based on user level
 */
export function getRankByLevel(level: number): RankTier {
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel && level <= tier.maxLevel) {
      return tier;
    }
  }
  // Default to last tier for very high levels
  return RANK_TIERS[RANK_TIERS.length - 1];
}

/**
 * Get next rank tier
 */
export function getNextRank(currentRank: RankTier): RankTier | null {
  const currentIndex = RANK_TIERS.findIndex(t => t.id === currentRank.id);
  if (currentIndex < RANK_TIERS.length - 1) {
    return RANK_TIERS[currentIndex + 1];
  }
  return null;
}

/**
 * Calculate XP needed for next level
 */
export function getXPForLevel(level: number): number {
  // XP formula: base 100 + (level * 50)
  return 100 + (level * 50);
}

/**
 * Calculate total XP needed for a level
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/**
 * Get progress percentage to next rank
 */
export function getRankProgress(level: number, currentRank: RankTier): number {
  const levelsInTier = currentRank.maxLevel - currentRank.minLevel + 1;
  const currentLevelInTier = level - currentRank.minLevel;
  return Math.min((currentLevelInTier / levelsInTier) * 100, 100);
}

/**
 * Calculate levels remaining to next rank
 */
export function getLevelsToNextRank(level: number, currentRank: RankTier): number {
  return Math.max(currentRank.maxLevel - level + 1, 0);
}

/**
 * XP sources and their values
 */
export const XP_REWARDS = {
  UPLOAD_VIDEO: 50,
  VIDEO_VIEWED: 1, // Per 100 views
  VIDEO_LIKED: 2,
  VIDEO_SHARED: 5,
  CHALLENGE_ENTRY: 20,
  CHALLENGE_WIN: 100,
  CLUB_CREATE: 30,
  CLUB_JOIN: 5,
  DAILY_LOGIN: 10,
  COMMENT: 2,
  RECEIVE_COMMENT: 1,
};
