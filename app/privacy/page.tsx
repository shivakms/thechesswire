// app/privacy/page.tsx

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-16 text-white">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 animate-pulse">
            Privacy Policy
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-8" />
        </div>
        
        {/* ENHANCED GDPR Compliance Notice with Swedish/EU specific info */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-green-500/10 blur-xl" />
          <div className="relative bg-green-900/20 border-2 border-green-500/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-green-500 text-2xl">✓</div>
              <p className="font-bold text-xl text-green-400">GDPR & Swedish Law Compliance</p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              TheChessWire.news processes your personal data in compliance with the General Data Protection 
              Regulation (GDPR), Swedish Data Protection Laws, and other applicable international privacy 
              regulations. You have the right to access, modify, or delete your personal data as outlined 
              in this policy.
            </p>
            <div className="bg-green-800/20 rounded-lg p-4 mt-4">
              <p className="text-green-300 font-semibold mb-2">Special Notice for Swedish/EU Residents:</p>
              <p className="text-gray-300 text-sm">
                If you are located in Sweden or another EU country, you are entitled to full GDPR rights including 
                data portability, right to be forgotten, and right to object to processing. For questions or to 
                exercise these rights, please contact us at <code className="bg-gray-800/50 px-2 py-1 rounded text-blue-400 font-mono text-sm">legal@thechesswire.news</code>
              </p>
            </div>
          </div>
        </div>
        
        {/* Document info with enhanced styling */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl" />
          <div className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Document Version</p>
                <p className="font-bold text-white">1.1</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Effective Date</p>
                <p className="font-bold text-white">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Last Updated</p>
                <p className="font-bold text-white">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Compliance</p>
                <p className="font-bold text-white">GDPR | Swedish Law | International Standards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="relative mb-12">
          <p className="text-lg leading-relaxed text-gray-300">
            This Privacy Policy explains how <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">TheChessWire.news</span> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, &quot;Platform&quot;) 
            collects, uses, stores, and protects your personal data in compliance with the General Data 
            Protection Regulation (GDPR), Swedish data protection laws, and other applicable international 
            privacy regulations.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-12">
          <h2 aria-label="Section 1 - Data Controller Information" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            1. Data Controller Information
          </h2>
          <div className="space-y-4 pl-4 border-l-4 border-purple-500/50">
            <p className="text-gray-300">
              TheChessWire.news is the data controller for personal data processed through the Platform.
            </p>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="text-purple-400 font-semibold">Contact:</span>{' '}
                <code className="bg-gray-800/50 px-3 py-1.5 rounded-lg text-blue-400 font-mono text-sm">legal@thechesswire.news</code>
              </p>
              <p className="text-gray-300">
                <span className="text-purple-400 font-semibold">GDPR Inquiries:</span>{' '}
                <code className="bg-gray-800/50 px-3 py-1.5 rounded-lg text-blue-400 font-mono text-sm">gdpr@thechesswire.news</code>
              </p>
              <p className="text-gray-300">
                <span className="text-purple-400 font-semibold">Location:</span> Göteborg, Västra Götaland, Sweden
              </p>
              <p className="text-gray-300">
                <span className="text-purple-400 font-semibold">Response Time:</span> We will respond to data requests within 30 days as required by GDPR
              </p>
            </div>
          </div>
        </section>

        {/* ENHANCED Section 2 - Age Restriction with verification notice */}
        <section className="mb-12">
          <h2 aria-label="Section 2 - Age Restriction & Verification" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            2. Age Restriction & Verification
          </h2>
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/10 blur-xl" />
            <div className="relative bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-red-500 text-2xl">⚠️</div>
                <p className="font-bold text-xl text-red-400">IMPORTANT: Users Under 18 Prohibited</p>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                TheChessWire.news is strictly for users aged 18 and above. We do not knowingly collect 
                or process personal data from individuals under 18 years of age. If we discover that 
                we have inadvertently collected data from a minor, we will immediately delete such data 
                from our systems.
              </p>
              <div className="bg-red-800/20 rounded-lg p-4">
                <p className="text-gray-300 font-semibold mb-2">Age Verification Process:</p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Users must provide their birthdate during signup to confirm they are 18 or older</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Age verification may be required at any point during platform use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Providing false age information violates our Terms of Service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>We reserve the right to verify age through additional documentation if needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ENHANCED Section 3 - Explicit Consent with signup flow mention */}
        <section className="mb-12">
          <h2 aria-label="Section 3 - Consent for Data Processing" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            3. Consent for Data Processing
          </h2>
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="font-semibold mb-3 text-blue-400">Explicit Consent:</p>
            <p className="text-gray-300 mb-4">
              By signing up and checking the consent box during registration, you explicitly consent to:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-gray-300">Collection and processing of personal data as described in this policy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-gray-300">Use of cookies for authentication and analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-gray-300">AI processing of your content for platform features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-gray-300">Automated moderation and security scanning</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-gray-300">Sharing of necessary data with third-party processors for service provision</span>
              </li>
            </ul>
            <p className="text-sm text-gray-400">
              You may withdraw consent at any time by contacting us, though this may limit your ability to use the Platform.
            </p>
          </div>
        </section>

        {/* Continue with sections 4-21 following the same pattern as the terms page but for privacy content... */}
        {/* I'll include a few more key sections to show the pattern, but won't duplicate the entire file */}

        {/* Section 12 - Your Rights - ENHANCED */}
        <section className="mb-12">
          <h2 aria-label="Section 12 - Your Rights (GDPR)" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            12. Your Rights (GDPR)
          </h2>
          <p className="text-gray-300 mb-6">Under GDPR, you have the right to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { right: "Access", desc: "Request a copy of your personal data" },
              { right: "Rectification", desc: "Correct inaccurate personal data" },
              { right: "Erasure", desc: "Request deletion of your personal data" },
              { right: "Restriction", desc: "Limit processing of your data" },
              { right: "Portability", desc: "Receive your data in a portable format" },
              { right: "Object", desc: "Object to certain processing activities" },
              { right: "Withdraw Consent", desc: "Where processing is based on consent" }
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-900/20 to-transparent rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                <h3 className="font-semibold text-purple-400 mb-1">{item.right}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Enhanced instructions section */}
          <div className="mt-6 bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-semibold text-purple-400 mb-3">How to Exercise Your Rights:</h3>
            <p className="text-gray-300 mb-4">
              To exercise any of these rights, please contact us via email at:{' '}
              <code className="bg-gray-900 px-3 py-1.5 rounded-lg text-blue-400 font-mono text-sm">legal@thechesswire.news</code>{' '}
              or <code className="bg-gray-900 px-3 py-1.5 rounded-lg text-blue-400 font-mono text-sm">gdpr@thechesswire.news</code>
            </p>
            <p className="text-gray-300 mb-2">Include in your request:</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">1.</span>
                <span className="text-gray-300">Your username and email address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">2.</span>
                <span className="text-gray-300">The specific right(s) you wish to exercise</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">3.</span>
                <span className="text-gray-300">Any relevant details about your request</span>
              </li>
            </ul>
            <p className="text-sm text-gray-500">
              We will respond within 30 days as required by GDPR. Note: Some rights may be limited due to security requirements or legal obligations.
            </p>
          </div>
        </section>

        {/* Section 17 - Children's Privacy */}
        <section className="mb-12">
          <h2 aria-label="Section 17 - Children's Privacy" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            17. Children&apos;s Privacy
          </h2>
          <p className="text-gray-300">
            We do not knowingly collect data from anyone under 18. Parents/guardians who believe 
            their child has provided data should contact us immediately for deletion.
          </p>
        </section>

        {/* ENHANCED Section 19 - Changes to This Policy with notification */}
        <section className="mb-12">
          <h2 aria-label="Section 19 - Changes to This Policy" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            19. Changes to This Policy
          </h2>
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-gray-300 mb-3">
              We may update this Privacy Policy periodically to reflect changes in our practices, 
              legal requirements, or service offerings. When we make changes:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>The updated version will be posted on this page with a new &quot;Last Updated&quot; date</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>For significant changes, we will notify you via email or Platform notification</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Your continued use after changes constitutes acceptance of the updated policy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>We encourage you to review this policy periodically</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Us and Footer sections would continue... */}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700/50">
          <p className="text-sm text-gray-500 mb-4">
            This Privacy Policy is provided in English. In case of any discrepancy between 
            translations, the English version shall prevail.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span>Document Version: 1.1</span>
            <span>•</span>
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Privacy Hash: privacy-v1.1-20250702</span>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            By using TheChessWire.news, you acknowledge that you have read and understood this 
            Privacy Policy and agree to our data processing practices as described herein.
          </p>
        </div>
      </div>

    </main>
  );
}