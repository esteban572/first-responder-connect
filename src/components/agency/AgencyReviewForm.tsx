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
import { StarRating } from "@/components/ui/StarRating";
import { toast } from "sonner";
import { Shield, AlertTriangle } from "lucide-react";
import {
  AgencyReview,
  AgencyReviewCreate,
  EMPLOYMENT_STATUSES,
  JOB_TITLES,
  YEARS_AT_AGENCY,
  RATING_CATEGORIES,
} from "@/types/agency";
import { createAgencyReview, updateAgencyReview } from "@/lib/agencyService";

interface AgencyReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencyId: string;
  agencyName: string;
  review?: AgencyReview | null;
  onSaved: () => void;
}

export function AgencyReviewForm({
  open,
  onOpenChange,
  agencyId,
  agencyName,
  review,
  onSaved,
}: AgencyReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgencyReviewCreate>({
    agency_id: agencyId,
    rating_overall: 0,
    rating_culture: undefined,
    rating_compensation: undefined,
    rating_worklife: undefined,
    rating_equipment: undefined,
    rating_training: undefined,
    rating_management: undefined,
    title: "",
    pros: "",
    cons: "",
    review_text: "",
    advice_to_management: "",
    employment_status: undefined,
    job_title: "",
    years_at_agency: "",
    would_recommend: undefined,
  });

  useEffect(() => {
    if (open) {
      if (review) {
        setFormData({
          agency_id: review.agency_id,
          rating_overall: review.rating_overall,
          rating_culture: review.rating_culture,
          rating_compensation: review.rating_compensation,
          rating_worklife: review.rating_worklife,
          rating_equipment: review.rating_equipment,
          rating_training: review.rating_training,
          rating_management: review.rating_management,
          title: review.title || "",
          pros: review.pros || "",
          cons: review.cons || "",
          review_text: review.review_text || "",
          advice_to_management: review.advice_to_management || "",
          employment_status: review.employment_status,
          job_title: review.job_title || "",
          years_at_agency: review.years_at_agency || "",
          would_recommend: review.would_recommend,
        });
      } else {
        setFormData({
          agency_id: agencyId,
          rating_overall: 0,
          rating_culture: undefined,
          rating_compensation: undefined,
          rating_worklife: undefined,
          rating_equipment: undefined,
          rating_training: undefined,
          rating_management: undefined,
          title: "",
          pros: "",
          cons: "",
          review_text: "",
          advice_to_management: "",
          employment_status: undefined,
          job_title: "",
          years_at_agency: "",
          would_recommend: undefined,
        });
      }
    }
  }, [open, review, agencyId]);

  const handleRatingChange = (key: string, value: number) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating_overall === 0) {
      toast.error("Please select an overall rating");
      return;
    }

    if (!formData.employment_status) {
      toast.error("Please select your employment status");
      return;
    }

    setLoading(true);
    try {
      if (review) {
        const result = await updateAgencyReview(review.id, formData);
        if (result) {
          toast.success("Review updated");
          onSaved();
          onOpenChange(false);
        } else {
          toast.error("Failed to update review");
        }
      } else {
        const result = await createAgencyReview(formData);
        if (result) {
          toast.success("Review submitted anonymously");
          onSaved();
          onOpenChange(false);
        } else {
          toast.error("Failed to submit review");
        }
      }
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {review ? "Edit Review" : `Review ${agencyName}`}
          </DialogTitle>
        </DialogHeader>

        {/* Anonymous notice */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg mb-4">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Your review is anonymous</p>
            <p className="text-blue-700">
              Your name and identity will not be shown with this review.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employment Status */}
          <div className="space-y-2">
            <Label>Employment Status *</Label>
            <Select
              value={formData.employment_status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  employment_status: value as "current" | "former",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Title */}
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Select
              value={formData.job_title}
              onValueChange={(value) =>
                setFormData({ ...formData, job_title: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TITLES.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Years at Agency */}
          <div className="space-y-2">
            <Label>Time at Agency</Label>
            <Select
              value={formData.years_at_agency}
              onValueChange={(value) =>
                setFormData({ ...formData, years_at_agency: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {YEARS_AT_AGENCY.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={formData.rating_overall}
                size="lg"
                interactive
                onChange={(rating) => handleRatingChange("rating_overall", rating)}
              />
              <span className="text-sm text-muted-foreground">
                {formData.rating_overall > 0
                  ? `${formData.rating_overall} stars`
                  : "Select rating"}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Rate specific areas (optional)</p>
            {RATING_CATEGORIES.slice(1).map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-sm">{cat.label}</span>
                <StarRating
                  rating={(formData[cat.key as keyof AgencyReviewCreate] as number) || 0}
                  size="sm"
                  interactive
                  onChange={(rating) => handleRatingChange(cat.key, rating)}
                />
              </div>
            ))}
          </div>

          {/* Would Recommend */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-sm">Would you recommend?</p>
              <p className="text-xs text-muted-foreground">
                Would you recommend working here?
              </p>
            </div>
            <Switch
              checked={formData.would_recommend || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, would_recommend: checked })
              }
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <Label htmlFor="pros">Pros</Label>
            <Textarea
              id="pros"
              placeholder="What did you like about working here?"
              value={formData.pros}
              onChange={(e) =>
                setFormData({ ...formData, pros: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <Label htmlFor="cons">Cons</Label>
            <Textarea
              id="cons"
              placeholder="What could be improved?"
              value={formData.cons}
              onChange={(e) =>
                setFormData({ ...formData, cons: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review_text">Detailed Review</Label>
            <Textarea
              id="review_text"
              placeholder="Share your experience working at this agency..."
              value={formData.review_text}
              onChange={(e) =>
                setFormData({ ...formData, review_text: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          {/* Advice to Management */}
          <div className="space-y-2">
            <Label htmlFor="advice">Advice to Management</Label>
            <Textarea
              id="advice"
              placeholder="What would you tell management?"
              value={formData.advice_to_management}
              onChange={(e) =>
                setFormData({ ...formData, advice_to_management: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Please keep your review factual and professional. Avoid sharing
              confidential information or making personal attacks.
            </p>
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
                : review
                  ? "Update Review"
                  : "Submit Anonymously"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
