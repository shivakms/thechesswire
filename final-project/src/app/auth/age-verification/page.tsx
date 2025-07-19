'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Shield, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ageVerificationSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  consent: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

type AgeVerificationForm = z.infer<typeof ageVerificationSchema>;

export default function AgeVerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userAge, setUserAge] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AgeVerificationForm>({
    resolver: zodResolver(ageVerificationSchema),
  });

  const dateOfBirth = watch('dateOfBirth');
  const consent = watch('consent');

  // Calculate age when date of birth changes
  React.useEffect(() => {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setUserAge(age - 1);
      } else {
        setUserAge(age);
      }
    }
  }, [dateOfBirth]);

  const onSubmit = async (data: AgeVerificationForm) => {
    if (!userAge) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/age-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth: data.dateOfBirth,
          age: userAge,
          consent: data.consent,
        }),
      });

      if (response.ok) {
        toast.success('Age verification completed successfully!');
        router.push(redirectUrl);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Age verification failed');
      }
    } catch (error) {
      toast.error('Age verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getAgeStatus = () => {
    if (!userAge) return { status: 'unknown', message: '', color: '' };
    
    if (userAge >= 18) {
      return {
        status: 'adult',
        message: 'You are eligible to use all features',
        color: 'text-green-400'
      };
    } else {
      return {
        status: 'too_young',
        message: 'You must be at least 18 years old to use this service',
        color: 'text-red-400'
      };
    }
  };

  const ageStatus = getAgeStatus();

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
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Age Verification Required
            </h1>
            <p className="text-gray-300">
              To comply with GDPR regulations, you must be 18 years or older to use this service.
            </p>
          </div>

          {/* Age Status Display */}
          {userAge !== null && (
            <motion.div
              className="mb-6 p-4 rounded-lg border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {ageStatus.status === 'adult' && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-400">Adult User</h3>
                    <p className="text-sm text-gray-300">Age: {userAge} years old</p>
                  </div>
                </div>
              )}
              
              {ageStatus.status === 'too_young' && (
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-400">Age Restriction</h3>
                    <p className="text-sm text-gray-300">You must be at least 18 years old to use this service</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  {...register('consent')}
                  className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2 mt-1"
                />
                <div>
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="/terms" className="text-primary-400 hover:text-primary-300 underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-primary-400 hover:text-primary-300 underline">
                      Privacy Policy
                    </a>
                  </span>
                  {errors.consent && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.consent.message}
                    </p>
                  )}
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || userAge === null || ageStatus.status === 'too_young'}
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
                  <span>Verifying...</span>
                </>
              ) : ageStatus.status === 'too_young' ? (
                <span>Age Restriction</span>
              ) : (
                <>
                  <span>Complete Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Age Restriction Notice */}
          {ageStatus.status === 'too_young' && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-400 text-sm">
                Unfortunately, you cannot use this service at this time. 
                Please return when you are 18 years or older.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Legal Notice */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 text-xs">
            🔐 Age verification is required for GDPR compliance and user safety.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Import React for useEffect
import React from 'react'; 