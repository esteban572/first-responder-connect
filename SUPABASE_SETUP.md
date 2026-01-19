# Supabase Google OAuth Setup Guide

## Quick Setup Steps

### 1. Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `ibatkglpnvqjserqfjmm`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to enable it
5. Enter your Google OAuth credentials:
   - **Client ID (for OAuth)**: `84672748074-ofa9138bc1ar6s37d0jhdqejlkevfb71.apps.googleusercontent.com`
   - **Client Secret (for OAuth)**: [Enter your Client Secret from Google Cloud Console]

### 2. Important: Authorized Redirect URI

Make sure you've added this redirect URI in your **Google Cloud Console**:

```
https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback
```

### 3. How to Get Your Client Secret

If you don't have your Client Secret yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one matching the Client ID above)
5. Click on it to view details
6. Copy the **Client secret** value
7. Paste it into Supabase's Google provider settings

### 4. Enable Required APIs

In Google Cloud Console, make sure these APIs are enabled:
- **Google+ API** (or **People API**)
- **OAuth2 API**

### 5. Test the Configuration

After saving in Supabase:
1. Start your development server: `npm run dev`
2. Visit `http://localhost:8080` (or your dev URL)
3. Click "Continue with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your app

## Troubleshooting

### Common Issues

**"redirect_uri_mismatch" error:**
- Make sure the redirect URI in Google Cloud Console exactly matches: `https://ibatkglpnvqjserqfjmm.supabase.co/auth/v1/callback`
- Check for typos or extra spaces

**"invalid_client" error:**
- Verify your Client ID and Client Secret are correct
- Make sure you copied the full Client ID including `.apps.googleusercontent.com`

**Authentication not working:**
- Check that Google provider is enabled in Supabase
- Verify your environment variables are set correctly in `.env`
- Check browser console for any errors

## Environment Variables

Your `.env` file should contain:
```
VITE_SUPABASE_URL=https://ibatkglpnvqjserqfjmm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Need Help?

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
