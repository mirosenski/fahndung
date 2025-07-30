"use client";

import React, { useState, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface WizardTab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  completed?: boolean;
  disabled?: boolean;
}

interface WizardTabNavigationProps {
  tabs: WizardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showProgress?: boolean;
  className?: string;
}

export default function WizardTabNavigation({
  tabs,
  activeTab,
  onTabChange,
  showProgress = false,
  className = "",
}: WizardTabNavigationProps) {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const progress = ((activeIndex + 1) / tabs.length) * 100;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 200;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    // Update scroll buttons
    setTimeout(() => {
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth,
        );
      }
    }, 100);
  };

  return (
    <div className={`wizard-tab-navigation ${className}`}>
      {/* Progress Bar - nur wenn showProgress true ist */}
      {showProgress && (
        <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Schritt {activeIndex + 1} von {tabs.length}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation mit Scroll */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            {/* Scrollable Navigation */}
            <nav
              ref={scrollContainerRef}
              className="scrollbar-hide flex space-x-8 overflow-x-auto px-8"
              onScroll={() => {
                if (scrollContainerRef.current) {
                  const container = scrollContainerRef.current;
                  setCanScrollLeft(container.scrollLeft > 0);
                  setCanScrollRight(
                    container.scrollLeft <
                      container.scrollWidth - container.clientWidth,
                  );
                }
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isCompleted = tab.completed;
                const isDisabled = tab.disabled;

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && onTabChange(tab.id)}
                    disabled={isDisabled}
                    className={`group flex items-center space-x-2 whitespace-nowrap px-1 py-4 text-sm font-medium transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed text-gray-400 dark:text-gray-500"
                        : isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    title={tab.description}
                  >
                    <div className="relative">
                      <Icon
                        className={`h-4 w-4 ${
                          isCompleted ? "text-green-500" : ""
                        }`}
                      />
                      {isCompleted && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {isActive && (
                        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
