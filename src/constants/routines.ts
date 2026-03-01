import { ActivityType } from '../types';

export interface RoutineDefinition {
  activityType: ActivityType;
  target: number;
}

export const DEFAULT_ROUTINES: RoutineDefinition[] = [
  { activityType: 'walk', target: 1 },
  { activityType: 'eat', target: 2 },
  { activityType: 'poop', target: 1 },
  { activityType: 'drink', target: 2 },
  { activityType: 'meds', target: 1 },
  { activityType: 'play', target: 1 },
];
