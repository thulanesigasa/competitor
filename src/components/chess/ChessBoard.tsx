import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';
import { Square, PieceSymbol, Color } from 'chess.js';
import { ChessPieceSvg } from './ChessPieceSvg';

export interface BoardPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

interface ChessBoardProps {
  board: (BoardPiece | null)[][];
  boardSize: number;
  turn: Color;
  selectedSquare: Square | null;
  legalMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  inCheckSquare: Square | null;
  isFlipped?: boolean;
  onSelectSquare: (square: Square) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  boardSize,
  selectedSquare,
  legalMoves,
  lastMove,
  inCheckSquare,
  isFlipped = false,
  onSelectSquare,
}) => {
  const squareSize = boardSize / 8;
  const pieceSize = squareSize * 0.78;

  const rows = isFlipped ? [...board].reverse() : board;
  const currentRanks = isFlipped ? [...RANKS].reverse() : RANKS;
  const currentFiles = isFlipped ? [...FILES].reverse() : FILES;

  return (
    <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
      {rows.map((rowArr, rowIndex) => {
        const rankLabel = currentRanks[rowIndex];
        const displayRow = isFlipped ? [...rowArr].reverse() : rowArr;

        return (
          <View key={`row-${rowIndex}`} style={styles.boardRow}>
            {displayRow.map((piece, colIndex) => {
              const fileLabel = currentFiles[colIndex];
              const squareCoord = `${fileLabel}${rankLabel}` as Square;

              const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selectedSquare === squareCoord;
              const isLegalMove = legalMoves.includes(squareCoord);
              const isLastMoveFrom = lastMove?.from === squareCoord;
              const isLastMoveTo = lastMove?.to === squareCoord;
              const isInCheck = inCheckSquare === squareCoord;

              return (
                <TouchableOpacity
                  key={squareCoord}
                  activeOpacity={0.8}
                  onPress={() => onSelectSquare(squareCoord)}
                  style={[
                    styles.square,
                    { width: squareSize, height: squareSize },
                    isDarkSquare ? styles.darkSquare : styles.lightSquare,
                    (isLastMoveFrom || isLastMoveTo) && styles.lastMoveSquare,
                    isSelected && styles.selectedSquare,
                    isInCheck && styles.inCheckSquare,
                  ]}
                >
                  {/* Rank coordinate indicator (leftmost column) */}
                  {colIndex === 0 && (
                    <RNText
                      style={[
                        styles.coordRankText,
                        { color: isDarkSquare ? '#F1F5F9' : '#64748B' },
                      ]}
                    >
                      {rankLabel}
                    </RNText>
                  )}

                  {/* File coordinate indicator (bottom row) */}
                  {rowIndex === 7 && (
                    <RNText
                      style={[
                        styles.coordFileText,
                        { color: isDarkSquare ? '#F1F5F9' : '#64748B' },
                      ]}
                    >
                      {fileLabel}
                    </RNText>
                  )}

                  {/* Piece Rendering */}
                  {piece && (
                    <ChessPieceSvg
                      type={piece.type}
                      color={piece.color}
                      size={pieceSize}
                    />
                  )}

                  {/* Legal Move Indicators */}
                  {isLegalMove && !piece && (
                    <View style={styles.legalDotIndicator} />
                  )}
                  {isLegalMove && piece && (
                    <View
                      style={[
                        styles.legalCaptureRing,
                        { width: squareSize * 0.9, height: squareSize * 0.9 },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderWidth: 2,
    borderColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightSquare: {
    backgroundColor: '#F1F5F9',
  },
  darkSquare: {
    backgroundColor: '#94A3B8',
  },
  selectedSquare: {
    backgroundColor: '#FDE68A',
    borderWidth: 2,
    borderColor: '#E5A93C',
  },
  lastMoveSquare: {
    backgroundColor: 'rgba(229, 169, 60, 0.3)',
  },
  inCheckSquare: {
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  coordRankText: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '700',
  },
  coordFileText: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontSize: 9,
    fontWeight: '700',
  },
  legalDotIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(229, 169, 60, 0.85)',
  },
  legalCaptureRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#E5A93C',
  },
});
