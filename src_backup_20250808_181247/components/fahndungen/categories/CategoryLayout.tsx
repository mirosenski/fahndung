"use client";

import React from "react";
import CommonHeroSection from "./CommonHeroSection";
import CategoryNavigation from "./CategoryNavigation";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface CategoryLayoutProps {
  data: UIInvestigationData;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

export default function CategoryLayout({
  data,
  activeCategory,
  onCategoryChange,
  children,
}: CategoryLayoutProps) {
  return (
    <div className="w-full space-y-6">
      {/* Gemeinsame Hero-Sektion */}
      <CommonHeroSection data={data} />

      {/* Navigation */}
      <CategoryNavigation
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Kategorie-spezifischer Inhalt */}
      {children}
    </div>
  );
}
