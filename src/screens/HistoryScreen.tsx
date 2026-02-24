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
import { useTheme } from '../context/ThemeContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useLogsByDateRange } from '../queries/useLogQueries';
import LogEntry from '../components/LogEntry';
import { ActivityLog, ActivityType } from '../types';
import { ACTIVITIES } from '../constants/activities';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { data: dog } = useActiveDog();
  const [activeFilter, setActiveFilter] = useState<ActivityType | null>(null);

  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const { data: logs, refetch, isRefetching } = useLogsByDateRange(
    dog?.id,
    startDate,
    endDate
  );

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (!activeFilter) return logs;
    return logs.filter((l) => l.activityType === activeFilter);
  }, [logs, activeFilter]);

  const sections = useMemo(() => {
    const grouped: Record<string, ActivityLog[]> = {};
    for (const log of filteredLogs) {
      const dateKey = log.timestamp?.toDate
        ? log.timestamp.toDate().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })
        : 'Unknown';
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    }
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [filteredLogs]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>History</Text>

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
              borderColor: colors.border,
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
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              setActiveFilter((prev) => (prev === a.type ? null : a.type))
            }
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    activeFilter === a.type ? '#FFF' : colors.textSecondary,
                },
              ]}
            >
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogEntry log={item} />}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
            {section.title}
          </Text>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No logs yet. Start tracking!
            </Text>
          </View>
        }
      />
    </View>
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
  filters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  listContent: { paddingBottom: 100 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
