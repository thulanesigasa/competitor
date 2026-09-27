import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { MorabarabaBoard } from '../../components/game/MorabarabaBoard';
import { GamePhase, GameState, Player } from '../../types/game';
import {
  createInitialGameState,
  formsNewMill,
  getLegalDestinations,
  getLegalShotVertices,
  hasLegalMoves,
} from '../../engine/morabaraba';
import { CoinTossModal } from '../../components/game/CoinTossModal';

type DuelMode = 'menu' | 'pass_and_play' | 'wifi_host' | 'wifi_join';

export const BattlegroundScreen: React.FC = () => {
  const { showAlert } = useThemedAlert();
  const [mode, setMode] = useState<DuelMode>('menu');
  const [roomPin, setRoomPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [statusMessage, setStatusMessage] = useState('Player 1 (Gold): Place your cow.');
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [pendingTargetMode, setPendingTargetMode] = useState<DuelMode>('pass_and_play');

  const startPassAndPlay = () => {
    setPendingTargetMode('pass_and_play');
    setShowCoinToss(true);
  };

  const startHostWifi = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomPin(pin);
    setMode('wifi_host');
  };

  const handleHostStart = () => {
    setPendingTargetMode('pass_and_play');
    setShowCoinToss(true);
  };

  const joinWifiMatch = () => {
    if (enteredPin.length < 4) {
      showAlert({ title: 'Invalid PIN', message: 'Please enter a 4-digit battle PIN.' });
      return;
    }
    setPendingTargetMode('pass_and_play');
    setShowCoinToss(true);
  };

  const handleTossComplete = (firstPlayer: Player) => {
    setShowCoinToss(false);
    setGameState(createInitialGameState(firstPlayer));
    const firstPlayerName = firstPlayer === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Ivory)';
    setStatusMessage(`${firstPlayerName} won the coin toss! Place your cow.`);
    setMode(pendingTargetMode);
  };

  const handleVertexPress = (vertexId: number) => {
    if (gameState.winner) return;

    const current = gameState.currentPlayer;
    const opponent: Player = current === 'player1' ? 'player2' : 'player1';
    const currentPhase: GamePhase = gameState.phase[current];

    // Case 1: Shoot opponent cow
    if (gameState.mustShoot) {
      const legalShots = getLegalShotVertices(gameState.board, opponent);
      if (legalShots.includes(vertexId)) {
        const nextBoard = [...gameState.board];
        nextBoard[vertexId] = null;

        const remainingVictimActive = gameState.activeCows[opponent] - 1;
        const victimUnplaced = gameState.unplacedCows[opponent];

        let nextVictimPhase = gameState.phase[opponent];
        if (victimUnplaced === 0 && remainingVictimActive === 3) {
          nextVictimPhase = 'flying';
        }

        let winner: Player | null = null;
        if (victimUnplaced === 0 && remainingVictimActive < 3) {
          winner = current;
        } else if (victimUnplaced === 0 && !hasLegalMoves(nextBoard, opponent, nextVictimPhase)) {
          winner = current;
        }

        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          activeCows: { ...prev.activeCows, [opponent]: remainingVictimActive },
          capturedCows: { ...prev.capturedCows, [current]: prev.capturedCows[current] + 1 },
          phase: { ...prev.phase, [opponent]: nextVictimPhase },
          mustShoot: false,
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          winner,
        }));

        if (winner) {
          showAlert({
            title: 'Victory!',
            message: `${winner === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Ivory)'} has won the match!`,
            buttons: [{ text: 'Play Again', onPress: () => setShowCoinToss(true) }],
          });
        } else {
          setStatusMessage(`${opponent === 'player1' ? 'Player 1' : 'Player 2'}'s turn.`);
        }
      } else {
        showAlert({ title: 'Cannot Shoot', message: 'Selected cow is protected in a mill or not an opponent cow.' });
      }
      return;
    }

    // Case 2: Placing Phase
    if (currentPhase === 'placing') {
      if (gameState.board[vertexId] !== null) {
        showAlert({ title: 'Occupied', message: 'This intersection is already occupied.' });
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[vertexId] = current;
      const mill = formsNewMill(nextBoard, vertexId, current);
      const remainingUnplaced = gameState.unplacedCows[current] - 1;
      const nextPhase = remainingUnplaced === 0 ? 'moving' : 'placing';

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [current]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [current]: prev.activeCows[current] + 1 },
          phase: { ...prev.phase, [current]: nextPhase },
          mustShoot: true,
          lastMove: { to: vertexId, player: current, formedMill: true },
        }));
        setStatusMessage(`${current === 'player1' ? 'Player 1' : 'Player 2'} formed a mill! Shoot an opponent cow.`);
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [current]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [current]: prev.activeCows[current] + 1 },
          phase: { ...prev.phase, [current]: nextPhase },
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { to: vertexId, player: current },
        }));
        setStatusMessage(`${opponent === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Ivory)'}: Place a cow.`);
      }
      return;
    }

    // Case 3: Moving / Flying Phase
    if (gameState.board[vertexId] === current) {
      setGameState((prev) => ({ ...prev, selectedVertex: vertexId }));
      setStatusMessage('Cow selected. Tap a valid destination.');
      return;
    }

    if (gameState.selectedVertex !== null && gameState.board[vertexId] === null) {
      const legalDests = getLegalDestinations(gameState.board, gameState.selectedVertex, currentPhase);
      if (!legalDests.includes(vertexId)) {
        showAlert({ title: 'Invalid Move', message: 'Must move to connected adjacent empty intersection.' });
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[gameState.selectedVertex] = null;
      nextBoard[vertexId] = current;
      const mill = formsNewMill(nextBoard, vertexId, current);

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          mustShoot: true,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: current, formedMill: true },
        }));
        setStatusMessage(`${current === 'player1' ? 'Player 1' : 'Player 2'} formed a mill! Shoot an opponent cow.`);
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: current },
        }));
        setStatusMessage(`${opponent === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Ivory)'}'s turn to move.`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="BATTLEGROUND"
        subtitle={mode === 'menu' ? 'ONLINE BATTLE' : 'LIVE MATCH'}
        showBack={mode !== 'menu'}
        onBack={() => setMode('menu')}
        rightActionLabel={mode !== 'menu' ? 'Coin Toss' : undefined}
        onRightAction={mode !== 'menu' ? () => setShowCoinToss(true) : undefined}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mode === 'menu' && (
          <View style={styles.menuContainer}>
            <View style={styles.introSection}>
              <Text style={styles.sectionTitle}>MULTIPLAYER BATTLES</Text>
              <Text style={styles.sectionDesc}>
                Compete against friends face-to-face. Play together with a fair coin toss to start, or connect in an online battle.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={startPassAndPlay}
            >
              <Text style={styles.actionTitle}>PASS & PLAY</Text>
              <Text style={styles.actionDesc}>
                Take turns making moves with fair coin toss turn selection. Perfect for competitive strategy anywhere.
              </Text>
              <Text style={styles.actionTag}>Instant Start →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={startHostWifi}
            >
              <Text style={styles.actionTitle}>HOST ONLINE BATTLE</Text>
              <Text style={styles.actionDesc}>
                Create an online battle room and share a 4-digit PIN with a nearby player.
              </Text>
              <Text style={styles.actionTag}>Host Battle →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => setMode('wifi_join')}
            >
              <Text style={styles.actionTitle}>JOIN ONLINE BATTLE</Text>
              <Text style={styles.actionDesc}>
                Enter the 4-digit room code from a host to connect to the online battle.
              </Text>
              <Text style={styles.actionTag}>Enter PIN →</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'wifi_host' && (
          <View style={styles.dialogSection}>
            <Text style={styles.dialogTitle}>HOSTING ONLINE BATTLE</Text>
            <Text style={styles.dialogDesc}>
              Ask Player 2 to open Battleground → Join Online Battle, and enter this PIN:
            </Text>
            <View style={styles.pinDisplay}>
              <Text style={styles.pinText}>{roomPin}</Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleHostStart}
            >
              <Text style={styles.primaryButtonText}>Start Online Battle →</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'wifi_join' && (
          <View style={styles.dialogSection}>
            <Text style={styles.dialogTitle}>JOIN ONLINE BATTLE</Text>
            <Text style={styles.dialogDesc}>
              Enter the 4-digit PIN displayed on the host's screen to connect:
            </Text>
            <TextInput
              style={styles.pinInput}
              placeholder="e.g. 5421"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={joinWifiMatch}
              maxLength={4}
              value={enteredPin}
              onChangeText={setEnteredPin}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={joinWifiMatch}
            >
              <Text style={styles.primaryButtonText}>Connect to Battle →</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'pass_and_play' && (
          <View>
            <View style={styles.statusBox}>
              <Text style={styles.statusTurn}>
                {gameState.currentPlayer === 'player1' ? 'PLAYER 1 (GOLD)' : 'PLAYER 2 (IVORY)'}
              </Text>
              <Text style={styles.statusMessage}>{statusMessage}</Text>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>P1 (GOLD)</Text>
                <Text style={styles.cowCount}>
                  Hand: {gameState.unplacedCows.player1} • Board: {gameState.activeCows.player1}
                </Text>
                <Text style={styles.phaseLabel}>
                  {gameState.phase.player1.toUpperCase()}
                </Text>
              </View>
              <View style={styles.vsBox}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
                <Text style={styles.playerName}>P2 (CHARCOAL)</Text>
                <Text style={styles.cowCount}>
                  Hand: {gameState.unplacedCows.player2} • Board: {gameState.activeCows.player2}
                </Text>
                <Text style={styles.phaseLabel}>
                  {gameState.phase.player2.toUpperCase()}
                </Text>
              </View>
            </View>

            <MorabarabaBoard
              gameState={gameState}
              onVertexPress={handleVertexPress}
            />

            <TouchableOpacity
              style={styles.reTossBtn}
              onPress={() => setShowCoinToss(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.reTossBtnText}>New Battle (Coin Toss) ↺</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CoinTossModal
        visible={showCoinToss}
        onClose={() => setShowCoinToss(false)}
        onTossComplete={handleTossComplete}
        player1Name="Player 1"
        player2Name="Player 2"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  menuContainer: {
    gap: 0,
  },
  introSection: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  actionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  actionTag: {
    color: COLORS.accentHover,
    fontSize: 13,
    fontWeight: '700',
  },
  dialogSection: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  dialogTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  dialogDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pinDisplay: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    marginBottom: SPACING.lg,
  },
  pinText: {
    color: COLORS.accentHover,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  pinInput: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    width: 160,
    height: 52,
    fontSize: 24,
    textAlign: 'center',
    color: COLORS.textPrimary,
    letterSpacing: 6,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    width: '100%',
    height: 48,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  statusBox: {
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusTurn: {
    color: COLORS.accentHover,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statusMessage: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.xs,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  cowCount: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  phaseLabel: {
    color: COLORS.accentHover,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  vsBox: {
    paddingHorizontal: 8,
  },
  vsText: {
    color: COLORS.accentHover,
    fontSize: 12,
    fontWeight: '900',
  },
  reTossBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reTossBtnText: {
    color: COLORS.accentHover,
    fontSize: 13,
    fontWeight: '700',
  },
});
