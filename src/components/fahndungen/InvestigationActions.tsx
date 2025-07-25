// src/components/fahndungen/InvestigationActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Share2,
  Copy,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Archive,
} from "lucide-react";
import { api } from "~/trpc/react";
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
import { toast } from "sonner";

// Interface für tRPC Investigation
interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

interface InvestigationActionsProps {
  investigation: Investigation;
  userRole?: string;
  userPermissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
  };
  onAction?: () => void;
}

export default function InvestigationActions({
  investigation,
  userRole,
  userPermissions,
  onAction,
}: InvestigationActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // tRPC Mutations
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich gelöscht");
      setIsDeleteDialogOpen(false);
      onAction?.();
      router.push("/fahndungen");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  const publishMutation = api.post.publishInvestigation.useMutation({
    onSuccess: (data) => {
      const action = data.status === "published" ? "veröffentlicht" : "unveröffentlicht";
      toast.success(`Fahndung erfolgreich ${action}`);
      onAction?.();
    },
    onError: (error) => {
      toast.error(`Fehler beim Veröffentlichen: ${error.message}`);
    },
  });

  const isPublished = investigation.status === "published";
  const canEdit = userPermissions?.canEdit ?? false;
  const canDelete = userPermissions?.canDelete ?? false;
  const canPublish = userPermissions?.canPublish ?? false;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync({ id: investigation.id });
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await publishMutation.mutateAsync({
        id: investigation.id,
        publish: !isPublished,
      });
    } catch (error) {
      console.error("Fehler beim Veröffentlichen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/fahndungen/${investigation.id}/bearbeiten`);
  };

  const handleView = () => {
    router.push(`/fahndungen/${investigation.id}`);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/fahndungen/${investigation.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link kopiert");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/fahndungen/${investigation.id}`;
    if (navigator.share) {
      await navigator.share({
        title: investigation.title,
        url: url,
      });
    } else {
      await handleCopyLink();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Veröffentlichungs-Status */}
        {canPublish && (
          <Button
            variant={isPublished ? "default" : "outline"}
            size="sm"
            onClick={handlePublish}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isPublished ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Veröffentlicht</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Unveröffentlicht</span>
              </>
            )}
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
            <DropdownMenuItem onClick={handleView}>
              <Eye className="mr-2 h-4 w-4" />
              Anzeigen
            </DropdownMenuItem>

            {/* Bearbeiten */}
            {canEdit && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Teilen */}
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Teilen
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Link kopieren
            </DropdownMenuItem>

            {/* Admin-Aktionen */}
            {userRole === "admin" && (
              <>
                <DropdownMenuSeparator />
                
                {/* Archivieren/Entarchivieren */}
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivieren
                </DropdownMenuItem>

                {/* Löschen */}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lösch-Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Fahndung löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie die Fahndung &quot;{investigation.title}&quot; löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Lösche..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 