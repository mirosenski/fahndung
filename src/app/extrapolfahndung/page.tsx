"use client";

import Link from "next/link";

export default function ExtrapolfahndungPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-bold">Extrapolfahndung</h1>
        <p className="mb-8 text-muted-foreground">
          Coming Soon – Informationen zur Extrapolfahndung.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Zurück
          </button>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
