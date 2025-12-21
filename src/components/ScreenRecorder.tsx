'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Square, Download, Scissors, Upload } from 'lucide-react';

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [status, setStatus] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      setStatus('Requesting screen access...');
      
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      // Request microphone
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        console.warn('Microphone access denied, recording without audio');
      }

      // Combine streams
      const tracks = [
        ...displayStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : [])
      ];
      
      const combinedStream = new MediaStream(tracks);

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('Recording saved! You can now trim or upload.');
        
        // Stop all tracks
        combinedStream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1s chunks
      setIsRecording(true);
      setStatus('Recording...');
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('Error: ' + (error as Error).message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadVideo = () => {
    if (!recordedBlob) return;
    
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateToTrim = () => {
    if (!recordedBlob) return;
    
    // Store blob in sessionStorage (for demo purposes - in production use a better method)
    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem('recordedVideo', reader.result as string);
      window.location.href = '/trim';
    };
    reader.readAsDataURL(recordedBlob);
  };

  const navigateToUpload = () => {
    if (!recordedBlob) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem('recordedVideo', reader.result as string);
      window.location.href = '/upload';
    };
    reader.readAsDataURL(recordedBlob);
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Screen Recorder</h1>
        
        {/* Status */}
        {status && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
            {status}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play size={20} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Square size={20} />
              Stop Recording
            </button>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Preview</h2>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full rounded-lg border border-gray-300"
            />
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={downloadVideo}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={navigateToTrim}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Scissors size={18} />
                Trim Video
              </button>
              <button
                onClick={navigateToUpload}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Upload size={18} />
                Upload & Share
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isRecording && !videoUrl && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">How to use:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Click &quot;Start Recording&quot; to begin</li>
              <li>Select which screen/window to share</li>
              <li>Allow microphone access for audio (optional)</li>
              <li>Click &quot;Stop Recording&quot; when done</li>
              <li>Preview, trim, or upload your recording</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
