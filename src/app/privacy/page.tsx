'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Globe, Users } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Data Protection",
      content: "We implement industry-leading encryption and security measures to protect your personal information. All data is encrypted in transit and at rest using AES-256 encryption."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy Controls",
      content: "You have full control over your data. You can view, export, or delete your information at any time through your account settings."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Transparency",
      content: "We are transparent about how we collect, use, and protect your data. This privacy policy explains our practices in clear, understandable terms."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Minimization",
      content: "We only collect the data necessary to provide our services. We do not sell, rent, or share your personal information with third parties."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Standards",
      content: "We comply with GDPR, CCPA, and other international privacy regulations to ensure your rights are protected regardless of your location."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Rights",
      content: "You have the right to access, correct, delete, and port your data. Contact us anytime to exercise these rights."
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">Your privacy and data security are our top priorities</p>
          <p className="text-sm text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div
          className="glass-morphism-dark rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Our Commitment to Privacy</h2>
          <p className="text-gray-300 mb-4">
            At TheChessWire.news, we believe that privacy is a fundamental human right. We are committed to protecting your personal information and ensuring that you have control over your data.
          </p>
          <p className="text-gray-300">
            This privacy policy explains how we collect, use, and protect your information when you use our platform. By using TheChessWire.news, you agree to the collection and use of information in accordance with this policy.
          </p>
        </motion.div>

        {/* Privacy Principles */}
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

        {/* Detailed Policy Sections */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                <p>When you create an account, we collect your email address, username, and password (encrypted). We may also collect your chess rating, preferences, and usage patterns.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Usage Data</h3>
                <p>We collect information about how you use our platform, including games analyzed, features used, and interaction patterns. This helps us improve our services.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Technical Information</h3>
                <p>We collect technical information such as your IP address, browser type, device information, and cookies to ensure security and optimize performance.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Service Provision</h3>
                <p>We use your information to provide, maintain, and improve our chess analysis and AI narration services.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
                <p>We use your preferences and usage patterns to personalize your experience and provide relevant content.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
                <p>We use your information to detect and prevent fraud, abuse, and security threats.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Communication</h3>
                <p>We may use your email address to send you important updates, security alerts, and service notifications.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Encryption</h3>
                <p>All data is encrypted using AES-256 encryption both in transit (TLS 1.3) and at rest. We use industry-standard security protocols to protect your information.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Access Controls</h3>
                <p>We implement strict access controls and authentication measures to ensure only authorized personnel can access your data.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Regular Audits</h3>
                <p>We conduct regular security audits and penetration testing to identify and address potential vulnerabilities.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Access</h3>
                <p>You have the right to access all personal information we hold about you.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Correction</h3>
                <p>You can request corrections to any inaccurate or incomplete information.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Deletion</h3>
                <p>You can request the deletion of your personal information, subject to legal requirements.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Portability</h3>
                <p>You can request a copy of your data in a machine-readable format.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Objection</h3>
                <p>You can object to the processing of your personal information in certain circumstances.</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism-dark rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>• Email: privacy@thechesswire.news</p>
              <p>• Data Protection Officer: dpo@thechesswire.news</p>
              <p>• Data Export/Deletion: <a href="/data-request" className="text-primary-400 hover:text-primary-300">Data Request Tool</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 