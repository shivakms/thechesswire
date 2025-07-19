'use client';

import { motion } from 'framer-motion';
import { FileText, Shield, Users, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Acceptance of Terms",
      content: "By accessing and using TheChessWire.news, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security Requirements",
      content: "You must not attempt to gain unauthorized access to our systems or interfere with the security features of the platform."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Compliance",
      content: "You agree to comply with all applicable laws and regulations in your use of our services."
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Prohibited Activities",
      content: "You may not use our services for any illegal, harmful, or unauthorized purposes."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Fair Use",
      content: "You agree to use our services in a manner consistent with fair use policies and community guidelines."
    }
  ];

  return (
    <div className="min-h-screen chess-gradient-dark">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">Please read these terms carefully before using our platform</p>
          <p className="text-sm text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div
          className="glass-morphism-dark rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Agreement to Terms</h2>
          <p className="text-gray-300 mb-4">
            These Terms of Service ("Terms") govern your use of TheChessWire.news ("Service") operated by TheChessWire ("we," "us," or "our").
          </p>
          <p className="text-gray-300">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
          </p>
        </motion.div>

        {/* Key Terms */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="glass-morphism-dark rounded-xl p-6"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-primary-400">
                  {section.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              </div>
              <p className="text-gray-300">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Terms */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Use of Service</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Eligibility</h3>
                <p>You must be at least 18 years old to use our Service as required by GDPR regulations.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Registration</h3>
                <p>You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Acceptable Use</h3>
                <p>You agree to use our Service only for lawful purposes and in accordance with these Terms. You may not use the Service to transmit harmful, offensive, or inappropriate content.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Intellectual Property</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Our Rights</h3>
                <p>The Service and its original content, features, and functionality are owned by TheChessWire and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Content</h3>
                <p>You retain ownership of any content you submit to our Service. By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, and distribute your content.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Chess Games</h3>
                <p>Chess games and positions are not subject to copyright. However, our analysis, commentary, and AI-generated content are protected by intellectual property rights.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Privacy and Data</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Privacy Policy</h3>
                <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Security</h3>
                <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Usage</h3>
                <p>We may use anonymized data to improve our AI models, voice systems, and overall service quality. Your personal information is never sold to third parties.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Activities</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Security Violations</h3>
                <p>You may not attempt to gain unauthorized access to our systems, interfere with security features, or use automated tools to access the Service.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Abuse and Harassment</h3>
                <p>You may not use our Service to harass, abuse, or harm others. This includes sending spam, making threats, or engaging in discriminatory behavior.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Cheating and Fair Play</h3>
                <p>You may not use external assistance, engines, or other tools during chess analysis or training sessions. Fair play is essential to our community.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Service Availability</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Uptime</h3>
                <p>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We may perform maintenance or updates that temporarily affect availability.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Service Changes</h3>
                <p>We reserve the right to modify, suspend, or discontinue any part of our Service at any time with reasonable notice to users.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Limitations</h3>
                <p>Our Service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Termination</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Termination</h3>
                <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Retention</h3>
                <p>Upon termination, your right to use the Service will cease immediately. We may retain certain information as required by law or for legitimate business purposes.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Survival</h3>
                <p>Provisions of these Terms that by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, and limitations of liability.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Information</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>• Email: legal@thechesswire.news</p>
              <p>• Terms Questions: terms@thechesswire.news</p>
              <p>• General Support: support@thechesswire.news</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 