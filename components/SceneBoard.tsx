import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconTile } from './IconTile';
import { IOSSwitch } from './IOSSwitch';
import { MockLiveActivity } from './MockLiveActivity';
import { useApp } from '../state/AppContext';
import { daysLabel, formatTime } from '../timeUtils';
import { useTheme } from '../theme';
import { SceneCategory } from '../types';

/** 一个板块的场景看板：进行中的实时活动 + 场景分组列表 + 新建按钮 */
export function SceneBoard({ tabCategory }: { tabCategory: SceneCategory }) {
  const theme = useTheme();
  const app = useApp();
  const isTravel = tabCategory === 'travel';

  const pool = isTravel ? app.travelPool : app.dailyPool;
  const active = isTravel ? app.activeTravel : app.activeDaily;
  const nextUp = isTravel ? app.nextUpTravel : app.nextUpDaily;
  const endTimeLabel = active ? formatTime(active.endMinutes) : '';

  const card = { backgroundColor: theme.card, borderRadius: 12 };

  return (
    <>
      {active ? (
        <View style={styles.activeSection}>
          <View style={styles.activeHeading}>
            <View style={[styles.liveDot, { backgroundColor: theme.green }]} />
            <Text style={[styles.activeHeadingText, { color: theme.text }]}>
              {app.demoScene ? '演示模式' : '正在进行'}：{active.name}
              {app.demoScene ? '' : ` · 到 ${endTimeLabel}`}
            </Text>
          </View>
          <MockLiveActivity
            scene={active}
            checked={app.checked}
            onToggle={app.toggleEntry}
            endTimeLabel={endTimeLabel}
            onDone={() => app.handleDone(tabCategory)}
            demo={!!app.demoScene}
          />
        </View>
      ) : (
        <View style={[card, styles.emptyCard]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {isTravel ? '当前没有进行中的旅行时段' : '当前没有进行中的时段'}
          </Text>
          {nextUp ? (
            <Text style={[styles.emptyMeta, { color: theme.secondaryText }]} numberOfLines={1}>
              下一个：{nextUp.scene.name} · {formatTime(nextUp.startMinutes)} 开始
            </Text>
          ) : (
            <Text style={[styles.emptyMeta, { color: theme.secondaryText }]}>
              {isTravel ? '今天没有更多旅行时段了' : '今天已没有更多时段了'}
            </Text>
          )}
          <Text style={[styles.emptyMeta, { color: theme.secondaryText }]}>
            {isTravel ? '适合放出发前的打包清单和检查提醒' : '想现在看看效果？点任意场景右侧的「预览」'}
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
        {isTravel ? '旅行场景' : '我的场景'}
      </Text>
      <View style={card}>
        {pool.map((scene, idx) => (
          <View key={scene.id}>
            {idx > 0 && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.rowMain}
                onPress={() => app.openEditor(scene)}
              >
                <IconTile name={scene.icon} color={scene.iconColor} size={29} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.rowName, { color: theme.text }]} numberOfLines={1}>
                    {scene.name}
                  </Text>
                  <Text style={[styles.rowMeta, { color: theme.secondaryText }]} numberOfLines={1}>
                    {formatTime(scene.startMinutes)} – {formatTime(scene.endMinutes)} ·{' '}
                    {daysLabel(scene.days)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => app.previewScene(scene)}
                  hitSlop={8}
                  style={styles.previewLink}
                >
                  <Text style={[styles.previewLinkText, { color: theme.tint }]}>预览</Text>
                </TouchableOpacity>
              </TouchableOpacity>
              <IOSSwitch
                value={scene.enabled}
                onChange={v => app.toggleEnabled(scene.id, v)}
                isDark={theme.isDark}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={() => app.openEditor(null)}>
        <View style={[card, styles.addBtn]}>
          <Text style={[styles.addBtnText, { color: theme.tint }]}>＋ 新建场景</Text>
        </View>
      </TouchableOpacity>

      {!isTravel && (
        <Text style={[styles.footnote, { color: theme.tertiaryText }]}>
          原型说明：以上是模拟的实时活动效果。接入「真·灵动岛」需要 Apple 开发者账号（99
          美元/年）＋云端打包，届时在真机的锁屏和灵动岛上原生显示。
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  activeSection: { marginBottom: 8 },
  activeHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  activeHeadingText: { fontSize: 14, fontWeight: '700' },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyMeta: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  sectionTitle: {
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 57,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  rowName: { fontSize: 16, fontWeight: '400' },
  rowMeta: { fontSize: 12, marginTop: 2 },
  previewLink: { paddingHorizontal: 10, paddingVertical: 6 },
  previewLinkText: { fontSize: 14 },
  addBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addBtnText: { fontSize: 15, fontWeight: '400' },
  footnote: { fontSize: 11, lineHeight: 17, marginTop: 20, textAlign: 'center' },
});
