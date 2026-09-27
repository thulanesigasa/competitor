/**
 * Morabaraba 10-Tier Ranking System
 * Dynamic title progression based on Win Rate, Victories, and Match Volume.
 * Incorporates authentic Southern African tactical titles and cultural subtitles.
 */

export interface RankTier {
  tier: number;
  title: string;
  culturalTitle: string;
  minWinRate: number; // percentage (0 - 100)
  minWins: number;
  minMatches: number;
  description: string;
  badgeColor: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    tier: 1,
    title: 'Novice Scout',
    culturalTitle: 'Umfana',
    minWinRate: 0,
    minWins: 0,
    minMatches: 0,
    description: 'Beginning competitor mastering board intersections and cow placement.',
    badgeColor: '#64748B', // Slate
  },
  {
    tier: 2,
    title: 'Apprentice',
    culturalTitle: 'Murwisi',
    minWinRate: 35,
    minWins: 3,
    minMatches: 5,
    description: 'Recognizes early mill alignments and line connections.',
    badgeColor: '#475569',
  },
  {
    tier: 3,
    title: 'Warrior',
    culturalTitle: 'Iqhawe',
    minWinRate: 45,
    minWins: 6,
    minMatches: 10,
    description: 'Battle-tested competitor forming tactical mills with poise.',
    badgeColor: '#E5A93C', // Gold Accent
  },
  {
    tier: 4,
    title: 'Vanguard',
    culturalTitle: 'Umlweli',
    minWinRate: 52,
    minWins: 12,
    minMatches: 18,
    description: 'Controls the central square and traps enemy sliding moves.',
    badgeColor: '#D97706',
  },
  {
    tier: 5,
    title: 'Tactician',
    culturalTitle: 'Ingcweti',
    minWinRate: 58,
    minWins: 20,
    minMatches: 28,
    description: 'Calculates multi-turn counter-attacks and mill sequences.',
    badgeColor: '#0EA5E9', // Sky Blue
  },
  {
    tier: 6,
    title: 'Commander',
    culturalTitle: 'Induna',
    minWinRate: 64,
    minWins: 30,
    minMatches: 40,
    description: 'Directs the battle transition from placement to sliding dominance.',
    badgeColor: '#6366F1', // Indigo
  },
  {
    tier: 7,
    title: 'Warrior Chief',
    culturalTitle: 'Mambo',
    minWinRate: 70,
    minWins: 45,
    minMatches: 55,
    description: 'Feared chieftain commanding board quadrants with decisive shooting.',
    badgeColor: '#8B5CF6', // Purple
  },
  {
    tier: 8,
    title: 'Champion',
    culturalTitle: 'Shasha',
    minWinRate: 76,
    minWins: 65,
    minMatches: 75,
    description: 'Elite regional champion with Ku-fofa flying precision.',
    badgeColor: '#EC4899', // Rose/Pink
  },
  {
    tier: 9,
    title: 'Grandmaster',
    culturalTitle: 'Isangoma',
    minWinRate: 82,
    minWins: 90,
    minMatches: 100,
    description: 'Visionary strategist anticipating opponent moves 4 plies deep.',
    badgeColor: '#10B981', // Emerald
  },
  {
    tier: 10,
    title: 'Supreme Paramount',
    culturalTitle: 'Kgosi',
    minWinRate: 88,
    minWins: 120,
    minMatches: 130,
    description: 'Legendary sovereign of Morabaraba, undisputed across Southern Africa.',
    badgeColor: '#F59E0B', // Radiant Gold
  },
];

/**
 * Determine RankTier based on competitor career statistics.
 * Evaluates in reverse order from Tier 10 down to Tier 1.
 */
export function getRankFromStats(
  winRate: number = 0,
  wins: number = 0,
  matchesPlayed: number = 0
): RankTier {
  // If no matches have been played, start at Tier 1
  if (matchesPlayed <= 0) {
    return RANK_TIERS[0];
  }

  // Iterate backwards from highest rank to lowest
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    const tier = RANK_TIERS[i];
    // Check if the competitor qualifies for this tier
    if (winRate >= tier.minWinRate && wins >= tier.minWins && matchesPlayed >= tier.minMatches) {
      return tier;
    }
  }

  // Fallback: If player has matches and reasonable win rate but fewer total volume
  if (winRate >= 70 && wins >= 5) return RANK_TIERS[6]; // Warrior Chief
  if (winRate >= 50 && wins >= 3) return RANK_TIERS[2]; // Warrior
  if (winRate >= 35) return RANK_TIERS[1]; // Apprentice

  return RANK_TIERS[0];
}

/**
 * Helper to get just the rank title string for a player.
 */
export function getRankTitle(
  winRate: number = 0,
  wins: number = 0,
  matchesPlayed: number = 0
): string {
  return getRankFromStats(winRate, wins, matchesPlayed).title;
}
