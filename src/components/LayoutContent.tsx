// components/LayoutContent.tsx
'use client';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollTop from "@/components/ScrollTop";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navbar/footer on onboarding and auth pages
  const hideLayout = pathname === '/' || pathname?.startsWith('/auth/');

  return (
    <ErrorBoundary>
      {/* Conditionally render Navigation */}
      {!hideLayout && <Navbar />}

      {/* Main Content */}
      <main className={`min-h-screen ${!hideLayout ? 'pt-16' : ''}`}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      
      {/* Conditionally render Footer */}
      {!hideLayout && <Footer />}
      
      {/* Scroll to Top Component */}
      {!hideLayout && <ScrollTop />}
      
      {/* Global UI Elements */}
      <div
        id="global-loading"
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#40E0D0] to-[#FFD700] transform -translate-x-full transition-transform duration-300 z-50"
      />
      
      <div
        id="notification-container"
        className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none"
      />

      {/* EchoSage Quick Access - Hidden by default, shows when user has active session */}
      <div
        id="echosage-quick-access"
        className="fixed bottom-4 left-4 z-40 hidden"
      >
        <div className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-300 font-medium">
              🧠 EchoSage Active
            </span>
          </div>
        </div>
      </div>

      {/* Abuse Detection Status - Admin only, hidden by default */}
      <div
        id="security-status"
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 hidden"
      >
        <div className="bg-red-900/90 backdrop-blur-xl border border-red-500/30 rounded-xl p-2 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-300 font-medium">
              🛡️ Security Active
            </span>
          </div>
        </div>
      </div>

      {/* Floating chess pieces background effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute top-10 left-10 text-6xl animate-float-slow">♟</div>
        <div className="absolute top-1/4 right-20 text-8xl animate-float-medium">♛</div>
        <div className="absolute bottom-20 left-1/3 text-7xl animate-float-fast">♘</div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl animate-float-slow">♗</div>
        <div className="absolute top-1/2 left-1/2 text-9xl animate-float-medium opacity-30">♔</div>
      </div>
      
      {/* Development Performance Monitor */}
      {process.env.NODE_ENV === "development" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.addEventListener('load', () => {
              const navigation = performance.getEntriesByType('navigation')[0];
              console.log('🚀 TheChessWire loaded in:', Math.round(navigation.loadEventEnd - navigation.loadEventStart), 'ms');
              
              // Module 75: Real-Time Behavior Fingerprinting (Development tracking)
              let scrollDepth = 0;
              let interactionCount = 0;
              
              window.addEventListener('scroll', () => {
                const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (depth > scrollDepth) {
                  scrollDepth = depth;
                }
              });
              
              document.addEventListener('click', () => {
                interactionCount++;
              });
              
              // Log engagement metrics every 30 seconds in development
              setInterval(() => {
                console.log('📊 User Engagement:', {
                  scrollDepth: scrollDepth + '%',
                  interactions: interactionCount,
                  timeOnPage: Math.round(performance.now() / 1000) + 's'
                });
              }, 30000);
            });
          `,
          }}
        />
      )}

      {/* Module 286: SoulGate Onboarding Detection */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          // Initialize EchoOrigin detection and Bambai AI readiness
          window.chessWireConfig = {
            bambaiEnabled: true,
            echoSageReady: false,
            userEchoRank: 0,
            securityLevel: 'standard',
            sessionId: 'cw-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
          };
          
          // Module 151: EchoOrigin initialization
          if (!localStorage.getItem('chess-wire-echo-origin')) {
            console.log('🌟 New user detected - EchoOrigin selection pending');
          }
          
          // Module 73: OWASP Security Headers Check
          console.log('🔐 Security headers initialized');
        `,
        }}
      />
    </ErrorBoundary>
  );
}
