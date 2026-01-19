import { useState } from "react";
import { Credential, getCredentialTypeInfo } from "@/types/credential";
import { ExpirationBadge } from "./ExpirationBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Award,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CredentialCardProps {
  credential: Credential;
  onEdit?: (credential: Credential) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
  readonly?: boolean;
  compact?: boolean;
}

export function CredentialCard({
  credential,
  onEdit,
  onDelete,
  onToggleVisibility,
  readonly = false,
  compact = false,
}: CredentialCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const typeInfo = getCredentialTypeInfo(credential.credential_type);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = () => {
    if (credential.document_url) {
      window.open(credential.document_url, "_blank");
    }
  };

  const handleDelete = () => {
    onDelete?.(credential.id);
    setDeleteDialogOpen(false);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors",
          credential.document_url && "cursor-pointer"
        )}
        onClick={credential.document_url ? handleDownload : undefined}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{credential.credential_name}</p>
            <p className="text-xs text-muted-foreground">
              {typeInfo?.category || credential.credential_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExpirationBadge
            status={credential.status}
            expirationDate={credential.expiration_date}
            size="sm"
          />
          {credential.expiration_date && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {formatDate(credential.expiration_date)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="feed-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{credential.credential_name}</h3>
                <ExpirationBadge
                  status={credential.status}
                  size="sm"
                />
                {credential.is_verified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {typeInfo?.category || credential.credential_type}
              </p>
            </div>
          </div>

          {!readonly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(credential)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {credential.document_url && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    View Document
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    onToggleVisibility?.(credential.id, !credential.is_public)
                  }
                >
                  {credential.is_public ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide from Showcase
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show on Showcase
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {credential.issuing_organization && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{credential.issuing_organization}</span>
            </div>
          )}
          {credential.credential_number && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span>{credential.credential_number}</span>
            </div>
          )}
          {credential.issue_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Issued: {formatDate(credential.issue_date)}</span>
            </div>
          )}
          {credential.expiration_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expires: {formatDate(credential.expiration_date)}</span>
            </div>
          )}
        </div>

        {credential.notes && (
          <p className="mt-3 text-sm text-muted-foreground">{credential.notes}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {credential.document_url && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Document attached
              </span>
            )}
            {!credential.is_public && (
              <span className="flex items-center gap-1">
                <EyeOff className="h-3 w-3" />
                Hidden from showcase
              </span>
            )}
          </div>
          {credential.document_url && !readonly && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              View
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete credential?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{credential.credential_name}" and any
              attached documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
