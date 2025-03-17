import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function HomePage() {
  const { user } = useUser();
  const [username, setUsername] = useState("");
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/${username.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Three Words</h1>

            <p className="text-center text-muted-foreground mb-8">
              Describe your friends in just three words.
              See what others say about you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-center text-lg h-12"
              />
              <Button type="submit" className="w-full">
                Start Describing
              </Button>
            </form>

            {!user && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Want to save your profile?
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/api/auth/twitter"}
                >
                  Sign in with Twitter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}