# Troubleshooting Post Creation Issues

If you're getting "Failed to create post" errors, follow these steps:

## 1. Check if the Posts Table Exists

Run this query in your Supabase SQL Editor:

```sql
SELECT * FROM posts LIMIT 1;
```

If you get an error saying the table doesn't exist, you need to run the database schema:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `DATABASE_SCHEMA.sql`
4. Run the script

## 2. Verify Row Level Security Policies

Check if the policies exist:

```sql
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

You should see these policies:
- "Users can view all posts" (SELECT)
- "Users can create posts" (INSERT)
- "Users can update their own posts" (UPDATE)
- "Users can delete their own posts" (DELETE)

If they don't exist, run this:

```sql
-- Posts policies
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```

## 3. Check Browser Console

Open your browser's developer console (F12) and look for detailed error messages. The error should now show:
- The actual error message from Supabase
- Details about what went wrong
- Hints for fixing the issue

## 4. Verify User Authentication

Make sure you're logged in. The post creation requires:
- A valid authenticated user
- The user must have a profile in the `profiles` table

## 5. Test with a Simple Query

Try creating a post directly in Supabase SQL Editor (replace `YOUR_USER_ID` with your actual user ID):

```sql
INSERT INTO posts (user_id, content, likes_count, comments_count)
VALUES ('YOUR_USER_ID', 'Test post', 0, 0)
RETURNING *;
```

If this fails, check:
- Does the `user_id` exist in `auth.users`?
- Is RLS enabled? Try temporarily disabling it to test:
  ```sql
  ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
  ```
  (Remember to re-enable it after testing!)

## 6. Common Issues

### Issue: "relation 'posts' does not exist"
**Solution**: Run the `DATABASE_SCHEMA.sql` script

### Issue: "new row violates row-level security policy"
**Solution**: Check that the INSERT policy exists and is correct

### Issue: "foreign key constraint fails"
**Solution**: Make sure the user exists in `auth.users` and has a profile

### Issue: "permission denied for table posts"
**Solution**: Check RLS policies and make sure you're authenticated

## 7. Check Network Tab

In browser DevTools → Network tab:
- Look for the request to Supabase
- Check the response for detailed error information
- Verify the request is being sent with authentication headers

## 8. Verify Environment Variables

Make sure your `.env` file has the correct Supabase credentials:
```
VITE_SUPABASE_URL=https://ibatkglpnvqjserqfjmm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Still Having Issues?

1. Check the browser console for the full error message
2. Check Supabase logs: Dashboard → Logs → API Logs
3. Verify your user is authenticated: Check if `supabase.auth.getUser()` returns a user
4. Try creating a post without an image first to isolate the issue
