import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckIn, Dismissals, Scene } from './types';

const SCENES_KEY = 'scenes_v1';
const DISMISSALS_KEY = 'dismissals_v1';
const CHECKINS_KEY = 'checkins_v1';

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** 图标选项：iOS 设置风格（彩色圆角方块 + 白色 Ionicons 图标），颜色为官方系统色 */
export interface IconChoice {
  icon: string;
  color: string;
}

export const ICON_CHOICES: IconChoice[] = [
  { icon: 'time-outline', color: '#ff9500' }, // 闹钟 橙
  { icon: 'sunny-outline', color: '#ff9f0a' }, // 早晨 黄
  { icon: 'medkit-outline', color: '#ff3b30' }, // 吃药 红
  { icon: 'moon-outline', color: '#5e5ce6' }, // 睡前 靛蓝
  { icon: 'home-outline', color: '#007aff' }, // 居家 蓝
  { icon: 'briefcase-outline', color: '#8e8e93' }, // 上班 灰
  { icon: 'book-outline', color: '#5856d6' }, // 学习 紫
  { icon: 'fitness-outline', color: '#34c759' }, // 运动 绿
  { icon: 'cafe-outline', color: '#a2845e' }, // 咖啡 棕
  { icon: 'car-sport-outline', color: '#ff2d55' }, // 通勤 粉
];

/** 兼容旧版本数据：把原来的 emoji 映射到新图标 */
const EMOJI_TO_ICON: Record<string, IconChoice> = {
  '⏰': ICON_CHOICES[0],
  '🌅': ICON_CHOICES[1],
  '💊': ICON_CHOICES[2],
  '🌙': ICON_CHOICES[3],
  '🏠': ICON_CHOICES[4],
  '💼': ICON_CHOICES[5],
  '📚': ICON_CHOICES[6],
  '🏃': ICON_CHOICES[7],
  '☕️': ICON_CHOICES[8],
  '🚗': ICON_CHOICES[9],
};

const DEFAULT_ICON = ICON_CHOICES[0];

function normalizeScene(raw: Partial<Scene> & { emoji?: string }): Scene {
  const mapped = raw.emoji ? EMOJI_TO_ICON[raw.emoji] : undefined;
  return {
    id: raw.id ?? makeId(),
    name: raw.name ?? '未命名场景',
    icon: raw.icon ?? mapped?.icon ?? DEFAULT_ICON.icon,
    iconColor: raw.iconColor ?? mapped?.color ?? DEFAULT_ICON.color,
    category: raw.category === 'travel' ? 'travel' : 'daily',
    startMinutes: raw.startMinutes ?? 8 * 60,
    endMinutes: raw.endMinutes ?? 9 * 60,
    days: raw.days ?? [1, 2, 3, 4, 5],
    entries: raw.entries ?? [],
    enabled: raw.enabled ?? true,
  };
}

function makeTravelSeed(): Scene {
  return {
    id: makeId(),
    name: '旅行出发检查',
    icon: 'airplane-outline',
    iconColor: '#007aff',
    startMinutes: 18 * 60,
    endMinutes: 20 * 60,
    days: [5],
    category: 'travel',
    enabled: false,
    entries: [
      { id: makeId(), type: 'item', label: '充电宝' },
      { id: makeId(), type: 'item', label: '身份证' },
      { id: makeId(), type: 'item', label: '护照' },
      { id: makeId(), type: 'item', label: '充电线' },
      { id: makeId(), type: 'action', label: '关水电气' },
      { id: makeId(), type: 'action', label: '带走垃圾' },
    ],
  };
}

function seedScenes(): Scene[] {
  return [
    {
      id: makeId(),
      name: '早晨出门',
      icon: 'sunny-outline',
      iconColor: '#ff9f0a',
      startMinutes: 7 * 60,
      endMinutes: 9 * 60,
      days: [1, 2, 3, 4, 5],
      category: 'daily',
      enabled: true,
      entries: [
        { id: makeId(), type: 'item', label: '钥匙' },
        { id: makeId(), type: 'item', label: '钱包' },
        { id: makeId(), type: 'item', label: '工卡' },
        { id: makeId(), type: 'action', label: '锁门' },
        { id: makeId(), type: 'action', label: '关电闸' },
      ],
    },
    {
      id: makeId(),
      name: '吃药时间',
      icon: 'medkit-outline',
      iconColor: '#ff3b30',
      startMinutes: 12 * 60,
      endMinutes: 12 * 60 + 30,
      days: [0, 1, 2, 3, 4, 5, 6],
      category: 'daily',
      enabled: true,
      entries: [
        { id: makeId(), type: 'item', label: '今天的药' },
        { id: makeId(), type: 'action', label: '温水送服' },
      ],
    },
    {
      id: makeId(),
      name: '睡前检查',
      icon: 'moon-outline',
      iconColor: '#5e5ce6',
      startMinutes: 22 * 60,
      endMinutes: 22 * 60 + 30,
      days: [0, 1, 2, 3, 4, 5, 6],
      category: 'daily',
      enabled: true,
      entries: [
        { id: makeId(), type: 'action', label: '关窗锁门' },
        { id: makeId(), type: 'action', label: '给手机充电' },
        { id: makeId(), type: 'action', label: '设好闹钟' },
      ],
    },
    makeTravelSeed(),
  ];
}

export async function loadScenes(): Promise<Scene[]> {
  try {
    const raw = await AsyncStorage.getItem(SCENES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as (Scene & { emoji?: string })[];
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeScene);
        // 迁移：老数据里没有旅行场景时，补一个示例
        if (!normalized.some(s => s.category === 'travel')) {
          normalized.push(makeTravelSeed());
        }
        return normalized;
      }
    }
  } catch {
    // 读不出来就用默认数据
  }
  const seeded = seedScenes();
  try {
    await AsyncStorage.setItem(SCENES_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

export async function saveScenes(scenes: Scene[]): Promise<void> {
  await AsyncStorage.setItem(SCENES_KEY, JSON.stringify(scenes));
}

export async function loadDismissals(): Promise<Dismissals> {
  try {
    const raw = await AsyncStorage.getItem(DISMISSALS_KEY);
    if (raw) return JSON.parse(raw) as Dismissals;
  } catch {}
  return {};
}

export async function saveDismissals(d: Dismissals): Promise<void> {
  await AsyncStorage.setItem(DISMISSALS_KEY, JSON.stringify(d));
}

export function pruneDismissals(d: Dismissals, nowTs = Date.now()): Dismissals {
  const next: Dismissals = {};
  for (const [k, v] of Object.entries(d)) {
    if (v > nowTs) next[k] = v;
  }
  return next;
}

export async function loadCheckIns(): Promise<CheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(CHECKINS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CheckIn[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export async function saveCheckIns(list: CheckIn[]): Promise<void> {
  await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(list));
}
