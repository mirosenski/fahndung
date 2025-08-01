import { Phone, HelpCircle, Download, Mail, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export default function ServicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Service</h1>
        <p className="text-lg text-muted-foreground">
          Unsere Serviceangebote und Unterstützung für Bürgerinnen und Bürger
        </p>
      </div>

      {/* Hauptbereiche */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Kontakt */}
        <Link href="/kontakt" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Kontakt</h3>
            </div>
            <p className="text-muted-foreground">
              Kontaktinformationen und direkte Ansprechpartner
            </p>
          </div>
        </Link>

        {/* FAQ */}
        <Link href="/faq" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">FAQ</h3>
            </div>
            <p className="text-muted-foreground">
              Häufig gestellte Fragen und Antworten
            </p>
          </div>
        </Link>

        {/* Downloads */}
        <Link href="/downloads" className="group">
          <div className="rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:bg-accent group-hover:shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Downloads
              </h3>
            </div>
            <p className="text-muted-foreground">
              Formulare, Dokumente und Informationsmaterial
            </p>
          </div>
        </Link>
      </div>

      {/* Service-Informationen */}
      <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Öffnungszeiten */}
        <div className="rounded-lg bg-muted/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Clock className="h-6 w-6" />
            Öffnungszeiten
          </h2>
          <div className="space-y-2 text-muted-foreground">
            <div className="flex justify-between">
              <span>Montag - Freitag:</span>
              <span>8:00 - 17:00 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span>Samstag:</span>
              <span>9:00 - 12:00 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span>Sonntag:</span>
              <span>Geschlossen</span>
            </div>
          </div>
        </div>

        {/* Standorte */}
        <div className="rounded-lg bg-muted/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <MapPin className="h-6 w-6" />
            Standorte
          </h2>
          <div className="space-y-2 text-muted-foreground">
            <p>Landeskriminalamt Baden-Württemberg</p>
            <p>Taubenheimstraße 85</p>
            <p>70372 Stuttgart</p>
          </div>
        </div>
      </div>

      {/* Zusätzliche Services */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Weitere Services
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-foreground">E-Mail-Service</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-foreground">Telefonischer Support</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span className="text-foreground">Online-Beratung</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-foreground">Digitale Services</span>
          </div>
        </div>
      </div>
    </div>
  );
}
