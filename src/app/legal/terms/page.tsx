'use client';

import { motion } from 'framer-motion';
import { FileText, Shield, Users, Globe, Calendar, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
            <p className="text-gray-300">Please read these terms carefully before using our services</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using TheChessWire.news ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          {/* Key Terms */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Key Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Service</h4>
                <p className="text-gray-300 text-sm">TheChessWire.news platform and all associated features</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">User</h4>
                <p className="text-gray-300 text-sm">Any individual or entity using our Service</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Content</h4>
                <p className="text-gray-300 text-sm">All data, text, graphics, and materials on the platform</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Account</h4>
                <p className="text-gray-300 text-sm">Your registered profile and associated data</p>
              </div>
            </div>
          </div>

          {/* Use License */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Use License</h2>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Permitted Uses</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Access and use the Service for personal, non-commercial purposes</li>
                  <li>• Analyze chess games and improve your skills</li>
                  <li>• Participate in training sessions and challenges</li>
                  <li>• Share content in accordance with our community guidelines</li>
                </ul>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Prohibited Uses</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Violate any applicable laws or regulations</li>
                  <li>• Infringe on intellectual property rights</li>
                  <li>• Harass, abuse, or harm other users</li>
                  <li>• Attempt to gain unauthorized access to our systems</li>
                  <li>• Use automated tools to scrape or collect data</li>
                  <li>• Distribute malware or harmful code</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Accounts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              User Accounts
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Account Creation</h3>
                <p className="text-gray-300">
                  You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Account Responsibilities</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Keep your password secure and confidential</li>
                  <li>• Notify us immediately of any unauthorized access</li>
                  <li>• Ensure your account information remains accurate</li>
                  <li>• Accept responsibility for all activities under your account</li>
                </ul>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Account Termination</h3>
                <p className="text-gray-300">
                  We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
                </p>
              </div>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Our Rights</h3>
                <p className="text-gray-300">
                  The Service and its original content, features, and functionality are owned by TheChessWire.news and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Your Rights</h3>
                <p className="text-gray-300">
                  You retain ownership of content you create and share on our platform. By posting content, you grant us a non-exclusive, worldwide license to use, display, and distribute your content in connection with the Service.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Chess Game Data</h3>
                <p className="text-gray-300">
                  Chess games and moves are not subject to copyright protection. However, our analysis, commentary, and AI-generated content are protected by our intellectual property rights.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy and Data */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Privacy and Data Protection
            </h2>
            
            <p className="text-gray-300 mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Data Collection</h4>
                <p className="text-gray-300 text-sm">We collect data necessary to provide and improve our services</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Data Security</h4>
                <p className="text-gray-300 text-sm">We implement industry-standard security measures</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Data Rights</h4>
                <p className="text-gray-300 text-sm">You have rights to access, correct, and delete your data</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Data Sharing</h4>
                <p className="text-gray-300 text-sm">We do not sell your personal information to third parties</p>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Payment Terms</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Premium Services</h3>
                <p className="text-gray-300">
                  Some features require a premium subscription. All payments are processed securely through our payment partners.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Billing</h3>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Subscriptions are billed in advance on a recurring basis</li>
                  <li>• You may cancel your subscription at any time</li>
                  <li>• Refunds are provided in accordance with our refund policy</li>
                  <li>• Price changes will be communicated in advance</li>
                </ul>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Taxes</h3>
                <p className="text-gray-300">
                  You are responsible for any applicable taxes related to your use of our services.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Disclaimers
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Service Availability</h3>
                <p className="text-gray-300">
                  We strive to maintain high availability but cannot guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Accuracy of Analysis</h3>
                <p className="text-gray-300">
                  While we use advanced AI and chess engines, we cannot guarantee the accuracy of all analysis and recommendations. Use at your own discretion.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Third-Party Content</h3>
                <p className="text-gray-300">
                  We may link to third-party websites and services. We are not responsible for the content or practices of these external sites.
                </p>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            
            <div className="bg-white/5 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                To the maximum extent permitted by law, TheChessWire.news shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              
              <ul className="text-gray-300 space-y-2 ml-6">
                <li>• Loss of profits, data, or business opportunities</li>
                <li>• Damages resulting from use or inability to use the Service</li>
                <li>• Any errors or omissions in content or analysis</li>
                <li>• Unauthorized access to or alteration of your data</li>
                <li>• Any other damages arising from your use of the Service</li>
              </ul>
              
              <p className="text-gray-300 mt-4">
                Our total liability shall not exceed the amount you paid for our services in the 12 months preceding the claim.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Indemnification</h2>
            
            <p className="text-gray-300">
              You agree to indemnify and hold harmless TheChessWire.news, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </div>

          {/* Governing Law */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-400" />
              Governing Law
            </h2>
            
            <p className="text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where TheChessWire.news is incorporated, without regard to conflict of law principles.
            </p>
          </div>

          {/* Dispute Resolution */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Dispute Resolution</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Informal Resolution</h3>
                <p className="text-gray-300">
                  We encourage you to contact us first to resolve any disputes informally before pursuing formal legal action.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Arbitration</h3>
                <p className="text-gray-300">
                  Any disputes that cannot be resolved informally may be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </div>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            
            <p className="text-gray-300">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
            </p>
          </div>

          {/* Severability */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Severability</h2>
            
            <p className="text-gray-300">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-400" />
              Contact Information
            </h2>
            
            <div className="bg-white/5 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-300">
                <p><strong>Email:</strong> legal@thechesswire.news</p>
                <p><strong>Address:</strong> TheChessWire.news, Legal Team</p>
                <p><strong>Support:</strong> support@thechesswire.news</p>
              </div>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="mb-8">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Acknowledgment</h3>
                  <p className="text-blue-300">
                    By using TheChessWire.news, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-white/20">
            <p className="text-gray-400 text-sm">
              These Terms of Service are effective as of {lastUpdated} and apply to all users of TheChessWire.news.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 