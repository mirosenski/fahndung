import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { MediaItem, MediaSearchOptions } from '~/lib/services/media.service';

export type ViewMode = 'grid' | 'list';
export type SelectionMode = 'none' | 'single' | 'multi';

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface MediaFilters {
  search: string;
  mediaType: string;
  directory: string;
  tags: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export interface MediaStoreState {
  // View state
  viewMode: ViewMode;
  selectionMode: SelectionMode;
  selectedItems: Set<string>;
  showUploadModal: boolean;
  showDetailsModal: boolean;
  selectedItemId: string | null;
  
  // Data state
  items: MediaItem[];
  filteredItems: MediaItem[];
  currentFilters: MediaFilters;
  isLoading: boolean;
  hasMore: boolean;
  total: number;
  
  // Upload state
  uploads: Map<string, UploadProgress>;
  isDragging: boolean;
  
  // Cache and optimization
  lastFetch: number;
  optimisticUpdates: Map<string, Partial<MediaItem>>;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  
  // Modal actions
  showUpload: () => void;
  hideUpload: () => void;
  showDetails: (itemId: string) => void;
  hideDetails: () => void;
  
  // Data actions
  setItems: (items: MediaItem[], append?: boolean) => void;
  setFilters: (filters: Partial<MediaFilters>) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotal: (total: number) => void;
  
  // Upload actions
  addUpload: (upload: UploadProgress) => void;
  updateUpload: (id: string, update: Partial<UploadProgress>) => void;
  removeUpload: (id: string) => void;
  clearUploads: () => void;
  setDragging: (dragging: boolean) => void;
  
  // Optimistic updates
  addOptimisticUpdate: (id: string, update: Partial<MediaItem>) => void;
  removeOptimisticUpdate: (id: string) => void;
  clearOptimisticUpdates: () => void;
  
  // Utility actions
  applyFilters: () => void;
  reset: () => void;
  
  // Computed values
  getSelectedItems: () => MediaItem[];
  getSelectedCount: () => number;
  getUploadProgress: () => number;
  getActiveUploads: () => UploadProgress[];
  canSelectMore: () => boolean;
}

const initialFilters: MediaFilters = {
  search: '',
  mediaType: '',
  directory: '',
  tags: [],
  dateRange: {}
};

export const useMediaStore = create<MediaStoreState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      viewMode: 'grid',
      selectionMode: 'none',
      selectedItems: new Set(),
      showUploadModal: false,
      showDetailsModal: false,
      selectedItemId: null,
      
      items: [],
      filteredItems: [],
      currentFilters: initialFilters,
      isLoading: false,
      hasMore: true,
      total: 0,
      
      uploads: new Map(),
      isDragging: false,
      
      lastFetch: 0,
      optimisticUpdates: new Map(),
      
      // View actions
      setViewMode: (mode) => set(state => {
        state.viewMode = mode;
      }),
      
      setSelectionMode: (mode) => set(state => {
        state.selectionMode = mode;
        if (mode === 'none') {
          state.selectedItems.clear();
        }
      }),
      
      toggleItemSelection: (id) => set(state => {
        const { selectedItems, selectionMode } = state;
        
        if (selectionMode === 'none') return;
        
        if (selectionMode === 'single') {
          selectedItems.clear();
          selectedItems.add(id);
        } else {
          if (selectedItems.has(id)) {
            selectedItems.delete(id);
          } else {
            selectedItems.add(id);
          }
        }
      }),
      
      selectAllItems: () => set(state => {
        if (state.selectionMode === 'multi') {
          state.filteredItems.forEach(item => {
            state.selectedItems.add(item.id);
          });
        }
      }),
      
      clearSelection: () => set(state => {
        state.selectedItems.clear();
      }),
      
      // Modal actions
      showUpload: () => set(state => {
        state.showUploadModal = true;
      }),
      
      hideUpload: () => set(state => {
        state.showUploadModal = false;
      }),
      
      showDetails: (itemId) => set(state => {
        state.showDetailsModal = true;
        state.selectedItemId = itemId;
      }),
      
      hideDetails: () => set(state => {
        state.showDetailsModal = false;
        state.selectedItemId = null;
      }),
      
      // Data actions
      setItems: (items, append = false) => set(state => {
        if (append) {
          const existingIds = new Set(state.items.map(item => item.id));
          const newItems = items.filter(item => !existingIds.has(item.id));
          state.items.push(...newItems);
        } else {
          state.items = items;
        }
        state.lastFetch = Date.now();
        get().applyFilters();
      }),
      
      setFilters: (filters) => set(state => {
        state.currentFilters = { ...state.currentFilters, ...filters };
        get().applyFilters();
      }),
      
      setLoading: (loading) => set(state => {
        state.isLoading = loading;
      }),
      
      setHasMore: (hasMore) => set(state => {
        state.hasMore = hasMore;
      }),
      
      setTotal: (total) => set(state => {
        state.total = total;
      }),
      
      // Upload actions
      addUpload: (upload) => set(state => {
        state.uploads.set(upload.id, upload);
      }),
      
      updateUpload: (id, update) => set(state => {
        const existing = state.uploads.get(id);
        if (existing) {
          state.uploads.set(id, { ...existing, ...update });
        }
      }),
      
      removeUpload: (id) => set(state => {
        state.uploads.delete(id);
      }),
      
      clearUploads: () => set(state => {
        state.uploads.clear();
      }),
      
      setDragging: (dragging) => set(state => {
        state.isDragging = dragging;
      }),
      
      // Optimistic updates
      addOptimisticUpdate: (id, update) => set(state => {
        state.optimisticUpdates.set(id, update);
        
        // Apply to current items
        const itemIndex = state.items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          state.items[itemIndex] = { ...state.items[itemIndex], ...update };
        }
        
        get().applyFilters();
      }),
      
      removeOptimisticUpdate: (id) => set(state => {
        state.optimisticUpdates.delete(id);
      }),
      
      clearOptimisticUpdates: () => set(state => {
        state.optimisticUpdates.clear();
      }),
      
      // Utility actions
      applyFilters: () => set(state => {
        const { items, currentFilters, optimisticUpdates } = state;
        
        // Apply optimistic updates first
        const itemsWithUpdates = items.map(item => {
          const update = optimisticUpdates.get(item.id);
          return update ? { ...item, ...update } : item;
        });
        
        let filtered = itemsWithUpdates;
        
        // Apply search filter
        if (currentFilters.search) {
          const searchTerm = currentFilters.search.toLowerCase();
          filtered = filtered.filter(item =>
            item.original_name.toLowerCase().includes(searchTerm) ||
            (item.description?.toLowerCase().includes(searchTerm)) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }
        
        // Apply media type filter
        if (currentFilters.mediaType) {
          filtered = filtered.filter(item => item.media_type === currentFilters.mediaType);
        }
        
        // Apply directory filter
        if (currentFilters.directory) {
          filtered = filtered.filter(item => item.directory === currentFilters.directory);
        }
        
        // Apply tags filter
        if (currentFilters.tags.length > 0) {
          filtered = filtered.filter(item =>
            currentFilters.tags.some(tag => item.tags.includes(tag))
          );
        }
        
        // Apply date range filter
        if (currentFilters.dateRange.from || currentFilters.dateRange.to) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.uploaded_at);
            const fromDate = currentFilters.dateRange.from;
            const toDate = currentFilters.dateRange.to;
            
            if (fromDate && itemDate < fromDate) return false;
            if (toDate && itemDate > toDate) return false;
            
            return true;
          });
        }
        
        state.filteredItems = filtered;
      }),
      
      reset: () => set(state => {
        state.items = [];
        state.filteredItems = [];
        state.selectedItems.clear();
        state.currentFilters = initialFilters;
        state.isLoading = false;
        state.hasMore = true;
        state.total = 0;
        state.uploads.clear();
        state.optimisticUpdates.clear();
        state.showUploadModal = false;
        state.showDetailsModal = false;
        state.selectedItemId = null;
        state.selectionMode = 'none';
      }),
      
      // Computed values
      getSelectedItems: () => {
        const { filteredItems, selectedItems } = get();
        return filteredItems.filter(item => selectedItems.has(item.id));
      },
      
      getSelectedCount: () => {
        return get().selectedItems.size;
      },
      
      getUploadProgress: () => {
        const uploads = Array.from(get().uploads.values());
        if (uploads.length === 0) return 0;
        
        const totalProgress = uploads.reduce((sum, upload) => sum + upload.progress, 0);
        return totalProgress / uploads.length;
      },
      
      getActiveUploads: () => {
        return Array.from(get().uploads.values()).filter(
          upload => upload.status === 'uploading' || upload.status === 'pending'
        );
      },
      
      canSelectMore: () => {
        const { selectionMode, selectedItems, filteredItems } = get();
        return selectionMode === 'multi' && selectedItems.size < filteredItems.length;
      }
    })),
    {
      name: 'media-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
        currentFilters: state.currentFilters
      })
    }
  )
);

// Hooks for common store selections
export const useMediaViewMode = () => useMediaStore(state => state.viewMode);
export const useMediaSelection = () => useMediaStore(state => ({
  selectedItems: state.selectedItems,
  selectionMode: state.selectionMode,
  selectedCount: state.getSelectedCount(),
  canSelectMore: state.canSelectMore()
}));
export const useMediaFilters = () => useMediaStore(state => state.currentFilters);
export const useMediaUploads = () => useMediaStore(state => ({
  uploads: state.uploads,
  progress: state.getUploadProgress(),
  activeUploads: state.getActiveUploads(),
  isDragging: state.isDragging
}));

// Selector hooks for performance
export const useFilteredMediaItems = () => useMediaStore(state => state.filteredItems);
export const useMediaLoading = () => useMediaStore(state => state.isLoading);
export const useMediaModals = () => useMediaStore(state => ({
  showUploadModal: state.showUploadModal,
  showDetailsModal: state.showDetailsModal,
  selectedItemId: state.selectedItemId
}));