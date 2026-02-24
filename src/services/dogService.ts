import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { Dog } from '../types';

const getUserDogsRef = (userId: string) =>
  collection(db, 'users', userId, 'dogs');

export async function fetchDogs(userId: string): Promise<Dog[]> {
  const snapshot = await getDocs(getUserDogsRef(userId));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Dog));
}

export async function fetchActiveDog(userId: string): Promise<Dog | null> {
  const q = query(getUserDogsRef(userId), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Dog;
}

export async function addDog(
  userId: string,
  data: { name: string; breed: string; photoUri?: string | null }
): Promise<string> {
  const { photoUri, ...rest } = data;
  const docRef = await addDoc(getUserDogsRef(userId), {
    ...rest,
    originalPhotoUrl: null,
    stickerPhotoUrl: null,
    createdAt: serverTimestamp(),
    isActive: true,
  });
  return docRef.id;
}

export async function updateDog(
  userId: string,
  dogId: string,
  data: Partial<Omit<Dog, 'id'>>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'dogs', dogId);
  await updateDoc(docRef, data);
}

export async function uploadDogPhoto(
  userId: string,
  dogId: string,
  uri: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const photoRef = ref(storage, `users/${userId}/dogs/${dogId}/original.jpg`);
  await uploadBytes(photoRef, blob);
  const downloadUrl = await getDownloadURL(photoRef);

  await updateDog(userId, dogId, { originalPhotoUrl: downloadUrl });
  return downloadUrl;
}
