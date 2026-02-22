import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";
import DeleteListButton from "./DeleteListButton";

async function getWordList(id: string) {
  const wordList = await prisma.wordList.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      words: {
        orderBy: {
          word: "asc",
        },
      },
    },
  });

  return wordList;
}

export default async function WordListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wordList = await getWordList(id);

  if (!wordList) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isOwner = session?.user.id === wordList.userId;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Header section - stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">
              {wordList.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {wordList.words.length} words • Created by{" "}
              {wordList.user.name || wordList.user.email?.split("@")[0]}
            </p>
          </div>
          
          {/* Action buttons - wrap on mobile */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href={`/lists/${id}/study`} className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto">Study</Button>
            </Link>
            {isOwner && (
              <>
                <Link href={`/lists/${id}/edit`} className="flex-1 sm:flex-none">
                  <Button variant="secondary" className="w-full sm:w-auto">Edit</Button>
                </Link>
                <div className="flex-1 sm:flex-none">
                  <DeleteListButton listId={id} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Words</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Word
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Definition
                  </th>
                </tr>
              </thead>
              <tbody>
                {wordList.words.map((word, index) => (
                  <tr
                    key={word.id}
                    className={
                      index !== wordList.words.length - 1
                        ? "border-b border-border"
                        : ""
                    }
                  >
                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {word.word}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {word.definition || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer buttons - stack on mobile */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" className="w-full sm:w-auto">← Back to Dashboard</Button>
        </Link>
        <Link href={`/lists/${id}/study`}>
          <Button className="w-full sm:w-auto">Start Studying</Button>
        </Link>
      </div>
    </div>
  );
}