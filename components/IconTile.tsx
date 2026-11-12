import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * iOS 设置风格的图标：彩色圆角方块 + 白色图标。
 * 尺寸和圆角比例参照系统设置 App（29pt 行图标 / 40pt 选择器）。
 */
export function IconTile({
  name,
  color,
  size = 29,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.24,
          backgroundColor: color,
        },
      ]}
    >
      <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={Math.round(size * 0.58)} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
