"use client";

import React from "react";
// import Button from "@/components/ui/Button";

export default function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-muted-foreground">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>&copy; {new Date().getFullYear()} TheChessWire.news</span>

        <a href="/terms" className="px-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Terms & Conditions
        </a>

        <a href="/privacy" className="px-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
