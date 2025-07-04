// src/components/Footer.tsx
'use client';

import Link from "next/link";

export default function Footer() {

  return (
    <>
      <footer className="relative w-full border-t border-violet-500/20 bg-gradient-to-b from-[#050B14] to-[#0A1120] py-12 mt-16 overflow-hidden">
        {/* Background Chess Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-8 text-6xl">♟</div>
          <div className="absolute top-12 right-16 text-4xl">♞</div>
          <div className="absolute bottom-8 left-20 text-5xl">♜</div>
          <div className="absolute bottom-4 right-8 text-3xl">♛</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">♟️</span>
                <h3 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  TheChessWire.news
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The world&apos;s most intelligent chess journalism platform, powered by Bambai AI voice narration. 
                Experience chess like never before.
              </p>
              <div className="flex space-x-4">
                <Link href="https://youtube.com/@thechesswirenews" className="text-gray-400 hover:text-red-400 transition-colors">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </Link>
                <Link href="https://twitter.com/thechesswirenews" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link href="https://tiktok.com/@thechesswirenews" className="text-gray-400 hover:text-pink-400 transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.05z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Platform</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/articles" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Articles
                </Link>
                <Link href="/replay" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Game Replay
                </Link>
                <Link href="/echorage" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  EchoSage AI
                </Link>
                <Link href="/soulcinema" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  SoulCinema
                </Link>
                <Link href="/dashboard" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Dashboard
                </Link>
                <Link href="/premium" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Premium
                </Link>
              </div>
            </div>

            {/* Legal & Support */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Support</h4>
              <div className="flex flex-col space-y-2">
                <Link href="/help" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Help Center
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Contact Us
                </Link>
                <Link href="/titled-players" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  Titled Players
                </Link>
                <Link href="/api" className="text-gray-400 hover:text-violet-400 transition-colors text-sm">
                  API Docs
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-violet-500/10">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-gray-400">
                  © {new Date().getFullYear()} TheChessWire.news — Powered by Bambai AI
                </span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
                <div className="flex items-center space-x-1 text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs">All systems operational</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bambai AI Attribution */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 italic">
              &quot;Where chess meets soul, and every move tells a story.&quot; — Bambai AI
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
