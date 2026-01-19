import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, Briefcase, MapPin, Mail, Award, Trash2, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Application, APPLICATION_STATUSES, ApplicationStatus } from '@/types/application';
import {
  getAllApplications,
  updateApplication,
  deleteApplication,
  generateAISummary,
} from '@/lib/applicationService';

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const data = await getAllApplications();
    setApplications(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    const success = await updateApplication(id, { status });
    if (success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast.success('Status updated');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleGenerateAI = async (application: Application) => {
    setGeneratingAI(application.id);
    const result = await generateAISummary(application.id);

    if (result) {
      await updateApplication(application.id, {
        ai_summary: result.summary,
        ai_match_score: result.matchScore,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === application.id
            ? { ...a, ai_summary: result.summary, ai_match_score: result.matchScore }
            : a
        )
      );
      toast.success('AI analysis complete');
    } else {
      toast.error('Failed to generate AI summary');
    }
    setGeneratingAI(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await deleteApplication(deleteId);
    if (success) {
      setApplications((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success('Application deleted');
    } else {
      toast.error('Failed to delete application');
    }
    setDeleteId(null);
  };

  const handleSaveNotes = async (notes: string) => {
    if (!selectedApplication) return;

    const success = await updateApplication(selectedApplication.id, { admin_notes: notes });
    if (success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApplication.id ? { ...a, admin_notes: notes } : a))
      );
      toast.success('Notes saved');
    } else {
      toast.error('Failed to save notes');
    }
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

  const getStatusStyle = (status: ApplicationStatus) => {
    return APPLICATION_STATUSES.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredApplications = applications.filter(
    (a) => filterStatus === 'all' || a.status === filterStatus
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage job applications</p>
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ApplicationStatus | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {APPLICATION_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
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
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No applications found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Applicant Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={application.applicant?.avatar_url} />
                        <AvatarFallback>
                          {application.applicant ? getInitials(application.applicant.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {application.applicant?.full_name || 'Unknown Applicant'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(application.status)}`}>
                            {APPLICATION_STATUSES.find((s) => s.value === application.status)?.label}
                          </span>
                          {application.ai_match_score !== undefined && (
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getMatchScoreColor(application.ai_match_score)}`}>
                              {application.ai_match_score}% Match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Applied for: <span className="font-medium">{application.job?.title}</span> at {application.job?.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {application.applicant?.role || 'No role'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.applicant?.location || 'No location'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {application.applicant?.email}
                          </span>
                        </div>
                        {application.applicant?.credentials && application.applicant.credentials.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Award className="h-4 w-4 text-gray-400" />
                            {application.applicant.credentials.map((cred) => (
                              <span
                                key={cred}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {cred}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* AI Summary */}
                        {application.ai_summary && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700 text-xs font-medium mb-1">
                              <Sparkles className="h-3 w-3" />
                              AI Analysis
                            </div>
                            <p className="text-sm text-purple-900">{application.ai_summary}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <p className="text-xs text-gray-500">{formatDate(application.created_at)}</p>

                      <Select
                        value={application.status}
                        onValueChange={(v) => handleStatusChange(application.id, v as ApplicationStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateAI(application)}
                          disabled={generatingAI === application.id}
                          className="gap-1"
                        >
                          {generatingAI === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          AI Analyze
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setDetailsOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {application.resume_url && (
                          <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(application.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.applicant?.full_name} - {selectedApplication?.job?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4 mt-4">
              {selectedApplication.cover_letter && (
                <div>
                  <Label className="text-gray-700">Cover Letter</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {selectedApplication.ai_summary && (
                <div>
                  <Label className="text-gray-700">AI Summary</Label>
                  <div className="mt-1 p-3 bg-purple-50 rounded-lg text-sm">
                    <p>{selectedApplication.ai_summary}</p>
                    {selectedApplication.ai_match_score !== undefined && (
                      <p className="mt-2 font-medium">
                        Match Score: {selectedApplication.ai_match_score}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="adminNotes" className="text-gray-700">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  defaultValue={selectedApplication.admin_notes || ''}
                  placeholder="Add private notes about this application..."
                  rows={4}
                  className="mt-1"
                  onBlur={(e) => handleSaveNotes(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Notes are auto-saved when you click outside</p>
              </div>

              {selectedApplication.resume_url && (
                <div>
                  <Label className="text-gray-700">Resume</Label>
                  <a
                    href={selectedApplication.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span>View Resume PDF</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
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
