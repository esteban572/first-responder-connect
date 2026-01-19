import { Link } from "react-router-dom";
import { GearItem, GEAR_CATEGORIES } from "@/types/gear";
import { StarRating } from "@/components/ui/StarRating";
import { Package, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface GearItemCardProps {
  item: GearItem;
  compact?: boolean;
}

export function GearItemCard({ item, compact = false }: GearItemCardProps) {
  const category = GEAR_CATEGORIES.find((c) => c.id === item.category_id);

  if (compact) {
    return (
      <Link
        to={`/gear/${item.id}`}
        className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg"
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.brand}</p>
        </div>
        <div className="text-right">
          <StarRating rating={item.avg_rating || 0} size="sm" />
          <p className="text-xs text-muted-foreground">
            {item.review_count || 0} reviews
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/gear/${item.id}`}
      className="feed-card overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {/* Price badge */}
        {item.price_range && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {item.price_range}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-muted-foreground mb-1">
          {category?.name || item.category_id}
        </p>

        {/* Name & Brand */}
        <h3 className="font-semibold mb-1 line-clamp-1">{item.name}</h3>
        {item.brand && (
          <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={item.avg_rating || 0} size="sm" />
            <span className="text-sm font-medium">
              {item.avg_rating ? item.avg_rating.toFixed(1) : "N/A"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {item.review_count || 0} reviews
          </span>
        </div>
      </div>
    </Link>
  );
}
