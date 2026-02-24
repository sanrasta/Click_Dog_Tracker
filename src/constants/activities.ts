import { ActivityConfig } from '../types';

export const ACTIVITIES: ActivityConfig[] = [
  { type: 'yawn', label: 'Yawn', subtitle: 'Napping', icon: 'moon-outline', iconFamily: 'Ionicons' },
  { type: 'eat', label: 'Eat', subtitle: 'Meal time', icon: 'restaurant-outline', iconFamily: 'Ionicons' },
  { type: 'poop', label: 'Poop', subtitle: 'Potty break', icon: 'leaf-outline', iconFamily: 'Ionicons' },
  { type: 'walk', label: 'Walk', subtitle: 'Exercise', icon: 'walk-outline', iconFamily: 'Ionicons' },
  { type: 'play', label: 'Play', subtitle: 'Fun time', icon: 'game-controller-outline', iconFamily: 'Ionicons' },
  { type: 'meds', label: 'Meds', subtitle: 'Health', icon: 'medkit-outline', iconFamily: 'Ionicons' },
  { type: 'pee', label: 'Pee', subtitle: 'Potty break', icon: 'water-outline', iconFamily: 'Ionicons' },
  { type: 'drink', label: 'Drink', subtitle: 'Hydration', icon: 'water', iconFamily: 'Ionicons' },
  { type: 'workout', label: 'Workout', subtitle: 'Exercise', icon: 'barbell-outline', iconFamily: 'Ionicons' },
  { type: 'training', label: 'Training', subtitle: 'Learning', icon: 'school-outline', iconFamily: 'Ionicons' },
  { type: 'stimulation', label: 'Stimulation', subtitle: 'Mental', icon: 'bulb-outline', iconFamily: 'Ionicons' },
  { type: 'lickmat', label: 'Lickmat', subtitle: 'Enrichment', icon: 'grid-outline', iconFamily: 'Ionicons' },
  { type: 'nosework', label: 'Nosework', subtitle: 'Exploring', icon: 'search-outline', iconFamily: 'Ionicons' },
  { type: 'schedule', label: 'Schedule', subtitle: 'Routine', icon: 'time-outline', iconFamily: 'Ionicons' },
];

export const ACTIVITY_MAP = Object.fromEntries(
  ACTIVITIES.map((a) => [a.type, a])
) as Record<string, ActivityConfig>;

export const PRIMARY_ACTIVITIES = ACTIVITIES.slice(0, 6);
export const SECONDARY_ACTIVITIES = ACTIVITIES.slice(6);
