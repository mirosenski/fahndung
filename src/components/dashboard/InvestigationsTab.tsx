"use client";

import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

interface InvestigationsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  filteredInvestigations: Investigation[];
  isEditor: boolean;
  onCreate: () => void;
}

export default function InvestigationsTab({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  filteredInvestigations,
  isEditor,
  onCreate,
}: InvestigationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Suche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Fahndungen durchsuchen..."
                className="input-dark-mode py-2 pl-10 pr-4"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kategorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-dark-mode"
            >
              <option value="all">Alle Kategorien</option>
              <option value="vermisst">Vermisst</option>
              <option value="gesucht">Gesucht</option>
              <option value="warnung">Warnung</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select-dark-mode"
            >
              <option value="all">Alle Status</option>
              <option value="published">Veröffentlicht</option>
              <option value="draft">Entwurf</option>
              <option value="archived">Archiviert</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priorität
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="select-dark-mode"
            >
              <option value="all">Alle Prioritäten</option>
              <option value="urgent">Dringend</option>
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="low">Niedrig</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investigations List */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fahndungen ({filteredInvestigations.length})
            </h2>
            {isEditor && (
              <button
                onClick={onCreate}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Neue Fahndung</span>
              </button>
            )}
          </div>

          {filteredInvestigations.length > 0 ? (
            <div className="space-y-4">
              {filteredInvestigations.map((investigation) => (
                <div
                  key={investigation.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {investigation.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {investigation.case_number}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {investigation.location}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        investigation.priority === "urgent"
                          ? "bg-red-500/20 text-red-600 dark:text-red-400"
                          : investigation.priority === "high"
                            ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                            : "bg-green-500/20 text-green-600 dark:text-green-400"
                      }`}
                    >
                      {investigation.priority}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        investigation.status === "published"
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {investigation.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white">
                        <Eye className="h-4 w-4" />
                      </button>
                      {isEditor && (
                        <>
                          <button className="p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-400 transition-colors hover:text-red-600 dark:hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                Keine Fahndungen gefunden
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Erstellen Sie Ihre erste Fahndung, um zu beginnen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
