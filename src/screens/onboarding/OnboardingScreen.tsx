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
  ImageSourcePropType,
} from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
import { SwipeToSignUp } from '../../components/common/SwipeToSignUp';

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
              <View style={styles.imageContainer}>
                <Image
                  source={item.image}
                  style={styles.slideImage}
                  resizeMode="cover"
                />
              </View>
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
    borderRadius: 0,
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
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  stepBadge: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  slideTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 26,
    marginBottom: 2,
  },
  slideHighlight: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  slideDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
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
