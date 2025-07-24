import { Metadata } from "next";
import {
  Video,
  Hand,
  Users,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Gebärdensprache | LKA Baden-Württemberg",
  description:
    "Informationen in Gebärdensprache vom Landeskriminalamt Baden-Württemberg",
};

export default function GebaerdensprachePage() {
  return (
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
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Video className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">Über das LKA</h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Einführung in die Arbeit des Landeskriminalamts
                  Baden-Württemberg
                </p>
                <div className="rounded-lg bg-gray-200 p-4 text-center dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Video wird geladen...
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Dauer: ca. 3 Minuten
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Video className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Kontakt</h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Wie Sie uns erreichen können
                </p>
                <div className="rounded-lg bg-gray-200 p-4 text-center dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Video wird geladen...
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Dauer: ca. 2 Minuten
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Video className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold">Notruf</h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Wichtige Informationen zum Notruf
                </p>
                <div className="rounded-lg bg-gray-200 p-4 text-center dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Video wird geladen...
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Dauer: ca. 1 Minute
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Video className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-semibold">Barrierefreiheit</h3>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Informationen zur Barrierefreiheit
                </p>
                <div className="rounded-lg bg-gray-200 p-4 text-center dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Video wird geladen...
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Dauer: ca. 2 Minuten
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Wichtiger Hinweis */}
          <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="mt-1 h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Wichtiger Hinweis
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Die Gebärdensprach-Videos werden derzeit erstellt und sind
                  bald verfügbar. Für dringende Angelegenheiten nutzen Sie bitte
                  die unten genannten Kontaktmöglichkeiten.
                </p>
              </div>
            </div>
          </section>

          {/* Kontakt für Gehörlose */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Kontakt für Gehörlose
            </h2>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                  <div className="mb-4 flex items-center space-x-3">
                    <Phone className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold">Telefon</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Notruf:</strong> 110
                    <br />
                    <strong>Allgemein:</strong> +49 711 5401-0
                    <br />
                    <strong>Fax:</strong> +49 711 5401-1000
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                  <div className="mb-4 flex items-center space-x-3">
                    <Mail className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold">E-Mail</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Allgemein:</strong> poststelle@lka.polizei.bwl.de
                    <br />
                    <strong>Barrierefreiheit:</strong>{" "}
                    barrierefrei@lka.polizei.bwl.de
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold">
                    Schriftliche Kommunikation
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Sie können uns auch schriftlich kontaktieren. Wir antworten
                  gerne per E-Mail oder Brief.
                </p>
              </div>
            </div>
          </section>

          {/* Gebärdensprach-Dolmetscher */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Gebärdensprach-Dolmetscher
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Bei persönlichen Terminen können wir einen
                Gebärdensprach-Dolmetscher organisieren.
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                <h3 className="mb-2 text-lg font-semibold">
                  Anfrage für Dolmetscher
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Bitte melden Sie sich mindestens 3 Werktage vor Ihrem Termin
                  bei uns, damit wir einen Dolmetscher organisieren können.
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  <strong>E-Mail:</strong> dolmetscher@lka.polizei.bwl.de
                  <br />
                  <strong>Telefon:</strong> +49 711 5401-1004
                </p>
              </div>
            </div>
          </section>

          {/* Technische Unterstützung */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Technische Unterstützung
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Für die Nutzung unserer Online-Dienste stehen verschiedene
                Hilfsmittel zur Verfügung:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-lg">
                <li>Vergrößerungsfunktion für Texte</li>
                <li>Kontrastreiche Darstellung</li>
                <li>Unterstützung für Screenreader</li>
                <li>Gebärdensprach-Videos (bald verfügbar)</li>
                <li>Schriftliche Alternativen zu Audio-Inhalten</li>
              </ul>
            </div>
          </section>

          {/* Weitere Informationen */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Weitere Informationen
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <h3 className="mb-2 text-xl font-semibold">Leichte Sprache</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Informationen in einfacher Sprache finden Sie hier:
                </p>
                <a
                  href="/leichte-sprache"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Zur Leichten Sprache →
                </a>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <h3 className="mb-2 text-xl font-semibold">Kontakt</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Allgemeine Kontaktinformationen:
                </p>
                <a
                  href="/kontakt"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Zu den Kontaktdaten →
                </a>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
            <h2 className="mb-4 text-2xl font-semibold text-green-800 dark:text-green-200">
              Ihr Feedback ist wichtig
            </h2>
            <div className="space-y-4">
              <p className="text-green-700 dark:text-green-300">
                Wir möchten unsere Angebote für gehörlose Menschen stetig
                verbessern. Teilen Sie uns gerne Ihre Wünsche und Anregungen
                mit.
              </p>
              <p className="text-green-700 dark:text-green-300">
                <strong>E-Mail:</strong> feedback@lka.polizei.bwl.de
              </p>
            </div>
          </section>

          <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Stand:</strong> {new Date().toLocaleDateString("de-DE")}
              <br />
              Diese Seite wird regelmäßig überprüft und aktualisiert.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
