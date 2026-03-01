import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { GamificationState } from '../hooks/useGamification';

interface Props {
  gamification: GamificationState;
}

export default function LevelBar({ gamification }: Props) {
  const { colors } = useTheme();
  const { level, xpProgress, streak, todayCount } = gamification;

  const barWidth = useRef(new Animated.Value(0)).current;
  const trackWidth = useRef(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    barWidth.setValue(xpProgress.progress * trackWidth.current);
  };

  useEffect(() => {
    if (trackWidth.current > 0) {
      Animated.timing(barWidth, {
        toValue: xpProgress.progress * trackWidth.current,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [xpProgress.progress, barWidth]);

  const isMaxLevel = xpProgress.progress >= 1 && xpProgress.xpForNext <= 1;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelEmoji}>{level.emoji}</Text>
          <View>
            <Text style={[styles.levelTitle, { color: colors.text }]}>
              Level {level.level}
            </Text>
            <Text style={[styles.levelName, { color: colors.textSecondary }]}>
              {level.title}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {streak > 0 && (
            <View style={[styles.statPill, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flame" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.primary }]}>
                {streak}d
              </Text>
            </View>
          )}
          <View style={[styles.statPill, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {todayCount}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}
          onLayout={onTrackLayout}
        >
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: barWidth },
            ]}
          />
        </View>
        <Text style={[styles.xpText, { color: colors.textMuted }]}>
          {isMaxLevel
            ? `${gamification.totalXP} XP · MAX`
            : `${xpProgress.xpInLevel} / ${xpProgress.xpForNext} XP`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelEmoji: {
    fontSize: 28,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  levelName: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressContainer: {
    gap: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
});
