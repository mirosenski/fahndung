"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useFahndungen } from "@/lib/hooks/useFahndungen";
import { FahndungsService } from "@/lib/services/fahndungs.service";
import { getErrorMessage } from "@/types/errors";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  AlertCircle,
  User,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";

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

export default function FahndungenPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");

  const { investigations, loading, error, refetch } = useFahndungen({
    search: searchQuery,
    category: selectedCategory,
    status: selectedStatus,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diese Fahndung wirklich löschen?")) return;

    try {
      const supabase = createClientComponentClient();
      const service = new FahndungsService(supabase);
      await service.deleteInvestigation(id);
      void refetch();
    } catch (error: unknown) {
      console.error("Fehler beim Löschen:", getErrorMessage(error));
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-gray-600">Fehler beim Laden der Fahndungen</p>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">Fahndungen</h1>
            <Link
              href="/fahndungen/neu"
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              <Plus className="mr-2 h-5 w-5" />
              Neue Fahndung
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Kategorien</option>
              <option value="WANTED_PERSON">Straftäter</option>
              <option value="MISSING_PERSON">Vermisste Person</option>
              <option value="UNKNOWN_DEAD">Unbekannte Tote</option>
              <option value="STOLEN_GOODS">Sachen</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktiv</option>
              <option value="draft">Entwurf</option>
              <option value="closed">Geschlossen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : investigations.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Keine Fahndungen gefunden</p>
            <p className="mt-2 text-sm text-gray-500">
              Versuchen Sie es mit anderen Suchkriterien
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image */}
                {inv.images && inv.images.length > 0 ? (
                  <Image
                    src={
                      inv.images.find((img) => img.is_primary)?.url ??
                      inv.images[0]?.url ??
                      ""
                    }
                    alt={inv.title}
                    width={400}
                    height={192}
                    className="h-48 w-full rounded-t-lg object-cover"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gray-200">
                    <AlertCircle className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="line-clamp-1 text-lg font-semibold">
                      {inv.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${priorityColors[inv.priority]}`}
                    >
                      {inv.priority === "urgent"
                        ? "Dringend"
                        : inv.priority === "new"
                          ? "Neu"
                          : "Normal"}
                    </span>
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {inv.short_description}
                  </p>

                  <div className="mb-4 space-y-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDistanceToNow(new Date(inv.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {inv.location}
                    </div>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {inv.created_by_user?.name ?? "Unbekannt"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                      {categoryLabels[inv.category]}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{inv.case_number}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t pt-4">
                    <Link
                      href={`/fahndungen/${inv.id}`}
                      className="flex flex-1 items-center justify-center rounded bg-blue-50 px-3 py-2 text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ansehen
                    </Link>
                    <Link
                      href={`/fahndungen/${inv.id}/bearbeiten`}
                      className="rounded p-2 text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
