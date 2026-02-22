"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function NewListPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [wordsText, setWordsText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch("/api/lists", {
        method: "POST",
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
        setError(data.error || "Failed to create word list");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      router.push(`/lists/${data.id}`);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const exampleFormat = `AA rough, cindery lava [n AAS]
AB a muscle in the abdomen [n ABS]
AD an advertisement [n ADS]
AE one [adj]`;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Word List</CardTitle>
          <CardDescription>
            Enter your words with their definitions, one per line
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
                placeholder={exampleFormat}
                value={wordsText}
                onChange={(e) => setWordsText(e.target.value)}
                required
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Format: <code className="bg-muted px-1 py-0.5 rounded">WORD definition text...</code>
                <br />
                The word is everything before the first space, definition is everything after.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Create Word List
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}