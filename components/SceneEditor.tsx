import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeWheel } from './TimeWheel';
import { IconTile } from './IconTile';
import { IOSSwitch } from './IOSSwitch';
import { ICON_CHOICES, makeId } from '../storage';
import { formatTime } from '../timeUtils';
import { useTheme, Theme } from '../theme';
import { Entry, EntryType, Scene, SceneCategory } from '../types';

interface Props {
  visible: boolean;
  /** null 表示新建 */
  scene: Scene | null;
  /** 新建场景时归入的板块 */
  defaultCategory: SceneCategory;
  onClose: () => void;
  onSave: (scene: Scene) => void;
  onDelete?: (id: string) => void;
  onPreview?: (scene: Scene) => void;
}

/** 可折叠的时间行：默认收起，点击展开系统滚轮，避免占据整页 */
function TimeRow({
  label,
  minutes,
  expanded,
  onToggle,
  theme,
  children,
}: {
  label: string;
  minutes: number;
  expanded: boolean;
  onToggle: () => void;
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <View>
      <TouchableOpacity style={styles.timeRowBtn} onPress={onToggle} activeOpacity={0.6}>
        <Text style={[styles.timeRowLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.timeRowValue, { color: theme.tint }]}>{formatTime(minutes)}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.secondaryText}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.timeWheelWrap}>{children}</View>}
    </View>
  );
}

function blankScene(category: SceneCategory): Scene {
  return {
    id: makeId(),
    name: '',
    icon: ICON_CHOICES[0].icon,
    iconColor: ICON_CHOICES[0].color,
    category,
    startMinutes: 8 * 60,
    endMinutes: 9 * 60,
    days: [1, 2, 3, 4, 5],
    entries: [],
    enabled: true,
  };
}

export function SceneEditor({
  visible,
  scene,
  defaultCategory,
  onClose,
  onSave,
  onDelete,
  onPreview,
}: Props) {
  const theme = useTheme();
  const [draft, setDraft] = useState<Scene>(() => blankScene('daily'));
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<EntryType>('item');
  const [openTime, setOpenTime] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(
        scene ? { ...scene, entries: scene.entries.map(e => ({ ...e })) } : blankScene(defaultCategory)
      );
      setNewLabel('');
      setNewType('item');
      setOpenTime(null);
    }
  }, [visible, scene, defaultCategory]);

  const patch = (p: Partial<Scene>) => setDraft(d => ({ ...d, ...p }));

  const toggleDay = (d: number) => {
    const next = draft.days.includes(d)
      ? draft.days.filter(x => x !== d)
      : [...draft.days, d].sort((a, b) => a - b);
    patch({ days: next });
  };

  const addEntry = () => {
    const label = newLabel.trim();
    if (!label) return;
    const entry: Entry = { id: makeId(), type: newType, label };
    patch({ entries: [...draft.entries, entry] });
    setNewLabel('');
  };

  const handleSave = () => {
    const name = draft.name.trim() || '未命名场景';
    const days = draft.days.length ? draft.days : [0, 1, 2, 3, 4, 5, 6];
    onSave({ ...draft, name, days });
  };

  const card = { backgroundColor: theme.card, borderRadius: 12, padding: 14 };
  const label = [styles.fieldLabel, { color: theme.secondaryText }];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: theme.bg }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text style={[styles.cancelText, { color: theme.secondaryText }]}>取消</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {scene ? '编辑场景' : '新建场景'}
            </Text>
            <TouchableOpacity onPress={handleSave} hitSlop={8}>
              <Text style={[styles.saveText, { color: theme.tint }]}>保存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={label}>图标与名称</Text>
            <View style={card}>
              <View style={styles.emojiRow}>
                {ICON_CHOICES.map(c => {
                  const active = draft.icon === c.icon && draft.iconColor === c.color;
                  return (
                    <Pressable
                      key={c.icon}
                      onPress={() => patch({ icon: c.icon, iconColor: c.color })}
                      style={[
                        styles.iconItem,
                        { borderColor: active ? theme.tint : 'transparent' },
                      ]}
                    >
                      <IconTile name={c.icon} color={c.color} size={40} />
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: theme.innerFill, color: theme.text }]}
                value={draft.name}
                onChangeText={name => patch({ name })}
                placeholder="例如：早晨出门"
                placeholderTextColor={theme.tertiaryText}
              />
            </View>

            <Text style={label}>
              显示时段{draft.endMinutes <= draft.startMinutes ? '（结束早于开始＝跨午夜）' : ''}
              {' · 点时间展开滚轮'}
            </Text>
            <View style={card}>
              <TimeRow
                label="开始"
                minutes={draft.startMinutes}
                expanded={openTime === 'start'}
                onToggle={() => setOpenTime(t => (t === 'start' ? null : 'start'))}
                theme={theme}
              >
                <TimeWheel
                  label="开始"
                  minutes={draft.startMinutes}
                  onChange={m => patch({ startMinutes: m })}
                />
              </TimeRow>
              <View style={[styles.sectionSeparator, { backgroundColor: theme.separator }]} />
              <TimeRow
                label="结束"
                minutes={draft.endMinutes}
                expanded={openTime === 'end'}
                onToggle={() => setOpenTime(t => (t === 'end' ? null : 'end'))}
                theme={theme}
              >
                <TimeWheel
                  label="结束"
                  minutes={draft.endMinutes}
                  onChange={m => patch({ endMinutes: m })}
                />
              </TimeRow>
            </View>

            <Text style={label}>重复日</Text>
            <View style={card}>
              <View style={styles.daysRow}>
                {['日', '一', '二', '三', '四', '五', '六'].map((lbl, d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => toggleDay(d)}
                    style={[
                      styles.dayChip,
                      { backgroundColor: theme.innerFill },
                      draft.days.includes(d) && { backgroundColor: theme.tint },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        { color: theme.secondaryText },
                        draft.days.includes(d) && { color: '#fff' },
                      ]}
                    >
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => patch({ days: [0, 1, 2, 3, 4, 5, 6] })}>
                <Text style={[styles.linkText, { color: theme.tint }]}>设为每天</Text>
              </TouchableOpacity>
            </View>

            <Text style={label}>清单内容（物品 / 提醒）</Text>
            <View style={card}>
              {draft.entries.map((entry, idx) => (
                <View
                  key={entry.id}
                  style={[
                    styles.entryRow,
                    idx < draft.entries.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.separator,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          entry.type === 'item' ? theme.badgeItemBg : theme.badgeActionBg,
                      },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {entry.type === 'item' ? '物品' : '提醒'}
                    </Text>
                  </View>
                  <Text style={[styles.entryLabel, { color: theme.text }]}>{entry.label}</Text>
                  <TouchableOpacity
                    onPress={() => patch({ entries: draft.entries.filter(e => e.id !== entry.id) })}
                    hitSlop={8}
                  >
                    <Text style={[styles.deleteX, { color: theme.tertiaryText }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addRow}>
                <View style={[styles.typeToggle, { backgroundColor: theme.innerFill }]}>
                  <TouchableOpacity
                    onPress={() => setNewType('item')}
                    style={[
                      styles.typeToggleBtn,
                      newType === 'item' && {
                        backgroundColor: theme.card,
                        shadowColor: '#000',
                        shadowOpacity: 0.12,
                        shadowRadius: 3,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeToggleText,
                        { color: theme.secondaryText },
                        newType === 'item' && { color: theme.text },
                      ]}
                    >
                      物品
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setNewType('action')}
                    style={[
                      styles.typeToggleBtn,
                      newType === 'action' && {
                        backgroundColor: theme.card,
                        shadowColor: '#000',
                        shadowOpacity: 0.12,
                        shadowRadius: 3,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeToggleText,
                        { color: theme.secondaryText },
                        newType === 'action' && { color: theme.text },
                      ]}
                    >
                      提醒
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.inputFlex, { backgroundColor: theme.innerFill, color: theme.text }]}
                  value={newLabel}
                  onChangeText={setNewLabel}
                  placeholder="如：钥匙 / 锁门"
                  placeholderTextColor={theme.tertiaryText}
                  onSubmitEditing={addEntry}
                />
                <TouchableOpacity
                  style={[styles.addEntryBtn, { backgroundColor: theme.tint }]}
                  onPress={addEntry}
                >
                  <Text style={styles.addEntryBtnText}>添加</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[card, styles.switchCard, { marginTop: 20 }]}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>启用这个场景</Text>
              <IOSSwitch
                value={draft.enabled}
                onChange={enabled => patch({ enabled })}
                isDark={theme.isDark}
              />
            </View>

            {onPreview && (
              <TouchableOpacity onPress={() => onPreview(draft)}>
                <View style={[card, styles.previewBtn]}>
                  <Text style={[styles.previewBtnText, { color: theme.tint }]}>
                    ▶ 预览灵动岛效果
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {scene && onDelete && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(scene.id)}>
                <Text style={[styles.deleteBtnText, { color: theme.red }]}>删除场景</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  cancelText: { fontSize: 16 },
  saveText: { fontSize: 16, fontWeight: '600' },
  modalBody: { padding: 16, paddingBottom: 60 },
  fieldLabel: {
    fontSize: 13,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  iconItem: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 2,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  timeRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  timeRowLabel: { fontSize: 16, fontWeight: '600', flex: 1 },
  timeRowValue: { fontSize: 17, fontWeight: '700', marginRight: 8, fontVariant: ['tabular-nums'] },
  timeWheelWrap: { alignItems: 'center' },
  sectionSeparator: {
    height: StyleSheet.hairlineWidth,
  },
  daysRow: { flexDirection: 'row', gap: 6 },
  dayChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  dayChipText: { fontSize: 13, fontWeight: '600' },
  linkText: { fontSize: 13, marginTop: 12 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 10,
  },
  typeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  entryLabel: { fontSize: 16, flex: 1 },
  deleteX: { fontSize: 15 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 2,
  },
  typeToggleBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 7 },
  typeToggleText: { fontSize: 13, fontWeight: '600' },
  inputFlex: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addEntryBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addEntryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  switchCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { fontSize: 16 },
  previewBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  previewBtnText: { fontSize: 15, fontWeight: '600' },
  deleteBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600' },
});
