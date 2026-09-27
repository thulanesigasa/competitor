import { supabase } from '../lib/supabase';
import { Player } from '../types/game';

export interface MoveBroadcastPayload {
  type: 'place' | 'move' | 'fly' | 'shoot';
  player: Player;
  from?: number;
  to?: number;
  shotVertex?: number;
  formedMill?: boolean;
}

export const gameSyncService = {
  /**
   * Subscribe to low-latency peer WebSocket events for an active battle room.
   */
  subscribeToMatch(
    roomId: string,
    callbacks: {
      onMove: (payload: MoveBroadcastPayload) => void;
      onCoinCall?: (side: 'heads' | 'tails') => void;
      onCoinToss: (firstPlayer: Player) => void;
      onMatchEnded?: (winnerId: string) => void;
    }
  ) {
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    channel
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        callbacks.onMove(payload);
      })
      .on('broadcast', { event: 'coin_call' }, ({ payload }) => {
        if (callbacks.onCoinCall) callbacks.onCoinCall(payload.side);
      })
      .on('broadcast', { event: 'coin_toss' }, ({ payload }) => {
        callbacks.onCoinToss(payload.firstPlayer);
      })
      .on('broadcast', { event: 'match_ended' }, ({ payload }) => {
        if (callbacks.onMatchEnded) callbacks.onMatchEnded(payload.winnerId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Broadcast side selection in Pattern 1 coin toss (Challenger calls Heads or Tails).
   */
  async broadcastCoinCall(roomId: string, side: 'heads' | 'tails'): Promise<void> {
    try {
      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'coin_call',
        payload: { side },
      });
    } catch {
      // Ignored
    }
  },

  /**
   * Broadcast a game move to the opponent via WebSockets (<50ms latency).
   */
  async broadcastMove(roomId: string, payload: MoveBroadcastPayload): Promise<void> {
    try {
      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'move',
        payload,
      });
    } catch {
      // Ignored
    }
  },

  /**
   * Broadcast synchronized coin toss result.
   */
  async broadcastCoinToss(roomId: string, firstPlayer: Player): Promise<void> {
    try {
      const channel = supabase.channel(`room:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'coin_toss',
        payload: { firstPlayer },
      });
    } catch {
      // Ignored
    }
  },

  /**
   * Finalize match in Supabase to trigger automated ELO and career stats recalculation.
   */
  async finalizeMatch(
    roomId: string,
    winnerUserId: string
  ): Promise<void> {
    try {
      await supabase
        .from('battle_rooms')
        .update({
          status: 'completed',
          winner_user_id: winnerUserId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', roomId);
    } catch {
      // Ignored
    }
  },
};
