import { useState, useEffect } from 'react';
import { Eye, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Report, REPORT_STATUSES } from '@/types/report';
import {
  getAllReports,
  updateReportStatus,
  deleteReportedPost,
} from '@/lib/reportService';

export default function ReportedPosts() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [deleteReport, setDeleteReport] = useState<Report | null>(null);
  const [reviewReport, setReviewReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    const data = await getAllReports(statusFilter);
    setReports(data);
    setLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!reviewReport || !newStatus) return;

    setIsProcessing(true);
    const success = await updateReportStatus(reviewReport.id, newStatus, adminNotes);

    if (success) {
      toast.success('Report status updated');
      setReviewReport(null);
      setAdminNotes('');
      setNewStatus('');
      loadReports();
    } else {
      toast.error('Failed to update report');
    }
    setIsProcessing(false);
  };

  const handleDeletePost = async () => {
    if (!deleteReport?.post) return;

    setIsProcessing(true);
    const success = await deleteReportedPost(deleteReport.id, deleteReport.post.id);

    if (success) {
      toast.success('Post deleted and report resolved');
      setDeleteReport(null);
      loadReports();
    } else {
      toast.error('Failed to delete post');
    }
    setIsProcessing(false);
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

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = REPORT_STATUSES.find(s => s.value === status);
    if (!statusConfig) return null;

    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colorClasses[statusConfig.color as keyof typeof colorClasses]}>
        {statusConfig.label}
      </Badge>
    );
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Reported Posts</h1>
              {statusFilter === 'pending' && pendingCount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {pendingCount} pending
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">Review and manage reported content</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Under Review</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
              <SelectItem value="action_taken">Action Taken</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {statusFilter === 'all'
                  ? 'No reports yet'
                  : `No ${statusFilter.replace('_', ' ')} reports`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Report Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(report.status)}
                          <Badge variant="outline">{report.reason}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          Reported {formatDate(report.created_at)}
                        </span>
                      </div>

                      {/* Reported Post Preview */}
                      {report.post ? (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={report.post.author?.avatar_url} />
                              <AvatarFallback>
                                {report.post.author
                                  ? getInitials(report.post.author.full_name)
                                  : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {report.post.author?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {report.post.author?.role}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                            {report.post.content}
                          </p>
                          {report.post.image_url && (
                            <img
                              src={report.post.image_url}
                              alt="Post"
                              className="mt-3 rounded max-h-32 object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center text-gray-500">
                          Post has been deleted
                        </div>
                      )}

                      {/* Reporter Description */}
                      {report.description && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Additional details from reporter:
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            "{report.description}"
                          </p>
                        </div>
                      )}

                      {/* Reporter Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Reported by:</span>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={report.reporter?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {report.reporter
                              ? getInitials(report.reporter.full_name)
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{report.reporter?.full_name || 'Unknown'}</span>
                      </div>

                      {/* Admin Notes */}
                      {report.admin_notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Admin Notes:</p>
                          <p className="text-sm text-blue-700">{report.admin_notes}</p>
                          {report.reviewer && (
                            <p className="text-xs text-blue-600 mt-1">
                              — {report.reviewer.full_name}
                              {report.reviewed_at && ` on ${formatDate(report.reviewed_at)}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReviewReport(report);
                              setNewStatus('reviewed');
                              setAdminNotes('');
                            }}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReviewReport(report);
                              setNewStatus('dismissed');
                              setAdminNotes('');
                            }}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Dismiss
                          </Button>
                        </>
                      )}
                      {report.post && report.status !== 'action_taken' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteReport(report)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Post
                        </Button>
                      )}
                      {report.status === 'reviewed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReviewReport(report);
                            setNewStatus('dismissed');
                            setAdminNotes('');
                          }}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewReport} onOpenChange={() => setReviewReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'dismissed' ? 'Dismiss Report' : 'Update Report Status'}
            </DialogTitle>
            <DialogDescription>
              {newStatus === 'dismissed'
                ? 'This will mark the report as dismissed. The post will remain visible.'
                : 'Add notes and update the status of this report.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewed">Under Review</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="action_taken">Action Taken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this report..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewReport(null)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isProcessing}>
              {isProcessing ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!deleteReport} onOpenChange={() => setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reported Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post and mark all reports against it as
              "Action Taken". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
