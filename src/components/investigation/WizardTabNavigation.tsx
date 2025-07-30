"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

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
  showProgress = true,
  className = "",
}: WizardTabNavigationProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const progress = ((activeIndex + 1) / tabs.length) * 100;

  return (
    <div className={`wizard-tab-navigation ${className}`}>
      {/* Progress Bar */}
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
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
                  className={`group flex items-center space-x-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                    isDisabled
                      ? "cursor-not-allowed border-transparent text-gray-400 dark:text-gray-500"
                      : isActive
                      ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  title={tab.description}
                >
                  <div className="relative">
                    <Icon className={`h-4 w-4 ${
                      isCompleted ? "text-green-500" : ""
                    }`} />
                    {isCompleted && (
                      <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
                    )}
                  </div>
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 