import { useMemo } from 'react';
import { ActivityLog, ActivityType } from '../types';
import {
  XP_PER_LOG,
  ACTIVITY_XP_BONUS,
  STREAK_BONUS_MULTIPLIER,
  getLevelForXP,
  getXPProgress,
  LevelDefinition,
} from '../constants/gamification';

export interface GamificationState {
  totalXP: number;
  level: LevelDefinition;
  xpProgress: ReturnType<typeof getXPProgress>;
  streak: number;
  todayCount: number;
}

function computeStreak(logs: ActivityLog[]): number {
  if (!logs.length) return 0;

  const daySet = new Set<string>();
  for (const log of logs) {
    const date = log.timestamp?.toDate?.();
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      daySet.add(`${y}-${m}-${d}`);
    }
  }

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 365; i++) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');

    if (daySet.has(`${y}-${m}-${d}`)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function computeTotalXP(logs: ActivityLog[], streak: number): number {
  let total = 0;
  const multiplier = streak > 1 ? 1 + STREAK_BONUS_MULTIPLIER : 1;

  for (const log of logs) {
    const base = XP_PER_LOG;
    const bonus = ACTIVITY_XP_BONUS[log.activityType] ?? 0;
    total += Math.round((base + bonus) * multiplier);
  }

  return total;
}

export function useGamification(
  todayLogs: ActivityLog[] | undefined,
  allLogs: ActivityLog[] | undefined
): GamificationState {
  return useMemo(() => {
    const todayCount = todayLogs?.length ?? 0;
    const logsToUse = allLogs ?? todayLogs ?? [];
    const streak = computeStreak(logsToUse);
    const totalXP = computeTotalXP(logsToUse, streak);
    const level = getLevelForXP(totalXP);
    const xpProgress = getXPProgress(totalXP);

    return { totalXP, level, xpProgress, streak, todayCount };
  }, [todayLogs, allLogs]);
}

export function getXPForActivity(
  activityType: ActivityType,
  streak: number
): number {
  const base = XP_PER_LOG;
  const bonus = ACTIVITY_XP_BONUS[activityType] ?? 0;
  const multiplier = streak > 1 ? 1 + STREAK_BONUS_MULTIPLIER : 1;
  return Math.round((base + bonus) * multiplier);
}
