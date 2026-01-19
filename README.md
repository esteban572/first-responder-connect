# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Supabase Setup

This project is configured to use Supabase for backend services. To set up Supabase:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get your project credentials**:
   - Go to your Supabase project settings
   - Navigate to Settings > API
   - Copy your Project URL and anon/public key

3. **Configure environment variables**:
   - Create a `.env` file in the root directory (if it doesn't exist)
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Configure Google OAuth** (for authentication):
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable the Google provider
   - Add your Google OAuth credentials:
     - Get Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/)
     - Create a new OAuth 2.0 Client ID (Web application)
     - Add authorized redirect URI: `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`
     - Copy the Client ID and Client Secret to Supabase
   - Save the configuration

5. **Use Supabase in your code**:
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   // Example: Fetch data
   const { data, error } = await supabase
     .from('your_table')
     .select('*');
   ```

## Authentication

This app uses Google OAuth for authentication via Supabase. Users must sign in with Google to access protected routes.

- **Home page** (`/`): Sign-in page with Google authentication
- **Protected routes**: Feed, Jobs, Profile, Messages, and Alerts require authentication
- **Sign out**: Available in the desktop sidebar

## Database Setup

Before using the app, you need to set up the database schema in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `DATABASE_SCHEMA.sql`
4. Run the SQL script to create the required tables:
   - `profiles` - User profile information
   - `connections` - User connections/friendships
   - `media` - Photos and videos for user profiles
   - `posts` - Feed posts from users
   - `post_likes` - Post likes tracking
5. The script will also set up:
   - Row Level Security (RLS) policies
   - Automatic profile creation on user signup
   - Functions for incrementing/decrementing post likes
   - Indexes for better query performance

## Features

### User Profiles
- **Edit Profile**: Users can edit their profile information including name, role, location, bio, credentials, and images
- **View Profile**: View your own profile or other users' profiles
- **Profile Search**: Search for users by name, role, or location

### User Interactions
- **Connect**: Send connection requests to other users
- **Message**: Navigate to messages with other users
- **View Connections**: See connection status (pending, accepted, etc.)

### Media Management
- **Upload Photos & Videos**: Add photos and videos to your profile wall
- **Delete Media**: Remove photos and videos from your wall
- **View Media**: Browse photos and videos on your own and other users' profiles
- **Captions**: Add optional captions to your media

### Posts & Feed
- **Create Posts**: Share text, images, and location updates in the feed
- **View Feed**: See posts from all users in chronological order
- **Like Posts**: Like and unlike posts from other users
- **Post Images**: Attach images to your posts
- **Location Tags**: Add location information to your posts

### Navigation
- **Search Users**: Added to sidebar and mobile navigation
- **User Profile Pages**: Accessible via `/user/:userId` route

## Storage Setup

To enable photo and video uploads, you need to set up Supabase Storage:

1. **Create Storage Bucket**: See `STORAGE_SETUP.md` for detailed instructions
2. **Set Up Policies**: Configure Row Level Security policies for the bucket
3. **Test Upload**: Try uploading a photo or video from your profile

The storage bucket name should be: `profile-media`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
