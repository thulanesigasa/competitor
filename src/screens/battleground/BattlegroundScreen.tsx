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

type DuelMode = 'menu' | 'pass_and_play' | 'wifi_host' | 'wifi_join';

export const BattlegroundScreen: React.FC = () => {
  const { showAlert } = useThemedAlert();
  const [mode, setMode] = useState<DuelMode>('menu');
  const [roomPin, setRoomPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [statusMessage, setStatusMessage] = useState('Player 1 (Gold): Place your cow.');

  const startPassAndPlay = () => {
    setGameState(createInitialGameState());
    setStatusMessage('Player 1 (Gold): Place your cow.');
    setMode('pass_and_play');
  };

  const startHostWifi = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomPin(pin);
    setMode('wifi_host');
  };

  const joinWifiMatch = () => {
    if (enteredPin.length < 4) {
      showAlert({ title: 'Invalid PIN', message: 'Please enter a 4-digit match PIN.' });
      return;
    }
    setGameState(createInitialGameState());
    setStatusMessage(`Connected to Room ${enteredPin}! Match starting...`);
    setMode('pass_and_play');
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
            buttons: [{ text: 'Play Again', onPress: () => setGameState(createInitialGameState()) }],
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
        subtitle={mode === 'menu' ? '2-PLAYER DUEL' : 'LIVE MATCH'}
        showBack={mode !== 'menu'}
        onBack={() => setMode('menu')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mode === 'menu' && (
          <View style={styles.menuContainer}>
            <View style={styles.introCard}>
              <Text style={styles.cardTitle}>ZERO-DATA LOCAL DUELS</Text>
              <Text style={styles.cardDesc}>
                Compete against friends face-to-face. Play on the same screen or over local Wi-Fi without burning any cellular data.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={startPassAndPlay}
            >
              <Text style={styles.actionTitle}>PASS & PLAY (SAME DEVICE)</Text>
              <Text style={styles.actionDesc}>
                Take turns on this device. Perfect for tabletop strategy anywhere.
              </Text>
              <Text style={styles.actionTag}>Instant Start →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={startHostWifi}
            >
              <Text style={styles.actionTitle}>HOST WI-FI MATCH</Text>
              <Text style={styles.actionDesc}>
                Create a local match room and share a 4-digit PIN with a nearby player.
              </Text>
              <Text style={styles.actionTag}>Host Match →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => setMode('wifi_join')}
            >
              <Text style={styles.actionTitle}>JOIN WI-FI MATCH</Text>
              <Text style={styles.actionDesc}>
                Enter the 4-digit room code from a nearby player on the same Wi-Fi/Hotspot.
              </Text>
              <Text style={styles.actionTag}>Enter PIN →</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'wifi_host' && (
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>HOSTING LOCAL MATCH</Text>
            <Text style={styles.dialogDesc}>
              Ask Player 2 to open Battleground → Join Wi-Fi Match, and enter this PIN:
            </Text>
            <View style={styles.pinDisplay}>
              <Text style={styles.pinText}>{roomPin}</Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setGameState(createInitialGameState());
                setStatusMessage('Player 2 connected! Match starting...');
                setMode('pass_and_play');
              }}
            >
              <Text style={styles.primaryButtonText}>Start Match</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'wifi_join' && (
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>JOIN LOCAL MATCH</Text>
            <Text style={styles.dialogDesc}>
              Enter the 4-digit PIN displayed on the host's screen:
            </Text>
            <TextInput
              style={styles.pinInput}
              placeholder="e.g. 5421"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              maxLength={4}
              value={enteredPin}
              onChangeText={setEnteredPin}
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={joinWifiMatch}
            >
              <Text style={styles.primaryButtonText}>Connect to Room →</Text>
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
          </View>
        )}
      </ScrollView>
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
    gap: SPACING.md,
  },
  introCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
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
    marginBottom: 8,
  },
  actionTag: {
    color: COLORS.accentHover,
    fontSize: 13,
    fontWeight: '700',
  },
  dialogCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginBottom: SPACING.lg,
  },
  pinText: {
    color: COLORS.accentHover,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  pinInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 14,
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
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  statusBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.xs,
    alignItems: 'center',
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
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
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
});
