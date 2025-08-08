import type { Metadata } from "next";
import {
  Accessibility,
  Users,
  FileText,
  Shield,
  Phone,
  Mail,
} from "lucide-react";
import PublicPageLayout from "~/components/layout/PublicPageLayout";

export const metadata: Metadata = {
  title: "Leichte Sprache | LKA Baden-Württemberg",
  description:
    "Informationen in Leichter Sprache zum Landeskriminalamt Baden-Württemberg",
};

export default function LeichteSprachePage() {
  return (
    <PublicPageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="mb-8 text-3xl font-bold">Leichte Sprache</h1>

          <div className="space-y-8">
            {/* Einführung */}
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <Accessibility className="mt-1 h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="mb-2 text-2xl font-semibold text-blue-800 dark:text-blue-200">
                    Willkommen beim LKA Baden-Württemberg
                  </h2>
                  <p className="text-lg text-blue-700 dark:text-blue-300">
                    Das LKA ist die Polizei für ganz Baden-Württemberg. Wir
                    helfen bei der Aufklärung von Verbrechen.
                  </p>
                </div>
              </div>
            </section>

            {/* Was ist das LKA */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">Was ist das LKA?</h2>
              <div className="space-y-4">
                <p className="text-lg">
                  LKA bedeutet:{" "}
                  <strong>Landeskriminalamt Baden-Württemberg</strong>
                </p>
                <ul className="list-disc space-y-2 pl-6 text-lg">
                  <li>
                    Wir sind die Polizei für das ganze Bundesland
                    Baden-Württemberg
                  </li>
                  <li>Wir helfen bei der Aufklärung von schweren Verbrechen</li>
                  <li>Wir arbeiten mit allen Polizeidienststellen zusammen</li>
                  <li>Wir schützen die Menschen in Baden-Württemberg</li>
                </ul>
              </div>
            </section>

            {/* Was wir machen */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">Was machen wir?</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Fahndung</h3>
                  </div>
                  <p className="text-lg">
                    Wir suchen nach Menschen, die etwas Schlimmes gemacht haben.
                    Wir veröffentlichen Fotos und Informationen, damit andere
                    Menschen helfen können.
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold">Schutz</h3>
                  </div>
                  <p className="text-lg">
                    Wir schützen Menschen vor Verbrechen. Wir geben Tipps, wie
                    sich Menschen schützen können.
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-semibold">Hilfe</h3>
                  </div>
                  <p className="text-lg">
                    Wir helfen anderen Polizisten bei ihrer Arbeit. Wir haben
                    besondere Geräte und Computer für die Aufklärung.
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-6 dark:bg-muted">
                  <div className="mb-4 flex items-center space-x-3">
                    <Phone className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-semibold">Notruf</h3>
                  </div>
                  <p className="text-lg">
                    Bei Notfällen können Sie uns unter der Nummer 110 erreichen.
                    Wir sind rund um die Uhr für Sie da.
                  </p>
                </div>
              </div>
            </section>

            {/* Kontakt */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Wie können Sie uns erreichen?
              </h2>
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

            {/* Barrierefreiheit */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">Barrierefreiheit</h2>
              <p className="text-lg">
                Wir möchten, dass alle Menschen unsere Informationen verstehen
                können. Deshalb bieten wir auch Informationen in Gebärdensprache
                an.
              </p>
              <div className="mt-4">
                <a
                  href="/gebaerdensprache"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Mehr Informationen in Gebärdensprache</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
