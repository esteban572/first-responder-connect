import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobApplicationModal } from "@/components/jobs/JobApplicationModal";
import {
  MapPin,
  DollarSign,
  Building2,
  ArrowLeft,
  Clock,
  Check,
  Briefcase,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Job, JobCategory } from "@/types/job";
import { getJobById } from "@/lib/jobService";
import { hasApplied } from "@/lib/applicationService";
import { useAuth } from "@/contexts/AuthContext";

const categoryStyles: Record<JobCategory, string> = {
  travel: "job-badge-travel",
  w2: "job-badge-w2",
  "1099": "job-badge-1099",
  contract: "job-badge-contract",
  temp: "job-badge-temp",
  staffing: "job-badge-staffing",
  crisis: "job-badge-crisis",
};

const categoryLabels: Record<JobCategory, string> = {
  travel: "Travel",
  w2: "W2",
  "1099": "1099",
  contract: "Contract",
  temp: "Temp",
  staffing: "Staffing",
  crisis: "Crisis",
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob(id);
    }
  }, [id]);

  useEffect(() => {
    if (user && job) {
      checkIfApplied();
    }
  }, [user, job]);

  const loadJob = async (jobId: string) => {
    setLoading(true);
    const data = await getJobById(jobId);
    setJob(data);
    setLoading(false);
  };

  const checkIfApplied = async () => {
    if (job) {
      const applied = await hasApplied(job.id);
      setIsApplied(applied);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPosted = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleApplicationSuccess = () => {
    setIsApplied(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-4 md:py-6 px-4 md:px-0">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="feed-card p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-4 md:py-6 px-4 md:px-0">
          <div className="feed-card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This job posting may have been removed or is no longer available.
            </p>
            <Button onClick={() => navigate("/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6 px-4 md:px-0">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {/* Job Card */}
        <div
          className={cn(
            "feed-card overflow-hidden",
            job.urgent && "ring-2 ring-accent/50"
          )}
        >
          {/* Header */}
          <div className="p-6 border-b">
            {job.urgent && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Urgent Fill
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className={cn("job-badge", categoryStyles[job.category])}>
                {categoryLabels[job.category]}
              </span>
              <span className="text-sm text-muted-foreground">{job.type}</span>
            </div>

            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{job.company}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted {formatPosted(job.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg">Job Description</h2>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg">Requirements</h2>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Apply Section */}
          <div className="p-6 bg-muted/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium mb-1">Interested in this position?</p>
                <p className="text-sm text-muted-foreground">
                  Submit your application to be considered.
                </p>
              </div>
              {isApplied ? (
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="gap-2 text-green-600 border-green-200 bg-green-50 w-full sm:w-auto"
                >
                  <Check className="h-5 w-5" />
                  Application Submitted
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto"
                  onClick={() => setApplicationModalOpen(true)}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        job={job}
        open={applicationModalOpen}
        onOpenChange={setApplicationModalOpen}
        onSuccess={handleApplicationSuccess}
      />
    </AppLayout>
  );
};

export default JobDetail;
