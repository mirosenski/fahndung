"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Calendar, Tag, User, Eye, Clock } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ArticleCard from "./ArticleCard";
import type { InvestigationData } from "~/lib/services/fahndungs.service";

interface ArticleSearchProps {
  className?: string;
  showFeatured?: boolean;
  limit?: number;
}

export default function ArticleSearch({
  className = "",
  showFeatured = true,
  limit = 12,
}: ArticleSearchProps) {
  const [articles, setArticles] = useState<InvestigationData[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<InvestigationData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [minViews, setMinViews] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    void fetchArticles();
  }, [
    searchTerm,
    selectedCategory,
    selectedSort,
    dateRange,
    minViews,
    selectedTags,
  ]);

  async function fetchArticles() {
    try {
      setLoading(true);

      let query = supabase
        .from("investigations")
        .select(
          `
          *,
          created_by_user:user_profiles!investigations_created_by_fkey(name, email),
          images:investigation_images(*)
        `,
        )
        .eq("published_as_article", true)
        .eq("status", "published")
        .not("article_slug", "is", null);

      // Kategorie-Filter
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // Datums-Filter
      if (dateRange !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (dateRange) {
          case "today":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte("article_published_at", startDate.toISOString());
      }

      // Views-Filter
      if (minViews) {
        query = query.gte("article_views", parseInt(minViews));
      }

      // Tags-Filter
      if (selectedTags.length > 0) {
        query = query.overlaps("tags", selectedTags);
      }

      // Sortierung
      switch (selectedSort) {
        case "newest":
          query = query.order("article_published_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("article_published_at", { ascending: true });
          break;
        case "most_viewed":
          query = query.order("article_views", { ascending: false });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
      }

      // Limit
      query = query.limit(limit);

      // Suche
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fehler beim Laden der Artikel:", error);
        return;
      }

      setArticles(data || []);

      // Featured Articles laden (wenn aktiviert)
      if (showFeatured) {
        const featuredQuery = supabase
          .from("investigations")
          .select(
            `
            *,
            created_by_user:user_profiles!investigations_created_by_fkey(name, email),
            images:investigation_images(*)
          `,
          )
          .eq("published_as_article", true)
          .eq("status", "published")
          .not("article_slug", "is", null)
          .gte("article_views", 10) // Mindestens 10 Views
          .order("article_views", { ascending: false })
          .limit(3);

        const { data: featuredData } = await featuredQuery;
        setFeaturedArticles(featuredData || []);
      }
    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
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

  const sortOptions = [
    { value: "newest", label: "Neueste zuerst" },
    { value: "oldest", label: "Älteste zuerst" },
    { value: "most_viewed", label: "Meist gelesen" },
    { value: "title", label: "Alphabetisch" },
  ];

  const dateRanges = [
    { value: "all", label: "Alle Zeiträume" },
    { value: "today", label: "Heute" },
    { value: "week", label: "Letzte Woche" },
    { value: "month", label: "Letzter Monat" },
    { value: "year", label: "Letztes Jahr" },
  ];

  const availableTags = Array.from(
    new Set(articles.flatMap((article) => article.tags || [])),
  ).sort();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Such-Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Artikel durchsuchen
          </h2>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <Filter className="mr-2 h-4 w-4" />
            Erweiterte Filter
          </button>
        </div>

        {/* Basis-Suche */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Artikel durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Erweiterte Filter */}
        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Zeitraum
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mindestaufrufe
              </label>
              <input
                type="number"
                placeholder="z.B. 10"
                value={minViews}
                onChange={(e) => setMinViews(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(
                            selectedTags.filter((t) => t !== tag),
                          );
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedSort("newest");
                  setDateRange("all");
                  setMinViews("");
                  setSelectedTags([]);
                }}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Featured Articles */}
      {showFeatured && featuredArticles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Empfohlene Artikel
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="featured"
              />
            ))}
          </div>
        </div>
      )}

      {/* Suchergebnisse */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Suchergebnisse ({articles.length})
          </h3>
          {loading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></div>
              Wird geladen...
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
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
      </div>
    </div>
  );
}
