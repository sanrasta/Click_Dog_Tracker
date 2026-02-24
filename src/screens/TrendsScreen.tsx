import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useLogsByDateRange } from '../queries/useLogQueries';
import { ACTIVITY_MAP } from '../constants/activities';
import { ActivityType } from '../types';

type TimeRange = 'day' | 'week' | 'month';

export default function TrendsScreen() {
  const { colors } = useTheme();
  const { data: dog } = useActiveDog();
  const [range, setRange] = useState<TimeRange>('week');

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (range === 'day') start.setHours(0, 0, 0, 0);
    else if (range === 'week') start.setDate(start.getDate() - 7);
    else start.setMonth(start.getMonth() - 1);
    return { startDate: start, endDate: end };
  }, [range]);

  const { data: logs } = useLogsByDateRange(dog?.id, startDate, endDate);

  const stats = useMemo(() => {
    if (!logs?.length) return { total: 0, frequencies: [], topActivity: null };

    const freqMap: Record<string, number> = {};
    for (const log of logs) {
      freqMap[log.activityType] = (freqMap[log.activityType] ?? 0) + 1;
    }

    const frequencies = Object.entries(freqMap)
      .map(([type, count]) => ({ type: type as ActivityType, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: logs.length,
      frequencies,
      topActivity: frequencies[0] ?? null,
    };
  }, [logs]);

  const maxCount = stats.frequencies[0]?.count ?? 1;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>Trends</Text>

      <View style={styles.rangeSelector}>
        {(['day', 'week', 'month'] as TimeRange[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.rangeButton,
              {
                backgroundColor: range === r ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setRange(r)}
          >
            <Text
              style={[
                styles.rangeText,
                { color: range === r ? '#FFF' : colors.textSecondary },
              ]}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Logs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons
            name={(stats.topActivity ? ACTIVITY_MAP[stats.topActivity.type]?.icon : 'trophy-outline') as any}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {stats.topActivity
              ? ACTIVITY_MAP[stats.topActivity.type]?.label
              : 'N/A'}
          </Text>
          <Text style={[styles.statSub, { color: colors.textSecondary }]}>Most Frequent</Text>
        </View>
      </View>

      <Text style={[styles.chartTitle, { color: colors.text }]}>Activity Breakdown</Text>

      <View style={styles.barChart}>
        {stats.frequencies.map((item) => {
          const activity = ACTIVITY_MAP[item.type];
          const barWidth = (item.count / maxCount) * 100;
          return (
            <View key={item.type} style={styles.barRow}>
              <Text
                style={[styles.barLabel, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {activity?.label ?? item.type}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceElevated }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${barWidth}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.barCount, { color: colors.text }]}>
                {item.count}
              </Text>
            </View>
          );
        })}
      </View>

      {stats.frequencies.length === 0 && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No data for this period yet
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  rangeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  statSub: {
    fontSize: 12,
    marginTop: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  barChart: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});
