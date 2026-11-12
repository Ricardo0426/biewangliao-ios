import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { useTheme } from '../theme';

/** 连胜卡片：火焰天数 + 最近 7 天圆点 + 今日进度。点按打开统计 */
export function StreakCard({ onOpenStats }: { onOpenStats: () => void }) {
  const theme = useTheme();
  const app = useApp();
  const allDone = app.todayDueCount > 0 && app.todayDoneCount >= app.todayDueCount;
  const progress = app.todayDueCount ? app.todayDoneCount / app.todayDueCount : 0;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onOpenStats}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.topRow}>
          <Ionicons name="flame" size={34} color={theme.orange} />
          <View style={styles.flameMeta}>
            <Text style={[styles.streakTitle, { color: theme.text }]}>
              <Text style={styles.streakNum}>{app.streak} 天</Text> 连续打卡
            </Text>
            {app.nextMilestone ? (
              <Text style={[styles.streakSub, { color: theme.secondaryText }]}>
                距下一个里程碑 {app.nextMilestone} 天
              </Text>
            ) : (
              <Text style={[styles.streakSub, { color: theme.secondaryText }]}>
                完成任意时段即打卡
              </Text>
            )}
          </View>
        </View>

        <View style={styles.weekRow}>
          {app.weekDots.map(d => (
            <View key={d.date} style={styles.dotBox}>
              <View
                style={[
                  styles.dot,
                  d.done && { backgroundColor: theme.green },
                  !d.done && d.isToday && {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: theme.tint,
                  },
                  !d.done && !d.isToday && { backgroundColor: theme.innerFill },
                ]}
              >
                {d.done && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.dotLabel,
                  { color: d.isToday ? theme.tint : theme.tertiaryText },
                ]}
              >
                {d.isToday ? '今天' : `周${d.dayLabel}`}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.todayRow}>
          <Text
            style={[
              styles.todayText,
              { color: allDone ? theme.green : theme.secondaryText },
            ]}
          >
            {app.todayDueCount === 0
              ? '今天没有排班的场景'
              : allDone
                ? '今日全部完成 ✓'
                : `今日 ${app.todayDoneCount}/${app.todayDueCount} 个场景`}
          </Text>
          <View style={[styles.barTrack, { backgroundColor: theme.separator }]}>
            <View
              style={[
                styles.barFill,
                { width: `${progress * 100}%`, backgroundColor: theme.tint },
              ]}
            />
          </View>
          <Ionicons name="chevron-forward" size={15} color={theme.tertiaryText} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  flameMeta: { flex: 1, marginLeft: 12 },
  streakTitle: { fontSize: 15, fontWeight: '600' },
  streakNum: { fontSize: 24, fontWeight: '800' },
  streakSub: { fontSize: 12, marginTop: 2 },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  dotBox: { alignItems: 'center', gap: 4 },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: { fontSize: 10 },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  todayText: { fontSize: 13, fontWeight: '600' },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
});
