import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Megaphone,
  TrendingUp,
  Activity,
  MessageCircle,
  Heart,
  UserPlus,
  Flag,
  Briefcase,
  Clock,
  BarChart3,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const mainStatCards = [
    {
      title: 'Users Online',
      value: stats?.activeUsersOnline || 0,
      icon: Activity,
      color: 'bg-green-500',
      subtitle: 'Active in last 5 min',
      pulse: true,
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      subtitle: `+${stats?.newUsersToday || 0} today`,
    },
    {
      title: 'Active Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-indigo-500',
      subtitle: `${stats?.applicationsToday || 0} applications today`,
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports || 0,
      icon: Flag,
      color: stats?.pendingReports && stats.pendingReports > 0 ? 'bg-red-500' : 'bg-gray-400',
      subtitle: 'Needs review',
      alert: (stats?.pendingReports || 0) > 0,
    },
  ];

  const todayStats = [
    {
      title: 'Active Users Today',
      value: stats?.activeUsersToday || 0,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Posts Created',
      value: stats?.newPostsToday || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Comments',
      value: stats?.commentsToday || 0,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Likes',
      value: stats?.likesToday || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'New Connections',
      value: stats?.connectionsToday || 0,
      icon: UserPlus,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'New Users',
      value: stats?.newUsersToday || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {mainStatCards.map((stat) => (
                <Card
                  key={stat.title}
                  className={`hover:shadow-lg transition-shadow ${
                    stat.alert ? 'ring-2 ring-red-200' : ''
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.color} relative`}>
                      <stat.icon className="h-4 w-4 text-white" />
                      {stat.pulse && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-green-300 rounded-full animate-ping"></span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                      {stat.alert && (
                        <Badge variant="destructive" className="text-xs">
                          Action needed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily Summary */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-500" />
                  <CardTitle>Today's Activity Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {todayStats.map((stat) => (
                    <div
                      key={stat.title}
                      className={`${stat.bgColor} rounded-lg p-4 text-center`}
                    >
                      <div className={`inline-flex p-2 rounded-full ${stat.bgColor} mb-2`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-600 mt-1">{stat.title}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats?.totalPosts || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    All time · +{stats?.newPostsToday || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Active Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats?.totalActiveAnnouncements || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Currently displayed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Engagement Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats?.totalPosts && stats?.totalUsers
                      ? `${((stats.totalPosts / stats.totalUsers) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Posts per user</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    to="/admin/announcements/new"
                    className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-orange-500">
                      <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Announcement</p>
                      <p className="text-sm text-gray-500">Push a new announcement to all users</p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/reports"
                    className="flex items-center gap-3 p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-red-500 relative">
                      <Flag className="h-5 w-5 text-white" />
                      {(stats?.pendingReports || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                          {stats?.pendingReports}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Review Reports</p>
                      <p className="text-sm text-gray-500">
                        {(stats?.pendingReports || 0) > 0
                          ? `${stats?.pendingReports} reports pending review`
                          : 'No pending reports'}
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/posts"
                    className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-500">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Manage Posts</p>
                      <p className="text-sm text-gray-500">Edit or remove user posts</p>
                    </div>
                  </Link>
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
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">User Activity Tracking</span>
                      <span className="flex items-center gap-2 text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
