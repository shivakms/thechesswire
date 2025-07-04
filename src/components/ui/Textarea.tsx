// src/components/ui/Textarea.tsx
import { TextareaHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "story" | "whisper" | "analysis";
  showCharCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  chessQuotes?: boolean;
}

const chessQuotes = [
  "Every chess master was once a beginner...",
  "The beauty of a move lies not in its appearance...",
  "In the endgame, the king becomes a fighting piece...",
  "Chess is the struggle against error...",
  "The hardest game to win is a won game..."
];

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    variant = "default",
    showCharCount = false,
    maxLength,
    autoResize = true,
    chessQuotes: showQuotes = true,
    placeholder,
    onFocus,
    onBlur,
    onChange,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [currentQuote, setCurrentQuote] = useState("");
    const [glowIntensity, setGlowIntensity] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Auto-resize functionality
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea && autoResize) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [charCount, autoResize]);
    
    // Random quote on focus
    useEffect(() => {
      if (isFocused && showQuotes) {
        const quote = chessQuotes[Math.floor(Math.random() * chessQuotes.length)];
        setCurrentQuote(quote);
      }
    }, [isFocused, showQuotes]);
    
    // Dynamic glow based on typing
    useEffect(() => {
      if (isFocused) {
        const interval = setInterval(() => {
          setGlowIntensity(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
      }
    }, [isFocused]);
    
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };
    
    const base = clsx(
      "w-full transition-all duration-500",
      "text-white placeholder-gray-400",
      "focus:outline-none",
      "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent",
      autoResize ? "resize-none overflow-hidden" : "resize-y"
    );
    
    const variants = {
      default: clsx(
        "px-5 py-4 rounded-2xl",
        "bg-gradient-to-br from-gray-900/90 to-black/90",
        "border-2 border-gray-700/50",
        "hover:border-gray-600/70",
        "focus:border-yellow-400/70",
        "shadow-[inset_0_2px_15px_rgba(0,0,0,0.3)]",
        "hover:shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]",
        "focus:shadow-[0_0_40px_rgba(251,191,36,0.3),inset_0_2px_20px_rgba(0,0,0,0.5)]",
        "backdrop-blur-xl"
      ),
      story: clsx(
        "px-6 py-5 rounded-3xl",
        "bg-gradient-to-br from-amber-950/20 to-black/80",
        "border-2 border-amber-800/30",
        "hover:border-amber-700/50",
        "focus:border-amber-500/70",
        "shadow-[0_0_50px_rgba(217,119,6,0.1),inset_0_0_30px_rgba(0,0,0,0.5)]",
        "focus:shadow-[0_0_70px_rgba(217,119,6,0.2),inset_0_0_40px_rgba(217,119,6,0.1)]",
        "font-serif text-amber-50"
      ),
      whisper: clsx(
        "px-5 py-4 rounded-2xl",
        "bg-gradient-to-br from-indigo-950/30 to-purple-950/30",
        "border border-indigo-500/20",
        "hover:border-indigo-400/30",
        "focus:border-indigo-300/50",
        "shadow-[0_20px_50px_rgba(99,102,241,0.1),inset_0_0_30px_rgba(99,102,241,0.05)]",
        "focus:shadow-[0_30px_70px_rgba(99,102,241,0.2),inset_0_0_40px_rgba(99,102,241,0.1)]",
        "text-indigo-100 placeholder-indigo-300/40",
        "backdrop-blur-2xl"
      ),
      analysis: clsx(
        "px-5 py-4 rounded-2xl",
        "bg-black/90",
        "border-2 border-green-500/30",
        "hover:border-green-400/50",
        "focus:border-green-300/70",
        "shadow-[0_0_30px_rgba(34,197,94,0.2),inset_0_0_20px_rgba(0,0,0,0.7)]",
        "focus:shadow-[0_0_50px_rgba(34,197,94,0.3),inset_0_0_30px_rgba(34,197,94,0.1)]",
        "font-mono text-green-100 placeholder-green-300/40"
      )
    };
    
    const glowStyle = isFocused ? {
      boxShadow: variants[variant].includes('shadow') 
        ? undefined 
        : `0 0 ${20 + glowIntensity / 5}px rgba(251, 191, 36, ${0.2 + glowIntensity / 500})`
    } : {};

    return (
      <div ref={containerRef} className="relative group">
        {/* Background pattern */}
        <div className={clsx(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.01\"%3E%3Cpath d=\"M0 0h20v20H0V0zm20 20h20v20H20V20z\"/%3E%3C/g%3E%3C/svg%3E')]",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
        )} />
        
        {/* Floating chess pieces decoration */}
        {variant === "story" && (
          <div className="absolute -top-3 -right-3 text-4xl text-amber-500/10 animate-float">
            ♛
          </div>
        )}
        
        {/* Main textarea */}
        <textarea
          ref={(node) => {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
            textareaRef.current = node;
          }}
          className={clsx(base, variants[variant], className)}
          placeholder={placeholder}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={glowStyle}
          {...props}
        />
        
        {/* Character count */}
        {showCharCount && (
          <div className={clsx(
            "absolute bottom-3 right-3 text-xs transition-all duration-300",
            charCount > (maxLength || 0) * 0.9 ? "text-red-400" : "text-gray-500",
            isFocused && "text-gray-400"
          )}>
            {charCount}{maxLength && `/${maxLength}`}
          </div>
        )}
        
        {/* Chess quote on focus */}
        {showQuotes && isFocused && currentQuote && (
          <div className="absolute -top-8 left-0 text-xs text-gray-400 italic animate-fade-in-up">
            {currentQuote}
          </div>
        )}
        
        {/* Typing indicator */}
        {variant === "whisper" && isFocused && charCount > 0 && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-2 text-xs text-indigo-400">
            <span className="animate-pulse">Bambai AI is listening...</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
        
        {/* Analysis mode indicators */}
        {variant === "analysis" && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Stockfish Ready</span>
          </div>
        )}
        
        {/* Border glow effect */}
        <div className={clsx(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent",
          "opacity-0 transition-opacity duration-1000",
          isFocused && "opacity-100 animate-border-flow"
        )} />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;