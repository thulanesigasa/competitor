import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export interface TabIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Bottom Navigation Tab SVGs
 * Strictly reserved for the bottom navigation bar per user specification.
 */

export const BattlegroundTabSvg: React.FC<TabIconProps> = ({
  size = 16,
  color = '#94A3B8',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 17.5L3 6V3H6L17.5 14.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13 19L19 13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 16L20 20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.5 17.5L21 6V3H18L6.5 14.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 19L5 13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 16L4 20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const OfflineTabSvg: React.FC<TabIconProps> = ({
  size = 16,
  color = '#94A3B8',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Rect
      x="9"
      y="9"
      width="6"
      height="6"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path d="M9 1V4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M15 1V4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M9 20V23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M15 20V23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M20 9H23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M20 15H23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M1 9H4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M1 15H4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const LeaderboardTabSvg: React.FC<TabIconProps> = ({
  size = 16,
  color = '#94A3B8',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5V6a2 2 0 0 1 2-2h2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 9h1.5A2.5 2.5 0 0 0 22 6.5V6a2 2 0 0 0-2-2h-2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 4h16v7a6 6 0 0 1-12 0V4z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 17v4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M8 21h8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ProfileTabSvg: React.FC<TabIconProps> = ({
  size = 16,
  color = '#94A3B8',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.5 21a6.5 6.5 0 0 1 13 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
