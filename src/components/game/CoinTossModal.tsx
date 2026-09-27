import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Text } from '../Typography';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';
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
  player1Name = 'You',
  player2Name = 'CPU',
}) => {
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [tossResult, setTossResult] = useState<CoinSide | null>(null);
  const [winnerPlayer, setWinnerPlayer] = useState<Player | null>(null);

  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const autoFinishTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      handleReset();
    }
    return () => {
      if (autoFinishTimer.current) {
        clearTimeout(autoFinishTimer.current);
      }
    };
  }, [visible]);

  const handlePickAndToss = (side: CoinSide) => {
    if (isFlipping) return;

    setSelectedSide(side);
    setIsFlipping(true);
    setTossResult(null);
    setWinnerPlayer(null);

    // 50/50 fair distribution
    const outcome: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
    const targetFlips = outcome === 'heads' ? 5 : 5.5;

    flipAnim.setValue(0);
    scaleAnim.setValue(1);

    // Coordinated 3D toss animation: scale up during flight, rotate, land
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 750,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flipAnim, {
        toValue: targetFlips,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsFlipping(false);
      setTossResult(outcome);

      const first: Player = side === outcome ? 'player1' : 'player2';
      setWinnerPlayer(first);

      // Automatically head back to the game after a brief celebration pause
      autoFinishTimer.current = setTimeout(() => {
        finishAndReturn(first);
      }, 1200);
    });
  };

  const finishAndReturn = (first: Player) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onTossComplete(first);
      handleReset();
    });
  };

  const handleReset = () => {
    setSelectedSide(null);
    setIsFlipping(false);
    setTossResult(null);
    setWinnerPlayer(null);
    flipAnim.setValue(0);
    scaleAnim.setValue(1);
    fadeAnim.setValue(1);
    if (autoFinishTimer.current) {
      clearTimeout(autoFinishTimer.current);
    }
  };

  // Interpolate rotation for 3D flip effect
  const spinInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const displayedSide = tossResult || selectedSide || 'heads';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.transparentOverlay}
        activeOpacity={1}
        onPress={() => {
          if (winnerPlayer) {
            finishAndReturn(winnerPlayer);
          }
        }}
      >
        <Animated.View style={[styles.floatingContainer, { opacity: fadeAnim }]}>
          {/* Header Title Floating Over Game */}
          <View style={styles.headerBlock}>
            <Text variant="h2" align="center" color="#FFFFFF" style={styles.headerTitle}>
              {tossResult
                ? `LANDED ON ${tossResult.toUpperCase()}`
                : isFlipping
                ? 'FLIPPING COIN...'
                : 'WHO GOES FIRST?'}
            </Text>
            <Text variant="caption" align="center" color="rgba(255, 255, 255, 0.85)" style={styles.headerSubtitle}>
              {tossResult
                ? winnerPlayer === 'player1'
                  ? `${player1Name} won the toss and moves first!`
                  : `${player2Name} won the toss and moves first!`
                : isFlipping
                ? 'Determining who places the first cow...'
                : 'Tap Heads or Tails to flip and start match'}
            </Text>
          </View>

          {/* Floating 3D Animated Coin */}
          <View style={styles.coinArea}>
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
              <Svg width={110} height={110} viewBox="0 0 100 100">
                {/* Outer Metallic Rim */}
                <Circle cx="50" cy="50" r="49" fill="#B45309" stroke="#78350F" strokeWidth="2" />
                {/* Gold Face */}
                <Circle cx="50" cy="50" r="44" fill="#E5A93C" stroke="#D97706" strokeWidth="2" />
                {/* Inner Bevel */}
                <Circle cx="50" cy="50" r="38" fill="#F59E0B" stroke="#B45309" strokeWidth="1" strokeDasharray="3,3" />
                {/* Center Content */}
                <Circle cx="50" cy="50" r="28" fill="#D97706" />
                <SvgText
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="24"
                  fontWeight="900"
                >
                  {isFlipping ? 'M' : displayedSide === 'heads' ? 'H' : 'T'}
                </SvgText>
              </Svg>
            </Animated.View>
          </View>

          {/* Quick 1-Tap Heads or Tails Choices (Floating directly over game) */}
          {!isFlipping && !tossResult && (
            <View style={styles.choicesRow}>
              <TouchableOpacity
                style={[styles.floatingPill, styles.headsPill]}
                onPress={() => handlePickAndToss('heads')}
                activeOpacity={0.8}
              >
                <Text variant="h3" weight="800" color="#FFFFFF">
                  HEADS (H)
                </Text>
                <Text variant="caption" color="rgba(255, 255, 255, 0.8)">
                  Tap to Flip
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.floatingPill, styles.tailsPill]}
                onPress={() => handlePickAndToss('tails')}
                activeOpacity={0.8}
              >
                <Text variant="h3" weight="800" color="#FFFFFF">
                  TAILS (T)
                </Text>
                <Text variant="caption" color="rgba(255, 255, 255, 0.8)">
                  Tap to Flip
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Auto Heading Back Notice */}
          {tossResult && (
            <View style={styles.autoReturnNotice}>
              <Text variant="caption" weight="700" color={colors.accent} align="center">
                Heading into match...
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  transparentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  floatingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerSubtitle: {
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  coinArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    marginVertical: spacing.md,
  },
  coinWrapper: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  choicesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  floatingPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headsPill: {
    backgroundColor: colors.accent,
    borderColor: '#D97706',
  },
  tailsPill: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  autoReturnNotice: {
    marginTop: spacing.lg,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
  },
});
