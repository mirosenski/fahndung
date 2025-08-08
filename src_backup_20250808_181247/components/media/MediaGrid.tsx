import React, { useState, useCallback } from "react";
import NextImage from "next/image";
import {
  Check,
  X,
  Trash2,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  useMediaStore,
  useIsItemSelected,
  useSelectedItemsCount,
} from "~/stores/media.store";
import type { MediaItem } from "~/lib/services/media.service";

interface MediaGridProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  onItemEdit?: (item: MediaItem) => void;
  className?: string;
}

export default function MediaGrid({
  items,
  onItemClick,
  onItemEdit,
  className = "",
}: MediaGridProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { toggleSelection, clearSelection, removeItem } = useMediaStore();

  const selectedCount = useSelectedItemsCount();

  const deleteMutation = api.post.media.deleteMedia.useMutation({
    onSuccess: (_, variables) => {
      removeItem(variables.mediaId);
    },
  });

  const bulkDeleteMutation = api.post.media.bulkDeleteMedia.useMutation({
    onSuccess: (_, variables) => {
      variables.mediaIds.forEach((id) => removeItem(id));
    },
  });

  const handleItemClick = useCallback(
    (item: MediaItem) => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  const handleItemEdit = useCallback(
    (item: MediaItem) => {
      onItemEdit?.(item);
    },
    [onItemEdit],
  );

  const handleSelectionToggle = useCallback(
    (e: React.MouseEvent, itemId: string) => {
      e.stopPropagation();
      toggleSelection(itemId);
    },
    [toggleSelection],
  );

  const handleDelete = useCallback(
    async (itemId: string) => {
      try {
        await deleteMutation.mutateAsync({ mediaId: itemId });
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    [deleteMutation],
  );

  const handleBulkDelete = useCallback(async () => {
    const selectedItems = Array.from(useMediaStore.getState().selectedItems);
    if (selectedItems.length === 0) return;

    try {
      await bulkDeleteMutation.mutateAsync({ mediaIds: selectedItems });
      clearSelection();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  }, [bulkDeleteMutation, clearSelection]);

  const getItemIcon = useCallback(
    (item: MediaItem): React.ComponentType<{ className?: string }> => {
      switch (item.media_type) {
        case "image":
          return ImageIcon;
        case "video":
          return Video;
        default:
          return FileText;
      }
    },
    [],
  );

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const renderItem = useCallback(
    (item: MediaItem, index: number) => {
      const isHovered = hoveredItem === item.id;

      return (
        <MediaItemComponent
          key={item.id}
          item={item}
          isHovered={isHovered}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClick(item)}
          onSelectionToggle={handleSelectionToggle}
          onEdit={handleItemEdit}
          onDelete={handleDelete}
          getItemIcon={getItemIcon}
          formatFileSize={formatFileSize}
          formatDate={formatDate}
          index={index}
        />
      );
    },
    [
      hoveredItem,
      handleItemClick,
      handleItemEdit,
      handleSelectionToggle,
      handleDelete,
      getItemIcon,
      formatFileSize,
      formatDate,
    ],
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} Element{selectedCount !== 1 ? "e" : ""} ausgewählt
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => void handleBulkDelete()}
              className="flex items-center space-x-1 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Löschen</span>
            </button>
            <button
              onClick={clearSelection}
              className="flex items-center space-x-1 rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
              <span>Abbrechen</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, index) => renderItem(item, index))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Keine Medien gefunden
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Laden Sie Dateien hoch oder ändern Sie Ihre Filter-Einstellungen.
          </p>
        </div>
      )}
    </div>
  );
}

// Separate component to avoid hook rules violation
interface MediaItemComponentProps {
  item: MediaItem;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onSelectionToggle: (e: React.MouseEvent, itemId: string) => void;
  onEdit: (item: MediaItem) => void;
  onDelete: (itemId: string) => void;
  getItemIcon: (item: MediaItem) => React.ComponentType<{ className?: string }>;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
}

function MediaItemComponent({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onSelectionToggle,
  onEdit,
  onDelete,
  getItemIcon,
  formatFileSize,
  formatDate,
  index,
}: MediaItemComponentProps & { index: number }) {
  const isSelected = useIsItemSelected(item.id);
  const Icon = getItemIcon(item);

  return (
    <div
      className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      <div className="absolute left-2 top-2 z-10">
        <button
          onClick={(e) => onSelectionToggle(e, item.id)}
          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            isSelected
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-gray-300 bg-white hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
          }`}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      </div>

      {/* Media Content */}
      <div className="relative h-full w-full">
        {item.media_type === "image" && item.thumbnail_url ? (
          <NextImage
            src={item.thumbnail_url}
            alt={item.original_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Icon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Overlay Actions */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity ${
            isHovered ? "opacity-100" : ""
          }`}
        >
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-100"
              title="Vorschau"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-100"
              title="Bearbeiten"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50"
              title="Löschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Item Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
        <div className="space-y-1">
          <p className="truncate text-sm font-medium">{item.original_name}</p>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>{formatFileSize(item.file_size)}</span>
            <span>{formatDate(item.uploaded_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
