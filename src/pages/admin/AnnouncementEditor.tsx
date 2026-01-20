import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ColorPicker } from '@/components/admin/ColorPicker';
import { AnnouncementLivePreview } from '@/components/admin/AnnouncementLivePreview';
import {
  AnnouncementCreate,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_PRESETS,
} from '@/types/announcement';
import {
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
} from '@/lib/announcementService';

export default function AnnouncementEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'new';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#f97316');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('base');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(0);
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadAnnouncement();
    }
  }, [id]);

  const loadAnnouncement = async () => {
    if (!id) return;
    const announcement = await getAnnouncementById(id);
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setBackgroundColor(announcement.background_color);
      setTextColor(announcement.text_color);
      setFontFamily(announcement.font_family);
      setFontSize(announcement.font_size);
      setIsActive(announcement.is_active);
      setPriority(announcement.priority);
      setStartsAt(announcement.starts_at ? announcement.starts_at.slice(0, 16) : '');
      setExpiresAt(announcement.expires_at ? announcement.expires_at.slice(0, 16) : '');
    } else {
      toast.error('Announcement not found');
      navigate('/admin/announcements');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);

    const data: AnnouncementCreate = {
      title: title.trim(),
      content: content.trim(),
      background_color: backgroundColor,
      text_color: textColor,
      font_family: fontFamily,
      font_size: fontSize,
      is_active: isActive,
      priority,
      starts_at: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    let result;
    if (isEditing && id) {
      result = await updateAnnouncement(id, data);
    } else {
      result = await createAnnouncement(data);
    }

    setSaving(false);

    if (result) {
      toast.success(isEditing ? 'Announcement updated' : 'Announcement created');
      navigate('/admin/announcements');
    } else {
      toast.error('Failed to save announcement');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/announcements')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Announcement' : 'New Announcement'}
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {isEditing
                ? 'Update announcement details and styling'
                : 'Create a new announcement for all users'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Announcement content..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Styling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker
                  label="Background Color"
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  showPresets
                  onPresetSelect={(preset) => setTextColor(preset.textColor)}
                />
                <ColorPicker
                  label="Text Color"
                  value={textColor}
                  onChange={setTextColor}
                />
                <div>
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-sm text-gray-500">
                      Show this announcement to users
                    </p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Higher priority announcements appear first
                  </p>
                </div>
                <div>
                  <Label htmlFor="startsAt">Starts At</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <AnnouncementLivePreview
                  title={title}
                  content={content}
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                />
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : isEditing ? 'Update Announcement' : 'Create Announcement'}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
