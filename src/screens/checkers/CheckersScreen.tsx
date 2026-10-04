import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/Typography';
import { colors } from '../../theme/colors';
import { SPACING } from '../../constants/theme';
import {
  ICheckersEngine,
  createCheckersEngine,
  PieceColor,
} from '../../engine/checkersEngine';
import { CheckersBoard } from '../../components/checkers/CheckersBoard';

export const CheckersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  // Mode: 8x8 Classic Checkers or 10x10 International Draughts (powered by draughts npm package)
  const [mode, setMode] = useState<'8x8' | '10x10'>('8x8');

  // Initialize engine outside the component render cycle (persisted in ref)
  const engineRef = useRef<ICheckersEngine>(createCheckersEngine('8x8'));

  // Trigger state re-renders when engine board changes
  const [boardVersion, setBoardVersion] = useState<number>(0);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);

  // Compute responsive board size: bounded max width 380
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

  const handleAttemptMove = useCallback((from: number, to: number): boolean => {
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
  }, [isGameOver]);

  const handleRestart = () => {
    engineRef.current.reset();
    setTurn(engineRef.current.turn());
    setMoveCount(0);
    setIsGameOver(false);
    setWinner(null);
    setBoardVersion((v) => v + 1);
  };

  const isWhiteTurn = turn === 'w';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="CHECKERS (DRAUGHTS)"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
              color={mode === '8x8' ? colors.accentHover : colors.textTertiary}
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
              color={mode === '10x10' ? colors.accentHover : colors.textTertiary}
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
                isWhiteTurn ? styles.whiteTurnDot : styles.blackTurnDot,
              ]}
            />
            <Text variant="body" weight="900" color={colors.textPrimary} style={styles.turnLabel}>
              {isWhiteTurn ? 'WHITE (PLAYER 1)' : 'BLACK (PLAYER 2)'}
            </Text>
          </View>
          <Text variant="caption" weight="700" color={colors.textSecondary}>
            MOVE #{moveCount + 1}
          </Text>
        </View>

        <Text variant="caption" color={colors.textSecondary} style={styles.instructionText}>
          {mode === '8x8'
            ? 'Drag piece diagonally forward to open dark square or jump opponent.'
            : 'Powered by draughts.js • Squares 1–50 with international backward captures.'}
        </Text>

        {/* Game Over Message Banner */}
        {isGameOver && (
          <View style={styles.gameOverSection}>
            <Text variant="label" weight="900" color={colors.accentHover} style={styles.gameOverKicker}>
              GAME OVER
            </Text>
            <Text variant="h2" weight="900" color={colors.textPrimary} style={styles.gameOverTitle}>
              {winner === 'draw'
                ? 'Match Ended in a Draw'
                : winner === 'w'
                ? 'White Player Victorious!'
                : 'Black Player Victorious!'}
            </Text>
            <Text variant="caption" color={colors.textSecondary} style={styles.gameOverSubtitle}>
              {winner === 'draw'
                ? 'Insufficient material remaining on the board.'
                : 'Opponent has zero remaining pieces or legal moves available.'}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Checkers Board */}
        <View style={styles.boardWrapper}>
          <CheckersBoard
            key={`board-${mode}-${boardVersion}`}
            engine={engineRef.current}
            boardSize={boardSize}
            currentTurn={turn}
            onAttemptMove={handleAttemptMove}
          />
        </View>

        <View style={styles.divider} />

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.restartButton}
            activeOpacity={0.8}
            onPress={handleRestart}
          >
            <Text variant="body" weight="900" color="#FFFFFF" style={styles.restartButtonText}>
              RESTART GAME
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 48,
  },
  modeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  modeTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabActive: {
    borderBottomColor: colors.accent,
  },
  modeTabText: {
    letterSpacing: 0.8,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  turnIndicatorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1.5,
  },
  whiteTurnDot: {
    backgroundColor: '#F8FAFC',
    borderColor: '#94A3B8',
  },
  blackTurnDot: {
    backgroundColor: '#1E293B',
    borderColor: '#0F172A',
  },
  turnLabel: {
    letterSpacing: 0.5,
    fontSize: 13.5,
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  gameOverSection: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginTop: 6,
  },
  gameOverKicker: {
    letterSpacing: 1.5,
    marginBottom: 2,
    fontSize: 11,
  },
  gameOverTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  gameOverSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionsContainer: {
    paddingVertical: 6,
  },
  restartButton: {
    height: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButtonText: {
    letterSpacing: 0.8,
    fontSize: 12,
  },
});

export default CheckersScreen;
