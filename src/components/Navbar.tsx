"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import Button from "./Button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Walden&apos;s Word Trainer
          </Link>

          <div className="flex items-center gap-4">
            {isPending ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {session.user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}