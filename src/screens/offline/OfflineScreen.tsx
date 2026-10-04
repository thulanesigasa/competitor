import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { MorabarabaBoard } from '../../components/game/MorabarabaBoard';
import { CoinTossModal } from '../../components/game/CoinTossModal';
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
} from '../../engine/morabaraba';
import { computeAiMove } from '../../engine/ai';
import { recordGameResult } from '../../store/gameStore';
import { RuleTipModal } from '../../components/game/RuleTipModal';
import {
  RuleTip,
  MoveRecord,
  validateHumanReactionRate,
  validatePlacement,
  validateCowSelection,
  validateCowMove,
  validateCowShot,
} from '../../engine/morabarabaValidator';

export const OfflineScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { showAlert } = useThemedAlert();
  const [offlineMode, setOfflineMode] = useState<'ai' | 'pass_and_play'>('ai');
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [difficulty, setDifficulty] = useState<AiDifficulty>('warrior');
  const [statusMessage, setStatusMessage] = useState('Place your cow on any empty intersection.');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [ruleTip, setRuleTip] = useState<RuleTip | null>(null);
  const [showRuleTip, setShowRuleTip] = useState(false);
  const lastActionTimestamp = React.useRef<number | null>(null);
  const recentMoves = React.useRef<MoveRecord[]>([]);

  // Sync route params when routed from Battleground
  useEffect(() => {
    if (route.params?.mode === 'pass_and_play') {
      setOfflineMode('pass_and_play');
      setShowCoinToss(true);
    }
  }, [route.params?.timestamp, route.params?.mode]);

  const resetGame = () => {
    setShowCoinToss(true);
  };

  const handleTossComplete = (firstPlayer: Player) => {
    setShowCoinToss(false);
    setGameState(createInitialGameState(firstPlayer));
    setIsAiThinking(false);
    lastActionTimestamp.current = Date.now();
    recentMoves.current = [];
    if (offlineMode === 'ai') {
      if (firstPlayer === 'player1') {
        setStatusMessage('You won the coin toss! Place your cow.');
      } else {
        setStatusMessage('CPU won the coin toss! CPU makes the first move...');
      }
    } else {
      const winnerLabel = firstPlayer === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Charcoal)';
      setStatusMessage(`${winnerLabel} won the coin toss! Place your cow.`);
    }
  };

  // AI Turn Handler (Active exclusively in 'ai' mode)
  useEffect(() => {
    if (offlineMode !== 'ai') return;
    if (gameState.winner || gameState.currentPlayer !== 'player2') return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      handleAiTurn();
    }, 600);

    return () => clearTimeout(timer);
  }, [offlineMode, gameState.currentPlayer, gameState.mustShoot, gameState.winner]);

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

  // Vertex Press Handler (Supports human in AI mode & dual humans in Pass & Play mode)
  const handleVertexPress = (vertexId: number) => {
    if (gameState.winner) return;
    if (offlineMode === 'ai' && (isAiThinking || gameState.currentPlayer !== 'player1')) return;

    // 1. Anti-Bot / Script Reaction Speed Check
    const rateCheck = validateHumanReactionRate(lastActionTimestamp.current);
    if (!rateCheck.isValid) {
      setRuleTip(rateCheck.tip);
      setShowRuleTip(true);
      return;
    }

    const current: Player = gameState.currentPlayer;
    const opponent: Player = current === 'player1' ? 'player2' : 'player1';
    const currentPhase: GamePhase = gameState.phase[current];

    const currentName = offlineMode === 'ai'
      ? (current === 'player1' ? 'You' : 'CPU')
      : (current === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Charcoal)');

    const opponentName = offlineMode === 'ai'
      ? (opponent === 'player1' ? 'You' : 'CPU')
      : (opponent === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Charcoal)');

    // Case 1: Shoot opponent cow
    if (gameState.mustShoot) {
      const shotCheck = validateCowShot(gameState, current, vertexId);
      if (!shotCheck.isValid) {
        setRuleTip(shotCheck.tip);
        setShowRuleTip(true);
        return;
      }
      lastActionTimestamp.current = Date.now();
      executeShot(vertexId, current);
      return;
    }

    // Case 2: Placing Phase
    if (currentPhase === 'placing') {
      const placeCheck = validatePlacement(gameState, current, vertexId);
      if (!placeCheck.isValid) {
        setRuleTip(placeCheck.tip);
        setShowRuleTip(true);
        return;
      }

      lastActionTimestamp.current = Date.now();
      const nextBoard = [...gameState.board];
      nextBoard[vertexId] = current;
      const mill = formsNewMill(nextBoard, vertexId, current);
      const remainingUnplaced = gameState.unplacedCows[current] - 1;
      const nextPhase = remainingUnplaced === 0 ? 'moving' : 'placing';

      recentMoves.current.push({
        player: current,
        to: vertexId,
        timestamp: Date.now(),
      });

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
        setStatusMessage(`${currentName} formed a mill! Shoot an opponent cow.`);
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
        setStatusMessage(
          offlineMode === 'ai'
            ? 'CPU is thinking...'
            : `${opponentName}'s turn: Place a cow.`
        );
      }
      return;
    }

    // Case 3: Moving / Flying Phase
    // Sub-case A: Select or change selected cow
    if (gameState.selectedVertex === null || gameState.board[vertexId] === current) {
      const selectCheck = validateCowSelection(gameState, current, vertexId);
      if (!selectCheck.isValid) {
        setRuleTip(selectCheck.tip);
        setShowRuleTip(true);
        return;
      }
      lastActionTimestamp.current = Date.now();
      setGameState((prev) => ({
        ...prev,
        selectedVertex: vertexId,
      }));
      setStatusMessage(`${currentName}: Cow selected. Tap a connected empty intersection.`);
      return;
    }

    // Sub-case B: Moving selected cow to destination
    if (gameState.selectedVertex !== null) {
      const moveCheck = validateCowMove(
        gameState,
        current,
        gameState.selectedVertex,
        vertexId,
        recentMoves.current
      );
      if (!moveCheck.isValid) {
        setRuleTip(moveCheck.tip);
        setShowRuleTip(true);
        return;
      }

      lastActionTimestamp.current = Date.now();
      const nextBoard = [...gameState.board];
      nextBoard[gameState.selectedVertex] = null;
      nextBoard[vertexId] = current;
      const mill = formsNewMill(nextBoard, vertexId, current);

      recentMoves.current.push({
        player: current,
        from: gameState.selectedVertex,
        to: vertexId,
        timestamp: Date.now(),
      });

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          mustShoot: true,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: current, formedMill: true },
        }));
        setStatusMessage(`${currentName} formed a mill! Shoot an opponent cow.`);
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: current },
        }));
        setStatusMessage(
          offlineMode === 'ai'
            ? 'CPU is thinking...'
            : `${opponentName}'s turn to move.`
        );
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

    let nextVictimPhase = gameState.phase[victim];
    if (victimUnplaced === 0 && remainingVictimActive === 3) {
      nextVictimPhase = 'flying';
    }

    // Win evaluation: fewer than 3 cows or no legal moves
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
      if (offlineMode === 'ai') {
        const isHumanWin = winner === 'player1';
        recordGameResult(isHumanWin, 1, 1, gameState.phase.player1 === 'flying');
        showAlert({
          title: isHumanWin ? 'Victory!' : 'Defeated',
          message: isHumanWin
            ? 'Congratulations! You outmaneuvered the CPU in true Morabaraba tradition.'
            : 'The CPU captured your herd. Train further and rematch!',
          buttons: [{ text: 'Play Again', onPress: resetGame }],
        });
      } else {
        const winnerLabel = winner === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Charcoal)';
        recordGameResult(winner === 'player1', 1, 1, gameState.phase[winner] === 'flying');
        showAlert({
          title: `${winnerLabel} Wins!`,
          message: `Congratulations! ${winnerLabel} has captured the opponent herd and triumphed in Pass & Play.`,
          buttons: [{ text: 'Play Again', onPress: resetGame }],
        });
      }
    } else {
      if (offlineMode === 'ai') {
        setStatusMessage(
          shooter === 'player1'
            ? 'Opponent cow captured. CPU is thinking...'
            : 'Your cow was shot. Your turn to move.'
        );
      } else {
        const nextLabel = victim === 'player1' ? 'Player 1 (Gold)' : 'Player 2 (Charcoal)';
        setStatusMessage(`Cow captured! ${nextLabel}'s turn.`);
      }
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

  const currentTurnLabel = offlineMode === 'ai'
    ? (gameState.currentPlayer === 'player1' ? 'YOUR TURN' : 'CPU TURN')
    : (gameState.currentPlayer === 'player1' ? 'PLAYER 1 (GOLD) TURN' : 'PLAYER 2 (CHARCOAL) TURN');

  const p1Label = offlineMode === 'ai' ? 'YOU (GOLD)' : 'PLAYER 1 (GOLD)';
  const p2Label = offlineMode === 'ai' ? 'CPU (CHARCOAL)' : 'PLAYER 2 (CHARCOAL)';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="OFFLINE ARENA"
        subtitle={offlineMode === 'ai' ? '1P VS CPU ENGINE' : 'PASS & PLAY • 2-PLAYER LOCAL'}
        rightActionLabel="Coin Toss"
        onRightAction={() => setShowCoinToss(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Strategy Game Selector Tabs */}
        <View style={styles.gameTabsRow}>
          <TouchableOpacity
            style={[styles.gameTabBtn, styles.gameTabBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.gameTabText, styles.gameTabTextActive]}>
              MORABARABA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameTabBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CheckersGame')}
          >
            <Text style={styles.gameTabText}>
              CHECKERS →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameTabBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChessGame')}
          >
            <Text style={styles.gameTabText}>
              CHESS →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode Selector Row */}
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[styles.modeToggleBtn, offlineMode === 'ai' && styles.modeToggleBtnActive]}
            onPress={() => {
              setOfflineMode('ai');
              resetGame();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeToggleText, offlineMode === 'ai' && styles.modeToggleTextActive]}>
              VS CPU (AI)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeToggleBtn, offlineMode === 'pass_and_play' && styles.modeToggleBtnActive]}
            onPress={() => {
              setOfflineMode('pass_and_play');
              resetGame();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeToggleText, offlineMode === 'pass_and_play' && styles.modeToggleTextActive]}>
              PASS & PLAY (2P)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Difficulty Selector (Visible only in AI mode) */}
        {offlineMode === 'ai' && (
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
        )}

        {/* Status Bar */}
        <View style={styles.statusBox}>
          <Text style={styles.statusTurn}>{currentTurnLabel}</Text>
          <Text style={styles.statusMessage}>{statusMessage}</Text>
        </View>

        {/* Scores & Cows Info */}
        <View style={styles.scoreRow}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{p1Label}</Text>
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
            <Text style={styles.playerName}>{p2Label}</Text>
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
          disabled={(offlineMode === 'ai' && isAiThinking) || gameState.winner !== null}
        />

        <TouchableOpacity
          style={styles.reTossBtn}
          onPress={() => setShowCoinToss(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.reTossBtnText}>New Match (Coin Toss) ↺</Text>
        </TouchableOpacity>

        {/* MORE OFFLINE STRATEGY GAMES */}
        <View style={styles.offlineGamesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionKicker}>
              OFFLINE BOARD ARENAS
            </Text>
            <Text style={styles.sectionTitle}>
              MORE OFFLINE STRATEGY GAMES
            </Text>
            <Text style={styles.sectionSubtitle}>
              Compete locally on this device with zero data usage or internet requirement.
            </Text>
          </View>

          {/* CHECKERS / DRAUGHTS */}
          <TouchableOpacity
            style={styles.offlineGameRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CheckersGame')}
          >
            <View style={styles.offlineGameInfo}>
              <Text style={styles.offlineGameTitle}>
                CHECKERS & DRAUGHTS
              </Text>
              <Text style={styles.offlineGameDesc}>
                8×8 Classic Checkers and 10×10 International Draughts with smooth drag-and-drop physics, king crowning, and mandatory jumping.
              </Text>
            </View>
            <Text style={styles.offlineGameAction}>
              Play Checkers →
            </Text>
          </TouchableOpacity>

          {/* CHESS GRANDMASTER */}
          <TouchableOpacity
            style={styles.offlineGameRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChessGame')}
          >
            <View style={styles.offlineGameInfo}>
              <Text style={styles.offlineGameTitle}>
                CHESS GRANDMASTER
              </Text>
              <Text style={styles.offlineGameDesc}>
                64-square grandmaster arena with real-time legal move dots, check & checkmate detection, captured piece counts, and move history.
              </Text>
            </View>
            <Text style={styles.offlineGameAction}>
              Play Chess →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CoinTossModal
        visible={showCoinToss}
        onClose={() => setShowCoinToss(false)}
        onTossComplete={handleTossComplete}
        player1Name={offlineMode === 'ai' ? 'You' : 'Player 1 (Gold)'}
        player2Name={offlineMode === 'ai' ? 'CPU' : 'Player 2 (Charcoal)'}
      />

      {/* Strict Tactical Rule Tip Modal */}
      <RuleTipModal
        visible={showRuleTip}
        tip={ruleTip}
        onClose={() => setShowRuleTip(false)}
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
    padding: SPACING.sm,
    paddingBottom: 90, // Room for floating bottom tab bar
  },
  modeToggleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.xs,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeToggleBtnActive: {
    borderBottomColor: COLORS.accent,
  },
  modeToggleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeToggleTextActive: {
    color: COLORS.accentHover,
    fontWeight: '800',
  },
  difficultyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.xs,
    paddingBottom: 4,
  },
  difficultyBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  difficultyBtnActive: {
    borderBottomColor: COLORS.accent,
  },
  difficultyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyTextActive: {
    color: COLORS.accentHover,
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
    letterSpacing: 0.5,
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
  gameTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 3,
  },
  gameTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  gameTabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  gameTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  gameTabTextActive: {
    color: COLORS.accentHover,
    fontWeight: '900',
  },
  offlineGamesSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
  },
  sectionHeaderRow: {
    marginBottom: SPACING.sm,
  },
  sectionKicker: {
    fontSize: 10.5,
    fontWeight: '900',
    color: COLORS.accentHover,
    letterSpacing: 1,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  offlineGameRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  offlineGameInfo: {
    marginBottom: 6,
  },
  offlineGameTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  offlineGameDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  offlineGameAction: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentHover,
  },
});
