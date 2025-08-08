import type { Metadata } from "next";
import { Video, Hand, Phone, Mail, AlertTriangle } from "lucide-react";
import PublicPageLayout from "~/components/layout/PublicPageLayout";

export const metadata: Metadata = {
  title: "Gebärdensprache | LKA Baden-Württemberg",
  description:
    "Informationen in Gebärdensprache vom Landeskriminalamt Baden-Württemberg",
};

export default function GebaerdensprachePage() {
  return (
    <PublicPageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="mb-8 text-3xl font-bold">Gebärdensprache</h1>

          <div className="space-y-8">
            {/* Einführung */}
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <Hand className="mt-1 h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="mb-2 text-2xl font-semibold text-blue-800 dark:text-blue-200">
                    Willkommen in Gebärdensprache
                  </h2>
                  <p className="text-lg text-blue-700 dark:text-blue-300">
                    Das Landeskriminalamt Baden-Württemberg bietet Informationen
                    in Deutscher Gebärdensprache (DGS) an.
                  </p>
                </div>
              </div>
            </section>

            {/* Gebärdensprach-Videos */}
            <section>
              <h2 className="mb-6 text-2xl font-semibold">
                Videos in Gebärdensprache
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Video className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Über das LKA</h3>
                  </div>
                  <p className="mb-4 text-muted-foreground dark:text-muted-foreground">
                    Einführung in die Arbeit des Landeskriminalamts
                    Baden-Württemberg
                  </p>
                  <div className="rounded-lg bg-muted p-4 text-center dark:bg-muted">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Video wird geladen...
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
                      Dauer: ca. 3 Minuten
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Video className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold">Kontakt</h3>
                  </div>
                  <p className="mb-4 text-muted-foreground dark:text-muted-foreground">
                    Wie Sie uns erreichen können
                  </p>
                  <div className="rounded-lg bg-muted p-4 text-center dark:bg-muted">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Video wird geladen...
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
                      Dauer: ca. 2 Minuten
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Video className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-semibold">Notruf</h3>
                  </div>
                  <p className="mb-4 text-muted-foreground dark:text-muted-foreground">
                    Wichtige Informationen zum Notruf
                  </p>
                  <div className="rounded-lg bg-muted p-4 text-center dark:bg-muted">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Video wird geladen...
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
                      Dauer: ca. 1 Minute
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Video className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-semibold">Fahndung</h3>
                  </div>
                  <p className="mb-4 text-muted-foreground dark:text-muted-foreground">
                    Informationen zur Fahndungsarbeit
                  </p>
                  <div className="rounded-lg bg-muted p-4 text-center dark:bg-muted">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Video wird geladen...
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
                      Dauer: ca. 4 Minuten
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Kontakt */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">Kontakt</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">E-Mail</p>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      poststelle@lka.polizei.bwl.de
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-muted-foreground dark:text-muted-foreground">
                      +49 711 5401-0
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Wichtige Hinweise */}
            <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="mt-1 h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Wichtige Hinweise
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Bei Notfällen wenden Sie sich bitte an die örtliche Polizei
                    oder den Notruf 110.
                  </p>
                </div>
              </div>
            </section>

            {/* Barrierefreiheit */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">Barrierefreiheit</h2>
              <p className="text-lg">
                Wir möchten, dass alle Menschen unsere Informationen verstehen
                können. Deshalb bieten wir auch Informationen in Leichter
                Sprache an.
              </p>
              <div className="mt-4">
                <a
                  href="/leichte-sprache"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Mehr Informationen in Leichter Sprache</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
