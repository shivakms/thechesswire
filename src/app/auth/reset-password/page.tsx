'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 12 characters',
    test: (password) => password.length >= 12
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'One number',
    test: (password) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'One special character (@$!%*?&)',
    test: (password) => /[@$!%*?&]/.test(password)
  }
];

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (token) {
      validateToken(token);
    } else {
      setIsValidating(false);
      setIsValid(false);
    }
  }, [token, emailParam]);

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken })
      });

      const data = await response.json();

      if (response.ok) {
        setIsValid(true);
        setEmail(data.email);
      } else {
        setIsValid(false);
        if (data.error === 'token_expired') {
          toast.error('Password reset link has expired. Please request a new one.');
        } else {
          toast.error('Invalid password reset link.');
        }
      }
    } catch (error) {
      setIsValid(false);
      toast.error('Failed to validate reset link.');
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('No reset token provided');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully!');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/gateway');
        }, 2000);
      } else {
        if (result.error === 'token_expired') {
          toast.error('Password reset link has expired. Please request a new one.');
        } else if (result.error === 'invalid_token') {
          toast.error('Invalid password reset link.');
        } else {
          toast.error(result.message || 'Failed to reset password');
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const requirements = passwordRequirements.map(req => req.test(password));
    const metCount = requirements.filter(Boolean).length;
    const percentage = (metCount / requirements.length) * 100;

    if (percentage < 40) return { level: 'weak', color: 'text-red-500', bg: 'bg-red-500' };
    if (percentage < 80) return { level: 'medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'strong', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const currentPassword = form.watch('password') || '';

  if (isValidating) {
    return (
      <div className="min-h-screen chess-gradient-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            className="glass-morphism-dark rounded-2xl p-8 shadow-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Validating reset link...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen chess-gradient-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            className="glass-morphism-dark rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <XCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-gray-300">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <motion.button
              onClick={() => router.push('/auth/forgot-password')}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Request New Reset Link
            </motion.button>
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
              Reset Your Password
            </h1>
            <p className="text-gray-300">
              Create a new secure password for your account.
            </p>
            {email && (
              <p className="text-primary-400 text-sm mt-2">
                {email}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-error-400 text-sm mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {currentPassword && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Password strength:</span>
                    <span className={getPasswordStrength(currentPassword).color}>
                      {getPasswordStrength(currentPassword).level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(currentPassword).bg}`}
                      style={{
                        width: `${(passwordRequirements.filter(req => req.test(currentPassword)).length / passwordRequirements.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2">
                  {passwordRequirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center space-x-2">
                      {requirement.test(currentPassword) ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-500 rounded-full"></div>
                      )}
                      <span className={`text-sm ${requirement.test(currentPassword) ? 'text-green-400' : 'text-gray-400'}`}>
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...form.register('confirmPassword')}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-error-400 text-sm mt-1">
                  {form.formState.errors.confirmPassword.message}
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
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
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
        </motion.div>
      </div>
    </div>
  );
} 