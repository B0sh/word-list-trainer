"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/Card";
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
  words: Word[];
}

interface RememberedWord {
  word: string;
  definition: string | null;
}

export default function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [wordList, setWordList] = useState<WordList | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  const [currentInput, setCurrentInput] = useState("");
  const [rememberedWords, setRememberedWords] = useState<RememberedWord[]>([]);
  const [incorrectAttempts, setIncorrectAttempts] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{
    type: "success" | "error" | "duplicate" | null;
    word: string;
    definition?: string | null;
  }>({ type: null, word: "" });

  // Create a Set of words in the list (uppercase) for quick lookup
  const [wordSet, setWordSet] = useState<Map<string, string | null>>(new Map());

  useEffect(() => {
    async function fetchWordList() {
      try {
        const response = await fetch(`/api/lists/${id}`);

        if (!response.ok) {
          setError("Failed to load word list");
          setIsFetching(false);
          return;
        }

        const data: WordList = await response.json();
        setWordList(data);

        // Build the word map (word -> definition)
        const map = new Map<string, string | null>();
        data.words.forEach((w) => {
          map.set(w.word.toUpperCase(), w.definition);
        });
        setWordSet(map);

        setIsFetching(false);
      } catch (err) {
        setError("An unexpected error occurred");
        setIsFetching(false);
      }
    }

    fetchWordList();
  }, [id]);

  useEffect(() => {
    // Focus the input when the page loads
    if (!isFetching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFetching]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const word = currentInput.trim().toUpperCase();
    if (!word) return;

    // Check if already remembered
    const alreadyRemembered = rememberedWords.some((rw) => rw.word === word);
    if (alreadyRemembered) {
      setLastResult({ type: "duplicate", word });
      setCurrentInput("");
      return;
    }

    // Check if word is in the list
    if (wordSet.has(word)) {
      const definition = wordSet.get(word) || null;
      setRememberedWords((prev) => [...prev, { word, definition }]);
      setLastResult({ type: "success", word, definition });
    } else {
      // Only add to incorrect if not already there
      if (!incorrectAttempts.includes(word)) {
        setIncorrectAttempts((prev) => [...prev, word]);
      }
      setLastResult({ type: "error", word });
    }

    setCurrentInput("");
    inputRef.current?.focus();
  };

  const handleDone = () => {
    // Store results in sessionStorage for the results page
    const missedWords: RememberedWord[] = [];
    wordSet.forEach((definition, word) => {
      if (!rememberedWords.some((rw) => rw.word === word)) {
        missedWords.push({ word, definition });
      }
    });

    sessionStorage.setItem(
      `study-results-${id}`,
      JSON.stringify({
        listName: wordList?.name,
        totalWords: wordSet.size,
        remembered: rememberedWords,
        missed: missedWords,
        incorrect: incorrectAttempts,
      })
    );

    router.push(`/lists/${id}/results`);
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

  if (error || !wordList) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {error || "Something went wrong"}
            </h3>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (rememberedWords.length / wordSet.size) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Studying: {wordList.name}</CardTitle>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                {rememberedWords.length} of {wordSet.size} words remembered
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type a word and press Enter..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
                autoComplete="off"
                autoCapitalize="characters"
                className="text-lg font-mono uppercase pr-16"
              />
              <Button
                type="submit"
                size="sm"
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </div>

            {/* Last result feedback */}
            {lastResult.type && (
              <div
                className={`p-4 rounded-lg ${
                  lastResult.type === "success"
                    ? "bg-success/10 border border-success/30"
                    : lastResult.type === "error"
                    ? "bg-error/10 border border-error/30"
                    : "bg-muted border border-border"
                }`}
              >
                {lastResult.type === "success" && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-success">✓</span>
                      <span className="font-mono font-bold text-foreground">
                        {lastResult.word}
                      </span>
                    </div>
                    {lastResult.definition && (
                      <p className="text-sm text-muted-foreground ml-6">
                        {lastResult.definition}
                      </p>
                    )}
                  </div>
                )}
                {lastResult.type === "error" && (
                  <div className="flex items-center gap-2">
                    <span className="text-error">✗</span>
                    <span className="font-mono text-foreground">
                      {lastResult.word}
                    </span>
                    <span className="text-error text-sm">
                      — not in this list
                    </span>
                  </div>
                )}
                {lastResult.type === "duplicate" && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">↺</span>
                    <span className="font-mono text-muted-foreground">
                      {lastResult.word}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      — already entered
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Stats during session */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">
                  {rememberedWords.length}
                </div>
                <div className="text-sm text-muted-foreground">Remembered</div>
              </div>
              <div className="text-center p-4 bg-error/10 rounded-lg">
                <div className="text-2xl font-bold text-error">
                  {incorrectAttempts.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Incorrect Attempts
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/lists/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDone}
                className="flex-1"
              >
                Done — See Results
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recently remembered words */}
      {rememberedWords.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Recently Remembered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {rememberedWords
                .slice(-20)
                .reverse()
                .map((rw, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-success/10 text-success rounded font-mono text-sm"
                  >
                    {rw.word}
                  </span>
                ))}
              {rememberedWords.length > 20 && (
                <span className="px-2 py-1 text-muted-foreground text-sm">
                  +{rememberedWords.length - 20} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}