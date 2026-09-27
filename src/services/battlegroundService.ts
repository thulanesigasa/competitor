import { supabase } from '../lib/supabase';
import { CompetitorProfile } from '../types/game';
import { UserProfile } from '../types/auth';
import { getRankTitle } from '../constants/ranks';

export interface BattleRoomData {
  id: string;
  roomCode: string;
  roomType: 'public' | 'private';
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  hostUserId: string;
  challengerUserId?: string | null;
  hostProfile?: CompetitorProfile;
  challengerProfile?: CompetitorProfile;
}

export const battlegroundService = {
  /**
   * Create an online battle room in Supabase.
   */
  async createRoom(
    host: UserProfile,
    roomType: 'public' | 'private'
  ): Promise<{ room: BattleRoomData | null; error: string | null }> {
    try {
      // 1. Generate unique 4-digit code (ensuring no duplicate active room)
      let roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      for (let attempt = 0; attempt < 4; attempt++) {
        const candidate = Math.floor(1000 + Math.random() * 9000).toString();
        const { data: existing } = await supabase
          .from('battle_rooms')
          .select('id')
          .eq('room_code', candidate)
          .eq('status', 'waiting')
          .maybeSingle();

        if (!existing) {
          roomCode = candidate;
          break;
        }
      }

      // 2. Persist room to Supabase in public.battle_rooms
      const { data, error } = await supabase
        .from('battle_rooms')
        .insert({
          room_code: roomCode,
          room_type: roomType,
          status: 'waiting',
          host_user_id: host.id,
        })
        .select()
        .single();

      if (error) {
        return {
          room: {
            id: `local-room-${Date.now()}`,
            roomCode,
            roomType,
            status: 'waiting',
            hostUserId: host.id,
          },
          error: null,
        };
      }

      return {
        room: {
          id: data.id,
          roomCode: data.room_code,
          roomType: data.room_type,
          status: data.status,
          hostUserId: data.host_user_id,
        },
        error: null,
      };
    } catch {
      const fallbackPin = Math.floor(1000 + Math.random() * 9000).toString();
      return {
        room: {
          id: `local-room-${Date.now()}`,
          roomCode: fallbackPin,
          roomType,
          status: 'waiting',
          hostUserId: host.id,
        },
        error: null,
      };
    }
  },

  /**
   * Fetch active public rooms waiting for challengers.
   */
  async fetchPublicLobby(): Promise<CompetitorProfile[]> {
    try {
      const { data, error } = await supabase
        .from('battle_rooms')
        .select(`
          id,
          room_code,
          host_user_id,
          profiles:host_user_id (
            id,
            gamer_tag,
            country,
            country_code,
            province,
            town,
            title,
            career_stats (
              elo_rating,
              win_rate,
              matches_played,
              wins
            )
          )
        `)
        .eq('room_type', 'public')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        return [];
      }

      const hosts: CompetitorProfile[] = [];
      for (const row of data as any[]) {
        const p = row.profiles;
        if (!p) continue;
        const stats = p.career_stats?.[0] || p.career_stats || {};

        const winRate = Math.round(Number(stats.win_rate) || 0);
        const wins = stats.wins || 0;
        const matches = stats.matches_played || (wins + (stats.losses || 0));
        const dynamicTitle = getRankTitle(winRate, wins, matches);

        hosts.push({
          id: row.id,
          gamerTag: p.gamer_tag || 'Competitor',
          country: p.country || 'South Africa',
          countryCode: p.country_code || 'ZA',
          province: p.province || 'Gauteng',
          town: p.town || '',
          title: dynamicTitle,
          winRate,
          matchesPlayed: matches,
          wins,
        });
      }

      return hosts;
    } catch {
      return [];
    }
  },

  /**
   * Join a room via 4-digit code.
   */
  async joinByCode(
    pin: string,
    challenger: UserProfile
  ): Promise<{ room: BattleRoomData | null; hostProfile: CompetitorProfile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('battle_rooms')
        .select(`
          id,
          room_code,
          room_type,
          status,
          host_user_id,
          profiles:host_user_id (
            id,
            gamer_tag,
            country,
            country_code,
            province,
            town,
            title,
            career_stats (
              win_rate,
              matches_played,
              wins
            )
          )
        `)
        .eq('room_code', pin.trim())
        .eq('status', 'waiting')
        .maybeSingle();

      if (error || !data) {
        return { room: null, hostProfile: null, error: 'Battle room not found or match already started.' };
      }

      // Update room to assign challenger
      await supabase
        .from('battle_rooms')
        .update({ challenger_user_id: challenger.id })
        .eq('id', data.id);

      const p: any = data.profiles;
      const stats = p?.career_stats?.[0] || p?.career_stats || {};
      const winRate = Math.round(Number(stats.win_rate) || 0);
      const wins = stats.wins || 0;
      const matches = stats.matches_played || (wins + (stats.losses || 0));
      const dynamicTitle = getRankTitle(winRate, wins, matches);

      const hostProfile: CompetitorProfile = {
        id: data.host_user_id,
        gamerTag: p?.gamer_tag || `Host_${pin}`,
        country: p?.country || 'South Africa',
        countryCode: p?.country_code || 'ZA',
        province: p?.province || 'Gauteng',
        town: p?.town || '',
        title: dynamicTitle,
        winRate,
        matchesPlayed: matches,
        wins,
      };

      return {
        room: {
          id: data.id,
          roomCode: data.room_code,
          roomType: data.room_type,
          status: 'waiting',
          hostUserId: data.host_user_id,
          challengerUserId: challenger.id,
        },
        hostProfile,
        error: null,
      };
    } catch (e: any) {
      return { room: null, hostProfile: null, error: e.message || 'Connection failed.' };
    }
  },

  /**
   * Challenge a public room host.
   */
  async challengePublicHost(roomId: string, challengerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('battle_rooms')
        .update({ challenger_user_id: challengerId })
        .eq('id', roomId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Host accepts challenger and starts match.
   */
  async acceptChallenger(roomId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('battle_rooms')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', roomId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Host declines challenger.
   */
  async declineChallenger(roomId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('battle_rooms')
        .update({ challenger_user_id: null })
        .eq('id', roomId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Cancel / abandon a waiting battle room when the host navigates away.
   */
  async cancelRoom(roomId: string): Promise<void> {
    try {
      await supabase
        .from('battle_rooms')
        .update({ status: 'abandoned' })
        .eq('id', roomId);
    } catch {
      // Ignored
    }
  },

  /**
   * Realtime subscription for competitors browsing the Public Lobby.
   * Automatically refreshes whenever any room is hosted, joined, or closed.
   */
  subscribeToPublicLobby(onUpdate: (hosts: CompetitorProfile[]) => void): () => void {
    const channel = supabase
      .channel('public_battle_rooms_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'battle_rooms' },
        async () => {
          const freshHosts = await battlegroundService.fetchPublicLobby();
          onUpdate(freshHosts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Realtime subscription for a specific active battle room.
   * Tracks challenger arrival and match acceptance.
   */
  subscribeToRoom(
    roomId: string,
    callbacks: {
      onChallengerJoined?: (challenger: CompetitorProfile) => void;
      onChallengerLeft?: () => void;
      onMatchAccepted?: () => void;
    }
  ): () => void {
    const channel = supabase
      .channel(`battle_room_events:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battle_rooms',
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          const room = payload.new as any;
          if (room.challenger_user_id && callbacks.onChallengerJoined) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*, career_stats(*)')
              .eq('id', room.challenger_user_id)
              .maybeSingle();

            if (profile) {
              const stats = profile.career_stats?.[0] || profile.career_stats || {};
              const winRate = Math.round(Number(stats.win_rate) || 0);
              const wins = stats.wins || 0;
              const matches = stats.matches_played || (wins + (stats.losses || 0));
              const dynamicTitle = getRankTitle(winRate, wins, matches);

              callbacks.onChallengerJoined({
                id: profile.id,
                gamerTag: profile.gamer_tag || 'Challenger',
                country: profile.country || 'South Africa',
                countryCode: profile.country_code || 'ZA',
                province: profile.province || 'Gauteng',
                town: profile.town || '',
                title: dynamicTitle,
                winRate,
                matchesPlayed: matches,
                wins,
              });
            }
          } else if (!room.challenger_user_id && callbacks.onChallengerLeft) {
            callbacks.onChallengerLeft();
          }

          if (room.status === 'in_progress' && callbacks.onMatchAccepted) {
            callbacks.onMatchAccepted();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
