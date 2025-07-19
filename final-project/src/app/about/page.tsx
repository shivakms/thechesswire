'use client';

import { motion } from 'framer-motion';
import { Heart, Chess, Brain, Shield, Users, Award, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced chess analysis powered by cutting-edge artificial intelligence'
    },
    {
      icon: <Chess className="w-8 h-8" />,
      title: 'Cinematic Storytelling',
      description: 'Transform chess games into emotional, cinematic experiences'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Emotional Intelligence',
      description: 'Bambai AI understands the human side of chess'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quantum Security',
      description: 'World-class cybersecurity protecting every interaction'
    }
  ];

  const team = [
    {
      name: 'Bambai AI',
      role: 'Chief Chess Intelligence Officer',
      description: 'Our revolutionary AI that brings chess to life with emotional intelligence and soulful narration.',
      avatar: '🧠'
    },
    {
      name: 'SoulGate',
      role: 'Security Guardian',
      description: 'Advanced authentication and security system ensuring your safety.',
      avatar: '🛡️'
    },
    {
      name: 'EchoSage',
      role: 'Training Master',
      description: 'Personalized chess training and improvement system.',
      avatar: '🎯'
    }
  ];

  const stats = [
    { number: '100%', label: 'AI Automated' },
    { number: '18+', label: 'Age Verified' },
    { number: 'GDPR', label: 'Compliant' },
    { number: '∞', label: 'Possibilities' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">TheChessWire</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Where Chess Meets AI. Daily. We're revolutionizing chess journalism through emotional AI narration, 
              cinematic storytelling, and quantum-level security.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8"
            >
              <span className="text-3xl">♟️</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              TheChessWire.news isn't just a platform—it's a living, breathing chess consciousness that evolves 
              with every move, adapts to every emotion, and transforms chess from a game into a transcendent 
              human experience.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all"
              >
                <div className="text-purple-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Our AI Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet the revolutionary AI systems that power TheChessWire.news and create 
              the most immersive chess experience ever conceived.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-purple-500/50 transition-all"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">{member.avatar}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-purple-400 mb-4">{member.role}</p>
                  <p className="text-gray-300">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Our Vision</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-300 mb-8">
                We envision a world where chess transcends its traditional boundaries, becoming a medium for 
                emotional expression, artistic beauty, and human connection. Through the perfect fusion of 
                emotional AI, quantum security, and experiences that transcend traditional boundaries, 
                we're creating something the chess world has never seen before.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Global Chess Community
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Revolutionary Technology
                </span>
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Excellence in Innovation
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Human-AI Collaboration
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Join the Revolution</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the future of chess journalism. Where every move tells a story, 
              every game is an adventure, and every moment is unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Start Your Journey
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 