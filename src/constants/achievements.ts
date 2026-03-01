import { ActivityLog } from '../types';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  allLogs: ActivityLog[];
  todayLogs: ActivityLog[];
  streak: number;
}

function countByType(logs: ActivityLog[], type: string): number {
  return logs.filter((l) => l.activityType === type).length;
}

function uniqueTypesInDay(logs: ActivityLog[]): number {
  const types = new Set(logs.map((l) => l.activityType));
  return types.size;
}

function hasLogInHourRange(logs: ActivityLog[], startHour: number, endHour: number): boolean {
  return logs.some((l) => {
    const date = l.timestamp?.toDate?.();
    if (!date) return false;
    const h = date.getHours();
    return startHour <= endHour
      ? h >= startHour && h < endHour
      : h >= startHour || h < endHour;
  });
}

function hasMedsStreak(logs: ActivityLog[], days: number): boolean {
  const medDays = new Set<string>();
  for (const log of logs) {
    if (log.activityType !== 'meds') continue;
    const date = log.timestamp?.toDate?.();
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      medDays.add(`${y}-${m}-${d}`);
    }
  }

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    if (medDays.has(`${y}-${m}-${d}`)) {
      streak++;
      if (streak >= days) return true;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return false;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Log your first activity',
    emoji: '🐾',
    check: ({ allLogs }) => allLogs.length >= 1,
  },
  {
    id: 'creature_of_habit',
    title: 'Creature of Habit',
    description: '3-day logging streak',
    emoji: '🔁',
    check: ({ streak }) => streak >= 3,
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: '7-day logging streak',
    emoji: '🔥',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: '30-day logging streak',
    emoji: '⚡',
    check: ({ streak }) => streak >= 30,
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Log 100 activities',
    emoji: '💯',
    check: ({ allLogs }) => allLogs.length >= 100,
  },
  {
    id: 'marathon_tracker',
    title: 'Marathon Tracker',
    description: 'Log 500 activities',
    emoji: '🏅',
    check: ({ allLogs }) => allLogs.length >= 500,
  },
  {
    id: 'walk_star',
    title: 'Walk Star',
    description: 'Log 50 walks',
    emoji: '🚶',
    check: ({ allLogs }) => countByType(allLogs, 'walk') >= 50,
  },
  {
    id: 'well_rounded',
    title: 'Well Rounded',
    description: '5+ activity types in one day',
    emoji: '🌈',
    check: ({ todayLogs }) => uniqueTypesInDay(todayLogs) >= 5,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Log an activity before 7 AM',
    emoji: '🌅',
    check: ({ allLogs }) => hasLogInHourRange(allLogs, 0, 7),
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Log an activity after 10 PM',
    emoji: '🦉',
    check: ({ allLogs }) => hasLogInHourRange(allLogs, 22, 24),
  },
  {
    id: 'med_master',
    title: 'Med Master',
    description: 'Log meds 7 days in a row',
    emoji: '💊',
    check: ({ allLogs }) => hasMedsStreak(allLogs, 7),
  },
  {
    id: 'brain_games',
    title: 'Brain Games',
    description: '20 training/stimulation/nosework logs',
    emoji: '🧠',
    check: ({ allLogs }) => {
      const count =
        countByType(allLogs, 'training') +
        countByType(allLogs, 'stimulation') +
        countByType(allLogs, 'nosework');
      return count >= 20;
    },
  },
];
