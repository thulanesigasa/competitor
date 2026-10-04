import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../Typography';
import { colors } from '../../theme/colors';
import { SPACING } from '../../constants/theme';
import {
  ICheckersEngine,
  createCheckersEngine,
  PieceColor,
} from '../../engine/checkersEngine';
import { CheckersBoard } from './CheckersBoard';

export const CheckersArena: React.FC = () => {
  const { width } = useWindowDimensions();

  // Mode: 8x8 Classic Checkers or 10x10 International Draughts
  const [mode, setMode] = useState<'8x8' | '10x10'>('8x8');

  // Initialize engine outside the component render cycle
  const engineRef = useRef<ICheckersEngine>(createCheckersEngine('8x8'));

  // Interactive UI states
  const [, setBoardVersion] = useState<number>(0);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);

  // Compute responsive board size: bounded max width 380, respecting 16px screen padding
  const boardSize = Math.min(width - 32, 380);

  const switchMode = (newMode: '8x8' | '10x10') => {
    if (newMode === mode) return;
    setMode(newMode);
    engineRef.current = createCheckersEngine(newMode);
    setTurn(engineRef.current.turn());
    setMoveCount(0);
    setIsGameOver(false);
    setWinner(null);
    setBoardVersion((v) => v + 1);
  };

  const handleAttemptMove = useCallback(
    (from: number, to: number): boolean => {
      const engine = engineRef.current;
      if (!engine || isGameOver) return false;

      const success = engine.move({ from, to });
      if (success) {
        setTurn(engine.turn());
        setMoveCount((c) => c + 1);

        if (engine.gameOver()) {
          setIsGameOver(true);
          setWinner(engine.getWinner());
        }

        setBoardVersion((v) => v + 1);
        return true;
      }

      return false;
    },
    [isGameOver]
  );

  const handleRestart = () => {
    engineRef.current.reset();
    setTurn(engineRef.current.turn());
    setMoveCount(0);
    setIsGameOver(false);
    setWinner(null);
    setBoardVersion((v) => v + 1);
  };

  const isGoldTurn = turn === 'w';

  return (
    <View style={styles.container}>
      {/* Mode Selector Tabs (Pure Body Typography) */}
      <View style={styles.modeSelectorRow}>
        <TouchableOpacity
          style={[styles.modeTab, mode === '8x8' && styles.modeTabActive]}
          activeOpacity={0.8}
          onPress={() => switchMode('8x8')}
        >
          <Text
            variant="label"
            weight="900"
            color={mode === '8x8' ? colors.accentHover : colors.textSecondary}
            style={styles.modeTabText}
          >
            8×8 CLASSIC
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === '10x10' && styles.modeTabActive]}
          activeOpacity={0.8}
          onPress={() => switchMode('10x10')}
        >
          <Text
            variant="label"
            weight="900"
            color={mode === '10x10' ? colors.accentHover : colors.textSecondary}
            style={styles.modeTabText}
          >
            10×10 INTERNATIONAL
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Turn Status & Move Info */}
      <View style={styles.statusRow}>
        <View style={styles.turnIndicatorGroup}>
          <View
            style={[
              styles.turnDot,
              isGoldTurn ? styles.goldTurnDot : styles.charcoalTurnDot,
            ]}
          />
          <Text variant="h3" weight="900" color={colors.textPrimary}>
            {isGameOver
              ? 'MATCH CONCLUDED'
              : isGoldTurn
              ? 'PLAYER 1 (GOLD) TURN'
              : 'PLAYER 2 (CHARCOAL) TURN'}
          </Text>
        </View>

        <Text variant="caption" weight="700" color={colors.textSecondary}>
          Moves: {moveCount}
        </Text>
      </View>

      {/* Board Arena */}
      <View style={styles.boardWrapper}>
        <CheckersBoard
          engine={engineRef.current}
          boardSize={boardSize}
          currentTurn={turn}
          onAttemptMove={handleAttemptMove}
        />
      </View>

      {/* Game Over Announcement */}
      {isGameOver && (
        <View style={styles.gameOverContainer}>
          <Text variant="h2" weight="900" color={colors.accentHover} style={styles.gameOverTitle}>
            {winner === 'draw'
              ? 'STALEMATE DRAW'
              : winner === 'w'
              ? 'PLAYER 1 (GOLD) WINS!'
              : 'PLAYER 2 (CHARCOAL) WINS!'}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.gameOverSubtitle}>
            {winner === 'draw'
              ? 'Zero legal diagonal moves remaining.'
              : `All opponent pieces captured in ${moveCount} moves.`}
          </Text>
          <TouchableOpacity
            style={styles.rematchButton}
            activeOpacity={0.8}
            onPress={handleRestart}
          >
            <Text variant="body" weight="900" color="#FFFFFF">
              START REMATCH NOW →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      {/* Arena Action Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.resetButton}
          activeOpacity={0.7}
          onPress={handleRestart}
        >
          <Text variant="body" weight="800" color={colors.textPrimary}>
            NEW MATCH
          </Text>
          <Text variant="caption" color={colors.accentHover} style={styles.actionTag}>
            Reset Board ↺
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
  },
  modeSelectorRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabActive: {
    borderBottomColor: colors.accent,
  },
  modeTabText: {
    fontSize: 11,
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  turnIndicatorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goldTurnDot: {
    backgroundColor: colors.accent,
  },
  charcoalTurnDot: {
    backgroundColor: '#0F172A',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  gameOverContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  gameOverTitle: {
    letterSpacing: 1.2,
    fontSize: 18,
    marginBottom: 4,
  },
  gameOverSubtitle: {
    fontSize: 12.5,
    marginBottom: SPACING.md,
  },
  rematchButton: {
    height: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  controlsRow: {
    marginTop: SPACING.xs,
  },
  resetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  actionTag: {
    fontWeight: '800',
    fontSize: 12,
  },
});
