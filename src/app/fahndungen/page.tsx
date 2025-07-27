// src/app/fahndungen/page.tsx - Erweiterte Übersicht mit CRUD
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "~/trpc/react";
import PageLayout from "~/components/layout/PageLayout";
import InvestigationActions from "~/components/fahndungen/InvestigationActions";
import { getRolePermissions } from "~/lib/auth";
import { useAuth } from "~/hooks/useAuth";
import { getCategoryLabel as translateCategory } from "@/types/translations";

// Interface für tRPC Investigation (aus post.ts)
interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

export default function FahndungenPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"all" | "my">("all");

  // Benutzer und Berechtigungen aus der Session
  const currentUser = session?.user ?? null;
  const userProfile = session?.profile ?? null;
  const userPermissions = userProfile
    ? getRolePermissions(userProfile.role)
    : null;

  // tRPC Queries
  const {
    data: investigations = [],
    isLoading,
    refetch,
  } = api.post.getInvestigations.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const { data: myInvestigations = [], refetch: refetchMy } =
    api.post.getMyInvestigations.useQuery(
      { limit: 50, offset: 0 },
      { enabled: viewMode === "my" && !!currentUser },
    );

  // Aktuelle Daten basierend auf View Mode
  const currentInvestigations: Investigation[] =
    viewMode === "my" ? myInvestigations : investigations;

  // Gefilterte Daten
  const filteredInvestigations = currentInvestigations.filter(
    (inv: Investigation) =>
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.location ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Statistiken
  const stats = {
    total: currentInvestigations.length,
    active: currentInvestigations.filter(
      (inv: Investigation) => inv.status === "active",
    ).length,
    published: currentInvestigations.filter(
      (inv: Investigation) => inv.status === "published",
    ).length,
    urgent: currentInvestigations.filter(
      (inv: Investigation) => inv.priority === "urgent",
    ).length,
  };

  // Event Handlers
  const handleRefresh = async () => {
    if (viewMode === "my") {
      await refetchMy();
    } else {
      await refetch();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
      case "new":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300";
      case "active":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
      case "draft":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getCategoryLabel = translateCategory;

  // Loading State
  if (authLoading || isLoading) {
    return (
      <PageLayout session={session}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Fahndungen werden geladen...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout session={session}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Fahndungen
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentUser
                ? `${stats.total} Fahndungen verwalten (${stats.active} aktiv, ${stats.published} veröffentlicht)`
                : `${stats.total} öffentliche Fahndungen`}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle (nur für eingeloggte Benutzer) */}
            {currentUser && (
              <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  onClick={() => setViewMode("all")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    viewMode === "all"
                      ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setViewMode("my")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    viewMode === "my"
                      ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Meine
                </button>
              </div>
            )}

            {/* Neue Fahndung Button */}
            {userPermissions?.canCreate && (
              <button
                onClick={() => router.push("/fahndungen/neu")}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span>Neue Fahndung</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistiken */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Gesamt
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Aktiv
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Veröffentlicht
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.published}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Dringend
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.urgent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter und Suche */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Fahndungen durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Alle Status</option>
              <option value="draft">Entwurf</option>
              <option value="active">Aktiv</option>
              <option value="published">Veröffentlicht</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Alle Prioritäten</option>
              <option value="normal">Normal</option>
              <option value="urgent">Dringend</option>
              <option value="new">Neu</option>
            </select>

            <button
              onClick={handleRefresh}
              className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Fahndungen Liste */}
        {filteredInvestigations.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Fahndungen gefunden
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm
                ? "Versuchen Sie andere Suchbegriffe."
                : "Erstellen Sie Ihre erste Fahndung."}
            </p>
            {userPermissions?.canCreate && !searchTerm && (
              <button
                onClick={() => router.push("/fahndungen/neu")}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Neue Fahndung erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvestigations.map((investigation: Investigation) => (
              <div
                key={investigation.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {investigation.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(
                          investigation.priority,
                        )}`}
                      >
                        {investigation.priority === "urgent" && "DRINGEND"}
                        {investigation.priority === "new" && "NEU"}
                        {investigation.priority === "normal" && "NORMAL"}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          investigation.status,
                        )}`}
                      >
                        {investigation.status === "published" &&
                          "Veröffentlicht"}
                        {investigation.status === "active" && "Aktiv"}
                        {investigation.status === "draft" && "Entwurf"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Aktenzeichen: {investigation.case_number}</span>
                      <span>•</span>
                      <span>{getCategoryLabel(investigation.category)}</span>
                      {investigation.location && (
                        <>
                          <span>•</span>
                          <span>{investigation.location}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(investigation.created_at).toLocaleDateString(
                          "de-DE",
                        )}
                      </span>
                    </div>

                    {investigation.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {investigation.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-6">
                    <InvestigationActions
                      investigation={investigation}
                      userRole={userProfile?.role ?? undefined}
                      userPermissions={userPermissions ?? undefined}
                      onAction={handleRefresh}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
