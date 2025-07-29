import React, { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Calendar,
  HardDrive,
} from "lucide-react";

interface LocalImage {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  tags?: string[];
  description?: string;
  isPublic: boolean;
  url: string;
}

export default function LocalImageGallery() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<LocalImage | null>(null);

  const { data: localImages, refetch } =
    api.localMedia.getAllLocalImages.useQuery({
      limit: 50,
      offset: 0,
      search: searchTerm ?? undefined,
    });

  const deleteImage = api.localMedia.deleteLocalImage.useMutation();

  useEffect(() => {
    if (localImages) {
      setImages(
        localImages.images.map((img) => ({
          ...img,
          uploadedAt: new Date(img.uploadedAt),
        })),
      );
      setLoading(false);
    }
  }, [localImages]);

  const handleDelete = async (id: string) => {
    try {
      await deleteImage.mutateAsync({ id });
      await refetch();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-green-500" />
            Lokale Bildergalerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Suchleiste */}
          <div className="relative mb-6">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Bilder durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Statistiken */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-2xl font-bold text-blue-600">
                {images.length}
              </div>
              <div className="text-sm text-blue-600">Bilder gesamt</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(
                  images.reduce((sum, img) => sum + img.fileSize, 0),
                )}
              </div>
              <div className="text-sm text-green-600">Gesamtgröße</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <div className="text-2xl font-bold text-purple-600">
                {images.filter((img) => img.isPublic).length}
              </div>
              <div className="text-sm text-purple-600">Öffentlich</div>
            </div>
          </div>

          {/* Bildergalerie */}
          {images.length === 0 ? (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Keine Bilder gefunden
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Keine Bilder entsprechen Ihrer Suche."
                  : "Noch keine Bilder hochgeladen."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={image.originalName}
                      fill
                      className="cursor-pointer object-cover"
                      onClick={() => setSelectedImage(image)}
                    />
                    {!image.isPublic && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2"
                      >
                        Privat
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3
                        className="truncate text-sm font-medium"
                        title={image.originalName}
                      >
                        {image.originalName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(image.uploadedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(image.fileSize)}
                      </div>
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {image.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {image.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{image.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedImage(image)}
                          className="flex-1"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Anzeigen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(image.url, "_blank")}
                          className="flex-1"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(image.id)}
                          className="px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bild-Detail Modal */}
      {selectedImage && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-xl font-bold">
                  {selectedImage.originalName}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  ×
                </Button>
              </div>
              <Image
                src={selectedImage.url}
                alt={selectedImage.originalName}
                width={800}
                height={600}
                className="mb-4 h-auto w-full rounded-lg"
              />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Dateiname:</span>
                  <span>{selectedImage.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Größe:</span>
                  <span>{formatFileSize(selectedImage.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Typ:</span>
                  <span>{selectedImage.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Hochgeladen:</span>
                  <span>{formatDate(selectedImage.uploadedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={selectedImage.isPublic ? "default" : "secondary"}
                  >
                    {selectedImage.isPublic ? "Öffentlich" : "Privat"}
                  </Badge>
                </div>
                {selectedImage.description && (
                  <div>
                    <span className="font-medium">Beschreibung:</span>
                    <p className="mt-1 text-gray-600">
                      {selectedImage.description}
                    </p>
                  </div>
                )}
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedImage.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
