import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Upload, Grid, Settings } from "lucide-react";
import { api } from "~/trpc/react";
import MediaUpload from "./MediaUpload";
import MediaGrid from "./MediaGrid";
import type { MediaItem } from "~/lib/services/media.service";

interface MediaTabProps {
  className?: string;
  onMediaSelect?: (media: MediaItem) => void;
  showUpload?: boolean;
  showGrid?: boolean;
}

export default function MediaTab({
  className = "",
  onMediaSelect,
  showUpload = true,
  showGrid = true,
}: MediaTabProps) {
  const [activeTab, setActiveTab] = useState("grid");

  // Fetch media items
  const {
    data: mediaData,
    isLoading,
    refetch,
  } = api.media.getMediaList.useQuery(
    {
      page: 1,
      limit: 100,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  );

  const mediaItems = mediaData?.items ?? [];

  const handleUploadComplete = useCallback(() => {
    // Trigger refresh of media grid
    void refetch();
  }, [refetch]);

  const handleMediaSelect = useCallback(
    (media: MediaItem) => {
      onMediaSelect?.(media);
    },
    [onMediaSelect],
  );

  const handleMediaEdit = useCallback((media: MediaItem) => {
    // Handle media editing - could open a modal or navigate to edit page
    console.log("Edit media:", media);
  }, []);

  if (!showUpload && !showGrid) {
    return (
      <div className={`p-4 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Medien-Verwaltung
            </CardTitle>
            <CardDescription>Keine Medien-Funktionen aktiviert</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "grid", label: "Galerie", icon: Grid },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  return (
    <div className={`p-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Medien-Galerie
          </CardTitle>
          <CardDescription>Verwalten Sie Ihre Medien-Dateien</CardDescription>
        </CardHeader>
        <CardContent>
          {showUpload && showGrid ? (
            <>
              {/* Custom Tabs */}
              <div className="mb-6">
                <div className="border-b border-border dark:border-border">
                  <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex cursor-pointer items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600 dark:text-blue-400"
                              : "border-transparent text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "grid" && (
                <div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Lade Medien...</span>
                      </div>
                    </div>
                  ) : mediaItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Grid className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-semibold">
                        Keine Medien gefunden
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        Laden Sie Ihre ersten Medien hoch, um zu beginnen.
                      </p>
                      <Button
                        onClick={() => setActiveTab("upload")}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Medien hochladen
                      </Button>
                    </div>
                  ) : (
                    <MediaGrid
                      items={mediaItems}
                      onItemClick={handleMediaSelect}
                      onItemEdit={handleMediaEdit}
                      className="mt-4"
                    />
                  )}
                </div>
              )}

              {activeTab === "upload" && (
                <div>
                  <MediaUpload
                    onUploadComplete={handleUploadComplete}
                    className="mt-4"
                  />
                </div>
              )}
            </>
          ) : showGrid ? (
            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Lade Medien...</span>
                  </div>
                </div>
              ) : (
                <MediaGrid
                  items={mediaItems}
                  onItemClick={handleMediaSelect}
                  onItemEdit={handleMediaEdit}
                  className="mt-4"
                />
              )}
            </div>
          ) : (
            <div className="mt-4">
              <MediaUpload
                onUploadComplete={handleUploadComplete}
                className="mt-4"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
