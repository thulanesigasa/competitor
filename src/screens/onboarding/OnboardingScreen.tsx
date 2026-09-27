import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
import { SwipeToSignUp } from '../../components/common/SwipeToSignUp';

interface Slide {
  id: string;
  step: string;
  title: string;
  description: string;
  highlight: string;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    id: '1',
    step: '01 / 03',
    title: 'THE ANCIENT ART OF STRATEGY',
    description:
      'Experience Southern Africa’s premier two-player tactical heritage. Place your twelve cows, outmaneuver your rival, and form unbreakable mills.',
    highlight: 'Pure Heritage • Zero Data',
  },
  {
    id: '2',
    step: '02 / 03',
    title: 'OFFLINE ENGINE & WI-FI DUELS',
    description:
      'Train offline against heuristic AI grandmasters or host high-stakes 1v1 duels with nearby challengers over zero-data local Wi-Fi hotspots.',
    highlight: 'Solo Mastery • Local Clash',
  },
  {
    id: '3',
    step: '03 / 03',
    title: 'RISE THROUGH THE REGIONAL RANKS',
    description:
      'Claim your custom Gamer Tag. Represent your town and province across South Africa, Zimbabwe, Zambia, Botswana, Malawi, Lesotho, and Eswatini.',
    highlight: 'Seven Nations • One Champion',
  },
];

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
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Top Brand Bar */}
      <View style={styles.topBar}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.brandTitle}>MORABARABA</Text>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width }]}>
            <View style={styles.slideCard}>
              <Text style={styles.stepBadge}>{item.step}</Text>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideHighlight}>{item.highlight}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Navigation & Actions */}
      <View style={styles.bottomArea}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {ONBOARDING_SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Action Controls */}
        {currentIndex === 2 ? (
          <View style={styles.actionBlock}>
            <SwipeToSignUp
              onSwipeComplete={onSwipeToSignUp}
              label="Swipe to Sign Up →"
            />
            <TouchableOpacity
              style={styles.loginLink}
              onPress={onNavigateToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginPrompt}>
                Already have an account?{' '}
                <Text style={styles.loginAction}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionBlock}>
            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.8}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index: currentIndex + 1,
                  animated: true,
                });
              }}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index: 2,
                  animated: true,
                });
              }}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: 12,
  },
  logo: {
    width: METRICS.brandLogoAuth,
    height: METRICS.brandLogoAuth,
    borderRadius: 6,
  },
  brandTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  slideCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBadge: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  slideTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 30,
    marginBottom: SPACING.xs,
  },
  slideHighlight: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  slideDescription: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  bottomArea: {
    paddingBottom: SPACING.lg,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.accent,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  actionBlock: {
    gap: SPACING.xs,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    marginHorizontal: SPACING.md,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.xs,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: SPACING.xs,
  },
  loginPrompt: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  loginAction: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
