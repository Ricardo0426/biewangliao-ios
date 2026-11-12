import { Scene } from './types';

export const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export function minutesNow(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/** 本地日期 YYYY-MM-DD */
export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 连续打卡天数：从今天（若今天已打卡）或昨天往回数 */
export function currentStreak(dates: Set<string>, today: Date): number {
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!dates.has(toYMD(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (dates.has(toYMD(cursor))) {
    n += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** 历史最高连续打卡天数 */
export function bestStreak(dates: Set<string>): number {
  const sorted = [...dates].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev) {
      const nextDay = new Date(prev + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      run = toYMD(nextDay) === d ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

export function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 紧凑的重复日描述：每天 / 工作日 / 周末 / 周一至周五 / 周一、周四 */
export function daysLabel(days: number[]): string {
  if (days.length === 7) return '每天';
  if (days.length === 0) return '未设置';
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 1) return `周${DAY_LABELS[sorted[0]]}`;
  if (sorted.join() === '1,2,3,4,5') return '工作日';
  if (sorted.join() === '0,6') return '周末';
  const isConsecutive = sorted.every(
    (d, i) => i === sorted.length - 1 || (d + 1) % 7 === sorted[i + 1]
  );
  if (isConsecutive) {
    return `周${DAY_LABELS[sorted[0]]}至周${DAY_LABELS[sorted[sorted.length - 1]]}`;
  }
  return sorted.map(d => `周${DAY_LABELS[d]}`).join('、');
}

/** 结束时间早于（或等于）开始时间＝跨过午夜，例如 23:00–01:00 */
export function crossesMidnight(scene: Scene): boolean {
  return scene.endMinutes <= scene.startMinutes;
}

export function isActiveNow(scene: Scene, now: Date): boolean {
  const cur = minutesNow(now);
  const day = now.getDay();

  if (crossesMidnight(scene)) {
    if (cur === scene.startMinutes) return false;
    if (cur >= scene.startMinutes) return scene.days.includes(day);
    if (cur < scene.endMinutes) {
      const yesterday = (day + 6) % 7;
      return scene.days.includes(yesterday);
    }
    return false;
  }

  if (cur < scene.startMinutes || cur >= scene.endMinutes) return false;
  return scene.days.includes(day);
}

/** 当前时段结束的绝对时间戳，用于"手动关闭后到时段结束前不再出现" */
export function windowEndTimestamp(scene: Scene, now: Date): number {
  const end = new Date(now);
  end.setSeconds(0, 0);
  if (crossesMidnight(scene) && minutesNow(now) >= scene.startMinutes) {
    end.setDate(end.getDate() + 1);
  }
  end.setHours(Math.floor(scene.endMinutes / 60) % 24, scene.endMinutes % 60);
  return end.getTime();
}

/** 今天还在等待开始的下一个场景 */
export function findNextToday(
  scenes: Scene[],
  now: Date
): { scene: Scene; startMinutes: number } | null {
  const cur = minutesNow(now);
  const day = now.getDay();
  let best: { scene: Scene; startMinutes: number } | null = null;
  for (const s of scenes) {
    if (!s.enabled) continue;
    if (!s.days.includes(day)) continue;
    if (s.startMinutes <= cur) continue;
    if (!best || s.startMinutes < best.startMinutes) best = { scene: s, startMinutes: s.startMinutes };
  }
  return best;
}
