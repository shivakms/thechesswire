// src/components/forms/ConsentAgreement.tsx

"use client";

import Link from "next/link";
import { Shield, Lock, AlertCircle } from "lucide-react";

interface ConsentAgreementProps {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  setPrivacyAccepted: (v: boolean) => void;
  className?: string;
}

export default function ConsentAgreement({
  termsAccepted,
  privacyAccepted,
  setTermsAccepted,
  setPrivacyAccepted,
  className = ""
}: ConsentAgreementProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Age Restriction Notice */}
      <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-red-500/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-red-400 mb-1">Age Requirement</p>
            <p className="text-gray-300">
              By proceeding, you confirm that you are at least 18 years of age. 
              TheChessWire.news is strictly for adults only.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Security Notice */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-400 mb-1">Your Privacy Matters</p>
            <p className="text-gray-300">
              We use quantum-level encryption and GDPR-compliant security. 
              All AI interactions are automated with zero human review.
            </p>
          </div>
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="peer sr-only"
              required
              aria-label="Accept Terms &amp; Conditions"
            />
            <div className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800/50 
                          peer-checked:bg-gradient-to-br peer-checked:from-brand-accent peer-checked:to-purple-600 
                          peer-checked:border-brand-accent transition-all duration-300
                          group-hover:border-brand-accent/70">
              <svg className="w-3 h-3 text-black absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity"
                   fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <span className="text-sm text-gray-300 leading-relaxed">
            I have read and accept the{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:text-white underline underline-offset-2 transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            , including the zero-tolerance abuse policy and permanent ban system
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={() => setPrivacyAccepted(!privacyAccepted)}
              className="peer sr-only"
              required
              aria-label="Accept Privacy Policy"
            />
            <div className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800/50 
                          peer-checked:bg-gradient-to-br peer-checked:from-brand-accent peer-checked:to-purple-600 
                          peer-checked:border-brand-accent transition-all duration-300
                          group-hover:border-brand-accent/70">
              <svg className="w-3 h-3 text-black absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity"
                   fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <span className="text-sm text-gray-300 leading-relaxed">
            I understand and accept the{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:text-white underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            , including AI content generation and automated social media interactions
          </span>
        </label>
      </div>

      {/* Encryption Notice */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
        <Lock className="w-3 h-3" />
        <span>Secured with AES-256 encryption • GDPR compliant • Quantum-resistant security</span>
      </div>
    </div>
  );
}
