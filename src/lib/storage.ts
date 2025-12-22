import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(VIDEOS_FILE)) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({}));
}

export interface Video {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  shareLink: string;
}

export interface Analytics {
  videoId: string;
  views: number;
  completionData: number[]; // Array of max completion percentage per view session
  lastViewed?: string;
}

export class VideoStorage {
  private readVideos(): Video[] {
    const data = fs.readFileSync(VIDEOS_FILE, 'utf-8');
    return JSON.parse(data);
  }

  private writeVideos(videos: Video[]): void {
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
  }

  private readAnalytics(): Record<string, Analytics> {
    const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  }

  private writeAnalytics(analytics: Record<string, Analytics>): void {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  }

  generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  async saveVideo(buffer: Buffer, originalName: string): Promise<Video> {
    const id = this.generateId();
    const ext = path.extname(originalName) || '.webm';
    const filename = `${id}${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Save file
    fs.writeFileSync(filepath, buffer);

    // Create video metadata
    const video: Video = {
      id,
      filename,
      originalName,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
      shareLink: `/watch/${id}`
    };

    // Save to videos.json
    const videos = this.readVideos();
    videos.push(video);
    this.writeVideos(videos);

    // Initialize analytics
    const analytics = this.readAnalytics();
    analytics[id] = {
      videoId: id,
      views: 0,
      completionData: []
    };
    this.writeAnalytics(analytics);

    return video;
  }

  getVideo(id: string): Video | null {
    const videos = this.readVideos();
    return videos.find(v => v.id === id) || null;
  }

  getAllVideos(): Video[] {
    return this.readVideos();
  }

  getAnalytics(videoId: string): Analytics | null {
    const analytics = this.readAnalytics();
    return analytics[videoId] || null;
  }

  incrementView(videoId: string): void {
    const analytics = this.readAnalytics();
    if (analytics[videoId]) {
      analytics[videoId].views += 1;
      analytics[videoId].lastViewed = new Date().toISOString();
      this.writeAnalytics(analytics);
    }
  }

  trackCompletion(videoId: string, percentage: number): void {
    const analytics = this.readAnalytics();
    if (analytics[videoId]) {
      analytics[videoId].completionData.push(percentage);
      this.writeAnalytics(analytics);
    }
  }

  getAverageCompletion(videoId: string): number {
    const analytics = this.getAnalytics(videoId);
    if (!analytics || analytics.completionData.length === 0) {
      return 0;
    }
    const sum = analytics.completionData.reduce((a, b) => a + b, 0);
    return Math.round(sum / analytics.completionData.length);
  }
}

export const videoStorage = new VideoStorage();
