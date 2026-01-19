import { useState } from "react";
import { AgencyReview, RATING_CATEGORIES } from "@/types/agency";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit,
  Trash2,
  Briefcase,
  Clock,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AgencyReviewCardProps {
  review: AgencyReview;
  onHelpful?: (reviewId: string) => void;
  onEdit?: (review: AgencyReview) => void;
  onDelete?: (reviewId: string) => void;
}

export function AgencyReviewCard({
  review,
  onHelpful,
  onEdit,
  onDelete,
}: AgencyReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate average of all ratings
  const ratings = [
    review.rating_overall,
    review.rating_culture,
    review.rating_compensation,
    review.rating_worklife,
    review.rating_equipment,
    review.rating_training,
    review.rating_management,
  ].filter((r) => r !== null && r !== undefined) as number[];

  return (
    <div className="feed-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Anonymous avatar */}
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">
                {review.employment_status === "current"
                  ? "Current Employee"
                  : "Former Employee"}
              </p>
              {review.would_recommend && (
                <span className="text-xs text-green-600 font-medium">
                  Recommends
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              {review.job_title && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {review.job_title}
                </span>
              )}
              {review.years_at_agency && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {review.years_at_agency}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating_overall} size="sm" />
          {review.is_own_review && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(review)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(review.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold mb-2">{review.title}</h4>
      )}

      {/* Rating breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {RATING_CATEGORIES.slice(1).map((cat) => {
          const rating = review[cat.key as keyof AgencyReview] as number | undefined;
          if (rating === null || rating === undefined) return null;
          return (
            <div key={cat.key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat.label}</span>
              <StarRating rating={rating} size="sm" />
            </div>
          );
        })}
      </div>

      {/* Pros and Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-2 gap-4 mb-3">
          {review.pros && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1">Pros</p>
              <p className="text-sm text-muted-foreground">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">Cons</p>
              <p className="text-sm text-muted-foreground">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Review text */}
      {review.review_text && (
        <div className="mb-3">
          <p
            className={cn(
              "text-sm text-muted-foreground",
              !expanded && "line-clamp-3"
            )}
          >
            {review.review_text}
          </p>
          {review.review_text.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-primary hover:underline mt-1"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Advice to management */}
      {review.advice_to_management && (
        <div className="mb-3 p-3 bg-muted rounded-lg">
          <p className="text-xs font-semibold mb-1">Advice to Management</p>
          <p className="text-sm text-muted-foreground">
            {review.advice_to_management}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1 text-xs",
            review.user_voted_helpful && "text-primary"
          )}
          onClick={() => onHelpful?.(review.id)}
        >
          <ThumbsUp
            className={cn(
              "h-4 w-4",
              review.user_voted_helpful && "fill-primary"
            )}
          />
          Helpful ({review.helpful_count})
        </Button>
      </div>
    </div>
  );
}
