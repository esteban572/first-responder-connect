import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  Plus,
  Star,
} from "lucide-react";
import { GearItem, GearReview, GEAR_CATEGORIES } from "@/types/gear";
import {
  getGearItem,
  getGearReviews,
  toggleGearReviewHelpful,
  deleteGearReview,
  hasUserReviewedItem,
  getUserReviewForItem,
} from "@/lib/gearService";
import { StarRating } from "@/components/ui/StarRating";
import { GearReviewCard } from "@/components/gear/GearReviewCard";
import { GearReviewForm } from "@/components/gear/GearReviewForm";
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

const GearDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<GearItem | null>(null);
  const [reviews, setReviews] = useState<GearReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<GearReview | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<GearReview | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [itemData, reviewsData, reviewed, existingReview] = await Promise.all([
        getGearItem(id),
        getGearReviews(id),
        hasUserReviewedItem(id),
        getUserReviewForItem(id),
      ]);
      setItem(itemData);
      setReviews(reviewsData);
      setHasReviewed(reviewed);
      setUserReview(existingReview);
    } catch (error) {
      console.error("Error loading gear detail:", error);
      toast.error("Failed to load gear details");
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    const success = await toggleGearReviewHelpful(reviewId);
    if (success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                user_voted_helpful: !r.user_voted_helpful,
                helpful_count: r.user_voted_helpful
                  ? r.helpful_count - 1
                  : r.helpful_count + 1,
              }
            : r
        )
      );
    }
  };

  const handleEditReview = (review: GearReview) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    const success = await deleteGearReview(deleteReviewId);
    if (success) {
      toast.success("Review deleted");
      loadData();
    } else {
      toast.error("Failed to delete review");
    }
    setDeleteReviewId(null);
  };

  const handleReviewSaved = () => {
    loadData();
    setEditingReview(null);
  };

  const handleOpenReviewForm = () => {
    if (hasReviewed && userReview) {
      setEditingReview(userReview);
    }
    setReviewFormOpen(true);
  };

  const category = item
    ? GEAR_CATEGORIES.find((c) => c.id === item.category_id)
    : null;

  // Calculate rating distribution
  const ratingDistribution = reviews.reduce(
    (acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          <div className="feed-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!item) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          <div className="feed-card p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Gear not found</h2>
            <Link to="/gear">
              <Button variant="outline">Back to Gear Reviews</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        {/* Back Link */}
        <div className="px-4 md:px-0 mb-4">
          <Link
            to="/gear"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gear Reviews
          </Link>
        </div>

        {/* Item Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="feed-card overflow-hidden">
            <div className="md:flex">
              {/* Image */}
              <div className="md:w-1/3 aspect-square md:aspect-auto bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center min-h-[200px]">
                    <Package className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-2/3 p-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {category?.name || item.category_id}
                </p>
                <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
                {item.brand && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {item.brand} {item.model && `- ${item.model}`}
                  </p>
                )}

                {/* Rating Summary */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={item.avg_rating || 0} size="lg" />
                    <span className="text-2xl font-bold">
                      {item.avg_rating ? item.avg_rating.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {item.review_count || 0} reviews
                  </span>
                </div>

                {/* Price & Link */}
                <div className="flex items-center gap-4">
                  {item.price_range && (
                    <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">
                      {item.price_range}
                    </span>
                  )}
                  {item.website_url && (
                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <p className="mt-4 text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        {reviews.length > 0 && (
          <div className="px-4 md:px-0 mb-6">
            <div className="feed-card p-4">
              <h3 className="font-semibold mb-3">Rating Breakdown</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-12">{star} star</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="px-4 md:px-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Reviews ({reviews.length})
            </h2>
            <Button onClick={handleOpenReviewForm} className="gap-2">
              {hasReviewed ? (
                <>Edit Your Review</>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Write Review
                </>
              )}
            </Button>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <GearReviewCard
                  key={review.id}
                  review={review}
                  onHelpful={handleHelpful}
                  onEdit={handleEditReview}
                  onDelete={setDeleteReviewId}
                />
              ))}
            </div>
          ) : (
            <div className="feed-card p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No reviews yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to review this gear
              </p>
              <Button onClick={() => setReviewFormOpen(true)}>
                Write Review
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Dialog */}
      <GearReviewForm
        open={reviewFormOpen}
        onOpenChange={(open) => {
          setReviewFormOpen(open);
          if (!open) setEditingReview(null);
        }}
        gearItemId={item.id}
        gearItemName={item.name}
        review={editingReview}
        onSaved={handleReviewSaved}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteReviewId !== null}
        onOpenChange={(open) => !open && setDeleteReviewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your review. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default GearDetail;
