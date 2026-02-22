import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/Card";
import Button from "@/components/Button";

type WordListWithDetails = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
  _count: {
    words: number;
  };
};

async function getWordLists(): Promise<WordListWithDetails[]> {
  const wordLists = await prisma.wordList.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          words: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return wordLists;
}

export default async function DashboardPage() {
  const wordLists = await getWordLists();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Word Lists</h1>
          <p className="text-muted-foreground mt-1">
            Browse all word lists or create your own
          </p>
        </div>
        <Link href="/lists/new">
          <Button>Create New List</Button>
        </Link>
      </div>

      {wordLists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No word lists yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Be the first to create a word list!
            </p>
            <Link href="/lists/new">
              <Button>Create Your First List</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wordLists.map((list) => (
            <Link key={list.id} href={`/lists/${list.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{list.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{list._count.words} words</span>
                    <span>
                      by {list.user.name || list.user.email?.split("@")[0]}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1">
                      View
                    </Button>
                    <Button size="sm" className="flex-1">
                      Study
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}