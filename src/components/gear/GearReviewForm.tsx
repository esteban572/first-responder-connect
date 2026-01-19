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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "@/components/ui/StarRating";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { GearReview, GearReviewCreate, YEARS_OF_USE } from "@/types/gear";
import { createGearReview, updateGearReview } from "@/lib/gearService";

interface GearReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gearItemId: string;
  gearItemName: string;
  review?: GearReview | null;
  onSaved: () => void;
}

export function GearReviewForm({
  open,
  onOpenChange,
  gearItemId,
  gearItemName,
  review,
  onSaved,
}: GearReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GearReviewCreate>({
    gear_item_id: gearItemId,
    rating: 0,
    title: "",
    pros: [],
    cons: [],
    review_text: "",
    years_of_use: "",
  });
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");

  useEffect(() => {
    if (open) {
      if (review) {
        setFormData({
          gear_item_id: review.gear_item_id,
          rating: review.rating,
          title: review.title || "",
          pros: review.pros || [],
          cons: review.cons || [],
          review_text: review.review_text || "",
          years_of_use: review.years_of_use || "",
        });
      } else {
        setFormData({
          gear_item_id: gearItemId,
          rating: 0,
          title: "",
          pros: [],
          cons: [],
          review_text: "",
          years_of_use: "",
        });
      }
      setNewPro("");
      setNewCon("");
    }
  }, [open, review, gearItemId]);

  const addPro = () => {
    if (newPro.trim()) {
      setFormData({
        ...formData,
        pros: [...(formData.pros || []), newPro.trim()],
      });
      setNewPro("");
    }
  };

  const removePro = (index: number) => {
    setFormData({
      ...formData,
      pros: formData.pros?.filter((_, i) => i !== index),
    });
  };

  const addCon = () => {
    if (newCon.trim()) {
      setFormData({
        ...formData,
        cons: [...(formData.cons || []), newCon.trim()],
      });
      setNewCon("");
    }
  };

  const removeCon = (index: number) => {
    setFormData({
      ...formData,
      cons: formData.cons?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      if (review) {
        const result = await updateGearReview(review.id, formData);
        if (result) {
          toast.success("Review updated");
          onSaved();
          onOpenChange(false);
        } else {
          toast.error("Failed to update review");
        }
      } else {
        const result = await createGearReview(formData);
        if (result) {
          toast.success("Review submitted");
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
            {review ? "Edit Review" : `Review ${gearItemName}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={formData.rating}
                size="lg"
                interactive
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
              <span className="text-sm text-muted-foreground">
                {formData.rating > 0 ? `${formData.rating} stars` : "Select rating"}
              </span>
            </div>
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

          {/* Years of Use */}
          <div className="space-y-2">
            <Label>How long have you used this?</Label>
            <Select
              value={formData.years_of_use}
              onValueChange={(value) =>
                setFormData({ ...formData, years_of_use: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {YEARS_OF_USE.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <Label>Pros</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a pro..."
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPro();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addPro}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.pros && formData.pros.length > 0 && (
              <ul className="space-y-1">
                {formData.pros.map((pro, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm bg-green-50 text-green-700 rounded-md px-3 py-1"
                  >
                    <span className="flex-1">{pro}</span>
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <Label>Cons</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a con..."
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCon();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCon}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.cons && formData.cons.length > 0 && (
              <ul className="space-y-1">
                {formData.cons.map((con, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm bg-red-50 text-red-700 rounded-md px-3 py-1"
                  >
                    <span className="flex-1">{con}</span>
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review_text">Detailed Review</Label>
            <Textarea
              id="review_text"
              placeholder="Share your experience with this gear..."
              value={formData.review_text}
              onChange={(e) =>
                setFormData({ ...formData, review_text: e.target.value })
              }
              className="min-h-[120px]"
            />
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
              {loading ? "Saving..." : review ? "Update Review" : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
