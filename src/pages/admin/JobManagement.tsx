import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Job, JOB_CATEGORIES } from '@/types/job';
import { getAllJobs, toggleJobActive, toggleJobUrgent, deleteJob } from '@/lib/jobService';

export default function JobManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const data = await getAllJobs();
    setJobs(data);
    setLoading(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await toggleJobActive(id, !currentStatus);
    if (success) {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_active: !currentStatus } : j))
      );
      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'}`);
    } else {
      toast.error('Failed to update job');
    }
  };

  const handleToggleUrgent = async (id: string, currentStatus: boolean) => {
    const success = await toggleJobUrgent(id, !currentStatus);
    if (success) {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, urgent: !currentStatus } : j))
      );
      toast.success(`Job ${!currentStatus ? 'marked as urgent' : 'unmarked as urgent'}`);
    } else {
      toast.error('Failed to update job');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await deleteJob(deleteId);
    if (success) {
      setJobs((prev) => prev.filter((j) => j.id !== deleteId));
      toast.success('Job deleted');
    } else {
      toast.error('Failed to delete job');
    }
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    return JOB_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">Manage job postings</p>
          </div>
          <Link to="/admin/jobs/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Job
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
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No jobs yet</p>
              <Link to="/admin/jobs/new">
                <Button>Create your first job posting</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <div className="flex">
                  <div
                    className={`w-2 flex-shrink-0 ${
                      job.urgent ? 'bg-red-500' : job.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {getCategoryLabel(job.category)}
                          </span>
                          {job.urgent && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Urgent
                            </span>
                          )}
                          {job.is_active ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">
                          {job.company} · {job.location}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{job.salary}</span>
                          <span>{job.type}</span>
                          <span>Posted: {formatDate(job.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Active</span>
                            <Switch
                              checked={job.is_active}
                              onCheckedChange={() =>
                                handleToggleActive(job.id, job.is_active)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Urgent</span>
                            <Switch
                              checked={job.urgent}
                              onCheckedChange={() =>
                                handleToggleUrgent(job.id, job.urgent)
                              }
                            />
                          </div>
                        </div>
                        <Link to={`/admin/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(job.id)}
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
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action cannot be
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
