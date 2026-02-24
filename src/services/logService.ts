import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { ActivityLog, ActivityNotes, ActivityType } from '../types';

const getLogsRef = (userId: string, dogId: string) =>
  collection(db, 'users', userId, 'dogs', dogId, 'logs');

export async function createLog(
  userId: string,
  dogId: string,
  activityType: ActivityType,
  notes?: ActivityNotes
): Promise<string> {
  const docRef = await addDoc(getLogsRef(userId, dogId), {
    activityType,
    timestamp: serverTimestamp(),
    notes: notes ?? {},
    metadata: {},
  });
  return docRef.id;
}

export async function updateLogNotes(
  userId: string,
  dogId: string,
  logId: string,
  notes: ActivityNotes
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'dogs', dogId, 'logs', logId);
  await updateDoc(docRef, { notes });
}

export async function fetchTodayLogs(
  userId: string,
  dogId: string
): Promise<ActivityLog[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const q = query(
    getLogsRef(userId, dogId),
    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
}

export async function fetchLogsByDateRange(
  userId: string,
  dogId: string,
  startDate: Date,
  endDate: Date
): Promise<ActivityLog[]> {
  const q = query(
    getLogsRef(userId, dogId),
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    where('timestamp', '<=', Timestamp.fromDate(endDate)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
}
