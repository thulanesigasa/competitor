import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { MorabarabaBoard } from '../../components/game/MorabarabaBoard';
import {
  AiDifficulty,
  GamePhase,
  GameState,
  Player,
} from '../../types/game';
import {
  createInitialGameState,
  formsNewMill,
  getLegalDestinations,
  getLegalShotVertices,
  hasLegalMoves,
  TOTAL_COWS_PER_PLAYER,
} from '../../engine/morabaraba';
import { computeAiMove } from '../../engine/ai';
import { recordGameResult } from '../../store/gameStore';

export const OfflineScreen: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [difficulty, setDifficulty] = useState<AiDifficulty>('warrior');
  const [statusMessage, setStatusMessage] = useState('Place your cow on any empty intersection.');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const resetGame = () => {
    setGameState(createInitialGameState());
    setStatusMessage('Place your cow on any empty intersection.');
    setIsAiThinking(false);
  };

  // AI Turn Handler
  useEffect(() => {
    if (gameState.winner || gameState.currentPlayer !== 'player2') return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      handleAiTurn();
    }, 600);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayer, gameState.mustShoot, gameState.winner]);

  const handleAiTurn = () => {
    const decision = computeAiMove(gameState, difficulty);
    const cpu: Player = 'player2';
    const opponent: Player = 'player1';
    const cpuPhase: GamePhase = gameState.phase[cpu];

    // AI is shooting a cow
    if (gameState.mustShoot) {
      if (decision.shotVertex !== undefined && decision.shotVertex >= 0) {
        executeShot(decision.shotVertex, cpu);
      } else {
        // No legal shootable piece
        endTurn(cpu);
      }
      setIsAiThinking(false);
      return;
    }

    // AI is placing a cow
    if (cpuPhase === 'placing' && decision.to !== undefined) {
      const nextBoard = [...gameState.board];
      nextBoard[decision.to] = cpu;
      const mill = formsNewMill(nextBoard, decision.to, cpu);
      const remainingUnplaced = gameState.unplacedCows[cpu] - 1;
      const nextPhase = remainingUnplaced === 0 ? 'moving' : 'placing';

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [cpu]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [cpu]: prev.activeCows[cpu] + 1 },
          phase: { ...prev.phase, [cpu]: nextPhase },
          mustShoot: true,
          lastMove: { to: decision.to!, player: cpu, formedMill: true },
        }));
        setStatusMessage('CPU formed a mill and is shooting your cow!');
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [cpu]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [cpu]: prev.activeCows[cpu] + 1 },
          phase: { ...prev.phase, [cpu]: nextPhase },
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { to: decision.to!, player: cpu },
        }));
        setStatusMessage('Your turn: place a cow.');
      }
      setIsAiThinking(false);
      return;
    }

    // AI is moving or flying
    if (decision.from !== undefined && decision.to !== undefined) {
      const nextBoard = [...gameState.board];
      nextBoard[decision.from] = null;
      nextBoard[decision.to] = cpu;
      const mill = formsNewMill(nextBoard, decision.to, cpu);

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          mustShoot: true,
          lastMove: { from: decision.from, to: decision.to!, player: cpu, formedMill: true },
        }));
        setStatusMessage('CPU formed a mill and is shooting your cow!');
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { from: decision.from, to: decision.to!, player: cpu },
        }));
        setStatusMessage('Your turn to move.');
      }
      setIsAiThinking(false);
    }
  };

  // Human (Player 1) Vertex Click
  const handleVertexPress = (vertexId: number) => {
    if (isAiThinking || gameState.winner || gameState.currentPlayer !== 'player1') return;

    const human: Player = 'player1';
    const opponent: Player = 'player2';
    const humanPhase: GamePhase = gameState.phase[human];

    // Case 1: Human must shoot an opponent cow
    if (gameState.mustShoot) {
      const legalShots = getLegalShotVertices(gameState.board, opponent);
      if (legalShots.includes(vertexId)) {
        executeShot(vertexId, human);
      } else {
        Alert.alert('Cannot Shoot Cow', 'This cow is protected in a mill or not an opponent cow.');
      }
      return;
    }

    // Case 2: Placing Phase
    if (humanPhase === 'placing') {
      if (gameState.board[vertexId] !== null) {
        Alert.alert('Occupied', 'This intersection already has a cow.');
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[vertexId] = human;
      const mill = formsNewMill(nextBoard, vertexId, human);
      const remainingUnplaced = gameState.unplacedCows[human] - 1;
      const nextPhase = remainingUnplaced === 0 ? 'moving' : 'placing';

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [human]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [human]: prev.activeCows[human] + 1 },
          phase: { ...prev.phase, [human]: nextPhase },
          mustShoot: true,
          lastMove: { to: vertexId, player: human, formedMill: true },
        }));
        setStatusMessage('Mill formed! Tap an opponent cow to shoot it.');
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [human]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [human]: prev.activeCows[human] + 1 },
          phase: { ...prev.phase, [human]: nextPhase },
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { to: vertexId, player: human },
        }));
        setStatusMessage('CPU is thinking...');
      }
      return;
    }

    // Case 3: Moving / Flying Phase
    // Sub-case A: Select or reselect own cow
    if (gameState.board[vertexId] === human) {
      setGameState((prev) => ({
        ...prev,
        selectedVertex: vertexId,
      }));
      setStatusMessage('Cow selected. Tap a connected empty intersection.');
      return;
    }

    // Sub-case B: Moving selected cow to destination
    if (gameState.selectedVertex !== null && gameState.board[vertexId] === null) {
      const legalDests = getLegalDestinations(
        gameState.board,
        gameState.selectedVertex,
        humanPhase
      );

      if (!legalDests.includes(vertexId)) {
        Alert.alert('Invalid Move', 'You can only move to adjacent connected intersections.');
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[gameState.selectedVertex] = null;
      nextBoard[vertexId] = human;
      const mill = formsNewMill(nextBoard, vertexId, human);

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          mustShoot: true,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: human, formedMill: true },
        }));
        setStatusMessage('Mill formed! Tap an opponent cow to shoot it.');
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: human },
        }));
        setStatusMessage('CPU is thinking...');
      }
    }
  };

  // Execute Shot / Capture
  const executeShot = (targetVertex: number, shooter: Player) => {
    const victim: Player = shooter === 'player1' ? 'player2' : 'player1';
    const nextBoard = [...gameState.board];
    nextBoard[targetVertex] = null;

    const remainingVictimActive = gameState.activeCows[victim] - 1;
    const victimUnplaced = gameState.unplacedCows[victim];

    // Check Flying Phase trigger (cows == 3 after placing)
    let nextVictimPhase = gameState.phase[victim];
    if (victimUnplaced === 0 && remainingVictimActive === 3) {
      nextVictimPhase = 'flying';
    }

    // Check Win Condition:
    // Opponent has fewer than 3 cows when unplaced == 0, OR has 0 legal moves
    let winner: Player | null = null;
    if (victimUnplaced === 0 && remainingVictimActive < 3) {
      winner = shooter;
    } else if (victimUnplaced === 0 && !hasLegalMoves(nextBoard, victim, nextVictimPhase)) {
      winner = shooter;
    }

    const updatedState: GameState = {
      ...gameState,
      board: nextBoard,
      activeCows: { ...gameState.activeCows, [victim]: remainingVictimActive },
      capturedCows: { ...gameState.capturedCows, [shooter]: gameState.capturedCows[shooter] + 1 },
      phase: { ...gameState.phase, [victim]: nextVictimPhase },
      mustShoot: false,
      currentPlayer: victim,
      turnCount: gameState.turnCount + 1,
      winner,
      lastMove: { ...gameState.lastMove!, shotVertex: targetVertex },
    };

    setGameState(updatedState);

    if (winner) {
      const isHumanWin = winner === 'player1';
      recordGameResult(isHumanWin, 1, 1, gameState.phase.player1 === 'flying');
      Alert.alert(
        isHumanWin ? 'Victory!' : 'Defeated',
        isHumanWin
          ? 'Congratulations! You outmaneuvered the CPU in true Morabaraba tradition.'
          : 'The CPU captured your herd. Train further and rematch!',
        [{ text: 'Play Again', onPress: resetGame }]
      );
    } else {
      setStatusMessage(
        shooter === 'player1'
          ? 'Opponent cow captured. CPU is thinking...'
          : 'Your cow was shot. Your turn to move.'
      );
    }
  };

  const endTurn = (player: Player) => {
    const nextPlayer: Player = player === 'player1' ? 'player2' : 'player1';
    setGameState((prev) => ({
      ...prev,
      mustShoot: false,
      currentPlayer: nextPlayer,
      turnCount: prev.turnCount + 1,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="SOLO ARENA"
        subtitle="1P VS CPU ENGINE"
        rightActionLabel="Reset"
        onRightAction={resetGame}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Difficulty Selector */}
        <View style={styles.difficultyRow}>
          {(['novice', 'warrior', 'grandmaster'] as AiDifficulty[]).map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => {
                setDifficulty(d);
                resetGame();
              }}
              style={[
                styles.difficultyBtn,
                difficulty === d && styles.difficultyBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  difficulty === d && styles.difficultyTextActive,
                ]}
              >
                {d === 'novice' ? 'Novice' : d === 'warrior' ? 'Warrior' : 'Grandmaster'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Bar */}
        <View style={styles.statusBox}>
          <Text style={styles.statusTurn}>
            {gameState.currentPlayer === 'player1' ? 'YOUR TURN' : 'CPU TURN'}
          </Text>
          <Text style={styles.statusMessage}>{statusMessage}</Text>
        </View>

        {/* Scores & Cows Info */}
        <View style={styles.scoreRow}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>YOU (GOLD)</Text>
            <Text style={styles.cowCount}>
              Hand: {gameState.unplacedCows.player1} • Board: {gameState.activeCows.player1}
            </Text>
            <Text style={styles.phaseLabel}>
              Phase: {gameState.phase.player1.toUpperCase()}
            </Text>
          </View>
          <View style={styles.vsBox}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={styles.playerName}>CPU (IVORY)</Text>
            <Text style={styles.cowCount}>
              Hand: {gameState.unplacedCows.player2} • Board: {gameState.activeCows.player2}
            </Text>
            <Text style={styles.phaseLabel}>
              Phase: {gameState.phase.player2.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* The 24-Point Morabaraba Board */}
        <MorabarabaBoard
          gameState={gameState}
          onVertexPress={handleVertexPress}
          disabled={isAiThinking || gameState.winner !== null}
        />
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
    padding: SPACING.sm,
    paddingBottom: 90, // Leave room for floating bottom tab bar
  },
  difficultyRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  difficultyBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  difficultyBtnActive: {
    backgroundColor: COLORS.accent,
  },
  difficultyText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyTextActive: {
    color: COLORS.background,
  },
  statusBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    alignItems: 'center',
  },
  statusTurn: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statusMessage: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
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
    borderColor: COLORS.border,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cowCount: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  phaseLabel: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  vsBox: {
    paddingHorizontal: 8,
  },
  vsText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '900',
  },
});
