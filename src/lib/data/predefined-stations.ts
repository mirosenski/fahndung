// Vordefinierte Polizeistationen für Baden-Württemberg
// Diese können direkt im Admin-Bereich als Stationen erstellt werden

export interface PredefinedStation {
  name: string;
  type: 'praesidium' | 'revier';
  city: string;
  address: string;
  coordinates: [number, number];
  telefon: string;
  email: string;
  notdienst24h: boolean;
  isActive: boolean;
  parentId?: string; // Für Reviere - wird dynamisch gesetzt
  description?: string;
}

export const predefinedStations: PredefinedStation[] = [
  // === PRÄSIDIEN ===
  {
    name: "Polizeipräsidium Stuttgart",
    type: "praesidium",
    city: "Stuttgart",
    address: "Hahnemannstraße 1",
    coordinates: [48.81046, 9.18686],
    telefon: "0711 8990-0",
    email: "stuttgart@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Hauptsitz der Polizei Baden-Württemberg"
  },
  {
    name: "Polizeipräsidium Karlsruhe",
    type: "praesidium",
    city: "Karlsruhe",
    address: "Erbprinzenstraße 96",
    coordinates: [49.0069, 8.4037],
    telefon: "0721 666-0",
    email: "karlsruhe@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Karlsruhe"
  },
  {
    name: "Polizeipräsidium Mannheim",
    type: "praesidium",
    city: "Mannheim",
    address: "Collinistraße 1",
    coordinates: [49.4875, 8.4660],
    telefon: "0621 174-0",
    email: "mannheim@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Mannheim"
  },
  {
    name: "Polizeipräsidium Freiburg",
    type: "praesidium",
    city: "Freiburg",
    address: "Basler Landstraße 113",
    coordinates: [47.9990, 7.8421],
    telefon: "0761 882-0",
    email: "freiburg@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Freiburg"
  },
  {
    name: "Polizeipräsidium Heilbronn",
    type: "praesidium",
    city: "Heilbronn",
    address: "Cäcilienstraße 56",
    coordinates: [49.1406, 9.2185],
    telefon: "07131 104-0",
    email: "heilbronn@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Heilbronn"
  },
  {
    name: "Polizeipräsidium Aalen",
    type: "praesidium",
    city: "Aalen",
    address: "Böhmerwaldstraße 20",
    coordinates: [48.830248, 10.091980],
    telefon: "07361 580-0",
    email: "aalen@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Aalen"
  },
  {
    name: "Polizeipräsidium Konstanz",
    type: "praesidium",
    city: "Konstanz",
    address: "Benediktinerplatz 1",
    coordinates: [47.6606, 9.1753],
    telefon: "07531 995-0",
    email: "konstanz@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Konstanz"
  },
  {
    name: "Polizeipräsidium Ludwigsburg",
    type: "praesidium",
    city: "Ludwigsburg",
    address: "Hindenburgstraße 29",
    coordinates: [48.8976, 9.1916],
    telefon: "07141 18-0",
    email: "ludwigsburg@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Ludwigsburg"
  },
  {
    name: "Polizeipräsidium Offenburg",
    type: "praesidium",
    city: "Offenburg",
    address: "Lange Straße 52",
    coordinates: [48.4736, 7.9448],
    telefon: "0781 890-0",
    email: "offenburg@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Offenburg"
  },
  {
    name: "Polizeipräsidium Pforzheim",
    type: "praesidium",
    city: "Pforzheim",
    address: "Goethestraße 2",
    coordinates: [48.8936, 8.7044],
    telefon: "07231 186-0",
    email: "pforzheim@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Pforzheim"
  },
  {
    name: "Polizeipräsidium Ravensburg",
    type: "praesidium",
    city: "Ravensburg",
    address: "Frauenstraße 126",
    coordinates: [47.7819, 9.6136],
    telefon: "0751 366-0",
    email: "ravensburg@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Ravensburg"
  },
  {
    name: "Polizeipräsidium Reutlingen",
    type: "praesidium",
    city: "Reutlingen",
    address: "Kaiserstraße 54",
    coordinates: [48.4914, 9.2114],
    telefon: "07121 186-0",
    email: "reutlingen@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Reutlingen"
  },
  {
    name: "Polizeipräsidium Ulm",
    type: "praesidium",
    city: "Ulm",
    address: "Neue Straße 88",
    coordinates: [48.3984, 9.9916],
    telefon: "0731 188-0",
    email: "ulm@polizei.bwl.de",
    notdienst24h: true,
    isActive: true,
    description: "Polizeipräsidium Ulm"
  },

  // === REVIERE STUTTGART ===
  {
    name: "Polizeirevier 1 Theodor-Heuss-Straße",
    type: "revier",
    city: "Stuttgart",
    address: "Theodor-Heuss-Straße 11",
    coordinates: [48.7769268, 9.1744498],
    telefon: "0711 8990-3100",
    email: "revier1.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Zentrum Stuttgart"
  },
  {
    name: "Polizeirevier 2 Bad Cannstatt",
    type: "revier",
    city: "Stuttgart",
    address: "Marktstraße 71",
    coordinates: [48.8056, 9.2147],
    telefon: "0711 8990-3200",
    email: "revier2.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Bad Cannstatt"
  },
  {
    name: "Polizeirevier 3 Feuerbach",
    type: "revier",
    city: "Stuttgart",
    address: "Stuttgarter Straße 35",
    coordinates: [48.8125, 9.1575],
    telefon: "0711 8990-3300",
    email: "revier3.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Feuerbach"
  },
  {
    name: "Polizeirevier 4 Zuffenhausen",
    type: "revier",
    city: "Stuttgart",
    address: "Stammheimer Straße 3",
    coordinates: [48.8319, 9.1683],
    telefon: "0711 8990-3400",
    email: "revier4.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Zuffenhausen"
  },
  {
    name: "Polizeirevier 5 Vaihingen",
    type: "revier",
    city: "Stuttgart",
    address: "Hauptstraße 94",
    coordinates: [48.7458, 9.1083],
    telefon: "0711 8990-3500",
    email: "revier5.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Vaihingen"
  },
  {
    name: "Polizeirevier 6 Martin-Luther Straße",
    type: "revier",
    city: "Stuttgart",
    address: "Martin-Luther-Straße 40/42",
    coordinates: [48.80509, 9.22409],
    telefon: "0711 8990-3600",
    email: "revier6.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Stuttgart Nord"
  },
  {
    name: "Polizeirevier 7 Ludwigsburger Straße",
    type: "revier",
    city: "Stuttgart",
    address: "Ludwigsburger Straße 126",
    coordinates: [48.8317597, 9.1746453],
    telefon: "0711 8990-3700",
    email: "revier7.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Stuttgart Nord-Ost"
  },
  {
    name: "Polizeirevier 8 Kärntner Straße",
    type: "revier",
    city: "Stuttgart",
    address: "Kärntner Straße 18",
    coordinates: [48.8131253, 9.16063],
    telefon: "0711 8990-3800",
    email: "revier8.stuttgart@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Stuttgart West"
  },

  // === REVIERE KARLSRUHE ===
  {
    name: "Polizeirevier Karlsruhe-Mitte",
    type: "revier",
    city: "Karlsruhe",
    address: "Kaiserstraße 146",
    coordinates: [49.0094, 8.4044],
    telefon: "0721 666-1000",
    email: "revier-mitte.karlsruhe@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Karlsruhe Mitte"
  },
  {
    name: "Polizeirevier Karlsruhe-Durlach",
    type: "revier",
    city: "Karlsruhe",
    address: "Pfinztalstraße 9",
    coordinates: [48.9989, 8.4672],
    telefon: "0721 666-2000",
    email: "revier-durlach.karlsruhe@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Karlsruhe Durlach"
  },
  {
    name: "Polizeirevier Karlsruhe-Mühlburg",
    type: "revier",
    city: "Karlsruhe",
    address: "Mühlburger Straße 2",
    coordinates: [48.9956, 8.3789],
    telefon: "0721 666-3000",
    email: "revier-muehlburg.karlsruhe@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Karlsruhe Mühlburg"
  },
  {
    name: "Polizeirevier Karlsruhe-Rüppurr",
    type: "revier",
    city: "Karlsruhe",
    address: "Rüppurrer Straße 1",
    coordinates: [48.9789, 8.4233],
    telefon: "0721 666-4000",
    email: "revier-rueppurr.karlsruhe@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Karlsruhe Rüppurr"
  },

  // === REVIERE MANNHEIM ===
  {
    name: "Polizeirevier Mannheim-Innenstadt",
    type: "revier",
    city: "Mannheim",
    address: "M1 1",
    coordinates: [49.4875, 8.4660],
    telefon: "0621 174-1000",
    email: "revier-innenstadt.mannheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Mannheim Innenstadt"
  },
  {
    name: "Polizeirevier Mannheim-Neckarau",
    type: "revier",
    city: "Mannheim",
    address: "Neckarauer Straße 2",
    coordinates: [49.4722, 8.4833],
    telefon: "0621 174-2000",
    email: "revier-neckarau.mannheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Mannheim Neckarau"
  },
  {
    name: "Polizeirevier Mannheim-Rheinau",
    type: "revier",
    city: "Mannheim",
    address: "Rheinauer Straße 1",
    coordinates: [49.4567, 8.4789],
    telefon: "0621 174-3000",
    email: "revier-rheinau.mannheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Mannheim Rheinau"
  },
  {
    name: "Polizeirevier Mannheim-Schwetzingerstadt",
    type: "revier",
    city: "Mannheim",
    address: "Schwetzinger Straße 1",
    coordinates: [49.4789, 8.4567],
    telefon: "0621 174-4000",
    email: "revier-schwetzingerstadt.mannheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Mannheim Schwetzingerstadt"
  },

  // === REVIERE FREIBURG ===
  {
    name: "Polizeirevier Freiburg-Innenstadt",
    type: "revier",
    city: "Freiburg",
    address: "Kaiser-Joseph-Straße 167",
    coordinates: [47.9990, 7.8421],
    telefon: "0761 882-1000",
    email: "revier-innenstadt.freiburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Freiburg Innenstadt"
  },
  {
    name: "Polizeirevier Freiburg-Landwasser",
    type: "revier",
    city: "Freiburg",
    address: "Landwasserstraße 1",
    coordinates: [48.0123, 7.8234],
    telefon: "0761 882-2000",
    email: "revier-landwasser.freiburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Freiburg Landwasser"
  },
  {
    name: "Polizeirevier Freiburg-St. Georgen",
    type: "revier",
    city: "Freiburg",
    address: "St. Georgener Straße 1",
    coordinates: [47.9876, 7.8567],
    telefon: "0761 882-3000",
    email: "revier-stgeorgen.freiburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Freiburg St. Georgen"
  },
  {
    name: "Polizeirevier Freiburg-Wiehre",
    type: "revier",
    city: "Freiburg",
    address: "Wiehre Bahnhofstraße 1",
    coordinates: [47.9934, 7.8345],
    telefon: "0761 882-4000",
    email: "revier-wiehre.freiburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Freiburg Wiehre"
  },

  // === REVIERE HEILBRONN ===
  {
    name: "Polizeirevier Heilbronn-Innenstadt",
    type: "revier",
    city: "Heilbronn",
    address: "Cäcilienstraße 56",
    coordinates: [49.1406, 9.2185],
    telefon: "07131 104-1000",
    email: "revier-innenstadt.heilbronn@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Heilbronn Innenstadt"
  },
  {
    name: "Polizeirevier Heilbronn-Böckingen",
    type: "revier",
    city: "Heilbronn",
    address: "Böckinger Straße 1",
    coordinates: [49.1567, 9.2012],
    telefon: "07131 104-2000",
    email: "revier-boeckingen.heilbronn@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Heilbronn Böckingen"
  },
  {
    name: "Polizeirevier Heilbronn-Sontheim",
    type: "revier",
    city: "Heilbronn",
    address: "Sontheimer Straße 1",
    coordinates: [49.1234, 9.2345],
    telefon: "07131 104-3000",
    email: "revier-sontheim.heilbronn@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Heilbronn Sontheim"
  },

  // === REVIERE AALEN ===
  {
    name: "Polizeirevier Aalen",
    type: "revier",
    city: "Aalen",
    address: "Stuttgarter Straße 5",
    coordinates: [48.83774, 10.09566],
    telefon: "07361 524-0",
    email: "revier.aalen@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Aalen Revier"
  },
  {
    name: "Polizeirevier Backnang",
    type: "revier",
    city: "Backnang",
    address: "Aspacher Straße 75",
    coordinates: [48.949263, 9.421463],
    telefon: "07191 909-0",
    email: "revier.backnang@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Backnang Revier"
  },
  {
    name: "Polizeirevier Crailsheim",
    type: "revier",
    city: "Crailsheim",
    address: "Parkstraße 7",
    coordinates: [49.135451, 10.074459],
    telefon: "07951 480-0",
    email: "revier.crailsheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Crailsheim Revier"
  },
  {
    name: "Polizeirevier Ellwangen",
    type: "revier",
    city: "Ellwangen (Jagst)",
    address: "Karlstraße 3",
    coordinates: [48.964228, 10.131518],
    telefon: "07961 930-0",
    email: "revier.ellwangen@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ellwangen Revier"
  },
  {
    name: "Polizeirevier Fellbach",
    type: "revier",
    city: "Fellbach",
    address: "Cannstatter Straße 16",
    coordinates: [48.807339, 9.277376],
    telefon: "0711 5772-0",
    email: "revier.fellbach@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Fellbach Revier"
  },
  {
    name: "Polizeirevier Schorndorf",
    type: "revier",
    city: "Schorndorf",
    address: "Grabenstraße 28/1",
    coordinates: [48.80715, 9.52375],
    telefon: "07181 204-0",
    email: "revier.schorndorf@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Schorndorf Revier"
  },
  {
    name: "Polizeirevier Schwäbisch Gmünd",
    type: "revier",
    city: "Schwäbisch Gmünd",
    address: "Lessingstraße 7",
    coordinates: [48.796051, 9.791286],
    telefon: "07171 358-0",
    email: "revier.schwaebischgmuend@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Schwäbisch Gmünd Revier"
  },
  {
    name: "Polizeirevier Schwäbisch Hall",
    type: "revier",
    city: "Schwäbisch Hall",
    address: "Salinenstraße 18",
    coordinates: [49.1181768, 9.7341306],
    telefon: "0791 400-0",
    email: "revier.schwaebischhall@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Schwäbisch Hall Revier"
  },
  {
    name: "Polizeirevier Waiblingen",
    type: "revier",
    city: "Waiblingen",
    address: "Alter Postplatz 20",
    coordinates: [48.82902, 9.31758],
    telefon: "07151 950-0",
    email: "revier.waiblingen@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Waiblingen Revier"
  },
  {
    name: "Polizeirevier Winnenden",
    type: "revier",
    city: "Winnenden",
    address: "Eugenstraße 5",
    coordinates: [48.87295, 9.40646],
    telefon: "07195 694-0",
    email: "revier.winnenden@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Winnenden Revier"
  },

  // === REVIERE KONSTANZ ===
  {
    name: "Polizeirevier Konstanz-Innenstadt",
    type: "revier",
    city: "Konstanz",
    address: "Benediktinerplatz 1",
    coordinates: [47.6606, 9.1753],
    telefon: "07531 995-1000",
    email: "revier-innenstadt.konstanz@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Konstanz Innenstadt"
  },
  {
    name: "Polizeirevier Konstanz-Petershausen",
    type: "revier",
    city: "Konstanz",
    address: "Petershauser Straße 1",
    coordinates: [47.6789, 9.1567],
    telefon: "07531 995-2000",
    email: "revier-petershausen.konstanz@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Konstanz Petershausen"
  },

  // === REVIERE LUDWIGSBURG ===
  {
    name: "Polizeirevier Ludwigsburg-Innenstadt",
    type: "revier",
    city: "Ludwigsburg",
    address: "Hindenburgstraße 29",
    coordinates: [48.8976, 9.1916],
    telefon: "07141 18-1000",
    email: "revier-innenstadt.ludwigsburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ludwigsburg Innenstadt"
  },
  {
    name: "Polizeirevier Ludwigsburg-Oßweil",
    type: "revier",
    city: "Ludwigsburg",
    address: "Oßweiler Straße 1",
    coordinates: [48.9123, 9.1789],
    telefon: "07141 18-2000",
    email: "revier-osswell.ludwigsburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ludwigsburg Oßweil"
  },

  // === REVIERE OFFENBURG ===
  {
    name: "Polizeirevier Offenburg-Innenstadt",
    type: "revier",
    city: "Offenburg",
    address: "Lange Straße 52",
    coordinates: [48.4736, 7.9448],
    telefon: "0781 890-1000",
    email: "revier-innenstadt.offenburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Offenburg Innenstadt"
  },
  {
    name: "Polizeirevier Offenburg-Zell",
    type: "revier",
    city: "Offenburg",
    address: "Zeller Straße 1",
    coordinates: [48.4567, 7.9234],
    telefon: "0781 890-2000",
    email: "revier-zell.offenburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Offenburg Zell"
  },

  // === REVIERE PFORZHEIM ===
  {
    name: "Polizeirevier Pforzheim-Innenstadt",
    type: "revier",
    city: "Pforzheim",
    address: "Goethestraße 2",
    coordinates: [48.8936, 8.7044],
    telefon: "07231 186-1000",
    email: "revier-innenstadt.pforzheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Pforzheim Innenstadt"
  },
  {
    name: "Polizeirevier Pforzheim-Brötzingen",
    type: "revier",
    city: "Pforzheim",
    address: "Brötzingener Straße 1",
    coordinates: [48.8789, 8.7234],
    telefon: "07231 186-2000",
    email: "revier-broetzingen.pforzheim@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Pforzheim Brötzingen"
  },

  // === REVIERE RAVENSBURG ===
  {
    name: "Polizeirevier Ravensburg-Innenstadt",
    type: "revier",
    city: "Ravensburg",
    address: "Frauenstraße 126",
    coordinates: [47.7819, 9.6136],
    telefon: "0751 366-1000",
    email: "revier-innenstadt.ravensburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ravensburg Innenstadt"
  },
  {
    name: "Polizeirevier Ravensburg-Weingarten",
    type: "revier",
    city: "Ravensburg",
    address: "Weingartener Straße 1",
    coordinates: [47.7956, 9.6345],
    telefon: "0751 366-2000",
    email: "revier-weingarten.ravensburg@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ravensburg Weingarten"
  },

  // === REVIERE REUTLINGEN ===
  {
    name: "Polizeirevier Reutlingen-Innenstadt",
    type: "revier",
    city: "Reutlingen",
    address: "Kaiserstraße 54",
    coordinates: [48.4914, 9.2114],
    telefon: "07121 186-1000",
    email: "revier-innenstadt.reutlingen@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Reutlingen Innenstadt"
  },
  {
    name: "Polizeirevier Reutlingen-Betzingen",
    type: "revier",
    city: "Reutlingen",
    address: "Betzingener Straße 1",
    coordinates: [48.4789, 9.2234],
    telefon: "07121 186-2000",
    email: "revier-betzingen.reutlingen@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Reutlingen Betzingen"
  },

  // === REVIERE ULM ===
  {
    name: "Polizeirevier Ulm-Innenstadt",
    type: "revier",
    city: "Ulm",
    address: "Neue Straße 88",
    coordinates: [48.3984, 9.9916],
    telefon: "0731 188-1000",
    email: "revier-innenstadt.ulm@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ulm Innenstadt"
  },
  {
    name: "Polizeirevier Ulm-Söflingen",
    type: "revier",
    city: "Ulm",
    address: "Söflinger Straße 1",
    coordinates: [48.4123, 9.9789],
    telefon: "0731 188-2000",
    email: "revier-soeflingen.ulm@polizei.bwl.de",
    notdienst24h: false,
    isActive: true,
    description: "Ulm Söflingen"
  }
];

// Hilfsfunktionen
export const getPredefinedStationsByType = (type: 'praesidium' | 'revier'): PredefinedStation[] => {
  return predefinedStations.filter(station => station.type === type);
};

export const getPredefinedStationsByCity = (city: string): PredefinedStation[] => {
  return predefinedStations.filter(station => station.city === city);
};

export const getPredefinedPraesidien = (): PredefinedStation[] => {
  return getPredefinedStationsByType('praesidium');
};

export const getPredefinedReviere = (): PredefinedStation[] => {
  return getPredefinedStationsByType('revier');
}; 