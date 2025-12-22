import { NextRequest, NextResponse } from 'next/server';
import { videoStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save video
    const video = await videoStorage.saveVideo(buffer, file.name);

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        shareLink: video.shareLink,
        filename: video.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const videos = videoStorage.getAllVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
