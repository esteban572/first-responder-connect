import { Megaphone, ChevronRight } from 'lucide-react';
import { FONT_SIZE_OPTIONS } from '@/types/announcement';

interface AnnouncementLivePreviewProps {
  title: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
}

export function AnnouncementLivePreview({
  title,
  content,
  backgroundColor,
  textColor,
  fontFamily,
  fontSize,
}: AnnouncementLivePreviewProps) {
  const fontSizeClass = FONT_SIZE_OPTIONS.find((f) => f.value === fontSize)?.className || 'text-base';

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
      <div
        className="rounded-xl p-4 transition-all duration-300"
        style={{
          backgroundColor,
          color: textColor,
          fontFamily,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${textColor}20` }}
          >
            <Megaphone className="h-5 w-5" style={{ color: textColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ backgroundColor: `${textColor}20` }}
              >
                Official
              </span>
            </div>
            <h3 className={`font-bold leading-tight ${fontSizeClass}`}>
              {title || 'Announcement Title'}
            </h3>
            <p
              className="text-sm mt-1 line-clamp-2"
              style={{ opacity: 0.8 }}
            >
              {content || 'Announcement content will appear here...'}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: textColor }} />
        </div>
      </div>
    </div>
  );
}
