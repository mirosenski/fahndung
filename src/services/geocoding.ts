interface GeocodingResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

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
    const params = new URLSearchParams({
      format: "json",
      q: query,
      limit: options?.limit?.toString() || "5",
      countrycodes: options?.countrycodes || "de",
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
    });

    if (options?.viewbox) {
      params.append("viewbox", options.viewbox.join(","));
      params.append("bounded", options?.bounded ? "1" : "0");
    }

    const response = await fetch(`${this.BASE_URL}/search?${params}`, {
      headers: {
        "User-Agent": "FahndungApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async reverse(lat: number, lng: number): Promise<GeocodingResult> {
    const params = new URLSearchParams({
      format: "json",
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
    });

    const response = await fetch(`${this.BASE_URL}/reverse?${params}`, {
      headers: {
        "User-Agent": "FahndungApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    return response.json();
  }
}
