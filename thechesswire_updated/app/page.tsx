
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to TheChessWire.news</h1>
      <p className="mb-6 text-muted-foreground">
        A free, community-driven chess journalism platform powered by AI and you.
      </p>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">🚀 Bambai AI's Game of the Day</h2>
          <p className="mb-4 text-muted-foreground">
            GM Bambai AI breaks down the most exciting game from London Rapid 2025.
          </p>
          <Button asChild variant="default">
            <Link href="/article/bambai-game-of-the-day">Read Analysis</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">📰 Submit Your Article</h2>
          <p className="mb-4 text-muted-foreground">
            Publish your chess stories, annotated games, tournament reports, or opinions.
            Login is required and subject to our Terms & Conditions and Privacy Policy.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Login / Create Account</Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            By creating an account, you agree to our <Link href="/terms" className="underline">Terms & Conditions</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">📬 Stay Updated</h2>
          <p className="mb-4 text-muted-foreground">
            Get notified when new games, stories, or videos are published.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="default">Subscribe</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
