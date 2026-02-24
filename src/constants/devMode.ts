import { Timestamp } from 'firebase/firestore';
import { Dog, ActivityLog, ActivityType } from '../types';

export const DEV_MODE = true;

export const MOCK_USER = {
  uid: 'test-user-001',
  email: 'test@test.com',
  displayName: 'Test',
} as const;

// Starts null — user must go through onboarding to set it
let _devDog: Dog | null = null;

export function getDevDog(): Dog | null {
  return _devDog;
}

export function setDevDog(dog: Dog): void {
  _devDog = dog;
}

export function clearDevDog(): void {
  _devDog = null;
}

const hoursAgo = (h: number): Timestamp => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return Timestamp.fromDate(d);
};

export const MOCK_LOGS: ActivityLog[] = [
  {
    id: 'log-001',
    activityType: 'eat',
    timestamp: hoursAgo(1),
    notes: { what: 'Chicken & Rice Mix' },
  },
  {
    id: 'log-002',
    activityType: 'walk',
    timestamp: hoursAgo(3),
    notes: { where: 'Park', what: '2.5 km' },
    duration: 30,
  },
  {
    id: 'log-003',
    activityType: 'yawn',
    timestamp: hoursAgo(4),
    notes: { why: 'Tired after walk' },
  },
  {
    id: 'log-004',
    activityType: 'play',
    timestamp: hoursAgo(5),
    notes: { who: 'Kids', where: 'Backyard' },
  },
  {
    id: 'log-005',
    activityType: 'poop',
    timestamp: hoursAgo(6),
    notes: { where: 'Morning walk' },
  },
  {
    id: 'log-006',
    activityType: 'drink',
    timestamp: hoursAgo(7),
    notes: {},
  },
  {
    id: 'log-007',
    activityType: 'training',
    timestamp: hoursAgo(8),
    notes: { what: 'Sit & stay practice' },
    duration: 15,
  },
];
