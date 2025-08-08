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
    { id: "overview", label: "Übersicht", icon: "📋" },
    { id: "description", label: "Beschreibung", icon: "📝" },
    { id: "media", label: "Medien", icon: "🖼️" },
    { id: "locations", label: "Orte", icon: "📍" },
    { id: "contact", label: "Kontakt", icon: "📞" },
  ];

  return (
    <div className="mb-6">
      <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
