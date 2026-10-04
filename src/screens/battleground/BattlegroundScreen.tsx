import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Share,
  ActivityIndicator,
  BackHandler,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { MorabarabaBoard } from '../../components/game/MorabarabaBoard';
import { CoinTossModal } from '../../components/game/CoinTossModal';
import { CompetitorProfileCard } from '../../components/game/CompetitorProfileCard';
import { Text } from '../../components/Typography';
import { colors } from '../../theme/colors';
import {
  GamePhase,
  GameState,
  Player,
  CompetitorProfile,
  UserCareerStats,
} from '../../types/game';
import { UserProfile } from '../../types/auth';
import {
  createInitialGameState,
  formsNewMill,
  hasLegalMoves,
} from '../../engine/morabaraba';
import { getUserProfile, getCareerStats, recordGameResult } from '../../store/gameStore';
import { battlegroundService } from '../../services/battlegroundService';
import { gameSyncService, MoveBroadcastPayload } from '../../services/gameSyncService';
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

type DuelMode =
  | 'menu'
  | 'host_type_select'
  | 'host_private_share'
  | 'host_waiting_room_private'
  | 'host_waiting_room_public'
  | 'join_type_select'
  | 'join_private_enter_code'
  | 'join_public_lobby'
  | 'join_waiting_approval'
  | 'match_in_progress';

export const BattlegroundScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showAlert } = useThemedAlert();

  const [mode, setMode] = useState<DuelMode>('menu');

  // Room PIN & Lobby State
  const [roomPin, setRoomPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [hasCopiedPin, setHasCopiedPin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [, setUserStats] = useState<UserCareerStats | null>(null);
  const [publicHosts, setPublicHosts] = useState<CompetitorProfile[]>([]);
  const [isLoadingLobby, setIsLoadingLobby] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Match & Room Profiles
  const [selectedHostProfile, setSelectedHostProfile] = useState<CompetitorProfile | null>(null);
  const [incomingChallenger, setIncomingChallenger] = useState<CompetitorProfile | null>(null);
  const [opponentName, setOpponentName] = useState('Player 2');

  // Core Game State
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [statusMessage, setStatusMessage] = useState('Place your cow on any empty intersection.');
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [isHostRole, setIsHostRole] = useState(false);
  const [calledCoinSide, setCalledCoinSide] = useState<'heads' | 'tails' | null>(null);

  // Timers & Realtime Sync
  const activeRoomId = useRef<string | null>(null);
  const syncSubscription = useRef<(() => void) | null>(null);
  const lobbySubscription = useRef<(() => void) | null>(null);
  const roomSubscription = useRef<(() => void) | null>(null);

  // Strict Gameplay Validation & Anti-Cheat
  const [ruleTip, setRuleTip] = useState<RuleTip | null>(null);
  const [showRuleTip, setShowRuleTip] = useState(false);
  const lastActionTimestamp = useRef<number | null>(null);
  const recentMoves = useRef<MoveRecord[]>([]);
  const deliberationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getUserProfile().then((profile) => setCurrentUser(profile));
    getCareerStats().then((stats) => setUserStats(stats));
    return () => {
      clearAllTimers();
      if (syncSubscription.current) syncSubscription.current();
      if (lobbySubscription.current) lobbySubscription.current();
      if (roomSubscription.current) roomSubscription.current();
    };
  }, []);

  const clearAllTimers = () => {
    if (deliberationTimer.current) clearTimeout(deliberationTimer.current);
  };

  const localPlayer: Player = isHostRole ? 'player1' : 'player2';
  const peerPlayer: Player = isHostRole ? 'player2' : 'player1';

  // Anti-AI Deliberation Stalling Clock
  useEffect(() => {
    if (deliberationTimer.current) clearTimeout(deliberationTimer.current);
    if (mode === 'match_in_progress' && !gameState.winner) {
      deliberationTimer.current = setTimeout(() => {
        if (gameState.currentPlayer === localPlayer) {
          setRuleTip({
            code: 'DELIBERATION_TIMEOUT',
            title: 'FAIR PLAY: DELIBERATION CLOCK',
            message:
              'To preserve competitive integrity and prevent stalling or external solver assistance, please execute your tactical move promptly.',
          });
          setShowRuleTip(true);
        }
      }, 60000);
    }
    return () => {
      if (deliberationTimer.current) clearTimeout(deliberationTimer.current);
    };
  }, [gameState.currentPlayer, mode, gameState.winner, isHostRole]);

  // --- HOST PUBLIC ROOM ---
  const handleHostPublicRoom = async () => {
    if (!currentUser) return;
    try {
      clearAllTimers();
      setIsHostRole(true);
      setCalledCoinSide(null);
      setIncomingChallenger(null);
      setIsCreatingRoom(true);

      const { room } = await battlegroundService.createRoom(currentUser, 'public');
      if (room) {
        activeRoomId.current = room.id;
        if (roomSubscription.current) roomSubscription.current();
        roomSubscription.current = battlegroundService.subscribeToRoom(room.id, {
          onChallengerJoined: (challenger) => {
            clearAllTimers();
            setIncomingChallenger(challenger);
          },
          onChallengerLeft: () => {
            setIncomingChallenger(null);
          },
        });
      }
      setMode('host_waiting_room_public');
    } catch {
      showAlert({ title: 'Error', message: 'Unable to initialize public room.' });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // --- HOST PRIVATE ROOM ---
  const handleHostPrivateRoom = async () => {
    if (!currentUser) return;
    try {
      clearAllTimers();
      setIsHostRole(true);
      setCalledCoinSide(null);
      setIncomingChallenger(null);
      setHasCopiedPin(false);
      setIsCreatingRoom(true);

      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      setRoomPin(pin);

      const { room } = await battlegroundService.createRoom(currentUser, 'private');
      if (room) {
        activeRoomId.current = room.id;
        if (room.roomCode) setRoomPin(room.roomCode);
      }
      setMode('host_private_share');
    } catch {
      showAlert({ title: 'Error', message: 'Unable to initialize private room.' });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleEnterPrivateWaitingRoom = () => {
    clearAllTimers();
    setIncomingChallenger(null);
    setMode('host_waiting_room_private');

    if (activeRoomId.current) {
      if (roomSubscription.current) roomSubscription.current();
      roomSubscription.current = battlegroundService.subscribeToRoom(activeRoomId.current, {
        onChallengerJoined: (challenger) => {
          clearAllTimers();
          setIncomingChallenger(challenger);
        },
        onChallengerLeft: () => {
          setIncomingChallenger(null);
        },
      });
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my Morabaraba Online Battle on Competitor App with Code: ${roomPin}`,
      });
    } catch {
      // Ignore share dismissal
    }
  };

  const handleCopyCode = () => {
    setHasCopiedPin(true);
    showAlert({
      title: 'Code Copied',
      message: `Battle code ${roomPin} is ready to share with your opponent.`,
    });
  };

  const handleAcceptChallenger = (challenger: CompetitorProfile) => {
    clearAllTimers();
    setOpponentName(challenger.gamerTag);
    if (activeRoomId.current) {
      battlegroundService.acceptChallenger(activeRoomId.current);
      startOnlineMatchSync();
    }
    setShowCoinToss(true);
  };

  const handleDeclineChallenger = () => {
    if (activeRoomId.current) {
      battlegroundService.declineChallenger(activeRoomId.current);
    }
    setIncomingChallenger(null);
  };

  // --- JOIN FLOWS ---
  const handleOpenPublicLobby = async () => {
    clearAllTimers();
    setIsHostRole(false);
    setCalledCoinSide(null);
    setMode('join_public_lobby');
    setIsLoadingLobby(true);
    try {
      const liveHosts = await battlegroundService.fetchPublicLobby();
      setPublicHosts(liveHosts || []);
    } catch {
      setPublicHosts([]);
    } finally {
      setIsLoadingLobby(false);
    }

    if (lobbySubscription.current) lobbySubscription.current();
    lobbySubscription.current = battlegroundService.subscribeToPublicLobby((freshHosts) => {
      setPublicHosts(freshHosts || []);
    });
  };

  const handleOpenPrivatePinEntry = () => {
    clearAllTimers();
    setIsHostRole(false);
    setCalledCoinSide(null);
    setEnteredPin('');
    setMode('join_private_enter_code');
  };

  const handleSubmitPrivatePin = async () => {
    const pin = enteredPin.trim();
    if (pin.length < 4) {
      showAlert({ title: 'Invalid PIN', message: 'Please enter the 4-digit code provided by the host.' });
      return;
    }
    clearAllTimers();

    if (currentUser) {
      try {
        const { room, hostProfile, error } = await battlegroundService.joinByCode(pin, currentUser);
        if (error || !room) {
          showAlert({ title: 'Room Not Found', message: error || 'No active room found with this 4-digit PIN.' });
          return;
        }

        activeRoomId.current = room.id;
        const host: CompetitorProfile = hostProfile || {
          id: room.hostUserId,
          gamerTag: `Host_${pin}`,
          country: 'South Africa',
          countryCode: 'ZA',
          province: 'Southern Africa',
          town: '',
          title: 'Competitor',
          winRate: 50,
          matchesPlayed: 1,
          wins: 1,
        };
        setSelectedHostProfile(host);
        setOpponentName(host.gamerTag);
        setMode('join_waiting_approval');

        if (roomSubscription.current) roomSubscription.current();
        roomSubscription.current = battlegroundService.subscribeToRoom(room.id, {
          onMatchAccepted: () => {
            handleHostApproved();
          },
        });
      } catch {
        showAlert({ title: 'Connection Error', message: 'Unable to connect to room. Please check your connection and retry.' });
      }
    }
  };

  const handleSelectPublicHost = async (host: CompetitorProfile) => {
    clearAllTimers();
    setSelectedHostProfile(host);
    setOpponentName(host.gamerTag);
    setMode('join_waiting_approval');

    if (currentUser) {
      activeRoomId.current = host.id;
      await battlegroundService.challengePublicHost(host.id, currentUser.id);

      if (roomSubscription.current) roomSubscription.current();
      roomSubscription.current = battlegroundService.subscribeToRoom(host.id, {
        onMatchAccepted: () => {
          handleHostApproved();
        },
      });
    }
  };

  const startOnlineMatchSync = () => {
    if (activeRoomId.current) {
      if (syncSubscription.current) syncSubscription.current();
      syncSubscription.current = gameSyncService.subscribeToMatch(activeRoomId.current, {
        onCoinCall: (side) => {
          setCalledCoinSide(side);
        },
        onCoinToss: (firstPlayer) => {
          handleTossComplete(firstPlayer);
        },
        onMove: (payload) => {
          handlePeerMove(payload);
        },
      });
    }
  };

  const handleMatchVictory = () => {
    showAlert({
      title: 'Victory!',
      message:
        'Congratulations! Undisputed triumph on the battleground.\n\nYour match win and win rate have been officially recorded on the Southern African Leaderboard standings!',
      buttons: [{ text: 'Return to Menu', onPress: () => setMode('menu') }],
    });
  };

  const handleMatchDefeat = (reason: string) => {
    recordGameResult(false, 0, 1, gameState.phase.player1 === 'flying');
    showAlert({
      title: 'Defeated',
      message: `${opponentName} ${reason}.\n\nPractice in Pass & Play or challenge another competitor to climb the Southern African Leaderboard!`,
      buttons: [{ text: 'Return to Menu', onPress: () => setMode('menu') }],
    });
  };

  const handlePeerMove = (payload: MoveBroadcastPayload) => {
    const peer: Player = payload.player;
    if (peer === localPlayer) return;

    if (payload.type === 'place' && payload.to !== undefined) {
      const check = validatePlacement(gameState, peer, payload.to);
      if (!check.isValid) {
        setRuleTip({
          code: 'PEER_PACKET_DESYNC',
          title: 'INTEGRITY CHECK: ILLEGAL MOVE REJECTED',
          message: 'The opponent sent an invalid placement that violates Morabaraba rules.',
        });
        setShowRuleTip(true);
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[payload.to] = peer;
      const mill = formsNewMill(nextBoard, payload.to, peer);
      const remainingUnplaced = gameState.unplacedCows[peer] - 1;
      const nextPhase = remainingUnplaced === 0 ? 'moving' : 'placing';

      recentMoves.current.push({
        player: peer,
        to: payload.to,
        timestamp: Date.now(),
      });

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [peer]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [peer]: prev.activeCows[peer] + 1 },
          phase: { ...prev.phase, [peer]: nextPhase },
          mustShoot: true,
          lastMove: { to: payload.to!, player: peer, formedMill: true },
        }));
        setStatusMessage(`${opponentName} formed a mill and is shooting your cow!`);
      } else {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          unplacedCows: { ...prev.unplacedCows, [peer]: remainingUnplaced },
          activeCows: { ...prev.activeCows, [peer]: prev.activeCows[peer] + 1 },
          phase: { ...prev.phase, [peer]: nextPhase },
          currentPlayer: localPlayer,
          turnCount: prev.turnCount + 1,
          lastMove: { to: payload.to!, player: peer },
        }));
        setStatusMessage('Your turn: Place a cow.');
      }
    } else if (
      (payload.type === 'move' || payload.type === 'fly') &&
      payload.from !== undefined &&
      payload.to !== undefined
    ) {
      const check = validateCowMove(gameState, peer, payload.from, payload.to, recentMoves.current);
      if (!check.isValid) {
        setRuleTip({
          code: 'PEER_PACKET_DESYNC',
          title: 'INTEGRITY CHECK: ILLEGAL MOVE REJECTED',
          message: 'The opponent sent an invalid move that violates connected line adjacency.',
        });
        setShowRuleTip(true);
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[payload.from] = null;
      nextBoard[payload.to] = peer;
      const mill = formsNewMill(nextBoard, payload.to, peer);

      recentMoves.current.push({
        player: peer,
        from: payload.from,
        to: payload.to,
        timestamp: Date.now(),
      });

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          mustShoot: true,
          lastMove: { from: payload.from, to: payload.to!, player: peer, formedMill: true },
        }));
        setStatusMessage(`${opponentName} formed a mill and is shooting your cow!`);
      } else {
        let winner: Player | null = null;
        if (
          gameState.unplacedCows[localPlayer] === 0 &&
          !hasLegalMoves(nextBoard, localPlayer, gameState.phase[localPlayer])
        ) {
          winner = peer;
        }

        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          currentPlayer: localPlayer,
          turnCount: prev.turnCount + 1,
          lastMove: { from: payload.from, to: payload.to!, player: peer },
          winner,
        }));

        if (winner) {
          handleMatchDefeat('has blocked all your legal moves');
        } else {
          setStatusMessage('Your turn to move.');
        }
      }
    } else if (payload.type === 'shoot' && payload.shotVertex !== undefined) {
      const check = validateCowShot(gameState, peer, payload.shotVertex);
      if (!check.isValid) {
        setRuleTip({
          code: 'PEER_PACKET_DESYNC',
          title: 'INTEGRITY CHECK: ILLEGAL SHOT REJECTED',
          message: 'The opponent attempted to shoot a protected cow in an active mill.',
        });
        setShowRuleTip(true);
        return;
      }

      const nextBoard = [...gameState.board];
      nextBoard[payload.shotVertex] = null;

      const remainingVictimActive = gameState.activeCows[localPlayer] - 1;
      const victimUnplaced = gameState.unplacedCows[localPlayer];

      let nextVictimPhase = gameState.phase[localPlayer];
      if (victimUnplaced === 0 && remainingVictimActive === 3) {
        nextVictimPhase = 'flying';
      }

      let winner: Player | null = null;
      if (victimUnplaced === 0 && remainingVictimActive < 3) {
        winner = peer;
      } else if (victimUnplaced === 0 && !hasLegalMoves(nextBoard, localPlayer, nextVictimPhase)) {
        winner = peer;
      }

      const nextTurnCount = gameState.turnCount + 1;
      setGameState((prev) => ({
        ...prev,
        board: nextBoard,
        activeCows: { ...prev.activeCows, [localPlayer]: remainingVictimActive },
        capturedCows: { ...prev.capturedCows, [peer]: prev.capturedCows[peer] + 1 },
        phase: { ...prev.phase, [localPlayer]: nextVictimPhase },
        mustShoot: false,
        currentPlayer: localPlayer,
        turnCount: nextTurnCount,
        winner,
      }));

      if (winner) {
        handleMatchDefeat('has captured your herd');
      } else {
        setStatusMessage('Your turn.');
      }
    }
  };

  const handleHostApproved = () => {
    clearAllTimers();
    if (activeRoomId.current) {
      startOnlineMatchSync();
    }
    setShowCoinToss(true);
  };

  const handleSideCalled = (side: 'heads' | 'tails') => {
    setCalledCoinSide(side);
    if (activeRoomId.current) {
      gameSyncService.broadcastCoinCall(activeRoomId.current, side);
    }
  };

  // --- PASS & PLAY FLOW ---
  const handleStartPassAndPlay = () => {
    clearAllTimers();
    navigation.navigate('Offline', { mode: 'pass_and_play', timestamp: Date.now() });
  };

  // --- COIN TOSS & MATCH COMPLETION ---
  const handleTossComplete = (firstPlayer: Player) => {
    setShowCoinToss(false);
    setGameState(createInitialGameState(firstPlayer));
    lastActionTimestamp.current = Date.now();
    recentMoves.current = [];
    const firstPlayerLabel = firstPlayer === 'player1' ? 'You (Gold)' : `${opponentName} (Charcoal)`;
    setStatusMessage(`${firstPlayerLabel} won the coin toss! Place your cow.`);
    setMode('match_in_progress');

    if (activeRoomId.current) {
      gameSyncService.broadcastCoinToss(activeRoomId.current, firstPlayer);
    }
  };

  // --- GAME BOARD INTERACTIONS ---
  const handleVertexPress = (vertexId: number) => {
    if (gameState.winner) return;

    if (gameState.currentPlayer !== localPlayer) {
      setRuleTip({
        code: 'NOT_PLAYER_TURN',
        title: 'TACTICAL TIP: OPPONENT’S TURN',
        message: `It is currently ${opponentName}’s turn. Please wait for your opponent to complete their action.`,
      });
      setShowRuleTip(true);
      return;
    }

    const rateCheck = validateHumanReactionRate(lastActionTimestamp.current);
    if (!rateCheck.isValid) {
      setRuleTip(rateCheck.tip);
      setShowRuleTip(true);
      return;
    }

    const current: Player = localPlayer;
    const opponent: Player = peerPlayer;
    const currentPhase: GamePhase = gameState.phase[current];

    // Case 1: Shoot opponent cow
    if (gameState.mustShoot) {
      const shotCheck = validateCowShot(gameState, current, vertexId);
      if (!shotCheck.isValid) {
        setRuleTip(shotCheck.tip);
        setShowRuleTip(true);
        return;
      }

      lastActionTimestamp.current = Date.now();
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

      if (activeRoomId.current) {
        gameSyncService.broadcastMove(activeRoomId.current, {
          type: 'shoot',
          player: current,
          shotVertex: vertexId,
        });
      }

      const nextTurnCount = gameState.turnCount + 1;
      setGameState((prev) => ({
        ...prev,
        board: nextBoard,
        activeCows: { ...prev.activeCows, [opponent]: remainingVictimActive },
        capturedCows: { ...prev.capturedCows, [current]: prev.capturedCows[current] + 1 },
        phase: { ...prev.phase, [opponent]: nextVictimPhase },
        mustShoot: false,
        currentPlayer: opponent,
        turnCount: nextTurnCount,
        winner,
      }));

      if (winner) {
        const isP1 = winner === 'player1';
        recordGameResult(isP1, 1, 1, gameState.phase.player1 === 'flying');
        if (activeRoomId.current && currentUser) {
          gameSyncService.finalizeMatch(activeRoomId.current, currentUser.id);
        }
        handleMatchVictory();
      } else {
        setStatusMessage(`${opponentName}'s turn.`);
      }
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

      if (activeRoomId.current) {
        gameSyncService.broadcastMove(activeRoomId.current, {
          type: 'place',
          player: current,
          to: vertexId,
          formedMill: mill,
        });
      }

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
        setStatusMessage('You formed a mill! Shoot an opponent cow.');
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
        setStatusMessage(`${opponentName}'s turn: Place a cow.`);
      }
      return;
    }

    // Case 3: Moving / Flying Phase
    if (gameState.selectedVertex === null || gameState.board[vertexId] === current) {
      const selectCheck = validateCowSelection(gameState, current, vertexId);
      if (!selectCheck.isValid) {
        setRuleTip(selectCheck.tip);
        setShowRuleTip(true);
        return;
      }
      lastActionTimestamp.current = Date.now();
      setGameState((prev) => ({ ...prev, selectedVertex: vertexId }));
      setStatusMessage('Cow selected. Tap a connected empty intersection.');
      return;
    }

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

      if (activeRoomId.current) {
        gameSyncService.broadcastMove(activeRoomId.current, {
          type: currentPhase === 'flying' ? 'fly' : 'move',
          player: current,
          from: gameState.selectedVertex,
          to: vertexId,
          formedMill: mill,
        });
      }

      if (mill) {
        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          mustShoot: true,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: current, formedMill: true },
        }));
        setStatusMessage('You formed a mill! Shoot an opponent cow.');
      } else {
        let winner: Player | null = null;
        if (
          gameState.unplacedCows[opponent] === 0 &&
          !hasLegalMoves(nextBoard, opponent, gameState.phase[opponent])
        ) {
          winner = current;
        }

        setGameState((prev) => ({
          ...prev,
          board: nextBoard,
          selectedVertex: null,
          currentPlayer: opponent,
          turnCount: prev.turnCount + 1,
          lastMove: { from: prev.selectedVertex!, to: vertexId, player: current },
          winner,
        }));

        if (winner) {
          const isP1 = winner === 'player1';
          recordGameResult(isP1, 1, 1, gameState.phase.player1 === 'flying');
          if (activeRoomId.current && currentUser) {
            gameSyncService.finalizeMatch(activeRoomId.current, currentUser.id);
          }
          handleMatchVictory();
        } else {
          setStatusMessage(`${opponentName}'s turn to move.`);
        }
      }
    }
  };

  const handleHeaderBack = () => {
    clearAllTimers();

    if (
      activeRoomId.current &&
      (mode === 'host_waiting_room_private' ||
        mode === 'host_waiting_room_public' ||
        mode === 'host_private_share')
    ) {
      battlegroundService.cancelRoom(activeRoomId.current);
      activeRoomId.current = null;
    }

    if (mode === 'host_type_select' || mode === 'join_type_select') {
      setMode('menu');
    } else if (mode === 'host_private_share') {
      setMode('host_type_select');
    } else if (
      mode === 'host_waiting_room_private' ||
      mode === 'host_waiting_room_public'
    ) {
      setMode('menu');
    } else if (
      mode === 'join_private_enter_code' ||
      mode === 'join_public_lobby'
    ) {
      setMode('join_type_select');
    } else if (mode === 'join_waiting_approval') {
      setMode('join_public_lobby');
    } else if (mode === 'match_in_progress') {
      showAlert({
        title: 'Leave Match',
        message: 'Are you sure you want to forfeit this online battle and return to the menu?',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave Battle',
            style: 'destructive',
            onPress: () => {
              recordGameResult(false, 0, 1, gameState.phase.player1 === 'flying');
              setMode('menu');
            },
          },
        ],
      });
    }
  };

  // Hardware Back Handler
  useEffect(() => {
    const handleBackPress = () => {
      if (mode !== 'menu') {
        handleHeaderBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [mode]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          mode !== 'menu' &&
          mode !== 'match_in_progress' &&
          gestureState.dx > 30 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 60 && Math.abs(gestureState.dy) < 60) {
          handleHeaderBack();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.safeArea} {...panResponder.panHandlers}>
      <Header
        title="BATTLEGROUND"
        subtitle={
          mode === 'menu'
            ? 'ONLINE BATTLE'
            : mode === 'match_in_progress'
            ? 'LIVE MATCH'
            : 'ROOM LOBBY'
        }
        showBack={mode !== 'menu'}
        onBack={handleHeaderBack}
        rightActionLabel={mode === 'match_in_progress' ? 'Coin Toss' : undefined}
        onRightAction={mode === 'match_in_progress' ? () => setShowCoinToss(true) : undefined}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. MAIN BATTLEGROUND MENU (PURE BODY TYPOGRAPHY, ZERO CARD DIVS) */}
        {mode === 'menu' && (
          <View style={styles.menuContainer}>
            <View style={styles.introSection}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                ONLINE BATTLEGROUND
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.sectionDesc}>
                Compete across Southern Africa. Host or join public battleground rooms, challenge opponents via private codes, or play tabletop Pass & Play.
              </Text>
            </View>

            {/* HOST ONLINE BATTLE */}
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => setMode('host_type_select')}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                HOST ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Create a public room visible to regional challengers or a private locked battle room with a shareable code.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Host Battle →
              </Text>
            </TouchableOpacity>

            {/* JOIN ONLINE BATTLE */}
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => setMode('join_type_select')}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                JOIN ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Browse active public hosters and inspect their profiles, or enter a private 4-digit PIN code to connect.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Find Battle →
              </Text>
            </TouchableOpacity>

            {/* PASS & PLAY */}
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={handleStartPassAndPlay}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                PASS & PLAY
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Take turns making moves with fair coin toss turn selection on one screen. Perfect for face-to-face tactical duels anywhere.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Instant Start →
              </Text>
            </TouchableOpacity>

            {/* STRATEGY BATTLEGROUND ARENAS (CHECKERS & CHESS) */}
            <View style={styles.sectionDivider} />

            <View style={styles.arenaHeaderSection}>
              <Text variant="label" weight="900" color={colors.accentHover} style={styles.arenaKicker}>
                STRATEGY ARENAS
              </Text>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                CHECKERS & CHESS ARENAS
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.sectionDesc}>
                Jump directly into dedicated board arenas with real-time turn tracking, official rules, and responsive piece mechanics.
              </Text>
            </View>

            {/* CHECKERS / DRAUGHTS ARENA */}
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CheckersGame')}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                CHECKERS & DRAUGHTS ARENA
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Play 8×8 Classic Checkers and 10×10 International Draughts with smooth drag-and-drop physics, king crowning, and mandatory jumping.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Enter Checkers Arena →
              </Text>
            </TouchableOpacity>

            {/* CHESS GRANDMASTER ARENA */}
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ChessGame')}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                CHESS GRANDMASTER ARENA
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Classic 64-square grandmaster battlefield with legal move indicators, check and checkmate detection, move history, and captured piece tallies.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Enter Chess Arena →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. HOST: CHOOSE PUBLIC OR PRIVATE (PURE BODY TYPOGRAPHY) */}
        {mode === 'host_type_select' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                HOST A BATTLE ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Choose whether you want your battle room to be public or private.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              disabled={isCreatingRoom}
              onPress={handleHostPublicRoom}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                PUBLIC ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Open to all Southern African competitors. Your room is listed on the public lobby. You review the challenger's profile before accepting the match.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                {isCreatingRoom ? 'Creating Room...' : 'Launch Public Room →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              disabled={isCreatingRoom}
              onPress={handleHostPrivateRoom}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                PRIVATE ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Protected by a 4-digit code. Share the PIN directly with your opponent. Only competitors who enter your code can request to join.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                {isCreatingRoom ? 'Creating Room...' : 'Generate Private PIN →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. JOIN: CHOOSE PUBLIC OR PRIVATE (PURE BODY TYPOGRAPHY) */}
        {mode === 'join_type_select' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                JOIN AN ONLINE BATTLE
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Choose whether you want to browse public hosters or enter a private code.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={handleOpenPublicLobby}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                JOIN PUBLIC ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Browse all competitors who are currently hosting public rooms, inspect their profiles and win rates, and request to challenge them.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Browse Public Hosts →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={handleOpenPrivatePinEntry}
            >
              <Text variant="h3" weight="800" color={colors.textPrimary}>
                JOIN PRIVATE ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.actionDescText}>
                Enter the 4-digit battle code given to you by a competitor hosting privately.
              </Text>
              <Text variant="label" weight="800" color={colors.accentHover} style={styles.actionTag}>
                Enter PIN Code →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. HOST PRIVATE: SHARE CODE */}
        {mode === 'host_private_share' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                PRIVATE BATTLE CODE
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Share this 4-digit PIN with your competitor. Once they submit it, you will see their profile to launch the match.
              </Text>
            </View>

            <View style={styles.pinCodeBox}>
              <Text style={styles.pinCodeText}>{roomPin}</Text>
            </View>

            <View style={styles.pinActionsRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={handleCopyCode}
              >
                <Text variant="body" weight="800" color={colors.textPrimary}>
                  {hasCopiedPin ? 'Copied ✓' : 'Copy Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={handleShareCode}
              >
                <Text variant="body" weight="800" color={colors.textPrimary}>
                  Share Code ⧉
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryFullBtn}
              activeOpacity={0.8}
              onPress={handleEnterPrivateWaitingRoom}
            >
              <Text variant="body" weight="800" color="#FFFFFF">
                DONE • ENTER WAITING ROOM →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. HOST WAITING ROOM (PRIVATE) */}
        {mode === 'host_waiting_room_private' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                PRIVATE WAITING ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Room PIN: <Text variant="caption" weight="800" color={colors.accentHover}>{roomPin}</Text> • Waiting for competitor to submit your code.
              </Text>
            </View>

            {!incomingChallenger ? (
              <View style={styles.waitingStatusBlock}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text variant="body" weight="700" color={colors.textPrimary} style={styles.waitingLabel}>
                  Waiting for Opponent to Join...
                </Text>
                <Text variant="caption" color={colors.textSecondary} align="center">
                  Share code {roomPin} with your opponent. As soon as they enter it, their profile will appear here for your approval.
                </Text>
              </View>
            ) : (
              <View style={styles.challengerSection}>
                <Text variant="label" weight="900" color={colors.textPrimary} style={styles.subHeading}>
                  INCOMING JOIN REQUEST:
                </Text>
                <CompetitorProfileCard
                  profile={incomingChallenger}
                  subtitle="Competitor has entered your code and requested to join."
                  actionLabel="ACCEPT REQUEST ✓"
                  onAction={() => handleAcceptChallenger(incomingChallenger)}
                  secondaryActionLabel="DECLINE ✕"
                  onSecondaryAction={handleDeclineChallenger}
                />
              </View>
            )}
          </View>
        )}

        {/* 6. HOST WAITING ROOM (PUBLIC) */}
        {mode === 'host_waiting_room_public' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                PUBLIC WAITING ROOM
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Your battle room is live on the public Southern African lobby.
              </Text>
            </View>

            {!incomingChallenger ? (
              <View style={styles.waitingStatusBlock}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text variant="body" weight="700" color={colors.textPrimary} style={styles.waitingLabel}>
                  Broadcasting on Battleground...
                </Text>
                <Text variant="caption" color={colors.textSecondary} align="center">
                  Regional competitors are browsing active rooms. When someone requests to battle you, you will see their profile to accept or decline.
                </Text>
              </View>
            ) : (
              <View style={styles.challengerSection}>
                <Text variant="label" weight="900" color={colors.textPrimary} style={styles.subHeading}>
                  CHALLENGER REQUESTED TO JOIN:
                </Text>
                <CompetitorProfileCard
                  profile={incomingChallenger}
                  subtitle="Review competitor stats and decide whether to accept the challenge."
                  actionLabel="ACCEPT CHALLENGE ✓"
                  onAction={() => handleAcceptChallenger(incomingChallenger)}
                  secondaryActionLabel="DECLINE ✕"
                  onSecondaryAction={handleDeclineChallenger}
                />
              </View>
            )}
          </View>
        )}

        {/* 7. JOIN PRIVATE: ENTER CODE */}
        {mode === 'join_private_enter_code' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                ENTER PRIVATE CODE
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Type the 4-digit code provided by the host competitor:
              </Text>
            </View>

            <TextInput
              style={styles.pinInput}
              placeholder="e.g. 7421"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              value={enteredPin}
              onChangeText={setEnteredPin}
              returnKeyType="done"
              onSubmitEditing={handleSubmitPrivatePin}
            />

            <TouchableOpacity
              style={[styles.primaryFullBtn, enteredPin.length < 4 && styles.primaryBtnDisabled]}
              activeOpacity={0.8}
              disabled={enteredPin.length < 4}
              onPress={handleSubmitPrivatePin}
            >
              <Text variant="body" weight="800" color="#FFFFFF">
                CONNECT TO HOST →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 8. JOIN PUBLIC: LOBBY OF ACTIVE HOSTS */}
        {mode === 'join_public_lobby' && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                PUBLIC BATTLEGROUND LOBBY
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Active public hosters across Southern Africa. Select a competitor to challenge:
              </Text>
            </View>

            {isLoadingLobby ? (
              <View style={styles.waitingStatusBlock}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text variant="body" weight="700" color={colors.textPrimary} style={{ marginTop: 8 }}>
                  Scanning Southern African Lobby...
                </Text>
              </View>
            ) : publicHosts.length > 0 ? (
              publicHosts.map((host) => (
                <CompetitorProfileCard
                  key={host.id}
                  profile={host}
                  actionLabel="CHALLENGE HOST →"
                  onAction={() => handleSelectPublicHost(host)}
                />
              ))
            ) : (
              <View style={styles.waitingStatusBlock}>
                <Text variant="h3" weight="900" color={colors.textPrimary}>
                  NO ACTIVE PUBLIC HOSTS
                </Text>
                <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginVertical: 8, lineHeight: 18 }}>
                  There are currently no active public rooms waiting for challengers. Host your own battle room to challenge players across Southern Africa!
                </Text>
                <TouchableOpacity
                  style={[styles.primaryFullBtn, { marginTop: 8 }]}
                  activeOpacity={0.8}
                  onPress={() => setMode('host_type_select')}
                >
                  <Text variant="body" weight="800" color="#FFFFFF">
                    HOST A ROOM NOW →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 9. JOIN WAITING FOR HOST APPROVAL */}
        {mode === 'join_waiting_approval' && selectedHostProfile && (
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <Text variant="h2" weight="900" color={colors.textPrimary}>
                WAITING FOR HOST APPROVAL
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Your challenge request was sent. Waiting for host to accept...
              </Text>
            </View>

            <View style={styles.waitingHostBlock}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text variant="body" weight="700" color={colors.accentHover} style={styles.waitingHostText}>
                Host is reviewing your profile...
              </Text>
            </View>

            <Text variant="label" weight="900" color={colors.textPrimary} style={styles.subHeading}>
              HOST PROFILE:
            </Text>
            <CompetitorProfileCard
              profile={selectedHostProfile}
              subtitle="The host has received your request and will launch the match upon acceptance."
            />

            <TouchableOpacity
              style={styles.cancelRequestBtn}
              activeOpacity={0.8}
              onPress={() => setMode('join_public_lobby')}
            >
              <Text variant="body" weight="700" color={colors.textSecondary}>
                Cancel Request
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 10. LIVE MORABARABA MATCH IN PROGRESS */}
        {mode === 'match_in_progress' && (
          <View style={styles.matchContainer}>
            {/* Status Bar */}
            <View style={styles.statusBox}>
              <Text variant="label" weight="900" color={colors.accentHover}>
                {gameState.currentPlayer === 'player1'
                  ? 'YOUR TURN (GOLD)'
                  : `${opponentName.toUpperCase()}'S TURN (CHARCOAL)`}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.statusMessageText}>
                {statusMessage}
              </Text>
            </View>

            {/* Scoreboard Info */}
            <View style={styles.scoreRow}>
              <View style={styles.playerInfo}>
                <Text variant="body" weight="800" color={colors.textPrimary}>
                  YOU (GOLD)
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Hand: {gameState.unplacedCows.player1} • Board: {gameState.activeCows.player1}
                </Text>
                <Text variant="caption" weight="700" color={colors.accentHover}>
                  {gameState.phase.player1.toUpperCase()}
                </Text>
              </View>

              <View style={styles.vsBox}>
                <Text variant="label" weight="900" color={colors.accentHover}>
                  VS
                </Text>
              </View>

              <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
                <Text variant="body" weight="800" color={colors.textPrimary}>
                  {opponentName.toUpperCase()}
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Hand: {gameState.unplacedCows.player2} • Board: {gameState.activeCows.player2}
                </Text>
                <Text variant="caption" weight="700" color={colors.textSecondary}>
                  {gameState.phase.player2.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Tactical Morabaraba Board */}
            <MorabarabaBoard
              gameState={gameState}
              onVertexPress={handleVertexPress}
            />

            <TouchableOpacity
              style={styles.reTossBtn}
              activeOpacity={0.8}
              onPress={() => setShowCoinToss(true)}
            >
              <Text variant="body" weight="700" color={colors.textSecondary}>
                View Coin Toss Status
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Realtime Coin Toss Modal */}
      <CoinTossModal
        visible={showCoinToss}
        onClose={() => setShowCoinToss(false)}
        onTossComplete={handleTossComplete}
        isHost={isHostRole}
        externalCalledSide={calledCoinSide}
        onSideCalled={handleSideCalled}
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
  sectionDesc: {
    marginTop: 4,
    lineHeight: 20,
  },
  actionRow: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  actionDescText: {
    marginTop: 4,
    lineHeight: 19,
  },
  actionTag: {
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  flowContainer: {
    paddingVertical: SPACING.sm,
  },
  flowHeader: {
    marginBottom: SPACING.lg,
  },
  pinCodeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    paddingVertical: 24,
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  pinCodeText: {
    fontSize: 42,
    lineHeight: 56,
    includeFontPadding: false,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  pinActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryFullBtn: {
    width: '100%',
    height: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  waitingStatusBlock: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    paddingHorizontal: SPACING.lg,
  },
  waitingLabel: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  challengerSection: {
    marginTop: SPACING.sm,
  },
  subHeading: {
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  pinInput: {
    height: 56,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    fontSize: 28,
    lineHeight: 36,
    includeFontPadding: false,
    fontWeight: '900',
    textAlign: 'center',
    color: colors.textPrimary,
    letterSpacing: 6,
    marginBottom: SPACING.lg,
  },
  waitingHostBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  waitingHostText: {
    letterSpacing: 0.5,
  },
  cancelRequestBtn: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },

  // Match in progress
  matchContainer: {
    gap: SPACING.sm,
  },
  statusBox: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  statusMessageText: {
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  playerInfo: {
    flex: 1,
  },
  vsBox: {
    paddingHorizontal: SPACING.md,
  },
  reTossBtn: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: SPACING.lg,
  },
  arenaHeaderSection: {
    marginBottom: SPACING.sm,
  },
  arenaKicker: {
    letterSpacing: 1,
    marginBottom: 4,
    fontSize: 10.5,
  },
});

export default BattlegroundScreen;
