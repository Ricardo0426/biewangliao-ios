import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsSupported } from '../notifications';
import { useTheme } from '../theme';

interface Props {
  notifGranted: boolean | null;
}

/** 设置板块：通知权限、说明信息 */
export function SettingsScreen({ notifGranted }: Props) {
  const theme = useTheme();
  const card = { backgroundColor: theme.card, borderRadius: 12 };
  const label = [styles.sectionTitle, { color: theme.secondaryText }];

  const notifStateText = !notificationsSupported
    ? '网页预览不支持'
    : notifGranted === null
      ? '检测中…'
      : notifGranted
        ? '已允许'
        : '未允许';

  return (
    <ScrollView contentContainerStyle={styles.content} bounces={true}>
      <Text style={[styles.title, { color: theme.text }]}>设置</Text>

      <Text style={label}>提醒</Text>
      <View style={card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: theme.red }]}>
            <Ionicons name="notifications-outline" size={17} color="#fff" />
          </View>
          <Text style={[styles.rowTitle, { color: theme.text }]}>到点通知</Text>
          <Text style={[styles.rowValue, { color: theme.secondaryText }]}>{notifStateText}</Text>
        </View>
        {notificationsSupported && notifGranted === false && (
          <TouchableOpacity
            style={[styles.row, styles.rowTappable]}
            onPress={() => Linking.openSettings()}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.tint }]}>
              <Ionicons name="construct-outline" size={17} color="#fff" />
            </View>
            <Text style={[styles.rowTitle, { color: theme.tint }]}>去系统设置开启通知</Text>
            <Ionicons name="chevron-forward" size={15} color={theme.tertiaryText} />
          </TouchableOpacity>
        )}
        <View style={[styles.row, styles.lastRow]}>
          <View style={[styles.iconBox, { backgroundColor: theme.orange }]}>
            <Ionicons name="time-outline" size={17} color="#fff" />
          </View>
          <Text style={[styles.rowTitle, { color: theme.text }]}>提醒方式</Text>
          <Text style={[styles.rowValue, { color: theme.secondaryText }]}>时段开始时通知</Text>
        </View>
      </View>

      <Text style={label}>外观</Text>
      <View style={card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#5e5ce6' }]}>
            <Ionicons name="contrast-outline" size={17} color="#fff" />
          </View>
          <Text style={[styles.rowTitle, { color: theme.text }]}>深色 / 浅色外观</Text>
          <Text style={[styles.rowValue, { color: theme.secondaryText }]}>跟随系统</Text>
        </View>
      </View>

      <Text style={label}>关于</Text>
      <View style={card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#8e8e93' }]}>
            <Ionicons name="information-circle-outline" size={17} color="#fff" />
          </View>
          <Text style={[styles.rowTitle, { color: theme.text }]}>版本</Text>
          <Text style={[styles.rowValue, { color: theme.secondaryText }]}>1.0.0（原型）</Text>
        </View>
      </View>

      <Text style={[styles.footnote, { color: theme.tertiaryText }]}>
        别忘了 · 原型版{'\n'}
        当前展示的是模拟的实时活动效果；接入「真·灵动岛」需要 Apple 开发者账号＋云端打包，
        届时在锁屏和灵动岛上原生显示。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: 0.3, marginBottom: 18 },
  sectionTitle: { fontSize: 13, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  rowTappable: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(120,120,128,0.2)',
  },
  lastRow: {},
  iconBox: {
    width: 29,
    height: 29,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 16, flex: 1 },
  rowValue: { fontSize: 15 },
  footnote: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 24,
    textAlign: 'center',
  },
});
