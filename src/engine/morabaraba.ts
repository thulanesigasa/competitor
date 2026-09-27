import { BoardVertex, GamePhase, GameState, Player } from '../types/game';

export const VERTICES: BoardVertex[] = [
  // Outer Square (0 - 7)
  { id: 0, label: 'A1', x: 0.08, y: 0.08, neighbors: [1, 7, 8] },
  { id: 1, label: 'D1', x: 0.50, y: 0.08, neighbors: [0, 2, 9] },
  { id: 2, label: 'G1', x: 0.92, y: 0.08, neighbors: [1, 3, 10] },
  { id: 3, label: 'G4', x: 0.92, y: 0.50, neighbors: [2, 4, 11] },
  { id: 4, label: 'G7', x: 0.92, y: 0.92, neighbors: [3, 5, 12] },
  { id: 5, label: 'D7', x: 0.50, y: 0.92, neighbors: [4, 6, 13] },
  { id: 6, label: 'A7', x: 0.08, y: 0.92, neighbors: [5, 7, 14] },
  { id: 7, label: 'A4', x: 0.08, y: 0.50, neighbors: [6, 0, 15] },

  // Middle Square (8 - 15)
  { id: 8, label: 'B2', x: 0.22, y: 0.22, neighbors: [9, 15, 0, 16] },
  { id: 9, label: 'D2', x: 0.50, y: 0.22, neighbors: [8, 10, 1, 17] },
  { id: 10, label: 'F2', x: 0.78, y: 0.22, neighbors: [9, 11, 2, 18] },
  { id: 11, label: 'F4', x: 0.78, y: 0.50, neighbors: [10, 12, 3, 19] },
  { id: 12, label: 'F6', x: 0.78, y: 0.78, neighbors: [11, 13, 4, 20] },
  { id: 13, label: 'D6', x: 0.50, y: 0.78, neighbors: [12, 14, 5, 21] },
  { id: 14, label: 'B6', x: 0.22, y: 0.78, neighbors: [13, 15, 6, 22] },
  { id: 15, label: 'B4', x: 0.22, y: 0.50, neighbors: [14, 8, 7, 23] },

  // Inner Square (16 - 23)
  { id: 16, label: 'C3', x: 0.36, y: 0.36, neighbors: [17, 23, 8] },
  { id: 17, label: 'D3', x: 0.50, y: 0.36, neighbors: [16, 18, 9] },
  { id: 18, label: 'E3', x: 0.64, y: 0.36, neighbors: [17, 19, 10] },
  { id: 19, label: 'E4', x: 0.64, y: 0.50, neighbors: [18, 20, 11] },
  { id: 20, label: 'E5', x: 0.64, y: 0.64, neighbors: [19, 21, 12] },
  { id: 21, label: 'D5', x: 0.50, y: 0.64, neighbors: [20, 22, 13] },
  { id: 22, label: 'C5', x: 0.36, y: 0.64, neighbors: [21, 23, 14] },
  { id: 23, label: 'C4', x: 0.36, y: 0.50, neighbors: [22, 16, 15] },
];

export const MILL_TRIPLETS: [number, number, number][] = [
  // Outer perimeter
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],

  // Middle perimeter
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],

  // Inner perimeter
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],

  // Cardinal cross lines
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],

  // Diagonals (Authentic Morabaraba feature)
  [0, 8, 16],
  [2, 10, 18],
  [4, 12, 20],
  [6, 14, 22],
];

export const BOARD_LINES: [number, number][] = [
  // Outer square
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Middle square
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  // Inner square
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  // Cardinals
  [1, 9], [9, 17],
  [3, 11], [11, 19],
  [5, 13], [13, 21],
  [7, 15], [15, 23],
  // Diagonals
  [0, 8], [8, 16],
  [2, 10], [10, 18],
  [4, 12], [12, 20],
  [6, 14], [14, 22],
];

export const TOTAL_COWS_PER_PLAYER = 12;

export function createInitialGameState(startingPlayer: Player = 'player1'): GameState {
  return {
    board: Array(24).fill(null),
    currentPlayer: startingPlayer,
    phase: {
      player1: 'placing',
      player2: 'placing',
    },
    unplacedCows: {
      player1: TOTAL_COWS_PER_PLAYER,
      player2: TOTAL_COWS_PER_PLAYER,
    },
    activeCows: {
      player1: 0,
      player2: 0,
    },
    capturedCows: {
      player1: 0,
      player2: 0,
    },
    mustShoot: false,
    selectedVertex: null,
    winner: null,
    turnCount: 1,
    lastMove: null,
  };
}

/**
 * Checks if a specific vertex is part of ANY completed mill for the given player.
 */
export function isPartOfMill(board: (Player | null)[], vertexId: number, player: Player): boolean {
  if (board[vertexId] !== player) return false;
  return MILL_TRIPLETS.some(([a, b, c]) => {
    if (a === vertexId || b === vertexId || c === vertexId) {
      return board[a] === player && board[b] === player && board[c] === player;
    }
    return false;
  });
}

/**
 * Checks if placing or moving to vertexId newly creates or completes a mill.
 */
export function formsNewMill(board: (Player | null)[], vertexId: number, player: Player): boolean {
  return MILL_TRIPLETS.some(([a, b, c]) => {
    if (a === vertexId || b === vertexId || c === vertexId) {
      return board[a] === player && board[b] === player && board[c] === player;
    }
    return false;
  });
}

/**
 * Returns list of opponent vertices that can legally be shot/captured.
 * Rule: An opponent cow in a mill CANNOT be shot UNLESS all opponent cows are in mills.
 */
export function getLegalShotVertices(board: (Player | null)[], opponent: Player): number[] {
  const opponentCows = board
    .map((p, idx) => (p === opponent ? idx : -1))
    .filter((idx) => idx !== -1);

  const cowsNotInMill = opponentCows.filter((idx) => !isPartOfMill(board, idx, opponent));

  if (cowsNotInMill.length > 0) {
    return cowsNotInMill;
  }
  // If all opponent cows are in mills, any opponent cow may be shot
  return opponentCows;
}

/**
 * Computes legal destination vertices for a piece at `fromVertex` in moving/flying phase.
 */
export function getLegalDestinations(
  board: (Player | null)[],
  fromVertex: number,
  phase: GamePhase
): number[] {
  if (phase === 'flying') {
    return board.map((p, idx) => (p === null ? idx : -1)).filter((idx) => idx !== -1);
  }
  // Normal moving phase: adjacent empty vertices only
  return VERTICES[fromVertex].neighbors.filter((neighborId) => board[neighborId] === null);
}

/**
 * Checks if a player has any legal moves available in moving or flying phase.
 */
export function hasLegalMoves(board: (Player | null)[], player: Player, phase: GamePhase): boolean {
  if (phase === 'placing') {
    return board.some((p) => p === null);
  }
  const playerVertices = board
    .map((p, idx) => (p === player ? idx : -1))
    .filter((idx) => idx !== -1);

  if (phase === 'flying') {
    return board.some((p) => p === null) && playerVertices.length > 0;
  }

  return playerVertices.some((vId) => getLegalDestinations(board, vId, phase).length > 0);
}
