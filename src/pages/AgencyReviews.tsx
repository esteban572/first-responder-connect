// Agency Directory & Reviews
// Browse and review EMS agencies (organizations)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Search, Plus, Building2, Star, MapPin, Users, ExternalLink } from "lucide-react";
import { Organization, AGENCY_TYPES, SERVICE_AREAS, US_STATES } from "@/types/organization";
import { getPublicAgencies } from "@/lib/organizationService";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Link } from "react-router-dom";

const AgencyReviews = () => {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    loadAgencies();
  }, [stateFilter, typeFilter, serviceFilter, minRating]);

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const data = await getPublicAgencies({
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

  const getAgencyTypeLabel = (value?: string) => {
    return AGENCY_TYPES.find(t => t.value === value)?.label || value;
  };

  const getServiceAreaLabel = (value?: string) => {
    return SERVICE_AREAS.find(s => s.value === value)?.label || value;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">
                Agency Directory
              </h1>
              <p className="text-muted-foreground">
                Browse and review EMS agencies
              </p>
            </div>
            {!organization && (
              <Button onClick={() => navigate('/agency/setup')} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Agency</span>
              </Button>
            )}
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
                <Link
                  key={agency.id}
                  to={`/agencies/${agency.id}`}
                  className="block"
                >
                  <div className="feed-card p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {agency.logo_url ? (
                          <img
                            src={agency.logo_url}
                            alt={agency.name}
                            className="w-12 h-12 object-contain rounded-lg"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-primary" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg truncate">
                              {agency.name}
                            </h3>
                            {(agency.city || agency.state) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {[agency.city, agency.state].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Rating */}
                          {agency.review_count && agency.review_count > 0 ? (
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-lg">
                                  {agency.avg_overall?.toFixed(1)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {agency.review_count} review{agency.review_count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No reviews yet
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {agency.agency_type && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {getAgencyTypeLabel(agency.agency_type)}
                            </span>
                          )}
                          {agency.service_area && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              {getServiceAreaLabel(agency.service_area)}
                            </span>
                          )}
                          {agency.employee_count && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {agency.employee_count}
                            </span>
                          )}
                          {agency.is_verified && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                              Verified
                            </span>
                          )}
                        </div>

                        {/* Recommend percent */}
                        {agency.recommend_percent !== undefined && agency.review_count && agency.review_count > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {agency.recommend_percent}% would recommend
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
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
                  : "Be the first to create an agency"}
              </p>
              {hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/agency/setup')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Agency
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AgencyReviews;
