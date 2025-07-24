import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, AlertTriangle } from "lucide-react";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";

export const metadata: Metadata = {
  title: "Kontakt | LKA Baden-Württemberg",
  description: "Kontaktinformationen des Landeskriminalamts Baden-Württemberg",
};

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="home" />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h1 className="mb-8 text-3xl font-bold">Kontakt</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hauptkontakt */}
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Landeskriminalamt Baden-Württemberg</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Taubenheimstraße 85<br />
                        70372 Stuttgart<br />
                        Deutschland
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        +49 711 5401-0
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-medium">E-Mail</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        poststelle@lka.polizei.bwl.de
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-medium">Öffnungszeiten</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Montag - Freitag: 8:00 - 16:00 Uhr<br />
                        Samstag, Sonntag: geschlossen
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Fachbereiche</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Pressestelle</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      E-Mail: pressestelle@lka.polizei.bwl.de<br />
                      Telefon: +49 711 5401-1001
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Datenschutz</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      E-Mail: datenschutz@lka.polizei.bwl.de<br />
                      Telefon: +49 711 5401-1002
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">IT-Support</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      E-Mail: it-support@lka.polizei.bwl.de<br />
                      Telefon: +49 711 5401-1003
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Notfall und wichtige Hinweise */}
            <div className="space-y-6">
              <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">Notfall</h3>
                    <p className="text-red-700 dark:text-red-300">
                      Bei akuten Notfällen wenden Sie sich bitte an die örtliche Polizei oder den Notruf 110.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Weitere Kontakte</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Allgemeine Anfragen</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Für allgemeine Anfragen nutzen Sie bitte das Kontaktformular oder die oben genannten Kontaktdaten.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Presseanfragen</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Journalisten wenden sich bitte direkt an die Pressestelle.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Datenschutzanfragen</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Für Fragen zum Datenschutz kontaktieren Sie bitte den Datenschutzbeauftragten.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer variant="home" />
    </div>
  );
} 