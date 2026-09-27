import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { UpdateModal } from './src/components/common/UpdateModal';
import { COLORS } from './src/constants/theme';

import { ThemedAlertProvider } from './src/components/common/ThemedAlert';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemedAlertProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <RootNavigator />
          <UpdateModal />
        </View>
      </ThemedAlertProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
