import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobApplicationModal } from "@/components/jobs/JobApplicationModal";
import { Search, MapPin, DollarSign, Building2, ChevronRight, Check, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Job, JobCategory } from "@/types/job";
import { getActiveJobs } from "@/lib/jobService";
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

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<JobCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (user && jobs.length > 0) {
      checkAppliedJobs();
    }
  }, [user, jobs]);

  const loadJobs = async () => {
    setLoading(true);
    const data = await getActiveJobs();
    setJobs(data);
    setLoading(false);
  };

  const checkAppliedJobs = async () => {
    const applied = new Set<string>();
    for (const job of jobs) {
      const isApplied = await hasApplied(job.id);
      if (isApplied) {
        applied.add(job.id);
      }
    }
    setAppliedJobs(applied);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeFilter === "all" || job.category === activeFilter;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatPosted = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplicationModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    if (selectedJob) {
      setAppliedJobs((prev) => new Set(prev).add(selectedJob.id));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">Job Board</h1>
              <p className="text-muted-foreground">Find your next assignment</p>
            </div>
            <Link to="/agencies">
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Agency Reviews</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-0 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 md:px-0 mb-6">
          <JobFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Results Count */}
        <div className="px-4 md:px-0 mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
          </p>
        </div>

        {/* Job List */}
        <div className="space-y-3 px-4 md:px-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="feed-card p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const isApplied = appliedJobs.has(job.id);
              return (
                <article
                  key={job.id}
                  className={cn(
                    "feed-card p-4 animate-fade-in",
                    job.urgent && "ring-2 ring-accent/50"
                  )}
                >
                  {job.urgent && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        Urgent Fill
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <Link to={`/jobs/${job.id}`} className="flex-1 min-w-0 group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("job-badge", categoryStyles[job.category])}>
                          {categoryLabels[job.category]}
                        </span>
                        <span className="text-xs text-muted-foreground">{job.type}</span>
                      </div>

                      <h3 className="font-bold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{job.company}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{job.salary}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatPosted(job.created_at)}
                      </span>
                      {isApplied ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="gap-1 text-green-600 border-green-200 bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                          Applied
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 gap-1"
                          onClick={() => handleApply(job)}
                        >
                          Apply
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      <JobApplicationModal
        job={selectedJob}
        open={applicationModalOpen}
        onOpenChange={setApplicationModalOpen}
        onSuccess={handleApplicationSuccess}
      />
    </AppLayout>
  );
};

export default Jobs;
