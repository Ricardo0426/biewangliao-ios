import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneBoard } from '../../components/SceneBoard';
import { SceneEditor } from '../../components/SceneEditor';
import { StreakCard } from '../../components/StreakCard';
import { StreakCelebration } from '../../components/StreakCelebration';
import { StreakStats } from '../../components/StreakStats';
import { useApp } from '../../state/AppContext';
import { useTheme } from '../../theme';
import { formatTime, minutesNow } from '../../timeUtils';

export default function DailyScreen() {
  const theme = useTheme();
  const app = useApp();
  const [statsOpen, setStatsOpen] = useState(false);
  const card = { backgroundColor: theme.card, borderRadius: 12 };

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
            <Text style={[styles.title, { color: theme.text }]}>别忘了</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              该带的东西、该做的事，到点浮出来 · {app.now.getMonth() + 1}月{app.now.getDate()}日 周
              {'日一二三四五六'[app.now.getDay()]} {formatTime(minutesNow(app.now))}
            </Text>
          </View>

          {!app.notifGranted && (
            <View style={[card, styles.hintCard]}>
              <Text style={[styles.hintText, { color: theme.secondaryText }]}>
                {app.notifGranted === false
                  ? '🔕 通知权限未开启，到时段时无法提醒你。可在 iOS「设置 → 通知」中开启。'
                  : '电脑预览模式：定时提醒通知只在 iPhone 上生效，界面和时段逻辑完全一致。'}
              </Text>
            </View>
          )}

          <StreakCard onOpenStats={() => setStatsOpen(true)} />

          <SceneBoard tabCategory="daily" />
        </ScrollView>
      </SafeAreaView>

      <StreakStats visible={statsOpen} onClose={() => setStatsOpen(false)} />
      <StreakCelebration streak={app.celebration} onDismiss={app.dismissCelebration} />

      <SceneEditor
        visible={app.editorOpen}
        scene={app.editing}
        defaultCategory="daily"
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
  hintCard: { padding: 12, marginBottom: 12 },
  hintText: { fontSize: 12, lineHeight: 18 },
});
