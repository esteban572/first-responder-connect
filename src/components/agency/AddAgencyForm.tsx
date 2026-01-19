import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AgencyCreate,
  AGENCY_TYPES,
  SERVICE_AREAS,
  EMPLOYEE_COUNTS,
  US_STATES,
} from "@/types/agency";
import { createAgency } from "@/lib/agencyService";

interface AddAgencyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AddAgencyForm({
  open,
  onOpenChange,
  onSaved,
}: AddAgencyFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgencyCreate>({
    name: "",
    city: "",
    state: "",
    agency_type: undefined,
    service_area: undefined,
    website_url: "",
    employee_count: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter the agency name");
      return;
    }

    setLoading(true);
    try {
      const result = await createAgency(formData);
      if (result) {
        toast.success("Agency added");
        onSaved();
        onOpenChange(false);
        // Reset form
        setFormData({
          name: "",
          city: "",
          state: "",
          agency_type: undefined,
          service_area: undefined,
          website_url: "",
          employee_count: "",
        });
      } else {
        toast.error("Failed to add agency");
      }
    } catch (error) {
      console.error("Error creating agency:", error);
      toast.error("Failed to add agency");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Agency</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agency Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Agency Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Metro Ambulance Service"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., San Diego"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) =>
                  setFormData({ ...formData, state: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agency Type */}
          <div className="space-y-2">
            <Label>Agency Type</Label>
            <Select
              value={formData.agency_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  agency_type: value as AgencyCreate["agency_type"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {AGENCY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Area */}
          <div className="space-y-2">
            <Label>Service Area</Label>
            <Select
              value={formData.service_area}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  service_area: value as AgencyCreate["service_area"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_AREAS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Count */}
          <div className="space-y-2">
            <Label>Company Size</Label>
            <Select
              value={formData.employee_count}
              onValueChange={(value) =>
                setFormData({ ...formData, employee_count: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_COUNTS.map((count) => (
                  <SelectItem key={count.value} value={count.value}>
                    {count.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://..."
              value={formData.website_url}
              onChange={(e) =>
                setFormData({ ...formData, website_url: e.target.value })
              }
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
              {loading ? "Adding..." : "Add Agency"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
