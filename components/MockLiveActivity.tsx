import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconTile } from './IconTile';
import { Entry, Scene } from '../types';
import { useTheme } from '../theme';

const ENTRY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  item: 'bag-handle-outline',
  action: 'alert-circle-outline',
};

/** 单个清单项＝横向胶囊（蓝=物品，橙=提醒，绿=已完成），位于锁屏预览黑面板内 */
function EntryPill({
  entry,
  checked,
  onToggle,
  small,
}: {
  entry: Entry;
  checked: boolean;
  onToggle: (id: string) => void;
  small?: boolean;
}) {
  const bg = checked ? 'rgba(48,209,88,0.30)' : entry.type === 'item' ? 'rgba(10,132,255,0.28)' : 'rgba(255,159,10,0.28)';
  const checkColor = checked ? '#30d158' : 'rgba(255,255,255,0.5)';
  return (
    <Pressable onPress={() => onToggle(entry.id)}>
      <View style={[styles.pill, small && styles.pillSmall, { backgroundColor: bg }]}>
        <Ionicons
          name={ENTRY_ICON[entry.type]}
          size={small ? 11 : 13}
          color="#fff"
          style={small ? styles.pillIconSmall : styles.pillIcon}
        />
        <Text
          style={[
            small ? styles.pillTextSmall : styles.pillText,
            { color: '#fff' },
            checked && styles.pillTextChecked,
          ]}
          numberOfLines={1}
        >
          {entry.label}
        </Text>
        <Text style={[small ? styles.pillCheckSmall : styles.pillCheck, { color: checkColor }]}>
          {checked ? '✓' : '○'}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * "实时活动"的模拟预览：整块放在一个黑色面板里，
 * 模拟真实锁屏（灵动岛 + 锁屏卡片）的观感，不受 App 深浅色影响。
 */
export function MockLiveActivity({ scene, checked, onToggle, endTimeLabel, onDone, demo }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const total = scene.entries.length;
  const done = scene.entries.filter(e => checked[e.id]).length;
  const progress = total ? done / total : 0;

  return (
    <View>
      {/* —— 锁屏预览面板 —— */}
      <View style={styles.previewPanel}>
        {/* 顶部状态栏 + 灵动岛 */}
        <View style={styles.statusRow}>
          <Text style={styles.statusTime}>{demo ? '演示' : '现在'}</Text>
          <Pressable style={styles.island} onPress={() => setExpanded(v => !v)}>
            <IconTile name={scene.icon} color={scene.iconColor} size={18} />
            <Text style={styles.islandName} numberOfLines={1}>
              {scene.name}
            </Text>
            <Text style={[styles.islandCount, done >= total && total > 0 && { color: '#30d158' }]}>
              {done}/{total}
            </Text>
          </Pressable>
          <Text style={styles.statusBattery}>🔋</Text>
        </View>

        {expanded && (
          <View style={styles.islandExpanded}>
            <View style={styles.islandExpandedTop}>
              <IconTile name={scene.icon} color={scene.iconColor} size={30} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.islandExpandedName}>{scene.name}</Text>
                <Text style={styles.islandExpandedSub}>进行中 · 到 {endTimeLabel} 结束</Text>
              </View>
              <Text style={styles.islandExpandedPct}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.pillWrap}>
              {scene.entries.map(entry => (
                <EntryPill
                  key={entry.id}
                  entry={entry}
                  checked={!!checked[entry.id]}
                  onToggle={onToggle}
                  small
                />
              ))}
            </View>
          </View>
        )}

        {/* 锁屏实时活动卡片 */}
        <View style={styles.lockCard}>
          <View style={styles.lockCardHeader}>
            <View style={styles.lockCardTitleRow}>
              <IconTile name={scene.icon} color={scene.iconColor} size={24} />
              <Text style={styles.lockCardName}>{scene.name}</Text>
            </View>
            <Text style={styles.lockCardBadge}>实时活动</Text>
          </View>
          <Text style={styles.lockCardSub}>显示中 · {endTimeLabel} 前有效</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* 条目横向胶囊排布：一行放更多内容，放不下自动换行 */}
          <View style={styles.pillWrap}>
            {scene.entries.map(entry => (
              <EntryPill
                key={entry.id}
                entry={entry}
                checked={!!checked[entry.id]}
                onToggle={onToggle}
              />
            ))}
          </View>
          {total === 0 && <Text style={styles.emptyEntries}>这个场景还没有内容，去编辑里添加吧</Text>}

          <Pressable style={styles.doneBtn} onPress={onDone}>
            <Text style={[styles.doneBtnText, { color: theme.red }]}>完成，关闭这个提醒</Text>
          </Pressable>
        </View>
      </View>
      <Text style={[styles.zoneCaption, { color: theme.tertiaryText }]}>
        ↑ 锁屏实时活动的效果（点灵动岛展开，点胶囊打勾）
      </Text>
    </View>
  );
}

interface Props {
  scene: Scene;
  checked: Record<string, boolean>;
  onToggle: (entryId: string) => void;
  endTimeLabel: string;
  onDone: () => void;
  demo?: boolean;
}

const styles = StyleSheet.create({
  previewPanel: {
    backgroundColor: '#000',
    borderRadius: 32,
    padding: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTime: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statusBattery: { fontSize: 12 },
  island: {
    backgroundColor: '#000',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 170,
    maxWidth: '70%',
  },
  islandName: { color: '#fff', fontSize: 13, fontWeight: '600', flexShrink: 1, marginLeft: 6 },
  islandCount: { color: '#8e8e93', fontSize: 13, fontWeight: '700', marginLeft: 8 },
  islandExpanded: {
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    marginTop: 10,
    padding: 14,
  },
  islandExpandedTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  islandExpandedName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  islandExpandedSub: { color: '#98989f', fontSize: 12, marginTop: 2 },
  islandExpandedPct: { color: '#0a84ff', fontSize: 15, fontWeight: '700' },
  zoneCaption: { fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  lockCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 16,
    marginTop: 12,
  },
  lockCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lockCardTitleRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  lockCardName: { color: '#fff', fontSize: 17, fontWeight: '700', marginLeft: 8, flexShrink: 1 },
  lockCardBadge: { color: '#0a84ff', fontSize: 11, fontWeight: '600', marginLeft: 8 },
  lockCardSub: { color: '#98989f', fontSize: 12, marginTop: 4 },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: '#0a84ff', borderRadius: 2 },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  pill: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  pillSmall: { paddingHorizontal: 10, paddingVertical: 5 },
  pillIcon: { marginRight: 5 },
  pillIconSmall: { marginRight: 4 },
  pillText: { color: '#fff', fontSize: 14, fontWeight: '600', maxWidth: 140 },
  pillTextSmall: { color: '#fff', fontSize: 12, fontWeight: '600', maxWidth: 110 },
  pillTextChecked: { color: 'rgba(255,255,255,0.5)', textDecorationLine: 'line-through' },
  pillCheck: { fontSize: 13, fontWeight: '700', marginLeft: 7 },
  pillCheckSmall: { fontSize: 11, fontWeight: '700', marginLeft: 5 },
  emptyEntries: { color: '#8e8e93', fontSize: 13, paddingVertical: 10 },
  doneBtn: {
    backgroundColor: '#2c2c2e',
    borderRadius: 999,
    marginTop: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { fontSize: 15, fontWeight: '700' },
});
