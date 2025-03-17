import { useMemo } from "react";
import type { Word } from "@db/schema";

interface Props {
  words: Word[];
}

export function WordCloud({ words }: Props) {
  const wordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const submission of words) {
      [submission.word1, submission.word2, submission.word3].forEach(word => {
        counts[word.toLowerCase()] = (counts[word.toLowerCase()] || 0) + 1;
      });
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));
  }, [words]);

  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No words yet. Share your profile to get started!
      </div>
    );
  }

  const maxCount = wordCounts[0]?.count || 1;

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center min-h-[200px]">
      {wordCounts.map(({ word, count }) => {
        const size = Math.max(1, Math.min(4, Math.ceil((count / maxCount) * 4)));
        const textSize = {
          1: "text-sm",
          2: "text-base",
          3: "text-xl",
          4: "text-2xl"
        }[size];

        return (
          <span
            key={word}
            className={`${textSize} font-semibold transition-all duration-200 hover:text-primary cursor-default`}
            title={`${count} ${count === 1 ? 'time' : 'times'}`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
