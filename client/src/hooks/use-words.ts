import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Word } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

export function useWords(username: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: words, isLoading } = useQuery<Word[]>({
    queryKey: ['words', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}/words`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      return response.json();
    }
  });

  const addWords = useMutation({
    mutationFn: async ({
      word1,
      word2,
      word3,
      submitterName,
      anonymous
    }: {
      word1: string;
      word2: string;
      word3: string;
      submitterName?: string;
      anonymous: boolean;
    }) => {
      const response = await fetch(`/api/users/${username}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word1,
          word2,
          word3,
          submitterName: anonymous ? null : submitterName,
          anonymous
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words', username] });
      toast({
        title: "Words submitted!",
        description: "Your words have been added successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    words,
    isLoading,
    addWords: addWords.mutateAsync
  };
}