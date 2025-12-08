# 🎧 Audio Player for YouTube Content

A simple, mobile-first audio player designed for sharing YouTube audio content with family in China. The interface is entirely in Chinese (中文).

## Features

- **📱 Mobile-first design** - Optimized for smartphone viewing
- **🇨🇳 全中文界面** - Simplified Chinese interface
- **▶️ Online playback** - Stream audio directly in the browser
- **⬇️ Download support** - Download for offline listening
- **🔒 Lock screen controls** - Media Session API for background playback
- **🔄 Auto-refresh** - Pull latest content from cloud storage

## Architecture

```
Your YouTube Workflow → Cloudflare R2 → This Audio Player
     (upload)            (storage)        (playback)
```

---

## 🚀 Quick Start

### 1. Test Locally

The player comes with sample data. Open locally to test:

```bash
cd tools/audio_player
npx serve .
# or
python3 -m http.server 8000
```

Visit `http://localhost:8000` to see the sample episodes.

---

## ☁️ Cloudflare R2 Setup

### Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage** > **Create bucket**
3. Name your bucket (e.g., `youtube-audio`)
4. Choose a location close to your users (Asia for China)

### Step 2: Enable Public Access

1. In your bucket settings, go to **Settings** > **Public access**
2. Click **Allow Access**
3. Note the public URL: `https://pub-{your-account-hash}.r2.dev/{bucket-name}`

**Or use a Custom Domain (Recommended):**
1. Go to **Settings** > **Custom Domains**
2. Add a subdomain like `audio.onswitch.ca`
3. This gives you a cleaner URL and better accessibility in China

### Step 3: Configure CORS

In your bucket settings, go to **Settings** > **CORS policy** and add:

```json
[
  {
    "AllowedOrigins": [
      "https://onswitch.ca",
      "https://www.onswitch.ca",
      "http://localhost:*"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

### Step 4: Get API Credentials

1. Go to **R2 Object Storage** > **Manage R2 API Tokens**
2. Create a new API token with:
   - **Permissions**: Object Read & Write
   - **Specify bucket(s)**: Select your bucket
3. Save the **Access Key ID** and **Secret Access Key**

---

## 📤 Upload Workflow

### Option A: Using the Upload Script

Create a `.env` file with your R2 credentials:

```bash
# .env (DO NOT commit this file!)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=youtube-audio
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev/youtube-audio
```

Then run the upload script:

```bash
./upload-episode.sh \
  --audio "path/to/audio.mp3" \
  --title "视频标题" \
  --description "视频描述..." \
  --date "2024-12-08"
```

### Option B: Using AWS CLI (S3 Compatible)

R2 is S3-compatible, so you can use the AWS CLI:

```bash
# Configure AWS CLI for R2
aws configure --profile r2
# Enter your R2 Access Key ID and Secret
# Region: auto
# Endpoint: https://{account_id}.r2.cloudflarestorage.com

# Upload a file
aws s3 cp audio.mp3 s3://youtube-audio/episodes/2024-12-08-video-title/audio.mp3 \
  --endpoint-url https://{account_id}.r2.cloudflarestorage.com \
  --profile r2

# Upload manifest
aws s3 cp manifest.json s3://youtube-audio/manifest.json \
  --endpoint-url https://{account_id}.r2.cloudflarestorage.com \
  --profile r2
```

### Option C: Using rclone

```bash
# Configure rclone for R2
rclone config
# Name: r2
# Storage: s3
# Provider: Cloudflare
# Access Key ID: your_key
# Secret Access Key: your_secret
# Endpoint: https://{account_id}.r2.cloudflarestorage.com

# Sync files
rclone copy ./audio.mp3 r2:youtube-audio/episodes/2024-12-08/
rclone copy ./manifest.json r2:youtube-audio/
```

---

## 📋 Manifest Format

The player expects a `manifest.json` file at your R2 bucket root:

```json
{
  "lastUpdated": "2024-12-08T15:00:00Z",
  "episodes": [
    {
      "id": "2024-12-08-unique-id",
      "title": "视频标题（中文）",
      "description": "视频描述，简短介绍内容...",
      "date": "2024-12-08",
      "duration": "15:32",
      "audioUrl": "https://your-r2-url/episodes/2024-12-08/audio.mp3",
      "thumbnail": "https://your-r2-url/episodes/2024-12-08/thumb.jpg"
    }
  ]
}
```

### Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier for the episode |
| `title` | Yes | Episode title (Chinese) |
| `description` | No | Short description (Chinese) |
| `date` | Yes | Publication date (YYYY-MM-DD) |
| `duration` | No | Duration string (e.g., "15:32") |
| `audioUrl` | Yes | Full URL to the audio file |
| `thumbnail` | No | URL to thumbnail image |

---

## ⚙️ Configuration

Update `player.js` to point to your R2 bucket:

```javascript
const CONFIG = {
  // Change this to your R2 public URL + manifest.json
  manifestUrl: 'https://audio.onswitch.ca/manifest.json',
  // or: 'https://pub-xxxxx.r2.dev/youtube-audio/manifest.json'
};
```

---

## 🔗 Dedicated URL

After deployment to GitHub Pages, the player will be available at:

```
https://onswitch.ca/tools/audio_player/
```

Your parents can bookmark this URL for easy access.

---

## 📱 Mobile Tips

- **Add to Home Screen**: On iOS/Android, use "Add to Home Screen" for app-like experience
- **Background Playback**: Audio continues playing when phone is locked
- **Download for Offline**: Tap the download button to save for offline listening

---

## 🛠️ Troubleshooting

### Audio won't play
- Check if the audio URL is accessible (test in browser)
- Ensure CORS is configured correctly
- Some mobile browsers require user interaction before playing

### Content doesn't update
- Click the refresh button (🔄) in the header
- Check if manifest.json was updated in R2
- Clear browser cache if needed

### Download doesn't work
- Cross-origin downloads may open in new tab instead
- User can long-press/right-click to save the file

---

## 📁 File Structure

```
tools/audio_player/
├── index.html           # Main page (Chinese only)
├── player.css           # Mobile-first styles
├── player.js            # Audio player logic
├── sample-manifest.json # Sample data for testing
└── README.md            # This file
```

---

## 🔐 Security Notes

- R2 bucket is read-only public access
- No authentication required for playback (simpler for elderly users)
- Upload credentials should be kept secure in your workflow environment
- Never commit `.env` files with credentials
