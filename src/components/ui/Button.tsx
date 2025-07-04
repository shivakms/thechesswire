// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "epic";
  glow?: boolean;
  pulse?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  chessEffect?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    glow = false, 
    pulse = false,
    size = "md",
    chessEffect = true,
    children,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = useState<Array<{x: number, y: number, id: number}>>([]);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props.onClick) props.onClick(e);
      
      // Create ripple effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 1000);
    };
    
    const sizes = {
      sm: "px-4 py-2 text-xs md:text-sm",
      md: "px-6 py-3 text-sm md:text-base",
      lg: "px-8 py-4 text-base md:text-lg",
      xl: "px-10 py-5 text-lg md:text-xl",
    };
    
    const base = clsx(
      "relative overflow-hidden font-bold rounded-2xl transition-all duration-500",
      "transform hover:scale-105 active:scale-95",
      "focus:outline-none focus:ring-4",
      "shadow-lg hover:shadow-2xl",
      "backdrop-blur-sm",
      sizes[size]
    );
    
    const variants = {
      primary: clsx(
        "bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400",
        "text-black hover:from-yellow-300 hover:via-amber-300 hover:to-orange-300",
        "focus:ring-yellow-400/50",
        "shadow-[0_4px_20px_rgba(251,191,36,0.3)]",
        "hover:shadow-[0_8px_30px_rgba(251,191,36,0.5)]",
        "border border-yellow-300/30"
      ),
      secondary: clsx(
        "bg-gradient-to-br from-gray-800 via-gray-900 to-black",
        "text-white hover:from-gray-700 hover:via-gray-800 hover:to-gray-900",
        "focus:ring-gray-400/50",
        "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)]",
        "border border-gray-600/50"
      ),
      ghost: clsx(
        "bg-gradient-to-br from-transparent to-transparent",
        "hover:from-white/10 hover:to-white/5",
        "text-white border-2 border-white/30 hover:border-white/60",
        "focus:ring-white/30",
        "shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        "hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
      ),
      danger: clsx(
        "bg-gradient-to-br from-red-600 via-red-500 to-pink-600",
        "text-white hover:from-red-500 hover:via-red-400 hover:to-pink-500",
        "focus:ring-red-400/50",
        "shadow-[0_4px_20px_rgba(239,68,68,0.3)]",
        "hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)]",
        "border border-red-400/30"
      ),
      epic: clsx(
        "bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600",
        "text-white hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500",
        "focus:ring-purple-400/50",
        "shadow-[0_4px_20px_rgba(147,51,234,0.3)]",
        "hover:shadow-[0_8px_30px_rgba(147,51,234,0.5)]",
        "border border-purple-400/30",
        "animate-gradient-shift"
      ),
    };
    
    const glowClass = glow ? clsx(
      "before:absolute before:inset-0 before:rounded-2xl",
      "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      "before:translate-x-[-200%] hover:before:translate-x-[200%]",
      "before:transition-transform before:duration-1000"
    ) : "";
    
    const pulseClass = pulse ? "animate-pulse-glow" : "";
    
    const chessClass = chessEffect ? clsx(
      "after:absolute after:inset-0 after:rounded-2xl",
      "after:bg-[url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M0 0h20v20H0V0zm20 20h20v20H20V20z\"/%3E%3C/g%3E%3C/svg%3E')]",
      "after:pointer-events-none"
    ) : "";

    return (
      <button
        ref={ref}
        className={clsx(
          base, 
          variants[variant], 
          glowClass, 
          pulseClass,
          chessClass,
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="block w-full h-full bg-white/30 rounded-full animate-ripple-expand" />
          </span>
        ))}
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        
        {/* Chess piece decorations for epic variant */}
        {variant === "epic" && (
          <>
            <span className="absolute top-1 left-2 text-2xl opacity-10">♔</span>
            <span className="absolute bottom-1 right-2 text-2xl opacity-10">♕</span>
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;