import { MapPin, DollarSign, Clock, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type JobCategory = "travel" | "w2" | "1099" | "contract" | "temp" | "staffing" | "crisis";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    category: JobCategory;
    type: string;
    posted: string;
    urgent?: boolean;
  };
}

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

export function JobCard({ job }: JobCardProps) {
  return (
    <article className={cn(
      "feed-card p-4 animate-fade-in",
      job.urgent && "ring-2 ring-accent/50"
    )}>
      {job.urgent && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Urgent Fill
          </span>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("job-badge", categoryStyles[job.category])}>
              {categoryLabels[job.category]}
            </span>
            <span className="text-xs text-muted-foreground">{job.type}</span>
          </div>
          
          <h3 className="font-bold text-base mb-1 line-clamp-1">{job.title}</h3>
          
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
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{job.posted}</span>
          <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1">
            Apply
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
