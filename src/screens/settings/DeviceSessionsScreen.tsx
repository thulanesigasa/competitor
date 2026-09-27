import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { SmartphoneSvg, TrashSvg, ShieldSvg } from '../../components/common/SvgIcons';
import {
  SessionSecurityService,
  DeviceSessionInfo,
  SecurityAuditEvent,
} from '../../services/sessionSecurityService';
import { useThemedAlert } from '../../components/common/ThemedAlert';

export const DeviceSessionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceSessionInfo | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const { showAlert } = useThemedAlert();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [info, logs] = await Promise.all([
      SessionSecurityService.getCurrentDeviceInfo(),
      SessionSecurityService.getAuditLogs(),
    ]);
    setDeviceInfo(info);
    setAuditLogs(logs);
    setLoading(false);
  };

  const handleClearLogs = async () => {
    showAlert({
      title: 'Clear Audit History',
      message: 'This will remove all security event logs from this local device. This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Logs',
          style: 'destructive',
          onPress: async () => {
            await SessionSecurityService.clearAuditLogs();
            setAuditLogs([]);
          },
        },
      ],
    });
  };

  const handleRevokeSessions = () => {
    showAlert({
      title: 'Revoke All Sessions',
      message: 'This will sign you out of all active web and mobile sessions across other devices. You will need to sign in again on those devices.\n\nProceed?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Remote Sessions',
          style: 'destructive',
          onPress: async () => {
            setRevoking(true);
            const res = await SessionSecurityService.revokeAllSessions();
            setRevoking(false);
            if (res.success) {
              showAlert({
                title: 'Sessions Terminated',
                message: 'All remote competitor sessions have been revoked.',
              });
              loadData();
            } else {
              showAlert({
                title: 'Notice',
                message: res.error || 'Failed to revoke remote sessions.',
              });
            }
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="DEVICE SESSIONS & AUDIT"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.title}>
            Session Security
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Monitor active hardware authorizations, remote token revocations, and local security audit events.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#0F172A" style={{ marginVertical: 32 }} />
        ) : (
          <>
            {/* Active Device Session */}
            <View style={styles.sectionBlock}>
              <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
                THIS TERMINAL (CURRENT SESSION)
              </Text>

              <View style={styles.deviceRow}>
                <View style={styles.deviceIconBox}>
                  <SmartphoneSvg size={22} color="#0F172A" strokeWidth={2} />
                </View>
                <View style={styles.deviceDetails}>
                  <Text variant="h3" style={styles.deviceName}>
                    {deviceInfo?.deviceName}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {deviceInfo?.osVersion} • {deviceInfo?.appVersion}
                  </Text>
                  <Text variant="caption" color="#D97706" style={{ marginTop: 2, fontWeight: '700' }}>
                    Session ID: {deviceInfo?.sessionId} (Active)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.revokeBtn}
                onPress={handleRevokeSessions}
                activeOpacity={0.8}
                disabled={revoking}
              >
                {revoking ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text variant="caption" weight="700" color="#DC2626">
                    Revoke All Other Remote Sessions
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Audit Trail */}
            <View style={styles.sectionBlock}>
              <View style={styles.auditHeaderRow}>
                <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
                  SECURITY AUDIT TRAIL ({auditLogs.length})
                </Text>
                {auditLogs.length > 0 && (
                  <TouchableOpacity onPress={handleClearLogs} activeOpacity={0.7}>
                    <Text variant="caption" weight="700" color={colors.textSecondary}>
                      Clear Trail
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {auditLogs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text variant="caption" color={colors.textSecondary}>
                    No recent security events recorded.
                  </Text>
                </View>
              ) : (
                auditLogs.map((log, index) => (
                  <View key={log.id}>
                    <View style={styles.auditRow}>
                      <View style={styles.auditActionBox}>
                        <ShieldSvg size={14} color="#0F172A" strokeWidth={2} />
                        <Text variant="caption" weight="800" color="#0F172A">
                          {log.action}
                        </Text>
                      </View>
                      <Text variant="caption" color={colors.textSecondary} style={styles.auditDetails}>
                        {log.details}
                      </Text>
                      <Text variant="caption" color={colors.textTertiary} style={styles.auditTime}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    {index < auditLogs.length - 1 && <View style={styles.rowDivider} />}
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  revokeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    backgroundColor: 'rgba(220, 38, 38, 0.04)',
  },
  auditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  auditRow: {
    paddingVertical: 10,
  },
  auditActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  auditDetails: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  auditTime: {
    fontSize: 11,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: 4,
  },
});

export default DeviceSessionsScreen;
