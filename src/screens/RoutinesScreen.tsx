import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useTodayLogs } from '../queries/useLogQueries';
import { ACTIVITY_MAP } from '../constants/activities';
import { DEFAULT_ROUTINES } from '../constants/routines';
import { ActivityLog } from '../types';

export default function RoutinesScreen() {
  const { colors } = useTheme();
  const { data: dog } = useActiveDog();
  const { data: todayLogs } = useTodayLogs(dog?.id);

  const routineProgress = useMemo(() => {
    const logs = todayLogs ?? [];
    return DEFAULT_ROUTINES.map((routine) => {
      const current = logs.filter(
        (l: ActivityLog) => l.activityType === routine.activityType
      ).length;
      const done = current >= routine.target;
      return { ...routine, current, done };
    });
  }, [todayLogs]);

  const completedCount = routineProgress.filter((r) => r.done).length;
  const totalCount = routineProgress.length;
  const allDone = completedCount === totalCount;
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>
        Daily Routines
      </Text>

      {/* Summary Card */}
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: allDone ? colors.primary : colors.card,
            borderColor: allDone ? colors.primary : colors.cardBorder,
          },
        ]}
      >
        <View style={styles.summaryTop}>
          <View style={styles.summaryRing}>
            <View
              style={[
                styles.ringOuter,
                { borderColor: allDone ? 'rgba(255,255,255,0.3)' : colors.surfaceElevated },
              ]}
            >
              <View
                style={[
                  styles.ringInner,
                  {
                    backgroundColor: allDone ? 'rgba(255,255,255,0.15)' : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ringNumber,
                    { color: allDone ? '#FFF' : colors.primary },
                  ]}
                >
                  {completedCount}
                </Text>
                <Text
                  style={[
                    styles.ringOf,
                    { color: allDone ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                  ]}
                >
                  of {totalCount}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryText}>
            <Text
              style={[
                styles.summaryTitle,
                { color: allDone ? '#FFF' : colors.text },
              ]}
            >
              {allDone ? 'All Done!' : 'Keep Going!'}
            </Text>
            <Text
              style={[
                styles.summarySubtitle,
                {
                  color: allDone
                    ? 'rgba(255,255,255,0.8)'
                    : colors.textSecondary,
                },
              ]}
            >
              {allDone
                ? 'You completed every routine today'
                : `${totalCount - completedCount} routine${totalCount - completedCount === 1 ? '' : 's'} remaining`}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={[
            styles.summaryBar,
            {
              backgroundColor: allDone
                ? 'rgba(255,255,255,0.2)'
                : colors.surfaceElevated,
            },
          ]}
        >
          <View
            style={[
              styles.summaryBarFill,
              {
                width: `${progressPct * 100}%` as any,
                backgroundColor: allDone ? '#FFF' : colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Routine Cards */}
      {routineProgress.map((routine) => {
        const activity = ACTIVITY_MAP[routine.activityType];
        const dots = Array.from({ length: routine.target }, (_, i) => i < routine.current);

        return (
          <View
            key={routine.activityType}
            style={[
              styles.routineCard,
              {
                backgroundColor: colors.card,
                borderColor: routine.done ? colors.success : colors.cardBorder,
                borderWidth: routine.done ? 1.5 : StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View
              style={[
                styles.routineIcon,
                {
                  backgroundColor: routine.done
                    ? colors.success + '20'
                    : colors.primaryLight,
                },
              ]}
            >
              {routine.done ? (
                <Ionicons name="checkmark" size={22} color={colors.success} />
              ) : (
                <Ionicons
                  name={(activity?.icon ?? 'ellipse') as any}
                  size={22}
                  color={colors.primary}
                />
              )}
            </View>

            <View style={styles.routineContent}>
              <View style={styles.routineHeader}>
                <Text
                  style={[
                    styles.routineLabel,
                    {
                      color: routine.done ? colors.success : colors.text,
                      textDecorationLine: routine.done ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {activity?.label ?? routine.activityType}
                </Text>
                <Text style={[styles.routineTarget, { color: colors.textMuted }]}>
                  {routine.current}/{routine.target}
                </Text>
              </View>

              <View style={styles.dotsRow}>
                {dots.map((filled, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: filled
                          ? routine.done
                            ? colors.success
                            : colors.primary
                          : colors.surfaceElevated,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        );
      })}

      {/* Motivational footer */}
      {allDone && (
        <View style={styles.celebration}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={[styles.celebrationText, { color: colors.textSecondary }]}>
            Amazing job today! Your pup is well taken care of.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },

  // Summary
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryRing: {
    marginRight: 16,
  },
  ringOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  ringOf: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  summarySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  summaryBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Routine cards
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  routineIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineContent: {
    flex: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  routineTarget: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Celebration
  celebration: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 40,
  },
  celebrationEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
});
