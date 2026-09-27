import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { ShieldSvg, AlertTriangleSvg } from '../common/SvgIcons';
import { RuleTip } from '../../engine/morabarabaValidator';

interface RuleTipModalProps {
  visible: boolean;
  tip: RuleTip | null;
  onClose: () => void;
}

export const RuleTipModal: React.FC<RuleTipModalProps> = ({
  visible,
  tip,
  onClose,
}) => {
  if (!tip) return null;

  const isFairPlay = tip.code === 'RAPID_INPUT_THROTTLED' || tip.code === 'THREEFOLD_REPETITION_STALL' || tip.code === 'DELIBERATION_TIMEOUT';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Header Icon & Tag */}
              <View style={styles.iconContainer}>
                {isFairPlay ? (
                  <AlertTriangleSvg size={24} color={COLORS.accentHover} strokeWidth={2.2} />
                ) : (
                  <ShieldSvg size={24} color={COLORS.accentHover} strokeWidth={2.2} />
                )}
              </View>

              <Text style={styles.badgeText}>
                {isFairPlay ? 'FAIR PLAY VALIDATOR' : 'TACTICAL RULE VALIDATOR'}
              </Text>

              {/* Title */}
              <Text style={styles.titleText}>{tip.title}</Text>

              {/* Explanatory Message */}
              <Text style={styles.messageText}>{tip.message}</Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.actionBtnText}>UNDERSTOOD</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 169, 60, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentHover,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
