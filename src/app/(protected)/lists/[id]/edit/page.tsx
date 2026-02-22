"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";

interface Word {
  id: string;
  word: string;
  definition: string | null;
}

interface WordList {
  id: string;
  name: string;
  userId: string;
  words: Word[];
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function EditListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [wordsText, setWordsText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    async function fetchWordList() {
      try {
        const response = await fetch(`/api/lists/${id}`);
        
        if (response.status === 404) {
          setNotFound(true);
          setIsFetching(false);
          return;
        }

        if (!response.ok) {
          setError("Failed to load word list");
          setIsFetching(false);
          return;
        }

        const data: WordList = await response.json();
        
        // Check authorization on client side by comparing with session
        const sessionResponse = await fetch("/api/auth/get-session");
        const sessionData = await sessionResponse.json();
        
        if (sessionData?.user?.id !== data.userId) {
          setNotAuthorized(true);
          setIsFetching(false);
          return;
        }

        setName(data.name);
        // Convert words back to text format
        const text = data.words
          .map((w) => (w.definition ? `${w.word} ${w.definition}` : w.word))
          .join("\n");
        setWordsText(text);
        setIsFetching(false);
      } catch (err) {
        setError("An unexpected error occurred");
        setIsFetching(false);
      }
    }

    fetchWordList();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a name for your word list");
      return;
    }

    if (!wordsText.trim()) {
      setError("Please enter at least one word");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          wordsText: wordsText.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update word list");
        setIsLoading(false);
        return;
      }

      router.push(`/lists/${id}`);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Word List Not Found
            </h3>
            <p className="text-muted-foreground mb-6">
              This word list doesn&apos;t exist or has been deleted.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🚫</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Not Authorized
            </h3>
            <p className="text-muted-foreground mb-6">
              You can only edit your own word lists.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Word List</CardTitle>
          <CardDescription>
            Update your word list name and words
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                {error}
              </div>
            )}

            <Input
              label="List Name"
              type="text"
              placeholder="e.g., SAT Vocabulary, Scrabble Two-Letter Words"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="w-full">
              <label
                htmlFor="words"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Words
              </label>
              <textarea
                id="words"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-card text-card-foreground
                  border border-border
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                  font-mono text-sm
                  resize-y
                "
                rows={12}
                placeholder="WORD definition..."
                value={wordsText}
                onChange={(e) => setWordsText(e.target.value)}
                required
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Format:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">
                  WORD definition text...
                </code>
                <br />
                The word is everything before the first space, definition is
                everything after.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/lists/${id}`)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}