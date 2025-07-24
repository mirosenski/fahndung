import { Metadata } from "next";
import {
  Accessibility,
  Users,
  FileText,
  Shield,
  Phone,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Leichte Sprache | LKA Baden-Württemberg",
  description:
    "Informationen in Leichter Sprache vom Landeskriminalamt Baden-Württemberg",
};

export default function LeichteSprachePage() {
  return (
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
                  Das LKA ist die Polizei für ganz Baden-Württemberg. Wir helfen
                  bei der Aufklärung von Verbrechen.
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
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
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

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Schutz</h3>
                </div>
                <p className="text-lg">
                  Wir schützen Menschen vor Verbrechen. Wir geben Tipps, wie
                  sich Menschen schützen können.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold">Hilfe</h3>
                </div>
                <p className="text-lg">
                  Wir helfen anderen Polizisten bei ihrer Arbeit. Wir haben
                  besondere Geräte und Computer für die Aufklärung.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-4 flex items-center space-x-3">
                  <Phone className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-semibold">Notruf</h3>
                </div>
                <p className="text-lg">
                  Bei einem Notfall rufen Sie bitte die 110 an. Das ist die
                  Notrufnummer für die Polizei.
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
                <Mail className="mt-1 h-6 w-6 text-gray-600" />
                <div>
                  <p className="text-lg font-semibold">E-Mail</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    poststelle@lka.polizei.bwl.de
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="mt-1 h-6 w-6 text-gray-600" />
                <div>
                  <p className="text-lg font-semibold">Telefon</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    +49 711 5401-0
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="mt-1 h-6 w-6 text-gray-600" />
                <div>
                  <p className="text-lg font-semibold">Adresse</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Landeskriminalamt Baden-Württemberg
                    <br />
                    Taubenheimstraße 85
                    <br />
                    70372 Stuttgart
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Wichtige Hinweise */}
          <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h2 className="mb-4 text-2xl font-semibold text-yellow-800 dark:text-yellow-200">
              Wichtige Hinweise
            </h2>
            <div className="space-y-4 text-lg">
              <p>
                <strong>Notfall:</strong> Bei einem Notfall rufen Sie bitte die
                110 an.
              </p>
              <p>
                <strong>Anonym:</strong> Sie können uns auch anonym
                Informationen geben.
              </p>
              <p>
                <strong>Vertraulich:</strong> Wir behandeln alle Informationen
                vertraulich.
              </p>
              <p>
                <strong>Hilfe:</strong> Wir helfen Ihnen gerne weiter.
              </p>
            </div>
          </section>

          {/* Barrierefreiheit */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Barrierefreiheit</h2>
            <div className="space-y-4 text-lg">
              <p>
                Wir möchten, dass alle Menschen unsere Informationen verstehen
                können.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Diese Seite ist in Leichter Sprache geschrieben</li>
                <li>Wir haben auch Informationen in Gebärdensprache</li>
                <li>Sie können die Schrift größer machen</li>
                <li>Sie können die Farben ändern</li>
                <li>Sie können einen Screenreader benutzen</li>
              </ul>
            </div>
          </section>

          {/* Hilfe */}
          <section className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
            <h2 className="mb-4 text-2xl font-semibold text-green-800 dark:text-green-200">
              Brauchen Sie Hilfe?
            </h2>
            <div className="space-y-4 text-lg">
              <p>Wenn Sie etwas nicht verstehen oder Hilfe brauchen:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Rufen Sie uns an: +49 711 5401-0</li>
                <li>Schreiben Sie uns eine E-Mail</li>
                <li>Kommen Sie persönlich vorbei</li>
                <li>Lassen Sie sich von jemandem helfen</li>
              </ul>
            </div>
          </section>

          {/* Impressum in Leichter Sprache */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">
              Impressum in Leichter Sprache
            </h2>
            <div className="space-y-4 text-lg">
              <p>
                <strong>Verantwortlich für diese Internet-Seite:</strong>
                <br />
                Landeskriminalamt Baden-Württemberg
                <br />
                Taubenheimstraße 85
                <br />
                70372 Stuttgart
              </p>
              <p>
                <strong>Telefon:</strong> +49 711 5401-0
                <br />
                <strong>E-Mail:</strong> poststelle@lka.polizei.bwl.de
              </p>
              <p>
                <strong>Chef des LKA:</strong> Dr. Michael Kilchling
              </p>
              <p>
                <strong>Aufsicht:</strong> Ministerium für Inneres,
                Digitalisierung und Migration Baden-Württemberg
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
