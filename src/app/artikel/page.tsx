"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Search, Calendar, Eye, Clock, User, Tag } from "lucide-react";
import Link from "next/link";
import PageLayout from "~/components/layout/PageLayout";
import type { InvestigationData } from "~/lib/services/fahndungs.service";

interface ArticleCardProps {
  article: InvestigationData;
}

function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return (
    <article className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {getCategoryLabel(article.category)}
            </span>
            {article.article_views && article.article_views > 0 && (
              <span className="flex items-center text-xs text-gray-500">
                <Eye className="mr-1 h-3 w-3" />
                {article.article_views}
              </span>
            )}
          </div>
          
          <h2 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            <Link href={`/artikel/${article.article_slug}`}>
              {article.title}
            </Link>
          </h2>
          
          <p className="mb-3 text-gray-600 dark:text-gray-300">
            {article.short_description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {formatDate(article.article_published_at || article.created_at)}
          </span>
          
          {article.article_meta?.reading_time && (
            <span className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {article.article_meta.reading_time} Min.
            </span>
          )}
          
          {article.article_meta?.author && (
            <span className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {article.article_meta.author}
            </span>
          )}
        </div>
        
        <Link
          href={`/artikel/${article.article_slug}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Weiterlesen →
        </Link>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function ArtikelPage() {
  const [articles, setArticles] = useState<InvestigationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const supabase = createClientComponentClient();

  useEffect(() => {
    void fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("investigations")
        .select(`
          *,
          created_by_user:user_profiles!investigations_created_by_fkey(name, email),
          images:investigation_images(*)
        `)
        .eq("published_as_article", true)
        .eq("status", "published")
        .not("article_slug", "is", null)
        .order("article_published_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error("Supabase Fehler:", supabaseError);
        setError(`Fehler beim Laden der Artikel: ${supabaseError.message}`);
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { value: "all", label: "Alle Kategorien" },
    { value: "WANTED_PERSON", label: "Gesuchte Person" },
    { value: "MISSING_PERSON", label: "Vermisste Person" },
    { value: "UNKNOWN_DEAD", label: "Unbekannter Toter" },
    { value: "STOLEN_GOODS", label: "Gestohlene Waren" },
  ];

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Artikel werden geladen...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
              Fehler beim Laden der Artikel
            </h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Artikel & Berichte
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Aktuelle Fahndungen und Berichte der Polizei
          </p>
        </div>

        {/* Filter und Suche */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
          </div>

          <button
            onClick={fetchArticles}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Filter anwenden
          </button>
        </div>

        {/* Artikel Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-gray-400">
              <Search className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Keine Artikel gefunden
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {searchTerm || selectedCategory !== "all"
                ? "Versuchen Sie andere Suchbegriffe oder Filter."
                : "Aktuell sind keine Artikel verfügbar."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Statistiken */}
        {articles.length > 0 && (
          <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Übersicht
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {articles.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Artikel
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {articles.filter(a => a.category === "MISSING_PERSON").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Vermisste
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {articles.filter(a => a.category === "WANTED_PERSON").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Gesucht
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {articles.filter(a => a.category === "STOLEN_GOODS").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Diebstahl
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 