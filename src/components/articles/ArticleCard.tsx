"use client";

import { Calendar, Eye, Clock, User, Tag } from "lucide-react";
import Link from "next/link";
import type { InvestigationData } from "~/lib/services/fahndungs.service";

interface ArticleCardProps {
  article: InvestigationData;
  variant?: "default" | "featured" | "compact";
  showStats?: boolean;
}

export default function ArticleCard({ 
  article, 
  variant = "default",
  showStats = true 
}: ArticleCardProps) {
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

  if (variant === "compact") {
    return (
      <article className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(article.category)}`}>
            {getCategoryLabel(article.category)}
          </span>
          {showStats && article.article_views && article.article_views > 0 && (
            <span className="flex items-center text-xs text-gray-500">
              <Eye className="mr-1 h-3 w-3" />
              {article.article_views}
            </span>
          )}
        </div>
        
        <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          <Link href={`/artikel/${article.article_slug}`}>
            {article.title}
          </Link>
        </h3>
        
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {article.short_description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(article.article_published_at || article.created_at)}
          </span>
          
          <Link
            href={`/artikel/${article.article_slug}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Weiterlesen →
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
        {/* Featured Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Empfohlen
          </span>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(article.category)}`}>
                  {getCategoryLabel(article.category)}
                </span>
                {showStats && article.article_views && article.article_views > 0 && (
                  <span className="flex items-center text-sm text-gray-500">
                    <Eye className="mr-1 h-4 w-4" />
                    {article.article_views}
                  </span>
                )}
              </div>
              
              <h2 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                <Link href={`/artikel/${article.article_slug}`}>
                  {article.title}
                </Link>
              </h2>
              
              <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
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
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(article.category)}`}>
              {getCategoryLabel(article.category)}
            </span>
            {showStats && article.article_views && article.article_views > 0 && (
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