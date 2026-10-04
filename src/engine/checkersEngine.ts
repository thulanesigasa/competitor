import DraughtsEngine from 'draughts';

const Draughts = (DraughtsEngine as any).Draughts || DraughtsEngine;

export type PieceColor = 'w' | 'b';

export interface CheckersPiece {
  color: PieceColor;
  isKing: boolean;
}

export interface CheckersMove {
  from: number;
  to: number;
  captures?: number[];
  isPromotion?: boolean;
}

export interface ICheckersEngine {
  readonly boardSize: 8 | 10;
  turn(): PieceColor;
  getPiece(notation: number): CheckersPiece | null;
  moves(square?: number): CheckersMove[];
  move(moveObj: { from: number; to: number }): boolean;
  gameOver(): boolean;
  inDraw(): boolean;
  getWinner(): PieceColor | 'draw' | null;
  reset(): void;
}

/**
 * 10x10 International Draughts Engine using the 'draughts' npm package.
 * Squares are 1 to 50 on dark squares.
 */
export class InternationalDraughtsEngine implements ICheckersEngine {
  readonly boardSize: 8 | 10 = 10;
  private engine: any;

  constructor() {
    this.engine = new Draughts();
  }

  turn(): PieceColor {
    const t = this.engine.turn();
    return (t ? t.toLowerCase() : 'w') as PieceColor;
  }

  getPiece(notation: number): CheckersPiece | null {
    if (notation < 1 || notation > 50) return null;
    const p = this.engine.get(notation);
    if (!p || p === '0' || p === 0) return null;
    const char = typeof p === 'string' ? p : p.piece;
    if (!char || char === '0') return null;
    return {
      color: char.toLowerCase() as PieceColor,
      isKing: char === char.toUpperCase(),
    };
  }

  moves(square?: number): CheckersMove[] {
    const rawMoves = square ? this.engine.getLegalMoves(square) : this.engine.moves();
    if (!Array.isArray(rawMoves)) return [];
    return rawMoves.map((m: any) => ({
      from: m.from,
      to: m.to,
      captures: m.takes || m.jumps || [],
      isPromotion: m.flags === 'p',
    }));
  }

  move(moveObj: { from: number; to: number }): boolean {
    const res = this.engine.move(moveObj);
    return !!res;
  }

  gameOver(): boolean {
    return this.engine.gameOver ? this.engine.gameOver() : false;
  }

  inDraw(): boolean {
    return this.engine.inDraw ? this.engine.inDraw() : false;
  }

  getWinner(): PieceColor | 'draw' | null {
    if (!this.gameOver()) return null;
    if (this.inDraw()) return 'draw';
    // The player whose turn it is has no legal moves, so the other player wins
    return this.turn() === 'w' ? 'b' : 'w';
  }

  reset(): void {
    if (this.engine.reset) {
      this.engine.reset();
    } else {
      this.engine = new Draughts();
    }
  }
}

/**
 * 8x8 Classic Checkers Engine (32 dark squares, numbered 1 to 32).
 * Implements standard rules: diagonal single step, diagonal jump captures,
 * and King crowning upon reaching the opposing baseline.
 */
export class ClassicCheckers8x8Engine implements ICheckersEngine {
  readonly boardSize: 8 | 10 = 8;
  private squares: Map<number, CheckersPiece> = new Map();
  private currentTurn: PieceColor = 'w';
  private moveHistory: Array<{ from: number; to: number; captured?: number; wasKing?: boolean }> = [];

  constructor() {
    this.reset();
  }

  turn(): PieceColor {
    return this.currentTurn;
  }

  getPiece(notation: number): CheckersPiece | null {
    const p = this.squares.get(notation);
    return p ? { ...p } : null;
  }

  reset(): void {
    this.squares.clear();
    this.currentTurn = 'w';
    this.moveHistory = [];

    // Black pieces on squares 1 to 12
    for (let i = 1; i <= 12; i++) {
      this.squares.set(i, { color: 'b', isKing: false });
    }
    // White pieces on squares 21 to 32
    for (let i = 21; i <= 32; i++) {
      this.squares.set(i, { color: 'w', isKing: false });
    }
  }

  /**
   * Helper: converts 1-32 notation to 8x8 (row, col).
   */
  private notationToCoord(sq: number): { row: number; col: number } {
    const idx = sq - 1;
    const row = Math.floor(idx / 4);
    const colInRow = idx % 4;
    const col = row % 2 === 0 ? colInRow * 2 + 1 : colInRow * 2;
    return { row, col };
  }

  /**
   * Helper: converts 8x8 (row, col) to 1-32 notation, or null if light/out of bounds.
   */
  private coordToNotation(row: number, col: number): number | null {
    if (row < 0 || row > 7 || col < 0 || col > 7 || (row + col) % 2 !== 1) {
      return null;
    }
    return row * 4 + Math.floor(col / 2) + 1;
  }

  moves(square?: number): CheckersMove[] {
    const moves: CheckersMove[] = [];
    const jumps: CheckersMove[] = [];

    const squaresToCheck = square ? [square] : Array.from(this.squares.keys());

    for (const sq of squaresToCheck) {
      const piece = this.squares.get(sq);
      if (!piece || piece.color !== this.currentTurn) continue;

      const { row, col } = this.notationToCoord(sq);

      // Directions: White moves row - 1, Black moves row + 1, Kings move both
      const rowDeltas: number[] = [];
      if (piece.isKing) {
        rowDeltas.push(-1, 1);
      } else if (piece.color === 'w') {
        rowDeltas.push(-1);
      } else {
        rowDeltas.push(1);
      }

      for (const dRow of rowDeltas) {
        for (const dCol of [-1, 1]) {
          // 1. Check simple single-step moves
          const nextRow = row + dRow;
          const nextCol = col + dCol;
          const nextSq = this.coordToNotation(nextRow, nextCol);

          if (nextSq !== null && !this.squares.has(nextSq)) {
            moves.push({ from: sq, to: nextSq });
          }

          // 2. Check jump captures (2 squares)
          const jumpOverRow = row + dRow;
          const jumpOverCol = col + dCol;
          const landRow = row + dRow * 2;
          const landCol = col + dCol * 2;

          const jumpOverSq = this.coordToNotation(jumpOverRow, jumpOverCol);
          const landSq = this.coordToNotation(landRow, landCol);

          if (jumpOverSq !== null && landSq !== null) {
            const jumpedPiece = this.squares.get(jumpOverSq);
            if (jumpedPiece && jumpedPiece.color !== piece.color && !this.squares.has(landSq)) {
              jumps.push({
                from: sq,
                to: landSq,
                captures: [jumpOverSq],
              });
            }
          }
        }
      }
    }

    // In checkers, if any jump capture exists, jumping is mandatory
    if (jumps.length > 0) {
      return jumps;
    }
    return moves;
  }

  move(moveObj: { from: number; to: number }): boolean {
    const legalMoves = this.moves();
    const isLegal = legalMoves.find((m) => m.from === moveObj.from && m.to === moveObj.to);
    if (!isLegal) return false;

    const piece = this.squares.get(moveObj.from);
    if (!piece) return false;

    // Remove source piece
    this.squares.delete(moveObj.from);

    // Handle captures
    if (isLegal.captures && isLegal.captures.length > 0) {
      for (const cap of isLegal.captures) {
        this.squares.delete(cap);
      }
    }

    // Check King promotion
    const { row: targetRow } = this.notationToCoord(moveObj.to);
    let promoted = piece.isKing;
    if (piece.color === 'w' && targetRow === 0) {
      promoted = true;
    } else if (piece.color === 'b' && targetRow === 7) {
      promoted = true;
    }

    this.squares.set(moveObj.to, { color: piece.color, isKing: promoted });

    // Switch turn
    this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';
    return true;
  }

  gameOver(): boolean {
    return this.moves().length === 0;
  }

  inDraw(): boolean {
    // Drawn if only 1 king remains per player
    if (this.squares.size === 2) {
      const pieces = Array.from(this.squares.values());
      if (pieces.every((p) => p.isKing)) return true;
    }
    return false;
  }

  getWinner(): PieceColor | 'draw' | null {
    if (!this.gameOver()) return null;
    if (this.inDraw()) return 'draw';
    return this.currentTurn === 'w' ? 'b' : 'w';
  }
}

/**
 * Factory creating the engine according to the selected dimension.
 */
export function createCheckersEngine(mode: '8x8' | '10x10'): ICheckersEngine {
  return mode === '10x10' ? new InternationalDraughtsEngine() : new ClassicCheckers8x8Engine();
}
