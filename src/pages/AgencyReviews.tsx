import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Plus, Building2, Star } from "lucide-react";
import { Agency, AGENCY_TYPES, SERVICE_AREAS, US_STATES } from "@/types/agency";
import { getAgencies } from "@/lib/agencyService";
import { AgencyCard } from "@/components/agency/AgencyCard";
import { AddAgencyForm } from "@/components/agency/AddAgencyForm";
import { StarRating } from "@/components/ui/StarRating";

const AgencyReviews = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [addAgencyOpen, setAddAgencyOpen] = useState(false);

  useEffect(() => {
    loadAgencies();
  }, [stateFilter, typeFilter, serviceFilter, minRating]);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const data = await getAgencies({
        state: stateFilter !== "all" ? stateFilter : undefined,
        agency_type: typeFilter !== "all" ? typeFilter : undefined,
        service_area: serviceFilter !== "all" ? serviceFilter : undefined,
        search: search || undefined,
        min_rating: minRating > 0 ? minRating : undefined,
      });
      setAgencies(data);
    } catch (error) {
      console.error("Error loading agencies:", error);
      toast.error("Failed to load agencies");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAgencies();
  };

  const handleAgencySaved = () => {
    loadAgencies();
  };

  const clearFilters = () => {
    setStateFilter("all");
    setTypeFilter("all");
    setServiceFilter("all");
    setMinRating(0);
    setSearch("");
  };

  const hasFilters =
    stateFilter !== "all" ||
    typeFilter !== "all" ||
    serviceFilter !== "all" ||
    minRating > 0 ||
    search;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">
                Agency Reviews
              </h1>
              <p className="text-muted-foreground">
                Anonymous reviews by EMS professionals
              </p>
            </div>
            <Button onClick={() => setAddAgencyOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Agency</span>
            </Button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agencies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {AGENCY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {SERVICE_AREAS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={minRating.toString()}
              onValueChange={(v) => setMinRating(parseInt(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading agencies...</p>
            </div>
          ) : agencies.length > 0 ? (
            <div className="space-y-4">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          ) : (
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No agencies found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasFilters
                  ? "Try adjusting your filters"
                  : "Be the first to add an agency"}
              </p>
              {hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setAddAgencyOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Agency
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Agency Dialog */}
      <AddAgencyForm
        open={addAgencyOpen}
        onOpenChange={setAddAgencyOpen}
        onSaved={handleAgencySaved}
      />
    </AppLayout>
  );
};

export default AgencyReviews;
