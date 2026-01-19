-- Multi-Tenant Schema Migration
-- Enables organization-based isolation with Row Level Security

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. ORGANIZATIONS (Tenants)
-- ============================================
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null, -- app.com/{slug} for white-label URLs
  logo_url text,
  primary_color text default '#f97316', -- Default to Paranet accent color
  secondary_color text default '#1e3a5f',
  subscription_status text default 'free' check (subscription_status in ('free', 'active', 'canceled', 'past_due', 'trialing')),
  subscription_plan text default 'free' check (subscription_plan in ('free', 'starter', 'pro', 'enterprise')),
  revenuecat_customer_id text,
  owner_id uuid not null references auth.users(id),
  settings jsonb default '{}', -- Flexible settings storage
  max_members integer default 5, -- Based on subscription plan
  features_enabled text[] default '{}', -- Feature flags per org
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for organizations
create index idx_organizations_slug on organizations(slug);
create index idx_organizations_owner on organizations(owner_id);
create index idx_organizations_subscription on organizations(subscription_status);

-- ============================================
-- 2. ORGANIZATION MEMBERS (User ↔ Org Mapping)
-- ============================================
create table organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  invited_by uuid references auth.users(id),
  invited_at timestamptz,
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- Indexes for organization_members
create index idx_org_members_org on organization_members(organization_id);
create index idx_org_members_user on organization_members(user_id);
create index idx_org_members_role on organization_members(role);

-- ============================================
-- 3. ORGANIZATION INVITES
-- ============================================
create table organization_invites (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role text default 'member' check (role in ('admin', 'member', 'viewer')),
  invited_by uuid not null references auth.users(id),
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- Index for invites
create index idx_org_invites_token on organization_invites(token);
create index idx_org_invites_email on organization_invites(email);

-- ============================================
-- 4. VIDEO MEETINGS (Jitsi Integration)
-- ============================================
create table video_meetings (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  room_id text unique not null, -- Secure random room name for Jitsi
  scheduled_at timestamptz,
  duration_minutes integer default 60,
  status text default 'scheduled' check (status in ('scheduled', 'active', 'ended', 'canceled')),
  host_id uuid not null references auth.users(id),
  max_participants integer default 10,
  recording_enabled boolean default false,
  waiting_room_enabled boolean default true,
  password text, -- Optional meeting password
  settings jsonb default '{}',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for video_meetings
create index idx_video_meetings_org on video_meetings(organization_id);
create index idx_video_meetings_room on video_meetings(room_id);
create index idx_video_meetings_host on video_meetings(host_id);
create index idx_video_meetings_scheduled on video_meetings(scheduled_at);
create index idx_video_meetings_status on video_meetings(status);

-- ============================================
-- 5. MEETING PARTICIPANTS
-- ============================================
create table meeting_participants (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid not null references video_meetings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text, -- For external participants
  name text,
  role text default 'participant' check (role in ('host', 'co-host', 'participant')),
  status text default 'invited' check (status in ('invited', 'joined', 'left', 'declined')),
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz default now(),
  unique (meeting_id, user_id)
);

-- Index for participants
create index idx_meeting_participants_meeting on meeting_participants(meeting_id);
create index idx_meeting_participants_user on meeting_participants(user_id);

-- ============================================
-- 6. SUBSCRIPTION HISTORY (RevenueCat Sync)
-- ============================================
create table subscription_events (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  event_type text not null, -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
  product_id text,
  entitlement_id text,
  revenue_cat_event_id text unique,
  event_data jsonb,
  created_at timestamptz default now()
);

-- Index for subscription events
create index idx_subscription_events_org on subscription_events(organization_id);
create index idx_subscription_events_type on subscription_events(event_type);

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table organization_invites enable row level security;
alter table video_meetings enable row level security;
alter table meeting_participants enable row level security;
alter table subscription_events enable row level security;

-- ============================================
-- 8. RLS POLICIES - ORGANIZATIONS
-- ============================================

-- Users can view organizations they belong to
create policy "Users can view their organizations"
on organizations for select
using (
  id in (
    select organization_id
    from organization_members
    where user_id = auth.uid()
  )
);

-- Users can view organization by slug (for white-label routing)
create policy "Anyone can view org by slug for routing"
on organizations for select
using (true);

-- Only owners can update their organization
create policy "Owners can update their organization"
on organizations for update
using (
  owner_id = auth.uid()
  or id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- Authenticated users can create organizations
create policy "Authenticated users can create organizations"
on organizations for insert
with check (auth.uid() is not null and owner_id = auth.uid());

-- Only owners can delete organizations
create policy "Owners can delete their organization"
on organizations for delete
using (owner_id = auth.uid());

-- ============================================
-- 9. RLS POLICIES - ORGANIZATION MEMBERS
-- ============================================

-- Members can view other members in their org
create policy "Members can view org members"
on organization_members for select
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid()
  )
);

-- Admins can add members
create policy "Admins can add members"
on organization_members for insert
with check (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- Admins can update member roles
create policy "Admins can update members"
on organization_members for update
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- Admins can remove members (but not owners)
create policy "Admins can remove members"
on organization_members for delete
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
  and role != 'owner'
);

-- ============================================
-- 10. RLS POLICIES - ORGANIZATION INVITES
-- ============================================

-- Admins can view invites
create policy "Admins can view invites"
on organization_invites for select
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- Anyone can view invite by token (for accepting)
create policy "Anyone can view invite by token"
on organization_invites for select
using (true);

-- Admins can create invites
create policy "Admins can create invites"
on organization_invites for insert
with check (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- Admins can delete invites
create policy "Admins can delete invites"
on organization_invites for delete
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- ============================================
-- 11. RLS POLICIES - VIDEO MEETINGS
-- ============================================

-- Members can view meetings in their org
create policy "Members can view org meetings"
on video_meetings for select
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid()
  )
);

-- Members can create meetings (if subscription allows)
create policy "Members can create meetings"
on video_meetings for insert
with check (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid()
  )
  and host_id = auth.uid()
);

-- Host can update their meetings
create policy "Host can update meetings"
on video_meetings for update
using (host_id = auth.uid());

-- Host can delete their meetings
create policy "Host can delete meetings"
on video_meetings for delete
using (host_id = auth.uid());

-- ============================================
-- 12. RLS POLICIES - MEETING PARTICIPANTS
-- ============================================

-- Participants can view meeting participants
create policy "Members can view meeting participants"
on meeting_participants for select
using (
  meeting_id in (
    select vm.id
    from video_meetings vm
    join organization_members om on vm.organization_id = om.organization_id
    where om.user_id = auth.uid()
  )
);

-- Host can add participants
create policy "Host can add participants"
on meeting_participants for insert
with check (
  meeting_id in (
    select id from video_meetings where host_id = auth.uid()
  )
);

-- Host can update participants
create policy "Host can update participants"
on meeting_participants for update
using (
  meeting_id in (
    select id from video_meetings where host_id = auth.uid()
  )
);

-- ============================================
-- 13. RLS POLICIES - SUBSCRIPTION EVENTS
-- ============================================

-- Only org owners/admins can view subscription events
create policy "Admins can view subscription events"
on subscription_events for select
using (
  organization_id in (
    select organization_id
    from organization_members
    where user_id = auth.uid() and role in ('owner', 'admin')
  )
);

-- ============================================
-- 14. HELPER FUNCTIONS
-- ============================================

-- Function to get user's current organization
create or replace function get_user_organization(p_user_id uuid)
returns uuid as $$
  select organization_id
  from organization_members
  where user_id = p_user_id
  order by created_at desc
  limit 1;
$$ language sql security definer;

-- Function to check if user has role in org
create or replace function user_has_org_role(p_user_id uuid, p_org_id uuid, p_roles text[])
returns boolean as $$
  select exists (
    select 1
    from organization_members
    where user_id = p_user_id
      and organization_id = p_org_id
      and role = any(p_roles)
  );
$$ language sql security definer;

-- Function to check subscription feature access
create or replace function org_has_feature(p_org_id uuid, p_feature text)
returns boolean as $$
  select
    subscription_status = 'active'
    and (
      p_feature = any(features_enabled)
      or subscription_plan in ('pro', 'enterprise')
    )
  from organizations
  where id = p_org_id;
$$ language sql security definer;

-- Function to generate secure meeting room ID
create or replace function generate_meeting_room_id(p_org_id uuid)
returns text as $$
  select p_org_id::text || '-' || encode(gen_random_bytes(16), 'hex');
$$ language sql;

-- ============================================
-- 15. TRIGGERS
-- ============================================

-- Auto-add owner as member when org is created
create or replace function auto_add_owner_as_member()
returns trigger as $$
begin
  insert into organization_members (organization_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_auto_add_owner
  after insert on organizations
  for each row
  execute function auto_add_owner_as_member();

-- Update timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_organizations_updated_at
  before update on organizations
  for each row
  execute function update_updated_at();

create trigger trigger_video_meetings_updated_at
  before update on video_meetings
  for each row
  execute function update_updated_at();

-- ============================================
-- 16. SUBSCRIPTION PLAN FEATURES
-- ============================================
comment on column organizations.subscription_plan is 'Plan features:
- free: 5 members, no video, basic features
- starter: 15 members, 5 video meetings/month, core features
- pro: 50 members, unlimited video, all features
- enterprise: unlimited members, custom features, priority support';
