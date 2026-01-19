import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Announcement } from '@/types/announcement';
import {
  getAllAnnouncements,
  toggleAnnouncementActive,
  deleteAnnouncement,
} from '@/lib/announcementService';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await getAllAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await toggleAnnouncementActive(id, !currentStatus);
    if (success) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !currentStatus } : a))
      );
      toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'}`);
    } else {
      toast.error('Failed to update announcement');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await deleteAnnouncement(deleteId);
    if (success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success('Announcement deleted');
    } else {
      toast.error('Failed to delete announcement');
    }
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">Manage system-wide announcements</p>
          </div>
          <Link to="/admin/announcements/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No announcements yet</p>
              <Link to="/admin/announcements/new">
                <Button>Create your first announcement</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="overflow-hidden">
                <div className="flex">
                  <div
                    className="w-2 flex-shrink-0"
                    style={{ backgroundColor: announcement.background_color }}
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          {announcement.is_active ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {formatDate(announcement.created_at)}</span>
                          {announcement.expires_at && (
                            <span>Expires: {formatDate(announcement.expires_at)}</span>
                          )}
                          <span>Priority: {announcement.priority}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {announcement.is_active ? (
                            <Eye className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Switch
                            checked={announcement.is_active}
                            onCheckedChange={() =>
                              handleToggleActive(announcement.id, announcement.is_active)
                            }
                          />
                        </div>
                        <Link to={`/admin/announcements/${announcement.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(announcement.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
