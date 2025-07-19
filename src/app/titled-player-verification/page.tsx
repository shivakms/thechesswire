'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, CheckCircle, AlertCircle, Upload, Camera, FileText } from 'lucide-react';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  required: boolean;
}

export default function TitledPlayerVerificationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationData, setVerificationData] = useState({
    fideId: '',
    title: '',
    fullName: '',
    dateOfBirth: '',
    country: '',
    documents: [] as File[],
    selfie: null as File | null,
    consent: false,
  });

  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Provide your FIDE ID and personal details',
      status: 'pending',
      required: true
    },
    {
      id: 'title-verification',
      title: 'Title Verification',
      description: 'Verify your chess title with FIDE database',
      status: 'pending',
      required: true
    },
    {
      id: 'identity-documents',
      title: 'Identity Documents',
      description: 'Upload government-issued ID for verification',
      status: 'pending',
      required: true
    },
    {
      id: 'selfie-verification',
      title: 'Selfie Verification',
      description: 'Take a photo to verify your identity',
      status: 'pending',
      required: true
    },
    {
      id: 'behavioral-verification',
      title: 'Behavioral Verification',
      description: 'Complete security questions and patterns',
      status: 'pending',
      required: true
    },
    {
      id: 'consent-agreement',
      title: 'Consent & Agreement',
      description: 'Agree to terms and revenue sharing',
      status: 'pending',
      required: true
    }
  ]);

  const titles = [
    'GM', 'WGM', 'IM', 'WIM', 'FM', 'WFM', 'CM', 'WCM', 'NM', 'WNM'
  ];

  const countries = [
    'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI', 'RU', 'CN', 'IN', 'BR', 'AR', 'MX', 'CA', 'AU', 'NZ'
  ];

  const handleInputChange = (field: string, value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field: 'documents' | 'selfie', files: FileList | null) => {
    if (!files) return;

    if (field === 'documents') {
      const newDocuments = Array.from(files);
      setVerificationData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments]
      }));
    } else if (field === 'selfie') {
      setVerificationData(prev => ({
        ...prev,
        selfie: files[0]
      }));
    }
  };

  const verifyFIDEId = async () => {
    try {
      const response = await fetch('/api/titled-players/verify-fide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fideId: verificationData.fideId,
          title: verificationData.title
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.verified) {
          updateStepStatus('title-verification', 'completed');
          return true;
        }
      }
      
      updateStepStatus('title-verification', 'failed');
      return false;
    } catch (error) {
      console.error('FIDE verification failed:', error);
      updateStepStatus('title-verification', 'failed');
      return false;
    }
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'completed' | 'failed') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Verify FIDE ID
      const verified = await verifyFIDEId();
      if (!verified) {
        alert('FIDE ID verification failed. Please check your details.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit verification
      await submitVerification();
    }
  };

  const submitVerification = async () => {
    try {
      const formData = new FormData();
      Object.entries(verificationData).forEach(([key, value]) => {
        if (key === 'documents') {
          verificationData.documents.forEach(doc => {
            formData.append('documents', doc);
          });
        } else if (key === 'selfie' && value) {
          formData.append('selfie', value as File);
        } else if (key !== 'documents' && key !== 'selfie') {
          formData.append(key, value as string);
        }
      });

      const response = await fetch('/api/titled-players/submit-verification', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Redirect to verification pending page
        window.location.href = '/titled-player-verification/pending';
      } else {
        alert('Verification submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification submission failed:', error);
      alert('Verification submission failed. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                FIDE ID *
              </label>
              <input
                type="text"
                value={verificationData.fideId}
                onChange={(e) => handleInputChange('fideId', e.target.value)}
                placeholder="Enter your FIDE ID"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Chess Title *
              </label>
              <select
                value={verificationData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select your title</option>
                {titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={verificationData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name as registered with FIDE"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={verificationData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Country *
                </label>
                <select
                  value={verificationData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="text-center space-y-6">
            <motion.div
              className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Verifying Your Title</h3>
              <p className="text-gray-300">
                We're verifying your {verificationData.title} title with the FIDE database.
                This process is secure and encrypted.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">FIDE ID: {verificationData.fideId}</span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Title: {verificationData.title}</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Upload Identity Documents</h3>
              <p className="text-gray-300 mb-4">
                Please upload clear photos or scans of your government-issued ID.
                We accept passport, national ID, or driver's license.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Drag and drop files here, or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload('documents', e.target.files)}
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors"
              >
                Choose Files
              </label>
            </div>

            {verificationData.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Uploaded Documents:</h4>
                {verificationData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-400" />
                    <span className="text-white">{doc.name}</span>
                    <span className="text-gray-400">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Selfie Verification</h3>
              <p className="text-gray-300 mb-4">
                Please take a clear photo of yourself holding your ID next to your face.
                This helps us verify your identity.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Take a photo or upload from your device</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('selfie', e.target.files)}
                className="hidden"
                id="selfie-upload"
              />
              <label
                htmlFor="selfie-upload"
                className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors"
              >
                Take Photo
              </label>
            </div>

            {verificationData.selfie && (
              <div className="text-center">
                <h4 className="text-white font-medium mb-2">Selfie Preview:</h4>
                <img
                  src={URL.createObjectURL(verificationData.selfie)}
                  alt="Selfie preview"
                  className="w-48 h-48 object-cover rounded-lg mx-auto"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Behavioral Verification</h3>
              <p className="text-gray-300 mb-4">
                Complete these security questions to verify your identity.
                This helps prevent fraud and ensures account security.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Security Question 1</h4>
                <p className="text-gray-300 mb-3">
                  What was the first tournament where you earned your {verificationData.title} title?
                </p>
                <input
                  type="text"
                  placeholder="Enter tournament name and year"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Security Question 2</h4>
                <p className="text-gray-300 mb-3">
                  What is your current FIDE rating?
                </p>
                <input
                  type="number"
                  placeholder="Enter your current rating"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Pattern Verification</h4>
                <p className="text-gray-300 mb-3">
                  Click the squares in the order shown to verify you're human.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <button
                      key={i}
                      className="w-16 h-16 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Consent & Revenue Sharing Agreement</h3>
              <p className="text-gray-300 mb-4">
                As a verified titled player, you're eligible for our revenue sharing program.
                Please review and agree to the terms.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Crown className="w-6 h-6 text-yellow-400 mt-1" />
                <div>
                  <h4 className="text-white font-medium">Revenue Sharing Benefits</h4>
                  <ul className="text-gray-300 text-sm mt-2 space-y-1">
                    <li>• {verificationData.title === 'GM' || verificationData.title === 'WGM' ? '15%' : 
                         verificationData.title === 'IM' || verificationData.title === 'WIM' ? '10%' : '6%'} of content earnings</li>
                    <li>• Featured article spots and priority publishing</li>
                    <li>• Special UI badge and recognition</li>
                    <li>• Premium voice modes access</li>
                    <li>• No advertisements shown to you</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={verificationData.consent}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, consent: e.target.checked }))}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-gray-300 text-sm">
                    I agree to the terms of service, privacy policy, and revenue sharing agreement. 
                    I confirm that all information provided is accurate and I am the legitimate holder of the {verificationData.title} title.
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen chess-gradient-dark">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center glow-effect"
              whileHover={{ scale: 1.1 }}
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Titled Player Verification</h1>
          <p className="text-xl text-gray-300">Complete verification to unlock premium features and revenue sharing</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-morphism-dark rounded-2xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Verification Progress</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      index === currentStep
                        ? 'bg-primary-500 text-white'
                        : step.status === 'completed'
                        ? 'bg-green-600 text-white'
                        : step.status === 'failed'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step.status === 'failed' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-current" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{step.title}</p>
                      <p className="text-xs opacity-75 truncate">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              className="glass-morphism-dark rounded-2xl p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={currentStep}
            >
              {renderStepContent()}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-600">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1 && !verificationData.consent}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStep === steps.length - 1 ? 'Submit Verification' : 'Next'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 