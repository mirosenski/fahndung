import type { Metadata } from "next";
import PublicPageLayout from "~/components/layout/PublicPageLayout";

export const metadata: Metadata = {
  title: "Impressum | LKA Baden-Württemberg",
  description: "Impressum des Landeskriminalamts Baden-Württemberg",
};

export default function ImpressumPage() {
  return (
    <PublicPageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="mb-8 text-3xl font-bold">Impressum</h1>

          <div className="space-y-6">
            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Angaben gemäß § 5 TMG
              </h2>
              <p>
                <strong>Verantwortlicher:</strong>
                <br />
                Landeskriminalamt Baden-Württemberg
                <br />
                Taubenheimstraße 85
                <br />
                70372 Stuttgart
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Kontakt</h2>
              <p>
                <strong>Telefon:</strong> +49 711 5401-0
                <br />
                <strong>E-Mail:</strong> poststelle@lka.polizei.bwl.de
                <br />
                <strong>Internet:</strong> www.lka-bw.de
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Vertretung</h2>
              <p>
                <strong>Präsident:</strong> Dr. Michael Kilchling
                <br />
                <strong>Vizepräsident:</strong> [Name wird aus
                Sicherheitsgründen nicht veröffentlicht]
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Aufsichtsbehörde</h2>
              <p>
                <strong>
                  Ministerium für Inneres, Digitalisierung und Migration
                  Baden-Württemberg
                </strong>
                <br />
                Willy-Brandt-Straße 41
                <br />
                70173 Stuttgart
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Zuständige Kammer</h2>
              <p>
                Das Landeskriminalamt Baden-Württemberg ist eine Landesbehörde
                und unterliegt nicht der Kammerzugehörigkeit.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Berufsbezeichnung und berufsrechtliche Regelungen
              </h2>
              <p>
                <strong>Berufsbezeichnung:</strong> Polizeivollzugsbeamte
                <br />
                <strong>Zuständige Kammer:</strong> Nicht zutreffend (Beamte)
                <br />
                <strong>Verliehen durch:</strong> Land Baden-Württemberg
                <br />
                <strong>Berufsrecht:</strong> Landesbeamtengesetz
                Baden-Württemberg (LBeamtG BW)
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a
                Umsatzsteuergesetz:
                <br />
                Nicht zutreffend (öffentliche Verwaltung)
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Redaktionell verantwortlich
              </h2>
              <p>
                <strong>
                  Pressestelle des Landeskriminalamts Baden-Württemberg
                </strong>
                <br />
                Taubenheimstraße 85
                <br />
                70372 Stuttgart
                <br />
                E-Mail: pressestelle@lka.polizei.bwl.de
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                EU-Streitschlichtung
              </h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur
                Online-Streitbeilegung (OS) bereit:
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  className="text-blue-600 hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                <br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Verbraucherstreitbeilegung/Universalschlichtungsstelle
              </h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Haftung für Inhalte
              </h2>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                gespeicherte fremde Informationen zu überwachen oder nach
                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                hinweisen.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">Urheberrecht</h2>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                Downloads und Kopien dieser Seite sind nur für den privaten,
                nicht kommerziellen Gebrauch gestattet.
              </p>
            </section>

            <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Stand:</strong> {new Date().toLocaleDateString("de-DE")}
                <br />
                Dieses Impressum wird bei Änderungen aktualisiert.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
