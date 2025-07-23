import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
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
  sortBy: "date" | "name" | "size" | "type";
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
  setSortBy: (sortBy: "date" | "name" | "size" | "type") => void;
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
  sortBy: "date",
  sortOrder: "desc",
};

export const useMediaStore = create<MediaStore>()(
  immer((set) => ({
    ...initialState,

    setItems: (items) =>
      set((state) => {
        state.items = items;
      }),

    addItem: (item) =>
      set((state) => {
        state.items.unshift(item);
      }),

    removeItem: (id) =>
      set((state) => {
        state.items = state.items.filter((item) => item.id !== id);
        state.selectedItems.delete(id);
      }),

    updateItem: (id, updates) =>
      set((state) => {
        const index = state.items.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...updates,
          } as MediaItem;
        }
      }),

    setSelectedItems: (ids) =>
      set((state) => {
        state.selectedItems = new Set(ids);
      }),

    toggleSelection: (id) =>
      set((state) => {
        if (state.selectedItems.has(id)) {
          state.selectedItems.delete(id);
        } else {
          state.selectedItems.add(id);
        }
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedItems.clear();
      }),

    setFilters: (filters) =>
      set((state) => {
        state.filters = { ...state.filters, ...filters };
        state.currentPage = 1; // Reset to first page when filters change
      }),

    resetFilters: () =>
      set((state) => {
        state.filters = {
          search: "",
          mediaType: "",
          directory: "",
          tags: [],
          dateRange: {},
        };
        state.currentPage = 1;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setUploading: (uploading) =>
      set((state) => {
        state.isUploading = uploading;
        if (!uploading) {
          state.uploadProgress = null;
        }
      }),

    setUploadProgress: (progress) =>
      set((state) => {
        state.uploadProgress = progress;
      }),

    setPagination: (page, hasMore, total) =>
      set((state) => {
        state.currentPage = page;
        state.hasMore = hasMore;
        state.total = total;
      }),

    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    setSortBy: (sortBy) =>
      set((state) => {
        state.sortBy = sortBy;
      }),

    setSortOrder: (order) =>
      set((state) => {
        state.sortOrder = order;
      }),

    reset: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  })),
);

// Selectors for better performance
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
