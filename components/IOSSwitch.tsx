import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  isDark: boolean;
}

/**
 * 开关：iPhone 上直接用官方 Switch（就是系统原生 UISwitch）；
 * 网页预览里 react-native-web 的 Switch 观感偏差，用一个 1:1 复刻
 * UISwitch 尺寸与动画的自定义开关代替（51×31，滑块 27）。
 */
export function IOSSwitch({ value, onChange, isDark }: Props) {
  const offColor = isDark ? '#39393d' : '#e9e9ea';
  const onColor = isDark ? '#30d158' : '#34c759';

  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [value, progress]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.nativeWrap}>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: onColor, false: offColor }}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.track, styles.selfCenter, { backgroundColor: value ? onColor : offColor }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nativeWrap: { alignSelf: 'center' },
  selfCenter: { alignSelf: 'center' },
  track: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
