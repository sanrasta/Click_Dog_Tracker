# n8n Sticker Engine Setup

## 1. Create n8n Cloud account

Go to [app.n8n.cloud](https://app.n8n.cloud) and sign up. Free trial available.

## 2. Get a remove.bg API key

Go to [remove.bg/api](https://www.remove.bg/api), sign up, and grab your API key. Free tier: 50 images/month.

## 3. Import the workflow

1. Open your n8n instance
2. Click **"Add workflow"** (or the + icon)
3. Click the **three dots menu** (top-right) → **Import from file**
4. Select `sticker-engine-workflow.json` from this folder
5. The 5-node workflow will appear

## 4. Configure credentials in n8n

### remove.bg API Key

1. In n8n, go to **Settings → Credentials**
2. Create a new **Header Auth** credential:
   - Name: `removeBgApi`
   - Header Name: `X-Api-Key`
   - Header Value: `your-remove-bg-api-key`
3. Attach it to the "Remove Background" node

### Firebase / Google Service Account

For the Storage upload and Firestore update nodes:

1. In Firebase Console → Project Settings → Service Accounts → **Generate New Private Key**
2. In n8n, create a **Google Service Account** credential using the downloaded JSON
3. Attach it to both "Upload to Firebase Storage" and "Update Firestore" nodes

Alternatively, you can use a **Header Auth** credential with a Google OAuth2 access token.

## 5. Activate and test

1. Toggle the workflow **Active** (top-right switch)
2. Copy the **webhook URL** — it will look like:
   `https://your-instance.app.n8n.cloud/webhook/sticker-engine`
3. Paste this URL into your app at `src/constants/config.ts` → `N8N_WEBHOOK_URL`
4. Test by uploading a dog photo in the app

## 6. Webhook payload reference

The app sends this JSON body to the webhook:

```json
{
  "userId": "abc123",
  "dogId": "dog456",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "storageBucket": "your-project.appspot.com",
  "firebaseProjectId": "your-project-id"
}
```

The webhook responds with:

```json
{
  "stickerUrl": "https://firebasestorage.googleapis.com/..."
}
```
