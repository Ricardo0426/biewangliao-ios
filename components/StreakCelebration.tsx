import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const MESSAGES: Record<number, string> = {
  2: '好的开始！明天见 🔥',
  3: '三连达成，节奏出来了',
  7: '整整一周，习惯正在成形！',
  14: '两周了，你已经超过大多数人',
  30: '一个月！这已经是生活方式',
  60: '两个月，势不可挡',
  100: '100 天！传奇仍在继续',
};

/** 连胜里程碑庆祝弹层 */
export function StreakCelebration({
  streak,
  onDismiss,
}: {
  streak: number | null;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (streak !== null) {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [streak, scale]);

  return (
    <Modal transparent visible={streak !== null} animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, transform: [{ scale }] }]}>
          <Ionicons name="flame" size={72} color={theme.orange} />
          <Text style={[styles.big, { color: theme.text }]}>{streak ?? 0} 天连续打卡！</Text>
          <Text style={[styles.msg, { color: theme.secondaryText }]}>
            {MESSAGES[streak ?? 0] ?? '继续保持！'}
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.tint }]} onPress={onDismiss}>
            <Text style={styles.btnText}>太棒了</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  big: { fontSize: 26, fontWeight: '800', marginTop: 12 },
  msg: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  btn: {
    marginTop: 24,
    paddingVertical: 13,
    paddingHorizontal: 44,
    borderRadius: 999,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
