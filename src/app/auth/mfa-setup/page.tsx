'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Download,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email';
  isEnabled: boolean;
  isVerified: boolean;
}

export default function MFASetupPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select');

  const mfaMethods = [
    {
      id: 'totp',
      title: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or any TOTP app',
      icon: <Key className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sms',
      title: 'SMS Verification',
      description: 'Receive codes via text message',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Receive codes via email',
      icon: <Mail className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleMethodSelect = async (method: 'totp' | 'sms' | 'email') => {
    setSelectedMethod(method);
    setStep('setup');
    setError('');
    setSuccess('');

    if (method === 'totp') {
      await setupTOTP();
    }
  };

  const setupTOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setBackupCodes(data.backupCodes);
      } else {
        setError('Failed to setup TOTP authentication');
      }
    } catch (error) {
      setError('An error occurred while setting up TOTP');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSMS = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      if (response.ok) {
        setStep('verify');
        setSuccess('Verification code sent to your phone');
      } else {
        setError('Failed to send SMS verification code');
      }
    } catch (error) {
      setError('An error occurred while sending SMS');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/setup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStep('verify');
        setSuccess('Verification code sent to your email');
      } else {
        setError('Failed to send email verification code');
      }
    } catch (error) {
      setError('An error occurred while sending email');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!selectedMethod) return;

    let code = '';
    switch (selectedMethod) {
      case 'totp':
        code = totpCode;
        break;
      case 'sms':
        code = smsCode;
        break;
      case 'email':
        code = emailCode;
        break;
    }

    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selectedMethod, code })
      });

      if (response.ok) {
        setStep('complete');
        setSuccess('Multi-factor authentication enabled successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('An error occurred while verifying the code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBackupCode = async () => {
    if (!backupCode) {
      setError('Please enter a backup code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/mfa/verify-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: backupCode })
      });

      if (response.ok) {
        setStep('complete');
        setSuccess('Multi-factor authentication enabled successfully!');
      } else {
        setError('Invalid backup code');
      }
    } catch (error) {
      setError('An error occurred while verifying the backup code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setSuccess('Backup codes copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thechesswire-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-400 mr-4" />
              <h1 className="text-3xl font-bold text-white">Secure Your Account</h1>
            </div>
            <p className="text-gray-300">
              Set up multi-factor authentication to protect your account
            </p>
          </div>

          {/* Method Selection */}
          {step === 'select' && (
            <div className="space-y-4">
              {mfaMethods.map((method) => (
                <motion.button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id as any)}
                  className={`w-full p-4 rounded-lg border transition-all duration-300 hover:transform hover:scale-105 ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}>
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">{method.title}</h3>
                      <p className="text-sm text-gray-400">{method.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Setup Step */}
          {step === 'setup' && selectedMethod && (
            <div className="space-y-6">
              {selectedMethod === 'totp' && (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Set Up Authenticator App</h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                  ) : qrCode ? (
                    <div>
                      <img src={qrCode} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
                      <p className="text-gray-300 mb-4">
                        Scan this QR code with your authenticator app
                      </p>
                      <button
                        onClick={() => setStep('verify')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        I've Scanned the Code
                      </button>
                    </div>
                  ) : (
                    <div className="text-red-400">Failed to generate QR code</div>
                  )}
                </div>
              )}

              {selectedMethod === 'sms' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Set Up SMS Verification</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={setupSMS}
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                    >
                      {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'email' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Set Up Email Verification</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={setupEmail}
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                    >
                      {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Step */}
          {step === 'verify' && selectedMethod && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white text-center">Enter Verification Code</h3>
              
              {selectedMethod === 'totp' && (
                <div>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              )}

              {selectedMethod === 'sms' && (
                <div>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              )}

              {selectedMethod === 'email' && (
                <div>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              )}

              <button
                onClick={verifyCode}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              {selectedMethod === 'totp' && (
                <div className="text-center">
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Use Backup Code Instead
                  </button>
                  
                  {showBackupCodes && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">Backup Codes</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="text-sm font-mono text-gray-300 bg-white/10 p-2 rounded">
                            {code}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyBackupCodes}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm"
                        >
                          <Copy className="w-4 h-4 inline mr-1" />
                          Copy
                        </button>
                        <button
                          onClick={downloadBackupCodes}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm"
                        >
                          <Download className="w-4 h-4 inline mr-1" />
                          Download
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <input
                          type="text"
                          value={backupCode}
                          onChange={(e) => setBackupCode(e.target.value)}
                          placeholder="Enter backup code"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={verifyBackupCode}
                          disabled={isLoading}
                          className="w-full mt-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 rounded text-sm"
                        >
                          Use Backup Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Setup Complete!</h3>
              <p className="text-gray-300 mb-6">
                Your account is now protected with multi-factor authentication.
              </p>
              <button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2"
            >
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">{success}</span>
            </motion.div>
          )}

          {/* Back Button */}
          {step !== 'select' && step !== 'complete' && (
            <button
              onClick={() => {
                setStep('select');
                setSelectedMethod(null);
                setError('');
                setSuccess('');
              }}
              className="mt-6 w-full text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Method Selection
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
} 