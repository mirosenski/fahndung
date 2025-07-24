import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Grid3X3,
  List,
  RefreshCw,
  Search,
  Filter,
  LogIn,
  Crown,
  X,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { useSupabaseUpload } from "~/hooks/useSupabaseUpload";
import { useMediaStore } from "~/stores/media.store";
import MediaUpload from "~/components/media/MediaUpload";
import MediaGrid from "~/components/media/MediaGrid";
import type { MediaItem } from "~/lib/services/media.service";
import { supabase } from "~/lib/supabase";
import { DebugAuth } from "~/components/DebugAuth";

interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export default function MediaTabEnhanced() {
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "image" | "video" | "document"
  >("all");
  const [selectedDirectory, setSelectedDirectory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const { session, loading: authLoading, isAuthenticated } = useAuth();
  const { uploadFile, isUploading, progress } = useSupabaseUpload();

  const {
    items,
    isLoading: mediaLoading,
    setItems,
    setLoading,
    setFilters,
    resetFilters,
    viewMode,
    setViewMode,
    currentPage,
    hasMore,
    total,
    setPagination,
  } = useMediaStore();

  // Check if user is admin
  const isAdmin = session?.profile?.role === "admin";

  // Media queries
  const {
    data: mediaData,
    error: mediaError,
    refetch: refetchMedia,
  } = api.media.getMediaList.useQuery(
    {
      search: searchTerm,
      media_type: selectedType === "all" ? undefined : selectedType,
      directory: selectedDirectory === "all" ? undefined : selectedDirectory,
      page: currentPage,
      limit: 50,
    },
    {
      enabled: !authLoading,
    },
  );

  const { data: directories = [] } = api.media.getDirectories.useQuery(
    undefined,
    {
      enabled: !authLoading,
    },
  );

  // Update media store when data changes
  useEffect(() => {
    if (mediaData) {
      setItems(mediaData.items);
      setPagination(currentPage, mediaData.hasMore, mediaData.total);
      setLoading(false);
    }
  }, [mediaData, currentPage, setItems, setPagination, setLoading]);

  // Update filters when search/type/directory changes
  useEffect(() => {
    setFilters({
      search: searchTerm,
      mediaType: selectedType,
      directory: selectedDirectory,
    });
  }, [searchTerm, selectedType, selectedDirectory, setFilters]);

  // Set loading state
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleTypeChange = useCallback(
    (type: "all" | "image" | "video" | "document") => {
      setSelectedType(type);
    },
    [],
  );

  const handleDirectoryChange = useCallback((directory: string) => {
    setSelectedDirectory(directory);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    void refetchMedia();
  }, [refetchMedia, setLoading]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedDirectory("all");
    resetFilters();
  }, [resetFilters]);

  const handleItemClick = useCallback((item: MediaItem) => {
    console.log("Item clicked:", item);
  }, []);

  const handleItemEdit = useCallback((item: MediaItem) => {
    console.log("Edit item:", item);
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Session wird automatisch durch useAuth aktualisiert
      } else {
        alert("Bitte melden Sie sich als Admin an, um Dateien hochzuladen.");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }, []);

  // Neue Supabase Upload Handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      setUploadResult(null);
      
      console.log('🚀 MediaTabEnhanced: Starte Upload für:', file.name);
      
      const result = await uploadFile(file, 'media');
      
      if (result.error) {
        console.error('❌ MediaTabEnhanced: Upload-Fehler:', result.error);
        setUploadError(result.error);
      } else {
        console.log('✅ MediaTabEnhanced: Upload erfolgreich:', result);
        setUploadResult(result as UploadResult);
        void refetchMedia(); // Refresh media list
      }
    } catch (err) {
      console.error('❌ MediaTabEnhanced: Unerwarteter Fehler:', err);
      setUploadError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
  }, [uploadFile, refetchMedia]);

  // Fallback directories if query fails
  const availableDirectories = directories ?? [
    "allgemein",
    "fahndungen",
    "dokumente",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Medien-Galerie
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {total} Medien • {items.length} angezeigt
            {mediaError && " • Fehler beim Laden"}
            {!isAuthenticated && " • Anmeldung erforderlich für Upload"}
            {isAuthenticated &&
              !isAdmin &&
              " • Admin-Rechte erforderlich für Upload"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Debug Toggle */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
          >
            {showDebug ? "Debug ausblenden" : "Debug anzeigen"}
          </button>

          {!isAuthenticated ? (
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <LogIn className="h-4 w-4" />
              <span>Anmelden</span>
            </button>
          ) : !isAdmin ? (
            <div className="flex items-center space-x-2 rounded-lg bg-yellow-100 px-4 py-2 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <Shield className="h-4 w-4" />
              <span>Admin-Rechte erforderlich</span>
            </div>
          ) : (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Debug Section */}
      {showDebug && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold">🔍 Debug Information</h3>
          <DebugAuth />
        </div>
      )}

      {/* Upload Section - Only show for admins */}
      {showUpload && isAdmin && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🚀 Supabase Upload (Neue Funktion)
            </h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Supabase Upload Progress */}
          {isUploading && (
            <div className="mb-4 space-y-2">
              <div className="text-sm text-blue-600">⏳ Upload läuft...</div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">{progress}%</div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>❌ Fehler: {uploadError}</span>
              </div>
            </div>
          )}

          {/* Upload Success */}
          {uploadResult && (
            <div className="mb-4 rounded border border-green-400 bg-green-100 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">
                  ✅ Upload erfolgreich!
                </h4>
              </div>
              <div className="space-y-1 text-sm text-green-700">
                <div>
                  <strong>Pfad:</strong> {uploadResult.path}
                </div>
                <div>
                  <strong>URL:</strong>
                  <a
                    href={uploadResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    {uploadResult.url}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Input */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Wähle eine Datei zum Hochladen:
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept="image/*,video/*,.pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>

            {/* Upload Instructions */}
            <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
              <h4 className="mb-2 font-medium">📋 Upload-Anweisungen:</h4>
              <ul className="list-inside list-disc space-y-1">
                <li>Unterstützte Formate: Bilder, Videos, PDF, Dokumente</li>
                <li>Maximale Dateigröße: 10MB</li>
                <li>Dateien werden automatisch komprimiert</li>
                <li>Öffentliche URLs werden generiert</li>
              </ul>
            </div>
          </div>

          {/* Legacy MediaUpload Component (fallback) */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700">
              Legacy Upload (tRPC):
            </h4>
            <MediaUpload onUploadComplete={() => void refetchMedia()} />
          </div>
        </div>
      )}

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
          <div className="flex items-center space-x-2">
            <LogIn className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Sie müssen angemeldet sein, um Dateien hochzuladen. Klicken Sie
              auf &quot;Anmelden&quot; um fortzufahren.
            </p>
          </div>
        </div>
      )}

      {/* Admin Rights Notice */}
      {isAuthenticated && !isAdmin && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Sie sind angemeldet, benötigen aber Admin-Rechte um Dateien
              hochzuladen. Kontaktieren Sie einen Administrator für die
              entsprechenden Berechtigungen.
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Medien durchsuchen..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) =>
              handleTypeChange(
                e.target.value as "all" | "image" | "video" | "document",
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Alle Typen</option>
            <option value="image">Bilder</option>
            <option value="video">Videos</option>
            <option value="document">Dokumente</option>
          </select>
        </div>

        {/* Directory Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedDirectory}
            onChange={(e) => handleDirectoryChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Alle Verzeichnisse</option>
            {availableDirectories.map((dir) => (
              <option key={dir} value={dir}>
                {dir}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded p-2 ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded p-2 ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={mediaLoading}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-300"
        >
          <RefreshCw
            className={`h-4 w-4 ${mediaLoading ? "animate-spin" : ""}`}
          />
        </button>

        {/* Reset Filters */}
        <button
          onClick={handleResetFilters}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Media Grid/List */}
      <MediaGrid
        items={items}
        onItemClick={handleItemClick}
        onItemEdit={handleItemEdit}
      />

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPagination(currentPage + 1, hasMore, total)}
            disabled={mediaLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {mediaLoading ? "Lade..." : "Weitere laden"}
          </button>
        </div>
      )}
    </div>
  );
}
