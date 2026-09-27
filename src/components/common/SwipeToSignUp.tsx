import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface SwipeToSignUpProps {
  onSwipeComplete: () => void;
  label?: string;
}

export const SwipeToSignUp: React.FC<SwipeToSignUpProps> = ({
  onSwipeComplete,
  label = 'Swipe to Sign Up →',
}) => {
  const [trackWidth, setTrackWidth] = useState(280);
  const thumbWidth = 52;
  const panX = useRef(new Animated.Value(0)).current;
  const hasTriggered = useRef(false);

  const maxSwipe = Math.max(1, trackWidth - thumbWidth - 8);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (hasTriggered.current) return;
        const newX = Math.max(0, Math.min(gestureState.dx, maxSwipe));
        panX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (hasTriggered.current) return;
        if (gestureState.dx >= maxSwipe * 0.75) {
          // Completed swipe
          hasTriggered.current = true;
          Animated.timing(panX, {
            toValue: maxSwipe,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            onSwipeComplete();
            // Reset for safety after transition
            setTimeout(() => {
              panX.setValue(0);
              hasTriggered.current = false;
            }, 1000);
          });
        } else {
          // Spring back
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  const onLayoutTrack = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const textOpacity = panX.interpolate({
    inputRange: [0, maxSwipe * 0.6],
    outputRange: [1, 0.2],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.track} onLayout={onLayoutTrack}>
      <Animated.Text style={[styles.label, { opacity: textOpacity }]}>
        {label}
      </Animated.Text>
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: panX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.thumbArrow}>»</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  thumb: {
    position: 'absolute',
    left: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  thumbArrow: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginTop: -2,
  },
});
