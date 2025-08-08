"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  variant?: "desktop" | "mobile";
  size?: "default" | "compact";
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  variant = "desktop",
  size = "default",
  placeholder = "Suchen...",
  className = "",
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Hier können Sie die Suchlogik implementieren
      console.log("Suche nach:", query);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  if (variant === "mobile") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-border p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Suchen"
        >
          <Search className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-sm">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop variant
  const isCompact = size === "compact";

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`
              rounded-lg border border-border bg-background/80 pl-10 pr-4 
              transition-all duration-200 focus:outline-none focus:ring-2
              focus:ring-ring focus:ring-offset-2
              ${isCompact ? "w-48 py-1.5 text-sm" : "w-64 py-2"}
            `}
          />
        </div>
      </form>
    </div>
  );
}
