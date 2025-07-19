'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useVoiceNarration } from '@/hooks/useVoiceNarration';
import toast from 'react-hot-toast';

interface VerificationStatus {
  status: 'pending' | 'verifying' | 'success' | 'error' | 'expired';
  message: string;
}

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'pending',
    message: 'Checking verification status...'
  });
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playNarration } = useVoiceNarration();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus({
        status: 'error',
        message: 'No verification token provided'
      });
    }
  }, [token]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmail = async (verificationToken: string) => {
    setVerificationStatus({
      status: 'verifying',
      message: 'Verifying your email address...'
    });

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus({
          status: 'success',
          message: 'Email verified successfully! Welcome to TheChessWire.'
        });
        
        // Play success narration
        playNarration(
          'Congratulations! Your email has been verified successfully. Welcome to TheChessWire, where chess meets artificial intelligence. Your journey begins now.',
          'expressive'
        );

        // Redirect to onboarding after 3 seconds
        setTimeout(() => {
          router.push('/onboarding');
        }, 3000);
      } else {
        if (data.error === 'token_expired') {
          setVerificationStatus({
            status: 'expired',
            message: 'Verification link has expired. Please request a new one.'
          });
        } else {
          setVerificationStatus({
            status: 'error',
            message: data.message || 'Verification failed. Please try again.'
          });
        }
      }
    } catch (error) {
      setVerificationStatus({
        status: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    }
  };

  const resendVerification = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification email sent! Check your inbox.');
        setCountdown(60); // 60 second cooldown
      } else {
        toast.error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'verifying':
        return <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />;
      default:
        return <Mail className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus.status) {
      case 'success':
        return 'text-green-500';
      case 'error':
      case 'expired':
        return 'text-red-500';
      case 'verifying':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

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
              className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-effect"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-2xl">♟️</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Email Verification
            </h1>
            <p className="text-gray-300">
              {verificationStatus.status === 'pending' && 'Verifying your email address...'}
              {verificationStatus.status === 'verifying' && 'Please wait while we verify your email...'}
              {verificationStatus.status === 'success' && 'Your email has been verified!'}
              {verificationStatus.status === 'error' && 'Verification failed'}
              {verificationStatus.status === 'expired' && 'Verification link expired'}
            </p>
          </div>

          {/* Status Display */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {getStatusIcon()}
            </motion.div>
            
            <motion.p
              className={`mt-4 text-lg font-medium ${getStatusColor()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {verificationStatus.message}
            </motion.p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {verificationStatus.status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <p className="text-gray-300 mb-4">
                  Redirecting to onboarding...
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}

            {(verificationStatus.status === 'error' || verificationStatus.status === 'expired') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-4"
              >
                <button
                  onClick={resendVerification}
                  disabled={isResending || countdown > 0}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </div>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>

                <button
                  onClick={() => router.push('/auth/gateway')}
                  className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  <div className="flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Login
                  </div>
                </button>
              </motion.div>
            )}

            {verificationStatus.status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Help Section */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-sm font-medium text-gray-300 mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Check your spam/junk folder</p>
              <p>• Make sure you're using the correct email address</p>
              <p>• Contact support if you continue having issues</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 