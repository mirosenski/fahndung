import { AlertTriangle, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";

export default function SicherheitPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Sicherheit</h1>
        <p className="text-lg text-muted-foreground">
          Informationen und Services rund um die öffentliche Sicherheit in
          Baden-Württemberg
        </p>
      </div>

      {/* Hauptbereiche */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Fahndungen */}
        <Link href="/fahndungen" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Fahndungen
              </h3>
            </div>
            <p className="text-muted-foreground">
              Aktuelle Fahndungsfälle und gesuchte Personen in Baden-Württemberg
            </p>
          </div>
        </Link>

        {/* Statistiken */}
        <Link href="/statistiken" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Statistiken
              </h3>
            </div>
            <p className="text-muted-foreground">
              Sicherheitsstatistiken und Kriminalitätsentwicklung in
              Baden-Württemberg
            </p>
          </div>
        </Link>

        {/* Hinweise */}
        <Link href="/hinweise" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Hinweise
              </h3>
            </div>
            <p className="text-muted-foreground">
              Wichtige Sicherheitshinweise und Verhaltensempfehlungen
            </p>
          </div>
        </Link>
      </div>

      {/* Zusätzliche Informationen */}
      <div className="rounded-lg bg-muted/50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Sicherheitsinformationen
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Notfallnummern
            </h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Polizei: 110</li>
              <li>• Feuerwehr: 112</li>
              <li>• Rettungsdienst: 112</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Wichtige Links
            </h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                •{" "}
                <Link href="/kontakt" className="text-primary hover:underline">
                  Kontakt
                </Link>
              </li>
              <li>
                •{" "}
                <Link
                  href="/datenschutz"
                  className="text-primary hover:underline"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                •{" "}
                <Link
                  href="/impressum"
                  className="text-primary hover:underline"
                >
                  Impressum
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
