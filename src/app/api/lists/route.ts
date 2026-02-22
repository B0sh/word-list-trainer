import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, wordsText } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!wordsText || typeof wordsText !== "string") {
      return NextResponse.json(
        { error: "Words are required" },
        { status: 400 }
      );
    }

    // Parse the words text
    // Format: WORD definition text...
    // The word is everything before the first space, definition is everything after
    const lines = wordsText.split("\n").filter((line) => line.trim());
    const words: { word: string; definition: string | null }[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      const spaceIndex = trimmedLine.indexOf(" ");

      if (spaceIndex === -1) {
        // No space, just a word with no definition
        words.push({
          word: trimmedLine.toUpperCase(),
          definition: null,
        });
      } else {
        const word = trimmedLine.substring(0, spaceIndex).toUpperCase();
        const definition = trimmedLine.substring(spaceIndex + 1).trim();
        words.push({
          word,
          definition: definition || null,
        });
      }
    }

    if (words.length === 0) {
      return NextResponse.json(
        { error: "At least one word is required" },
        { status: 400 }
      );
    }

    // Create the word list with words
    const wordList = await prisma.wordList.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
        words: {
          create: words,
        },
      },
      include: {
        words: true,
      },
    });

    return NextResponse.json(wordList, { status: 201 });
  } catch (error) {
    console.error("Error creating word list:", error);
    return NextResponse.json(
      { error: "Failed to create word list" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(wordLists);
  } catch (error) {
    console.error("Error fetching word lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch word lists" },
      { status: 500 }
    );
  }
}