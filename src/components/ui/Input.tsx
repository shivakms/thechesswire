// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  variant?: "default" | "floating" | "neon" | "glass";
  chessPattern?: boolean;
  magneticLabel?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    placeholder,
    icon,
    variant = "default",
    chessPattern = true,
    magneticLabel = true,
    onFocus,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };
    
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current && magneticLabel) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / 10;
          const y = (e.clientY - rect.top - rect.height / 2) / 10;
          setMousePos({ x, y });
        }
      };
      
      if (isFocused) {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
      }
    }, [isFocused, magneticLabel]);
    
    const base = clsx(
      "w-full transition-all duration-500",
      "text-white placeholder-transparent",
      "focus:outline-none",
      "peer"
    );
    
    const variants = {
      default: clsx(
        "px-5 py-3.5 rounded-2xl",
        "bg-gradient-to-br from-gray-900/90 to-black/90",
        "border-2 border-gray-700/50",
        "hover:border-gray-600/70",
        "focus:border-yellow-400/70",
        "shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]",
        "hover:shadow-[inset_0_2px_15px_rgba(0,0,0,0.4)]",
        "focus:shadow-[0_0_30px_rgba(251,191,36,0.3),inset_0_2px_15px_rgba(0,0,0,0.5)]",
        "backdrop-blur-xl"
      ),
      floating: clsx(
        "px-5 pt-7 pb-2 rounded-2xl",
        "bg-gradient-to-br from-gray-900/80 to-black/80",
        "border-2 border-transparent",
        "bg-clip-padding",
        "before:absolute before:inset-0 before:rounded-2xl",
        "before:bg-gradient-to-br before:from-yellow-400/20 before:to-orange-400/20",
        "before:blur-xl before:opacity-0 focus:before:opacity-100",
        "before:transition-opacity before:duration-500",
        "shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
        "hover:shadow-[0_15px_50px_rgba(0,0,0,0.6)]",
        "focus:shadow-[0_20px_60px_rgba(251,191,36,0.3)]"
      ),
      neon: clsx(
        "px-5 py-3.5 rounded-2xl",
        "bg-black/80",
        "border-2 border-purple-500/50",
        "hover:border-purple-400/70",
        "focus:border-purple-300",
        "shadow-[0_0_20px_rgba(168,85,247,0.3),inset_0_0_20px_rgba(168,85,247,0.1)]",
        "hover:shadow-[0_0_30px_rgba(168,85,247,0.4),inset_0_0_25px_rgba(168,85,247,0.15)]",
        "focus:shadow-[0_0_40px_rgba(168,85,247,0.6),inset_0_0_30px_rgba(168,85,247,0.2)]",
        "text-purple-100 placeholder-purple-300/50"
      ),
      glass: clsx(
        "px-5 py-3.5 rounded-2xl",
        "bg-white/5",
        "border border-white/20",
        "hover:border-white/30",
        "focus:border-white/50",
        "backdrop-blur-2xl backdrop-saturate-200",
        "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
        "hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]",
        "focus:shadow-[0_16px_48px_rgba(255,255,255,0.1)]"
      )
    };
    
    const patternClass = chessPattern ? clsx(
      "before:absolute before:inset-0 before:rounded-2xl",
      "before:bg-[url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.02\"%3E%3Cpath d=\"M0 0h10v10H0V0zm10 10h10v10H10V10z\"/%3E%3C/g%3E%3C/svg%3E')]",
      "before:pointer-events-none before:opacity-50"
    ) : "";

    return (
      <div 
        ref={containerRef}
        className={clsx(
          "relative group",
          variant === "floating" && "pt-2"
        )}
      >
        {/* Background effects */}
        <div className={clsx(
          "absolute inset-0 rounded-2xl transition-all duration-500",
          isFocused && "animate-pulse-subtle"
        )} />
        
        {/* Icon */}
        {icon && (
          <div className={clsx(
            "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400",
            "transition-all duration-300 z-10",
            isFocused && "text-yellow-400 scale-110",
            variant === "floating" && "top-[60%]"
          )}>
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          className={clsx(
            base,
            variants[variant],
            patternClass,
            icon && "pl-12",
            className
          )}
          placeholder={variant === "floating" ? " " : placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {/* Floating label */}
        {variant === "floating" && placeholder && (
          <label 
            className={clsx(
              "absolute left-5 transition-all duration-300 pointer-events-none",
              "text-gray-400",
              icon && "left-12",
              (isFocused || hasValue) ? clsx(
                "top-2 text-xs",
                isFocused && "text-yellow-400"
              ) : "top-1/2 -translate-y-1/2"
            )}
            style={{
              transform: magneticLabel && (isFocused || hasValue) 
                ? `translate(${mousePos.x}px, ${mousePos.y}px) ${(isFocused || hasValue) ? 'translateY(0)' : 'translateY(-50%)'}`
                : undefined
            }}
          >
            {placeholder}
          </label>
        )}
        
        {/* Focus ring animation */}
        <div className={clsx(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "border-2 border-transparent",
          "transition-all duration-500",
          isFocused && "border-yellow-400/20 scale-105 animate-focus-ring"
        )} />
        
        {/* Chess notation hint */}
        {variant === "default" && isFocused && (
          <div className="absolute -bottom-6 left-0 text-xs text-gray-500 animate-fade-in">
            <span className="opacity-60">♔ ♕ ♖ ♗ ♘ ♙</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;