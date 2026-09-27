import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme';
import { Text } from '../Typography';

export interface ThemedAlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface ThemedAlertOptions {
  title: string;
  message?: string;
  buttons?: ThemedAlertButton[];
}

interface ThemedAlertContextType {
  showAlert: (options: ThemedAlertOptions) => void;
  hideAlert: () => void;
}

const ThemedAlertContext = createContext<ThemedAlertContextType>({
  showAlert: () => {},
  hideAlert: () => {},
});

export const useThemedAlert = () => useContext(ThemedAlertContext);

interface ThemedAlertProviderProps {
  children: ReactNode;
}

export const ThemedAlertProvider: React.FC<ThemedAlertProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<ThemedAlertOptions | null>(null);

  const showAlert = (options: ThemedAlertOptions) => {
    setAlertOptions(options);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setAlertOptions(null);
  };

  const buttons = alertOptions?.buttons && alertOptions.buttons.length > 0
    ? alertOptions.buttons
    : [{ text: 'OK', style: 'default' as const }];

  return (
    <ThemedAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={hideAlert}
      >
        <TouchableWithoutFeedback onPress={hideAlert}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.container, shadow.lg]}>
                {alertOptions?.title ? (
                  <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.title}>
                    {alertOptions.title.toUpperCase()}
                  </Text>
                ) : null}

                {alertOptions?.message ? (
                  <Text variant="body" color={colors.textSecondary} style={styles.message}>
                    {alertOptions.message}
                  </Text>
                ) : null}

                <View style={styles.buttonContainer}>
                  {buttons.map((btn, index) => {
                    const isDestructive = btn.style === 'destructive';
                    const isCancel = btn.style === 'cancel';
                    const isPrimary = !isDestructive && !isCancel;

                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        style={[
                          styles.button,
                          isPrimary && styles.buttonPrimary,
                          (isCancel || isDestructive) && styles.buttonSecondary,
                        ]}
                        onPress={() => {
                          hideAlert();
                          if (btn.onPress) btn.onPress();
                        }}
                      >
                        <Text
                          variant="body"
                          weight="700"
                          color={
                            isPrimary
                              ? '#FFFFFF'
                              : isDestructive
                              ? '#EF4444'
                              : colors.textSecondary
                          }
                          style={styles.buttonText}
                        >
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ThemedAlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  title: {
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  button: {
    width: '100%',
    height: 46,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    letterSpacing: 0.5,
  },
});

