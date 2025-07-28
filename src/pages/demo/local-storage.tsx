import { type NextPage } from "next";
import Head from "next/head";
import PageLayout from "~/components/layout/PageLayout";
import DualStorageUpload from "~/components/media/DualStorageUpload";
import LocalImageGallery from "~/components/media/LocalImageGallery";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { HardDrive, Cloud, Upload } from "lucide-react";
import { useState } from "react";

const LocalStorageDemo: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload");

  return (
    <>
      <Head>
        <title>Lokale Bildverwaltung - Demo</title>
        <meta
          name="description"
          content="Demo für lokale und Supabase Bildverwaltung"
        />
      </Head>
      <PageLayout session={null}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Lokale Bildverwaltung</h1>
            <p className="text-gray-600">
              Testen Sie die Dual-Storage-Funktionalität für Bilder. Laden Sie
              Bilder sowohl in Supabase als auch lokal hoch.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === "upload"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === "gallery"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <HardDrive className="h-4 w-4" />
                  Lokale Galerie
                </button>
              </nav>
            </div>
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <span>Supabase Storage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-600">
                    Bilder werden in der Supabase Cloud gespeichert. Ideal für
                    Produktionsumgebungen mit automatischen Backups und CDN.
                  </p>
                  <DualStorageUpload
                    onUploadComplete={(result) => {
                      console.log("Supabase Upload erfolgreich:", result);
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-green-500" />
                    <span>Lokaler Storage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-600">
                    Bilder werden lokal im <code>/public/images/</code> Ordner
                    gespeichert. Schneller Zugriff ohne Internetverbindung.
                  </p>
                  <DualStorageUpload
                    onUploadComplete={(result) => {
                      console.log("Lokaler Upload erfolgreich:", result);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && <LocalImageGallery />}

          {/* Informationen */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  Supabase Vorteile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Automatische Backups</li>
                  <li>CDN für schnelle Auslieferung</li>
                  <li>Skalierbare Infrastruktur</li>
                  <li>Versionierung und Rollback</li>
                  <li>Globale Verfügbarkeit</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-green-500" />
                  Lokaler Storage Vorteile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Schneller lokaler Zugriff</li>
                  <li>Keine Internetverbindung nötig</li>
                  <li>Volle Kontrolle über Daten</li>
                  <li>Keine Cloud-Kosten</li>
                  <li>Offline-Funktionalität</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default LocalStorageDemo;
