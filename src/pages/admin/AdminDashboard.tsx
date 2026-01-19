import { useState, useEffect } from 'react';
import { Users, FileText, Megaphone, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats, DashboardStats } from '@/lib/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      subtitle: `+${stats?.newUsersToday || 0} today`,
    },
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'bg-green-500',
      subtitle: `+${stats?.newPostsToday || 0} today`,
    },
    {
      title: 'Active Announcements',
      value: stats?.totalActiveAnnouncements || 0,
      icon: Megaphone,
      color: 'bg-orange-500',
      subtitle: 'Currently displayed',
    },
    {
      title: 'Engagement Rate',
      value: stats?.totalPosts && stats?.totalUsers
        ? `${((stats.totalPosts / stats.totalUsers) * 100).toFixed(1)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      subtitle: 'Posts per user',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to the Paranet Admin CMS</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/announcements/new"
                className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <div className="p-2 rounded-lg bg-orange-500">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Announcement</p>
                  <p className="text-sm text-gray-500">Push a new announcement to all users</p>
                </div>
              </a>
              <a
                href="/admin/posts"
                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Manage Posts</p>
                  <p className="text-sm text-gray-500">Edit or remove user posts</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Real-time Updates</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Storage</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
