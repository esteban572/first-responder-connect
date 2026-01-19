import { Credential, getCredentialTypeInfo } from "@/types/credential";
import { UserProfile } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExpirationBadge } from "./ExpirationBadge";
import { Award, MapPin, Shield, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface VirtualIDCardProps {
  user: UserProfile;
  credentials: Credential[];
  onCredentialClick?: (credential: Credential) => void;
  fullScreen?: boolean;
}

export function VirtualIDCard({
  user,
  credentials,
  onCredentialClick,
  fullScreen = false,
}: VirtualIDCardProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "No Expiration";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl overflow-hidden shadow-2xl",
        fullScreen ? "w-full max-w-md mx-auto" : "w-full"
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h2 className="font-bold text-lg tracking-wide">PARANET</h2>
            <p className="text-xs opacity-80">Professional Credentials</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 text-center border-b border-white/10">
        <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
          <AvatarImage src={user.avatar_url} alt={user.full_name} />
          <AvatarFallback className="text-2xl bg-primary">
            {user.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-bold">{user.full_name}</h3>
        <p className="text-white/70 mt-1">{user.role}</p>
        {user.location && (
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-white/60">
            <MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
        )}
      </div>

      {/* Credentials List */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Award className="h-4 w-4 text-white/60" />
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide">
            Certifications
          </h4>
        </div>

        {credentials.length > 0 ? (
          <div className="space-y-2">
            {credentials.map((credential) => {
              const typeInfo = getCredentialTypeInfo(credential.credential_type);
              return (
                <button
                  key={credential.id}
                  onClick={() => onCredentialClick?.(credential)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left",
                    credential.document_url && "cursor-pointer"
                  )}
                  disabled={!credential.document_url}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {credential.credential_type}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {credential.credential_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs text-white/50">
                      {formatDate(credential.expiration_date)}
                    </span>
                    {credential.document_url && (
                      <ExternalLink className="h-3 w-3 text-white/40" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No credentials to display</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <p className="text-xs text-center text-white/40">
          Tap a credential to view document
        </p>
      </div>
    </div>
  );
}
