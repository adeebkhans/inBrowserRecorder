# Screen Recorder

A browser-based screen recording application with video trimming, sharing, and analytics features.

## Features

### 🎥 Screen Recording
- Record your screen with microphone audio
- High-quality .webm output
- Simple start/stop controls
- Real-time recording status

### ✂️ Video Trimming
- Trim videos to your desired length
- Visual time sliders for precise control
- Preview trimmed result before saving
- Download or share trimmed videos

### 🔗 Easy Sharing
- Upload videos and get shareable links
- Public viewing pages with embedded player
- Copy links to clipboard with one click

### 📊 Analytics
- Track video view counts
- Monitor average watch percentage
- See engagement metrics
- Persistent data across sessions

## How to Use

### Getting Started

1. **Start the Application**
```bash
npm install
npm run dev
```

2. **Open your browser** to [http://localhost:3000](http://localhost:3000)

### Recording a Video

1. Click **"Start Recording"** on the home page
2. Select which screen or window to share
3. Allow microphone access (optional)
4. Click **"Stop Recording"** when finished
5. Preview your recording

### Trimming a Video

1. After recording, click **"Trim Video"**
2. Use the sliders to select start and end times
3. The video preview updates as you adjust
4. Click **"Trim Video"** to process
5. Download or upload your trimmed video

### Sharing Videos

1. Click **"Upload & Share"** after recording
2. Wait for the upload to complete
3. Copy the generated share link
4. Share the link with anyone
5. Videos are publicly accessible via the link

### Viewing Analytics

1. Open any shared video link
2. Analytics are displayed below the video:
   - **Total Views**: Number of times played
   - **Avg Watch %**: Average completion percentage
   - **Engagement**: Total milestone hits (25%, 50%, 75%, 100%)
3. Analytics update in real-time as people watch

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **MediaRecorder API** - Screen recording
- **File-based Storage** - Videos and analytics

## Browser Support

- ✅ Chrome / Edge (Recommended)
- ✅ Firefox
- ⚠️ Safari (Limited MediaRecorder support)

## Storage

Videos are stored locally in:
- `public/uploads/` - Video files
- `data/videos.json` - Video metadata
- `data/analytics.json` - Analytics data

## License

MIT

