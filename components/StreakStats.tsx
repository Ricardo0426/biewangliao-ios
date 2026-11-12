import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';

/** 打卡统计弹层：当前/最高/累计 + 最近 30 天日历 */
export function StreakStats({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const app = useApp();

  const cells: { date: string; done: boolean; isToday: boolean }[] = [];
  const base = new Date(app.now.getFullYear(), app.now.getMonth(), app.now.getDate());
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    cells.push({ date, done: app.checkins.some(c => c.date === date), isToday: i === 0 });
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>打卡统计</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="flame" size={18} color={theme.orange} />
                <Text style={[styles.statValue, { color: theme.text }]}>{app.streak}</Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>当前连胜</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{app.bestDays}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>最高连胜</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{app.totalDays}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>累计天数</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>最近 30 天</Text>
          <View style={styles.grid}>
            {cells.map(c => (
              <View
                key={c.date}
                style={[
                  styles.cell,
                  { backgroundColor: c.done ? theme.green : theme.innerFill },
                  c.isToday && !c.done && { borderWidth: 2, borderColor: theme.tint },
                ]}
              />
            ))}
          </View>

          {app.nextMilestone ? (
            <Text style={[styles.milestone, { color: theme.tint }]}>
              再坚持 {app.nextMilestone - app.streak} 天，达成 {app.nextMilestone} 天连胜
            </Text>
          ) : (
            <Text style={[styles.milestone, { color: theme.tint }]}>你已达成所有里程碑 🔥</Text>
          )}
          <Text style={[styles.rule, { color: theme.tertiaryText }]}>
            完成任意一个时段即打卡成功；中断一天则连胜重新计算
          </Text>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.tint }]}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { borderRadius: 24, padding: 20, width: '100%' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  statRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: { width: 26, height: 26, borderRadius: 8 },
  milestone: { fontSize: 14, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  rule: { fontSize: 11, marginTop: 8, textAlign: 'center', lineHeight: 16 },
  closeBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  closeText: { fontSize: 16, fontWeight: '600' },
});
