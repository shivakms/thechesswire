"use client";

import React from 'react';
import YouTubeDocumentaryStudio from '@/components/video/YouTubeDocumentaryStudio';
import { YouTubeDocumentary } from '@/lib/video/YouTubeDocumentaryGenerator';
import { YouTubeUploadResult } from '@/lib/video/YouTubeUploader';

export default function YouTubeDocumentariesPage() {
  const handleDocumentaryGenerated = (documentary: YouTubeDocumentary) => {
    console.log('Documentary generated:', documentary);
  };

  const handleUploadComplete = (result: YouTubeUploadResult) => {
    console.log('Upload completed:', result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <YouTubeDocumentaryStudio
        onDocumentaryGenerated={handleDocumentaryGenerated}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
