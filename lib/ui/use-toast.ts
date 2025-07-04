// File: /lib/ui/use-toast.ts

import { useCallback, useState } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let idCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return { toasts, showToast };
}
