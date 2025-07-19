"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useFahndung } from "@/lib/hooks/useFahndung";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  Share2,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { FahndungsService } from "@/lib/services/fahndungs.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/types/errors";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const categoryLabels = {
  WANTED_PERSON: "Straftäter",
  MISSING_PERSON: "Vermisste Person",
  UNKNOWN_DEAD: "Unbekannte Tote",
  STOLEN_GOODS: "Sachen",
};

const priorityColors = {
  normal: "bg-gray-100 text-gray-800",
  urgent: "bg-red-100 text-red-800",
  new: "bg-blue-100 text-blue-800",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  published: "bg-blue-100 text-blue-800",
  closed: "bg-red-100 text-red-800",
};

export default function FahndungDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { investigation, loading, error } = useFahndung(id as string);

  const handleDelete = async () => {
    if (!confirm("Möchten Sie diese Fahndung wirklich löschen?")) return;

    try {
      const supabase = createClientComponentClient();
      const service = new FahndungsService(supabase);
      await service.deleteInvestigation(id as string);
      toast.success("Fahndung wurde gelöscht");
      router.push("/fahndungen");
    } catch (error: unknown) {
      toast.error("Fehler beim Löschen: " + getErrorMessage(error));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: investigation?.title,
          text: investigation?.short_description,
          url: url,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success("Link in Zwischenablage kopiert");
        })
        .catch(() => {
          toast.error("Fehler beim Kopieren");
        });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-gray-600">Fahndung nicht gefunden</p>
          <Link
            href="/fahndungen"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  // Type guard to ensure investigation is properly typed
  const typedInvestigation = investigation;

  // Helper function to safely get contact info values
  const getContactInfo = (key: string): string | undefined => {
    const value = typedInvestigation.contact_info[key];
    return typeof value === "string" ? value : undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">Fahndungsdetails</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                title="Teilen"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handlePrint}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                title="Drucken"
              >
                <Printer className="h-5 w-5" />
              </button>
              <Link
                href={`/fahndungen/${id as string}/bearbeiten`}
                className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Link>
              <button
                onClick={handleDelete}
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                title="Löschen"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow-sm">
          {/* Images */}
          {typedInvestigation.images &&
            typedInvestigation.images.length > 0 && (
              <div className="relative">
                <Image
                  src={
                    typedInvestigation.images.find((img) => img.is_primary)
                      ?.url ??
                    typedInvestigation.images[0]?.url ??
                    "/placeholder-image.jpg"
                  }
                  alt={typedInvestigation.title}
                  width={800}
                  height={384}
                  className="h-96 w-full rounded-t-lg object-cover"
                />
                {typedInvestigation.images.length > 1 && (
                  <div className="absolute right-4 bottom-4 left-4 flex gap-2 overflow-x-auto">
                    {typedInvestigation.images.map((img, index) => (
                      <Image
                        key={img.id}
                        src={img.url ?? "/placeholder-image.jpg"}
                        alt={`Bild ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded border-2 border-white object-cover shadow"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          <div className="p-6">
            {/* Header Info */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold">
                  {typedInvestigation.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Aktenzeichen: #{typedInvestigation.case_number}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${statusColors[typedInvestigation.status]}`}
                  >
                    {typedInvestigation.status}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${priorityColors[typedInvestigation.priority]}`}
                  >
                    {typedInvestigation.priority === "urgent"
                      ? "Dringend"
                      : typedInvestigation.priority === "new"
                        ? "Neu"
                        : "Normal"}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                {categoryLabels[typedInvestigation.category]}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="space-y-6 lg:col-span-2">
                {/* Short Description */}
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Kurzbeschreibung
                  </h3>
                  <p className="text-gray-700">
                    {typedInvestigation.short_description}
                  </p>
                </div>

                {/* Full Description */}
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Ausführliche Beschreibung
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {typedInvestigation.description}
                  </p>
                </div>

                {/* Features */}
                {typedInvestigation.features && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Besondere Merkmale
                    </h3>
                    <p className="text-gray-700">
                      {typedInvestigation.features}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {typedInvestigation.tags &&
                  typedInvestigation.tags.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {typedInvestigation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Info Box */}
                <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold">Informationen</h3>

                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Datum:</span>
                    <span className="ml-auto">
                      {format(
                        new Date(typedInvestigation.date),
                        "dd. MMMM yyyy",
                        {
                          locale: de,
                        },
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Ort:</span>
                    <span className="ml-auto">
                      {typedInvestigation.location}
                    </span>
                  </div>

                  <div className="flex items-start text-sm">
                    <User className="mt-0.5 mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Dienststelle:</span>
                    <span className="ml-auto text-right">
                      {typedInvestigation.station}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Erstellt von:</span>
                    <span className="ml-auto">
                      {typedInvestigation.created_by_user?.name ?? "Unbekannt"}
                    </span>
                  </div>
                </div>

                {/* Contact Box */}
                {typedInvestigation.contact_info && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-3 font-semibold">Kontakt</h3>

                    {getContactInfo("name") && (
                      <div className="mb-2 flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-blue-600" />
                        <span>{getContactInfo("name")}</span>
                      </div>
                    )}

                    {getContactInfo("phone") && (
                      <div className="mb-2 flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-blue-600" />
                        <a
                          href={`tel:${getContactInfo("phone")}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {getContactInfo("phone")}
                        </a>
                      </div>
                    )}

                    {getContactInfo("email") && (
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-blue-600" />
                        <a
                          href={`mailto:${getContactInfo("email")}`}
                          className="break-all text-blue-600 hover:text-blue-700"
                        >
                          {getContactInfo("email")}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-1 text-xs text-gray-500">
                  <p>
                    Erstellt:{" "}
                    {format(
                      new Date(typedInvestigation.created_at),
                      "dd.MM.yyyy HH:mm",
                      { locale: de },
                    )}
                  </p>
                  <p>
                    Aktualisiert:{" "}
                    {format(
                      new Date(typedInvestigation.updated_at),
                      "dd.MM.yyyy HH:mm",
                      { locale: de },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
