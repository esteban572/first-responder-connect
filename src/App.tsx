import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Alerts from "./pages/Alerts";
import SearchUsers from "./pages/SearchUsers";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnnouncementManagement from "./pages/admin/AnnouncementManagement";
import AnnouncementEditor from "./pages/admin/AnnouncementEditor";
import PostManagement from "./pages/admin/PostManagement";
import JobManagement from "./pages/admin/JobManagement";
import JobEditor from "./pages/admin/JobEditor";
import ApplicationManagement from "./pages/admin/ApplicationManagement";
import BlogManagement from "./pages/admin/BlogManagement";
import BlogEditor from "./pages/admin/BlogEditor";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import SavedArticles from "./pages/SavedArticles";
import Settings from "./pages/Settings";
import "@/lib/testSupabaseConnection";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
