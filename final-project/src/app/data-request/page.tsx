'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Eye, Shield, FileText, CheckCircle } from 'lucide-react';

export default function DataRequestPage() {
  const [requestType, setRequestType] = useState<'export' | 'delete'>('export');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const requestTypes = [
    {
      id: 'export',
      title: 'Export My Data',
      description: 'Download a copy of all your personal data',
      icon: <Download className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'delete',
      title: 'Delete My Data',
      description: 'Permanently remove your account and all associated data',
      icon: <Trash2 className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500'
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
          <h1 className="text-4xl font-bold text-white mb-4">Data Request</h1>
          <p className="text-xl text-gray-300">Exercise your data rights under GDPR and other privacy regulations</p>
        </motion.div>

        {!isSubmitted ? (
          <>
            {/* Request Type Selection */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Request Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requestTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setRequestType(type.id as 'export' | 'delete')}
                    className={`p-6 rounded-2xl text-left transition-all duration-300 ${
                      requestType === type.id
                        ? 'glass-morphism-dark border-2 border-primary-500'
                        : 'glass-morphism-dark hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center`}>
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{type.title}</h3>
                        <p className="text-sm text-gray-300">{type.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Request Form */}
            <motion.div
              className="glass-morphism-dark rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {requestType === 'export' ? 'Data Export Request' : 'Data Deletion Request'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your registered email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Request
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows={4}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Please explain why you are making this request..."
                  />
                </div>

                {/* Warning for deletion */}
                {requestType === 'delete' && (
                  <motion.div
                    className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="font-semibold text-red-400">Important Warning</h3>
                    </div>
                    <p className="text-red-300 text-sm">
                      Data deletion is permanent and irreversible. This will remove your account, 
                      all your chess games, analysis, and personal data. This action cannot be undone.
                    </p>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Processing Request...</span>
                    </div>
                  ) : (
                    `Submit ${requestType === 'export' ? 'Export' : 'Deletion'} Request`
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Information Section */}
            <motion.div
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="glass-morphism-dark rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Transparency</h3>
                <p className="text-sm text-gray-300">We process all data requests within 30 days as required by GDPR</p>
              </div>

              <div className="glass-morphism-dark rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Security</h3>
                <p className="text-sm text-gray-300">All requests are verified and processed securely to protect your privacy</p>
              </div>

              <div className="glass-morphism-dark rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Compliance</h3>
                <p className="text-sm text-gray-300">We comply with GDPR, CCPA, and other international privacy regulations</p>
              </div>
            </motion.div>
          </>
        ) : (
          /* Success Message */
          <motion.div
            className="glass-morphism-dark rounded-2xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Request Submitted Successfully</h2>
            <p className="text-gray-300 mb-6">
              We have received your {requestType === 'export' ? 'data export' : 'data deletion'} request. 
              You will receive a confirmation email shortly with further instructions.
            </p>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-300 space-y-1 text-left">
                <li>• We will verify your identity within 24 hours</li>
                <li>• Your request will be processed within 30 days</li>
                <li>• You will receive updates via email</li>
                {requestType === 'export' && (
                  <li>• Your data will be provided in a machine-readable format</li>
                )}
                {requestType === 'delete' && (
                  <li>• Your account will be permanently deleted after verification</li>
                )}
              </ul>
            </div>

            <motion.button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                setReason('');
              }}
              className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Another Request
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Import AlertTriangle for the warning section
import { AlertTriangle } from 'lucide-react'; 