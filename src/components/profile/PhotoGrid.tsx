interface PhotoGridProps {
  photos: {
    id: string;
    url: string;
    caption?: string;
  }[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="feed-card p-4 animate-fade-in">
      <h3 className="font-bold text-base mb-4">Photos</h3>
      <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={photo.url}
              alt={photo.caption || "Photo"}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
