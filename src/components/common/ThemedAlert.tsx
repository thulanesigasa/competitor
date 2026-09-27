import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

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
              <View style={styles.container}>
                {alertOptions?.title ? (
                  <Text style={styles.title}>{alertOptions.title.toUpperCase()}</Text>
                ) : null}

                {alertOptions?.message ? (
                  <Text style={styles.message}>{alertOptions.message}</Text>
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
                          style={[
                            styles.buttonText,
                            isPrimary && styles.buttonTextPrimary,
                            isCancel && styles.buttonTextCancel,
                            isDestructive && styles.buttonTextDestructive,
                          ]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  button: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonTextPrimary: {
    color: COLORS.white,
  },
  buttonTextCancel: {
    color: COLORS.textSecondary,
  },
  buttonTextDestructive: {
    color: '#EF4444',
  },
});
