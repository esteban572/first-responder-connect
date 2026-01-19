import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  Users,
  Plus,
  ThumbsUp,
  Star,
} from "lucide-react";
import {
  Organization,
  OrganizationReview,
  AGENCY_TYPES,
  SERVICE_AREAS,
} from "@/types/organization";
import {
  getPublicAgency,
  getOrganizationReviews,
  toggleReviewHelpful,
  deleteOrganizationReview,
  hasUserReviewedOrganization,
  getUserReviewForOrganization,
  getOrganizationRatingDistribution,
} from "@/lib/organizationService";
import { StarRating } from "@/components/ui/StarRating";
import { AgencyReviewCard } from "@/components/agency/AgencyReviewCard";
import { AgencyReviewForm } from "@/components/agency/AgencyReviewForm";
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

// Rating categories for display
const RATING_CATEGORIES = [
  { key: 'rating_overall', label: 'Overall' },
  { key: 'rating_culture', label: 'Culture' },
  { key: 'rating_compensation', label: 'Compensation' },
  { key: 'rating_worklife', label: 'Work-Life Balance' },
  { key: 'rating_equipment', label: 'Equipment' },
  { key: 'rating_training', label: 'Training' },
  { key: 'rating_management', label: 'Management' },
];

const AgencyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<Organization | null>(null);
  const [reviews, setReviews] = useState<OrganizationReview[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<OrganizationReview | null>(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<OrganizationReview | null>(null);
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
      const [agencyData, reviewsData, reviewed, existingReview, distribution] =
        await Promise.all([
          getPublicAgency(id),
          getOrganizationReviews(id),
          hasUserReviewedOrganization(id),
          getUserReviewForOrganization(id),
          getOrganizationRatingDistribution(id),
        ]);
      setAgency(agencyData);
      setReviews(reviewsData);
      setHasReviewed(reviewed);
      setUserReview(existingReview);
      setRatingDistribution(distribution);
    } catch (error) {
      console.error("Error loading agency detail:", error);
      toast.error("Failed to load agency details");
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    const success = await toggleReviewHelpful(reviewId);
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

  const handleEditReview = (review: OrganizationReview) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    const success = await deleteOrganizationReview(deleteReviewId);
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

  const agencyType = agency
    ? AGENCY_TYPES.find((t) => t.value === agency.agency_type)
    : null;
  const serviceArea = agency
    ? SERVICE_AREAS.find((s) => s.value === agency.service_area)
    : null;

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

  if (!agency) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-4 md:py-6">
          <div className="feed-card p-8 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Agency not found</h2>
            <Link to="/agencies">
              <Button variant="outline">Back to Agency Reviews</Button>
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
            to="/agencies"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agency Reviews
          </Link>
        </div>

        {/* Agency Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="feed-card p-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {agency.logo_url ? (
                <img
                  src={agency.logo_url}
                  alt={agency.name}
                  className="w-20 h-20 object-contain rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{agency.name}</h1>
                    {(agency.city || agency.state) && (
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {agency.city && agency.state
                          ? `${agency.city}, ${agency.state}`
                          : agency.city || agency.state}
                      </p>
                    )}
                  </div>
                  {agency.is_verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {agencyType && (
                    <span className="px-2 py-1 bg-muted text-sm rounded-full">
                      {agencyType.label}
                    </span>
                  )}
                  {serviceArea && (
                    <span className="px-2 py-1 bg-muted text-sm rounded-full">
                      {serviceArea.label}
                    </span>
                  )}
                  {agency.employee_count && (
                    <span className="px-2 py-1 bg-muted text-sm rounded-full flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {agency.employee_count}
                    </span>
                  )}
                </div>

                {/* Website */}
                {agency.website_url && (
                  <a
                    href={agency.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Rating Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <StarRating rating={agency.avg_overall || 0} size="md" />
                  </div>
                  <p className="text-2xl font-bold">
                    {agency.avg_overall ? agency.avg_overall.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {agency.review_count || 0} reviews
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {agency.recommend_percent !== null &&
                    agency.recommend_percent !== undefined
                      ? `${agency.recommend_percent}%`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Recommend</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {agency.avg_culture ? agency.avg_culture.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Culture</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {agency.avg_worklife
                      ? agency.avg_worklife.toFixed(1)
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Work-Life</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        {reviews.length > 0 && (
          <div className="px-4 md:px-0 mb-6">
            <div className="feed-card p-4">
              <h3 className="font-semibold mb-3">Rating Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Star distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDistribution[star] || 0;
                    const percentage =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm w-12">{star} star</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Category averages */}
                <div className="space-y-2">
                  {RATING_CATEGORIES.slice(1).map((cat) => {
                    const avg = agency[
                      `avg_${cat.key.replace("rating_", "")}` as keyof Organization
                    ] as number | undefined;
                    return (
                      <div
                        key={cat.key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          <StarRating rating={avg || 0} size="sm" />
                          <span className="text-sm font-medium w-8">
                            {avg ? avg.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <AgencyReviewCard
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
                Be the first to anonymously review this agency
              </p>
              <Button onClick={() => setReviewFormOpen(true)}>
                Write Review
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Dialog */}
      <AgencyReviewForm
        open={reviewFormOpen}
        onOpenChange={(open) => {
          setReviewFormOpen(open);
          if (!open) setEditingReview(null);
        }}
        agencyId={agency.id}
        agencyName={agency.name}
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

export default AgencyDetail;
