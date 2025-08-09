"use client";

import Link from "next/link";

export default function FahndungenAllePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-bold">Alle Fahndungen</h1>
        <p className="mb-8 text-muted-foreground">
          Coming Soon – Gesamtübersicht aller aktiven Fahndungen.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Zurück
          </button>
          <Link
            href="/fahndungen"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Zur Übersicht
          </Link>
        </div>
      </div>
    </div>
  );
}
