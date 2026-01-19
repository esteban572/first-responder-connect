import { cn } from "@/lib/utils";
import { JobCategory } from "./JobCard";

interface JobFiltersProps {
  activeFilter: JobCategory | "all";
  onFilterChange: (filter: JobCategory | "all") => void;
}

const filters: { value: JobCategory | "all"; label: string }[] = [
  { value: "all", label: "All Jobs" },
  { value: "travel", label: "Travel" },
  { value: "crisis", label: "Crisis" },
  { value: "w2", label: "W2" },
  { value: "1099", label: "1099" },
  { value: "contract", label: "Contract" },
  { value: "temp", label: "Temp" },
  { value: "staffing", label: "Staffing" },
];

export function JobFilters({ activeFilter, onFilterChange }: JobFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            activeFilter === filter.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
