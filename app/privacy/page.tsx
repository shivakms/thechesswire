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

        {/* Section 4 - Data We Collect (renumbered from 3) */}
        <section className="mb-12">
          <h2 aria-label="Section 4 - Data We Collect" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            4. Data We Collect
          </h2>
          
          <div className="space-y-8">
            {/* 4.1 */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">4.1 Information You Provide:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong className="text-white">Account Data:</strong> <span className="text-gray-400">Email address, username, password (encrypted), birthdate (for age verification)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong className="text-white">Profile Information:</strong> <span className="text-gray-400">Chess titles, FIDE ID (if applicable)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong className="text-white">Content:</strong> <span className="text-gray-400">PGN files, annotations, articles, comments</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span><strong className="text-white">Communication:</strong> <span className="text-gray-400">Support requests, feedback</span></span>
                </li>
              </ul>
            </div>

            {/* 4.2 */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">4.2 Automatically Collected Data:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong className="text-white">Technical Data:</strong> <span className="text-gray-400">IP address (encrypted), browser type, device information</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong className="text-white">Usage Data:</strong> <span className="text-gray-400">Pages visited, features used, interaction patterns</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong className="text-white">Behavioral Data:</strong> <span className="text-gray-400">Mouse movements, typing patterns, scroll behavior (for security)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong className="text-white">Location Data:</strong> <span className="text-gray-400">Country and region (derived from IP)</span></span>
                </li>
              </ul>
            </div>

            {/* 4.3 */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-pink-400">4.3 AI-Generated Data:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong className="text-white">EchoRank Scores:</strong> <span className="text-gray-400">Emotional and behavioral assessments</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong className="text-white">Training Progress:</strong> <span className="text-gray-400">EchoSage performance metrics</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong className="text-white">Voice Preferences:</strong> <span className="text-gray-400">Bambai AI settings and interactions</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-500 mt-1">•</span>
                  <span><strong className="text-white">Content Metadata:</strong> <span className="text-gray-400">AI-generated tags and classifications</span></span>
                </li>
              </ul>
            </div>

            {/* 4.4 */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-orange-400">4.4 Security & Abuse Prevention Data:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Abuse Logs:</strong> <span className="text-gray-400">Detected violations, timestamps, content samples</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Device Fingerprints:</strong> <span className="text-gray-400">For preventing ban evasion</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Behavioral Patterns:</strong> <span className="text-gray-400">Typing rhythm, mouse movements, interaction timing</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">Voice Analysis:</strong> <span className="text-gray-400">Text conversion of audio for profanity detection</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span><strong className="text-white">IP Reputation:</strong> <span className="text-gray-400">TOR/VPN detection, abuse database checks</span></span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5 - Legal Basis (renumbered from 4) */}
        <section className="mb-12">
          <h2 aria-label="Section 5 - Legal Basis for Processing" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            5. Legal Basis for Processing
          </h2>
          <p className="text-gray-300 mb-4">We process your personal data based on:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-900/20 to-transparent rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-semibold text-purple-400 mb-1">Consent</h3>
              <p className="text-sm text-gray-400">For optional features and marketing communications</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-transparent rounded-xl p-4 border border-blue-500/30">
              <h3 className="font-semibold text-blue-400 mb-1">Contract</h3>
              <p className="text-sm text-gray-400">To provide Platform services you&apos;ve registered for</p>
            </div>
            <div className="bg-gradient-to-br from-pink-900/20 to-transparent rounded-xl p-4 border border-pink-500/30">
              <h3 className="font-semibold text-pink-400 mb-1">Legitimate Interests</h3>
              <p className="text-sm text-gray-400">For security, fraud prevention, and service improvement</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/20 to-transparent rounded-xl p-4 border border-orange-500/30">
              <h3 className="font-semibold text-orange-400 mb-1">Legal Obligations</h3>
              <p className="text-sm text-gray-400">To comply with applicable laws and regulations</p>
            </div>
          </div>
        </section>

        {/* Section 6 - How We Use Your Data (renumbered from 5) */}
        <section className="mb-12">
          <h2 aria-label="Section 6 - How We Use Your Data" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            6. How We Use Your Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Provide and maintain Platform services",
              "Process subscriptions and payments",
              "Generate AI-powered content and recommendations",
              "Detect and prevent abuse, fraud, and security threats",
              "Enforce our Terms &amp; Conditions",
              "Improve AI models and user experience",
              "Comply with legal obligations",
              "Send service-related communications",
              "Create and distribute automated content across social media platforms",
              "Aggregate publicly available chess news and content",
              "Generate automated responses to social media interactions"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ENHANCED Section 7 - AI Processing with bias disclaimer */}
        <section className="mb-12">
          <h2 aria-label="Section 7 - AI Processing & Content Generation" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            7. AI Processing & Content Generation
          </h2>
          
          <div className="space-y-6">
            {/* ENHANCED AI Transparency Notice */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl" />
              <div className="relative bg-blue-900/20 border border-blue-600/50 rounded-2xl p-6 backdrop-blur-sm">
                <p className="font-semibold mb-3 text-blue-400">AI Transparency Notice:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-300">All content may be processed by AI systems for generation and moderation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-300">Your interactions help improve AI responses (anonymized)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-300">No personal data is used in public AI training datasets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-300">AI decisions (like moderation) are final with no manual review</span>
                  </li>
                </ul>
                <div className="bg-yellow-900/20 rounded-lg p-3 mt-4">
                  <p className="text-yellow-400 font-semibold text-sm mb-1">Important:</p>
                  <p className="text-gray-300 text-sm">
                    All AI-generated content, including articles, analyses, and commentary, may contain inaccuracies, 
                    biases, or errors. Users are advised to verify information independently before making decisions 
                    based on AI-generated content.
                  </p>
                </div>
              </div>
            </div>

            {/* Abuse Detection */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/10 blur-xl" />
              <div className="relative bg-red-900/20 border border-red-600/50 rounded-2xl p-6 backdrop-blur-sm">
                <p className="font-semibold mb-3 text-red-400">Abuse Detection & Consequences:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-300">All content is scanned for profanity, hate speech, and abusive language</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-300">Behavioral patterns are analyzed to detect toxic users</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-300">Voice submissions are converted to text and analyzed for abuse</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-300">Detection of abuse results in immediate, permanent account termination</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-300">Abuse records and fingerprints are retained permanently for security</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ENHANCED Section 8 - Data Storage with secure deletion emphasis */}
        <section className="mb-12">
          <h2 aria-label="Section 8 - Data Storage & Location" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            8. Data Storage & Location
          </h2>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <p className="font-semibold mb-3 text-purple-400">Where Your Data is Stored:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">🌍</span>
                <span className="text-gray-300"><strong>Primary Storage:</strong> Data is stored within the European Union (EU) on AWS servers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">🔒</span>
                <span className="text-gray-300"><strong>Data Security:</strong> All data is encrypted at rest using AES-256 encryption</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">📋</span>
                <span className="text-gray-300"><strong>GDPR Compliance:</strong> Data is subject to GDPR regulations and EU data protection laws</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">🌐</span>
                <span className="text-gray-300"><strong>International Transfers:</strong> In the event of data retention outside of the EU, appropriate safeguards are in place including Standard Contractual Clauses (SCCs)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">🗑️</span>
                <span className="text-gray-300"><strong>Secure Deletion:</strong> Upon account deletion request, all personal data is securely erased from all systems including backups within 30 days using industry-standard secure deletion methods</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 9 - Data Security (renumbered from 7) */}
        <section className="mb-12">
          <h2 aria-label="Section 9 - Data Security & Encryption" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            9. Data Security & Encryption
          </h2>
          <p className="text-gray-300 mb-4">We implement state-of-the-art security measures including:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Encryption at Rest", desc: "AES-256 encryption for stored data", icon: "🔒" },
              { title: "Encryption in Transit", desc: "TLS 1.3 for all communications", icon: "🔐" },
              { title: "Database Security", desc: "PostgreSQL with pgcrypto encryption", icon: "🗄️" },
              { title: "Quantum-Resistant Security", desc: "Future-proof cryptographic measures", icon: "🛡️" },
              { title: "Access Controls", desc: "Role-based access with multi-factor authentication", icon: "🔑" },
              { title: "Security Monitoring", desc: "24/7 threat detection and response", icon: "👁️" },
              { title: "Advanced Threat Protection", desc: "AI-powered anomaly detection", icon: "🤖" },
              { title: "Regular Audits", desc: "Penetration testing and security assessments", icon: "🔍" },
              { title: "Zero-Trust Architecture", desc: "No implicit trust, continuous verification", icon: "🚫" }
            ].map((item, index) => (
              <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-400 text-sm italic">
            Despite these measures, no system is completely secure. We continuously update our 
            security protocols to protect against emerging threats.
          </p>
        </section>

        {/* ENHANCED Section 10 - Third-Party Services with data sharing clarity */}
        <section className="mb-12">
          <h2 aria-label="Section 10 - Third-Party Services" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            10. Third-Party Services
          </h2>
          <p className="text-gray-300 mb-4">We use carefully selected third-party services that comply with GDPR:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "AWS", desc: "Cloud infrastructure and storage (EU region)" },
              { name: "Stripe", desc: "Payment processing (PCI-compliant)" },
              { name: "CloudFlare", desc: "CDN and DDoS protection" },
              { name: "ElevenLabs", desc: "AI voice generation" },
              { name: "Analytics", desc: "Privacy-focused analytics (no personal data)" },
              { name: "AbuseIPDB", desc: "Security threat detection" },
              { name: "Social Media APIs", desc: "For automated content distribution" },
              { name: "RunwayML", desc: "AI video generation (when applicable)" }
            ].map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-900/20 to-transparent rounded-lg p-3 border border-purple-500/30">
                <h3 className="font-semibold text-purple-400 text-sm">{service.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{service.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <p className="font-semibold text-gray-200 mb-2">Data Sharing Notice:</p>
            <p className="text-gray-300 text-sm">
              We may share your personal data with these third-party services solely for the purpose of providing 
              our services to you. All third parties are contractually bound to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Process data only as instructed by us</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Comply with GDPR and applicable data protection regulations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Implement appropriate security measures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Delete or return data when no longer needed</span>
              </li>
            </ul>
          </div>

          {/* Social Media Automation Disclosure */}
          <div className="relative mt-6">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl" />
            <div className="relative bg-blue-900/20 border border-blue-600/50 rounded-2xl p-6 backdrop-blur-sm">
              <p className="font-semibold mb-3 text-blue-400">Social Media Automation Disclosure:</p>
              <p className="text-gray-300 mb-3">We operate automated systems across social media platforms that may:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-gray-300">Collect publicly available chess-related content for aggregation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-gray-300">Auto-respond to mentions of @thechesswirenews</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-gray-300">Post AI-generated content across 12+ platforms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-gray-300">Monitor engagement metrics and trends</span>
                </li>
              </ul>
              <p className="text-sm text-gray-400">
                <strong className="text-white">Note:</strong> We only process publicly available social media data. 
                No private messages or non-public content is accessed or stored. When aggregating 
                chess news, we only collect public headlines, snippets, and metadata - never 
                full copyrighted articles or premium content.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11 - Data Retention (renumbered from 9) */}
        <section className="mb-12">
          <h2 aria-label="Section 11 - Data Retention" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            11. Data Retention
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-900/50 to-blue-900/50">
                  <th className="text-left p-4 font-semibold text-white">Data Type</th>
                  <th className="text-left p-4 font-semibold text-white">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {[
                  { type: "Account Data", period: "Until account deletion + 30 days" },
                  { type: "Content/PGNs", period: "Until user deletion" },
                  { type: "Security Logs", period: "90 days" },
                  { type: "Abuse Records", period: "Permanently (for security)", highlight: true },
                  { type: "Payment Records", period: "7 years (legal requirement)" },
                  { type: "Voice Cache Files", period: "90 days" },
                  { type: "Social Media Posts", period: "Indefinitely (public content)" }
                ].map((item, index) => (
                  <tr key={index} className={`hover:bg-gray-700/20 transition-colors ${item.highlight ? 'bg-red-900/10' : ''}`}>
                    <td className="p-4 text-gray-300">{item.type}</td>
                    <td className={`p-4 ${item.highlight ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>{item.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

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

        {/* ENHANCED Section 13 - International Data Transfers with SCCs mention */}
        <section className="mb-12">
          <h2 aria-label="Section 13 - International Data Transfers" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            13. International Data Transfers
          </h2>
          <p className="text-gray-300 mb-4">
            Your data may be transferred to and processed in countries outside the EU/EEA. 
            We ensure appropriate safeguards through:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-300">Standard Contractual Clauses (SCCs) approved by the European Commission</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-300">Adequacy decisions where applicable (e.g., transfers to countries deemed adequate by the EU)</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-300">Technical and organizational security measures equivalent to EU standards</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
              <span className="text-green-500">✓</span>
              <span className="text-gray-300">Contractual obligations ensuring GDPR-level protection regardless of location</span>
            </div>
          </div>
        </section>

        {/* Section 14 - Cookies & Tracking (renumbered from 12) */}
        <section className="mb-12">
          <h2 aria-label="Section 14 - Cookies & Tracking" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            14. Cookies & Tracking
          </h2>
          <p className="text-gray-300 mb-4">We use minimal, privacy-focused tracking:</p>
          <div className="space-y-3">
            {[
              { type: "Essential Cookies", desc: "For authentication and security only", icon: "🍪" },
              { type: "Analytics", desc: "Anonymous usage statistics (no personal data)", icon: "📊" },
              { type: "No Third-Party Tracking", desc: "We don't use advertising cookies or trackers", icon: "🚫" },
              { type: "No External Cookies", desc: "All cookies are first-party only", icon: "🔒" },
              { type: "Session Management", desc: "Temporary session data for functionality", icon: "⏱️" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-gray-800/30 rounded-lg p-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{item.type}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-400 text-sm">
            You can disable cookies in your browser settings, but this may limit Platform functionality.
          </p>
        </section>

        {/* Section 15 - Data Breach Notification (renumbered from 13) */}
        <section className="mb-12">
          <h2 aria-label="Section 15 - Data Breach Notification" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            15. Data Breach Notification
          </h2>
          <p className="text-gray-300 mb-4">
            In the unlikely event of a data breach that poses a high risk to your rights and freedoms, 
            we will notify you within 72 hours via email and provide:
          </p>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">📋</span>
                <span className="text-gray-300">Description of the breach</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">⚠️</span>
                <span className="text-gray-300">Potential consequences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">🛡️</span>
                <span className="text-gray-300">Measures taken to address it</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">💡</span>
                <span className="text-gray-300">Recommendations for protection</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 16 - Automated Decision-Making (renumbered from 14) */}
        <section className="mb-12">
          <h2 aria-label="Section 16 - Automated Decision-Making" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            16. Automated Decision-Making
          </h2>
          <p className="text-gray-300 mb-4">We use automated systems for:</p>
          <div className="space-y-3">
            {[
              { system: "Content Moderation", desc: "Real-time detection of abusive language, profanity, hate speech" },
              { system: "Abuse Detection", desc: "Behavioral analysis across 72+ abuse vectors" },
              { system: "Account Termination", desc: "Automatic permanent bans for policy violations" },
              { system: "EchoRank Scoring", desc: "Performance and behavior assessments" },
              { system: "Training Recommendations", desc: "Personalized learning paths" }
            ].map((item, index) => (
              <div key={index} className="bg-gray-800/30 rounded-lg p-4 border-l-4 border-purple-500/50">
                <h3 className="font-semibold text-white mb-1">{item.system}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-900/20 border border-red-600/50 rounded-xl">
            <p className="font-bold text-red-400">
              IMPORTANT: Moderation and ban decisions are final with NO manual review or appeal process. 
              Detection of abusive behavior results in immediate, permanent account termination.
            </p>
          </div>
        </section>

        {/* Section 17 - Children's Privacy (renumbered from 15) */}
        <section className="mb-12">
          <h2 aria-label="Section 17 - Children's Privacy" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            17. Children&apos;s Privacy
          </h2>
          <p className="text-gray-300">
            We do not knowingly collect data from anyone under 18. Parents/guardians who believe 
            their child has provided data should contact us immediately for deletion.
          </p>
        </section>

        {/* Section 18 - Marketing Communications (renumbered from 16) */}
        <section className="mb-12">
          <h2 aria-label="Section 18 - Marketing Communications" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            18. Marketing Communications
          </h2>
          <p className="text-gray-300">
            We will only send marketing emails with your explicit consent. You can unsubscribe 
            at any time via the link in any marketing email or by contacting us.
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

        {/* Section 20 - Supervisory Authority - ENHANCED */}
        <section className="mb-12">
          <h2 aria-label="Section 20 - Supervisory Authority" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            20. Supervisory Authority
          </h2>
          <p className="text-gray-300 mb-4">
            You have the right to lodge a complaint with a supervisory authority if you believe 
            your data protection rights have been violated. In Sweden, this is:
          </p>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="font-semibold text-purple-400 mb-2">Integritetsskyddsmyndigheten (IMY)</h3>
            <p className="text-gray-300">Swedish Authority for Privacy Protection</p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-400 text-sm">Website: www.imy.se</p>
              <p className="text-gray-400 text-sm">Email: imy@imy.se</p>
              <p className="text-gray-400 text-sm">Phone: +46 8 657 61 00</p>
              <p className="text-gray-400 text-sm">Address: Box 8114, 104 20 Stockholm, Sweden</p>
            </div>
            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-blue-400">Note:</strong> We encourage you to contact us first at{' '}
                <code className="bg-gray-900 px-2 py-1 rounded text-blue-400 font-mono text-xs">gdpr@thechesswire.news</code>{' '}
                to resolve any concerns before contacting IMY.
              </p>
            </div>
          </div>
        </section>

        {/* Section 21 - Contact Us (renumbered from 19) */}
        <section className="mb-12">
          <h2 aria-label="Section 21 - Contact Us" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            21. Contact Us
          </h2>
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <p className="text-gray-300 mb-4">For privacy-related inquiries or to exercise your rights:</p>
            <div className="space-y-3">
              <p className="text-lg">
                General: <code className="bg-gray-900 px-4 py-2 rounded-lg text-blue-400 font-mono">legal@thechesswire.news</code>
              </p>
              <p className="text-lg">
                GDPR: <code className="bg-gray-900 px-4 py-2 rounded-lg text-blue-400 font-mono">gdpr@thechesswire.news</code>
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-400 mb-2">Response Times:</p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Data access requests: Within 30 days</li>
                <li>• Deletion requests: Within 30 days</li>
                <li>• General inquiries: Within 7 business days</li>
              </ul>
            </div>
          </div>
        </section>

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
