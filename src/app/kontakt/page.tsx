import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt | LKA Baden-Württemberg",
  description: "Kontaktinformationen des Landeskriminalamts Baden-Württemberg",
};

export default function KontaktPage() {
  return (
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
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Wichtiger Hinweis
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    Für Notfälle und akute Bedrohungslagen wenden Sie sich bitte direkt an die 
                    Polizei unter der Notrufnummer <strong>110</strong>.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Anfahrt</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Mit öffentlichen Verkehrsmitteln</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>S-Bahn:</strong> S1, S2, S3 bis Stuttgart Hauptbahnhof<br />
                    <strong>U-Bahn:</strong> U1, U2, U3 bis Hauptbahnhof<br />
                    <strong>Bus:</strong> Linien 40, 42 bis LKA
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Mit dem Auto</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Parkplätze:</strong> Besucherparkplätze verfügbar<br />
                    <strong>Navigation:</strong> Taubenheimstraße 85, 70372 Stuttgart
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Besucherinformationen</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Zutritt</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bitte bringen Sie einen gültigen Personalausweis oder Reisepass mit. 
                    Der Zutritt erfolgt über die Hauptpforte.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Sicherheitshinweise</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Auf dem Gelände gelten besondere Sicherheitsvorschriften. 
                    Bitte beachten Sie die Hinweise vor Ort.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Kontaktformular */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Kontaktformular</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Für allgemeine Anfragen können Sie uns über das folgende Formular erreichen. 
              Für dringende Angelegenheiten nutzen Sie bitte die oben genannten Kontaktdaten.
            </p>
            
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Betreff *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Nachricht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-400">
                  Ich habe die <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</a> gelesen und stimme zu. *
                </label>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Nachricht senden
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
} 