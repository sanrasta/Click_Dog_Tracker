import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useTodayLogs, useCreateLog, useUpdateLogNotes, useLogsByDateRange } from '../queries/useLogQueries';
import DogHeroCard from '../components/DogHeroCard';
import ActivityGrid from '../components/ActivityGrid';
import NoteModal from '../components/NoteModal';
import LevelBar from '../components/LevelBar';
import XPToast from '../components/XPToast';
import { ActivityType, ActivityNotes } from '../types';
import { useGamification, getXPForActivity } from '../hooks/useGamification';
import { getLevelForXP } from '../constants/gamification';

export default function LogScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: dog } = useActiveDog();
  const { data: todayLogs } = useTodayLogs(dog?.id);
  const createLog = useCreateLog(dog?.id);
  const updateNotes = useUpdateLogNotes(dog?.id);

  const gamificationRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return { startDate: start, endDate: end };
  }, []);

  const { data: allLogs } = useLogsByDateRange(
    dog?.id,
    gamificationRange.startDate,
    gamificationRange.endDate
  );

  const gamification = useGamification(todayLogs, allLogs);

  const [noteModal, setNoteModal] = useState<{
    visible: boolean;
    activityType: ActivityType | null;
    logId: string | null;
  }>({ visible: false, activityType: null, logId: null });

  const [xpToast, setXpToast] = useState<{
    visible: boolean;
    xp: number;
    levelUp: { level: number; title: string; emoji: string } | null;
  }>({ visible: false, xp: 0, levelUp: null });

  const handleActivityPress = useCallback(
    async (type: ActivityType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const xpEarned = getXPForActivity(type, gamification.streak);
      const predictedXP = gamification.totalXP + xpEarned;
      const predictedLevel = getLevelForXP(predictedXP);
      const isLevelUp = predictedLevel.level > gamification.level.level;

      const logId = await createLog.mutateAsync({ activityType: type });

      setXpToast({
        visible: true,
        xp: xpEarned,
        levelUp: isLevelUp
          ? {
              level: predictedLevel.level,
              title: predictedLevel.title,
              emoji: predictedLevel.emoji,
            }
          : null,
      });

      setNoteModal({ visible: true, activityType: type, logId });
    },
    [createLog, gamification.streak, gamification.level]
  );

  const handleSaveNotes = useCallback(
    async (notes: ActivityNotes) => {
      if (noteModal.logId) {
        const hasContent = Object.values(notes).some(Boolean);
        if (hasContent) {
          await updateNotes.mutateAsync({ logId: noteModal.logId, notes });
        }
      }
      setNoteModal({ visible: false, activityType: null, logId: null });
    },
    [noteModal.logId, updateNotes]
  );

  const handleDismissNote = useCallback(() => {
    setNoteModal({ visible: false, activityType: null, logId: null });
  }, []);

  const handleHideToast = useCallback(() => {
    setXpToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {dog?.originalPhotoUrl ? (
            <Image
              source={{ uri: dog.originalPhotoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
              <Ionicons name="paw" size={20} color={colors.primary} />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={[styles.dogName, { color: colors.text }]}>
              {dog?.name ?? 'Your Dog'}
            </Text>
            <Text style={[styles.breed, { color: colors.textSecondary }]}>
              {dog?.breed ?? 'Add your dog'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.todayPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.todayText, { color: colors.textSecondary }]}>Today</Text>
        </TouchableOpacity>
      </View>

      {dog ? <DogHeroCard dog={dog} /> : null}

      <LevelBar gamification={gamification} />

      <ActivityGrid
        stickerUrl={dog?.stickerPhotoUrl}
        onActivityPress={handleActivityPress}
      />

      <XPToast
        xp={xpToast.xp}
        levelUp={xpToast.levelUp}
        visible={xpToast.visible}
        onHide={handleHideToast}
      />

      <NoteModal
        visible={noteModal.visible}
        activityType={noteModal.activityType}
        onSave={handleSaveNotes}
        onDismiss={handleDismissNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerInfo: {
    marginLeft: 10,
  },
  dogName: {
    fontSize: 17,
    fontWeight: '700',
  },
  breed: {
    fontSize: 13,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
