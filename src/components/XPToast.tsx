import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  xp: number;
  levelUp?: { level: number; title: string; emoji: string } | null;
  visible: boolean;
  onHide: () => void;
}

export default function XPToast({ xp, levelUp, visible, onHide }: Props) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.8);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.05,
            friction: 4,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      const stayDuration = levelUp ? 2800 : 1800;

      const exitTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -120,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, stayDuration);

      return () => clearTimeout(exitTimer);
    }
  }, [visible, levelUp, translateY, opacity, scale, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }, { scale }], opacity },
      ]}
      pointerEvents="none"
    >
      {levelUp ? (
        <View style={[styles.toast, styles.levelUpToast, { backgroundColor: colors.primary }]}>
          <Text style={styles.levelUpEmoji}>{levelUp.emoji}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
            <Text style={styles.levelUpSubtitle}>
              Level {levelUp.level} · {levelUp.title}
            </Text>
          </View>
          <Text style={styles.xpTextWhite}>+{xp} XP</Text>
        </View>
      ) : (
        <View
          style={[
            styles.toast,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          <View style={[styles.xpIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="star" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.xpAmount, { color: colors.primary }]}>+{xp} XP</Text>
          <Text style={[styles.xpMessage, { color: colors.textSecondary }]}>
            Keep it up!
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  levelUpToast: {
    borderWidth: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  levelUpEmoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  levelUpTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelUpSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  xpTextWhite: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  xpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  xpMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
});
