import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ICheckersEngine } from '../../engine/checkersEngine';
import { coordToNotation, calculateDropNotation } from './checkersMapping';
import { DraggablePiece } from './DraggablePiece';

interface CheckersBoardProps {
  engine: ICheckersEngine;
  boardSize: number;
  currentTurn: 'w' | 'b';
  onAttemptMove: (from: number, to: number) => boolean;
}

export const CheckersBoard: React.FC<CheckersBoardProps> = ({
  engine,
  boardSize,
  currentTurn,
  onAttemptMove,
}) => {
  const dimension = engine.boardSize;
  const squareSize = boardSize / dimension;

  const handleDrop = (
    fromNotation: number,
    translationX: number,
    translationY: number,
    row: number,
    col: number
  ): boolean => {
    const toNotation = calculateDropNotation(
      row,
      col,
      translationX,
      translationY,
      squareSize,
      dimension
    );

    if (toNotation === null || toNotation === fromNotation) {
      return false;
    }

    return onAttemptMove(fromNotation, toNotation);
  };

  const rows = Array.from({ length: dimension }, (_, i) => i);
  const cols = Array.from({ length: dimension }, (_, i) => i);

  return (
    <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
      {rows.map((row) => (
        <View key={`row-${row}`} style={styles.gridRow}>
          {cols.map((col) => {
            const isDark = (row + col) % 2 === 1;
            const notation = coordToNotation(row, col, dimension);
            const piece = notation ? engine.getPiece(notation) : null;
            const canDrag = piece ? piece.color === currentTurn : false;

            return (
              <View
                key={`sq-${row}-${col}`}
                style={[
                  styles.square,
                  { width: squareSize, height: squareSize },
                  isDark ? styles.darkSquare : styles.lightSquare,
                ]}
              >
                {piece && notation !== null && (
                  <DraggablePiece
                    piece={piece}
                    row={row}
                    col={col}
                    notation={notation}
                    squareSize={squareSize}
                    canDrag={canDrag}
                    onDrop={(fromNot, tx, ty) => handleDrop(fromNot, tx, ty, row, col)}
                  />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  gridRow: {
    flexDirection: 'row',
  },
  square: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightSquare: {
    backgroundColor: '#FFFFFF',
  },
  darkSquare: {
    backgroundColor: '#F1F5F9',
  },
});

export default CheckersBoard;
