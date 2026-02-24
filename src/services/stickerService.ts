import {
  N8N_WEBHOOK_URL,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_PROJECT_ID,
} from '../constants/config';

interface StickerResponse {
  stickerUrl: string;
}

export async function generateSticker(
  userId: string,
  dogId: string,
  imageUrl: string
): Promise<string> {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      dogId,
      imageUrl,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      firebaseProjectId: FIREBASE_PROJECT_ID,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sticker generation failed: ${errorText}`);
  }

  const data: StickerResponse = await response.json();
  return data.stickerUrl;
}
