import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '~/trpc/react';
import { useMediaStore } from '~/stores/media.store';
import type { MediaItem, MediaSearchOptions } from '~/lib/services/media.service';

// Hook for infinite scroll pagination
export function useInfiniteMedia(searchOptions: MediaSearchOptions = {}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const {
    data,
    refetch,
    isFetching
  } = api.media.getMedia.useQuery(
    {
      ...searchOptions,
      limit: 20,
      offset: offsetRef.current
    },
    {
      enabled: false,
      staleTime: 2 * 60 * 1000
    }
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await refetch();
      
      if (result.data) {
        if (offsetRef.current === 0) {
          setItems(result.data.items);
        } else {
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = result.data.items.filter(item => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
        }
        
        setHasMore(result.data.hasMore);
        offsetRef.current += result.data.items.length;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, refetch]);

  const reset = useCallback(() => {
    offsetRef.current = 0;
    setItems([]);
    setHasMore(true);
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    reset();
    loadMore();
  }, [reset, loadMore]);

  return {
    items,
    hasMore,
    isLoading: isLoading || isFetching,
    error,
    loadMore,
    refresh,
    reset
  };
}

// Hook for optimistic updates
export function useOptimisticMedia() {
  const { addOptimisticUpdate, removeOptimisticUpdate } = useMediaStore();

  const updateMedia = useCallback(async (
    id: string,
    updates: Partial<MediaItem>,
    mutationFn: () => Promise<MediaItem>
  ) => {
    // Apply optimistic update
    addOptimisticUpdate(id, updates);

    try {
      // Execute actual mutation
      const result = await mutationFn();
      
      // Remove optimistic update on success
      removeOptimisticUpdate(id);
      
      return result;
    } catch (error) {
      // Revert optimistic update on error
      removeOptimisticUpdate(id);
      throw error;
    }
  }, [addOptimisticUpdate, removeOptimisticUpdate]);

  return { updateMedia };
}

// Hook for drag and drop functionality
export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItems, setDraggedItems] = useState<MediaItem[]>([]);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent, callback?: (files: File[]) => void) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer?.files || []);
    callback?.(files);
  }, []);

  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => handleDragEnter(e);
    const handleWindowDragLeave = (e: DragEvent) => handleDragLeave(e);
    const handleWindowDragOver = (e: DragEvent) => handleDragOver(e);
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      dragCounter.current = 0;
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver]);

  return {
    isDragging,
    draggedItems,
    setDraggedItems,
    handleDrop
  };
}

// Hook for keyboard shortcuts
export function useMediaKeyboard() {
  const { 
    showUpload, 
    setSelectionMode,
    clearSelection,
    selectAllItems,
    getSelectedItems
  } = useMediaStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input fields
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case 'u':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            showUpload();
          }
          break;
        
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectAllItems();
          }
          break;
        
        case 'Escape':
          clearSelection();
          setSelectionMode('none');
          break;
        
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setSelectionMode(prev => prev === 'multi' ? 'none' : 'multi');
          }
          break;
        
        case 'Delete':
        case 'Backspace':
          const selectedItems = getSelectedItems();
          if (selectedItems.length > 0) {
            e.preventDefault();
            // TODO: Trigger delete action
            console.log('Delete selected items:', selectedItems);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showUpload, setSelectionMode, clearSelection, selectAllItems, getSelectedItems]);
}

// Hook for responsive grid calculations
export function useResponsiveGrid(baseItemSize: number = 200, minItemSize: number = 150) {
  const [gridConfig, setGridConfig] = useState({
    itemSize: baseItemSize,
    columns: 1,
    gap: 16
  });

  const calculateGrid = useCallback((containerWidth: number) => {
    const gap = 16;
    const availableWidth = containerWidth - gap;
    
    // Calculate optimal item size
    let itemSize = baseItemSize;
    let columns = Math.floor(availableWidth / (itemSize + gap));
    
    // Ensure minimum columns
    if (columns < 1) columns = 1;
    
    // Adjust item size to fit container better
    if (columns > 1) {
      const totalGapWidth = (columns - 1) * gap;
      itemSize = (availableWidth - totalGapWidth) / columns;
      
      // Ensure minimum item size
      if (itemSize < minItemSize) {
        columns = Math.floor(availableWidth / (minItemSize + gap));
        if (columns < 1) columns = 1;
        itemSize = (availableWidth - (columns - 1) * gap) / columns;
      }
    }

    setGridConfig({
      itemSize: Math.floor(itemSize),
      columns,
      gap
    });
  }, [baseItemSize, minItemSize]);

  return { gridConfig, calculateGrid };
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    itemsRendered: 0,
    memoryUsage: 0
  });

  const startRender = useCallback(() => {
    return performance.now();
  }, []);

  const endRender = useCallback((startTime: number, itemCount: number) => {
    const renderTime = performance.now() - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime * 100) / 100,
      itemsRendered: itemCount
    }));

    // Log slow renders
    if (renderTime > 100) {
      console.warn(`Slow render detected: ${renderTime}ms for ${itemCount} items`);
    }
  }, []);

  const updateMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100
      }));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [updateMemoryUsage]);

  return {
    metrics,
    startRender,
    endRender
  };
}

// Hook for offline support
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process offline queue
      if (offlineQueue.length > 0) {
        console.log('Processing offline queue:', offlineQueue);
        setOfflineQueue([]);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  const queueAction = useCallback((action: any) => {
    if (!isOnline) {
      setOfflineQueue(prev => [...prev, action]);
      return false; // Action queued
    }
    return true; // Action can be executed
  }, [isOnline]);

  return {
    isOnline,
    offlineQueue,
    queueAction
  };
}

// Hook for accessibility features
export function useAccessibility() {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after screen reader has time to read it
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);

  const handleKeyboardNavigation = useCallback((
    e: KeyboardEvent,
    items: MediaItem[],
    onItemSelect?: (item: MediaItem) => void
  ) => {
    if (!focusedItemId || items.length === 0) return;

    const currentIndex = items.findIndex(item => item.id === focusedItemId);
    if (currentIndex === -1) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          const nextItem = items[currentIndex + 1];
          setFocusedItemId(nextItem.id);
          announce(`Fokus auf ${nextItem.original_name}`);
        }
        break;
      
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevItem = items[currentIndex - 1];
          setFocusedItemId(prevItem.id);
          announce(`Fokus auf ${prevItem.original_name}`);
        }
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        const currentItem = items[currentIndex];
        onItemSelect?.(currentItem);
        announce(`${currentItem.original_name} ausgewählt`);
        break;
    }
  }, [focusedItemId, announce]);

  return {
    announcements,
    focusedItemId,
    setFocusedItemId,
    announce,
    handleKeyboardNavigation
  };
}