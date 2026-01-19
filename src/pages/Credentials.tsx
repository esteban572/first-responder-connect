import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Award,
  Plus,
  Filter,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Credential, CredentialStatus, CREDENTIAL_CATEGORIES } from "@/types/credential";
import {
  getCredentials,
  deleteCredential,
  updateCredential,
  getCredentialCounts,
} from "@/lib/credentialService";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { CredentialForm } from "@/components/credentials/CredentialForm";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | CredentialStatus;
type FilterCategory = "all" | string;

const Credentials = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ valid: 0, expiring_soon: 0, expired: 0 });
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const [credentialsData, countsData] = await Promise.all([
        getCredentials(),
        getCredentialCounts(),
      ]);
      setCredentials(credentialsData);
      setCounts(countsData);
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteCredential(id);
      if (success) {
        setCredentials((prev) => prev.filter((c) => c.id !== id));
        toast.success("Credential deleted");
        loadCredentials(); // Reload to update counts
      } else {
        toast.error("Failed to delete credential");
      }
    } catch (error) {
      console.error("Error deleting credential:", error);
      toast.error("Failed to delete credential");
    }
  };

  const handleToggleVisibility = async (id: string, isPublic: boolean) => {
    try {
      const result = await updateCredential(id, { is_public: isPublic });
      if (result) {
        setCredentials((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_public: isPublic } : c))
        );
        toast.success(
          isPublic ? "Credential visible on showcase" : "Credential hidden from showcase"
        );
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCredential(null);
  };

  const handleSaved = () => {
    loadCredentials();
  };

  const filteredCredentials = credentials.filter((credential) => {
    // Status filter
    if (statusFilter !== "all" && credential.status !== statusFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all") {
      const typeCategory = credential.credential_type;
      // Check if the credential type matches the selected category
      const isInCategory = CREDENTIAL_CATEGORIES.some(
        (cat) =>
          cat.value === categoryFilter &&
          (credential.credential_type.includes(cat.value) ||
            categoryFilter === "Other")
      );

      // For simplicity, we check if the type ID is in the predefined types for that category
      const { CREDENTIAL_TYPES } = require("@/types/credential");
      const typesInCategory = CREDENTIAL_TYPES.filter(
        (t: { category: string }) => t.category === categoryFilter
      );
      const typeIds = typesInCategory.map((t: { id: string }) => t.id);

      if (!typeIds.includes(credential.credential_type)) {
        // Check if it's "Other" category and it's a custom type
        if (categoryFilter === "Other" && !typeIds.includes(credential.credential_type)) {
          // Allow custom types in "Other"
        } else if (categoryFilter !== "Other") {
          return false;
        }
      }
    }

    return true;
  });

  const totalCount = counts.valid + counts.expiring_soon + counts.expired;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">Credential Vault</h1>
              <p className="text-muted-foreground">
                Manage your certifications and credentials
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/credentials/showcase">
                <Button variant="outline" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Virtual ID</span>
                </Button>
              </Link>
              <Button
                onClick={() => setFormOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 md:px-0 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setStatusFilter(statusFilter === "valid" ? "all" : "valid")}
              className={cn(
                "feed-card p-4 text-center transition-all",
                statusFilter === "valid" && "ring-2 ring-green-500"
              )}
            >
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{counts.valid}</p>
              <p className="text-xs text-muted-foreground">Valid</p>
            </button>
            <button
              onClick={() =>
                setStatusFilter(statusFilter === "expiring_soon" ? "all" : "expiring_soon")
              }
              className={cn(
                "feed-card p-4 text-center transition-all",
                statusFilter === "expiring_soon" && "ring-2 ring-amber-500"
              )}
            >
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{counts.expiring_soon}</p>
              <p className="text-xs text-muted-foreground">Expiring</p>
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === "expired" ? "all" : "expired")}
              className={cn(
                "feed-card p-4 text-center transition-all",
                statusFilter === "expired" && "ring-2 ring-red-500"
              )}
            >
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{counts.expired}</p>
              <p className="text-xs text-muted-foreground">Expired</p>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 md:px-0 mb-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CREDENTIAL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(statusFilter !== "all" || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Credentials List */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading credentials...</p>
            </div>
          ) : filteredCredentials.length > 0 ? (
            <div className="space-y-4">
              {filteredCredentials.map((credential) => (
                <CredentialCard
                  key={credential.id}
                  credential={credential}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          ) : credentials.length === 0 ? (
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No credentials yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your certifications and licenses to keep track of expirations
              </p>
              <Button onClick={() => setFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Credential
              </Button>
            </div>
          ) : (
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No matching credentials</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Dialog */}
      <CredentialForm
        open={formOpen}
        onOpenChange={handleFormClose}
        credential={editingCredential}
        onSaved={handleSaved}
      />
    </AppLayout>
  );
};

export default Credentials;
