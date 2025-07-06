'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Button from './Button';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => handleOpenChange(false)}
          />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  const handleClick = () => context.onOpenChange(true);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick
    });
  }

  return (
    <Button onClick={handleClick}>
      {children}
    </Button>
  );
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

export function DialogContent({ className = '', children }: DialogContentProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogContent must be used within Dialog');

  if (!context.open) return null;

  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h2 className={`text-xl font-semibold mb-4 ${className}`}>
      {children}
    </h2>
  );
}
