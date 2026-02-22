import Link from "next/link";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Card, { CardContent } from "@/components/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Master Your Vocabulary with{" "}
              <span className="text-primary">Walden&apos;s Word Trainer</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A simple, effective way to memorize word lists. Create lists,
              practice recall, and track your progress.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    1. Create Word Lists
                  </h3>
                  <p className="text-muted-foreground">
                    Paste your word list with definitions. Each word on its own
                    line, followed by its definition.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    2. Test Your Memory
                  </h3>
                  <p className="text-muted-foreground">
                    Type words from pure memory. No hints, no flashcards—just
                    raw recall to strengthen retention.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    3. Review Results
                  </h3>
                  <p className="text-muted-foreground">
                    See which words you remembered, which you missed, and any
                    incorrect attempts to learn from mistakes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Expand Your Vocabulary?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Walden&apos;s Word Trainer today and start memorizing words
              more effectively.
            </p>
            <Link href="/signup">
              <Button size="lg">Create Your Account</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Walden&apos;s Word Trainer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}