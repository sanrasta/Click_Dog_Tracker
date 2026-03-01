import { ActivityType } from '../types';

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number;
  emoji: string;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, title: 'Puppy Pal', xpRequired: 0, emoji: '🐾' },
  { level: 2, title: 'Good Boy', xpRequired: 50, emoji: '🦴' },
  { level: 3, title: 'Super Sitter', xpRequired: 150, emoji: '⭐' },
  { level: 4, title: 'Dog Whisperer', xpRequired: 300, emoji: '🎯' },
  { level: 5, title: 'Pack Leader', xpRequired: 500, emoji: '👑' },
  { level: 6, title: 'Top Dog', xpRequired: 800, emoji: '🏆' },
  { level: 7, title: 'Legendary', xpRequired: 1200, emoji: '💎' },
  { level: 8, title: 'Mythic Tracker', xpRequired: 1800, emoji: '🌟' },
];

export const XP_PER_LOG = 10;
export const STREAK_BONUS_MULTIPLIER = 0.5;

export const ACTIVITY_XP_BONUS: Partial<Record<ActivityType, number>> = {
  walk: 5,
  training: 5,
  nosework: 5,
  workout: 5,
  stimulation: 3,
  meds: 3,
};

export function getLevelForXP(xp: number): LevelDefinition {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

export function getXPProgress(xp: number) {
  const currentLevel = getLevelForXP(xp);
  const nextLevel = LEVELS.find((l) => l.xpRequired > xp);

  if (!nextLevel) {
    return { currentXP: xp, xpInLevel: 0, xpForNext: 1, progress: 1 };
  }

  const xpInLevel = xp - currentLevel.xpRequired;
  const xpForNext = nextLevel.xpRequired - currentLevel.xpRequired;

  return {
    currentXP: xp,
    xpInLevel,
    xpForNext,
    progress: xpInLevel / xpForNext,
  };
}

export function computeXPForLog(activityType: ActivityType, streak: number): number {
  const base = XP_PER_LOG;
  const bonus = ACTIVITY_XP_BONUS[activityType] ?? 0;
  const streakMultiplier = streak > 1 ? 1 + STREAK_BONUS_MULTIPLIER : 1;
  return Math.round((base + bonus) * streakMultiplier);
}
