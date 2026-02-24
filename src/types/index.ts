import { Timestamp } from 'firebase/firestore';

export type ThemeMode = 'light' | 'dark';

export type ActivityType =
  | 'yawn'
  | 'eat'
  | 'poop'
  | 'pee'
  | 'drink'
  | 'walk'
  | 'play'
  | 'meds'
  | 'workout'
  | 'training'
  | 'stimulation'
  | 'lickmat'
  | 'nosework'
  | 'schedule';

export interface ActivityConfig {
  type: ActivityType;
  label: string;
  subtitle: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  themePreference: ThemeMode;
  createdAt: Timestamp;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  originalPhotoUrl: string | null;
  stickerPhotoUrl: string | null;
  createdAt: Timestamp;
  isActive: boolean;
}

export interface ActivityNotes {
  what?: string;
  who?: string;
  why?: string;
  where?: string;
}

export interface ActivityLog {
  id: string;
  activityType: ActivityType;
  timestamp: Timestamp;
  notes: ActivityNotes;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  card: string;
  cardBorder: string;
  tabBar: string;
  tabBarInactive: string;
  tabBarActive: string;
  success: string;
  error: string;
  statusBadge: string;
  statusBadgeText: string;
  heroBadgeBg: string;
  heroText: string;
  logItemBg: string;
  logItemIcon: string;
  sectionTitle: string;
}
