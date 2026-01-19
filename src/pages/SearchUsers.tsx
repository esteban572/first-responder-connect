import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
import { searchUsers } from '@/lib/userService';
import { UserProfile } from '@/types/user';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const SearchUsers = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const results = await searchUsers(query);
      // Filter out current user
      const filtered = results.filter((u) => u.id !== currentUser?.id);
      setUsers(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6 px-4 md:px-0">
        <div className="space-y-6">
          {/* Search Header */}
          <div className="feed-card">
            <h1 className="text-2xl font-bold mb-4">Search Users</h1>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, role, or location..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !query.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {searched && (
            <div>
              {loading ? (
                <div className="feed-card p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Searching...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="feed-card p-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found. Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground px-1">
                    Found {users.length} user{users.length !== 1 ? 's' : ''}
                  </p>
                  {users.map((user) => (
                    <Card key={user.id} className="p-4 hover:bg-accent/5 transition-colors">
                      <Link to={`/user/${user.id}`} className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {getUserInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{user.role}</p>
                          {user.location && (
                            <p className="text-xs text-muted-foreground mt-1">{user.location}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="feed-card p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Enter a search term to find other first responders
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SearchUsers;
