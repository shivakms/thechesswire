// app/terms/page.tsx

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-16 text-white space-y-8">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 animate-pulse">
            Terms &amp; Conditions
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-8" />
        </div>
        
        {/* Document info with enhanced styling */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl" />
          <div className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Effective Date</p>
                <p className="font-bold text-white">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Last Updated</p>
                <p className="font-bold text-white">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Version</p>
                <p className="font-bold text-white">1.1</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Jurisdiction</p>
                <p className="font-bold text-white">Sweden | EU</p>
              </div>
            </div>
          </div>
        </div>

        {/* ENHANCED CONSENT NOTICE with age verification mention */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 blur-xl" />
          <div className="relative bg-green-900/20 border-2 border-green-500/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-green-500 text-2xl">✓</div>
              <p className="font-bold text-xl text-green-400">Acceptance & Consent</p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-3">
              By signing up for TheChessWire.news and checking the consent box during registration, you:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Confirm that you are 18 years old or older and that the information you provide (including your birthdate) is accurate</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Explicitly consent to our data processing as described in our Privacy Policy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Acknowledge the use of cookies for authentication and analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✓</span>
                <span>Agree to automated content moderation and AI processing of your data</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-blue-400">Swedish/EU Residents:</strong> You have full GDPR rights including data access, 
                correction, deletion, and portability. Contact us at <code className="bg-gray-800/50 px-2 py-1 rounded text-blue-400 font-mono text-xs">gdpr@thechesswire.news</code>
              </p>
            </div>
          </div>
        </div>

        <p className="text-lg font-medium">
          Welcome to <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">TheChessWire.news</strong> (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). 
          By accessing, browsing, or using our Platform, you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) agree to be 
          bound by these Terms &amp; Conditions (&quot;Terms&quot;) in their entirety. If you disagree with any
          part of these Terms, you must immediately discontinue use of the Platform and all associated services.
        </p>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            1. Age Restriction & Eligibility
          </h2>
          <div className="bg-red-900/20 border-2 border-red-600/50 rounded-2xl p-6 mb-4 backdrop-blur-sm">
            <p className="font-bold text-red-400 text-xl mb-3">⚠️ IMPORTANT: This Platform is strictly for users aged 18 and above.</p>
            <p className="text-gray-300 mb-4">
              By using TheChessWire.news, you represent and warrant that you are at least 18 years of age. 
              Users under 18 are strictly prohibited from accessing, registering, or using any part of the Platform. 
            </p>
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-600/30">
              <p className="font-semibold text-red-400 mb-2">Age Verification Measures:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Users must provide their birthdate during signup to confirm age eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Automated age verification systems monitor user behavior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>We reserve the right to verify age and request documentation at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Accounts suspected of being operated by minors will be immediately terminated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>No refunds will be provided for terminated minor accounts</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            2. Platform Description & AI Disclosure
          </h2>
          <p className="text-gray-300 mb-4">
            TheChessWire.news is an AI-powered chess journalism and training platform featuring:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              "AI-generated articles, analyses, and multimedia content",
              "Bambai AI voice narration system (synthetic voices)",
              "Automated video generation and social media distribution",
              "EchoSage training system with emotional intelligence features",
              "SoulCinema cinematic chess replay rendering",
              "Automated content aggregation and news summaries"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3">
                <span className="text-purple-500 mt-1">✓</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-yellow-900/20 border-2 border-yellow-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="font-semibold text-yellow-400 mb-3">⚠️ AI Content Warning:</p>
            <p className="text-gray-300 mb-3">
              All content on this Platform is generated, modified, or enhanced using artificial intelligence. 
              This includes but is not limited to articles, voice narrations, video content, analyses, and 
              training materials. AI-generated content may contain inaccuracies, biases, or errors.
            </p>
            <p className="text-gray-300 text-sm font-semibold">
              Users should independently verify information before making decisions based on AI-generated content. 
              TheChessWire.news is not responsible for any reliance on AI-generated content.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            3. Account Registration & Security
          </h2>
          <p className="text-gray-300 mb-4">
            To access certain features, you must create an account. You agree to:
          </p>
          <div className="space-y-3">
            {[
              "Provide accurate, current, and complete information (including accurate birthdate)",
              "Maintain the security of your account credentials",
              "Accept responsibility for all activities under your account",
              "Notify us immediately of any unauthorized access",
              "Not create multiple accounts to circumvent restrictions"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            4. Usage Restrictions & Prohibited Conduct
          </h2>
          <p className="text-gray-300 mb-4">
            You agree NOT to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Submit abusive, defamatory, obscene, or harmful content",
              "Attempt to manipulate, hack, or exploit the Platform",
              "Use automated scripts, bots, or scraping tools",
              "Impersonate others or misrepresent your identity",
              "Upload malicious code, viruses, or harmful content",
              "Violate any applicable laws or regulations",
              "Harass, threaten, or harm other users",
              "Attempt prompt injection or AI manipulation",
              "Share content promoting violence, discrimination, or illegal activities",
              "Circumvent security measures or access restrictions"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-red-500 mt-1">✗</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            5. Zero-Tolerance Abuse Policy
          </h2>
          <div className="bg-red-900/20 border-2 border-red-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="font-bold text-red-400 mb-4 text-xl">⚠️ CRITICAL WARNING - PERMANENT BAN POLICY:</p>
            <p className="mb-4 text-gray-300">
              TheChessWire.news has ZERO TOLERANCE for abusive behavior. Our AI moderation system 
              monitors and detects ALL forms of abuse including but not limited to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {[
                "Profanity, obscenity, or vulgar language (including disguised/obfuscated forms)",
                "Hate speech, discrimination, or harassment of any kind",
                "Threats, intimidation, or violent language",
                "Sexual content or inappropriate material",
                "Leetspeak, emoji combinations, or Unicode tricks to bypass filters",
                "Voice profanity injection in audio submissions",
                "Abusive annotations in PGN files or hidden comments",
                "Toxic behavior patterns detected by behavioral analysis",
                "Any attempt to circumvent moderation systems"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-red-900/30 rounded-lg p-3">
                  <span className="text-red-500 mt-1">⚠️</span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-red-900/40 rounded-lg p-4 border border-red-600/40">
              <p className="font-bold text-red-400 mb-3">IMMEDIATE CONSEQUENCES:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">PERMANENT account termination</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">IP address and device fingerprint ban</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">Loss of ALL content and progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">NO refunds for any subscriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">NO appeals or manual review process</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">NO ability to create new accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-gray-300">Potential legal action for severe violations</span>
                </li>
              </ul>
              <p className="font-bold text-red-400 mt-4 text-lg">
                Detection is AUTOMATED. Bans are PERMANENT. There are NO EXCEPTIONS.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            6. Automated Moderation System
          </h2>
          <p className="text-gray-300 mb-4">
            Our platform employs sophisticated AI-powered moderation that:
          </p>
          <div className="space-y-3">
            {[
              "Monitors all text, voice, and visual content in real-time",
              "Detects abuse patterns across 72+ attack vectors",
              "Analyzes behavioral patterns and typing rhythms",
              "Identifies attempts to manipulate or bypass filters",
              "Makes instant, irreversible moderation decisions"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-purple-500 mt-1">🤖</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 font-bold text-orange-400 bg-orange-900/20 rounded-lg p-4">
            All moderation decisions are final. There is no human review or appeal process.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            7. Subscription &amp; Payment Terms
          </h2>
          <p className="text-gray-300 mb-6">
            TheChessWire.news operates on a freemium model:
          </p>
          
          <div className="bg-green-900/20 border-2 border-green-600/50 rounded-2xl p-6 mb-4 backdrop-blur-sm">
            <p className="font-semibold mb-3 text-green-400">Free Tier - Always Available:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Basic PGN replay and analysis",
                "3 SoulCinema renders per month",
                "Basic Bambai AI voice narration (Calm mode only)",
                "Core security and abuse protection",
                "Basic EchoSage training (limited sessions)",
                "Article reading with basic voice narration",
                "Community features and discussions",
                "Mobile access and basic features"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1 text-sm">✓</span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-900/20 border-2 border-purple-600/50 rounded-2xl p-6 mb-4 backdrop-blur-sm">
            <p className="font-semibold mb-3 text-purple-400">Premium Tier - $9.99/month or $99/year:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Unlimited SoulCinema renders",
                "All Bambai AI voice modes (Calm, Expressive, Dramatic, Poetic, Whisper)",
                "Multi-language support",
                "Unlimited video generation and social media uploads",
                "Advanced EchoSage features",
                "Export capabilities (PGN, video, audio downloads)",
                "Priority support and early access to features",
                "Advanced analytics and tracking"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-purple-500 mt-1 text-sm">✓</span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="mt-4 text-gray-300">
            Premium subscriptions are:
          </p>
          <ul className="space-y-2 mt-2">
            {[
              "Billed automatically until cancelled",
              "Non-refundable except as required by law",
              "Subject to usage limits and fair use policies",
              "May be terminated for Terms violations without refund"
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-6 mt-6 backdrop-blur-sm">
            <p className="font-semibold mb-3 text-gray-300">Platform Monetization Notice:</p>
            <p className="text-gray-300 mb-3">TheChessWire.news generates revenue through:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Google AdSense advertisements on pages and videos",
                "YouTube monetization of chess content",
                "Affiliate links to chess products and services",
                "Sponsorships and brand partnerships",
                "Premium subscriptions (when available)",
                "Donations and supporter contributions"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1 text-sm">💰</span>
                  <span className="text-gray-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-gray-400 text-sm">
              By using the Platform, you accept exposure to advertisements and sponsored content. 
              Ad-blocking software may limit access to certain features.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            8. Titled Player Program
          </h2>
          <p className="text-gray-300 mb-4">
            Verified chess titled players (GM, IM, FM, CM, WGM, WIM, WFM, WCM, AGM, AIM, ACM) receive:
          </p>
          <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-6 border border-yellow-600/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Premium features at no cost",
                "Ad-free experience",
                "Featured article placement",
                "Instant publishing privileges",
                "Special UI badges (crown/star/trophy icons)",
                "Priority in homepage rotation",
                "Voice-based interview narration",
                "Exclusive content creation tools"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">👑</span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              Verification requires valid FIDE ID or recognized chess platform credentials. 
              False claims of titled status result in immediate permanent ban.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            9. Intellectual Property Rights
          </h2>
          <p className="text-gray-300 mb-4">
            All content on TheChessWire.news, including but not limited to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              "AI-generated articles, analyses, and narratives",
              "Bambai AI voice system and recordings",
              "Visual designs, logos, and branding",
              "Software code and algorithms",
              "Video content and animations",
              "User interface and experience design"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-purple-500 mt-1">©</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-300">
            Is owned by TheChessWire.news or its licensors and protected by copyright, trademark, 
            and other intellectual property laws. Unauthorized use, reproduction, or distribution 
            is strictly prohibited and may result in legal action.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            10. Automated Social Media Interactions & Content Aggregation
          </h2>
          <div className="bg-blue-900/20 border-2 border-blue-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="font-semibold mb-3 text-blue-400">Disclosure of Automated Activity:</p>
            <p className="mb-4 text-gray-300">
              TheChessWire.news operates automated systems that interact with social media platforms including but not limited to:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {[
                "YouTube", "TikTok", "Instagram", 
                "X (Twitter)", "Reddit", "Telegram",
                "Substack", "Spotify", "Vimeo", 
                "Locals.com", "Amazon Video", "Twitch"
              ].map((platform, index) => (
                <div key={index} className="bg-blue-900/30 rounded-lg px-3 py-2 text-center">
                  <span className="text-blue-300 text-sm">{platform}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-gray-300 mb-3">
            Our automated systems may:
          </p>
          <div className="space-y-3 mb-4">
            {[
              { action: "Auto-respond", desc: "to comments and mentions with AI-generated replies" },
              { action: "Post content", desc: "automatically across multiple platforms" },
              { action: "Generate videos", desc: "and upload them without human intervention" },
              { action: "Create captions", desc: "hashtags, and descriptions using AI" },
              { action: "Schedule posts", desc: "based on engagement algorithms" },
              { action: "Monitor trends", desc: "and adapt content accordingly" },
              { action: "Aggregate public content", desc: "from chess-related sources for news summaries" },
              { action: "Pull headlines and snippets", desc: "from public posts, blogs, and forums" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-blue-500 font-semibold">{item.action}</span>
                <span className="text-gray-300 text-sm">{item.desc}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/50">
            <p className="font-semibold text-gray-200 mb-3">Important Notices:</p>
            <ul className="space-y-2">
              {[
                "All @thechesswirenews social media accounts are operated by AI",
                "Interactions, responses, and content are generated automatically",
                "We aggregate only publicly available content with proper attribution",
                "We do not reproduce copyrighted material beyond fair use limits",
                "Users may be featured in our automated content if they interact with our accounts"
              ].map((notice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">⚠️</span>
                  <span className="text-gray-300 text-sm">{notice}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-gray-300">
            By using our Platform, you consent to potential automated interactions with your social media 
            content if you mention, tag, or engage with @thechesswirenews accounts. You also acknowledge 
            that your public chess-related content may be aggregated and summarized by our AI systems.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            11. User-Generated Content
          </h2>
          <p className="text-gray-300 mb-4">
            By submitting content to the Platform, you:
          </p>
          <div className="space-y-3">
            {[
              "Grant us a worldwide, perpetual, irrevocable, royalty-free license to use, modify, reproduce, and distribute your content",
              "Warrant that you own or have rights to the content",
              "Agree that your content may be used to train or improve our AI systems",
              "Accept that we may moderate, edit, or remove content at our discretion"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-800/20 rounded-lg p-3">
                <span className="text-green-500 mt-1">📝</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ENHANCED Section 12 - Privacy &amp; Data Protection with third-party sharing clarity */}
        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            12. Privacy &amp; Data Protection
          </h2>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <p className="text-gray-300 mb-4">
              Your use of the Platform is subject to our Privacy Policy. We implement industry-standard 
              security measures including encryption, secure protocols, and regular security audits. 
              However, no system is completely secure, and we cannot guarantee absolute security.
            </p>
            <div className="bg-blue-900/20 rounded-lg p-4 mt-4">
              <p className="font-semibold text-blue-400 mb-2">Data Processing Notice:</p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>We process data in compliance with GDPR and Swedish data protection laws</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Personal data may be shared with third-party processors (e.g., AWS, Stripe) solely for service provision</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>All third parties are contractually bound to protect your data in compliance with GDPR</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>You can request data access, correction, or deletion at any time</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            13. Disclaimers & Limitation of Liability
          </h2>
          <div className="bg-orange-900/20 border-2 border-orange-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="font-bold mb-3 text-orange-400">IMPORTANT DISCLAIMERS:</p>
            <ul className="space-y-2">
              {[
                "The Platform is provided \"AS IS\" without warranties of any kind",
                "We do not guarantee accuracy, completeness, or reliability of AI-generated content",
                "We are not responsible for user decisions based on Platform content",
                "We disclaim all warranties, express or implied"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">⚠️</span>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 p-4 bg-red-900/20 border border-red-600/50 rounded-xl">
            <p className="font-bold text-red-400">
              LIMITATION OF LIABILITY: TO THE MAXIMUM EXTENT PERMITTED BY LAW, THECHESSWIRE.NEWS SHALL NOT 
              BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY 
              LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            14. Indemnification
          </h2>
          <p className="text-gray-300">
            You agree to defend, indemnify, and hold harmless TheChessWire.news, its officers, directors, 
            employees, agents, and affiliates from and against any claims, liabilities, damages, losses, 
            and expenses, including reasonable attorney&apos;s fees, arising out of or in any way connected 
            with your access to or use of the Platform, violation of these Terms, or infringement of 
            any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            15. Termination
          </h2>
          <p className="text-gray-300">
            We reserve the right to terminate or suspend your account and access to the Platform at any 
            time, without prior notice or liability, for any reason, including but not limited to breach 
            of these Terms. Upon termination, your right to use the Platform will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            16. Dispute Resolution & Arbitration
          </h2>
          <p className="text-gray-300">
            Any disputes arising from these Terms or your use of the Platform shall be resolved through 
            binding arbitration in accordance with Swedish arbitration law. You waive any right to jury 
            trial or class action litigation.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            17. Governing Law & Jurisdiction
          </h2>
          <p className="text-gray-300">
            These Terms are governed by Swedish law and international treaties including GDPR. 
            Any legal disputes will be resolved exclusively in Swedish courts located in Göteborg, 
            Västra Götaland, Sweden.
          </p>
        </section>

        {/* ENHANCED Section 18 - Changes to Terms with notification */}
        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            18. Changes to Terms
          </h2>
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-gray-300 mb-3">
              We reserve the right to modify these Terms at any time. When we make changes:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>The updated Terms will be posted on this page with a new &quot;Last Updated&quot; date</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>For significant changes, we will notify you via email or Platform notification</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Your continued use after changes constitutes acceptance of the modified Terms</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>We encourage you to review these Terms periodically</span>
              </li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              If you disagree with any changes, you must stop using the Platform immediately.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            19. Severability
          </h2>
          <p className="text-gray-300">
            If any provision of these Terms is found to be unenforceable or invalid, that provision 
            shall be limited or eliminated to the minimum extent necessary, and the remaining provisions 
            shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            20. Contact Information
          </h2>
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <p className="text-gray-300 mb-4">
              For legal matters or Terms-related inquiries only:
            </p>
            <div className="space-y-3">
              <p className="text-lg">
                General: <code className="bg-gray-900 px-4 py-2 rounded-lg text-blue-400 font-mono">legal@thechesswire.news</code>
              </p>
              <p className="text-lg">
                GDPR: <code className="bg-gray-900 px-4 py-2 rounded-lg text-blue-400 font-mono">gdpr@thechesswire.news</code>
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Note: This email is strictly for legal correspondence. For support, please use the 
              in-platform help system.
            </p>
          </div>
        </section>

        <div className="mt-16 pt-8 border-t border-gray-700/50">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
            <p className="text-gray-300 font-semibold mb-3">
              By using TheChessWire.news, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms &amp; Conditions.
            </p>
            <p className="text-gray-400 text-sm">
              This agreement constitutes the entire agreement between you and TheChessWire.news concerning 
              your use of the Platform and supersedes all prior agreements.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-6">
            <span>Document Version: 1.1</span>
            <span>•</span>
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Terms Hash: terms-v1.1-20250702</span>
          </div>
        </div>
      </div>
    </main>
  );
}
