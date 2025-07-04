// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TheChessWire.news - Intelligent Chess Journalism",
  description:
    "The world's most intelligent chess journalism platform, powered by Bambai AI voice narration. Experience chess like never before.",
  keywords: "chess, AI, journalism, games, analysis, voice narration, Bambai AI, EchoSage, SoulCinema, emotional chess, soul journalism",
  authors: [{ name: "TheChessWire.news" }],
  openGraph: {
    title: "TheChessWire.news - Intelligent Chess Journalism",
    description:
      "Experience chess like never before with AI-powered voice narration and cinematic game analysis.",
    url: "https://thechesswire.news",
    siteName: "TheChessWire.news",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheChessWire.news - Intelligent Chess Journalism",
    description:
      "Experience chess like never before with AI-powered voice narration and cinematic game analysis.",
    creator: "@thechesswirenews",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050B14] text-white antialiased overflow-x-hidden`}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}