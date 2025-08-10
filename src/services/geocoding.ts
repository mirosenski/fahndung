import type { GeocodingResult } from "~/lib/types/geocoding.types";

// Globaler Cache für Geocoding-Ergebnisse
const geocodingCache = new Map<
  string,
  {
    coordinates: [number, number];
    address: string;
    timestamp: number;
  }
>();

// Cache-Dauer: 24 Stunden
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export class NominatimService {
  private static readonly BASE_URL = "https://nominatim.openstreetmap.org";

  static async search(
    query: string,
    options?: {
      limit?: number;
      countrycodes?: string;
      bounded?: boolean;
      viewbox?: [number, number, number, number];
    },
  ): Promise<GeocodingResult[]> {
    // Prüfe Cache zuerst
    const cacheKey = `${query}-${options?.countrycodes ?? "de"}-${options?.limit ?? 5}`;
    const cached = geocodingCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return [
        {
          lat: cached.coordinates[0].toString(),
          lon: cached.coordinates[1].toString(),
          display_name: cached.address,
          place_id: 0,
          licence: "",
          osm_type: "",
          osm_id: 0,
          boundingbox: [],
          class: "",
          type: "",
          importance: 0,
          icon: "",
        },
      ];
    }

    const params = new URLSearchParams({
      format: "json",
      q: query,
      limit: options?.limit?.toString() ?? "5",
      countrycodes: options?.countrycodes ?? "de",
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
    });

    if (options?.viewbox) {
      params.append("viewbox", options.viewbox.join(","));
      params.append("bounded", options?.bounded ? "1" : "0");
    }

    // Reduzierter Timeout für schnellere Fehlerbehandlung
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new DOMException("Timeout", "AbortError")),
      3000,
    );

    try {
      const response = await fetch(`${this.BASE_URL}/search?${params}`, {
        headers: {
          "User-Agent": "FahndungApp/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const results = (await response.json()) as GeocodingResult[];

      // Cache das erste Ergebnis
      if (results?.length > 0) {
        const firstResult = results[0];
        if (firstResult?.lat && firstResult?.lon) {
          geocodingCache.set(cacheKey, {
            coordinates: [
              parseFloat(firstResult.lat),
              parseFloat(firstResult.lon),
            ],
            address: firstResult.display_name,
            timestamp: Date.now(),
          });
        }
      }

      return results;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        console.warn("⚠️ Geocoding Request abgebrochen (Timeout)");
        return [];
      } else if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn(
          "🌐 Netzwerkfehler beim Geocoding - Überprüfen Sie Ihre Internetverbindung",
        );
        return [];
      } else {
        console.warn("⚠️ Geocoding fehlgeschlagen:", error);
        return [];
      }
    }
  }

  static async reverse(lat: number, lng: number): Promise<GeocodingResult> {
    const cacheKey = `reverse-${lat}-${lng}`;
    const cached = geocodingCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        lat: cached.coordinates[0].toString(),
        lon: cached.coordinates[1].toString(),
        display_name: cached.address,
        place_id: 0,
        licence: "",
        osm_type: "",
        osm_id: 0,
        boundingbox: [],
        class: "",
        type: "",
        importance: 0,
        icon: "",
      };
    }

    const params = new URLSearchParams({
      format: "json",
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
    });

    // Reduzierter Timeout für schnellere Fehlerbehandlung
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(new DOMException("Timeout", "AbortError")),
      3000,
    );

    try {
      const response = await fetch(`${this.BASE_URL}/reverse?${params}`, {
        headers: {
          "User-Agent": "FahndungApp/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const result = (await response.json()) as GeocodingResult;

      // Cache das Ergebnis
      geocodingCache.set(cacheKey, {
        coordinates: [lat, lng],
        address: result.display_name,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        console.warn("⚠️ Reverse Geocoding Request abgebrochen (Timeout)");
        throw new Error("Reverse geocoding timeout");
      } else if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn(
          "🌐 Netzwerkfehler beim Reverse Geocoding - Überprüfen Sie Ihre Internetverbindung",
        );
        throw new Error("Network error during reverse geocoding");
      } else {
        console.warn("⚠️ Reverse Geocoding fehlgeschlagen:", error);
        throw error;
      }
    }
  }

  // Neue Methode für optimiertes Geocoding mit Fallback
  static async searchOptimized(
    query: string,
    options?: {
      limit?: number;
      countrycodes?: string;
      bounded?: boolean;
      viewbox?: [number, number, number, number];
    },
  ): Promise<GeocodingResult[]> {
    try {
      return await this.search(query, options);
    } catch (error) {
      // Spezielle Behandlung für AbortError (Timeout)
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("⚠️ Geocoding Request abgebrochen (Timeout)");
        return [];
      }

      // Behandlung für Netzwerkfehler
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn(
          "🌐 Netzwerkfehler beim Geocoding - Überprüfen Sie Ihre Internetverbindung",
        );
        return [];
      }

      console.warn("⚠️ Geocoding fehlgeschlagen, verwende Fallback:", error);

      // Fallback: Versuche mit vereinfachter Suche
      const simplifiedQuery = query.split(",")[0]; // Verwende nur den ersten Teil
      if (simplifiedQuery && simplifiedQuery !== query) {
        try {
          return await this.search(simplifiedQuery, options);
        } catch (fallbackError) {
          // Auch hier AbortError und Netzwerkfehler behandeln
          if (
            fallbackError instanceof Error &&
            fallbackError.name === "AbortError"
          ) {
            console.warn("⚠️ Fallback Geocoding Request abgebrochen (Timeout)");
            return [];
          } else if (
            fallbackError instanceof TypeError &&
            fallbackError.message.includes("Failed to fetch")
          ) {
            console.warn(
              "🌐 Netzwerkfehler beim Fallback Geocoding - Überprüfen Sie Ihre Internetverbindung",
            );
            return [];
          }
          console.warn(
            "⚠️ Fallback Geocoding auch fehlgeschlagen:",
            fallbackError,
          );
          return [];
        }
      }

      return [];
    }
  }

  // Cache-Management
  static clearCache(): void {
    geocodingCache.clear();
  }

  static getCacheSize(): number {
    return geocodingCache.size;
  }

  static getCacheStats(): {
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    if (geocodingCache.size === 0) {
      return { size: 0, oldestEntry: null, newestEntry: null };
    }

    const timestamps = Array.from(geocodingCache.values()).map(
      (entry) => entry.timestamp,
    );
    return {
      size: geocodingCache.size,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  }
}
