'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, Eye, TrendingUp } from 'lucide-react';

interface Analytics {
  views: number;
  averageCompletion: number;
  totalCompletions: number;
  lastViewed?: string;
}

export default function WatchPage() {
  const params = useParams();
  const videoId = params.id as string;
  
  const videoUrl = videoId ? `/uploads/${videoId}.webm` : null;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastMilestoneRef = useRef(0);
  const maxCompletionRef = useRef(0);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    if (!videoId) return;
    
    const loadAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/${videoId}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    };
    
    loadAnalytics();
  }, [videoId]);

  const trackView = async () => {
    if (hasTrackedView) return;
    
    try {
      await fetch(`/api/analytics/${videoId}/view`, {
        method: 'POST'
      });
      setHasTrackedView(true);
      // Refresh analytics
      const response = await fetch(`/api/analytics/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  const trackCompletion = (percentage: number) => {
    // Track the maximum completion reached during this view session
    if (percentage > maxCompletionRef.current) {
      maxCompletionRef.current = Math.min(Math.round(percentage), 100);
    }
  };

  const sendFinalCompletion = async () => {
    if (hasEndedRef.current || maxCompletionRef.current === 0) return;
    hasEndedRef.current = true;
    
    try {
      await fetch(`/api/analytics/${videoId}/completion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: maxCompletionRef.current })
      });
    } catch (err) {
      console.error('Failed to track completion:', err);
    }
  };

  const handlePlay = () => {
    trackView();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      trackCompletion(percentage);
    }
  };

  const handlePause = () => {
    sendFinalCompletion();
  };

  const handleEnded = () => {
    maxCompletionRef.current = 100;
    sendFinalCompletion();
  };

  const handleError = () => {
    setError('Failed to load video. It may not exist or has been deleted.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Video Player */}
          <div className="bg-black aspect-video">
            {error ? (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Play size={64} className="mx-auto mb-4 opacity-50" />
                  <p>{error}</p>
                </div>
              </div>
            ) : videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                onEnded={handleEnded}
                onError={handleError}
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Play size={64} className="mx-auto mb-4 opacity-50 animate-pulse" />
                  <p>Loading video...</p>
                </div>
              </div>
            )}
          </div>

          {/* Analytics Section */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              Recorded Video
            </h1>

            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="text-blue-500" size={20} />
                    <span className="font-semibold text-gray-700">Total Views</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.views}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Times played</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-500" size={20} />
                    <span className="font-semibold text-gray-700">Avg Watch %</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.averageCompletion}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Average completion</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="text-purple-500" size={20} />
                    <span className="font-semibold text-gray-700">Engagement</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics.totalCompletions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Milestone hits</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Record Your Own Video
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
