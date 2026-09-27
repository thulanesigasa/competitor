import { AiDifficulty, GamePhase, GameState, Player } from '../types/game';
import {
  formsNewMill,
  getLegalDestinations,
  getLegalShotVertices,
  MILL_TRIPLETS,
  VERTICES,
} from './morabaraba';

export interface AiMoveDecision {
  action: 'place' | 'move' | 'shoot';
  from?: number;
  to?: number;
  shotVertex?: number;
}

/**
 * Evaluates board score from CPU perspective ('player2' vs 'player1').
 */
function evaluateBoard(board: (Player | null)[], cpuPlayer: Player): number {
  const opponent: Player = cpuPlayer === 'player1' ? 'player2' : 'player1';
  let score = 0;

  let cpuCount = 0;
  let oppCount = 0;
  let cpuMills = 0;
  let oppMills = 0;

  for (let i = 0; i < 24; i++) {
    if (board[i] === cpuPlayer) cpuCount++;
    else if (board[i] === opponent) oppCount++;
  }

  score += (cpuCount - oppCount) * 100;

  // Evaluate mills and 2-in-a-row traps
  for (const [a, b, c] of MILL_TRIPLETS) {
    const pieces = [board[a], board[b], board[c]];
    const cpuPieces = pieces.filter((p) => p === cpuPlayer).length;
    const oppPieces = pieces.filter((p) => p === opponent).length;
    const emptyCount = pieces.filter((p) => p === null).length;

    if (cpuPieces === 3) cpuMills++;
    if (oppPieces === 3) oppMills++;

    if (cpuPieces === 2 && emptyCount === 1) score += 30;
    if (oppPieces === 2 && emptyCount === 1) score -= 35; // Blocking opponent mills is crucial
  }

  score += (cpuMills - oppMills) * 80;

  return score;
}

/**
 * Computes the best AI move based on current game state and chosen difficulty.
 */
export function computeAiMove(state: GameState, difficulty: AiDifficulty): AiMoveDecision {
  const cpu: Player = state.currentPlayer;
  const opponent: Player = cpu === 'player1' ? 'player2' : 'player1';
  const cpuPhase: GamePhase = state.phase[cpu];

  // 1. If CPU needs to shoot an opponent cow
  if (state.mustShoot) {
    const legalShots = getLegalShotVertices(state.board, opponent);
    if (legalShots.length === 0) {
      return { action: 'shoot', shotVertex: -1 };
    }

    if (difficulty === 'novice') {
      const randomShot = legalShots[Math.floor(Math.random() * legalShots.length)];
      return { action: 'shoot', shotVertex: randomShot };
    }

    // Warrior/Grandmaster: Prioritize shooting a piece that gives opponent a 2-in-a-row
    let bestShot = legalShots[0];
    let maxThreat = -1;

    for (const v of legalShots) {
      let threat = 0;
      for (const [a, b, c] of MILL_TRIPLETS) {
        if (a === v || b === v || c === v) {
          const others = [a, b, c].filter((x) => x !== v);
          if (state.board[others[0]] === opponent && state.board[others[1]] === null) threat += 10;
          if (state.board[others[0]] === null && state.board[others[1]] === opponent) threat += 10;
        }
      }
      if (threat > maxThreat) {
        maxThreat = threat;
        bestShot = v;
      }
    }
    return { action: 'shoot', shotVertex: bestShot };
  }

  // 2. Placing Phase
  if (cpuPhase === 'placing') {
    const emptyVertices = state.board
      .map((p, idx) => (p === null ? idx : -1))
      .filter((idx) => idx !== -1);

    if (emptyVertices.length === 0) {
      return { action: 'place', to: 0 };
    }

    // Immediate mill win check
    for (const v of emptyVertices) {
      const testBoard = [...state.board];
      testBoard[v] = cpu;
      if (formsNewMill(testBoard, v, cpu)) {
        return { action: 'place', to: v };
      }
    }

    // Immediate block opponent mill
    for (const v of emptyVertices) {
      const testBoard = [...state.board];
      testBoard[v] = opponent;
      if (formsNewMill(testBoard, v, opponent)) {
        return { action: 'place', to: v };
      }
    }

    if (difficulty === 'novice') {
      // 40% random, 60% strategic
      if (Math.random() < 0.4) {
        return { action: 'place', to: emptyVertices[Math.floor(Math.random() * emptyVertices.length)] };
      }
    }

    // Strategic placement: Intersection vertices with highest connectivity (like B4, D2, F4, D6, etc.)
    let bestVertex = emptyVertices[0];
    let bestScore = -Infinity;

    for (const v of emptyVertices) {
      const testBoard = [...state.board];
      testBoard[v] = cpu;
      const score = evaluateBoard(testBoard, cpu) + VERTICES[v].neighbors.length * 5;
      if (score > bestScore) {
        bestScore = score;
        bestVertex = v;
      }
    }

    return { action: 'place', to: bestVertex };
  }

  // 3. Moving or Flying Phase
  const cpuPieces = state.board
    .map((p, idx) => (p === cpu ? idx : -1))
    .filter((idx) => idx !== -1);

  interface MoveCandidate {
    from: number;
    to: number;
    formsMill: boolean;
    score: number;
  }

  const allMoves: MoveCandidate[] = [];

  for (const from of cpuPieces) {
    const legalTos = getLegalDestinations(state.board, from, cpuPhase);
    for (const to of legalTos) {
      const testBoard = [...state.board];
      testBoard[from] = null;
      testBoard[to] = cpu;
      const mill = formsNewMill(testBoard, to, cpu);
      let moveScore = evaluateBoard(testBoard, cpu);
      if (mill) moveScore += 200;

      allMoves.push({ from, to, formsMill: mill, score: moveScore });
    }
  }

  if (allMoves.length === 0) {
    return { action: 'move', from: 0, to: 0 };
  }

  if (difficulty === 'novice') {
    const millMove = allMoves.find((m) => m.formsMill);
    if (millMove && Math.random() > 0.3) return { action: 'move', from: millMove.from, to: millMove.to };
    const randMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    return { action: 'move', from: randMove.from, to: randMove.to };
  }

  // Sort descending by score
  allMoves.sort((a, b) => b.score - a.score);
  return { action: 'move', from: allMoves[0].from, to: allMoves[0].to };
}
