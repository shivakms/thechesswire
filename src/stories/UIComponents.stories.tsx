// src/components/examples/UIShowcase.tsx
// This can also be placed in:
// - src/pages/demo/ui-components.tsx (as a demo page)
// - src/stories/UIComponents.stories.tsx (if using Storybook)
// - src/app/demo/components/page.tsx (if using Next.js App Router)

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { Crown, Sparkles, ChevronRight, Search, Edit3 } from "lucide-react";

export default function UIShowcase() {
  const [email, setEmail] = useState("");
  const [story, setStory] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white p-8">
      {/* Chess pattern background */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M0 0h40v40H0V0zm40 40h40v40H40V40z\"/%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            TheChessWire.news
          </h1>
          <p className="text-xl text-gray-400">UI Component Showcase</p>
        </header>

        {/* Button Examples */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Crown className="text-yellow-400" />
            Buttons
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider">Primary Variants</h3>
              <Button variant="primary" size="sm">Small Button</Button>
              <Button variant="primary" glow>Begin Your Chess Journey</Button>
              <Button variant="primary" size="lg" pulse>
                <Sparkles className="w-5 h-5" />
                Start Playing
              </Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider">Secondary &amp; Ghost</h3>
              <Button variant="secondary">Analyze Game</Button>
              <Button variant="ghost" glow>
                View Replay
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="xl">Join Tournament</Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider">Special Variants</h3>
              <Button variant="danger">Reset Board</Button>
              <Button variant="epic" pulse glow>
                Unlock EchoSage
              </Button>
              <Button variant="epic" size="lg">
                <Crown className="w-5 h-5" />
                Titled Player Access
              </Button>
            </div>
          </div>
        </section>

        {/* Input Examples */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Edit3 className="text-yellow-400" />
            Input Fields
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Input</label>
                <Input 
                  placeholder="Enter your email..." 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">With Icon</label>
                <Input 
                  icon={<Search />}
                  placeholder="Search games, players, openings..." 
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Neon Variant</label>
                <Input 
                  variant="neon"
                  placeholder="Enter PGN notation..." 
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Floating Label</label>
                <Input 
                  variant="floating"
                  placeholder="Your chess username" 
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Glass Morphism</label>
                <Input 
                  variant="glass"
                  placeholder="FIDE ID for verification..." 
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Magnetic Label (Focus &amp; Move Mouse)</label>
                <Input 
                  variant="floating"
                  placeholder="Experience the magnetic effect" 
                  magneticLabel
                />
              </div>
            </div>
          </div>
        </section>

        {/* Textarea Examples */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            Textareas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Textarea</label>
                <Textarea 
                  placeholder="Share your chess story..."
                  showCharCount
                  maxLength={500}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Story Mode</label>
                <Textarea 
                  variant="story"
                  placeholder="Write your chess journey..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Whisper Mode (Bambai AI)</label>
                <Textarea 
                  variant="whisper"
                  placeholder="Tell Bambai AI your thoughts..."
                  showCharCount
                  maxLength={300}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Analysis Mode</label>
                <Textarea 
                  variant="analysis"
                  placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 // Ruy Lopez"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mt-16 p-8 bg-gray-900/50 rounded-3xl backdrop-blur-xl border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Quick Usage Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Chess Onboarding Form</h3>
              <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto">
                <code className="text-sm text-gray-300">{`<div className="space-y-4">
  <Input 
    variant="floating" 
    placeholder="Your email address..." 
    type="email"
  />
  
  <Textarea 
    variant="whisper"
    placeholder="What inspires your chess story?" 
    showCharCount
    maxLength={200}
  />
  
  <Button variant="epic" glow pulse size="lg">
    Begin Your Chess Journey
  </Button>
</div>`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Game Analysis Interface</h3>
              <pre className="bg-black/50 p-4 rounded-xl overflow-x-auto">
                <code className="text-sm text-gray-300">{`<div className="space-y-4">
  <Input 
    icon={<Search />}
    variant="neon"
    placeholder="Search your games..." 
  />
  
  <Textarea 
    variant="analysis"
    placeholder="Paste your PGN here..."
    rows={8}
  />
  
  <div className="flex gap-3">
    <Button variant="primary" glow>
      Analyze with Stockfish
    </Button>
    <Button variant="ghost">
      Save to EchoSage
    </Button>
  </div>
</div>`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}