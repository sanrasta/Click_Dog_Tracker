export const APP_NAME = 'Click Dog Track';

export const RECENT_LOGS_LIMIT = 20;

// n8n sticker engine webhook — replace with your actual n8n webhook URL after setup
export const N8N_WEBHOOK_URL = 'https://your-instance.app.n8n.cloud/webhook/sticker-engine';

// Firebase project details sent to n8n so it can write back to Storage/Firestore
export const FIREBASE_STORAGE_BUCKET = 'YOUR_PROJECT.appspot.com';
export const FIREBASE_PROJECT_ID = 'YOUR_PROJECT_ID';

export const NOTE_FIELDS = [
  { key: 'what' as const, label: 'What', placeholder: 'What happened?' },
  { key: 'who' as const, label: 'Who', placeholder: 'Who was involved?' },
  { key: 'why' as const, label: 'Why', placeholder: 'Why did it happen?' },
  { key: 'where' as const, label: 'Where', placeholder: 'Where did it happen?' },
] as const;
