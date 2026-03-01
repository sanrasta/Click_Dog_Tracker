import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useLogsByDateRange } from '../queries/useLogQueries';
import LogEntry from '../components/LogEntry';
import { ActivityLog, ActivityType } from '../types';
import { ACTIVITIES, ACTIVITY_MAP } from '../constants/activities';

type Period = '7d' | '30d' | '90d';
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 };

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatSectionDate(dateStr: string): string {
  const today = getDayKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDayKey(yesterday);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { data: dog } = useActiveDog();
  const [period, setPeriod] = useState<Period>('30d');
  const [activeFilter, setActiveFilter] = useState<ActivityType | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - PERIOD_DAYS[period]);
    return { startDate: start, endDate: end };
  }, [period]);

  const { data: logs, refetch, isRefetching } = useLogsByDateRange(
    dog?.id,
    startDate,
    endDate
  );

  const stats = useMemo(() => {
    if (!logs?.length) {
      return {
        total: 0,
        dailyAvg: 0,
        busiestHour: null as number | null,
        topActivity: null as { type: ActivityType; count: number } | null,
        activityBreakdown: [] as { type: ActivityType; count: number; pct: number }[],
        dailyCounts: {} as Record<string, number>,
        weekdayAvgs: new Array(7).fill(0) as number[],
      };
    }

    const freqMap: Record<string, number> = {};
    const hourBuckets = new Array(24).fill(0);
    const dailyCounts: Record<string, number> = {};
    const weekdayTotals = new Array(7).fill(0);
    const weekdaySets = new Array(7).fill(null).map(() => new Set<string>());

    for (const log of logs) {
      freqMap[log.activityType] = (freqMap[log.activityType] ?? 0) + 1;

      const date = log.timestamp?.toDate?.();
      if (date) {
        hourBuckets[date.getHours()]++;
        const dayKey = getDayKey(date);
        dailyCounts[dayKey] = (dailyCounts[dayKey] ?? 0) + 1;
        const dow = date.getDay();
        weekdayTotals[dow]++;
        weekdaySets[dow].add(dayKey);
      }
    }

    const uniqueDays = new Set(Object.keys(dailyCounts)).size || 1;

    const breakdown = Object.entries(freqMap)
      .map(([type, count]) => ({
        type: type as ActivityType,
        count,
        pct: Math.round((count / logs.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    let busiestHour: number | null = null;
    let maxHourCount = 0;
    for (let h = 0; h < 24; h++) {
      if (hourBuckets[h] > maxHourCount) {
        maxHourCount = hourBuckets[h];
        busiestHour = h;
      }
    }

    const weekdayAvgs = weekdayTotals.map((total, i) => {
      const dayCount = weekdaySets[i].size || 1;
      return Math.round((total / dayCount) * 10) / 10;
    });

    return {
      total: logs.length,
      dailyAvg: Math.round((logs.length / uniqueDays) * 10) / 10,
      busiestHour,
      topActivity: breakdown[0] ?? null,
      activityBreakdown: breakdown.slice(0, 6),
      dailyCounts,
      weekdayAvgs,
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (!activeFilter) return logs;
    return logs.filter((l) => l.activityType === activeFilter);
  }, [logs, activeFilter]);

  const sections = useMemo(() => {
    const grouped: Record<string, ActivityLog[]> = {};
    for (const log of filteredLogs) {
      const date = log.timestamp?.toDate?.();
      const dateKey = date ? getDayKey(date) : '0000-00-00';
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]) => ({ title: formatSectionDate(key), data }));
  }, [filteredLogs]);

  const formatHour = (h: number | null) => {
    if (h === null) return '--';
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour} ${suffix}`;
  };

  const maxBreakdown = stats.activityBreakdown[0]?.count ?? 1;
  const maxWeekday = Math.max(...stats.weekdayAvgs, 1);
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogEntry log={item} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeaderRow, { backgroundColor: colors.background }]}>
            <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
              {section.data.length} {section.data.length === 1 ? 'log' : 'logs'}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.titleRow}>
              <Text style={[styles.screenTitle, { color: colors.text }]}>History</Text>
              <View style={styles.periodRow}>
                {(['7d', '30d', '90d'] as Period[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodPill,
                      {
                        backgroundColor: period === p ? colors.primary : colors.surface,
                        borderColor: period === p ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setPeriod(p)}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        { color: period === p ? '#FFF' : colors.textSecondary },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.total}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {stats.dailyAvg}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Daily Avg</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {formatHour(stats.busiestHour)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Peak Hour</Text>
              </View>
            </View>

            {/* Top Activity Badge */}
            {stats.topActivity && (
              <View style={[styles.topActivityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.topIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons
                    name={(ACTIVITY_MAP[stats.topActivity.type]?.icon ?? 'trophy') as any}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.topContent}>
                  <Text style={[styles.topLabel, { color: colors.textMuted }]}>Most Tracked</Text>
                  <Text style={[styles.topValue, { color: colors.text }]}>
                    {ACTIVITY_MAP[stats.topActivity.type]?.label} — {stats.topActivity.count} times
                  </Text>
                </View>
                <Ionicons name="trophy" size={20} color={colors.primary} />
              </View>
            )}

            {/* Weekly Pattern */}
            {stats.total > 0 && (
              <View style={[styles.weekCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.weekTitle, { color: colors.text }]}>Weekly Pattern</Text>
                <View style={styles.weekBars}>
                  {stats.weekdayAvgs.map((avg, i) => {
                    const barHeight = Math.max((avg / maxWeekday) * 48, 4);
                    return (
                      <View key={i} style={styles.weekBarCol}>
                        <View style={styles.weekBarWrapper}>
                          <View
                            style={[
                              styles.weekBar,
                              {
                                height: barHeight,
                                backgroundColor: avg === maxWeekday ? colors.primary : colors.primaryLight,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.weekBarLabel, { color: colors.textMuted }]}>
                          {dayLabels[i]}
                        </Text>
                        <Text style={[styles.weekBarValue, { color: colors.textSecondary }]}>
                          {avg}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Activity Breakdown */}
            {stats.activityBreakdown.length > 0 && (
              <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                  Activity Breakdown
                </Text>
                {stats.activityBreakdown.map((item) => {
                  const activity = ACTIVITY_MAP[item.type];
                  const barWidth = Math.max((item.count / maxBreakdown) * 100, 4);
                  return (
                    <View key={item.type} style={styles.breakdownRow}>
                      <View style={styles.breakdownLeft}>
                        <View style={[styles.breakdownIcon, { backgroundColor: colors.primaryLight }]}>
                          <Ionicons
                            name={(activity?.icon ?? 'ellipse') as any}
                            size={14}
                            color={colors.primary}
                          />
                        </View>
                        <Text
                          style={[styles.breakdownLabel, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {activity?.label ?? item.type}
                        </Text>
                      </View>
                      <View style={styles.breakdownRight}>
                        <View style={[styles.breakdownTrack, { backgroundColor: colors.surfaceElevated }]}>
                          <View
                            style={[
                              styles.breakdownFill,
                              { width: `${barWidth}%`, backgroundColor: colors.primary },
                            ]}
                          />
                        </View>
                        <Text style={[styles.breakdownCount, { color: colors.text }]}>
                          {item.count}
                        </Text>
                        <Text style={[styles.breakdownPct, { color: colors.textMuted }]}>
                          {item.pct}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: !activeFilter ? colors.primary : colors.surface,
                    borderColor: !activeFilter ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: !activeFilter ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {ACTIVITIES.map((a) => (
                <TouchableOpacity
                  key={a.type}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: activeFilter === a.type ? colors.primary : colors.surface,
                      borderColor: activeFilter === a.type ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() =>
                    setActiveFilter((prev) => (prev === a.type ? null : a.type))
                  }
                >
                  <Ionicons
                    name={a.icon as any}
                    size={14}
                    color={activeFilter === a.type ? '#FFF' : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      { color: activeFilter === a.type ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.timelineTitle, { color: colors.sectionTitle }]}>
              TIMELINE
            </Text>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="paw-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No logs yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Start tracking on the Log tab!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Top Activity
  topActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  topIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContent: { flex: 1 },
  topLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  // Weekly Pattern
  weekCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  weekBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  weekBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekBarWrapper: {
    height: 48,
    justifyContent: 'flex-end',
  },
  weekBar: {
    width: 24,
    borderRadius: 6,
    minHeight: 4,
  },
  weekBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  weekBarValue: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Breakdown
  breakdownCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  breakdownIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  breakdownRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 5,
  },
  breakdownCount: {
    width: 26,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  breakdownPct: {
    width: 32,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Filters
  filters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Timeline
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Empty
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
  },
});
