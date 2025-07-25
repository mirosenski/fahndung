"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Globe, 
  FileText, 
  Calendar, 
  User, 
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import type { InvestigationData } from "~/lib/services/fahndungs.service";

interface ArticleManagerProps {
  className?: string;
}

export default function ArticleManager({ className = "" }: ArticleManagerProps) {
  const [articles, setArticles] = useState<InvestigationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showUnpublished, setShowUnpublished] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    void fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);

      let query = supabase
        .from("investigations")
        .select(`
          *,
          created_by_user:user_profiles!investigations_created_by_fkey(name, email),
          images:investigation_images(*)
        `)
        .order("created_at", { ascending: false });

      // Filter für Artikel
      if (showUnpublished) {
        query = query.eq("published_as_article", true);
      } else {
        query = query.eq("published_as_article", true)
          .eq("status", "published");
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fehler beim Laden der Artikel:", error);
        toast.error("Fehler beim Laden der Artikel");
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  const handlePublishArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("investigations")
        .update({
          published_as_article: true,
          status: "published",
          article_published_at: new Date().toISOString(),
        })
        .eq("id", articleId);

      if (error) {
        toast.error("Fehler beim Veröffentlichen des Artikels");
        return;
      }

      toast.success("Artikel erfolgreich veröffentlicht");
      void fetchArticles();
    } catch (error) {
      console.error("Fehler beim Veröffentlichen:", error);
      toast.error("Fehler beim Veröffentlichen des Artikels");
    }
  };

  const handleUnpublishArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("investigations")
        .update({
          published_as_article: false,
          article_slug: null,
          article_published_at: null,
        })
        .eq("id", articleId);

      if (error) {
        toast.error("Fehler beim Zurückziehen des Artikels");
        return;
      }

      toast.success("Artikel erfolgreich zurückgezogen");
      void fetchArticles();
    } catch (error) {
      console.error("Fehler beim Zurückziehen:", error);
      toast.error("Fehler beim Zurückziehen des Artikels");
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Artikel löschen möchten?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("investigations")
        .delete()
        .eq("id", articleId);

      if (error) {
        toast.error("Fehler beim Löschen des Artikels");
        return;
      }

      toast.success("Artikel erfolgreich gelöscht");
      void fetchArticles();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      toast.error("Fehler beim Löschen des Artikels");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      WANTED_PERSON: "Gesuchte Person",
      MISSING_PERSON: "Vermisste Person",
      UNKNOWN_DEAD: "Unbekannter Toter",
      STOLEN_GOODS: "Gestohlene Waren",
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string, publishedAsArticle: boolean) => {
    if (!publishedAsArticle) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          Nicht als Artikel
        </span>
      );
    }

    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Veröffentlicht
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Entwurf
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const categories = [
    { value: "all", label: "Alle Kategorien" },
    { value: "WANTED_PERSON", label: "Gesuchte Person" },
    { value: "MISSING_PERSON", label: "Vermisste Person" },
    { value: "UNKNOWN_DEAD", label: "Unbekannter Toter" },
    { value: "STOLEN_GOODS", label: "Gestohlene Waren" },
  ];

  const statuses = [
    { value: "all", label: "Alle Status" },
    { value: "published", label: "Veröffentlicht" },
    { value: "draft", label: "Entwurf" },
    { value: "active", label: "Aktiv" },
    { value: "closed", label: "Geschlossen" },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Artikel-Management
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Verwalten Sie veröffentlichte Artikel und Fahndungen
          </p>
        </div>
        <button
          onClick={fetchArticles}
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neue Fahndung
        </button>
      </div>

      {/* Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Artikel durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showUnpublished}
              onChange={(e) => setShowUnpublished(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Nur Artikel anzeigen
            </span>
          </label>

          <button
            onClick={fetchArticles}
            className="flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter anwenden
          </button>
        </div>
      </div>

      {/* Artikel Liste */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Artikel werden geladen...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Keine Artikel gefunden
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Versuchen Sie andere Filter-Einstellungen."
                  : "Aktuell sind keine Artikel verfügbar."}
              </p>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getCategoryLabel(article.category)}
                      </span>
                      {getStatusBadge(article.status, article.published_as_article || false)}
                      {article.article_views && article.article_views > 0 && (
                        <span className="flex items-center text-xs text-gray-500">
                          <Eye className="mr-1 h-3 w-3" />
                          {article.article_views}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {article.title}
                    </h3>

                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                      {article.short_description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(article.created_at)}
                      </span>
                      {article.created_by_user && (
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {article.created_by_user.name}
                        </span>
                      )}
                      {article.article_slug && (
                        <span className="flex items-center">
                          <Globe className="mr-1 h-3 w-3" />
                          /artikel/{article.article_slug}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    {article.published_as_article ? (
                      <button
                        onClick={() => handleUnpublishArticle(article.id)}
                        className="flex items-center rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                        title="Artikel zurückziehen"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Zurückziehen
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublishArticle(article.id)}
                        className="flex items-center rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                        title="Als Artikel veröffentlichen"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Veröffentlichen
                      </button>
                    )}

                    <button
                      onClick={() => window.open(`/fahndungen/${article.id}`, "_blank")}
                      className="flex items-center rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                      title="Bearbeiten"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Bearbeiten
                    </button>

                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="flex items-center rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                      title="Löschen"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Statistiken */}
      {articles.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Übersicht
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {articles.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Gesamt
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {articles.filter(a => a.published_as_article && a.status === "published").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Veröffentlicht
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {articles.filter(a => a.published_as_article && a.status === "draft").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Entwürfe
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {articles.reduce((sum, a) => sum + (a.article_views || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Gesamtaufrufe
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 