import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useActiveDog } from '../queries/useDogQueries';
import { useTodayLogs, useLogsByDateRange } from '../queries/useLogQueries';
import { useGamification } from '../hooks/useGamification';
import { ACHIEVEMENTS, AchievementContext } from '../constants/achievements';
import AchievementBadge from '../components/AchievementBadge';

export default function ProfileScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const { user, isDevMode, devLogout } = useAuth();
  const { data: dog } = useActiveDog();
  const { data: todayLogs } = useTodayLogs(dog?.id);

  const range = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return { startDate: start, endDate: end };
  }, []);

  const { data: allLogs } = useLogsByDateRange(
    dog?.id,
    range.startDate,
    range.endDate
  );

  const gamification = useGamification(todayLogs, allLogs);

  const badgeStates = useMemo(() => {
    const ctx: AchievementContext = {
      allLogs: allLogs ?? todayLogs ?? [],
      todayLogs: todayLogs ?? [],
      streak: gamification.streak,
    };
    return ACHIEVEMENTS.map((badge) => ({
      ...badge,
      unlocked: badge.check(ctx),
    }));
  }, [allLogs, todayLogs, gamification.streak]);

  const unlockedCount = badgeStates.filter((b) => b.unlocked).length;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (isDevMode) {
            devLogout();
          } else {
            signOut(auth);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {dog?.originalPhotoUrl ? (
          <Image source={{ uri: dog.originalPhotoUrl }} style={styles.dogPhoto} />
        ) : (
          <View style={[styles.dogPhoto, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="paw" size={32} color={colors.primary} />
          </View>
        )}
        <Text style={[styles.dogName, { color: colors.text }]}>
          {dog?.name ?? 'No dog added'}
        </Text>
        <Text style={[styles.dogBreed, { color: colors.textSecondary }]}>
          {dog?.breed ?? 'Add your pup in onboarding'}
        </Text>

        {/* Level + XP mini summary */}
        <View style={[styles.levelRow, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={styles.levelEmoji}>{gamification.level.emoji}</Text>
          <Text style={[styles.levelText, { color: colors.text }]}>
            Lv.{gamification.level.level} {gamification.level.title}
          </Text>
          <Text style={[styles.xpText, { color: colors.textMuted }]}>
            {gamification.totalXP} XP
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settings}>
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={toggleTheme}
        >
          <View style={styles.settingLeft}>
            <Ionicons
              name={mode === 'dark' ? 'moon' : 'sunny'}
              size={22}
              color={colors.primary}
            />
            <Text style={[styles.settingText, { color: colors.text }]}>
              {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              {user?.displayName ?? user?.email ?? 'Account'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.settingText, { color: colors.error }]}>
              Sign Out
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsSection}>
        <View style={styles.achievementsHeader}>
          <Text style={[styles.achievementsTitle, { color: colors.text }]}>
            Achievements
          </Text>
          <View style={[styles.achievementCount, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.achievementCountText, { color: colors.primary }]}>
              {unlockedCount}/{ACHIEVEMENTS.length}
            </Text>
          </View>
        </View>

        <View style={styles.badgeGrid}>
          {badgeStates.map((badge) => (
            <AchievementBadge
              key={badge.id}
              emoji={badge.emoji}
              title={badge.title}
              description={badge.description}
              unlocked={badge.unlocked}
            />
          ))}
        </View>
      </View>

      <Text style={[styles.version, { color: colors.textMuted }]}>
        Click Dog Track v1.0.0
      </Text>
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
    paddingBottom: 20,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
  dogPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dogName: {
    fontSize: 22,
    fontWeight: '700',
  },
  dogBreed: {
    fontSize: 15,
    marginTop: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  levelEmoji: {
    fontSize: 18,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settings: {
    marginHorizontal: 16,
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  achievementsSection: {
    marginHorizontal: 16,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  achievementCount: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 32,
  },
});
