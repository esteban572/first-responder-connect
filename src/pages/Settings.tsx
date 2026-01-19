import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bell, Shield, HelpCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'GU';
    const name = user.user_metadata?.full_name || user.email || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Guest User';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Account Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{getUserName()}</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Profile Link */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              View & Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => navigate('/alerts')}
            >
              <Bell className="h-4 w-4" />
              View Alerts & Notifications
            </Button>
          </CardContent>
        </Card>

        {/* Admin Section - Only for Admins */}
        {isAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administration
              </CardTitle>
              <CardDescription>Access admin tools and CMS</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => navigate('/admin')}
              >
                <Shield className="h-4 w-4" />
                Go to Admin CMS
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </CardTitle>
            <CardDescription>Get help with Paranet</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>Need help? Contact support at support@paranet.com</p>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <p className="text-center text-sm text-gray-500 mt-3">
              You will be redirected to the home page
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
