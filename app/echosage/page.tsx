import React from 'react';
import EchoSageStudio from '@/components/training/EchoSageStudio';

export default function EchoSagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <EchoSageStudio />
    </div>
  );
}

export const metadata = {
  title: 'EchoSage Training Studio | TheChessWire.news',
  description: 'Advanced chess training with AI-powered emotional analysis, ghost opponents, and personalized coaching. Develop your skills with humanlike AI training partners.',
  keywords: 'chess, training, AI, coaching, emotional analysis, ghost opponents, EchoSage, skill development',
};
