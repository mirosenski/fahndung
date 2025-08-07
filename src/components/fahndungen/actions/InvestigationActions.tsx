// src/components/fahndungen/actions/InvestigationActions.tsx
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
import { toast } from "~/lib/toast";
import { getFahndungUrl, getFahndungEditUrl } from "~/lib/seo";

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
  userRole: _userRole,
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
      onAction?.();
      router.push("/fahndungen");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Fahndung");
    },
  });

  const publishMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndung erfolgreich veröffentlicht");
      onAction?.();
    },
    onError: () => {
      toast.error("Fehler beim Veröffentlichen der Fahndung");
    },
  });

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync({ id: investigation.id });
    } catch {
      // Error wird bereits in onError behandelt
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await publishMutation.mutateAsync({
        id: investigation.id,
        status: "published",
      });
    } catch {
      // Error wird bereits in onError behandelt
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // 🚀 PREFETCH FÜR SCHNELLERE NAVIGATION
    const targetUrl = getFahndungEditUrl(investigation.title, investigation.case_number);
    router.prefetch(targetUrl);
    
    // 🚀 SOFORTIGE NAVIGATION
    router.push(targetUrl);
  };

  const handleView = () => {
    // 🚀 PREFETCH FÜR SCHNELLERE NAVIGATION
    const targetUrl = getFahndungUrl(investigation.title, investigation.case_number);
    router.prefetch(targetUrl);
    
    // 🚀 SOFORTIGE NAVIGATION
    router.push(targetUrl);
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}${getFahndungUrl(
        investigation.title,
        investigation.case_number,
      )}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link in Zwischenablage kopiert");
    } catch {
      toast.error("Fehler beim Kopieren des Links");
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}${getFahndungUrl(
        investigation.title,
        investigation.case_number,
      )}`;
      if (navigator.share) {
        await navigator.share({
          title: investigation.title,
          text: investigation.short_description,
          url: url,
        });
      } else {
        await handleCopyLink();
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const canEdit = userPermissions?.canEdit ?? true;
  const canDelete = userPermissions?.canDelete ?? true;
  const canPublish = userPermissions?.canPublish ?? true;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            Anzeigen
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Link kopieren
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Teilen
          </DropdownMenuItem>

          {investigation.status === "draft" && canPublish && (
            <DropdownMenuItem onClick={handlePublish}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Veröffentlichen
            </DropdownMenuItem>
          )}

          {investigation.status === "published" && canPublish && (
            <DropdownMenuItem
              onClick={() => {
                void publishMutation.mutateAsync({
                  id: investigation.id,
                  status: "draft",
                });
              }}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Zurückziehen
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canDelete && (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fahndung löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie die Fahndung &quot;{investigation.title}
              &quot; löschen möchten? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Löscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
