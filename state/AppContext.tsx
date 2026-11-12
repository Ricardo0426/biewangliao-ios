import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import {
  ensureNotificationPermission,
  notificationsSupported,
  syncNotifications,
} from '../notifications';
import {
  loadCheckIns,
  loadScenes,
  loadDismissals,
  makeId,
  pruneDismissals,
  saveCheckIns,
  saveDismissals,
  saveScenes,
} from '../storage';
import { CheckIn, Dismissals, Scene as SceneT, SceneCategory } from '../types';
import {
  bestStreak,
  currentStreak,
  findNextToday,
  isActiveNow,
  toYMD,
  windowEndTimestamp,
} from '../timeUtils';

/** 连胜里程碑：达到时弹出庆祝 */
const MILESTONES = [2, 3, 7, 14, 30, 60, 100];

type NextUp = { scene: SceneT; startMinutes: number } | null;

/** 在一个板块里找出当前应该显示的场景（演示模式优先，且只显示归属该板块的演示） */
function pickActive(
  pool: SceneT[],
  dismissals: Dismissals,
  now: Date,
  demoScene: SceneT | null,
  tabCategory: SceneCategory
): SceneT | null {
  if (demoScene) {
    return (demoScene.category === 'travel') === (tabCategory === 'travel') ? demoScene : null;
  }
  for (const s of pool) {
    if (!s.enabled) continue;
    const until = dismissals[s.id];
    if (until && until > now.getTime()) continue;
    if (isActiveNow(s, now)) return s;
  }
  return null;
}

interface AppContextValue {
  now: Date;
  dailyPool: SceneT[];
  travelPool: SceneT[];
  activeDaily: SceneT | null;
  activeTravel: SceneT | null;
  nextUpDaily: NextUp;
  nextUpTravel: NextUp;
  checked: Record<string, boolean>;
  toggleEntry: (entryId: string) => void;
  demoScene: SceneT | null;
  previewScene: (scene: SceneT) => void;
  handleDone: (tabCategory: SceneCategory) => void;
  editorOpen: boolean;
  editing: SceneT | null;
  openEditor: (scene: SceneT | null) => void;
  closeEditor: () => void;
  saveScene: (scene: SceneT) => void;
  deleteScene: (id: string) => void;
  toggleEnabled: (id: string, enabled: boolean) => void;
  notifGranted: boolean | null;
  loading: boolean;
  /** 打卡 */
  checkins: CheckIn[];
  streak: number;
  bestDays: number;
  totalDays: number;
  todayDueCount: number;
  todayDoneCount: number;
  weekDots: { date: string; dayLabel: string; done: boolean; isToday: boolean }[];
  nextMilestone: number | null;
  celebration: number | null;
  dismissCelebration: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp 必须在 AppProvider 内使用');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [scenes, setScenes] = useState<SceneT[]>([]);
  const [dismissals, setDismissals] = useState<Dismissals>({});
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [demoScene, setDemoScene] = useState<SceneT | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SceneT | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [celebration, setCelebration] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [s, d, c] = await Promise.all([loadScenes(), loadDismissals(), loadCheckIns()]);
      setScenes(s);
      setDismissals(pruneDismissals(d));
      setCheckins(c);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') setNow(new Date());
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (loading) return;
    (async () => {
      const granted = notificationsSupported ? await ensureNotificationPermission() : null;
      setNotifGranted(granted);
      await syncNotifications(scenes);
    })();
  }, [loading, scenes]);

  const dailyPool = useMemo(() => scenes.filter(s => s.category !== 'travel'), [scenes]);
  const travelPool = useMemo(() => scenes.filter(s => s.category === 'travel'), [scenes]);

  const activeDaily = useMemo(
    () => pickActive(dailyPool, dismissals, now, demoScene, 'daily'),
    [dailyPool, dismissals, now, demoScene]
  );
  const activeTravel = useMemo(
    () => pickActive(travelPool, dismissals, now, demoScene, 'travel'),
    [travelPool, dismissals, now, demoScene]
  );

  const nextUpDaily = useMemo(() => findNextToday(dailyPool, now), [dailyPool, now]);
  const nextUpTravel = useMemo(() => findNextToday(travelPool, now), [travelPool, now]);

  // —— 打卡统计 ——
  const checkinDates = useMemo(() => new Set(checkins.map(c => c.date)), [checkins]);
  const streak = useMemo(() => currentStreak(checkinDates, now), [checkinDates, now]);
  const bestDays = useMemo(() => bestStreak(checkinDates), [checkinDates]);
  const totalDays = checkinDates.size;
  const todayDoneSet = useMemo(
    () => new Set(checkins.filter(c => c.date === toYMD(now)).map(c => c.sceneId)),
    [checkins, now]
  );
  const dueToday = useMemo(
    () => scenes.filter(s => s.enabled && s.days.includes(now.getDay())),
    [scenes, now]
  );
  const todayDoneCount = dueToday.filter(s => todayDoneSet.has(s.id)).length;
  const todayDueCount = dueToday.length;
  const weekDots = useMemo(() => {
    const out: { date: string; dayLabel: string; done: boolean; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      out.push({
        date: toYMD(d),
        dayLabel: '日一二三四五六'[d.getDay()],
        done: checkinDates.has(toYMD(d)),
        isToday: i === 0,
      });
    }
    return out;
  }, [checkinDates, now]);
  const nextMilestone = useMemo(() => MILESTONES.find(m => m > streak) ?? null, [streak]);
  const dismissCelebration = useCallback(() => setCelebration(null), []);

  const activeId = activeDaily?.id ?? activeTravel?.id ?? null;
  useEffect(() => {
    setChecked({});
  }, [activeId]);

  const toggleEntry = useCallback((entryId: string) => {
    setChecked(prev => ({ ...prev, [entryId]: !prev[entryId] }));
  }, []);

  const handleDone = useCallback(
    (tabCategory: SceneCategory) => {
      const active = tabCategory === 'travel' ? activeTravel : activeDaily;
      if (!active) return;
      if (demoScene) {
        setDemoScene(null);
        setChecked({});
        return;
      }
      const until = windowEndTimestamp(active, new Date());
      setDismissals(prev => {
        const next = { ...prev, [active.id]: until };
        saveDismissals(next).catch(() => {});
        return next;
      });
      // 打卡：完成时段即记录一次（演示模式不计入）
      const rec: CheckIn = {
        id: makeId(),
        sceneId: active.id,
        sceneName: active.name,
        date: toYMD(new Date()),
        ts: Date.now(),
      };
      const nextCheckins = [...checkins, rec];
      setCheckins(nextCheckins);
      saveCheckIns(nextCheckins).catch(() => {});
      setChecked({});
      const streakNow = currentStreak(new Set(nextCheckins.map(c => c.date)), new Date());
      if (MILESTONES.includes(streakNow)) setCelebration(streakNow);
    },
    [activeDaily, activeTravel, demoScene, checkins]
  );

  const previewScene = useCallback((scene: SceneT) => {
    setDemoScene(scene);
    setChecked({});
    setEditorOpen(false);
    setEditing(null);
  }, []);

  const openEditor = useCallback((scene: SceneT | null) => {
    setEditing(scene);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditing(null);
  }, []);

  const saveScene = useCallback(
    (scene: SceneT) => {
      setScenes(prev => {
        const exists = prev.some(s => s.id === scene.id);
        const next = exists ? prev.map(s => (s.id === scene.id ? scene : s)) : [...prev, scene];
        saveScenes(next).catch(() => {});
        return next;
      });
      setEditorOpen(false);
      setEditing(null);
    },
    []
  );

  const deleteScene = useCallback((id: string) => {
    setScenes(prev => {
      const next = prev.filter(s => s.id !== id);
      saveScenes(next).catch(() => {});
      return next;
    });
    setEditorOpen(false);
    setEditing(null);
  }, []);

  const toggleEnabled = useCallback((id: string, enabled: boolean) => {
    setScenes(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, enabled } : s));
      saveScenes(next).catch(() => {});
      return next;
    });
  }, []);

  const value: AppContextValue = {
    now,
    dailyPool,
    travelPool,
    activeDaily,
    activeTravel,
    nextUpDaily,
    nextUpTravel,
    checked,
    toggleEntry,
    demoScene,
    previewScene,
    handleDone,
    editorOpen,
    editing,
    openEditor,
    closeEditor,
    saveScene,
    deleteScene,
    toggleEnabled,
    notifGranted,
    loading,
    checkins,
    streak,
    bestDays,
    totalDays,
    todayDueCount,
    todayDoneCount,
    weekDots,
    nextMilestone,
    celebration,
    dismissCelebration,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
