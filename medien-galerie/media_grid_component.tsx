import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { 
  Check, 
  Eye, 
  Download, 
  Share2, 
  MoreVertical, 
  FileImage, 
  FileVideo,
  File,
  Heart,
  Edit3
} from 'lucide-react';
import { useMediaStore, useFilteredMediaItems, useMediaSelection } from '~/stores/media.store';
import type { MediaItem } from '~/lib/services/media.service';

interface MediaGridProps {
  onItemClick?: (item: MediaItem) => void;
  onItemSelect?: (item: MediaItem) => void;
  itemSize?: number;
  gap?: number;
  className?: string;
}

interface GridItemData {
  items: MediaItem[];
  columnCount: number;
  itemSize: number;
  gap: number;
  selectedItems: Set<string>;
  selectionMode: string;
  onItemClick?: (item: MediaItem) => void;
  onItemSelect?: (item: MediaItem) => void;
  onToggleSelection: (id: string) => void;
  showDetails: (id: string) => void;
}

// Memoized grid item component for performance
const GridItem = React.memo(({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: GridItemData;
}) => {
  const { 
    items, 
    columnCount, 
    itemSize, 
    gap, 
    selectedItems, 
    selectionMode,
    onItemClick,
    onItemSelect,
    onToggleSelection,
    showDetails
  } = data;

  const itemIndex = rowIndex * columnCount + columnIndex;
  const item = items[itemIndex];

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!item) {
    return <div style={style} />;
  }

  const isSelected = selectedItems.has(item.id);
  const canSelect = selectionMode !== 'none';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (canSelect && (e.metaKey || e.ctrlKey || selectionMode === 'multi')) {
      onToggleSelection(item.id);
      onItemSelect?.(item);
    } else if (canSelect && selectionMode === 'single') {
      onToggleSelection(item.id);
      onItemSelect?.(item);
    } else {
      onItemClick?.(item);
    }
  };

  const handleDoubleClick = () => {
    showDetails(item.id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getMediaIcon = () => {
    switch (item.media_type) {
      case 'image': return FileImage;
      case 'video': return FileVideo;
      default: return File;
    }
  };

  const MediaIcon = getMediaIcon();

  return (
    <div
      style={{
        ...style,
        left: (style.left as number) + gap / 2,
        top: (style.top as number) + gap / 2,
        width: (style.width as number) - gap,
        height: (style.height as number) - gap,
      }}
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' 
          : 'hover:shadow-lg hover:scale-[1.01]'
        }
        ${canSelect ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Content */}
      <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        {/* Media Preview */}
        <div className="relative w-full h-full">
          {item.media_type === 'image' ? (
            <>
              {!imageError ? (
                <img
                  src={item.thumbnail_url || item.url}
                  alt={item.original_name}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <MediaIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              {/* Loading skeleton */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </>
          ) : (
            // Non-image media
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <MediaIcon className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center px-2 truncate max-w-full">
                {item.original_name}
              </span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className={`
            absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-center justify-center
            ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'}
          `}>
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.url, '_blank');
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Anzeigen"
              >
                <Eye className="h-4 w-4 text-white" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = item.url;
                  link.download = item.original_name;
                  link.click();
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Herunterladen"
              >
                <Download className="h-4 w-4 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: item.original_name,
                      url: item.url
                    });
                  }
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                title="Teilen"
              >
                <Share2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Selection indicator */}
          {canSelect && (
            <div className={`
              absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-all duration-200
              ${isSelected 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-white/20 backdrop-blur-sm border-white/40 hover:border-white/60'
              }
            `}>
              {isSelected && (
                <Check className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
              )}
            </div>
          )}

          {/* Media type indicator */}
          {item.media_type !== 'image' && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
              {item.media_type.toUpperCase()}
            </div>
          )}

          {/* File size */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
            {formatFileSize(item.file_size)}
          </div>
        </div>

        {/* Info bar at bottom */}
        <div className={`
          absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6
          transition-transform duration-200
          ${isHovered ? 'translate-y-0' : 'translate-y-full'}
        `}>
          <p className="text-white text-sm font-medium truncate" title={item.original_name}>
            {item.original_name}
          </p>
          
          {item.description && (
            <p className="text-white/80 text-xs truncate mt-1" title={item.description}>
              {item.description}
            </p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs text-white"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs text-white">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

GridItem.displayName = 'GridItem';

export default function MediaGrid({
  onItemClick,
  onItemSelect,
  itemSize = 200,
  gap = 16,
  className = ''
}: MediaGridProps) {
  const items = useFilteredMediaItems();
  const { selectedItems, selectionMode } = useMediaSelection();
  const { toggleItemSelection, showDetails } = useMediaStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate grid dimensions
  const { columnCount, rowCount } = useMemo(() => {
    const availableWidth = containerSize.width - gap;
    const cols = Math.max(1, Math.floor(availableWidth / (itemSize + gap)));
    const rows = Math.ceil(items.length / cols);
    
    return {
      columnCount: cols,
      rowCount: rows
    };
  }, [containerSize.width, itemSize, gap, items.length]);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Grid item data for react-window
  const itemData: GridItemData = useMemo(() => ({
    items,
    columnCount,
    itemSize,
    gap,
    selectedItems,
    selectionMode,
    onItemClick,
    onItemSelect,
    onToggleSelection: toggleItemSelection,
    showDetails
  }), [
    items, 
    columnCount, 
    itemSize, 
    gap, 
    selectedItems, 
    selectionMode, 
    onItemClick, 
    onItemSelect, 
    toggleItemSelection, 
    showDetails
  ]);

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 text-gray-500 ${className}`}>
        <FileImage className="h-16 w-16 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Medien gefunden</h3>
        <p className="text-gray-500 text-center max-w-md">
          Es wurden keine Medien gefunden, die Ihren aktuellen Filterkriterien entsprechen.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      {containerSize.width > 0 && (
        <Grid
          columnCount={columnCount}
          columnWidth={itemSize + gap}
          height={containerSize.height}
          rowCount={rowCount}
          rowHeight={itemSize + gap}
          width={containerSize.width}
          itemData={itemData}
          overscanRowCount={2}
          overscanColumnCount={2}
        >
          {GridItem}
        </Grid>
      )}
    </div>
  );
}