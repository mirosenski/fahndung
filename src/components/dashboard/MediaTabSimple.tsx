import React, { useState, useEffect } from "react";
import {
  Upload,
  Grid3X3,
  List,
  RefreshCw,
  Search,
  Filter,
  LogIn,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import MediaUploadRobust from "../media/MediaUploadRobust";

// Supabase Client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? "",
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? "",
);

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

interface SupabaseFile {
  id: string;
  name: string;
  metadata?: {
    mimetype?: string;
    size?: number;
  };
  created_at?: string;
}

interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export default function MediaTabSimple() {
  const [showUpload, setShowUpload] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [session, setSession] = useState<Session | null>(null);

  // Session überwachen
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Medien laden
  const loadMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('📂 Lade Medien aus Bucket...');
      
      const { data, error: listError } = await supabase.storage
        .from('media')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        throw listError;
      }

      // Konvertiere zu MediaItems mit proper type checking
      const items: MediaItem[] = (data ?? []).map((file: SupabaseFile) => ({
        id: file.id ?? '',
        name: file.name ?? '',
        url: supabase.storage.from("media").getPublicUrl(file.name).data
          .publicUrl,
        type: file.metadata?.mimetype ?? "unknown",
        size: file.metadata?.size ?? 0,
        created_at: file.created_at ?? new Date().toISOString(),
      }));

      setMediaItems(items);
      console.log(`✅ ${items.length} Medien geladen`);
    } catch (err) {
      console.error("❌ Fehler beim Laden der Medien:", err);
      setError("Fehler beim Laden der Medien");
    } finally {
      setLoading(false);
    }
  };

  // Initial laden
  useEffect(() => {
    void loadMedia();
  }, []);

  // Upload Complete Handler
  const handleUploadComplete = (result: UploadResult) => {
    console.log("✅ Upload abgeschlossen:", result);
    setShowUpload(false);
    void loadMedia(); // Medien neu laden
  };

  // Login Handler
  const handleLogin = async () => {
    // Redirect zur Login-Seite
    window.location.href = "/login";
  };

  // Gefilterte Medien
  const filteredMedia = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medien-Galerie</h2>
          <p className="text-sm text-gray-600">
            {filteredMedia.length} Medien gefunden
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!session ? (
            <button
              onClick={handleLogin}
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              <LogIn className="h-4 w-4" />
              <span>Anmelden</span>
            </button>
          ) : (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && session && (
        <div className="mb-6">
          <MediaUploadRobust
            onUploadComplete={handleUploadComplete}
            bucketName="media"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Medien durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* View Mode */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded p-2 ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded p-2 ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={loadMedia}
          disabled={loading}
          className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Media Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          Keine Medien gefunden
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                {item.type.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Filter className="h-12 w-12" />
                  </div>
                )}
              </div>
              <p className="mt-2 truncate text-sm text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                {item.type.startsWith("image/") ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Filter className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("de-DE")}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Öffnen
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
