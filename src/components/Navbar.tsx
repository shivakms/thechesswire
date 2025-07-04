// components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Volume2, VolumeX } from "lucide-react";

// Logo Component
function ChessWireLogo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const dimensions = {
    small: { logoSize: 28, text: "text-sm" },
    default: { logoSize: 36, text: "text-base" },
    large: { logoSize: 48, text: "text-xl" }
  };

  const { logoSize, text } = dimensions[size];

  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <Image
          src="/assets/chesswire-logo-white.svg"
          alt="TheChessWire Logo"
          width={logoSize}
          height={logoSize}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
          priority
        />
        {/* Enhanced glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-20 -z-10 transition-all duration-300 group-hover:opacity-40"
          style={{
            background: 'radial-gradient(circle, #40E0D0 0%, #FFD700 50%, transparent 70%)',
            width: logoSize * 1.5,
            height: logoSize * 1.5,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
      
      <div className="flex flex-col">
        <span className={`${text} font-bold text-gradient-primary leading-tight transition-colors duration-300`}>
          TheChessWire
        </span>
        <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-[#40E0D0] font-medium -mt-1 transition-colors duration-300 group-hover:text-[#FFD700]`}>
          .news
        </span>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Navigation items
  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/replay", label: "Replay Theater", icon: "🎭" },
    { href: "/echosage", label: "EchoSage", icon: "🧠" },
    { href: "/soulcinema", label: "SoulCinema", icon: "🎬" },
    { href: "/stories", label: "Stories", icon: "📚" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050B14]/98 backdrop-blur-2xl shadow-lg shadow-[#40E0D0]/5' : 'bg-[#050B14]/95 backdrop-blur-xl'
      } border-b border-[#40E0D0]/20`}>
        {/* Animated gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#40E0D0] to-transparent opacity-50 animate-shimmer" />
        
        <div className="container-chess">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <ChessWireLogo size="default" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link group relative ${
                    pathname === item.href ? 'text-[#40E0D0]' : ''
                  }`}
                >
                  <span className="relative z-10">
                    {item.icon} {item.label}
                  </span>
                  <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                    pathname === item.href 
                      ? 'bg-gradient-to-r from-[#40E0D0]/20 to-[#FFD700]/20' 
                      : 'bg-gradient-to-r from-[#40E0D0]/0 to-[#40E0D0]/0 group-hover:from-[#40E0D0]/10 group-hover:to-[#FFD700]/10'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Voice Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-[#40E0D0]/20 hover:border-[#40E0D0]/40 transition-all duration-300"
                title={voiceEnabled ? "Disable Bambai AI Voice" : "Enable Bambai AI Voice"}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#40E0D0]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-xs text-gray-400">Voice</span>
              </button>

              {/* Sign In Button */}
              <Link href="/login" className="hidden md:block">
                <button className="btn-ghost relative overflow-hidden group">
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0]/0 to-[#FFD700]/0 group-hover:from-[#40E0D0]/20 group-hover:to-[#FFD700]/20 transition-all duration-300" />
                </button>
              </Link>

              {/* Join Now Button */}
              <Link href="/signup">
                <button className="btn-primary relative overflow-hidden group shadow-lg shadow-[#40E0D0]/20 hover:shadow-[#FFD700]/30 transition-all duration-300">
                  <span className="relative z-10 font-semibold">Join Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#40E0D0] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#40E0D0] to-[#FFD700]" />
                </button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-x-0 top-16 z-40 md:hidden transition-all duration-300 transform ${
        mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-[#050B14]/98 backdrop-blur-2xl border-b border-[#40E0D0]/20 shadow-2xl">
          <div className="container-chess py-4 space-y-2">
            {/* Mobile Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                  pathname === item.href 
                    ? 'bg-gradient-to-r from-[#40E0D0]/20 to-[#FFD700]/20 text-[#40E0D0]' 
                    : 'hover:bg-white/5'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            
            {/* Mobile Voice Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all duration-300"
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5 text-[#40E0D0]" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <span className="text-sm">Bambai AI Voice {voiceEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>

            {/* Mobile Action Buttons */}
            <div className="pt-4 space-y-2 border-t border-[#40E0D0]/10">
              <Link href="/login" className="block">
                <button className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                  Sign In
                </button>
              </Link>
              <Link href="/signup" className="block">
                <button className="w-full py-3 rounded-lg bg-gradient-to-r from-[#40E0D0] to-[#FFD700] text-black font-semibold hover:shadow-lg hover:shadow-[#40E0D0]/30 transition-all duration-300">
                  Join Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Voice Status Indicator (Moved from layout) */}
      {voiceEnabled && (
        <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
          <div className="bg-black/90 backdrop-blur-xl border border-green-500/30 rounded-xl p-3 shadow-2xl shadow-green-500/20 opacity-0 transition-opacity duration-300" id="voice-indicator">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm text-green-300 font-medium">
                🗣️ Bambai AI listening...
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}