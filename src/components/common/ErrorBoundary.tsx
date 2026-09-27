import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { COLORS, SPACING } from '../../constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for diagnosis
    console.warn('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleRestart = async (): Promise<void> => {
    try {
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
      } else {
        this.setState({ hasError: false, error: null });
      }
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  handleClearCacheAndRestart = async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
      } else {
        this.setState({ hasError: false, error: null });
      }
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>!</Text>
              </View>

              <Text style={styles.title}>APPLICATION RECOVERY</Text>
              <Text style={styles.subtitle}>
                An unexpected state issue occurred. You can restore normal operation immediately below.
              </Text>

              {this.state.error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText} numberOfLines={3}>
                    {this.state.error.message || 'Unknown runtime error'}
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={this.handleRestart}
                >
                  <Text style={styles.primaryButtonText}>RELOAD GAME</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={this.handleClearCacheAndRestart}
                >
                  <Text style={styles.secondaryButtonText}>RESET CACHE & RELOAD</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  iconText: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  errorBox: {
    width: '100%',
    padding: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
