import { Megaphone, ChevronRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  excerpt: string;
}

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Hurricane Relief Deployment",
    excerpt: "Seeking 200+ EMTs and Paramedics for Florida response. Premium crisis pay available.",
  },
];

export function AnnouncementBanner() {
  const announcement = announcements[0];
  
  if (!announcement) return null;

  return (
    <div className="announcement-banner rounded-xl p-4 mx-4 md:mx-0 mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Official
            </span>
          </div>
          <h3 className="font-bold text-base leading-tight">{announcement.title}</h3>
          <p className="text-sm text-white/80 mt-1 line-clamp-2">{announcement.excerpt}</p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
