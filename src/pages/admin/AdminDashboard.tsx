import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Megaphone,
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
      title: 'Active Today',
      value: stats?.activeUsersToday || 0,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Posts',
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
      title: 'Connections',
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
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Welcome to the Paranet Admin CMS</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 md:p-6">
                    <div className="h-16 md:h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              {mainStatCards.map((stat) => (
                <Card
                  key={stat.title}
                  className={`hover:shadow-lg transition-shadow ${
                    stat.alert ? 'ring-2 ring-red-200' : ''
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between p-3 md:p-6 pb-1 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-1.5 md:p-2 rounded-lg ${stat.color} relative`}>
                      <stat.icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      {stat.pulse && (
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-300 rounded-full animate-ping"></span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                    <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                      <span className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                      {stat.alert && (
                        <Badge variant="destructive" className="text-[10px] md:text-xs">
                          Action
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Daily Summary */}
            <Card className="mb-6 md:mb-8">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                  <CardTitle className="text-base md:text-lg">Today's Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                  {todayStats.map((stat) => (
                    <div
                      key={stat.title}
                      className={`${stat.bgColor} rounded-lg p-2 md:p-4 text-center`}
                    >
                      <div className={`inline-flex p-1.5 md:p-2 rounded-full ${stat.bgColor} mb-1 md:mb-2`}>
                        <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                      </div>
                      <div className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1 leading-tight">{stat.title}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
              <Card>
                <CardHeader className="p-4 md:p-6 pb-1 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Total Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats?.totalPosts || 0}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                    All time · +{stats?.newPostsToday || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 md:p-6 pb-1 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Active Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats?.totalActiveAnnouncements || 0}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">Currently displayed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 md:p-6 pb-1 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Engagement Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stats?.totalPosts && stats?.totalUsers
                      ? `${((stats.totalPosts / stats.totalUsers) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">Posts per user</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 space-y-2 md:space-y-3">
                  <Link
                    to="/admin/announcements/new"
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="p-1.5 md:p-2 rounded-lg bg-orange-500">
                      <Megaphone className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm md:text-base">Create Announcement</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">Push to all users</p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/reports"
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <div className="p-1.5 md:p-2 rounded-lg bg-red-500 relative">
                      <Flag className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      {(stats?.pendingReports || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center">
                          {stats?.pendingReports}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm md:text-base">Review Reports</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {(stats?.pendingReports || 0) > 0
                          ? `${stats?.pendingReports} pending`
                          : 'No pending reports'}
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/posts"
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="p-1.5 md:p-2 rounded-lg bg-blue-500">
                      <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm md:text-base">Manage Posts</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">Edit or remove posts</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Database</span>
                      <span className="flex items-center gap-2 text-green-600 text-sm md:text-base">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Real-time Updates</span>
                      <span className="flex items-center gap-2 text-green-600 text-sm md:text-base">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Storage</span>
                      <span className="flex items-center gap-2 text-green-600 text-sm md:text-base">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm md:text-base">Activity Tracking</span>
                      <span className="flex items-center gap-2 text-green-600 text-sm md:text-base">
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
