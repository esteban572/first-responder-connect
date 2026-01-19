import { Link } from "react-router-dom";
import { Agency, AGENCY_TYPES, SERVICE_AREAS } from "@/types/agency";
import { StarRating } from "@/components/ui/StarRating";
import { Building2, MapPin, Users, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgencyCardProps {
  agency: Agency;
  compact?: boolean;
}

export function AgencyCard({ agency, compact = false }: AgencyCardProps) {
  const agencyType = AGENCY_TYPES.find((t) => t.value === agency.agency_type);
  const serviceArea = SERVICE_AREAS.find((s) => s.value === agency.service_area);

  if (compact) {
    return (
      <Link
        to={`/agencies/${agency.id}`}
        className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg"
      >
        {agency.logo_url ? (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="w-12 h-12 object-contain rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{agency.name}</p>
          <p className="text-xs text-muted-foreground">
            {agency.city}, {agency.state}
          </p>
        </div>
        <div className="text-right">
          <StarRating rating={agency.avg_overall || 0} size="sm" />
          <p className="text-xs text-muted-foreground">
            {agency.review_count || 0} reviews
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/agencies/${agency.id}`}
      className="feed-card p-4 hover:shadow-lg transition-shadow block"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        {agency.logo_url ? (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="w-16 h-16 object-contain rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold line-clamp-1">{agency.name}</h3>
              {(agency.city || agency.state) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {agency.city && agency.state
                    ? `${agency.city}, ${agency.state}`
                    : agency.city || agency.state}
                </p>
              )}
            </div>
            {agency.is_verified && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                Verified
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {agencyType && (
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                {agencyType.label}
              </span>
            )}
            {serviceArea && (
              <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                {serviceArea.label}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <StarRating rating={agency.avg_overall || 0} size="sm" />
              <span className="font-medium">
                {agency.avg_overall ? agency.avg_overall.toFixed(1) : "N/A"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({agency.review_count || 0} reviews)
              </span>
            </div>
            {agency.recommend_percent !== null && agency.recommend_percent !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ThumbsUp className="h-3 w-3" />
                {agency.recommend_percent}% recommend
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
