import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { GamePhase, GameState, Player } from '../../types/game';
import {
  getLegalDestinations,
  getLegalShotVertices,
  VERTICES,
} from '../../engine/morabaraba';
import { MorabarabaPiece } from './MorabarabaPiece';

interface MorabarabaBoardProps {
  gameState: GameState;
  onVertexPress: (vertexId: number) => void;
  disabled?: boolean;
}

export const MorabarabaBoard: React.FC<MorabarabaBoardProps> = ({
  gameState,
  onVertexPress,
  disabled = false,
}) => {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - SPACING.md * 2, 360);
  const vertexSize = 32;

  const currentPhase: GamePhase = gameState.phase[gameState.currentPlayer];

  // Calculate legal targets
  let legalDestinations: number[] = [];
  if (gameState.selectedVertex !== null && !gameState.mustShoot) {
    legalDestinations = getLegalDestinations(
      gameState.board,
      gameState.selectedVertex,
      currentPhase
    );
  }

  let legalShots: number[] = [];
  if (gameState.mustShoot) {
    const opponent: Player =
      gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    legalShots = getLegalShotVertices(gameState.board, opponent);
  }

  // Proportional sizing for the 3 concentric squares
  // Outer is from 8% to 92% (span = 84%)
  // Middle is from 22% to 78% (span = 56%)
  // Inner is from 36% to 64% (span = 28%)
  const outerSpan = boardSize * 0.84;
  const middleSpan = boardSize * 0.56;
  const innerSpan = boardSize * 0.28;

  // Diagonal line length across corners: from outer (8%) to inner (36%) is dx=28%, dy=28%
  // Length = sqrt(2) * 28% of boardSize
  const diagLength = Math.SQRT2 * (boardSize * 0.28);

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      {/* 1. Outer Square */}
      <View
        style={[
          styles.square,
          {
            width: outerSpan,
            height: outerSpan,
            top: boardSize * 0.08,
            left: boardSize * 0.08,
          },
        ]}
      />

      {/* 2. Middle Square */}
      <View
        style={[
          styles.square,
          {
            width: middleSpan,
            height: middleSpan,
            top: boardSize * 0.22,
            left: boardSize * 0.22,
          },
        ]}
      />

      {/* 3. Inner Square */}
      <View
        style={[
          styles.square,
          {
            width: innerSpan,
            height: innerSpan,
            top: boardSize * 0.36,
            left: boardSize * 0.36,
          },
        ]}
      />

      {/* 4. Cardinal Cross Lines */}
      {/* Top Midline: from Outer (0.08) to Inner (0.36) */}
      <View
        style={[
          styles.line,
          {
            width: 2,
            height: boardSize * 0.28,
            top: boardSize * 0.08,
            left: boardSize * 0.5 - 1,
          },
        ]}
      />
      {/* Bottom Midline: from Inner (0.64) to Outer (0.92) */}
      <View
        style={[
          styles.line,
          {
            width: 2,
            height: boardSize * 0.28,
            top: boardSize * 0.64,
            left: boardSize * 0.5 - 1,
          },
        ]}
      />
      {/* Left Midline: from Outer (0.08) to Inner (0.36) */}
      <View
        style={[
          styles.line,
          {
            height: 2,
            width: boardSize * 0.28,
            top: boardSize * 0.5 - 1,
            left: boardSize * 0.08,
          },
        ]}
      />
      {/* Right Midline: from Inner (0.64) to Outer (0.92) */}
      <View
        style={[
          styles.line,
          {
            height: 2,
            width: boardSize * 0.28,
            top: boardSize * 0.5 - 1,
            left: boardSize * 0.64,
          },
        ]}
      />

      {/* 5. Diagonal Corner Lines */}
      {/* Top-Left to Inner-Left */}
      <View
        style={[
          styles.line,
          {
            width: diagLength,
            height: 2,
            top: boardSize * 0.22,
            left: boardSize * 0.22 - diagLength / 2,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
      {/* Top-Right to Inner-Right */}
      <View
        style={[
          styles.line,
          {
            width: diagLength,
            height: 2,
            top: boardSize * 0.22,
            left: boardSize * 0.78 - diagLength / 2,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      {/* Bottom-Left to Inner-Left */}
      <View
        style={[
          styles.line,
          {
            width: diagLength,
            height: 2,
            top: boardSize * 0.78,
            left: boardSize * 0.22 - diagLength / 2,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      {/* Bottom-Right to Inner-Right */}
      <View
        style={[
          styles.line,
          {
            width: diagLength,
            height: 2,
            top: boardSize * 0.78,
            left: boardSize * 0.78 - diagLength / 2,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />

      {/* 6. The 24 Intersections / Vertices */}
      {VERTICES.map((vertex) => {
        const piece = gameState.board[vertex.id];
        const isSelected = gameState.selectedVertex === vertex.id;
        const isLegalDest = legalDestinations.includes(vertex.id);
        const isLegalShot = legalShots.includes(vertex.id);

        const posX = vertex.x * boardSize - vertexSize / 2;
        const posY = vertex.y * boardSize - vertexSize / 2;

        return (
          <TouchableOpacity
            key={vertex.id}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => onVertexPress(vertex.id)}
            style={[
              piece ? styles.vertexWithPiece : styles.vertexEmpty,
              {
                width: vertexSize,
                height: vertexSize,
                top: posY,
                left: posX,
              },
              isLegalDest && styles.vertexDestination,
            ]}
          >
            {piece ? (
              <MorabarabaPiece
                player={piece}
                size={vertexSize}
                isSelected={isSelected}
                isShootable={isLegalShot}
              />
            ) : isLegalDest ? (
              <View style={styles.destinationDot} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'relative',
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  square: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  line: {
    position: 'absolute',
    backgroundColor: '#94A3B8',
  },
  vertexEmpty: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  vertexWithPiece: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  vertexDestination: {
    borderRadius: 999,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
