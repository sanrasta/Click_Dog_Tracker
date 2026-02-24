import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useTodayLogs, useCreateLog, useUpdateLogNotes } from '../queries/useLogQueries';
import DogHeroCard from '../components/DogHeroCard';
import ActivityGrid from '../components/ActivityGrid';
import LogEntry from '../components/LogEntry';
import NoteModal from '../components/NoteModal';
import { ActivityType, ActivityNotes } from '../types';

export default function LogScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: dog } = useActiveDog();
  const { data: todayLogs } = useTodayLogs(dog?.id);
  const createLog = useCreateLog(dog?.id);
  const updateNotes = useUpdateLogNotes(dog?.id);

  const [noteModal, setNoteModal] = useState<{
    visible: boolean;
    activityType: ActivityType | null;
    logId: string | null;
  }>({ visible: false, activityType: null, logId: null });

  const handleActivityPress = useCallback(
    async (type: ActivityType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const logId = await createLog.mutateAsync({ activityType: type });
      setNoteModal({ visible: true, activityType: type, logId });
    },
    [createLog]
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={todayLogs ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogEntry log={item} />}
        ListHeaderComponent={
          <>
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

            <ActivityGrid
              stickerUrl={dog?.stickerPhotoUrl}
              onActivityPress={handleActivityPress}
            />

            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>
              RECENT LOGS
            </Text>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
});
