export interface GridCoord {
  row: number;
  col: number;
}

export interface CheckersSquareData {
  row: number;
  col: number;
  isDark: boolean;
  notation: number | null;
}

/**
 * Converts (row, col) to notation for either 8x8 (1-32) or 10x10 (1-50) boards.
 */
export function coordToNotation(row: number, col: number, dimension: 8 | 10): number | null {
  if (row < 0 || row >= dimension || col < 0 || col >= dimension) {
    return null;
  }
  // Checkers only takes place on dark squares
  if ((row + col) % 2 !== 1) {
    return null;
  }
  const squaresPerRow = dimension / 2;
  return row * squaresPerRow + Math.floor(col / 2) + 1;
}

/**
 * Converts notation back to (row, col).
 */
export function notationToCoord(notation: number, dimension: 8 | 10): GridCoord | null {
  const maxNotation = (dimension * dimension) / 2;
  if (notation < 1 || notation > maxNotation) return null;

  const squaresPerRow = dimension / 2;
  const idx = notation - 1;
  const row = Math.floor(idx / squaresPerRow);
  const colInRow = idx % squaresPerRow;
  const col = row % 2 === 0 ? colInRow * 2 + 1 : colInRow * 2;

  return { row, col };
}

/**
 * Converts physical drag offset from an origin square into destination square notation.
 */
export function calculateDropNotation(
  originRow: number,
  originCol: number,
  translationX: number,
  translationY: number,
  squareSize: number,
  dimension: 8 | 10
): number | null {
  const originCenterX = (originCol + 0.5) * squareSize;
  const originCenterY = (originRow + 0.5) * squareSize;

  const targetX = originCenterX + translationX;
  const targetY = originCenterY + translationY;

  const targetCol = Math.floor(targetX / squareSize);
  const targetRow = Math.floor(targetY / squareSize);

  return coordToNotation(targetRow, targetCol, dimension);
}
