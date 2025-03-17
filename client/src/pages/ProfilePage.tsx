import { useQuery } from "@tanstack/react-query";
import { useWords } from "@/hooks/use-words";
import { ThreeWordsForm } from "@/components/ThreeWordsForm";
import { WordCloud } from "@/components/WordCloud";
import { WordList } from "@/components/WordList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import type { Profile } from "@db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Invalid URL</h1>
            <p className="text-muted-foreground mb-4 text-center">
              No username provided in the URL.
            </p>
            <Link href="/">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { words, isLoading: isLoadingWords, addWords } = useWords(username);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ['users', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      return response.json();
    }
  });

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Profile Not Found</h1>
            <p className="text-muted-foreground mb-4 text-center">
              The profile you're looking for doesn't exist.
            </p>
            <Link href="/">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost">← Back</Button>
          </Link>
          <Button 
            variant="outline"
            onClick={() => {
              const url = window.location.href;
              window.open(`https://twitter.com/intent/tweet?text=Describe me in three words!&url=${encodeURIComponent(url)}`);
            }}
          >
            Share Profile
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt={profile.displayName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            <ThreeWordsForm onSubmit={addWords} username={profile.username} />
          </CardContent>
        </Card>

        {words && words.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="cloud">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="cloud">Word Cloud</TabsTrigger>
                  <TabsTrigger value="list">Recent Words</TabsTrigger>
                </TabsList>
                <TabsContent value="cloud">
                  {isLoadingWords ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <WordCloud words={words} />
                  )}
                </TabsContent>
                <TabsContent value="list">
                  {isLoadingWords ? (
                    <Skeleton className="h-[200px] w-full" />
                  ) : (
                    <WordList words={words} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}