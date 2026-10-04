declare module 'draughts' {
  export class Draughts {
    constructor(fen?: string);
    turn(): string;
    moves(square?: number): Array<{
      from: number;
      to: number;
      flags: string;
      piece: string;
      takes?: number[];
      jumps?: number[];
    }>;
    getLegalMoves(square: number): Array<{
      from: number;
      to: number;
      takes?: number[];
      jumps?: number[];
    }>;
    move(moveObject: { from: number; to: number }): any;
    fen(): string;
    gameOver(): boolean;
    inDraw(): boolean;
    reset(): void;
    get(square: number): any;
  }

  const DraughtsExport: typeof Draughts;
  export default DraughtsExport;
}
