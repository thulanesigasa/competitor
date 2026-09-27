import { GamePhase, GameState, Player } from '../types/game';
import { VERTICES, isPartOfMill, getLegalDestinations, getLegalShotVertices } from './morabaraba';

export type RuleViolationCode =
  | 'NOT_PLAYER_TURN'
  | 'MUST_SHOOT_FIRST'
  | 'NO_ACTIVE_SHOOT'
  | 'ALL_COWS_PLACED'
  | 'INTERSECTION_OCCUPIED'
  | 'CANNOT_MOVE_DURING_PLACING'
  | 'WRONG_HERD_SELECTION'
  | 'COW_IS_TRAPPED'
  | 'DESTINATION_OCCUPIED'
  | 'NON_ADJACENT_MOVE'
  | 'FLIGHT_INELIGIBLE'
  | 'FRIENDLY_FIRE_FORBIDDEN'
  | 'INVALID_EMPTY_TARGET'
  | 'SACRED_MILL_PROTECTION'
  | 'RAPID_INPUT_THROTTLED'
  | 'THREEFOLD_REPETITION_STALL'
  | 'DELIBERATION_TIMEOUT'
  | 'PEER_PACKET_DESYNC';

export interface RuleTip {
  code: RuleViolationCode;
  title: string;
  message: string;
}

export interface ValidationSuccess {
  isValid: true;
}

export interface ValidationFailure {
  isValid: false;
  tip: RuleTip;
}

export type ValidationOutcome = ValidationSuccess | ValidationFailure;

export interface MoveRecord {
  player: Player;
  from?: number;
  to: number;
  timestamp: number;
}

/**
 * Validates player input timing against inhuman bot reaction speeds.
 * Standard human physical touch reaction latency is ~250ms+.
 */
export function validateHumanReactionRate(
  lastActionTimestamp: number | null,
  minThresholdMs = 260
): ValidationOutcome {
  if (lastActionTimestamp === null) {
    return { isValid: true };
  }
  const delta = Date.now() - lastActionTimestamp;
  if (delta < minThresholdMs) {
    return {
      isValid: false,
      tip: {
        code: 'RAPID_INPUT_THROTTLED',
        title: 'FAIR PLAY: REACTION SPEED LIMIT',
        message:
          'Input registered at sub-human reaction speed (<260ms). Automated click bots, macro scripts, and artificial inputs are prohibited in competitive Morabaraba.',
      },
    };
  }
  return { isValid: true };
}

/**
 * Validates threefold repetition loops to prevent bot deadlock / infinite stalling.
 */
export function validateThreefoldRepetition(
  recentMoves: MoveRecord[],
  candidate: { player: Player; from: number; to: number }
): ValidationOutcome {
  if (recentMoves.length < 5) {
    return { isValid: true };
  }

  // Filter moves for this specific player
  const playerMoves = recentMoves.filter((m) => m.player === candidate.player && m.from !== undefined);
  if (playerMoves.length < 3) {
    return { isValid: true };
  }

  const lastMove = playerMoves[playerMoves.length - 1];
  const secondLast = playerMoves[playerMoves.length - 2];
  const thirdLast = playerMoves[playerMoves.length - 3];

  // Pattern: A->B, B->A, A->B, and candidate is B->A again (3rd oscillation)
  if (
    thirdLast.from === candidate.to &&
    thirdLast.to === candidate.from &&
    secondLast.from === candidate.from &&
    secondLast.to === candidate.to &&
    lastMove.from === candidate.to &&
    lastMove.to === candidate.from
  ) {
    return {
      isValid: false,
      tip: {
        code: 'THREEFOLD_REPETITION_STALL',
        title: 'TACTICAL TIP: THREEFOLD REPETITION',
        message:
          'Moving the same cow back and forth across identical intersections 3 consecutive times is prohibited by tournament regulations. You must choose an alternative tactical line.',
      },
    };
  }

  return { isValid: true };
}

/**
 * Enforces strict Morabaraba placement rules.
 */
export function validatePlacement(
  gameState: GameState,
  actingPlayer: Player,
  vertexId: number
): ValidationOutcome {
  if (gameState.currentPlayer !== actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'NOT_PLAYER_TURN',
        title: 'TACTICAL TIP: OPPONENT’S TURN',
        message:
          'You may only command the board when it is your active turn. Please wait for your opponent to complete their action.',
      },
    };
  }

  if (gameState.mustShoot) {
    return {
      isValid: false,
      tip: {
        code: 'MUST_SHOOT_FIRST',
        title: 'TACTICAL TIP: CAPTURE PENDING (UMPHAHLO)',
        message:
          'You formed a mill! Under authentic Morabaraba rules, you must capture an opponent cow immediately before taking any further action.',
      },
    };
  }

  if (gameState.unplacedCows[actingPlayer] <= 0) {
    return {
      isValid: false,
      tip: {
        code: 'ALL_COWS_PLACED',
        title: 'TACTICAL TIP: PLACING PHASE COMPLETED',
        message:
          'All 12 cows have already been placed onto the board. You must now select an existing cow and slide it along connected lines.',
      },
    };
  }

  if (gameState.board[vertexId] !== null) {
    return {
      isValid: false,
      tip: {
        code: 'INTERSECTION_OCCUPIED',
        title: 'TACTICAL TIP: OCCUPIED INTERSECTION',
        message:
          'In Morabaraba, cows can only be kraaled on empty line intersections. That intersection already holds a cow.',
      },
    };
  }

  return { isValid: true };
}

/**
 * Enforces strict cow selection rules in Moving and Flying phases.
 */
export function validateCowSelection(
  gameState: GameState,
  actingPlayer: Player,
  vertexId: number
): ValidationOutcome {
  if (gameState.currentPlayer !== actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'NOT_PLAYER_TURN',
        title: 'TACTICAL TIP: OPPONENT’S TURN',
        message:
          'You may only command the board when it is your active turn. Please wait for your opponent to complete their action.',
      },
    };
  }

  if (gameState.mustShoot) {
    return {
      isValid: false,
      tip: {
        code: 'MUST_SHOOT_FIRST',
        title: 'TACTICAL TIP: CAPTURE PENDING',
        message:
          'You formed a mill (umphahlo)! You must shoot an opponent cow before selecting another cow to move.',
      },
    };
  }

  if (gameState.phase[actingPlayer] === 'placing') {
    return {
      isValid: false,
      tip: {
        code: 'CANNOT_MOVE_DURING_PLACING',
        title: 'TACTICAL TIP: PLACING PHASE ACTIVE',
        message:
          'All 12 cows must be placed sequentially on the board before any cow is permitted to slide along the lines.',
      },
    };
  }

  if (gameState.board[vertexId] !== actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'WRONG_HERD_SELECTION',
        title: 'TACTICAL TIP: HERD OWNERSHIP',
        message:
          'You can only select and command cows belonging to your own herd. You cannot select opponent cows or empty intersections.',
      },
    };
  }

  // If in moving phase, check if cow is completely trapped with 0 open neighbors
  if (gameState.phase[actingPlayer] === 'moving') {
    const openNeighbors = VERTICES[vertexId].neighbors.filter((n) => gameState.board[n] === null);
    if (openNeighbors.length === 0) {
      return {
        isValid: false,
        tip: {
          code: 'COW_IS_TRAPPED',
          title: 'TACTICAL TIP: TRAPPED COW',
          message:
            'This cow is boxed in with all adjacent lines occupied. Select an open, unblocked cow from your herd.',
        },
      };
    }
  }

  return { isValid: true };
}

/**
 * Enforces strict cow destination rules for sliding (moving) and flight (flying).
 */
export function validateCowMove(
  gameState: GameState,
  actingPlayer: Player,
  fromVertex: number,
  toVertex: number,
  recentMoves: MoveRecord[] = []
): ValidationOutcome {
  if (gameState.currentPlayer !== actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'NOT_PLAYER_TURN',
        title: 'TACTICAL TIP: OPPONENT’S TURN',
        message:
          'You may only command the board when it is your active turn. Please wait for your opponent to complete their action.',
      },
    };
  }

  if (gameState.mustShoot) {
    return {
      isValid: false,
      tip: {
        code: 'MUST_SHOOT_FIRST',
        title: 'TACTICAL TIP: CAPTURE PENDING',
        message:
          'You formed a mill (umphahlo)! You must shoot an opponent cow before moving.',
      },
    };
  }

  if (gameState.board[fromVertex] !== actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'WRONG_HERD_SELECTION',
        title: 'TACTICAL TIP: HERD OWNERSHIP',
        message: 'You can only move cows belonging to your own herd.',
      },
    };
  }

  if (gameState.board[toVertex] !== null) {
    return {
      isValid: false,
      tip: {
        code: 'DESTINATION_OCCUPIED',
        title: 'TACTICAL TIP: DESTINATION BLOCKED',
        message: 'A cow cannot land on an intersection that already holds another cow.',
      },
    };
  }

  const playerPhase: GamePhase = gameState.phase[actingPlayer];

  // Moving Phase: must be an immediate connected neighbor
  if (playerPhase === 'moving') {
    const isAdjacent = VERTICES[fromVertex].neighbors.includes(toVertex);
    if (!isAdjacent) {
      return {
        isValid: false,
        tip: {
          code: 'NON_ADJACENT_MOVE',
          title: 'TACTICAL TIP: CONNECTED ADJACENCY',
          message:
            'In the Moving Phase, cows must slide strictly along drawn lines to an adjacent connected intersection. Teleporting across the board is prohibited.',
        },
      };
    }
  }

  // Flying Phase: only unlocked when reduced to exactly 3 cows and hand is empty
  if (playerPhase === 'flying') {
    if (gameState.activeCows[actingPlayer] > 3 || gameState.unplacedCows[actingPlayer] > 0) {
      return {
        isValid: false,
        tip: {
          code: 'FLIGHT_INELIGIBLE',
          title: 'TACTICAL TIP: FLIGHT RESTRICTION (KU-FOFA)',
          message:
            'Flight across any vacant intersection is exclusively granted when your herd is reduced to exactly 3 cows. With 4 or more cows, you must slide strictly along connected lines.',
        },
      };
    }
  }

  // Anti-Bot Stalling & Threefold Repetition Check
  const repCheck = validateThreefoldRepetition(recentMoves, {
    player: actingPlayer,
    from: fromVertex,
    to: toVertex,
  });
  if (!repCheck.isValid) {
    return repCheck;
  }

  return { isValid: true };
}

/**
 * Enforces strict sacred mill shoot rules (Umphahlo Protection).
 */
export function validateCowShot(
  gameState: GameState,
  actingPlayer: Player,
  vertexId: number
): ValidationOutcome {
  if (gameState.currentPlayer !== actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'NOT_PLAYER_TURN',
        title: 'TACTICAL TIP: OPPONENT’S TURN',
        message:
          'You may only command the board when it is your active turn. Please wait for your opponent to complete their action.',
      },
    };
  }

  if (!gameState.mustShoot) {
    return {
      isValid: false,
      tip: {
        code: 'NO_ACTIVE_SHOOT',
        title: 'TACTICAL TIP: NO MILL FORMED',
        message:
          'Shooting an opponent cow is only unlocked when you successfully align 3 of your cows into an active mill (umphahlo).',
      },
    };
  }

  if (gameState.board[vertexId] === actingPlayer) {
    return {
      isValid: false,
      tip: {
        code: 'FRIENDLY_FIRE_FORBIDDEN',
        title: 'TACTICAL TIP: FRIENDLY FIRE FORBIDDEN',
        message: 'You cannot shoot or sacrifice your own herd. You must target an opponent cow.',
      },
    };
  }

  if (gameState.board[vertexId] === null) {
    return {
      isValid: false,
      tip: {
        code: 'INVALID_EMPTY_TARGET',
        title: 'TACTICAL TIP: EMPTY INTERSECTION',
        message: 'You must target an active opponent cow, not an empty intersection.',
      },
    };
  }

  const opponent: Player = actingPlayer === 'player1' ? 'player2' : 'player1';
  const isTargetInMill = isPartOfMill(gameState.board, vertexId, opponent);

  if (isTargetInMill) {
    // Check if opponent has ANY cows NOT in mills
    const opponentCowIndices = gameState.board
      .map((p, idx) => (p === opponent ? idx : -1))
      .filter((idx) => idx !== -1);

    const nonMillCows = opponentCowIndices.filter(
      (idx) => !isPartOfMill(gameState.board, idx, opponent)
    );

    if (nonMillCows.length > 0) {
      return {
        isValid: false,
        tip: {
          code: 'SACRED_MILL_PROTECTION',
          title: 'TACTICAL TIP: SACRED MILL PROTECTION',
          message:
            'Cows locked in an opponent mill are sacred and protected from capture. You cannot shoot a mill cow unless ALL opponent cows on the board are in mills.',
        },
      };
    }
  }

  return { isValid: true };
}
