"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";

export default function Footer() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <footer className="w-full py-6 text-center text-sm text-muted-foreground">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
        <span>&copy; {new Date().getFullYear()} TheChessWire.news</span>

        <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="px-2 text-xs">
              Terms & Conditions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-scroll">
            <DialogTitle>Terms & Conditions</DialogTitle>
            <div>
              <p>
                Please read our{" "}
                <a href="/terms" className="underline text-blue-500">
                  full Terms & Conditions
                </a>{" "}
                carefully before using the platform.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="px-2 text-xs">
              Privacy Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-scroll">
            <DialogTitle>Privacy Policy</DialogTitle>
            <div>
              <p>
                Please review our{" "}
                <a href="/privacy" className="underline text-blue-500">
                  Privacy Policy
                </a>{" "}
                for details on how we protect your data.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}
