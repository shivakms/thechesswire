'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Shield, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'super-admin' | 'admin' | 'demo'>('super-admin');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let loginEmail = email;
      let loginPassword = password;

      // Auto-fill credentials based on selected role
      if (selectedRole === 'super-admin') {
        loginEmail = 'thechesswirenews@gmail.com';
        loginPassword = 'super-admin-secure-password-2024';
      } else if (selectedRole === 'admin') {
        loginEmail = 'admin@chesswire.com';
        loginPassword = 'admin-secure-password-2024';
      }

      const result = await login(loginEmail, loginPassword);
      
      if (result.success) {
        console.log('🔐 Login successful, redirecting...');
        router.push('/dashboard/admin');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'super-admin',
      title: 'Super Admin',
      description: 'Full system access with no restrictions',
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      color: 'border-yellow-500 bg-yellow-500/10'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Management access with limited system control',
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      color: 'border-blue-500 bg-blue-500/10'
    },
    {
      id: 'demo',
      title: 'Demo User',
      description: 'Regular user with basic access',
      icon: <Users className="w-6 h-6 text-green-400" />,
      color: 'border-green-500 bg-green-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">ChessWire</h1>
          </div>
          <p className="text-gray-300">Secure Authentication System</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3">Select Login Role:</label>
          <div className="space-y-3">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id as any)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedRole === role.id 
                    ? role.color + ' text-white' 
                    : 'border-gray-600 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center">
                  {role.icon}
                  <div className="ml-3 text-left">
                    <div className="font-medium">{role.title}</div>
                    <div className="text-sm opacity-75">{role.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={selectedRole !== 'demo'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                disabled={selectedRole !== 'demo'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-white mb-1">Security Features:</p>
              <ul className="space-y-1 text-xs">
                <li>• IP Address verification</li>
                <li>• User Agent tracking</li>
                <li>• Session timeout protection</li>
                <li>• Role-based access control</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start">
            <Crown className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-yellow-400 mb-1">Demo Credentials:</p>
              <div className="text-xs space-y-1">
                <p><strong>Super Admin:</strong> thechesswirenews@gmail.com / super-admin-secure-password-2024</p>
                <p><strong>Admin:</strong> admin@chesswire.com / admin-secure-password-2024</p>
                <p><strong>Demo User:</strong> Any email / Any password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 