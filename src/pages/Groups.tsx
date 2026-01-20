// Groups Page
// List public groups and user's groups

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { GroupCard } from '@/components/groups/GroupCard';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users } from 'lucide-react';
import { Group } from '@/types/group';
import { getPublicGroups, getUserGroups } from '@/lib/groupService';

export default function Groups() {
  const navigate = useNavigate();
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    const [publicData, myData] = await Promise.all([
      getPublicGroups(),
      getUserGroups(),
    ]);
    setPublicGroups(publicData);
    setMyGroups(myData);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGroups();
      return;
    }

    setLoading(true);
    const data = await getPublicGroups({ search: searchQuery });
    setPublicGroups(data);
    setLoading(false);
  };

  const handleGroupCreated = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const filteredPublicGroups = publicGroups.filter(
    (g) => !myGroups.some((mg) => mg.id === g.id)
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">Groups</h1>
              <p className="text-muted-foreground">
                Connect with communities of first responders
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 md:px-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="my-groups">
                My Groups ({myGroups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover">
              {loading ? (
                <div className="feed-card p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading groups...</p>
                </div>
              ) : filteredPublicGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPublicGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="feed-card p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No groups found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Be the first to create a group'}
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Group
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-groups">
              {loading ? (
                <div className="feed-card p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading groups...</p>
                </div>
              ) : myGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="feed-card p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No groups yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join a group or create your own to get started
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setActiveTab('discover')}>
                      Discover Groups
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Group
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={handleGroupCreated}
      />
    </AppLayout>
  );
}
