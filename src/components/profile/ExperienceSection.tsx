import { useState } from 'react';
import { Experience } from '@/types/experience';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Briefcase,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Award,
  Globe,
  Lock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ExperienceDialog } from './ExperienceDialog';
import { deleteExperience, toggleExperienceVisibility, setAllExperiencesVisibility } from '@/lib/experienceService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExperienceSectionProps {
  experiences: Experience[];
  isOwnProfile: boolean;
  onExperienceUpdated: () => void;
}

export function ExperienceSection({
  experiences,
  isOwnProfile,
  onExperienceUpdated,
}: ExperienceSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);

  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = format(parseISO(startDate + '-01'), 'MMM yyyy');
    if (isCurrent) {
      return `${start} - Present`;
    }
    if (endDate) {
      const end = format(parseISO(endDate + '-01'), 'MMM yyyy');
      return `${start} - ${end}`;
    }
    return start;
  };

  const calculateDuration = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = parseISO(startDate + '-01');
    const end = isCurrent || !endDate ? new Date() : parseISO(endDate + '-01');

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} yr${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    }
  };

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedExperience(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (experience: Experience) => {
    setExperienceToDelete(experience);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!experienceToDelete) return;

    try {
      const success = await deleteExperience(experienceToDelete.id);
      if (success) {
        toast.success('Experience deleted');
        onExperienceUpdated();
      } else {
        toast.error('Failed to delete experience');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
    } finally {
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    }
  };

  const handleToggleVisibility = async (experience: Experience) => {
    try {
      const success = await toggleExperienceVisibility(experience.id, !experience.is_public);
      if (success) {
        toast.success(experience.is_public ? 'Experience is now private' : 'Experience is now public');
        onExperienceUpdated();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  const handleSetAllVisibility = async (isPublic: boolean) => {
    try {
      const success = await setAllExperiencesVisibility(isPublic);
      if (success) {
        toast.success(isPublic ? 'All experiences are now public' : 'All experiences are now private');
        onExperienceUpdated();
      }
    } catch (error) {
      console.error('Error setting visibility:', error);
      toast.error('Failed to update visibility');
    }
  };

  const publicCount = experiences.filter(e => e.is_public).length;
  const allPublic = experiences.length > 0 && publicCount === experiences.length;

  return (
    <div className="feed-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-accent" />
          <h3 className="font-bold text-base">Experience</h3>
          {!isOwnProfile && experiences.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({experiences.length} position{experiences.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            {experiences.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => handleSetAllVisibility(!allPublic)}
              >
                {allPublic ? (
                  <>
                    <Lock className="h-3 w-3" />
                    Make all private
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3" />
                    Make all public
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        )}
      </div>

      {/* Experience List */}
      <div className="p-4">
        {experiences.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">
              {isOwnProfile
                ? 'Add your professional experience to showcase your career'
                : 'No experience shared yet'}
            </p>
            {isOwnProfile && (
              <Button variant="link" className="mt-2" onClick={handleAdd}>
                Add your first experience
              </Button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent via-accent/50 to-transparent" />

            {/* Experience items */}
            <div className="space-y-6">
              {experiences.map((experience, index) => (
                <div key={experience.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      experience.is_current
                        ? 'bg-accent text-white'
                        : 'bg-muted border-2 border-accent/30'
                    )}
                  >
                    <Briefcase className={cn('h-4 w-4', !experience.is_current && 'text-muted-foreground')} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground">{experience.title}</h4>
                          {experience.is_current && (
                            <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">
                              Current
                            </span>
                          )}
                          {isOwnProfile && !experience.is_public && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mt-0.5">
                          {experience.organization}
                        </p>
                      </div>

                      {isOwnProfile && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(experience)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVisibility(experience)}>
                              {experience.is_public ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Make Private
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Make Public
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(experience)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateRange(experience.start_date, experience.end_date, experience.is_current)}
                      </span>
                      <span className="text-muted-foreground/50">
                        {calculateDuration(experience.start_date, experience.end_date, experience.is_current)}
                      </span>
                      {experience.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {experience.location}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {experience.description && (
                      <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">
                        {experience.description}
                      </p>
                    )}

                    {/* Achievements */}
                    {experience.achievements && experience.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Key Achievements
                        </p>
                        <ul className="space-y-1.5">
                          {experience.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Experience Dialog */}
      <ExperienceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        experience={selectedExperience}
        onSaved={onExperienceUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{experienceToDelete?.title}" at {experienceToDelete?.organization}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
