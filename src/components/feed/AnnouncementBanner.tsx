import { useState, useEffect } from "react";
import { Megaphone, ChevronRight } from "lucide-react";
import { Announcement, FONT_SIZE_OPTIONS } from "@/types/announcement";
import { getActiveAnnouncements, subscribeToAnnouncements } from "@/lib/announcementService";

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial announcements
    loadAnnouncements();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAnnouncements({
      onInsert: (announcement) => {
        // Only add if it's active and within the display window
        if (announcement.is_active) {
          const now = new Date();
          const startsAt = new Date(announcement.starts_at);
          const expiresAt = announcement.expires_at ? new Date(announcement.expires_at) : null;

          if (startsAt <= now && (!expiresAt || expiresAt > now)) {
            setAnnouncements((prev) => {
              const updated = [...prev, announcement];
              // Sort by priority (descending) then by created_at (descending)
              return updated.sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              });
            });
          }
        }
      },
      onUpdate: (announcement) => {
        setAnnouncements((prev) => {
          const now = new Date();
          const startsAt = new Date(announcement.starts_at);
          const expiresAt = announcement.expires_at ? new Date(announcement.expires_at) : null;
          const isVisible = announcement.is_active && startsAt <= now && (!expiresAt || expiresAt > now);

          if (isVisible) {
            // Update existing or add if not present
            const exists = prev.find((a) => a.id === announcement.id);
            if (exists) {
              return prev
                .map((a) => (a.id === announcement.id ? announcement : a))
                .sort((a, b) => {
                  if (b.priority !== a.priority) return b.priority - a.priority;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
            } else {
              return [...prev, announcement].sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              });
            }
          } else {
            // Remove if no longer visible
            return prev.filter((a) => a.id !== announcement.id);
          }
        });
      },
      onDelete: (announcement) => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadAnnouncements = async () => {
    const data = await getActiveAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  // Show the first announcement
  const announcement = announcements[0];

  if (loading || !announcement) return null;

  const fontSizeClass = FONT_SIZE_OPTIONS.find((f) => f.value === announcement.font_size)?.className || 'text-base';

  return (
    <div
      className="rounded-xl p-4 mx-4 md:mx-0 mb-4 animate-fade-in transition-all duration-300"
      style={{
        backgroundColor: announcement.background_color,
        color: announcement.text_color,
        fontFamily: announcement.font_family,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${announcement.text_color}20` }}
        >
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: `${announcement.text_color}20` }}
            >
              Official
            </span>
          </div>
          <h3 className={`font-bold leading-tight ${fontSizeClass}`}>
            {announcement.title}
          </h3>
          <p className="text-sm mt-1 line-clamp-2" style={{ opacity: 0.8 }}>
            {announcement.content}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
