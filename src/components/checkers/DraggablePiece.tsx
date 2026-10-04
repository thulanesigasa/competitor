import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CheckersPiece } from '../../engine/checkersEngine';
import { colors } from '../../theme/colors';

interface DraggablePieceProps {
  piece: CheckersPiece;
  row: number;
  col: number;
  notation: number;
  squareSize: number;
  canDrag: boolean;
  onDrop: (fromNotation: number, translationX: number, translationY: number) => boolean;
}

const CrownSvgIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill={colors.accent}>
    <Path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </Svg>
);

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  notation,
  squareSize,
  canDrag,
  onDrop,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const pieceSize = squareSize * 0.82;
  const pieceMargin = (squareSize - pieceSize) / 2;

  const handleDropEnd = (tx: number, ty: number) => {
    const success = onDrop(notation, tx, ty);
    if (!success) {
      // Snap back smoothly on illegal move
      translateX.value = withSpring(0, { damping: 15, stiffness: 180 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 180 });
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(canDrag)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(handleDropEnd)(e.translationX, e.translationY);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withTiming(isDragging.value ? 1.15 : 1.0, { duration: 120 }) },
      ],
      zIndex: isDragging.value ? 999 : 1,
      opacity: withTiming(isDragging.value ? 0.92 : 1.0, { duration: 100 }),
      elevation: isDragging.value ? 10 : 2,
      shadowOpacity: withTiming(isDragging.value ? 0.35 : 0.12, { duration: 100 }),
    };
  });

  const isWhite = piece.color === 'w';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.pieceWrapper,
          {
            width: pieceSize,
            height: pieceSize,
            borderRadius: pieceSize / 2,
            left: pieceMargin,
            top: pieceMargin,
          },
          isWhite ? styles.whitePiece : styles.blackPiece,
          animatedStyle,
        ]}
      >
        {/* Concentric inner carved tactile circle */}
        <View
          style={[
            styles.innerGroove,
            {
              width: pieceSize * 0.62,
              height: pieceSize * 0.62,
              borderRadius: (pieceSize * 0.62) / 2,
            },
            isWhite ? styles.whiteGroove : styles.blackGroove,
          ]}
        >
          {piece.isKing && <CrownSvgIcon />}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  pieceWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  whitePiece: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  blackPiece: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  innerGroove: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  whiteGroove: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  blackGroove: {
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
});

export default DraggablePiece;
