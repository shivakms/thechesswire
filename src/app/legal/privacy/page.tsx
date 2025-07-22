'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, Users, Globe, Calendar, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = 'December 15, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-300">Your privacy is our priority</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              TheChessWire.news ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-400" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Email address and password for account creation</li>
                  <li>• Username and profile information</li>
                  <li>• Chess rating and playing history</li>
                  <li>• Communication preferences</li>
                  <li>• Payment information (processed securely by Stripe)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Games played and analysis performed</li>
                  <li>• Training sessions and progress data</li>
                  <li>• Feature usage and interaction patterns</li>
                  <li>• Device information and browser type</li>
                  <li>• IP address and location data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Technical Information</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Cookies and similar tracking technologies</li>
                  <li>• Log files and server analytics</li>
                  <li>• Performance and error data</li>
                  <li>• Security event logs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-400" />
              How We Use Your Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Service Provision</h3>
                <p className="text-gray-300 text-sm">
                  To provide and maintain our chess analysis, training, and content services.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
                <p className="text-gray-300 text-sm">
                  To personalize your experience and provide relevant content and recommendations.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Communication</h3>
                <p className="text-gray-300 text-sm">
                  To send you important updates, newsletters, and marketing communications.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
                <p className="text-gray-300 text-sm">
                  To protect against fraud, abuse, and security threats.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                <p className="text-gray-300 text-sm">
                  To analyze usage patterns and improve our services.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Legal Compliance</h3>
                <p className="text-gray-300 text-sm">
                  To comply with legal obligations and enforce our terms of service.
                </p>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Information Sharing
            </h2>
            
            <p className="text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• <strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li>• <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li>• <strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-400" />
              Data Security
            </h2>
            
            <div className="bg-white/5 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                We implement comprehensive security measures to protect your information:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Encryption</h4>
                  <p className="text-gray-300 text-sm">All data is encrypted in transit and at rest using industry-standard protocols.</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Access Controls</h4>
                  <p className="text-gray-300 text-sm">Strict access controls and authentication mechanisms protect your data.</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Regular Audits</h4>
                  <p className="text-gray-300 text-sm">We conduct regular security audits and vulnerability assessments.</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Incident Response</h4>
                  <p className="text-gray-300 text-sm">We have procedures in place to respond to security incidents.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights (GDPR) */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-400" />
              Your Rights (GDPR)
            </h2>
            
            <p className="text-gray-300 mb-4">
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Right to Access</h4>
                <p className="text-gray-300 text-sm">Request a copy of your personal data.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Right to Rectification</h4>
                <p className="text-gray-300 text-sm">Correct inaccurate or incomplete data.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Right to Erasure</h4>
                <p className="text-gray-300 text-sm">Request deletion of your personal data.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Right to Portability</h4>
                <p className="text-gray-300 text-sm">Receive your data in a structured format.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Right to Object</h4>
                <p className="text-gray-300 text-sm">Object to processing of your data.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Right to Restriction</h4>
                <p className="text-gray-300 text-sm">Limit how we process your data.</p>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
            
            <p className="text-gray-300 mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Essential Cookies</h4>
                <p className="text-gray-300 text-sm">Required for basic functionality and security.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Analytics Cookies</h4>
                <p className="text-gray-300 text-sm">Help us understand how you use our platform.</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Preference Cookies</h4>
                <p className="text-gray-300 text-sm">Remember your settings and preferences.</p>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            
            <p className="text-gray-300 mb-4">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            
            <ul className="text-gray-300 space-y-2 ml-6">
              <li>• <strong>Account Data:</strong> Until you delete your account or request deletion</li>
              <li>• <strong>Usage Data:</strong> For up to 3 years for analytics and improvement</li>
              <li>• <strong>Payment Data:</strong> As required by financial regulations</li>
              <li>• <strong>Security Logs:</strong> For up to 1 year for security monitoring</li>
            </ul>
          </div>

          {/* International Transfers */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">International Data Transfers</h2>
            
            <p className="text-gray-300">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            
            <p className="text-gray-300">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </div>

          {/* Changes to Privacy Policy */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
            
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-400" />
              Contact Us
            </h2>
            
            <div className="bg-white/5 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-300">
                <p><strong>Email:</strong> privacy@thechesswire.news</p>
                <p><strong>Address:</strong> TheChessWire.news, Privacy Team</p>
                <p><strong>Data Protection Officer:</strong> dpo@thechesswire.news</p>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>EU Representative:</strong> For EU residents, you may also contact our EU representative for GDPR-related inquiries.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-white/20">
            <p className="text-gray-400 text-sm">
              This Privacy Policy is effective as of {lastUpdated} and applies to all users of TheChessWire.news.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 