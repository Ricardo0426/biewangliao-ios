import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneBoard } from '../../components/SceneBoard';
import { SceneEditor } from '../../components/SceneEditor';
import { useApp } from '../../state/AppContext';
import { useTheme } from '../../theme';

export default function TravelScreen() {
  const theme = useTheme();
  const app = useApp();

  if (app.loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <SafeAreaView edges={['top']} style={styles.loadingBox}>
          <Text style={[styles.loadingText, { color: theme.secondaryText }]}>加载中…</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>旅行</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              出发前的打包清单与检查提醒
            </Text>
          </View>
          <SceneBoard tabCategory="travel" />
        </ScrollView>
      </SafeAreaView>

      <SceneEditor
        visible={app.editorOpen}
        scene={app.editing}
        defaultCategory="travel"
        onClose={app.closeEditor}
        onSave={app.saveScene}
        onDelete={app.deleteScene}
        onPreview={app.previewScene}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 120,
    paddingTop: Platform.OS === 'web' ? 64 : 0,
  },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15 },
  header: { marginTop: 8, marginBottom: 18 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, marginTop: 4 },
});
