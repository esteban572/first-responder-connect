# Paranet - First Responder Professional Network

A professional networking platform built specifically for first responders (firefighters, EMTs, police officers, etc.). Think LinkedIn meets first responder community - featuring social feeds, job boards, agency reviews, credential management, video meetings, and more.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Video Meetings**: Daily.co integration
- **Payments**: Stripe + RevenueCat (for subscriptions)
- **State Management**: React Query, React Context
- **Routing**: React Router v6

## Features

### Core Social Features
- **Social Feed** - Share posts with text, images, and location tags
- **User Profiles** - Comprehensive profiles with bio, credentials, media wall
- **Connections** - Send/accept connection requests, view mutual connections
- **Direct Messages** - Real-time messaging with read receipts
- **Notifications/Alerts** - Connection requests, agency invites, system alerts
- **User Search** - Find users by name, role, location, or agency

### Professional Features
- **Job Board** - Browse and apply to first responder job postings
- **Credentials Manager** - Track certifications with expiration reminders
- **Credential Showcase** - Public shareable page of your certifications
- **Agency Reviews** - Rate and review fire departments, EMS agencies, etc.
- **Gear Reviews** - Review equipment and gear with ratings

### Organization/Agency Features
- **Agency Management** - Create and manage your agency/organization
- **Team Members** - Invite members via email or shareable link
- **Role-Based Access** - Owner, Admin, Member, Viewer roles
- **Agency Branding** - Custom logo, colors, and URL slug
- **Subscription Plans** - Free, Pro, Enterprise tiers with different limits

### Groups
- **Public Groups** - Open communities anyone can join
- **Private Groups** - Invite-only groups with approval workflow
- **Group Roles** - Owner, Admin, Moderator, Member
- **Group Management** - Member list, invite system, settings

### Content & Events
- **Blog** - Admin-published articles with save/bookmark feature
- **Events** - Community events with RSVP functionality
- **Announcements** - System-wide announcements from admins

### Video Meetings (Agency Members Only)
- **Video Conferencing** - Built-in video meetings via Daily.co
- **Meeting Scheduling** - Create instant or scheduled meetings
- **Meeting Links** - Shareable room links for participants
- **Agency Restriction** - Only agency members can access meetings

### Admin Dashboard
- Post moderation and reported content
- User management
- Job posting management
- Blog/announcement editor
- Event management
- Analytics overview

## Getting Started

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn
- A Supabase account (free tier works)
- (Optional) Daily.co account for video meetings
- (Optional) Stripe account for payments

### Installation

```bash
# Clone the repository
git clone https://github.com/esteban572/first-responder-connect.git

# Navigate to project directory
cd first-responder-connect

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required - Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional - Daily.co Video Meetings
VITE_DAILY_API_KEY=your-daily-api-key

# Optional - Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional - RevenueCat (Mobile Subscriptions)
VITE_REVENUECAT_API_KEY=your-revenuecat-key

# Optional - Email Service (Mailgun)
VITE_EMAIL_PROVIDER=none
VITE_MAILGUN_API_KEY=your-mailgun-key
VITE_MAILGUN_DOMAIN=mg.yourdomain.com
VITE_FROM_EMAIL=noreply@paranet.app
VITE_FROM_NAME=Paranet
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your Project URL and anon key from Settings > API

### 2. Configure Authentication

1. Go to Authentication > Providers
2. Enable **Google** provider:
   - Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
   - Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
3. (Optional) Enable other providers as needed

### 3. Set Up Database Schema

Run the SQL migrations in your Supabase SQL Editor. The migrations are located in:

```
supabase/migrations/
```

Key tables include:
- `profiles` - User profiles
- `posts`, `post_likes`, `post_comments` - Social feed
- `connections` - User connections
- `messages`, `conversations` - Direct messaging
- `jobs`, `job_applications` - Job board
- `credentials` - User certifications
- `organizations`, `organization_members`, `organization_invites` - Agencies
- `groups`, `group_members`, `group_invites` - Social groups
- `gear_items`, `gear_reviews` - Gear reviews
- `agencies`, `agency_reviews` - Agency reviews
- `events`, `event_rsvps` - Events
- `blog_posts`, `saved_articles` - Blog
- `video_meetings` - Meeting records

### 4. Set Up Storage

Create the following storage buckets in Supabase Storage:

1. **profile-media** - For profile photos/videos
2. **post-images** - For feed post images
3. **credential-files** - For credential document uploads

For each bucket, set up RLS policies to allow authenticated users to upload/read their own files. See `STORAGE_SETUP.md` for detailed instructions.

### 5. Enable Realtime

Enable realtime for these tables (Database > Replication):
- `messages`
- `conversations`
- `posts`
- `notifications`

## Daily.co Setup (Video Meetings)

1. Create account at [daily.co](https://daily.co)
2. Get your API key from the dashboard
3. Add `VITE_DAILY_API_KEY` to your `.env`
4. Meetings are restricted to agency members only

## Development Workflow

### Running Locally

```bash
# Start dev server with hot reload
npm run dev

# Run type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # App layout (sidebar, nav)
│   ├── feed/        # Feed-related components
│   ├── groups/      # Group components
│   └── agency/      # Agency/org components
├── contexts/        # React contexts (Auth, Organization)
├── hooks/           # Custom React hooks
├── lib/             # Service functions & utilities
│   ├── supabase.ts  # Supabase client
│   ├── *Service.ts  # Feature service functions
│   └── utils.ts     # Utility functions
├── pages/           # Page components
│   └── admin/       # Admin dashboard pages
├── types/           # TypeScript type definitions
└── App.tsx          # Main app with routes
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/contexts/AuthContext.tsx` | Authentication state & methods |
| `src/contexts/OrganizationContext.tsx` | Organization/agency context |
| `src/lib/organizationService.ts` | Agency CRUD operations |
| `src/lib/groupService.ts` | Groups CRUD operations |
| `src/lib/messageService.ts` | Messaging functions |
| `src/lib/videoMeetingService.ts` | Video meeting functions |

## Pushing Changes

### Standard Git Workflow

```bash
# Check current status
git status

# Stage your changes
git add .

# Commit with descriptive message
git commit -m "Add feature: description of what you added"

# Push to remote
git push origin main
```

### Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add agency invite link functionality
fix: Resolve video meeting access check
refactor: Simplify group member queries
docs: Update README with setup instructions
```

### Before Pushing

1. **Run the build** to catch TypeScript errors:
   ```bash
   npm run build
   ```

2. **Test locally** - verify your changes work

3. **Check for console errors** in browser dev tools

## Database Migrations

When adding new features that require database changes:

1. Create a new migration file in `supabase/migrations/`
2. Name it with date prefix: `20260120_feature_name.sql`
3. Include:
   - Table creation
   - Indexes
   - RLS policies
   - Triggers (if needed)

4. Run the SQL in Supabase SQL Editor
5. Commit the migration file

## Deployment

### Via Lovable

1. Open your [Lovable project](https://lovable.dev)
2. Click Share > Publish
3. Your app will be deployed to a `.lovable.app` domain

### Via Vercel/Netlify

1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Deploy with default Vite settings

### Custom Domain

In Lovable: Project > Settings > Domains > Connect Domain

## Troubleshooting

### Common Issues

**Posts not showing**: Check RLS policies on `posts` table. See `TROUBLESHOOTING_POSTS.md`

**Auth not working**: Verify Google OAuth redirect URI matches your Supabase project URL

**Storage uploads failing**: Check bucket exists and RLS policies are configured. See `STORAGE_SETUP.md`

**Video meetings not working**: Verify Daily.co API key and that user is in an organization

### Debug Tips

1. Check browser console for errors
2. Check Supabase logs (Database > Logs)
3. Verify environment variables are set correctly
4. Test Supabase connection: check console for "Supabase connection test" log

## Additional Documentation

- `SUPABASE_SETUP.md` - Detailed Supabase configuration
- `STORAGE_SETUP.md` - Storage bucket setup guide
- `TROUBLESHOOTING_POSTS.md` - Feed/posts debugging
- `DIAGNOSTIC_CHECK.md` - System diagnostics

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run build to verify: `npm run build`
5. Commit and push
6. Open a Pull Request

## License

Private project - All rights reserved
