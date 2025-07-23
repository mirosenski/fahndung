import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Info,
  Heart,
  Edit3,
  Trash2
} from 'lucide-react';
import { useMediaStore, useFilteredMediaItems } from '~/stores/media.store';
import type { MediaItem } from '~/lib/services/media.service';

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  initialItemId?: string;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

const initialTransform: Transform = {
  scale: 1,
  x: 0,
  y: 0,
  rotation: 0
};

export default function MediaLightbox({ isOpen, onClose, initialItemId }: MediaLightboxProps) {
  const items = useFilteredMediaItems();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize current index based on initialItemId
  useEffect(() => {
    if (initialItemId && items.length > 0) {
      const index = items.findIndex(item => item.id === initialItemId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [initialItemId, items]);

  // Reset transform when item changes
  useEffect(() => {
    setTransform(initialTransform);
    setImageLoaded(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToItem(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToItem(1);
          break;
        case '=':
        case '+':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetTransform();
          break;
        case 'r':
          e.preventDefault();
          rotate();
          break;
        case 'i':
          e.preventDefault();
          setShowInfo(prev => !prev);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length]);

  // Mouse wheel zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setTransform(prev => ({
        ...prev,
        scale: Math.max(0.1, Math.min(5, prev.scale + delta))
      }));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen]);

  const currentItem = items[currentIndex];

  const navigateToItem = useCallback((direction: number) => {
    setCurrentIndex(prev => {
      const newIndex = prev + direction;
      if (newIndex < 0) return items.length - 1;
      if (newIndex >= items.length) return 0;
      return newIndex;
    });
  }, [items.length]);

  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(5, prev.scale * 1.2)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale / 1.2)
    }));
  }, []);

  const rotate = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setTransform(initialTransform);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Exit fullscreen error:', error);
      }
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mouse drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (transform.scale <= 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    });
  }, [transform.scale, transform.x, transform.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const downloadItem = useCallback(() => {
    if (!currentItem) return;
    
    const link = document.createElement('a');
    link.href = currentItem.url;
    link.download = currentItem.original_name;
    link.click();
  }, [currentItem]);

  const shareItem = useCallback(async () => {
    if (!currentItem) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.original_name,
          text: currentItem.description || '',
          url: currentItem.url
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(currentItem.url);
        // You could show a toast notification here
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    }
  }, [currentItem]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <span className="text-sm">
              {currentIndex + 1} von {items.length}
            </span>
            <span className="text-sm opacity-75">
              {currentItem.original_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Verkleinern (-)"
            >
              <ZoomOut className="h-5 w-5 text-white" />
            </button>
            
            <span className="text-white text-sm px-2">
              {Math.round(transform.scale * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Vergrößern (+)"
            >
              <ZoomIn className="h-5 w-5 text-white" />
            </button>

            {/* Rotate */}
            <button
              onClick={rotate}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Drehen (R)"
            >
              <RotateCw className="h-5 w-5 text-white" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Vollbild (F)"
            >
              <Maximize className="h-5 w-5 text-white" />
            </button>

            {/* Info */}
            <button
              onClick={() => setShowInfo(prev => !prev)}
              className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${
                showInfo ? 'bg-white/20' : ''
              }`}
              title="Info (I)"
            >
              <Info className="h-5 w-5 text-white" />
            </button>

            {/* Download */}
            <button
              onClick={downloadItem}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Herunterladen"
            >
              <Download className="h-5 w-5 text-white" />
            </button>

            {/* Share */}
            <button
              onClick={shareItem}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Teilen"
            >
              <Share2 className="h-5 w-5 text-white" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-2"
              title="Schließen (Esc)"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => navigateToItem(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            title="Vorheriges Bild (←)"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={() => navigateToItem(1)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            title="Nächstes Bild (→)"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Media Content */}
      <div className="flex-1 flex items-center justify-center p-16">
        {currentItem.media_type === 'image' ? (
          <div
            className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
          >
            <img
              ref={imageRef}
              src={currentItem.url}
              alt={currentItem.original_name}
              className={`max-w-none transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `scale(${transform.scale}) translate(${transform.x / transform.scale}px, ${transform.y / transform.scale}px) rotate(${transform.rotation}deg)`,
                transformOrigin: 'center center',
                maxHeight: '90vh',
                maxWidth: '90vw',
                userSelect: 'none',
                pointerEvents: transform.scale <= 1 ? 'none' : 'auto'
              }}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />
            
            {/* Loading indicator */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          // Non-image media
          <div className="text-center text-white">
            <div className="mb-4">
              {currentItem.media_type === 'video' ? (
                <video
                  controls
                  className="max-w-full max-h-[80vh]"
                  style={{
                    transform: `scale(${transform.scale}) rotate(${transform.rotation}deg)`
                  }}
                >
                  <source src={currentItem.url} />
                  Ihr Browser unterstützt das Video-Element nicht.
                </video>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-4xl">📄</span>
                  </div>
                  <p className="text-lg font-medium">{currentItem.original_name}</p>
                  <p className="text-sm opacity-75 mt-2">
                    {currentItem.media_type.toUpperCase()} • {formatFileSize(currentItem.file_size)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-4">Informationen</h3>
            
            <div className="space-y-4">
              {/* File Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Datei</h4>
                <p className="text-sm break-all">{currentItem.original_name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatFileSize(currentItem.file_size)} • {currentItem.mime_type}
                </p>
              </div>

              {/* Dimensions */}
              {currentItem.width && currentItem.height && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Abmessungen</h4>
                  <p className="text-sm">{currentItem.width} × {currentItem.height} px</p>
                </div>
              )}

              {/* Description */}
              {currentItem.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Beschreibung</h4>
                  <p className="text-sm">{currentItem.description}</p>
                </div>
              )}

              {/* Tags */}
              {currentItem.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/20 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Directory */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Verzeichnis</h4>
                <p className="text-sm">{currentItem.directory}</p>
              </div>

              {/* Upload Date */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Hochgeladen</h4>
                <p className="text-sm">{formatDate(currentItem.uploaded_at)}</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/20">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Aktionen</h4>
                <div className="space-y-2">
                  <button
                    onClick={downloadItem}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Herunterladen</span>
                  </button>
                  
                  <button
                    onClick={shareItem}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Teilen</span>
                  </button>

                  <button
                    onClick={() => {/* TODO: Add to favorites */}}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Zu Favoriten</span>
                  </button>

                  <button
                    onClick={() => {/* TODO: Edit metadata */}}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span className="text-sm">Bearbeiten</span>
                  </button>

                  <button
                    onClick={() => {/* TODO: Delete item */}}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Löschen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Zoom Hint */}
      {transform.scale !== 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
          Drücken Sie "0" zum Zurücksetzen der Ansicht
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {!showInfo && (
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-xs opacity-75">
          <div className="text-center">
            <p>Tastenkürzel: ←→ Navigation • +/- Zoom • R Drehen • I Info • F Vollbild • ESC Schließen</p>
          </div>
        </div>
      )}
    </div>
  );
}