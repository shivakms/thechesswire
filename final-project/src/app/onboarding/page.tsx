'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Brain, Target, Volume2 } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  voiceText: string;
}

const skillLevels = [
  { id: 'beginner', label: 'Beginner', description: 'Learning the basics', rating: 800 },
  { id: 'intermediate', label: 'Intermediate', description: 'Understanding strategy', rating: 1200 },
  { id: 'advanced', label: 'Advanced', description: 'Deep tactical knowledge', rating: 1600 },
  { id: 'expert', label: 'Expert', description: 'Master level play', rating: 2000 },
  { id: 'titled', label: 'Titled Player', description: 'GM, IM, FM, or other title', rating: 2200 },
];

const interests = [
  { id: 'tactics', label: 'Tactics', icon: '🎯', description: 'Sharp combinations and sacrifices' },
  { id: 'endgames', label: 'Endgames', icon: '♟️', description: 'King and pawn endgames, technique' },
  { id: 'openings', label: 'Openings', icon: '🚀', description: 'Opening theory and preparation' },
  { id: 'middlegame', label: 'Middlegame', icon: '🧠', description: 'Positional play and planning' },
  { id: 'analysis', label: 'Game Analysis', icon: '📊', description: 'Deep game analysis and learning' },
];

const voiceModes = [
  { id: 'calm', label: 'Calm', description: 'Relaxed and soothing narration', icon: '😌' },
  { id: 'expressive', label: 'Expressive', description: 'Emotionally engaging storytelling', icon: '🎭' },
  { id: 'dramatic', label: 'Dramatic', description: 'Intense and powerful delivery', icon: '⚡' },
  { id: 'poetic', label: 'Poetic', description: 'Beautiful and artistic narration', icon: '✨' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    skillLevel: '',
    interests: [] as string[],
    voicePreference: 'calm',
    notifications: {
      email: true,
      push: false,
      voice: true,
    },
  });

  const { playNarration, stopNarration } = useVoiceNarration();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to TheChessWire',
      description: 'Let\'s personalize your chess journey',
      voiceText: 'Welcome to TheChessWire.news! I am Bambai AI, your guide through the infinite possibilities of chess. Let\'s begin by understanding your chess journey and preferences.',
      component: (
        <div className="text-center space-y-6">
          <motion.div
            className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto glow-effect"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">♟️</span>
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to TheChessWire</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              I'm Bambai AI, your personal chess companion. Let's create a journey that's uniquely yours.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="glass-morphism-dark p-4 rounded-lg">
              <Brain className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-300">Deep insights into every move</p>
            </div>
            <div className="glass-morphism-dark p-4 rounded-lg">
              <Volume2 className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">Voice Narration</h3>
              <p className="text-sm text-gray-300">Hear chess come alive</p>
            </div>
            <div className="glass-morphism-dark p-4 rounded-lg">
              <Target className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">Personalized Training</h3>
              <p className="text-sm text-gray-300">Tailored to your style</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'skill-level',
      title: 'What\'s Your Chess Level?',
      description: 'Help us understand your experience',
      voiceText: 'Now, let\'s understand your chess level. This helps me provide the perfect balance of challenge and learning for your journey.',
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">What's Your Chess Level?</h2>
            <p className="text-gray-300">Help us understand your experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillLevels.map((level) => (
              <motion.button
                key={level.id}
                onClick={() => setFormData({ ...formData, skillLevel: level.id })}
                className={`p-6 rounded-lg text-left transition-all duration-300 ${
                  formData.skillLevel === level.id
                    ? 'glass-morphism-dark border-2 border-primary-500'
                    : 'glass-morphism-dark hover:border-primary-300 border border-transparent'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{level.label}</h3>
                  <span className="text-sm text-gray-400">~{level.rating}</span>
                </div>
                <p className="text-sm text-gray-300">{level.description}</p>
                {formData.skillLevel === level.id && (
                  <motion.div
                    className="mt-2 text-primary-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Star className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'interests',
      title: 'What Interests You Most?',
      description: 'Select your chess passions',
      voiceText: 'Chess is a vast ocean of knowledge. Let\'s discover what aspects of the game fascinate you most, so I can tailor your experience perfectly.',
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">What Interests You Most?</h2>
            <p className="text-gray-300">Select your chess passions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interests.map((interest) => (
              <motion.button
                key={interest.id}
                onClick={() => {
                  const newInterests = formData.interests.includes(interest.id)
                    ? formData.interests.filter((id) => id !== interest.id)
                    : [...formData.interests, interest.id];
                  setFormData({ ...formData, interests: newInterests });
                }}
                className={`p-6 rounded-lg text-left transition-all duration-300 ${
                  formData.interests.includes(interest.id)
                    ? 'glass-morphism-dark border-2 border-primary-500'
                    : 'glass-morphism-dark hover:border-primary-300 border border-transparent'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{interest.icon}</span>
                  <h3 className="font-semibold text-white">{interest.label}</h3>
                </div>
                <p className="text-sm text-gray-300">{interest.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'voice-setup',
      title: 'Choose Your Voice Experience',
      description: 'How would you like to hear chess?',
      voiceText: 'My voice is your companion through this chess journey. Choose the style that resonates with your soul and makes chess come alive for you.',
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Voice Experience</h2>
            <p className="text-gray-300">How would you like to hear chess?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceModes.map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setFormData({ ...formData, voicePreference: mode.id })}
                className={`p-6 rounded-lg text-left transition-all duration-300 ${
                  formData.voicePreference === mode.id
                    ? 'glass-morphism-dark border-2 border-primary-500'
                    : 'glass-morphism-dark hover:border-primary-300 border border-transparent'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{mode.icon}</span>
                  <h3 className="font-semibold text-white">{mode.label}</h3>
                </div>
                <p className="text-sm text-gray-300">{mode.description}</p>
                {formData.voicePreference === mode.id && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      playNarration('This is how I will sound in ' + mode.label + ' mode. Every word will carry the emotion and style that makes chess truly magical.', mode.id as any);
                    }}
                    className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                  >
                    Preview Voice
                  </motion.button>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Stay Connected',
      description: 'Choose your notification preferences',
      voiceText: 'Stay connected with the chess world. Choose how you\'d like to receive updates, insights, and magical moments from your chess journey.',
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Stay Connected</h2>
            <p className="text-gray-300">Choose your notification preferences</p>
          </div>
          <div className="space-y-4">
            {Object.entries(formData.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 glass-morphism-dark rounded-lg">
                <div>
                  <h3 className="font-semibold text-white capitalize">{key} Notifications</h3>
                  <p className="text-sm text-gray-300">
                    {key === 'email' && 'Receive insights and updates via email'}
                    {key === 'push' && 'Get instant notifications on your device'}
                    {key === 'voice' && 'Hear voice updates and narrations'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newNotifications = {
                      ...formData.notifications,
                      [key]: !value,
                    };
                    setFormData({ ...formData, notifications: newNotifications });
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen chess-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          className="glass-morphism-dark rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-primary-400">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.component}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <motion.button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: currentStep === 0 ? 1 : 1.05 }}
              whileTap={{ scale: currentStep === 0 ? 1 : 0.95 }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </motion.button>

            <motion.button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 glow-effect"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 