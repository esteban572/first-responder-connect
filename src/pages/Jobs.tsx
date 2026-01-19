import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard, JobCategory } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import { mockJobs } from "@/data/mockData";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Jobs = () => {
  const [activeFilter, setActiveFilter] = useState<JobCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = mockJobs.filter((job) => {
    const matchesFilter = activeFilter === "all" || job.category === activeFilter;
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <h1 className="text-2xl font-bold font-display mb-1">Job Board</h1>
          <p className="text-muted-foreground">Find your next assignment</p>
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
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Jobs;
