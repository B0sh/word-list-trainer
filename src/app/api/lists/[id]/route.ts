import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    if (!wordList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(wordList);
  } catch (error) {
    console.error("Error fetching word list:", error);
    return NextResponse.json(
      { error: "Failed to fetch word list" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns this word list
    const existingList = await prisma.wordList.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 }
      );
    }

    if (existingList.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own word lists" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, wordsText } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!wordsText || typeof wordsText !== "string") {
      return NextResponse.json(
        { error: "Words are required" },
        { status: 400 }
      );
    }

    // Parse the words text
    const lines = wordsText.split("\n").filter((line) => line.trim());
    const words: { word: string; definition: string | null }[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      const spaceIndex = trimmedLine.indexOf(" ");

      if (spaceIndex === -1) {
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

    // Update the word list - delete old words and create new ones
    const wordList = await prisma.$transaction(async (tx) => {
      // Delete existing words
      await tx.word.deleteMany({
        where: { wordListId: id },
      });

      // Update the list and create new words
      return tx.wordList.update({
        where: { id },
        data: {
          name: name.trim(),
          words: {
            create: words,
          },
        },
        include: {
          words: true,
        },
      });
    });

    return NextResponse.json(wordList);
  } catch (error) {
    console.error("Error updating word list:", error);
    return NextResponse.json(
      { error: "Failed to update word list" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns this word list
    const existingList = await prisma.wordList.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: "Word list not found" },
        { status: 404 }
      );
    }

    if (existingList.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own word lists" },
        { status: 403 }
      );
    }

    await prisma.wordList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting word list:", error);
    return NextResponse.json(
      { error: "Failed to delete word list" },
      { status: 500 }
    );
  }
}