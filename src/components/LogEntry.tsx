import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ActivityLog } from '../types';
import { ACTIVITY_MAP } from '../constants/activities';

interface Props {
  log: ActivityLog;
}

export default function LogEntry({ log }: Props) {
  const { colors } = useTheme();
  const activity = ACTIVITY_MAP[log.activityType];

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const notePreview = [log.notes?.what, log.notes?.where]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={[styles.container, { backgroundColor: colors.logItemBg, borderColor: colors.cardBorder }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons
          name={(activity?.icon ?? 'ellipse') as any}
          size={20}
          color={colors.logItemIcon}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {activity?.label ?? log.activityType}
        </Text>
        {notePreview ? (
          <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>
            {notePreview}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.time, { color: colors.textMuted }]}>
        {formatTime(log.timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    marginTop: 2,
  },
  time: {
    fontSize: 13,
    fontWeight: '500',
  },
});
