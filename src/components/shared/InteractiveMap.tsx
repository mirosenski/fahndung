"use client";

import React from "react";
import SimpleMap from "./SimpleMap";

export interface MapLocation {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type:
    | "main"
    | "tatort"
    | "wohnort"
    | "arbeitsplatz"
    | "sichtung"
    | "sonstiges";
  description?: string;
  timestamp?: Date;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom: number;
  height: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  onLocationRemove?: (id: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  return <SimpleMap {...props} />;
};

export default InteractiveMap;
