/**
 * Image-Optimierung für Supabase Storage
 * Optimiert Bilder für verschiedene Geräte und Netzwerkbedingungen
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  gravity?: "auto" | "top" | "bottom" | "left" | "right" | "center";
  blur?: number;
  sharpen?: number;
}

/**
 * Generiert eine optimierte Bild-URL für Supabase Storage
 */
export const getOptimizedImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {},
): string => {
  if (!url?.includes("supabase.co")) {
    return url; // Fallback für nicht-Supabase URLs
  }

  const {
    width = 800,
    height,
    quality = 75,
    format = "webp",
    fit = "cover",
    gravity = "auto",
    blur,
    sharpen,
  } = options;

  // Supabase Storage Transformation Parameters
  const params = new URLSearchParams({
    width: width.toString(),
    quality: quality.toString(),
    format,
    fit,
    gravity,
  });

  if (height) {
    params.append("height", height.toString());
  }

  if (blur) {
    params.append("blur", blur.toString());
  }

  if (sharpen) {
    params.append("sharpen", sharpen.toString());
  }

  return `${url}?${params.toString()}`;
};

/**
 * Responsive Bild-Größen für verschiedene Geräte
 */
export const getResponsiveImageSizes = (
  isMobile: boolean,
  isTablet: boolean,
) => {
  if (isMobile) {
    return { width: 400, height: 300 };
  } else if (isTablet) {
    return { width: 600, height: 450 };
  } else {
    return { width: 800, height: 600 };
  }
};

/**
 * Optimierte Bild-URL für verschiedene Netzwerkbedingungen
 */
export const getNetworkOptimizedImageUrl = (
  url: string,
  connectionType?: "slow-2g" | "2g" | "3g" | "4g" | "fast-4g",
): string => {
  const options: ImageOptimizationOptions = {
    format: "webp",
    quality: 75,
  };

  switch (connectionType) {
    case "slow-2g":
    case "2g":
      return getOptimizedImageUrl(url, { ...options, width: 300, quality: 50 });
    case "3g":
      return getOptimizedImageUrl(url, { ...options, width: 500, quality: 60 });
    case "4g":
    case "fast-4g":
    default:
      return getOptimizedImageUrl(url, { ...options, width: 800, quality: 75 });
  }
};

/**
 * Lazy Loading mit Placeholder
 */
export const getLazyLoadingImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {},
): { src: string; placeholder: string } => {
  const optimizedUrl = getOptimizedImageUrl(url, options);

  // Generiere ein kleines, verschwommenes Placeholder-Bild
  const placeholderUrl = getOptimizedImageUrl(url, {
    ...options,
    width: 20,
    height: 20,
    blur: 10,
    quality: 10,
  });

  return {
    src: optimizedUrl,
    placeholder: placeholderUrl,
  };
};

/**
 * Progressive Loading mit mehreren Qualitätsstufen
 */
export const getProgressiveImageUrls = (
  url: string,
): {
  thumbnail: string;
  medium: string;
  full: string;
} => {
  return {
    thumbnail: getOptimizedImageUrl(url, {
      width: 150,
      height: 150,
      quality: 30,
    }),
    medium: getOptimizedImageUrl(url, { width: 400, height: 300, quality: 60 }),
    full: getOptimizedImageUrl(url, { width: 800, height: 600, quality: 85 }),
  };
};

/**
 * Avatar-Optimierung für Benutzerprofile
 */
export const getAvatarImageUrl = (
  url: string,
  size: "sm" | "md" | "lg" = "md",
): string => {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 },
  };

  return getOptimizedImageUrl(url, {
    ...sizes[size],
    format: "webp",
    quality: 80,
    fit: "cover",
  });
};

/**
 * Thumbnail-Optimierung für Galerien
 */
export const getThumbnailImageUrl = (url: string): string => {
  return getOptimizedImageUrl(url, {
    width: 200,
    height: 150,
    format: "webp",
    quality: 70,
    fit: "cover",
  });
};

/**
 * Hero-Image-Optimierung für große Bilder
 */
export const getHeroImageUrl = (url: string, isMobile = false): string => {
  return getOptimizedImageUrl(url, {
    width: isMobile ? 600 : 1200,
    height: isMobile ? 400 : 600,
    format: "webp",
    quality: 85,
    fit: "cover",
  });
};

/**
 * Utility für Bild-Fehlerbehandlung
 */
export const getFallbackImageUrl = (
  originalUrl: string,
  fallbackUrl: string,
): string => {
  // Versuche das optimierte Bild zu laden, falls es fehlschlägt, verwende Fallback
  return originalUrl || fallbackUrl;
};

/**
 * Performance-Monitoring für Bildladung
 */
export const trackImageLoadPerformance = (
  imageUrl: string,
  loadTime: number,
) => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log(`📸 Bild geladen: ${imageUrl} in ${loadTime.toFixed(0)}ms`);

    if (loadTime > 2000) {
      console.warn(
        `🐌 Langsame Bildladung: ${imageUrl} (${loadTime.toFixed(0)}ms)`,
      );
    }
  }
};
