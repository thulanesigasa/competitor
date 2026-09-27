import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { Text } from '../Typography';
import { colors } from '../../theme/colors';
import { spacing, shadow } from '../../theme';
import { Player } from '../../types/game';

interface CoinTossModalProps {
  visible: boolean;
  onClose: () => void;
  onTossComplete: (firstPlayer: Player) => void;
  player1Name?: string;
  player2Name?: string;
}

type CoinSide = 'heads' | 'tails';

export const CoinTossModal: React.FC<CoinTossModalProps> = ({
  visible,
  onClose,
  onTossComplete,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
}) => {
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [tossResult, setTossResult] = useState<CoinSide | null>(null);
  const [winnerPlayer, setWinnerPlayer] = useState<Player | null>(null);

  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleStartToss = () => {
    if (!selectedSide || isFlipping) return;

    setIsFlipping(true);
    setTossResult(null);
    setWinnerPlayer(null);

    // Random outcome (50/50 fair distribution)
    const outcome: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';

    // Total flips: 5 full rotations (1800 deg) + extra 180 if tails
    const targetFlips = outcome === 'heads' ? 5 : 5.5;

    flipAnim.setValue(0);
    scaleAnim.setValue(1);

    // Coordinated toss animation: scale up during flight, rotate, land softly
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.35,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flipAnim, {
        toValue: targetFlips,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsFlipping(false);
      setTossResult(outcome);

      const first: Player = selectedSide === outcome ? 'player1' : 'player2';
      setWinnerPlayer(first);
    });
  };

  const handleProceed = () => {
    if (winnerPlayer) {
      onTossComplete(winnerPlayer);
      handleReset();
    }
  };

  const handleReset = () => {
    setSelectedSide(null);
    setIsFlipping(false);
    setTossResult(null);
    setWinnerPlayer(null);
    flipAnim.setValue(0);
    scaleAnim.setValue(1);
  };

  // Interpolate rotation for 3D flip effect
  const spinInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const displayedSide = tossResult || selectedSide || 'heads';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, shadow.lg]}>
          <Text variant="h2" align="center" style={styles.title}>
            COIN TOSS
          </Text>
          <Text variant="caption" align="center" color={colors.textSecondary} style={styles.subtitle}>
            Determine who makes the first move.
          </Text>

          {/* Animated Coin */}
          <View style={styles.coinContainer}>
            <Animated.View
              style={[
                styles.coinWrapper,
                {
                  transform: [
                    { perspective: 1000 },
                    { rotateY: spinInterpolate },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <Svg width={96} height={96} viewBox="0 0 100 100">
                {/* Outer Rim */}
                <Circle cx="50" cy="50" r="48" fill="#B45309" stroke="#78350F" strokeWidth="2" />
                {/* Gold Face */}
                <Circle cx="50" cy="50" r="44" fill="#E5A93C" stroke="#D97706" strokeWidth="2" />
                {/* Inner Bevel */}
                <Circle cx="50" cy="50" r="38" fill="#F59E0B" stroke="#B45309" strokeWidth="1" strokeDasharray="3,3" />
                {/* Center Content */}
                <Circle cx="50" cy="50" r="28" fill="#D97706" />
                <SvgText
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="22"
                  fontWeight="900"
                >
                  {isFlipping ? 'M' : displayedSide === 'heads' ? 'H' : 'T'}
                </SvgText>
              </Svg>
            </Animated.View>
          </View>

          {/* Side Pickers (Shown before flipping) */}
          {!tossResult && !isFlipping && (
            <View style={styles.selectionSection}>
              <Text variant="label" align="center" color={colors.textSecondary} style={styles.pickPrompt}>
                SELECT YOUR CALL:
              </Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    selectedSide === 'heads' && styles.choiceButtonActive,
                    shadow.sm,
                  ]}
                  onPress={() => setSelectedSide('heads')}
                  activeOpacity={0.8}
                >
                  <Text
                    variant="h3"
                    weight={selectedSide === 'heads' ? '800' : '600'}
                    color={selectedSide === 'heads' ? colors.accentHover : colors.textPrimary}
                  >
                    HEADS (H)
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {player1Name} Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    selectedSide === 'tails' && styles.choiceButtonActive,
                    shadow.sm,
                  ]}
                  onPress={() => setSelectedSide('tails')}
                  activeOpacity={0.8}
                >
                  <Text
                    variant="h3"
                    weight={selectedSide === 'tails' ? '800' : '600'}
                    color={selectedSide === 'tails' ? colors.accentHover : colors.textPrimary}
                  >
                    TAILS (T)
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {player1Name} Call
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.flipButton,
                  !selectedSide && styles.flipButtonDisabled,
                  shadow.sm,
                ]}
                disabled={!selectedSide}
                onPress={handleStartToss}
                activeOpacity={0.85}
              >
                <Text
                  variant="body"
                  weight="800"
                  color={selectedSide ? '#FFFFFF' : '#94A3B8'}
                >
                  {selectedSide ? `FLIP COIN (${selectedSide.toUpperCase()}) →` : 'CHOOSE A SIDE TO FLIP'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Flipping Indicator */}
          {isFlipping && (
            <View style={styles.statusSection}>
              <Text variant="h3" align="center" color={colors.accentHover} weight="800">
                Flipping Coin...
              </Text>
              <Text variant="caption" align="center" color={colors.textSecondary}>
                Physics-based random turn decider in flight.
              </Text>
            </View>
          )}

          {/* Result Announcement */}
          {tossResult && (
            <View style={styles.resultSection}>
              <View style={styles.resultBanner}>
                <Text variant="caption" weight="800" color={colors.accentHover} align="center">
                  LANDED ON {tossResult.toUpperCase()}
                </Text>
                <Text variant="h2" weight="900" color={colors.textPrimary} align="center" style={styles.winnerHeading}>
                  {winnerPlayer === 'player1' ? `${player1Name} Moves First!` : `${player2Name} Moves First!`}
                </Text>
                <Text variant="caption" color={colors.textSecondary} align="center">
                  {winnerPlayer === 'player1'
                    ? `${player1Name} won the coin toss and starts as Cow 1 (Gold).`
                    : `${player2Name} won the coin toss and starts as Cow 1 (Gold).`}
                </Text>
              </View>

              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, shadow.sm]}
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Text variant="body" weight="700" color={colors.textSecondary}>
                    Re-Toss
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryProceedBtn, shadow.sm]}
                  onPress={handleProceed}
                  activeOpacity={0.85}
                >
                  <Text variant="body" weight="800" color="#FFFFFF">
                    Start Match →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  title: {
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: spacing.md,
  },
  coinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginVertical: spacing.sm,
  },
  coinWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionSection: {
    marginTop: spacing.sm,
  },
  pickPrompt: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 10,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonActive: {
    backgroundColor: '#FFFBEB',
    borderColor: colors.accent,
  },
  flipButton: {
    backgroundColor: colors.accent,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  resultSection: {
    marginTop: spacing.sm,
  },
  resultBanner: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  winnerHeading: {
    marginVertical: 4,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryProceedBtn: {
    flex: 1.5,
    height: 46,
    backgroundColor: colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
