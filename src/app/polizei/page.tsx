import {
  Building2,
  Users,
  Newspaper,
  GraduationCap,
  Award,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function PolizeiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Polizei</h1>
        <p className="text-lg text-muted-foreground">
          Informationen über die Polizei Baden-Württemberg und unsere
          Organisation
        </p>
      </div>

      {/* Hauptbereiche */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Über uns */}
        <Link href="/kontakt" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Über uns
              </h3>
            </div>
            <p className="text-muted-foreground">
              Informationen zur Polizei Baden-Württemberg und unserer Struktur
            </p>
          </div>
        </Link>

        {/* Karriere */}
        <Link href="/kontakt" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Karriere
              </h3>
            </div>
            <p className="text-muted-foreground">
              Stellenangebote und Karrieremöglichkeiten bei der Polizei
            </p>
          </div>
        </Link>

        {/* Presse */}
        <Link href="/kontakt" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                <Newspaper className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Presse</h3>
            </div>
            <p className="text-muted-foreground">
              Pressemitteilungen und aktuelle Informationen
            </p>
          </div>
        </Link>
      </div>

      {/* Organisationsstruktur */}
      <div className="mb-12 rounded-lg bg-muted/50 p-6">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-foreground">
          <Shield className="h-6 w-6" />
          Organisationsstruktur
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-2 font-semibold text-foreground">
              Landeskriminalamt
            </h3>
            <p className="text-sm text-muted-foreground">
              Zentrale Dienststelle für polizeiliche Kriminalitätsbekämpfung und
              Fahndung
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-2 font-semibold text-foreground">
              Polizeipräsidium
            </h3>
            <p className="text-sm text-muted-foreground">
              Regionale Polizeibehörden in Baden-Württemberg
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-2 font-semibold text-foreground">
              Spezialeinheiten
            </h3>
            <p className="text-sm text-muted-foreground">
              SEK, MEK und andere Spezialkräfte
            </p>
          </div>
        </div>
      </div>

      {/* Statistiken und Fakten */}
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Users className="h-6 w-6" />
            Personal
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex justify-between">
              <span>Beamtinnen und Beamte:</span>
              <span className="font-semibold text-foreground">ca. 25.000</span>
            </div>
            <div className="flex justify-between">
              <span>Tarifbeschäftigte:</span>
              <span className="font-semibold text-foreground">ca. 3.500</span>
            </div>
            <div className="flex justify-between">
              <span>Standorte:</span>
              <span className="font-semibold text-foreground">über 500</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Award className="h-6 w-6" />
            Auszeichnungen
          </h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• Qualitätsmanagement nach ISO 9001</p>
            <p>• Barrierefreiheit nach BITV 2.0</p>
            <p>• Datenschutz nach DSGVO</p>
            <p>• Umweltschutz nach EMAS</p>
          </div>
        </div>
      </div>

      {/* Kontakt und weitere Informationen */}
      <div className="rounded-lg bg-muted/50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Weitere Informationen
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Kontakt
            </h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                •{" "}
                <Link href="/kontakt" className="text-primary hover:underline">
                  Allgemeine Anfragen
                </Link>
              </li>
              <li>
                •{" "}
                <Link href="/kontakt" className="text-primary hover:underline">
                  Presseanfragen
                </Link>
              </li>
              <li>
                •{" "}
                <Link href="/kontakt" className="text-primary hover:underline">
                  Karriereberatung
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Rechtliches
            </h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                •{" "}
                <Link
                  href="/impressum"
                  className="text-primary hover:underline"
                >
                  Impressum
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
                  href="/leichte-sprache"
                  className="text-primary hover:underline"
                >
                  Leichte Sprache
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
