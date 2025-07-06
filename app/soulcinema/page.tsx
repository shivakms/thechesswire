import React from 'react';
import SoulCinemaStudio from '@/components/video/SoulCinemaStudio';

export default function SoulCinemaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SoulCinemaStudio />
    </div>
  );
}

export const metadata = {
  title: 'SoulCinema Studio | TheChessWire.news',
  description: 'Transform chess games into cinematic masterpieces with AI-powered storytelling and automated social media distribution.',
  keywords: 'chess, video, AI, storytelling, SoulCinema, automation, social media',
};
