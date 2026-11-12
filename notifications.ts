import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Scene } from './types';

export const notificationsSupported = Platform.OS !== 'web';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

function sceneBody(scene: Scene): string {
  const items = scene.entries.filter(e => e.type === 'item').map(e => e.label);
  const actions = scene.entries.filter(e => e.type === 'action').map(e => e.label);
  const parts: string[] = [];
  if (items.length) parts.push(`带上：${items.join('、')}`);
  if (actions.length) parts.push(`记得：${actions.join('、')}`);
  return parts.join('\n') || '到时间啦';
}

/**
 * 按场景当前设置重建所有定时提醒。
 * 用"场景id+星期"做稳定的通知 id，重复同步时自动覆盖，不会越积越多。
 */
export async function syncNotifications(scenes: Scene[]): Promise<void> {
  if (!notificationsSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const scene of scenes) {
      if (!scene.enabled) continue;
      const content = {
        title: scene.name,
        body: sceneBody(scene),
      };
      const allWeek = scene.days.length === 7;
      for (const day of allWeek ? [0] : scene.days) {
        const trigger: Notifications.CalendarTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          repeats: true,
          hour: Math.floor(scene.startMinutes / 60) % 24,
          minute: scene.startMinutes % 60,
          ...(allWeek ? {} : { weekday: day + 1 }), // iOS weekday: 1=周日
        };
        await Notifications.scheduleNotificationAsync({
          identifier: `scene-${scene.id}-${allWeek ? 'daily' : day}`,
          content,
          trigger,
        });
      }
    }
  } catch {
    // 通知失败不影响 App 其他功能
  }
}
