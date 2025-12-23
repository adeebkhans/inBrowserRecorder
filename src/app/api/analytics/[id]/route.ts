import { NextRequest, NextResponse } from 'next/server';
import { videoStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analytics = videoStorage.getAnalytics(id);
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'Analytics not found' },
        { status: 404 }
      );
    }

    const avgCompletion = videoStorage.getAverageCompletion(id);

    return NextResponse.json({
      views: analytics.views,
      averageCompletion: avgCompletion,
      totalCompletions: analytics.completionData.length,
      lastViewed: analytics.lastViewed
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
