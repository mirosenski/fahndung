"use client";

import { ReactNode } from "react";
import { ArrowLeft, Share2, Bookmark, Eye, Calendar, User, Clock, Tag } from "lucide-react";
import Link from "next/link";
import type { InvestigationData } from "~/lib/services/fahndungs.service";

interface ArticleLayoutProps {
  article: InvestigationData;
  children: ReactNode;
  showBackButton?: boolean;
  showShareButton?: boolean;
  showBookmarkButton?: boolean;
  showStats?: boolean;
  className?: string;
}

export default function ArticleLayout({
  article,
  children,
  showBackButton = true,
  showShareButton = true,
  showBookmarkButton = true,
  showStats = true,
  className = "",
}: ArticleLayoutProps) {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      WANTED_PERSON: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      MISSING_PERSON: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      UNKNOWN_DEAD: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      STOLEN_GOODS: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[category] || "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.short_description || "",
        url: window.location.href,
      });
    } else {
      // Fallback: URL kopieren
      navigator.clipboard.writeText(window.location.href);
      alert("Link wurde in die Zwischenablage kopiert!");
    }
  };

  return (
    <div className={`mx-auto max-w-4xl ${className}`}>
      {/* Navigation */}
      {showBackButton && (
        <div className="mb-6">
          <Link
            href="/artikel"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Artikelliste
          </Link>
        </div>
      )}

      {/* Artikel Header */}
      <article>
        <header className="mb-8">
          {/* Kategorie und Actions */}
          <div className="mb-4 flex items-center justify-between">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(article.category)}`}>
              {getCategoryLabel(article.category)}
            </span>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {showStats && article.article_views && article.article_views > 0 && (
                <span className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  {article.article_views} Aufrufe
                </span>
              )}
              
              {showShareButton && (
                <button
                  onClick={handleShare}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  Teilen
                </button>
              )}
              
              {showBookmarkButton && (
                <button className="flex items-center hover:text-blue-600 dark:hover:text-blue-400">
                  <Bookmark className="mr-1 h-4 w-4" />
                  Merken
                </button>
              )}
            </div>
          </div>

          {/* Titel */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {article.title}
          </h1>

          {/* Kurzbeschreibung */}
          {article.short_description && (
            <p className="mb-6 text-xl text-gray-600 dark:text-gray-300">
              {article.short_description}
            </p>
          )}

          {/* Meta-Informationen */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {formatDate(article.article_published_at || article.created_at)}
            </span>
            
            {article.article_meta?.reading_time && (
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {article.article_meta.reading_time} Min. Lesezeit
              </span>
            )}
            
            {article.article_meta?.author && (
              <span className="flex items-center">
                <User className="mr-1 h-4 w-4" />
                {article.article_meta.author}
              </span>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
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
        </header>

        {/* Artikel Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {children}
        </div>
      </article>
    </div>
  );
} 