import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { Text } from '../Typography';
import { colors } from '../../theme/colors';
import { SPACING } from '../../constants/theme';
import { ChessBoard, BoardPiece } from './ChessBoard';
import { ChessPieceSvg } from './ChessPieceSvg';

export const ChessArena: React.FC = () => {
  const { width } = useWindowDimensions();

  // Engine instance initialized outside render cycle
  const chessRef = useRef<Chess>(new Chess());

  // Interactive UI state
  const [, setBoardVersion] = useState<number>(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Responsive board size: max 380, respecting 16px screen margins
  const boardSize = Math.min(width - 32, 380);

  const chess = chessRef.current;
  const turn = chess.turn(); // 'w' | 'b'
  const isCheck = chess.isCheck();
  const isCheckmate = chess.isCheckmate();
  const isDraw = chess.isDraw();
  const isGameOver = chess.isGameOver();

  // Find King square if in check
  let inCheckSquare: Square | null = null;
  if (isCheck) {
    const currentBoard = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          inCheckSquare = piece.square;
          break;
        }
      }
    }
  }

  // Calculate captured pieces
  const capturedWhite: PieceSymbol[] = [];
  const capturedBlack: PieceSymbol[] = [];
  const history = chess.history({ verbose: true });
  for (const move of history) {
    if (move.captured) {
      if (move.color === 'w') {
        capturedBlack.push(move.captured);
      } else {
        capturedWhite.push(move.captured);
      }
    }
  }

  // Handle square tap
  const handleSelectSquare = useCallback(
    (square: Square) => {
      if (isGameOver) return;

      const engine = chessRef.current;
      const pieceOnSquare = engine.get(square);

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setLegalDestinations([]);
          return;
        }

        if (pieceOnSquare && pieceOnSquare.color === engine.turn()) {
          setSelectedSquare(square);
          const moves = engine.moves({ square, verbose: true });
          setLegalDestinations(moves.map((m) => m.to as Square));
          return;
        }

        try {
          const moveResult = engine.move({
            from: selectedSquare,
            to: square,
            promotion: 'q',
          });

          if (moveResult) {
            setLastMove({ from: selectedSquare, to: square });
            setSelectedSquare(null);
            setLegalDestinations([]);
            setBoardVersion((v) => v + 1);
            return;
          }
        } catch {
          // Illegal move attempt
        }

        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }

      if (pieceOnSquare && pieceOnSquare.color === engine.turn()) {
        setSelectedSquare(square);
        const moves = engine.moves({ square, verbose: true });
        setLegalDestinations(moves.map((m) => m.to as Square));
      }
    },
    [selectedSquare, isGameOver]
  );

  const handleRestart = () => {
    chessRef.current.reset();
    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    setBoardVersion((v) => v + 1);
  };

  const handleUndo = () => {
    const engine = chessRef.current;
    if (engine.history().length === 0) return;
    engine.undo();
    setSelectedSquare(null);
    setLegalDestinations([]);
    const hist = engine.history({ verbose: true });
    if (hist.length > 0) {
      const prev = hist[hist.length - 1];
      setLastMove({ from: prev.from as Square, to: prev.to as Square });
    } else {
      setLastMove(null);
    }
    setBoardVersion((v) => v + 1);
  };

  const currentBoard = chess.board() as (BoardPiece | null)[][];
  const movesSan = chess.history();
  const moveNumber = Math.floor(movesSan.length / 2) + 1;
  const isGoldTurn = turn === 'w';

  return (
    <View style={styles.container}>
      {/* Match Header Information (Pure Body Typography) */}
      <View style={styles.statusBar}>
        <View style={styles.turnRow}>
          <View
            style={[
              styles.turnDot,
              { backgroundColor: isGoldTurn ? colors.accent : '#0F172A' },
            ]}
          />
          <Text variant="h3" weight="900" color={colors.textPrimary}>
            {isCheckmate
              ? `CHECKMATE! ${isGoldTurn ? 'PLAYER 2 (CHARCOAL)' : 'PLAYER 1 (GOLD)'} WINS`
              : isDraw
              ? 'DRAW / STALEMATE'
              : isGoldTurn
              ? 'PLAYER 1 (GOLD) TURN'
              : 'PLAYER 2 (CHARCOAL) TURN'}
          </Text>
        </View>

        <Text variant="caption" color={colors.textSecondary} style={styles.subStatusText}>
          {isCheck && !isCheckmate
            ? 'WARNING: KING IS IN CHECK'
            : `Move #${moveNumber} • Total Turns: ${movesSan.length}`}
        </Text>
      </View>

      {/* Captured Black Pieces */}
      <View style={styles.capturedRow}>
        <Text variant="caption" weight="800" color={colors.textSecondary} style={styles.capturedLabel}>
          CHARCOAL LOST:
        </Text>
        <View style={styles.capturedPiecesList}>
          {capturedBlack.length === 0 ? (
            <Text variant="caption" color={colors.textSecondary}>—</Text>
          ) : (
            capturedBlack.map((type, idx) => (
              <View key={`cb-${idx}`} style={styles.miniPieceWrapper}>
                <ChessPieceSvg type={type as any} color="b" size={16} />
              </View>
            ))
          )}
        </View>
      </View>

      {/* 8x8 Chess Board */}
      <View style={styles.boardWrapper}>
        <ChessBoard
          board={currentBoard}
          boardSize={boardSize}
          turn={turn}
          selectedSquare={selectedSquare}
          legalMoves={legalDestinations}
          lastMove={lastMove}
          inCheckSquare={inCheckSquare}
          isFlipped={isFlipped}
          onSelectSquare={handleSelectSquare}
        />
      </View>

      {/* Captured White Pieces */}
      <View style={styles.capturedRow}>
        <Text variant="caption" weight="800" color={colors.textSecondary} style={styles.capturedLabel}>
          GOLD LOST:
        </Text>
        <View style={styles.capturedPiecesList}>
          {capturedWhite.length === 0 ? (
            <Text variant="caption" color={colors.textSecondary}>—</Text>
          ) : (
            capturedWhite.map((type, idx) => (
              <View key={`cw-${idx}`} style={styles.miniPieceWrapper}>
                <ChessPieceSvg type={type as any} color="w" size={16} />
              </View>
            ))
          )}
        </View>
      </View>

      {/* Game Over Banner */}
      {isGameOver && (
        <View style={styles.gameOverContainer}>
          <Text variant="h2" weight="900" color={colors.accentHover} style={styles.gameOverTitle}>
            {isCheckmate ? 'VICTORY ACHIEVED' : 'MATCH CONCLUDED'}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.gameOverSubtitle}>
            {isCheckmate
              ? `${isGoldTurn ? 'Player 2 (Charcoal)' : 'Player 1 (Gold)'} delivered checkmate.`
              : 'The game ended in a draw.'}
          </Text>
          <TouchableOpacity
            style={styles.rematchButton}
            activeOpacity={0.8}
            onPress={handleRestart}
          >
            <Text variant="body" weight="900" color="#FFFFFF">
              START REMATCH NOW →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />

      {/* Move History Log */}
      <View style={styles.historySection}>
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          RECENT MOVES (SAN)
        </Text>
        {movesSan.length === 0 ? (
          <Text variant="caption" color={colors.textSecondary}>
            No moves played yet. Tap any Gold piece to reveal legal moves.
          </Text>
        ) : (
          <View style={styles.moveChipsContainer}>
            {movesSan.slice(-8).map((move, index) => (
              <View key={index} style={styles.moveChip}>
                <Text variant="caption" weight="800" color={colors.textPrimary}>
                  {move}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Match Action Controls (Pure Body Typography) */}
      <View style={styles.actionControls}>
        <TouchableOpacity
          style={styles.controlRow}
          activeOpacity={0.7}
          onPress={handleRestart}
        >
          <Text variant="body" weight="800" color={colors.textPrimary}>
            NEW GAME
          </Text>
          <Text variant="caption" color={colors.accentHover} style={styles.controlTag}>
            Reset Arena ↺
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlRow}
          activeOpacity={0.7}
          onPress={handleUndo}
          disabled={movesSan.length === 0}
        >
          <Text
            variant="body"
            weight="800"
            color={movesSan.length === 0 ? '#94A3B8' : colors.textPrimary}
          >
            UNDO LAST MOVE
          </Text>
          <Text
            variant="caption"
            color={movesSan.length === 0 ? '#94A3B8' : colors.accentHover}
            style={styles.controlTag}
          >
            Step Back ↶
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlRow}
          activeOpacity={0.7}
          onPress={() => setIsFlipped((f) => !f)}
        >
          <Text variant="body" weight="800" color={colors.textPrimary}>
            FLIP PERSPECTIVE
          </Text>
          <Text variant="caption" color={colors.accentHover} style={styles.controlTag}>
            {isFlipped ? "View Gold's Side ↻" : "View Charcoal's Side ↻"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
  },
  statusBar: {
    marginBottom: SPACING.sm,
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  turnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  subStatusText: {
    fontSize: 12,
  },
  capturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  capturedLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginRight: 8,
  },
  capturedPiecesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  miniPieceWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: SPACING.md,
  },
  gameOverContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  gameOverTitle: {
    letterSpacing: 1.2,
    fontSize: 18,
    marginBottom: 4,
  },
  gameOverSubtitle: {
    fontSize: 12.5,
    marginBottom: SPACING.md,
  },
  rematchButton: {
    height: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  historySection: {
    marginVertical: 4,
  },
  sectionHeading: {
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    fontSize: 12,
  },
  moveChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  moveChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  actionControls: {
    marginTop: SPACING.xs,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  controlTag: {
    fontWeight: '800',
    fontSize: 12,
  },
});
