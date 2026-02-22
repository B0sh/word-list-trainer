"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";

interface RememberedWord {
  word: string;
  definition: string | null;
}

interface StudyResults {
  listName: string;
  totalWords: number;
  remembered: RememberedWord[];
  missed: RememberedWord[];
  incorrect: string[];
}

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-6">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">{title}</span>
          <span
            className={`text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [results, setResults] = useState<StudyResults | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`study-results-${id}`);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, [id]);

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🤔</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Results Found
            </h3>
            <p className="text-muted-foreground mb-6">
              It looks like you haven&apos;t completed a study session yet.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/lists/${id}`}>
                <Button variant="secondary">View Word List</Button>
              </Link>
              <Link href={`/lists/${id}/study`}>
                <Button>Start Studying</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = Math.round(
    (results.remembered.length / results.totalWords) * 100
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Study Results
        </h1>
        <p className="text-muted-foreground">{results.listName}</p>
      </div>

      {/* Score Summary */}
      <Card className="mb-8">
        <CardContent className="py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-1">
                {score}%
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success mb-1">
                {results.remembered.length}
              </div>
              <div className="text-sm text-muted-foreground">Remembered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-error mb-1">
                {results.missed.length}
              </div>
              <div className="text-sm text-muted-foreground">Missed</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                {results.remembered.length} of {results.totalWords} words
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-success h-3 rounded-full transition-all duration-300"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remembered Words - Collapsed by default */}
      {results.remembered.length > 0 && (
        <CollapsibleSection
          title={
            <>
              <span className="text-success">✓</span>
              Words You Remembered ({results.remembered.length})
            </>
          }
          defaultOpen={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-32">
                    Word
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Definition
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.remembered
                  .sort((a, b) => a.word.localeCompare(b.word))
                  .map((item, index) => (
                    <tr
                      key={index}
                      className={
                        index !== results.remembered.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="py-3 px-4 font-mono font-medium text-success">
                        {item.word}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.definition || "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Missed Words - Open by default */}
      {results.missed.length > 0 && (
        <CollapsibleSection
          title={
            <>
              <span className="text-error">○</span>
              Words You Missed ({results.missed.length})
            </>
          }
          defaultOpen={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-32">
                    Word
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Definition
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.missed
                  .sort((a, b) => a.word.localeCompare(b.word))
                  .map((item, index) => (
                    <tr
                      key={index}
                      className={
                        index !== results.missed.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="py-3 px-4 font-mono font-medium text-error">
                        {item.word}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.definition || "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}

      {/* Incorrect Attempts */}
      {results.incorrect.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-error">✗</span>
              Incorrect Attempts ({results.incorrect.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These words were not in the list:
            </p>
            <div className="flex flex-wrap gap-2">
              {results.incorrect.sort().map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-error/10 text-error rounded font-mono text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions - stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-8">
        <Link href="/dashboard" className="order-last sm:order-first">
          <Button variant="ghost" className="w-full sm:w-auto">← Back to Dashboard</Button>
        </Link>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/lists/${id}`}>
            <Button variant="secondary" className="w-full sm:w-auto">View Word List</Button>
          </Link>
          <Link href={`/lists/${id}/study`}>
            <Button className="w-full sm:w-auto">Study Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}