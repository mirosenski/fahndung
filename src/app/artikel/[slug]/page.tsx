"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  Calendar, 
  Eye, 
  Clock, 
  User, 
  Tag, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  ArrowLeft,
  Share2,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import PageLayout from "~/components/layout/PageLayout";
import type { InvestigationData, ArticleBlock } from "~/lib/services/fahndungs.service";

interface ArticleBlockProps {
  block: ArticleBlock;
}

function ArticleBlock({ block }: ArticleBlockProps) {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag className="mt-8 mb-4 font-bold text-gray-900 dark:text-white">
          {block.content}
        </HeadingTag>
      );
    
    case "paragraph":
      return (
        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {block.content}
        </p>
      );
    
    case "image":
      return (
        <figure className="my-6">
          <img
            src={block.src}
            alt={block.alt || ""}
            className="w-full rounded-lg shadow-md"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    
    case "quote":
      return (
        <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-400 dark:bg-blue-900/20">
          <p className="italic text-gray-700 dark:text-gray-300">
            "{block.content}"
          </p>
          {block.author && (
            <cite className="mt-2 block text-sm text-gray-600 dark:text-gray-400">
              — {block.author}
            </cite>
          )}
        </blockquote>
      );
    
    case "list":
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className={`my-4 ml-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items?.map((item, index) => (
            <li key={index} className="mb-2 text-gray-700 dark:text-gray-300">
              {item}
            </li>
          ))}
        </ListTag>
      );
    
    case "code":
      return (
        <pre className="my-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <code className={`text-sm ${block.language || ""}`}>
            {block.content}
          </code>
        </pre>
      );
    
    default:
      return null;
  }
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    void fetchArticle();
  }, [slug]);

  async function fetchArticle() {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      // Artikel laden
      const { data, error: articleError } = await supabase
        .from("investigations")
        .select(`
          *,
          created_by_user:user_profiles!investigations_created_by_fkey(name, email),
          images:investigation_images(*)
        `)
        .eq("article_slug", slug)
        .eq("published_as_article", true)
        .eq("status", "published")
        .single();

      if (articleError) {
        if (articleError.message.includes("No rows found")) {
          setError("Artikel nicht gefunden");
        } else {
          console.error("Supabase Fehler:", articleError);
          setError(`Fehler beim Laden des Artikels: ${articleError.message}`);
        }
        return;
      }

      setArticle(data);

      // Views erhöhen
      await supabase.rpc("increment_article_views", {
        article_id: data.id,
      });

    } catch (error) {
      console.error("Unerwarteter Fehler:", error);
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setLoading(false);
    }
  }

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title || "",
        text: article?.short_description || "",
        url: window.location.href,
      });
    } else {
      // Fallback: URL kopieren
      navigator.clipboard.writeText(window.location.href);
      alert("Link wurde in die Zwischenablage kopiert!");
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Artikel wird geladen...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !article) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
              {error || "Artikel nicht gefunden"}
            </h2>
            <p className="text-red-700 dark:text-red-300">
              Der angeforderte Artikel konnte nicht gefunden werden.
            </p>
            <Link
              href="/artikel"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Artikelliste
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/artikel"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Artikelliste
          </Link>
        </div>

        {/* Artikel Header */}
        <article className="mx-auto max-w-4xl">
          <header className="mb-8">
            {/* Kategorie und Views */}
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {getCategoryLabel(article.category)}
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {article.article_views && article.article_views > 0 && (
                  <span className="flex items-center">
                    <Eye className="mr-1 h-4 w-4" />
                    {article.article_views} Aufrufe
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  Teilen
                </button>
                <button className="flex items-center hover:text-blue-600 dark:hover:text-blue-400">
                  <Bookmark className="mr-1 h-4 w-4" />
                  Merken
                </button>
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
            {article.article_content?.blocks ? (
              // Strukturierter Content
              article.article_content.blocks.map((block, index) => (
                <ArticleBlock key={index} block={block} />
              ))
            ) : (
              // Fallback: Einfacher Text
              <>
                <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                  {article.description}
                </p>
              </>
            )}
          </div>

          {/* Kontaktinformationen */}
          {article.contact_info && (
            <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Kontaktinformationen
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {article.contact_info.person && (
                  <div className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Ansprechpartner
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {article.contact_info.person}
                      </div>
                    </div>
                  </div>
                )}
                
                {article.contact_info.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Telefon
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {article.contact_info.phone}
                      </div>
                    </div>
                  </div>
                )}
                
                {article.contact_info.email && (
                  <div className="flex items-center">
                    <Mail className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        E-Mail
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {article.contact_info.email}
                      </div>
                    </div>
                  </div>
                )}
                
                {article.station && (
                  <div className="flex items-center">
                    <Building className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Dienststelle
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {article.station}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standort */}
          {article.location && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Standort
              </h3>
              <div className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {article.location}
                </span>
              </div>
            </div>
          )}
        </article>
      </div>
    </PageLayout>
  );
} 