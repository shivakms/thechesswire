'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  
  const router = useRouter();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setEmail(data.email);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        if (result.error === 'user_not_found') {
          toast.error('No account found with this email address');
        } else if (result.error === 'rate_limited') {
          toast.error('Too many requests. Please wait before trying again.');
        } else {
          toast.error(result.message || 'Failed to send reset email');
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Password reset email sent again!');
      } else {
        toast.error(result.message || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen chess-gradient-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            className="glass-morphism-dark rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Success Header */}
            <div className="text-center mb-8">
              <motion.div
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-300">
                We've sent a password reset link to:
              </p>
              <p className="text-primary-400 font-medium mt-2">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-300 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">1.</span>
                    Check your email inbox (and spam folder)
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">2.</span>
                    Click the "Reset Password" link in the email
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">3.</span>
                    Create a new secure password
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Resend Email'}
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
              Forgot Password?
            </h1>
            <p className="text-gray-300">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  {...form.register('email')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-error-400 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>

          {/* Back to Login */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              onClick={() => router.push('/auth/gateway')}
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <div className="flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </div>
            </button>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-400">
                <p className="font-medium text-yellow-400 mb-1">Security Notice</p>
                <p>Password reset links expire in 1 hour for your security. If you don't receive an email, check your spam folder.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 