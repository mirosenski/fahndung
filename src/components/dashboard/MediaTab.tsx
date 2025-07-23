import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  RefreshCw,
  X,
  LogIn,
  Shield,
  Crown,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useMediaStore } from "~/stores/media.store";
import MediaUpload from "~/components/media/MediaUpload";
import MediaGrid from "~/components/media/MediaGrid";
import type { MediaItem } from "~/lib/services/media.service";
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/hooks/useAuth";

export default function MediaTab() {
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "image" | "video" | "document"
  >("all");
  const [selectedDirectory, setSelectedDirectory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const { session, loading: authLoading, isAuthenticated } = useAuth();

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
      // Verwende die bestehende Admin-Authentifizierung
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Session wird automatisch durch useAuth aktualisiert
      } else {
        // Zeige Hinweis für Admin-Login
        alert("Bitte melden Sie sich als Admin an, um Dateien hochzuladen.");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }, []);

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

      {/* Upload Section - Only show for admins */}
      {showUpload && isAdmin && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dateien hochladen
            </h3>
            <button
              onClick={() => setShowUpload(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <MediaUpload onUploadComplete={() => void refetchMedia()} />
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
