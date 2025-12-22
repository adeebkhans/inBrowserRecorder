'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, Loader2, Link as LinkIcon, Copy, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    const savedVideo = sessionStorage.getItem('recordedVideo');
    if (!savedVideo) {
      setError('No video found to upload');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Convert data URL to blob
      const response = await fetch(savedVideo);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('video', blob, `recording-${Date.now()}.webm`);

      // Upload
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const data = await uploadResponse.json();
      
      const fullLink = `${window.location.origin}${data.video.shareLink}`;
      setShareLink(fullLink);
      setUploadSuccess(true);
      
      // Clear sessionStorage
      sessionStorage.removeItem('recordedVideo');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload & Share</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
              {error}
            </div>
          )}

          {!uploadSuccess ? (
            <div className="text-center">
              <div className="mb-6">
                <Upload size={64} className="mx-auto text-blue-500 mb-4" />
                <p className="text-gray-600 mb-4">
                  Upload your recorded video to generate a shareable link
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Video
                  </>
                )}
              </button>

              <div className="mt-6">
                <Link
                  href="/"
                  className="text-blue-500 hover:underline"
                >
                  Back to Recorder
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Upload Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your video has been uploaded. Share the link below:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon size={20} className="text-gray-500" />
                  <span className="font-semibold text-gray-700">Share Link:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  View Video
                </a>
                <Link
                  href="/"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Record Another
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
