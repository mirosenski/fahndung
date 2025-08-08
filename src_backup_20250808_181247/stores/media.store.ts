import { create } from "zustand";
// Immer entfernt - verwende Standard Zustand
import type {
  MediaItem,
  MediaFilters,
  UploadProgress,
} from "../lib/services/media.service";

interface MediaState {
  // State
  items: MediaItem[];
  selectedItems: Set<string>;
  filters: MediaFilters;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  currentPage: number;
  hasMore: boolean;
  total: number;
  viewMode: "grid" | "list";
  sortBy:
    | "uploaded_at"
    | "created_at"
    | "original_name"
    | "file_size"
    | "media_type";
  sortOrder: "asc" | "desc";
}

interface MediaActions {
  setItems: (items: MediaItem[]) => void;
  addItem: (item: MediaItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  setSelectedItems: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<MediaFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setPagination: (page: number, hasMore: boolean, total: number) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (
    sortBy:
      | "uploaded_at"
      | "created_at"
      | "original_name"
      | "file_size"
      | "media_type",
  ) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  reset: () => void;
}

type MediaStore = MediaState & MediaActions;

const initialState: MediaState = {
  items: [],
  selectedItems: new Set<string>(),
  filters: {
    search: "",
    mediaType: "",
    directory: "",
    tags: [],
    dateRange: {},
  },
  isLoading: false,
  isUploading: false,
  uploadProgress: null,
  currentPage: 1,
  hasMore: false,
  total: 0,
  viewMode: "grid",
  sortBy: "uploaded_at",
  sortOrder: "desc",
};

export const useMediaStore = create<MediaStore>()((set) => ({
  ...initialState,

  setItems: (items) =>
    set((state) => ({
      ...state,
      items,
    })),

  addItem: (item) =>
    set((state) => ({
      ...state,
      items: [item, ...state.items],
    })),

  removeItem: (id) =>
    set((state) => ({
      ...state,
      items: state.items.filter((item) => item.id !== id),
      selectedItems: new Set(
        [...state.selectedItems].filter((itemId) => itemId !== id),
      ),
    })),

  updateItem: (id, updates) =>
    set((state) => {
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        const updatedItems = [...state.items];
        updatedItems[index] = {
          ...updatedItems[index],
          ...updates,
        } as MediaItem;
        return {
          ...state,
          items: updatedItems,
        };
      }
      return state;
    }),

  setSelectedItems: (ids) =>
    set((state) => ({
      ...state,
      selectedItems: new Set(ids),
    })),

  toggleSelection: (id) =>
    set((state) => {
      const newSelectedItems = new Set(state.selectedItems);
      if (newSelectedItems.has(id)) {
        newSelectedItems.delete(id);
      } else {
        newSelectedItems.add(id);
      }
      return {
        ...state,
        selectedItems: newSelectedItems,
      };
    }),

  clearSelection: () =>
    set((state) => ({
      ...state,
      selectedItems: new Set<string>(),
    })),

  setFilters: (filters) =>
    set((state) => ({
      ...state,
      filters: { ...state.filters, ...filters },
      currentPage: 1, // Reset to first page when filters change
    })),

  resetFilters: () =>
    set((state) => ({
      ...state,
      filters: {
        search: "",
        mediaType: "",
        directory: "",
        tags: [],
        dateRange: {},
      },
      currentPage: 1,
    })),

  setLoading: (loading) =>
    set((state) => ({
      ...state,
      isLoading: loading,
    })),

  setUploading: (uploading) =>
    set((state) => ({
      ...state,
      isUploading: uploading,
      uploadProgress: uploading ? state.uploadProgress : null,
    })),

  setUploadProgress: (progress) =>
    set((state) => ({
      ...state,
      uploadProgress: progress,
    })),

  setPagination: (page, hasMore, total) =>
    set((state) => ({
      ...state,
      currentPage: page,
      hasMore,
      total,
    })),

  setViewMode: (mode) =>
    set((state) => ({
      ...state,
      viewMode: mode,
    })),

  setSortBy: (sortBy) =>
    set((state) => ({
      ...state,
      sortBy,
    })),

  setSortOrder: (order) =>
    set((state) => ({
      ...state,
      sortOrder: order,
    })),

  reset: () =>
    set(() => ({
      ...initialState,
    })),
}));

// Convenience hooks
export const useItems = () => useMediaStore((state) => state.items);
export const useSelectedItems = () =>
  useMediaStore((state) => state.selectedItems);
export const useSelectedItemsCount = () =>
  useMediaStore((state) => state.selectedItems.size);
export const useIsItemSelected = (id: string) =>
  useMediaStore((state) => state.selectedItems.has(id));
export const useFilters = () => useMediaStore((state) => state.filters);
export const useViewMode = () => useMediaStore((state) => state.viewMode);
export const useSorting = () =>
  useMediaStore((state) => ({
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  }));
export const usePagination = () =>
  useMediaStore((state) => ({
    currentPage: state.currentPage,
    hasMore: state.hasMore,
    total: state.total,
  }));
export const useUploadState = () =>
  useMediaStore((state) => ({
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
  }));
export const useLoadingState = () =>
  useMediaStore((state) => ({
    isLoading: state.isLoading,
  }));
