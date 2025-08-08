"use client";

import {
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Archive,
  Share2,
  Copy,
  EyeOff,
  AlertTriangle,
  CheckSquare,
  Square,
} from "lucide-react";
import { getCategoryOptions } from "@/types/categories";
import UniversalBadge from "@/components/ui/UniversalBadge";
import { CaseNumberDetailed } from "~/components/ui/CaseNumberDisplay";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "~/lib/toast";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFahndungUrl, getFahndungEditUrl } from "~/lib/seo";

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
}: InvestigationsTabProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvestigations, setSelectedInvestigations] = useState<
    Set<string>
  >(new Set());

  // tRPC Mutations
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich gelöscht");
      setDeleteDialogOpen(null);
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  const publishMutation = api.post.publishInvestigation.useMutation({
    onSuccess: (data) => {
      const action =
        data.status === "published" ? "VERÖFFENTLICHT" : "UNVERÖFFENTLICHT";
      toast.success(`Fahndung erfolgreich ${action}`);
    },
    onError: (error) => {
      toast.error(`Fehler beim Veröffentlichen: ${error.message}`);
    },
  });

  const archiveMutation = api.post.archiveInvestigation.useMutation({
    onSuccess: (data) => {
      const action =
        data.status === "draft" ? "ALS ENTWURF GESETZT" : "AKTIVIERT";
      toast.success(`Fahndung erfolgreich ${action}`);
    },
    onError: (error) => {
      toast.error(`Fehler beim Archivieren: ${error.message}`);
    },
  });

  const handleDelete = async (investigationId: string) => {
    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync({ id: investigationId });
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const promises = Array.from(selectedInvestigations).map((id) =>
        deleteMutation.mutateAsync({ id }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.size} Fahndungen erfolgreich gelöscht`,
      );
      setSelectedInvestigations(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Bulk-Löschen:", error);
      toast.error("Fehler beim Löschen der Fahndungen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsLoading(true);
    try {
      const promises = Array.from(selectedInvestigations).map((id) =>
        archiveMutation.mutateAsync({ id, archive: true }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.size} Fahndungen erfolgreich als Entwurf gesetzt`,
      );
      setSelectedInvestigations(new Set());
    } catch (error) {
      console.error("Fehler beim Bulk-Archivieren:", error);
      toast.error("Fehler beim Archivieren der Fahndungen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    setIsLoading(true);
    try {
      const promises = Array.from(selectedInvestigations).map((id) =>
        publishMutation.mutateAsync({ id, publish: true }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.size} Fahndungen erfolgreich veröffentlicht`,
      );
      setSelectedInvestigations(new Set());
    } catch (error) {
      console.error("Fehler beim Bulk-Veröffentlichen:", error);
      toast.error("Fehler beim Veröffentlichen der Fahndungen");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (investigation: Investigation) => {
    setIsLoading(true);
    try {
      await publishMutation.mutateAsync({
        id: investigation.id,
        publish: investigation.status !== "published",
      });
    } catch (error) {
      console.error("Fehler beim Veröffentlichen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (investigation: Investigation) => {
    setIsLoading(true);
    try {
      await archiveMutation.mutateAsync({
        id: investigation.id,
        archive: investigation.status !== "draft",
      });
    } catch (error) {
      console.error("Fehler beim Archivieren:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (investigation: Investigation) => {
    // 🚀 PREFETCH FÜR SCHNELLERE NAVIGATION
    const targetUrl = getFahndungUrl(investigation.title, investigation.case_number);
    router.prefetch(targetUrl);
    
    // 🚀 SOFORTIGE NAVIGATION
    router.push(targetUrl);
  };

  const handleEdit = (investigation: Investigation) => {
    // 🚀 PREFETCH FÜR SCHNELLERE NAVIGATION
    const targetUrl = getFahndungEditUrl(investigation.title, investigation.case_number);
    router.prefetch(targetUrl);
    
    // 🚀 SOFORTIGE NAVIGATION
    router.push(targetUrl);
  };

  const handleCopyLink = async (investigation: Investigation) => {
    const url = `${window.location.origin}${getFahndungUrl(
      investigation.title,
      investigation.case_number,
    )}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link kopiert");
  };

  const handleShare = async (investigation: Investigation) => {
    const url = `${window.location.origin}${getFahndungUrl(
      investigation.title,
      investigation.case_number,
    )}`;
    if (navigator.share) {
      await navigator.share({
        title: investigation.title,
        url: url,
      });
    } else {
      await handleCopyLink(investigation);
    }
  };

  const handleSelectAll = () => {
    if (selectedInvestigations.size === filteredInvestigations.length) {
      setSelectedInvestigations(new Set());
    } else {
      setSelectedInvestigations(
        new Set(filteredInvestigations.map((i) => i.id)),
      );
    }
  };

  const handleSelectInvestigation = (investigationId: string) => {
    const newSelected = new Set(selectedInvestigations);
    if (newSelected.has(investigationId)) {
      newSelected.delete(investigationId);
    } else {
      newSelected.add(investigationId);
    }
    setSelectedInvestigations(newSelected);
  };

  const hasSelected = selectedInvestigations.size > 0;
  const allSelected =
    selectedInvestigations.size === filteredInvestigations.length &&
    filteredInvestigations.length > 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="shadow-xs rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
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
              {getCategoryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              <option value="active">Aktiv</option>
              <option value="published">Veröffentlicht</option>
              <option value="draft">Entwurf</option>
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

      {/* Bulk Actions Bar */}
      {hasSelected && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedInvestigations.size} Fahndung
                {selectedInvestigations.size !== 1 ? "en" : ""} ausgewählt
              </span>
              <button
                onClick={() => setSelectedInvestigations(new Set())}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Auswahl aufheben
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                disabled={isLoading}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800"
              >
                <Archive className="mr-2 h-4 w-4" />
                Als Entwurf setzen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPublish}
                disabled={isLoading}
                className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
              >
                <Eye className="mr-2 h-4 w-4" />
                Veröffentlichen
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Investigations List */}
      <div className="shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fahndungen ({filteredInvestigations.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Alle auswählen</span>
              </button>
            </div>
          </div>

          {filteredInvestigations.length > 0 ? (
            <div className="space-y-4">
              {filteredInvestigations.map((investigation) => (
                <div
                  key={investigation.id}
                  className="shadow-xs flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedInvestigations.has(investigation.id)}
                      onChange={() =>
                        handleSelectInvestigation(investigation.id)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {investigation.title}
                      </h3>
                      <CaseNumberDetailed
                        caseNumber={investigation.case_number}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {investigation.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UniversalBadge
                      content={investigation.priority}
                      variant="priority"
                      className={`${
                        investigation.priority === "urgent"
                          ? "bg-red-500/20 text-red-600 dark:text-red-400"
                          : investigation.priority === "new"
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                      }`}
                    />
                    <UniversalBadge
                      content={investigation.status}
                      variant="status"
                      className={`${
                        investigation.status === "published"
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : investigation.status === "active"
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            : investigation.status === "draft"
                              ? "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                              : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                      }`}
                    />

                    {/* Veröffentlichungs-Button - nur für aktive Fahndungen */}
                    {isEditor && investigation.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(investigation)}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <EyeOff className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Veröffentlichen
                        </span>
                      </Button>
                    )}

                    {/* Dropdown Menu für weitere Aktionen */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Anzeigen */}
                        <DropdownMenuItem
                          onClick={() => handleView(investigation)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Fahndung öffnen
                        </DropdownMenuItem>

                        {/* Bearbeiten */}
                        <DropdownMenuItem
                          onClick={() => handleEdit(investigation)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Fahndung bearbeiten
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Teilen */}
                        <DropdownMenuItem
                          onClick={() => handleShare(investigation)}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Teilen
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleCopyLink(investigation)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Link kopieren
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Status-spezifische Aktionen */}
                        {investigation.status === "draft" && (
                          <DropdownMenuItem
                            onClick={() => handleArchive(investigation)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Aktivieren
                          </DropdownMenuItem>
                        )}

                        {investigation.status === "active" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handlePublish(investigation)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Veröffentlichen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchive(investigation)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Als Entwurf setzen
                            </DropdownMenuItem>
                          </>
                        )}

                        {investigation.status === "published" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handlePublish(investigation)}
                            >
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unveröffentlichen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchive(investigation)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Als Entwurf setzen
                            </DropdownMenuItem>
                          </>
                        )}

                        {/* Löschen - für alle Status */}
                        <DropdownMenuItem
                          onClick={() => setDeleteDialogOpen(investigation.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Lösch-Dialog für einzelne Fahndung */}
      <AlertDialog
        open={!!deleteDialogOpen}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Fahndung löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie die Fahndung &quot;
              {
                filteredInvestigations.find((i) => i.id === deleteDialogOpen)
                  ?.title
              }
              &quot; löschen möchten? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && handleDelete(deleteDialogOpen)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Lösche..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk-Lösch-Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Mehrere Fahndungen löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie {selectedInvestigations.size} Fahndung
              {selectedInvestigations.size !== 1 ? "en" : ""} löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden und die
              Fahndungen werden auch aus Supabase gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading
                ? "Lösche..."
                : `${selectedInvestigations.size} löschen`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
