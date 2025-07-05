// File: src/components/PageTransition.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { FullscreenLoader } from "./Loader";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  // Determine loader variant and message based on route
  const getLoaderConfig = (path: string) => {
    if (path.startsWith('/replay') || path.startsWith('/analysis')) {
      return { variant: 'chess' as const, message: "Preparing the board..." };
    }
    if (path.startsWith('/echosage')) {
      return { variant: 'voice' as const, message: "Awakening EchoSage..." };
    }
    if (path.startsWith('/soulcinema')) {
      return { variant: 'soulcinema' as const, message: "Loading cinematic experience..." };
    }
    if (path.startsWith('/admin') || path.startsWith('/security')) {
      return { variant: 'security' as const, message: "Verifying security..." };
    }
    return { variant: 'default' as const, message: "Loading experience..." };
  };

  // Simulate loading for dramatic effect (remove in production for instant transitions)
  useEffect(() => {
    setIsLoading(true);
    const config = getLoaderConfig(pathname || '/');
    setLoadingMessage(config.message);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Adjust timing as needed
    
    return () => clearTimeout(timer);
  }, [pathname]);

  // Define different transition styles based on route type
  const transitionConfig = useMemo(() => {
    // Chess-themed transitions for different sections
    if (pathname?.startsWith('/replay') || pathname?.startsWith('/analysis')) {
      return {
        initial: { opacity: 0, scale: 0.95, rotateX: -10, filter: "blur(10px)" },
        animate: { opacity: 1, scale: 1, rotateX: 0, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 1.05, rotateX: 10, filter: "blur(10px)" },
        transition: { duration: 0.6, ease: "easeInOut" }
      };
    }
    
    if (pathname?.startsWith('/articles')) {
      return {
        initial: { opacity: 0, y: 40, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -40, filter: "blur(8px)" },
        transition: { duration: 0.5, ease: "easeInOut" }
      };
    }

    if (pathname?.startsWith('/soulcinema')) {
      return {
        initial: { opacity: 0, scale: 1.1, filter: "brightness(0.3) blur(20px)" },
        animate: { opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" },
        exit: { opacity: 0, scale: 0.9, filter: "brightness(0.3) blur(20px)" },
        transition: { duration: 0.8, ease: "easeInOut" }
      };
    }

    if (pathname?.startsWith('/onboarding') || pathname === '/') {
      return {
        initial: { opacity: 0, scale: 0.9, y: 30 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 1.1, y: -30 },
        transition: { 
          duration: 0.7, 
          ease: "easeInOut"
        }
      };
    }

    // Default elegant transition
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.4, ease: "easeInOut" }
    };
  }, [pathname]);

  const loaderConfig = getLoaderConfig(pathname || '/');

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <FullscreenLoader 
            message={loadingMessage} 
            variant={loaderConfig.variant}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className={`relative ${className}`}
          initial={transitionConfig.initial}
          animate={transitionConfig.animate}
          exit={transitionConfig.exit}
          transition={{ duration: 0.4 }}
          style={{
            background: pathname?.startsWith('/replay') 
              ? 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.03) 0%, transparent 70%)'
              : pathname?.startsWith('/soulcinema')
              ? 'radial-gradient(ellipse at center, rgba(64, 224, 208, 0.02) 0%, transparent 70%)'
              : undefined
          }}
        >
          {/* Chess-themed decorative elements for replay pages */}
          {pathname?.startsWith('/replay') && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              {/* Animated chess board pattern */}
              <motion.div
                className="absolute inset-0 chess-board-pattern opacity-5"
                animate={{ 
                  backgroundPosition: ["0px 0px", "40px 40px"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Floating pieces */}
              <motion.div
                className="absolute top-1/4 left-1/4 text-8xl opacity-10 text-amber-800/30 font-serif"
                animate={{
                  rotate: [0, 360],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ♔
              </motion.div>
              <motion.div
                className="absolute bottom-1/3 right-1/3 text-6xl opacity-10 text-amber-900/30 font-serif"
                animate={{
                  rotate: [0, -360],
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ♞
              </motion.div>
            </motion.div>
          )}

          {/* SoulCinema film strip effect */}
          {pathname?.startsWith('/soulcinema') && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.03 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          )}

          {/* Ambient particles for voice/AI pages */}
          {pathname?.startsWith('/echosage') && (
            <motion.div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-accent/20 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
