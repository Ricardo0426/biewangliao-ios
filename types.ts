/** 清单项类型：item = 要携带的物品，action = 要做的提醒 */
export type EntryType = 'item' | 'action';

export interface Entry {
  id: string;
  type: EntryType;
  label: string;
}

/** 场景所属板块 */
export type SceneCategory = 'daily' | 'travel';

/** 一个"场景"＝一个按时段显示的提醒，例如 早晨出门、吃药时间 */
export interface Scene {
  id: string;
  name: string;
  /** 图标：Ionicons 名称，显示成 iOS 设置风格的彩色圆角方块 */
  icon: string;
  /** 图标方块底色：Apple 官方系统色 */
  iconColor: string;
  /** 所属板块：日常 / 旅行 */
  category: SceneCategory;
  /** 距当天 0 点的分钟数，例如 7:30 = 450 */
  startMinutes: number;
  endMinutes: number;
  /** 0=周日 ... 6=周六 */
  days: number[];
  entries: Entry[];
  enabled: boolean;
}

/** 一次打卡：完成某个场景的时段后记录 */
export interface CheckIn {
  id: string;
  sceneId: string;
  sceneName: string;
  /** 本地日期 YYYY-MM-DD */
  date: string;
  ts: number;
}

/** sceneId -> 该次时段结束的时间戳（手动关闭后，到时段自然结束前不再出现） */
export type Dismissals = Record<string, number>;
