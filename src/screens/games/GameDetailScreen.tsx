import React from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/Typography';
import { colors } from '../../theme/colors';

export type GameId = 'morabaraba' | 'chess' | 'checkers';

interface GameContent {
  title: string;
  subtitle: string;
  heritage: string;
  boardSetup: string;
  objective: string;
  rules: Array<{ heading: string; body: string }>;
  tactics: string[];
  isComingSoon: boolean;
  comingSoonText?: string;
}

const GAME_DATA: Record<GameId, GameContent> = {
  morabaraba: {
    title: 'MORABARABA',
    subtitle: 'TRADITIONAL SOUTHERN AFRICAN BOARD STRATEGY',
    heritage:
      'Morabaraba (also known as Mbalavala or Umlabalaba) is an ancient two-player abstract strategy board game deeply rooted in Southern African tactical culture. Played for centuries across South Africa, Lesotho, Botswana, Zimbabwe, Eswatini, and Zambia, it traditionally served as a battlefield training ground for pastoral herdsmen, teaching spatial calculation, patient defense, and aggressive territorial encirclement. The counters are revered as "cows" (iinkomo / dikgomo), reflecting the pastoral wealth of the region.',
    boardSetup:
      'The board consists of three concentric squares linked by eight orthogonal and diagonal lines, forming 24 intersecting vertices. Two competitors face each other commanding 12 cows each: Player 1 controls the Gold herd, while Player 2 commands the Charcoal herd.',
    objective:
      'The objective is to reduce the opponent’s herd to fewer than 3 cows, or to trap the opponent so they have zero legal moves remaining on their turn.',
    rules: [
      {
        heading: 'Phase 1: Placing Phase (Ukubeka)',
        body: 'Players alternate turns placing one cow at a time onto any unoccupied vertex. If a player places a cow that completes a collinear line of three cows of their own color (called a mill or "umphahlo"), they immediately earn the right to shoot (capture) any one of the opponent’s cows from the board.',
      },
      {
        heading: 'Phase 2: Moving Phase (Ukuhambisa)',
        body: 'Once all 12 cows per player have been placed on the board, competitors take turns sliding one cow along a connected line to an adjacent vacant intersection. Forming a new mill in this phase allows shooting another opponent cow. Opening and re-closing a mill on successive moves is a cornerstone tactical technique.',
      },
      {
        heading: 'Phase 3: Flying Phase (Ku-fofa)',
        body: 'When a competitor’s herd is reduced to exactly 3 cows during the moving phase, their cows gain the sacred ability of flight (ku-fofa). A flying cow can leap directly to any unoccupied vertex across the entire board, ignoring connected line adjacency.',
      },
      {
        heading: 'Sacred Mill Protection (Umphahlo)',
        body: 'Cows currently forming part of an active mill are sacred and protected from capture. An opponent cannot shoot a cow that is in an active mill unless all remaining cows of that player on the board are locked in mills.',
      },
    ],
    tactics: [
      'Control the 4 intersection vertices where diagonals and squares meet.',
      'Establish a "see-saw" double-mill that opens and closes on every alternating turn.',
      'Avoid placing cows on dead-end vertices during the opening phase.',
      'Prepare defensive traps to block your opponent’s cows before they can fly.',
    ],
    isComingSoon: false,
  },
  chess: {
    title: 'CHESS',
    subtitle: 'CLASSIC 64-SQUARE GRANDMASTER STRATEGY',
    heritage:
      'Originating in ancient India over 1,500 years ago as Chaturanga, Chess evolved through Persia and the Arab world into the global pinnacle of intellect and strategic depth. Representing an intellectual duel between two royal kingdoms, Chess rewards deep positional foresight, opening theory, tactical combinations, and precise endgame execution.',
    boardSetup:
      'Played on an 8x8 checkered board of 64 alternating light and dark squares. Each competitor commands an army of 16 pieces: 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, and 8 Pawns. White moves first, followed by Black.',
    objective:
      'The ultimate objective is to checkmate the opponent’s King. Checkmate occurs when the King is under direct attack (check) and has no legal move to escape, block the attack, or capture the checking piece.',
    rules: [
      {
        heading: 'King & Queen Movement',
        body: 'The King moves one square in any direction (horizontal, vertical, or diagonal). The Queen is the most versatile piece on the board, moving any number of vacant squares along ranks, files, or diagonals.',
      },
      {
        heading: 'Rooks, Bishops & Knights',
        body: 'Rooks slide straight along ranks and files. Bishops travel diagonally along squares of their assigned color. Knights leap in an unique "L" shape (two squares in one direction and one square perpendicular) and are the only piece capable of jumping over other units.',
      },
      {
        heading: 'Pawn Dynamics, En Passant & Promotion',
        body: 'Pawns step forward one square (or two on their initial move) and capture diagonally forward. A pawn that reaches the enemy back rank immediately promotes into a Queen, Rook, Bishop, or Knight.',
      },
      {
        heading: 'Castling & Special Safety Moves',
        body: 'Castling allows the King to slide two squares toward a Rook while the Rook hops over to the adjacent square, securing King safety and activating the Rook in a single move.',
      },
    ],
    tactics: [
      'Control the four central squares (d4, d5, e4, e5) during the opening.',
      'Develop minor pieces (Knights and Bishops) early before attacking.',
      'Castle early to protect your King and connect your Rooks.',
      'Always calculate your opponent’s forcing moves (checks, captures, threats).',
    ],
    isComingSoon: false,
  },
  checkers: {
    title: 'CHECKERS / DRAUGHTS',
    subtitle: 'TRADITIONAL 8X8 DIAGONAL STRATEGY',
    heritage:
      'Checkers (also known as Draughts) has been played across the African continent and globally for centuries. Popular in community gathering spots, parks, and schools throughout Southern Africa, checkers combines rapid diagonal calculations, tactical sacrifices, and forced multiple-jump combinations.',
    boardSetup:
      'Checkers is played on an 8x8 grid of 64 squares, utilizing exclusively the 32 dark squares. Each player begins with 12 disc-shaped counters ("men") positioned on the dark squares of the three rows nearest to them.',
    objective:
      'The objective is to capture all 12 of the opponent’s pieces, or to block the opponent completely so they are left with zero legal diagonal moves.',
    rules: [
      {
        heading: 'Basic Diagonal Movement',
        body: 'Uncrowned pieces ("men") move forward diagonally by one square to an adjacent unoccupied dark square. Standard pieces can never move backward.',
      },
      {
        heading: 'Jumping & Mandatory Captures',
        body: 'If an opponent’s piece is diagonally adjacent and the square immediately beyond is vacant, the player must jump over the opponent’s piece and remove it. When a capture is available, jumping is mandatory.',
      },
      {
        heading: 'Multi-Jump Sequences',
        body: 'If a piece completes a jump and lands on a square from which another jump is immediately possible, the player must continue jumping in the same turn until all successive captures are completed.',
      },
      {
        heading: 'Crowning Kings',
        body: 'When a man reaches the opponent’s farthest row (the king row), it is crowned as a King. Kings gain the powerful ability to move and capture both forward and backward diagonally.',
      },
    ],
    tactics: [
      'Maintain control of the center dark squares to limit opponent mobility.',
      'Keep your back row intact for as long as possible to prevent opponent kings.',
      'Sacrifice a piece to force an opponent into a multi-jump capture trap.',
      'Advance pieces in pairs or triangular formations to avoid isolated captures.',
    ],
    isComingSoon: false,
  },
};

export const GameDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const gameId: GameId = (route.params?.gameId as GameId) || 'morabaraba';
  const game = GAME_DATA[gameId] || GAME_DATA.morabaraba;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="GAMES & HERITAGE"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Title Header */}
        <Text variant="label" weight="900" color={colors.accentHover} style={styles.kicker}>
          {game.subtitle}
        </Text>
        <Text variant="h1" weight="900" color={colors.textPrimary} style={styles.gameTitle}>
          {game.title}
        </Text>

        <View style={styles.divider} />

        {/* 1. About the Game */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          ABOUT THE GAME & HERITAGE
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.bodyParagraph}>
          {game.heritage}
        </Text>

        <View style={styles.divider} />

        {/* 2. Board & Equipment */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          BOARD STRUCTURE & PIECES
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.bodyParagraph}>
          {game.boardSetup}
        </Text>

        <View style={styles.divider} />

        {/* 3. Objective */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          OBJECTIVE OF THE GAME
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.bodyParagraph}>
          {game.objective}
        </Text>

        <View style={styles.divider} />

        {/* 4. Rules of Play */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          RULES OF PLAY
        </Text>
        {game.rules.map((rule, index) => (
          <View key={index} style={styles.ruleItem}>
            <Text variant="body" weight="800" color={colors.textPrimary} style={styles.ruleHeading}>
              {rule.heading}
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.ruleBody}>
              {rule.body}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* 5. Key Tactics */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          TACTICAL PRINCIPLES
        </Text>
        {game.tactics.map((tactic, idx) => (
          <View key={idx} style={styles.tacticRow}>
            <Text variant="body" weight="900" color={colors.accentHover} style={styles.bulletDot}>
              •
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.tacticText}>
              {tactic}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Bottom Section: Enter Battleground */}
        <View style={styles.playActionContainer}>
          <TouchableOpacity
            style={styles.playButton}
            activeOpacity={0.8}
            onPress={() => {
              if (gameId === 'checkers') {
                navigation.navigate('CheckersGame');
              } else if (gameId === 'chess') {
                navigation.navigate('ChessGame');
              } else {
                navigation.navigate('MainTabs', { screen: 'Battleground' });
              }
            }}
          >
            <Text variant="body" weight="900" color="#FFFFFF" style={styles.playButtonText}>
              ENTER BATTLEGROUND NOW →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 64,
  },
  kicker: {
    letterSpacing: 1,
    marginBottom: 4,
    fontSize: 10.5,
  },
  gameTitle: {
    fontSize: 26,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: SPACING.md,
  },
  sectionHeading: {
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    fontSize: 12,
  },
  bodyParagraph: {
    lineHeight: 22,
    fontSize: 13.5,
  },
  ruleItem: {
    marginTop: SPACING.sm,
  },
  ruleHeading: {
    fontSize: 13.5,
    marginBottom: 3,
  },
  ruleBody: {
    lineHeight: 21,
    fontSize: 13,
  },
  tacticRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  tacticText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 13,
  },
  playActionContainer: {
    paddingVertical: SPACING.md,
  },
  playButton: {
    height: 48,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    letterSpacing: 0.8,
    fontSize: 12,
  },
});

export default GameDetailScreen;
