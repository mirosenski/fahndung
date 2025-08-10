import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Shield,
  Building2,
  Users,
  MapPin,
  Clock,
  Zap,
} from "lucide-react";

// Filter-Datentypen
export interface CompactFilterState {
  searchTerm: string;
  dienststelle: string;
  fahndungstyp: string;
  neue: boolean;
  eilfahndung: boolean;
  region: string[];
}

// Konfigurationsdaten
const DIENSTSTELLEN = [
  "Alle Dienststellen",
  "LKA",
  "Aalen",
  "Freiburg",
  "Heilbronn",
  "Karlsruhe",
  "Konstanz",
  "Ludwigsburg",
  "Mannheim",
  "Offenburg",
  "Pforzheim",
  "Ravensburg",
  "Reutlingen",
  "Stuttgart",
  "Ulm",
];

const FAHNDUNGSTYPEN = [
  { value: "all", label: "Alle", icon: Users },
  { value: "straftaeter", label: "Straftäter", icon: Shield },
  { value: "vermisste", label: "Vermisste", icon: Users },
  { value: "unbekannte", label: "Unbekannte Tote", icon: Users },
  { value: "sachen", label: "Sachen", icon: Shield },
];

const REGIONEN = [
  "Bodensee",
  "Donau-Iller",
  "Heilbronn-Franken",
  "Hochrhein",
  "Karlsruhe",
  "Neckar-Alb",
  "Nordschwarzwald",
  "Ostwürttemberg",
  "Rhein-Neckar",
  "Schwarzwald-Baar",
  "Stuttgart",
  "Südlicher Oberrhein",
];

// Props Interface
interface CompactFilterProps {
  onFilterChange: (filters: CompactFilterState) => void;
  className?: string;
  showRegionFilter?: boolean;
  defaultValues?: Partial<CompactFilterState>;
}

// Dropdown-Komponente
const CustomDropdown = ({
  value,
  options,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex w-full items-center justify-between gap-2 rounded-lg
          border-border bg-background px-3 py-2
          text-sm font-medium
          text-foreground transition-all duration-200 hover:bg-accent
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
          <span className="truncate">
            {value === "Alle Dienststellen" || value === "all"
              ? placeholder
              : (options.find((opt) => opt === value) ??
                FAHNDUNGSTYPEN.find((t) => t.value === value)?.label ??
                value)}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-left text-sm text-popover-foreground
                transition-colors hover:bg-accent
                ${value === option ? "bg-accent text-accent-foreground" : ""}
              `}
              role="option"
              aria-selected={value === option}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Multi-Select für Regionen
const RegionMultiSelect = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRegion = (region: string) => {
    if (value.includes(region)) {
      onChange(value.filter((r) => r !== region));
    } else {
      onChange([...value, region]);
    }
  };

  const displayText =
    value.length === 0
      ? "Alle Regionen"
      : value.length === 1
        ? value[0]
        : `${value.length} Regionen`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className="flex items-center gap-2 truncate">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{displayText}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-sm">
          <div className="border-b border-border p-2">
            <button
              onClick={() => onChange([])}
              className="text-xs text-primary hover:text-primary/80"
            >
              Alle abwählen
            </button>
          </div>
          {REGIONEN.map((region) => (
            <label
              key={region}
              className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={value.includes(region)}
                onChange={() => toggleRegion(region)}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <span className="text-sm text-popover-foreground">{region}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Hauptkomponente
export const CompactFilter: React.FC<CompactFilterProps> = ({
  onFilterChange,
  className = "",
  showRegionFilter = true,
  defaultValues = {},
}) => {
  const [filters, setFilters] = useState<CompactFilterState>({
    searchTerm: defaultValues.searchTerm ?? "",
    dienststelle: defaultValues.dienststelle ?? "Alle Dienststellen",
    fahndungstyp: defaultValues.fahndungstyp ?? "all",
    neue: defaultValues.neue ?? false,
    eilfahndung: defaultValues.eilfahndung ?? false,
    region: defaultValues.region ?? [],
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter-Updates
  const updateFilter = useCallback(
    (key: keyof CompactFilterState, value: unknown) => {
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          [key]: value as CompactFilterState[keyof CompactFilterState],
        };
        return newFilters;
      });
    },
    [],
  );

  // Callback für Filter-Änderungen
  const handleFilterChange = useCallback(
    (newFilters: CompactFilterState) => {
      onFilterChange(newFilters);
    },
    [onFilterChange],
  );

  // Überwache Filter-Änderungen und benachrichtige Parent
  useEffect(() => {
    handleFilterChange(filters);
  }, [filters, handleFilterChange]);

  // Aktive Filter zählen
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.dienststelle !== "Alle Dienststellen") count++;
    if (filters.fahndungstyp !== "all") count++;
    if (filters.neue) count++;
    if (filters.eilfahndung) count++;
    if (filters.region.length > 0) count += filters.region.length;
    return count;
  }, [filters]);

  // Reset
  const resetFilters = useCallback(() => {
    const resetState: CompactFilterState = {
      searchTerm: "",
      dienststelle: "Alle Dienststellen",
      fahndungstyp: "all",
      neue: false,
      eilfahndung: false,
      region: [],
    };
    setFilters(resetState);
    handleFilterChange(resetState);
  }, [handleFilterChange]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && activeFilterCount > 0) {
        resetFilters();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [activeFilterCount, resetFilters]);

  return (
    <div className={`compact-filter ${className}`}>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="rounded-lg border-2 border-border bg-card p-4">
          {/* Suchleiste */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="search"
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                placeholder="Name, Ort, Fallnummer eingeben..."
                className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => updateFilter("searchTerm", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Dienststelle */}
            <CustomDropdown
              value={filters.dienststelle}
              options={DIENSTSTELLEN}
              onChange={(value) => updateFilter("dienststelle", value)}
              placeholder="Dienststelle"
              icon={Building2}
            />

            {/* Fahndungstyp */}
            <div className="relative">
              <button className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring">
                <select
                  value={filters.fahndungstyp}
                  onChange={(e) => updateFilter("fahndungstyp", e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  {FAHNDUNGSTYPEN.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {FAHNDUNGSTYPEN.find(
                      (t) => t.value === filters.fahndungstyp,
                    )?.label ?? "Alle"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Schnellfilter */}
            <div className="flex items-center gap-3">
              <label
                className={`
                flex cursor-pointer items-center gap-2
                rounded-lg border px-3 py-2 transition-all
                ${
                  filters.neue
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-border/80"
                }
              `}
              >
                <input
                  type="checkbox"
                  checked={filters.neue}
                  onChange={(e) => updateFilter("neue", e.target.checked)}
                  className="sr-only"
                />
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Neue</span>
              </label>

              <label
                className={`
                flex cursor-pointer items-center gap-2
                rounded-lg border px-3 py-2 transition-all
                ${
                  filters.eilfahndung
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border hover:border-border/80"
                }
              `}
              >
                <input
                  type="checkbox"
                  checked={filters.eilfahndung}
                  onChange={(e) =>
                    updateFilter("eilfahndung", e.target.checked)
                  }
                  className="sr-only"
                />
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Eilfahndung</span>
              </label>
            </div>

            {/* Region (optional) */}
            {showRegionFilter && (
              <RegionMultiSelect
                value={filters.region}
                onChange={(value) => updateFilter("region", value)}
              />
            )}
          </div>

          {/* Aktive Filter & Reset */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {activeFilterCount} Filter aktiv
              </span>
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                Alle zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 rounded-lg bg-card p-3">
          {/* Mobile Suchfeld */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              placeholder="Suchen..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className={`flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground ${
              activeFilterCount > 0 ? "ring-2 ring-ring" : ""
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-popover">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filter</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="rounded-lg p-2 hover:bg-accent"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Mobile Filter Controls */}
                  <CustomDropdown
                    value={filters.dienststelle}
                    options={DIENSTSTELLEN}
                    onChange={(value) => updateFilter("dienststelle", value)}
                    placeholder="Dienststelle"
                    icon={Building2}
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Fahndungstyp
                    </label>
                    <div className="space-y-2">
                      {FAHNDUNGSTYPEN.map((type) => (
                        <label
                          key={type.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                            filters.fahndungstyp === type.value
                              ? "bg-accent"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="fahndungstyp"
                            value={type.value}
                            checked={filters.fahndungstyp === type.value}
                            onChange={(e) =>
                              updateFilter("fahndungstyp", e.target.value)
                            }
                            className="h-4 w-4"
                          />
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Schnellfilter
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3">
                        <input
                          type="checkbox"
                          checked={filters.neue}
                          onChange={(e) =>
                            updateFilter("neue", e.target.checked)
                          }
                          className="h-4 w-4 rounded"
                        />
                        <Clock className="h-4 w-4" />
                        <span>Neue Fahndungen</span>
                      </label>
                      <label className="flex items-center gap-3 p-3">
                        <input
                          type="checkbox"
                          checked={filters.eilfahndung}
                          onChange={(e) =>
                            updateFilter("eilfahndung", e.target.checked)
                          }
                          className="h-4 w-4 rounded"
                        />
                        <Zap className="h-4 w-4 text-destructive" />
                        <span>Eilfahndungen</span>
                      </label>
                    </div>
                  </div>

                  {showRegionFilter && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Regionen
                      </label>
                      <div className="max-h-40 space-y-2 overflow-y-auto">
                        {REGIONEN.map((region) => (
                          <label
                            key={region}
                            className="flex items-center gap-3 p-2"
                          >
                            <input
                              type="checkbox"
                              checked={filters.region.includes(region)}
                              onChange={() => {
                                if (filters.region.includes(region)) {
                                  updateFilter(
                                    "region",
                                    filters.region.filter((r) => r !== region),
                                  );
                                } else {
                                  updateFilter("region", [
                                    ...filters.region,
                                    region,
                                  ]);
                                }
                              }}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm">{region}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={resetFilters}
                    className="flex-1 rounded-lg bg-muted py-3 font-medium text-muted-foreground hover:text-foreground"
                  >
                    Zurücksetzen
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 rounded-lg bg-primary py-3 font-medium text-primary-foreground"
                  >
                    Anwenden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactFilter;
