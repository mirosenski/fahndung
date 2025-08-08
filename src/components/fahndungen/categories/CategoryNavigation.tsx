"use client";

import React from "react";

interface CategoryNavigationProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CategoryNavigation({
  activeCategory = "overview",
  onCategoryChange,
}: CategoryNavigationProps) {
  const categories = [
    { id: "contact", label: "Übersicht", icon: "📋" },
    { id: "description", label: "Beschreibung", icon: "📝" },
    { id: "media", label: "Medien", icon: "🖼️" },
    { id: "locations", label: "Orte", icon: "📍" },
  ];

  return (
    <div className="mb-6">
      <nav className="flex space-x-1 rounded-lg bg-muted p-1 dark:bg-muted">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-white text-blue-600 shadow-sm dark:bg-muted dark:text-blue-400"
                : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-white"
            }`}
          >
            <span>{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
