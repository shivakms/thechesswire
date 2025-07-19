'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/verify-email/${verificationToken}`, {
        method: 'GET',
      });

      if (response.ok) {
        setVerificationStatus('success');
        toast.success('Email verified successfully!');
      } else {
        setVerificationStatus('error');
        toast.error('Email verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      toast.error('Email verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchParams.get('email') }),
      });

      if (response.ok) {
        toast.success('Verification email sent!');
        setCountdown(60); // 60 second cooldown
      } else {
        toast.error('Failed to send verification email');
      }
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusContent = () => {
    switch (verificationStatus) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-400" />,
          title: 'Email Verified Successfully!',
          description: 'Your email has been verified. You can now access all features of TheChessWire.news.',
          buttonText: 'Continue to Dashboard',
          buttonAction: () => window.location.href = '/dashboard',
          color: 'text-green-400'
        };
      case 'error':
        return {
          icon: <XCircle className="w-16 h-16 text-red-400" />,
          title: 'Verification Failed',
          description: 'The verification link is invalid or has expired. Please request a new verification email.',
          buttonText: 'Request New Verification',
          buttonAction: resendVerification,
          color: 'text-red-400'
        };
      default:
        return {
          icon: <Mail className="w-16 h-16 text-primary-400" />,
          title: 'Verifying Your Email...',
          description: 'Please wait while we verify your email address.',
          buttonText: '',
          buttonAction: () => {},
          color: 'text-primary-400'
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen chess-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          className="glass-morphism-dark rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ 
                scale: verificationStatus === 'pending' ? [1, 1.1, 1] : 1,
                rotate: verificationStatus === 'pending' ? [0, 360] : 0
              }}
              transition={{ 
                scale: { duration: 2, repeat: verificationStatus === 'pending' ? Infinity : 0 },
                rotate: { duration: 3, repeat: verificationStatus === 'pending' ? Infinity : 0, ease: "linear" }
              }}
            >
              {verificationStatus === 'pending' && isLoading ? (
                <RefreshCw className="w-8 h-8 text-primary-400" />
              ) : (
                statusContent.icon
              )}
            </motion.div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {statusContent.title}
            </h1>
            <p className="text-gray-300">
              {statusContent.description}
            </p>
          </div>

          {/* Status Indicator */}
          {verificationStatus === 'pending' && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}

          {/* Action Button */}
          {statusContent.buttonText && (
            <motion.button
              onClick={statusContent.buttonAction}
              disabled={isLoading || countdown > 0}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-effect flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Processing...</span>
                </>
              ) : countdown > 0 ? (
                <span>Wait {countdown}s</span>
              ) : (
                <>
                  <span>{statusContent.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          )}

          {/* Additional Options */}
          {verificationStatus === 'error' && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-400 text-sm mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => window.location.href = '/auth/gateway'}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Back to Login
              </button>
            </motion.div>
          )}

          {/* Success Actions */}
          {verificationStatus === 'success' && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/onboarding'}
                  className="w-full bg-gray-700 text-white font-medium py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Complete Onboarding
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-gray-700 text-white font-medium py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 text-xs">
            🔐 Your security is our priority. All verification links expire after 24 hours.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 