import type { Metadata } from "next";
import PublicPageLayout from "~/components/layout/PublicPageLayout";

export const metadata: Metadata = {
  title: "Datenschutz | LKA Baden-Württemberg",
  description: "Datenschutzerklärung des Landeskriminalamts Baden-Württemberg",
};

export default function DatenschutzPage() {
  return (
    <PublicPageLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="mb-8 text-3xl font-bold">Datenschutzerklärung</h1>

          <div className="space-y-6">
            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                1. Verantwortlicher
              </h2>
              <p>
                Landeskriminalamt Baden-Württemberg
                <br />
                Taubenheimstraße 85
                <br />
                70372 Stuttgart
                <br />
                Telefon: +49 711 5401-0
                <br />
                E-Mail: poststelle@lka.polizei.bwl.de
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                2. Datenschutzbeauftragter
              </h2>
              <p>
                Der behördliche Datenschutzbeauftragte des Landeskriminalamts
                Baden-Württemberg ist unter der gleichen Anschrift erreichbar.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                3. Erhebung und Verarbeitung personenbezogener Daten
              </h2>
              <p>
                Bei der Nutzung unserer Fahndungsplattform werden folgende Daten
                erhoben und verarbeitet:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Registrierungsdaten (Name, E-Mail, Dienststelle)</li>
                <li>Fahndungsdaten (Fotos, Beschreibungen, Kontaktdaten)</li>
                <li>Nutzungsdaten (Login-Zeiten, Aktivitäten)</li>
                <li>Technische Daten (IP-Adressen, Browser-Informationen)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                4. Rechtsgrundlagen
              </h2>
              <p>Die Verarbeitung erfolgt auf Grundlage von:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Art. 6 Abs. 1 lit. e DSGVO (Aufgabenerfüllung im öffentlichen
                  Interesse)
                </li>
                <li>§ 4 PolG BW (Polizeigesetz Baden-Württemberg)</li>
                <li>§ 163 StPO (Strafprozessordnung)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                5. Zweck der Datenverarbeitung
              </h2>
              <p>Die Daten werden verarbeitet für:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Durchführung von Fahndungsmaßnahmen</li>
                <li>Verwaltung von Benutzerkonten</li>
                <li>Sicherstellung der Plattform-Funktionalität</li>
                <li>Gewährleistung der IT-Sicherheit</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">6. Speicherdauer</h2>
              <p>
                Daten werden gelöscht, sobald sie für die Zweckerfüllung nicht
                mehr erforderlich sind oder gesetzliche Aufbewahrungsfristen
                abgelaufen sind.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">7. Ihre Rechte</h2>
              <p>Sie haben das Recht auf:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten (soweit rechtlich zulässig)</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerspruch gegen die Verarbeitung</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                8. Beschwerderecht
              </h2>
              <p>
                Sie haben das Recht, sich bei der Landesbeauftragten für
                Datenschutz Baden-Württemberg zu beschweren:
              </p>
              <p>
                Landesbeauftragte für Datenschutz Baden-Württemberg
                <br />
                Königstraße 10a
                <br />
                70173 Stuttgart
                <br />
                E-Mail: poststelle@lfdi.bwl.de
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                9. Cookies und Tracking
              </h2>
              <p>
                Diese Website verwendet technisch notwendige Cookies für die
                Funktionalität. Es werden keine Tracking-Cookies oder
                Analyse-Tools verwendet.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">10. Sicherheit</h2>
              <p>
                Wir setzen technische und organisatorische Sicherheitsmaßnahmen
                ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder
                gegen den Zugriff unberechtigter Personen zu schützen.
              </p>
            </section>

            <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Stand:</strong> {new Date().toLocaleDateString("de-DE")}
                <br />
                Diese Datenschutzerklärung wird bei Änderungen aktualisiert.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
