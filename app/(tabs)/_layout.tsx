import { NativeTabs } from 'expo-router/native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

/**
 * 官方原生 Tabs（桥接 SwiftUI TabView）：
 * 玻璃材质、选中泡泡、滑动动画、合并形变全部由 iOS 系统渲染。
 */
export default function TabsLayout() {
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#0a84ff' : '#007aff';

  return (
    <NativeTabs tintColor={tint} iconColor="#8e8e93" minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="daily">
        <NativeTabs.Trigger.Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
        <NativeTabs.Trigger.Label>日常</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="travel">
        <NativeTabs.Trigger.Icon sf={{ default: 'airplane', selected: 'airplane' }} />
        <NativeTabs.Trigger.Label>旅行</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
