import { useState, useEffect } from 'react';
import { Upload, FileText, User, MapPin, Mail, Briefcase, Award, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Job } from '@/types/job';
import { UserProfile } from '@/types/user';
import { getCurrentUserProfile } from '@/lib/userService';
import { submitApplication, uploadResume } from '@/lib/applicationService';

interface JobApplicationModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JobApplicationModal({ job, open, onOpenChange, onSuccess }: JobApplicationModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getCurrentUserProfile();
    setProfile(data);
    setLoading(false);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!job) return;

    setSubmitting(true);
    let resumeUrl: string | undefined;

    try {
      // Upload resume if provided
      if (resumeFile) {
        setUploadingResume(true);
        const url = await uploadResume(resumeFile);
        if (url) {
          resumeUrl = url;
        }
        setUploadingResume(false);
      }

      // Submit application
      const application = await submitApplication({
        job_id: job.id,
        cover_letter: coverLetter || undefined,
        resume_url: resumeUrl,
      });

      if (application) {
        toast.success('Application submitted successfully!');
        setCoverLetter('');
        setResumeFile(null);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            {job.company} · {job.location}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Profile Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Profile</h3>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    {profile ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{profile?.full_name || 'Your Name'}</h4>
                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile?.role || 'Your Role'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile?.location || 'Your Location'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile?.email || 'your@email.com'}</span>
                    </div>
                  </div>
                  {profile?.credentials && profile.credentials.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Award className="h-4 w-4 text-gray-400" />
                      {profile.credentials.map((cred) => (
                        <span
                          key={cred}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {cred}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {!profile?.full_name && (
                <p className="mt-3 text-sm text-amber-600">
                  Please complete your profile before applying to jobs.
                </p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={5}
                className="mt-1"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <Label>Resume (Optional)</Label>
              <div className="mt-1">
                {resumeFile ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="flex-1 text-sm text-green-700 truncate">
                      {resumeFile.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload PDF (max 5MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !profile?.full_name}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadingResume ? 'Uploading...' : 'Submitting...'}
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
