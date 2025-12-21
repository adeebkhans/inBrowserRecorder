'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Download, Scissors, Loader2 } from 'lucide-react';

export default function VideoTrimmer() {
  const [videoUrl, setVideoUrl] = useState<string>(() => {
    // Initialize from sessionStorage only on client
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('recordedVideo') || '';
    }
    return '';
  });
  const [trimmedUrl, setTrimmedUrl] = useState<string>('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const trimVideo = async () => {
    if (!videoRef.current || startTime >= endTime) {
      alert('Please select valid start and end times');
      return;
    }

    setIsProcessing(true);
    setProgress('Processing video...');

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();

      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);
      video.muted = true;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const stream = (video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream }).captureStream 
        ? (video as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream() 
        : (video as HTMLVideoElement & { mozCaptureStream: () => MediaStream }).mozCaptureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const trimmedBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(trimmedBlob);
        setTrimmedUrl(url);
        setProgress('Video trimmed successfully!');
        setIsProcessing(false);
        URL.revokeObjectURL(video.src);
      };

      mediaRecorder.start();
      video.currentTime = startTime;
      await video.play();

      const checkTime = setInterval(() => {
        if (video.currentTime >= endTime) {
          clearInterval(checkTime);
          video.pause();
          mediaRecorder.stop();
        }
      }, 100);

    } catch (error) {
      console.error('Error trimming video:', error);
      setProgress('Error: ' + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const downloadVideo = (url: string, filename: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No video to trim</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Go back to recorder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Trim Video</h1>

        {progress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
            {progress}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Original Video</h2>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full rounded-lg border border-gray-300"
          />
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-4">Trim Settings</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time: {formatTime(startTime)}
              </label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={startTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStartTime(val);
                  if (videoRef.current) {
                    videoRef.current.currentTime = val;
                  }
                }}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time: {formatTime(endTime)}
              </label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Selected Duration: {formatTime(Math.max(0, endTime - startTime))}
          </div>

          <button
            onClick={trimVideo}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Trimming...
              </>
            ) : (
              <>
                <Scissors size={20} />
                Trim Video
              </>
            )}
          </button>
        </div>

        {trimmedUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Trimmed Video</h2>
            <video
              src={trimmedUrl}
              controls
              className="w-full rounded-lg border border-gray-300 mb-4"
            />
            
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => downloadVideo(trimmedUrl, `trimmed-${Date.now()}.webm`)}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={20} />
                Download Trimmed Video
              </button>
              <button
                onClick={() => {
                  fetch(trimmedUrl).then(res => res.blob()).then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      sessionStorage.setItem('recordedVideo', reader.result as string);
                      window.location.href = '/upload';
                    };
                    reader.readAsDataURL(blob);
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Upload Trimmed Video
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center"
          >
            Back to Recorder
          </Link>
        </div>
      </div>
    </div>
  );
}
