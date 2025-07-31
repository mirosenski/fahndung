"use client";

import { Grid3X3, Grid, List } from 'lucide-react';
import { type ViewMode } from '~/types/fahndungskarte';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export default function ViewToggle({ currentView, onViewChange, className = "" }: ViewToggleProps) {
  const viewOptions = [
    { 
      mode: 'grid-3' as ViewMode, 
      icon: Grid3X3, 
      label: '3er Ansicht',
      description: '3 Karten pro Reihe'
    },
    { 
      mode: 'grid-4' as ViewMode, 
      icon: Grid, 
      label: '4er Ansicht',
      description: '4 Karten pro Reihe'
    },
    { 
      mode: 'list' as ViewMode, 
      icon: List, 
      label: 'Listenansicht',
      description: 'Kompakte Liste'
    }
  ];

  return (
    <div className={`flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 ${className}`}>
      {viewOptions.map(({ mode, icon: Icon, label, description }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            currentView === mode
              ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-300'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
          }`}
          title={description}
          aria-label={description}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
} 