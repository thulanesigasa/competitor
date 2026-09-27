import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Player } from '../../types/game';

interface MorabarabaPieceProps {
  player: Player;
  size?: number;
  isSelected?: boolean;
  isShootable?: boolean;
}

/**
 * Authentic Morabaraba Piece
 * Stylized concentric carved stone / terracotta token matching reference design.
 */
export const MorabarabaPiece: React.FC<MorabarabaPieceProps> = ({
  player,
  size = 32,
  isSelected = false,
  isShootable = false,
}) => {
  const isP1 = player === 'player1';

  // 60-30-10 calibrated token palette
  // Player 1: Warm earth terracotta & gold accent (#E5A93C / #78350F)
  // Player 2: Deep obsidian slate & silver (#1E293B / #475569)
  const outerRim = isP1 ? '#57534E' : '#334155';
  const middleRing = isP1 ? '#6B3E26' : '#1E293B';
  const grooveRing = isP1 ? '#3D2214' : '#0F172A';
  const innerDisc = isP1 ? '#78716C' : '#475569';
  const microTextRing = isP1 ? '#FDE68A' : '#CBD5E1';
  const centerDot = isP1 ? '#E5A93C' : '#94A3B8';
  const centerCore = isP1 ? '#78350F' : '#0F172A';

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        isSelected && styles.selectedHalo,
        isShootable && styles.shootableHalo,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Layer 1: Outer Stone Rim */}
        <Circle cx="50" cy="50" r="48" fill={outerRim} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />

        {/* Layer 2: Main Concentric Ring (Terracotta / Deep Slate) */}
        <Circle cx="50" cy="50" r="43" fill={middleRing} stroke={grooveRing} strokeWidth="1.5" />

        {/* Layer 3: Inner Shadow Groove */}
        <Circle cx="50" cy="50" r="35" fill={grooveRing} />

        {/* Layer 4: Concentric Inner Disc (Carved Slate) */}
        <Circle cx="50" cy="50" r="32" fill={innerDisc} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />

        {/* Layer 5: Concentric Micro-Text / Inscribed Circle */}
        <Circle
          cx="50"
          cy="50"
          r="23"
          fill="none"
          stroke={microTextRing}
          strokeWidth="0.8"
          strokeDasharray="2.5,2.5"
          opacity={0.85}
        />

        {/* Layer 6: Center Concentric Bullseye */}
        <Circle cx="50" cy="50" r="14" fill={centerDot} stroke={grooveRing} strokeWidth="1" />
        <Circle cx="50" cy="50" r="6" fill={centerCore} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  selectedHalo: {
    borderWidth: 2.5,
    borderColor: '#E5A93C',
    transform: [{ scale: 1.15 }],
  },
  shootableHalo: {
    borderWidth: 2.5,
    borderColor: '#EF4444',
    transform: [{ scale: 1.15 }],
  },
});
