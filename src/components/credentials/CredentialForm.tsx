import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Credential,
  CredentialCreate,
  CREDENTIAL_TYPES,
  CREDENTIAL_CATEGORIES,
  CredentialCategory,
  getCredentialTypesByCategory,
} from "@/types/credential";
import {
  createCredential,
  updateCredential,
  uploadCredentialDocument,
  deleteCredentialDocument,
} from "@/lib/credentialService";
import { CredentialUpload } from "./CredentialUpload";

interface CredentialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credential?: Credential | null;
  onSaved: () => void;
}

export function CredentialForm({
  open,
  onOpenChange,
  credential,
  onSaved,
}: CredentialFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CredentialCategory | "">("");
  const [formData, setFormData] = useState<CredentialCreate>({
    credential_type: "",
    credential_name: "",
    issuing_organization: "",
    issue_date: "",
    expiration_date: "",
    credential_number: "",
    document_url: "",
    document_path: "",
    notes: "",
    is_public: true,
    notification_days: 90,
  });

  useEffect(() => {
    if (open) {
      if (credential) {
        // Find the category for the credential type
        const typeInfo = CREDENTIAL_TYPES.find(
          (t) => t.id === credential.credential_type
        );
        setSelectedCategory(typeInfo?.category || "Other");

        setFormData({
          credential_type: credential.credential_type,
          credential_name: credential.credential_name,
          issuing_organization: credential.issuing_organization || "",
          issue_date: credential.issue_date || "",
          expiration_date: credential.expiration_date || "",
          credential_number: credential.credential_number || "",
          document_url: credential.document_url || "",
          document_path: credential.document_path || "",
          notes: credential.notes || "",
          is_public: credential.is_public,
          notification_days: credential.notification_days,
        });
      } else {
        setSelectedCategory("");
        setFormData({
          credential_type: "",
          credential_name: "",
          issuing_organization: "",
          issue_date: "",
          expiration_date: "",
          credential_number: "",
          document_url: "",
          document_path: "",
          notes: "",
          is_public: true,
          notification_days: 90,
        });
      }
    }
  }, [credential, open]);

  const handleCredentialTypeChange = (typeId: string) => {
    const typeInfo = CREDENTIAL_TYPES.find((t) => t.id === typeId);
    setFormData({
      ...formData,
      credential_type: typeId,
      credential_name: typeInfo?.name || "",
    });
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    const result = await uploadCredentialDocument(file, user.id);
    if (result) {
      setFormData({
        ...formData,
        document_url: result.url,
        document_path: result.path,
      });
      toast.success("Document uploaded");
    } else {
      toast.error("Failed to upload document");
    }
  };

  const handleRemoveDocument = async () => {
    if (formData.document_path) {
      await deleteCredentialDocument(formData.document_path);
    }
    setFormData({
      ...formData,
      document_url: "",
      document_path: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.credential_type || !formData.credential_name) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      if (credential) {
        const result = await updateCredential(credential.id, formData);
        if (result) {
          toast.success("Credential updated");
          onSaved();
          onOpenChange(false);
        } else {
          toast.error("Failed to update credential");
        }
      } else {
        const result = await createCredential(formData);
        if (result) {
          toast.success("Credential added");
          onSaved();
          onOpenChange(false);
        } else {
          toast.error("Failed to add credential");
        }
      }
    } catch (error) {
      console.error("Error saving credential:", error);
      toast.error("Failed to save credential");
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = selectedCategory
    ? getCredentialTypesByCategory(selectedCategory)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {credential ? "Edit Credential" : "Add Credential"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value as CredentialCategory);
                setFormData({
                  ...formData,
                  credential_type: "",
                  credential_name: "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CREDENTIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Credential Type Selection */}
          {selectedCategory && selectedCategory !== "Other" && (
            <div className="space-y-2">
              <Label>Credential Type *</Label>
              <Select
                value={formData.credential_type}
                onValueChange={handleCredentialTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a credential type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Credential Name (for Other category or custom selection) */}
          {(selectedCategory === "Other" ||
            formData.credential_type === "custom") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="credential_type">Credential Type *</Label>
                <Input
                  id="credential_type"
                  placeholder="e.g., CPR, First Aid"
                  value={
                    formData.credential_type === "custom"
                      ? ""
                      : formData.credential_type
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credential_type: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credential_name">Credential Name *</Label>
                <Input
                  id="credential_name"
                  placeholder="e.g., CPR/AED Certification"
                  value={formData.credential_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credential_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </>
          )}

          {/* Show credential name for predefined types */}
          {formData.credential_type &&
            formData.credential_type !== "custom" &&
            selectedCategory !== "Other" && (
              <div className="space-y-2">
                <Label htmlFor="credential_name">Credential Name</Label>
                <Input
                  id="credential_name"
                  value={formData.credential_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credential_name: e.target.value,
                    })
                  }
                />
              </div>
            )}

          {/* Issuing Organization */}
          <div className="space-y-2">
            <Label htmlFor="issuing_organization">Issuing Organization</Label>
            <Input
              id="issuing_organization"
              placeholder="e.g., American Heart Association"
              value={formData.issuing_organization}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issuing_organization: e.target.value,
                })
              }
            />
          </div>

          {/* Credential Number */}
          <div className="space-y-2">
            <Label htmlFor="credential_number">Credential/License Number</Label>
            <Input
              id="credential_number"
              placeholder="e.g., 123456789"
              value={formData.credential_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credential_number: e.target.value,
                })
              }
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* Notification Days */}
          <div className="space-y-2">
            <Label htmlFor="notification_days">Notify me before expiration</Label>
            <Select
              value={String(formData.notification_days)}
              onValueChange={(value) =>
                setFormData({ ...formData, notification_days: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="120">120 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label>Document</Label>
            <CredentialUpload
              onUpload={handleUpload}
              currentDocumentUrl={formData.document_url || undefined}
              onRemove={handleRemoveDocument}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-sm">Show on Showcase</p>
              <p className="text-xs text-muted-foreground">
                {formData.is_public
                  ? "Others can see this credential"
                  : "Only you can see this"}
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_public: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : credential
                  ? "Update"
                  : "Add Credential"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
