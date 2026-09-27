import React from 'react';
import Svg, { Path, Circle, Rect, G, Polygon } from 'react-native-svg';

export interface SvgIconProps {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: any;
}

// 1. Navigation & Header Icons
export const ChevronRightSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#0F172A',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronLeftSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#0F172A',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#0F172A',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 2. Status & Verification Icons
export const CheckSvg: React.FC<SvgIconProps> = ({
  size = 18,
  color = '#E5A93C',
  strokeWidth = 2.5,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CrossSvg: React.FC<SvgIconProps> = ({
  size = 18,
  color = '#EF4444',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 3. Form & Identity Icons
export const UserSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const PhoneSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4743 21.8326 20.7294C21.721 20.9846 21.5574 21.2137 21.3522 21.4019C21.147 21.5902 20.9046 21.7335 20.6408 21.8228C20.3769 21.912 20.0974 21.9452 19.82 21.92C16.7428 21.5857 13.787 20.5342 11.19 18.85C8.77382 17.3148 6.72533 15.2663 5.19 12.85C3.49997 10.2413 2.44824 7.27109 2.12 4.18C2.09501 3.90356 2.12787 3.62486 2.21644 3.36173C2.30501 3.0986 2.44733 2.85683 2.63414 2.65219C2.82095 2.44755 3.04812 2.28458 3.30114 2.17379C3.55416 2.06299 3.82747 2.00685 4.105 2.00876H7.105C7.5953 1.99524 8.07119 2.16708 8.43324 2.48835C8.79529 2.80962 9.01755 3.25732 9.055 3.74C9.12461 4.6366 9.34444 5.51685 9.707 6.35C9.86608 6.71188 9.90799 7.11477 9.82772 7.50073C9.74744 7.88669 9.54848 8.23789 9.255 8.51L7.985 9.78C9.40698 12.2804 11.4696 14.343 13.97 15.765L15.24 14.495C15.5121 14.2015 15.8633 14.0026 16.2493 13.9223C16.6352 13.842 17.0381 13.8839 17.4 14.043C18.2331 14.4056 19.1134 14.6254 20.01 14.695C20.4981 14.733 20.9507 14.9602 21.2727 15.3289C21.5947 15.6976 21.7628 16.1798 21.745 16.67L22 16.92Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MailSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6L12 13L2 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LockSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AtSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M16 8V12C16 13.1046 16.8954 14 18 14C19.1046 14 20 13.1046 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C14.1378 20 16.0891 19.1627 17.5355 17.7885"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const EyeSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const EyeOffSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#94A3B8',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.78 16.09M1 1L23 23M9.88 9.88A3 3 0 1 0 14.12 14.12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShieldCheckSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#E5A93C',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 4. Game & Navigation Feature SVGs
export const SwordsSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#E5A93C',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M14.5 17.5L3 6V3H6L17.5 14.5M13 19L19 13M16 16L20 20M19 21L21 19M14.5 6.5L18 3H21V6L17.5 9.5M11 13L9.5 14.5M8 16L5 19M4 20L3 21M5 21L3 19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TrophySvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#E5A93C',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5V6A2 2 0 0 1 4 4H6M18 9H19.5A2.5 2.5 0 0 0 22 6.5V6A2 2 0 0 0 20 4H18M6 4H18V12A6 6 0 0 1 6 12V4ZM12 18V22M8 22H16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BoardGridSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#E5A93C',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Rect
      x="7"
      y="7"
      width="10"
      height="10"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M12 3V7M12 17V21M3 12H7M17 12H21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const RefreshSvg: React.FC<SvgIconProps> = ({
  size = 20,
  color = '#E5A93C',
  strokeWidth = 2,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M23 4V10H17M1 20V14H7M3.51 9A9 9 0 0 1 18.36 5.64L23 10M1 14L5.64 18.36A9 9 0 0 0 20.49 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
