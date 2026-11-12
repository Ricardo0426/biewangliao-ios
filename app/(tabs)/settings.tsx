import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsScreen } from '../../components/SettingsScreen';
import { useApp } from '../../state/AppContext';
import { useTheme } from '../../theme';

export default function SettingsTabScreen() {
  const theme = useTheme();
  const app = useApp();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {app.loading ? (
          <View style={styles.loadingBox}>
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>加载中…</Text>
          </View>
        ) : (
          <SettingsScreen notifGranted={app.notifGranted} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15 },
});
