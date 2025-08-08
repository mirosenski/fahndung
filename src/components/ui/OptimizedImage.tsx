"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  getOptimizedImageUrl,
  getProgressiveImageUrls,
  trackImageLoadPerformance,
  type ImageOptimizationOptions,
} from "~/lib/imageOptimization";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fallbackSrc?: string;
  optimizationOptions?: ImageOptimizationOptions;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className = "",
  fallbackSrc = "/images/placeholders/fotos/platzhalterbild.svg",
  optimizationOptions = {},
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const loadStartTime = useRef<number>(0);
  const [isInView, setIsInView] = useState(priority);

  // Responsive Bild-Größen
  const [imageSize, setImageSize] = useState({ width, height });

  useEffect(() => {
    const updateImageSize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;

      if (isMobile) {
        setImageSize({
          width: Math.min(width, 400),
          height: Math.min(height, 300),
        });
      } else if (isTablet) {
        setImageSize({
          width: Math.min(width, 600),
          height: Math.min(height, 450),
        });
      } else {
        setImageSize({ width, height });
      }
    };

    updateImageSize();
    window.addEventListener("resize", updateImageSize);
    return () => window.removeEventListener("resize", updateImageSize);
  }, [width, height]);

  // Intersection Observer für Lazy Loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    const imageElement = document.querySelector(`[data-src="${src}"]`);
    if (imageElement) {
      observer.observe(imageElement);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  // Optimierte Bild-URL generieren
  const optimizedSrc = isInView
    ? getOptimizedImageUrl(src, {
        width: imageSize.width,
        height: imageSize.height,
        ...optimizationOptions,
      })
    : "";

  // Progressive Loading
  const progressiveUrls = getProgressiveImageUrls(src);
  const [currentQuality, setCurrentQuality] = useState<
    "thumbnail" | "medium" | "full"
  >("thumbnail");

  const handleLoad = () => {
    const loadEndTime = performance.now();
    const totalLoadTime = loadEndTime - loadStartTime.current;

    setLoadTime(totalLoadTime);
    setIsLoading(false);
    setHasError(false);

    // Progressive Loading: Lade nächstes Qualitätslevel
    if (currentQuality === "thumbnail") {
      setCurrentQuality("medium");
    } else if (currentQuality === "medium") {
      setCurrentQuality("full");
    }

    trackImageLoadPerformance(src, totalLoadTime);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    // Fallback zu Standard-Bild
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }

    onError?.();
  };

  const handleImageStart = () => {
    loadStartTime.current = performance.now();
  };

  // Bestimme aktuelle Bild-URL basierend auf Qualitätslevel
  const getCurrentImageUrl = () => {
    if (hasError) return fallbackSrc;

    switch (currentQuality) {
      case "thumbnail":
        return progressiveUrls.thumbnail;
      case "medium":
        return progressiveUrls.medium;
      case "full":
        return optimizedSrc;
      default:
        return optimizedSrc;
    }
  };

  if (!isInView && !priority) {
    return (
      <div
        className={`animate-pulse bg-muted dark:bg-muted ${className}`}
        style={{ width: imageSize.width, height: imageSize.height }}
        data-src={src}
      />
    );
  }

  return (
    <div className="relative">
      <Image
        src={getCurrentImageUrl()}
        alt={alt}
        width={imageSize.width}
        height={imageSize.height}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoadStart={handleImageStart}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted dark:bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted dark:bg-muted">
          <div className="text-center text-muted-foreground dark:text-muted-foreground">
            <svg
              className="mx-auto mb-2 h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Bild konnte nicht geladen werden</p>
          </div>
        </div>
      )}

      {/* Performance Debug Info (nur in Development) */}
      {process.env.NODE_ENV === "development" && loadTime > 0 && (
        <div className="absolute right-1 top-1 rounded bg-black bg-opacity-50 px-1 py-0.5 text-xs text-white">
          {loadTime.toFixed(0)}ms
        </div>
      )}
    </div>
  );
};

// Spezialisierte Komponenten für verschiedene Anwendungsfälle
export const AvatarImage = ({
  src,
  alt,
  size = "md",
  ...props
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
} & Omit<OptimizedImageProps, "src" | "alt">) => {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 },
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizes[size].width}
      height={sizes[size].height}
      optimizationOptions={{
        format: "webp",
        quality: 80,
        fit: "cover",
      }}
      className="rounded-full"
      {...props}
    />
  );
};

export const ThumbnailImage = ({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
} & Omit<OptimizedImageProps, "src" | "alt">) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={200}
      height={150}
      optimizationOptions={{
        format: "webp",
        quality: 70,
        fit: "cover",
      }}
      {...props}
    />
  );
};

export const HeroImage = ({
  src,
  alt,
  isMobile = false,
  ...props
}: {
  src: string;
  alt: string;
  isMobile?: boolean;
} & Omit<OptimizedImageProps, "src" | "alt">) => {
  const size = isMobile
    ? { width: 600, height: 400 }
    : { width: 1200, height: 600 };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      priority={true}
      optimizationOptions={{
        format: "webp",
        quality: 85,
        fit: "cover",
      }}
      {...props}
    />
  );
};
