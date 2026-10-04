import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

interface ChessPieceSvgProps {
  type: PieceType;
  color: PieceColor;
  size?: number;
}

export const ChessPieceSvg: React.FC<ChessPieceSvgProps> = ({
  type,
  color,
  size = 36,
}) => {
  const isWhite = color === 'w';
  const fillColor = isWhite ? '#E5A93C' : '#0F172A';
  const strokeColor = isWhite ? '#78350F' : '#FFFFFF';
  const strokeWidth = 1.5;

  switch (type) {
    case 'p':
      // Pawn
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <Path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'r':
      // Rook
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
            <Path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
            <Path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
            <Path d="M 34,14 L 31,17 L 14,17 L 11,14" />
            <Path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
            <Path d="M 14,29.5 L 12,32 L 33,32 L 31,29.5" />
            <Path d="M 11,14 L 34,14" />
          </G>
        </Svg>
      );

    case 'n':
      // Knight
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <Path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.07 18,9 C 18,9 21.05,8.05 22,10 z" />
            <Circle cx="9.5" cy="25.5" r="1" fill={isWhite ? '#78350F' : '#FFFFFF'} />
          </G>
        </Svg>
      );

    case 'b':
      // Bishop
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
            <Path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <Circle cx="22.5" cy="8" r="1.5" />
            <Path d="M 17.5,26 L 27.5,26" />
            <Path d="M 22.5,10 L 22.5,15" />
            <Path d="M 20,12.5 L 25,12.5" />
          </G>
        </Svg>
      );

    case 'q':
      // Queen
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.5 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.5 L 14,25 L 6.5,13.5 L 9,26 z" />
            <Path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" />
            <Circle cx="6" cy="12" r="1.5" />
            <Circle cx="14" cy="9" r="1.5" />
            <Circle cx="22.5" cy="8" r="1.5" />
            <Circle cx="31" cy="9" r="1.5" />
            <Circle cx="39" cy="12" r="1.5" />
          </G>
        </Svg>
      );

    case 'k':
      // King
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cross */}
            <Path d="M 22.5,11.63 L 22.5,6" />
            <Path d="M 20,8 L 25,8" />
            {/* Body */}
            <Path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 22.5,12 22.5,12 C 22.5,12 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
            <Path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,35 34.5,31.5 34.5,31.5 C 38.5,26.5 35.5,19.5 35.5,19.5 C 31.5,21 30,24 30,24 C 26.5,20.5 24,24.5 24,24.5 C 21,20.5 18.5,24.5 18.5,24.5 C 15,24 13.5,21 9.5,19.5 C 9.5,19.5 6.5,26.5 10.5,31.5 C 10.5,31.5 8.5,35 11.5,37 z" />
            <Path d="M 11.5,30 C 17,27 28,27 33.5,30" />
            <Path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" />
            <Path d="M 11.5,37 C 17,34 28,34 33.5,37" />
          </G>
        </Svg>
      );

    default:
      return null;
  }
};
