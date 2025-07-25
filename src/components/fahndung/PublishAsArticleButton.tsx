"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { 
  FileText, 
  Globe, 
  Loader2, 
  Check,
  X,
  AlertCircle,
  Eye,
  Edit3
} from "lucide-react";
import { toast } from "sonner";

interface PublishAsArticleButtonProps {
  investigationId: string;
  investigationTitle: string;
  isPublished: boolean;
  articleSlug?: string | null;
  onSuccess?: () => void;
}

export default function PublishAsArticleButton({
  investigationId,
  investigationTitle,
  isPublished,
  articleSlug,
  onSuccess
}: PublishAsArticleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: articleSlug || generateSlug(investigationTitle),
    seoTitle: "",
    seoDescription: "",
    keywords: ""
  });
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Generate slug helper
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const replacements: Record<string, string> = {
          'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'
        };
        return replacements[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Toggle publish status
  const handleTogglePublish = async () => {
    setIsLoading(true);
    try {
      if (isPublished) {
        // Unpublish
        const { error } = await supabase
          .from('investigations')
          .update({
            published_as_article: false,
            article_slug: null,
            article_published_at: null
          })
          .eq('id', investigationId);

        if (error) throw error;
        
        toast.success('Artikel wurde zurückgezogen');
        onSuccess?.();
        setIsOpen(false);
      } else {
        // Show publish modal
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Toggle publish error:', error);
      toast.error('Fehler beim Ändern des Veröffentlichungsstatus');
    } finally {
      setIsLoading(false);
    }
  };

  // Publish as article
  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // Check slug availability
      const { data: existing } = await supabase
        .from('investigations')
        .select('id')
        .eq('article_slug', formData.slug)
        .neq('id', investigationId)
        .single();

      if (existing) {
        toast.error('Diese URL ist bereits vergeben');
        return;
      }

      // Prepare article meta
      const articleMeta = {
        seo_title: formData.seoTitle || null,
        seo_description: formData.seoDescription || null,
        keywords: formData.keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0)
      };

      // Update investigation
      const { error } = await supabase
        .from('investigations')
        .update({
          published_as_article: true,
          article_slug: formData.slug,
          article_meta: articleMeta,
          article_published_at: new Date().toISOString()
        })
        .eq('id', investigationId);

      if (error) throw error;

      toast.success('Erfolgreich als Artikel veröffentlicht!');
      onSuccess?.();
      setIsOpen(false);
      
      // Optional: Open in new tab
      window.open(`/artikel/${formData.slug}`, '_blank');
      
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Fehler beim Veröffentlichen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Main Button */}
      <button
        onClick={handleTogglePublish}
        disabled={isLoading}
        className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-white transition-colors ${
          isPublished
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPublished ? (
          <Check className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span>
          {isPublished ? 'Als Artikel veröffentlicht' : 'Als Artikel veröffentlichen'}
        </span>
      </button>

      {/* Quick Actions for Published Articles */}
      {isPublished && articleSlug && (
        <div className="mt-2 flex space-x-2">
          <a
            href={`/artikel/${articleSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
            <span>Artikel anzeigen</span>
          </a>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700"
          >
            <Edit3 className="h-4 w-4" />
            <span>SEO bearbeiten</span>
          </button>
        </div>
      )}

      {/* Publish Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold">
                {isPublished ? 'Artikel-Einstellungen bearbeiten' : 'Als Artikel veröffentlichen'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* URL Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Artikel-URL
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    /artikel/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="artikel-url"
                  />
                </div>
              </div>

              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SEO-Titel (optional)
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="SEO-optimierter Titel für Suchmaschinen"
                />
              </div>

              {/* SEO Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  SEO-Beschreibung (optional)
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Kurze Beschreibung für Suchmaschinen (max. 160 Zeichen)"
                  maxLength={160}
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Keywords (optional)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Keyword1, Keyword2, Keyword3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Keywords durch Kommas getrennt eingeben
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Wichtige Hinweise
                    </h4>
                    <ul className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                      <li>• Der Artikel wird öffentlich unter /artikel/{formData.slug} verfügbar sein</li>
                      <li>• SEO-Einstellungen können nachträglich geändert werden</li>
                      <li>• Der Artikel kann jederzeit zurückgezogen werden</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Abbrechen
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="mr-2 h-4 w-4" />
                )}
                {isPublished ? 'Aktualisieren' : 'Veröffentlichen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 