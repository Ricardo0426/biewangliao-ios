import { useColorScheme } from 'react-native';

/**
 * 主题色板：取自 Apple 官方系统色（iOS 深色/浅色两套语义色值），
 * 跟随系统的外观设置自动切换。界面采用 iOS 原生"分组列表"风格：
 * 系统分组背景 + 实色卡片。
 */
export interface Theme {
  isDark: boolean;
  /** systemGroupedBackground */
  bg: string;
  /** secondarySystemGroupedBackground（卡片） */
  card: string;
  /** 卡片内控件的底色 */
  innerFill: string;
  /** 分隔线 */
  separator: string;
  text: string;
  secondaryText: string;
  tertiaryText: string;
  tint: string; // systemBlue
  green: string; // systemGreen
  red: string; // systemRed
  orange: string; // systemOrange
  yellow: string; // systemYellow
  badgeItemBg: string;
  badgeActionBg: string;
}

const DARK: Theme = {
  isDark: true,
  bg: '#000000',
  card: '#1c1c1e',
  innerFill: '#2c2c2e',
  separator: '#38383a',
  text: '#ffffff',
  secondaryText: '#98989f',
  tertiaryText: '#57575c',
  tint: '#0a84ff',
  green: '#30d158',
  red: '#ff453a',
  orange: '#ff9f0a',
  yellow: '#ffd60a',
  badgeItemBg: 'rgba(10,132,255,0.35)',
  badgeActionBg: 'rgba(255,159,10,0.35)',
};

const LIGHT: Theme = {
  isDark: false,
  bg: '#f2f2f7',
  card: '#ffffff',
  innerFill: '#f2f2f7',
  separator: 'rgba(60,60,67,0.29)',
  text: '#000000',
  secondaryText: '#6c6c70',
  tertiaryText: '#aeaeb2',
  tint: '#007aff',
  green: '#34c759',
  red: '#ff3b30',
  orange: '#ff9500',
  yellow: '#ffcc00',
  badgeItemBg: 'rgba(0,122,255,0.30)',
  badgeActionBg: 'rgba(255,149,0,0.30)',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}
