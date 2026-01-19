import { cn } from "@/lib/utils";
import { CredentialStatus, CREDENTIAL_STATUS_CONFIG } from "@/types/credential";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ExpirationBadgeProps {
  status: CredentialStatus;
  expirationDate?: string | null;
  showDate?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusIcons = {
  valid: CheckCircle,
  expiring_soon: AlertTriangle,
  expired: XCircle,
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

export function ExpirationBadge({
  status,
  expirationDate,
  showDate = false,
  size = "md",
}: ExpirationBadgeProps) {
  const config = CREDENTIAL_STATUS_CONFIG[status];
  const Icon = statusIcons[status];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.bgColor,
        config.color,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {showDate && expirationDate && (
        <span className="ml-1 opacity-80">({formatDate(expirationDate)})</span>
      )}
    </span>
  );
}
