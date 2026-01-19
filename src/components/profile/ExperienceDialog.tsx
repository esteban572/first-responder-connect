import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { Experience, ExperienceCreate } from '@/types/experience';
import { createExperience, updateExperience } from '@/lib/experienceService';
import { toast } from 'sonner';

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: Experience | null;
  onSaved: () => void;
}

export function ExperienceDialog({
  open,
  onOpenChange,
  experience,
  onSaved,
}: ExperienceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExperienceCreate>({
    title: '',
    organization: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: [],
    is_public: true,
  });
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title,
        organization: experience.organization,
        location: experience.location || '',
        start_date: experience.start_date,
        end_date: experience.end_date || '',
        is_current: experience.is_current,
        description: experience.description || '',
        achievements: experience.achievements || [],
        is_public: experience.is_public,
      });
    } else {
      setFormData({
        title: '',
        organization: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        achievements: [],
        is_public: true,
      });
    }
  }, [experience, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.organization || !formData.start_date) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      if (experience) {
        await updateExperience({ id: experience.id, ...formData });
        toast.success('Experience updated');
      } else {
        await createExperience(formData);
        toast.success('Experience added');
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving experience:', error);
      toast.error('Failed to save experience');
    } finally {
      setLoading(false);
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...(formData.achievements || []), newAchievement.trim()],
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {experience ? 'Edit Experience' : 'Add Experience'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Firefighter, Paramedic, Police Officer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization *</Label>
            <Input
              id="organization"
              placeholder="e.g., City Fire Department"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Los Angeles, CA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="month"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="month"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                disabled={formData.is_current}
              />
            </div>
          </div>

          {/* Current Position */}
          <div className="flex items-center gap-2">
            <Switch
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_current: checked, end_date: checked ? '' : formData.end_date })
              }
            />
            <Label htmlFor="is_current" className="cursor-pointer">
              I currently work here
            </Label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your role and responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <Label>Key Achievements</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add an achievement..."
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addAchievement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.achievements && formData.achievements.length > 0 && (
              <ul className="space-y-2 mt-2">
                {formData.achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm bg-muted rounded-md px-3 py-2"
                  >
                    <span className="flex-1">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-sm">Visibility</p>
              <p className="text-xs text-muted-foreground">
                {formData.is_public ? 'Others can see this experience' : 'Only you can see this'}
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : experience ? 'Update' : 'Add Experience'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
