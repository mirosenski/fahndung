"use client";

import React, { useState, useEffect } from "react";
import {
  Info,
  Calendar,
  Eye,
  User,
  Shield,
  Clock,
  MapPin,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  Badge,
  Tag,
  Image,
  FileImage,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Map,
  Navigation,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import NextImage from "next/image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge as BadgeComponent } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";

import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface OverviewCategoryProps {
  data: UIInvestigationData;
  isEditMode: boolean;
  updateField: (
    step: keyof UIInvestigationData,
    field: string,
    value: unknown,
  ) => void;
  onNext: () => void;
}

interface UploadedImage {
  id: string;
  url: string;
  alt_text?: string;
  caption?: string;
}

export default function OverviewCategory({
  data,
  isEditMode,
  updateField,
  onNext,
}: OverviewCategoryProps) {
  const [isMapLoading, setIsMapLoading] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MISSING_PERSON":
        return <User className="h-5 w-5" />;
      case "WANTED_PERSON":
        return <AlertTriangle className="h-5 w-5" />;
      case "UNKNOWN_DEAD":
        return <Badge className="h-5 w-5" />;
      case "STOLEN_GOODS":
        return <FileText className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300";
      case "new":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300";
    }
  };

  // Echte Daten aus dem UIInvestigationData Modell
  const mainImage = data.step3?.mainImage ?? null;
  const uploadedImages: UploadedImage[] =
    (data.step3?.additionalImages?.map((url, index) => ({
      id: `image-${index}`,
      url,
      alt_text: `Bild ${index + 1}`,
    })) as UploadedImage[]) ?? [];
  const location =
    data.step4?.mainLocation?.address ?? "Standort nicht angegeben";
  const shortDescription =
    data.step2.shortDescription ?? "Keine Beschreibung verfügbar";

  // Karten-URL generieren
  useEffect(() => {
    if (location && location !== "Standort nicht angegeben") {
      setIsMapLoading(true);
      // Google Maps Static API URL (wird aktuell nicht verwendet, da OpenStreetMap verwendet wird)
      // const googleMapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=13&size=400x300&markers=color:red%7C${encodeURIComponent(location)}`;

      // Fallback zu OpenStreetMap wenn kein API Key
      setIsMapLoading(false);
    }
  }, [location]);

  const openInMaps = () => {
    if (location && location !== "Standort nicht angegeben") {
      const encodedAddress = encodeURIComponent(location);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(mapsUrl, "_blank");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hero Section with Main Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Main Image */}
        {mainImage ? (
          <div className="absolute inset-0">
            <NextImage
              src={mainImage}
              alt="Hauptbild"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center text-white/60">
                <Image
                  className="mx-auto mb-4 h-16 w-16"
                  aria-hidden="true"
                  aria-label="Hauptbild Icon"
                />
                <p className="text-lg font-medium">Hauptbild</p>
                <p className="text-sm">Klicken Sie zum Hochladen</p>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              {/* Category and Priority Badges */}
              <div className="flex flex-wrap items-center gap-3">
                {isEditMode ? (
                  <>
                    <Select
                      value={data.step1.category}
                      onValueChange={(value) =>
                        updateField("step1", "category", value)
                      }
                    >
                      <SelectTrigger className="w-auto border-white/20 bg-white/10 text-white backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MISSING_PERSON">
                          Vermisste Person
                        </SelectItem>
                        <SelectItem value="WANTED_PERSON">
                          Straftäter
                        </SelectItem>
                        <SelectItem value="UNKNOWN_DEAD">
                          Unbekannte Tote
                        </SelectItem>
                        <SelectItem value="STOLEN_GOODS">
                          Gestohlene Sachen
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={data.step2.priority}
                      onValueChange={(value) =>
                        updateField("step2", "priority", value)
                      }
                    >
                      <SelectTrigger className="w-auto border-white/20 bg-white/10 text-white backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Dringend</SelectItem>
                        <SelectItem value="new">Neu</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
                      {getCategoryIcon(data.step1.category)}
                      <span className="text-sm font-medium">
                        {data.step1.category === "MISSING_PERSON"
                          ? "Vermisste Person"
                          : data.step1.category === "WANTED_PERSON"
                            ? "Straftäter"
                            : data.step1.category === "UNKNOWN_DEAD"
                              ? "Unbekannte Tote"
                              : "Gestohlene Sachen"}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${getPriorityColor(data.step2.priority)}`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          data.step2.priority === "urgent"
                            ? "bg-red-500"
                            : data.step2.priority === "new"
                              ? "bg-green-500"
                              : "bg-gray-500"
                        }`}
                      />
                      {data.step2.priority === "urgent"
                        ? "Dringend"
                        : data.step2.priority === "new"
                          ? "Neu"
                          : "Normal"}
                    </div>
                  </>
                )}
              </div>

              {/* Title */}
              {isEditMode ? (
                <Input
                  value={data.step1.title}
                  onChange={(e) =>
                    updateField("step1", "title", e.target.value)
                  }
                  className="border-0 bg-transparent text-3xl font-bold text-white placeholder-white/50 focus:border-0 focus:ring-0 lg:text-4xl"
                  placeholder="Titel eingeben..."
                />
              ) : (
                <h1 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
                  {data.step1.title}
                </h1>
              )}

              {/* Short Description */}
              {isEditMode ? (
                <Textarea
                  value={data.step2.shortDescription}
                  onChange={(e) =>
                    updateField("step2", "shortDescription", e.target.value)
                  }
                  className="resize-none border-0 bg-transparent text-lg text-blue-100 placeholder-white/50 focus:border-0 focus:ring-0"
                  placeholder="Kurze Beschreibung..."
                  rows={2}
                />
              ) : (
                <p className="max-w-2xl text-lg leading-relaxed text-blue-100">
                  {shortDescription}
                </p>
              )}
            </div>

            {/* Case Number and Stats */}
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="text-left lg:text-right">
                <CaseNumberDetailed caseNumber={data.step1.caseNumber ?? ""} />
              </div>

              <div className="flex items-center gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString("de-DE")}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />0 Aufrufe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isEditMode && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nächste Schritte
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fügen Sie weitere Details hinzu
                </p>
              </div>
              <Button onClick={onNext} className="flex items-center gap-2">
                Zur Beschreibung
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Contact & Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Information */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
                Kontaktinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Kontaktperson
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {data.step5.contactPerson || "Nicht angegeben"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Abteilung
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {data.step5.department || "Nicht angegeben"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Verfügbare Zeiten
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {data.step5.availableHours || "Nicht angegeben"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Details */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Fall-Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <BadgeComponent variant="secondary" className="mt-1">
                      Aktiv
                    </BadgeComponent>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bereich
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Bundesweit
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Erstellt am
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date().toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Map className="h-5 w-5 text-blue-600" />
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <Navigation className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Letzter bekannter Standort
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {location}
                    </p>
                  </div>
                </div>

                {/* Interactive Map */}
                {location && location !== "Standort nicht angegeben" ? (
                  <div className="space-y-3">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      {isMapLoading ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Map className="mx-auto mb-2 h-8 w-8 animate-pulse" />
                            <p className="text-sm">Karte wird geladen...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-full w-full">
                          <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(location)}&layer=mapnik&marker=${encodeURIComponent(location)}`}
                            className="h-full w-full border-0"
                            title="Standort Karte"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-0" />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={openInMaps}
                      variant="outline"
                      className="flex w-full items-center gap-2"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                      In Google Maps öffnen
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Map className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">Kein Standort verfügbar</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Images & Documents */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image Gallery */}
          <Card className="border-0 bg-white shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image
                  className="h-5 w-5 text-blue-600"
                  aria-hidden="true"
                  aria-label="Bilder und Dokumente Icon"
                />
                Bilder & Dokumente
                {uploadedImages.length > 0 && (
                  <BadgeComponent variant="secondary" className="ml-2">
                    {uploadedImages.length}
                  </BadgeComponent>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                    >
                      <NextImage
                        src={image.url}
                        alt={image.alt_text ?? `Bild ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
                      <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {/* Empty State Placeholders */}
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center text-gray-400">
                          <FileImage className="mx-auto mb-2 h-8 w-8" />
                          <p className="text-xs">Bild {index}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
                      <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Kontakt aufnehmen
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail senden
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Teilen
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Merken
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Kommentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
