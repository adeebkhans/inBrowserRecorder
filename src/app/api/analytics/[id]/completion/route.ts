import { NextRequest, NextResponse } from 'next/server';
import { videoStorage } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { percentage } = await request.json();
    
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Invalid percentage' },
        { status: 400 }
      );
    }

    videoStorage.trackCompletion(id, percentage);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track completion' },
      { status: 500 }
    );
  }
}
