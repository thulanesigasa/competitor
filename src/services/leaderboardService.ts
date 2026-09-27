import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '../store/gameStore';
import { getRankTitle } from '../constants/ranks';

export const leaderboardService = {
  /**
   * Fetch live regional leaderboard from Supabase career_stats & profiles.
   * Strictly returns live database entries with zero mock data.
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
          losses,
          matches_played,
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
        return [];
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
          profile.country &&
          profile.country.toLowerCase() !== countryFilter.toLowerCase()
        ) {
          continue;
        }

        const winRate = Math.round(Number(row.win_rate) || 0);
        const wins = row.wins || 0;
        const matches = row.matches_played || (wins + (row.losses || 0));
        const dynamicTitle = getRankTitle(winRate, wins, matches);

        entries.push({
          rank: rankCounter++,
          gamerTag: profile.gamer_tag || 'Competitor',
          country: profile.country || 'South Africa',
          countryCode: profile.country_code || 'ZA',
          province: profile.province || 'Gauteng',
          town: profile.town || '',
          elo: row.elo_rating || 1200,
          winRate,
          wins,
          title: dynamicTitle,
        });
      }

      return entries;
    } catch {
      return [];
    }
  },
};

