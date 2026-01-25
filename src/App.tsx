import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import "@/lib/testSupabaseConnection";

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Eager load critical pages (Home, Login, AuthCallback)
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Lazy load all other pages
const Feed = lazy(() => import("./pages/Feed"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const Alerts = lazy(() => import("./pages/Alerts"));
const SearchUsers = lazy(() => import("./pages/SearchUsers"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const SavedArticles = lazy(() => import("./pages/SavedArticles"));
const Settings = lazy(() => import("./pages/Settings"));
const Credentials = lazy(() => import("./pages/Credentials"));
const CredentialShowcase = lazy(() => import("./pages/CredentialShowcase"));
const GearReviews = lazy(() => import("./pages/GearReviews"));
const GearDetail = lazy(() => import("./pages/GearDetail"));
const AgencyReviews = lazy(() => import("./pages/AgencyReviews"));
const AgencyDetail = lazy(() => import("./pages/AgencyDetail"));
const Meetings = lazy(() => import("./pages/Meetings"));
const MeetingRoom = lazy(() => import("./pages/MeetingRoom"));
const OrganizationSettings = lazy(() => import("./pages/OrganizationSettings"));
const OrganizationSetup = lazy(() => import("./pages/OrganizationSetup"));
const AgencySetup = lazy(() => import("./pages/AgencySetup"));
const Billing = lazy(() => import("./pages/Billing"));
const Groups = lazy(() => import("./pages/Groups"));
const GroupDetail = lazy(() => import("./pages/GroupDetail"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const OAuthDebug = lazy(() => import("./pages/OAuthDebug"));

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AnnouncementManagement = lazy(() => import("./pages/admin/AnnouncementManagement"));
const AnnouncementEditor = lazy(() => import("./pages/admin/AnnouncementEditor"));
const PostManagement = lazy(() => import("./pages/admin/PostManagement"));
const JobManagement = lazy(() => import("./pages/admin/JobManagement"));
const JobEditor = lazy(() => import("./pages/admin/JobEditor"));
const ApplicationManagement = lazy(() => import("./pages/admin/ApplicationManagement"));
const BlogManagement = lazy(() => import("./pages/admin/BlogManagement"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));
const ReportedPosts = lazy(() => import("./pages/admin/ReportedPosts"));
const EventManagement = lazy(() => import("./pages/admin/EventManagement"));
const EventEditor = lazy(() => import("./pages/admin/EventEditor"));

// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 1,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <AdminRoute>
                  <AnnouncementManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/announcements/:id"
              element={
                <AdminRoute>
                  <AnnouncementEditor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <AdminRoute>
                  <PostManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <AdminRoute>
                  <JobManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/jobs/:id"
              element={
                <AdminRoute>
                  <JobEditor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <AdminRoute>
                  <ApplicationManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <AdminRoute>
                  <BlogManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog/:id"
              element={
                <AdminRoute>
                  <BlogEditor />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <ReportedPosts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <AdminRoute>
                  <EventManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events/:id"
              element={
                <AdminRoute>
                  <EventEditor />
                </AdminRoute>
              }
            />
            {/* Event Routes */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetail />
                </ProtectedRoute>
              }
            />
            {/* Credential Routes */}
            <Route
              path="/credentials"
              element={
                <ProtectedRoute>
                  <Credentials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/credentials/showcase"
              element={
                <ProtectedRoute>
                  <CredentialShowcase />
                </ProtectedRoute>
              }
            />
            {/* Public credential showcase (no auth required) */}
            <Route path="/user/:userId/credentials" element={<CredentialShowcase />} />
            {/* Gear Reviews Routes */}
            <Route
              path="/gear"
              element={
                <ProtectedRoute>
                  <GearReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gear/:id"
              element={
                <ProtectedRoute>
                  <GearDetail />
                </ProtectedRoute>
              }
            />
            {/* Agency Reviews Routes */}
            <Route
              path="/agencies"
              element={
                <ProtectedRoute>
                  <AgencyReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agencies/:id"
              element={
                <ProtectedRoute>
                  <AgencyDetail />
                </ProtectedRoute>
              }
            />
            {/* Blog Routes */}
            <Route
              path="/blog"
              element={
                <ProtectedRoute>
                  <Blog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/saved"
              element={
                <ProtectedRoute>
                  <SavedArticles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <ProtectedRoute>
                  <BlogPost />
                </ProtectedRoute>
              }
            />
            {/* Video Meeting Routes */}
            <Route
              path="/meetings"
              element={
                <ProtectedRoute>
                  <Meetings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meeting/:roomId"
              element={
                <ProtectedRoute>
                  <MeetingRoom />
                </ProtectedRoute>
              }
            />
            {/* Groups Routes */}
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />
            {/* Organization Routes (legacy) */}
            <Route
              path="/organization/setup"
              element={
                <ProtectedRoute>
                  <OrganizationSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization/settings"
              element={
                <ProtectedRoute>
                  <OrganizationSettings />
                </ProtectedRoute>
              }
            />
            {/* Agency Routes (unified with organizations) */}
            <Route
              path="/agency/setup"
              element={
                <ProtectedRoute>
                  <AgencySetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agency/settings"
              element={
                <ProtectedRoute>
                  <OrganizationSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            {/* Alias for settings/billing */}
            <Route
              path="/settings/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            {/* Invite acceptance (public route - allows non-logged in users to see login/signup prompt) */}
            <Route path="/invite/:token" element={<InviteAccept />} />
            {/* Legal Pages (public routes) */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* Debug Tools (public routes) */}
            <Route path="/debug/oauth" element={<OAuthDebug />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </OrganizationProvider>
  </AuthProvider>
  </QueryClientProvider>
);

export default App;
