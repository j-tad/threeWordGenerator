import { type Word } from "@db/schema";
import { formatDistanceToNow } from "date-fns";

interface Props {
  words: Word[];
}

export function WordList({ words }: Props) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No words yet. Share your profile to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {words.map((submission) => (
        <div 
          key={submission.id} 
          className="p-4 rounded-lg border bg-card text-card-foreground"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {submission.anonymous 
                ? "Anonymous" 
                : submission.submitterName || "Someone"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
            </p>
          </div>
          <p className="text-lg font-medium">
            {submission.word1} • {submission.word2} • {submission.word3}
          </p>
        </div>
      ))}
    </div>
  );
}