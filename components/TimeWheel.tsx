import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, Theme } from '../theme';

function minutesToDate(mins: number): Date {
  const d = new Date();
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
}

/**
 * 时间选择：iOS 用系统同款滚轮（和闹钟一致），Android 用系统 spinner，
 * 网页预览降级为 +/− 步进按钮。
 */
export function TimeWheel({
  label,
  minutes,
  onChange,
}: {
  label: string;
  minutes: number;
  onChange: (m: number) => void;
}) {
  const theme = useTheme();

  if (Platform.OS === 'web') {
    const bump = (dh: number, dm: number) => {
      let total = minutes + dh * 60 + dm * 5;
      total = ((total % 1440) + 1440) % 1440;
      onChange(total);
    };
    const formatTime = (m: number) =>
      `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    return (
      <View style={[styles.box, { backgroundColor: theme.innerFill }]}>
        <Text style={[styles.label, { color: theme.secondaryText }]}>{label}</Text>
        <Text style={[styles.time, { color: theme.text }]}>{formatTime(minutes)}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.stepBtn, { backgroundColor: theme.card }]} onPress={() => bump(-1, 0)}>
            <Text style={[styles.stepText, { color: theme.tint }]}>−时</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.stepBtn, { backgroundColor: theme.card }]} onPress={() => bump(0, -1)}>
            <Text style={[styles.stepText, { color: theme.tint }]}>−分</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.stepBtn, { backgroundColor: theme.card }]} onPress={() => bump(0, 1)}>
            <Text style={[styles.stepText, { color: theme.tint }]}>＋分</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.stepBtn, { backgroundColor: theme.card }]} onPress={() => bump(1, 0)}>
            <Text style={[styles.stepText, { color: theme.tint }]}>＋时</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.box, { backgroundColor: theme.innerFill }]}>
      <Text style={[styles.label, { color: theme.secondaryText }]}>{label}</Text>
      <DateTimePicker
        value={minutesToDate(minutes)}
        mode="time"
        display="spinner"
        style={styles.wheel}
        themeVariant={theme.isDark ? 'dark' : 'light'}
        onChange={(event, date) => {
          if (date) onChange(date.getHours() * 60 + date.getMinutes());
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  label: { fontSize: 12 },
  time: { fontSize: 24, fontWeight: '700', marginVertical: 6 },
  row: { flexDirection: 'row', gap: 4 },
  stepBtn: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 6 },
  stepText: { fontSize: 12, fontWeight: '600' },
  wheel: { height: 130 },
});
