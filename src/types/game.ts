export type Player = 'player1' | 'player2';

export type GamePhase = 'placing' | 'moving' | 'flying';

export type GameMode = 'cpu' | 'pass_and_play' | 'wifi_duel';

export type AiDifficulty = 'novice' | 'warrior' | 'grandmaster';

export interface BoardVertex {
  id: number;
  label: string;
  x: number; // Normalized coordinate 0 to 1
  y: number; // Normalized coordinate 0 to 1
  neighbors: number[];
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  phase: {
    player1: GamePhase;
    player2: GamePhase;
  };
  unplacedCows: {
    player1: number;
    player2: number;
  };
  activeCows: {
    player1: number;
    player2: number;
  };
  capturedCows: {
    player1: number; // Cows player1 captured from player2
    player2: number; // Cows player2 captured from player1
  };
  mustShoot: boolean;
  selectedVertex: number | null;
  winner: Player | 'draw' | null;
  turnCount: number;
  lastMove: {
    from?: number;
    to: number;
    player: Player;
    formedMill?: boolean;
    shotVertex?: number;
  } | null;
}

export interface UserCareerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  millsFormed: number;
  cowsCaptured: number;
  flownCowCount: number;
  winStreak: number;
  eloRating: number;
}

export interface CompetitorProfile {
  id: string;
  gamerTag: string;
  country: string;
  countryCode: string;
  province: string;
  town?: string;
  title: string;
  winRate: number;
  matchesPlayed: number;
  wins: number;
}
