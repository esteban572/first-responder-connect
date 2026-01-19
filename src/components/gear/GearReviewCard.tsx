import { useState } from "react";
import { GearReview } from "@/types/gear";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Check, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface GearReviewCardProps {
  review: GearReview;
  onHelpful?: (reviewId: string) => void;
  onEdit?: (review: GearReview) => void;
  onDelete?: (reviewId: string) => void;
}

export function GearReviewCard({
  review,
  onHelpful,
  onEdit,
  onDelete,
}: GearReviewCardProps) {
  const { user } = useAuth();
  const isOwnReview = user?.id === review.user_id;

  return (
    <div className="feed-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.user?.avatar_url} />
            <AvatarFallback>
              {review.user?.full_name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{review.user?.full_name || "Anonymous"}</p>
            <p className="text-xs text-muted-foreground">
              {review.user?.role}
              {review.years_of_use && ` • Used for ${review.years_of_use}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          {isOwnReview && (
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

      {/* Pros and Cons */}
      {(review.pros?.length || review.cons?.length) && (
        <div className="grid grid-cols-2 gap-4 mb-3">
          {review.pros && review.pros.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1">Pros</p>
              <ul className="space-y-1">
                {review.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">Cons</p>
              <ul className="space-y-1">
                {review.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-1 text-sm">
                    <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Review text */}
      {review.review_text && (
        <p className="text-sm text-muted-foreground mb-3">{review.review_text}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Review image ${idx + 1}`}
              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
              onClick={() => window.open(img, "_blank")}
            />
          ))}
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
