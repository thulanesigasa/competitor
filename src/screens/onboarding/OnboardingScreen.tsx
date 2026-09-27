import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  useWindowDimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme';
import { Text } from '../../components/Typography';

interface Slide {
  id: string;
  step: string;
  title: string;
  description: string;
  highlight: string;
  image: ImageSourcePropType;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    id: '1',
    step: '01 / 03',
    title: 'WELCOME TO MORABARABA',
    highlight: 'The Ancient Art of Strategy',
    description:
      'Step into Southern Africa’s premier 1v1 tactical battleground. Place your twelve cows, outmaneuver your rival, and conquer the board.',
    image: require('../../../assets/onboarding/10- VARIADOS 3D - Google Drive.jpg'),
  },
  {
    id: '2',
    step: '02 / 03',
    title: 'EARN COMPETITIVELY',
    highlight: 'Zero-Data Battles • High Stakes Duels',
    description:
      'Compete against friends in the Battleground over zero-data local Wi-Fi or climb the leaderboard with offline solo mastery.',
    image: require('../../../assets/onboarding/download.jpg'),
  },
  {
    id: '3',
    step: '03 / 03',
    title: 'ENJOY THE ARENA',
    highlight: 'Seven Nations • Top Regional Honors',
    description:
      'Represent your town and province across Southern Africa. Claim your custom Gamer Tag and rise to grandmaster glory.',
    image: require('../../../assets/onboarding/3D Hand Picking Golden Stars Icon.jpg'),
  },
];

interface SwipeToStartButtonProps {
  onComplete: () => void;
  resetTrigger?: number;
}

/**
 * Interactive Swipe-to-Start Button with PanResponder, text fade-out,
 * and animated flowing progress fill matching the bible_fun_facts reference.
 */
function SwipeToStartButton({ onComplete, resetTrigger }: SwipeToStartButtonProps) {
  const panX = useRef(new Animated.Value(0)).current;
  const trackWidth = 220;
  const thumbSize = 44;
  const maxDrag = trackWidth - thumbSize - 8;

  useEffect(() => {
    panX.setValue(0);
  }, [resetTrigger, panX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          const clamped = Math.min(gestureState.dx, maxDrag);
          panX.setValue(clamped);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > maxDrag * 0.55) {
          Animated.timing(panX, {
            toValue: maxDrag,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            onComplete();
            setTimeout(() => panX.setValue(0), 400);
          });
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const textOpacity = panX.interpolate({
    inputRange: [0, maxDrag * 0.45],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fillWidth = panX.interpolate({
    inputRange: [0, maxDrag],
    outputRange: [thumbSize + 8, trackWidth],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.swipeTrack, shadow.sm]}>
      <Animated.View
        style={[
          styles.swipeProgressFill,
          { width: fillWidth },
        ]}
      />

      <Animated.View style={{ opacity: textOpacity }}>
        <Text
          variant="caption"
          weight="700"
          color={colors.textSecondary}
          style={styles.swipeTrackText}
        >
          Swipe to start »
        </Text>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.swipeThumb,
          shadow.md,
          {
            transform: [{ translateX: panX }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            onComplete();
            panX.setValue(0);
          }}
          style={styles.swipeThumbTouchable}
        >
          <Text variant="h3" weight="800" color="#FFFFFF" style={styles.arrowText}>
            →
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

interface OnboardingScreenProps {
  onSwipeToSignUp: () => void;
  onNavigateToLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onSwipeToSignUp,
  onNavigateToLogin,
}) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [resetTrigger, setResetTrigger] = useState(0);

  const artWidth = Math.min(width - spacing.xl * 2, 320);
  const artHeight = 220;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onSwipeToSignUp();
    }
  };

  // Sliding tab locator interpolation across 3 stationary slots
  const pillTranslateX = scrollX.interpolate({
    inputRange: [0, width, 2 * width],
    outputRange: [0, 16, 32],
    extrapolate: 'clamp',
  });

  const pillWidth = scrollX.interpolate({
    inputRange: [0, width * 0.5, width, width * 1.5, 2 * width],
    outputRange: [22, 28, 22, 28, 22],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>MORABARABA</Text>
        </View>

        {currentIndex < ONBOARDING_SLIDES.length - 1 ? (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSwipeToSignUp}
            activeOpacity={0.7}
          >
            <Text variant="label" color={colors.textSecondary} weight="700">
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* Main Slide Content Area */}
      <View style={styles.mainContent}>
        {/* Pure Crossfade Shared Art Canvas (Zero scale pop) */}
        <View style={[styles.sharedArtContainer, { width: artWidth, height: artHeight }]}>
          {ONBOARDING_SLIDES.map((slide, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={slide.id}
                pointerEvents="none"
                style={[
                  styles.sharedArtSlide,
                  { width: artWidth, height: artHeight, opacity },
                ]}
              >
                <Image
                  source={slide.image}
                  style={styles.artImage}
                  resizeMode="cover"
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Paging Text Content */}
        <Animated.FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: handleScroll,
            }
          )}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={[styles.slideTextContainer, { width }]}>
              <View style={styles.textWrapper}>
                <Text variant="label" color={colors.accent} weight="700" style={styles.stepBadge}>
                  {item.step}
                </Text>

                <Text variant="h1" align="center" style={styles.slideTitle}>
                  {item.title}
                </Text>

                <Text
                  variant="caption"
                  align="center"
                  color={colors.accentHover}
                  weight="700"
                  style={styles.slideHighlight}
                >
                  {item.highlight}
                </Text>

                <Text
                  variant="body"
                  align="center"
                  color={colors.textSecondary}
                  style={styles.slideDescription}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* Persistent Bottom Controls Area */}
      <View style={styles.bottomArea}>
        <View style={styles.controlsRow}>
          {/* Sliding Liquid Pill Locator */}
          <View style={styles.indicatorContainer}>
            <View style={styles.trackDotSlots}>
              {ONBOARDING_SLIDES.map((_, i) => (
                <View key={i} style={styles.indicatorTrackDot} />
              ))}
            </View>

            <Animated.View
              style={[
                styles.slidingPill,
                {
                  transform: [{ translateX: pillTranslateX }],
                  width: pillWidth,
                },
              ]}
            />
          </View>

          {/* Action button on right */}
          {currentIndex < ONBOARDING_SLIDES.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextCircleBtn, shadow.md]}
              onPress={handleNext}
              activeOpacity={0.85}
              accessibilityLabel="Next slide"
            >
              <Text variant="h3" weight="800" color="#FFFFFF" style={styles.arrowText}>
                →
              </Text>
            </TouchableOpacity>
          ) : (
            <SwipeToStartButton
              onComplete={onSwipeToSignUp}
              resetTrigger={resetTrigger}
            />
          )}
        </View>

        {/* Secondary Link: Sign In */}
        <TouchableOpacity
          style={styles.signInLink}
          onPress={onNavigateToLogin}
          activeOpacity={0.7}
        >
          <Text variant="body" color={colors.textSecondary} align="center">
            Already have an account?{' '}
            <Text variant="body" color={colors.accent} weight="700">
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
    borderRadius: 0,
  },
  brandTitle: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'SpaceMono',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  skipPlaceholder: {
    width: 48,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharedArtContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  sharedArtSlide: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  slideTextContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
  textWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  stepBadge: {
    marginBottom: 4,
    letterSpacing: 1.2,
  },
  slideTitle: {
    marginBottom: 4,
  },
  slideHighlight: {
    marginBottom: spacing.sm,
  },
  slideDescription: {
    paddingHorizontal: spacing.sm,
  },
  bottomArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    minHeight: 120,
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    marginBottom: spacing.sm,
  },
  indicatorContainer: {
    width: 56,
    height: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  trackDotSlots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  indicatorTrackDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.16)',
  },
  slidingPill: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  nextCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeTrack: {
    width: 220,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  swipeProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(229, 169, 60, 0.16)',
    borderRadius: 26,
  },
  swipeTrackText: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginLeft: 32,
  },
  swipeThumb: {
    position: 'absolute',
    left: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeThumbTouchable: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLink: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    lineHeight: 22,
  },
});
