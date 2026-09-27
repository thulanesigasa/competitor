import { supabase } from '../lib/supabase';
import { LeaderboardEntry, INITIAL_REGIONAL_LEADERBOARD } from '../store/gameStore';

export const leaderboardService = {
  /**
   * Fetch live regional leaderboard from Supabase career_stats & profiles.
   */
  async getRegionalLeaderboard(countryFilter?: string): Promise<LeaderboardEntry[]> {
    try {
      let query = supabase
        .from('career_stats')
        .select(`
          user_id,
          elo_rating,
          win_rate,
          wins,
          profiles (
            id,
            gamer_tag,
            country,
            country_code,
            province,
            town,
            title
          )
        `)
        .order('elo_rating', { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return this.filterFallback(countryFilter);
      }

      const entries: LeaderboardEntry[] = [];
      let rankCounter = 1;

      for (const row of data as any[]) {
        const profile = row.profiles;
        if (!profile) continue;

        // Apply country filter if selected
        if (
          countryFilter &&
          countryFilter !== 'All Nations' &&
          profile.country.toLowerCase() !== countryFilter.toLowerCase()
        ) {
          continue;
        }

        entries.push({
          rank: rankCounter++,
          gamerTag: profile.gamer_tag || 'Warrior',
          country: profile.country || 'South Africa',
          countryCode: profile.country_code || 'ZA',
          province: profile.province || 'Gauteng',
          town: profile.town || 'Johannesburg',
          elo: row.elo_rating || 1200,
          winRate: Math.round(Number(row.win_rate) || 0),
          wins: row.wins || 0,
          title: profile.title || 'Warrior',
        });
      }

      if (entries.length === 0) {
        return this.filterFallback(countryFilter);
      }

      return entries;
    } catch {
      return this.filterFallback(countryFilter);
    }
  },

  filterFallback(countryFilter?: string): LeaderboardEntry[] {
    if (!countryFilter || countryFilter === 'All Nations') {
      return INITIAL_REGIONAL_LEADERBOARD;
    }
    return INITIAL_REGIONAL_LEADERBOARD.filter(
      (entry) => entry.country.toLowerCase() === countryFilter.toLowerCase()
    );
  },
};
