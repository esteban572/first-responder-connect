import { supabase } from './supabase';

/**
 * Test Supabase connection and configuration
 * Run this in browser console: testSupabaseConnection()
 */
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // 1. Check environment variables
  console.log('1. Environment Variables:');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('   VITE_SUPABASE_URL:', supabaseUrl || '❌ MISSING');
  console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ MISSING');
  console.log('');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Environment variables are missing!');
    return;
  }

  // 2. Check authentication
  console.log('2. Authentication Status:');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('   ❌ Auth Error:', authError.message);
  } else if (user) {
    console.log('   ✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);
  } else {
    console.log('   ⚠️  No user authenticated');
  }
  console.log('');

  // 3. Test database connection - Check if profiles table exists
  console.log('3. Database Tables:');
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (profilesError) {
    console.error('   ❌ Profiles table error:', profilesError.message);
    console.error('   Error code:', profilesError.code);
    console.error('   Error details:', profilesError.details);
    console.error('   Error hint:', profilesError.hint);
  } else {
    console.log('   ✅ Profiles table exists and is accessible');
  }

  // Check if posts table exists
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('id')
    .limit(1);

  if (postsError) {
    console.error('   ❌ Posts table error:', postsError.message);
    console.error('   Error code:', postsError.code);
    console.error('   Error details:', postsError.details);
    console.error('   Error hint:', postsError.hint);
  } else {
    console.log('   ✅ Posts table exists and is accessible');
  }
  console.log('');

  // 4. Test storage bucket
  console.log('4. Storage Bucket:');
  const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
  if (storageError) {
    console.error('   ❌ Storage error:', storageError.message);
  } else {
    const profileMediaBucket = buckets?.find(b => b.name === 'profile-media');
    if (profileMediaBucket) {
      console.log('   ✅ profile-media bucket exists');
    } else {
      console.log('   ⚠️  profile-media bucket not found');
      console.log('   Available buckets:', buckets?.map(b => b.name).join(', ') || 'none');
    }
  }
  console.log('');

  // 5. Summary
  console.log('📊 Summary:');
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseKey;
  const hasUser = !!user;
  const hasProfiles = !profilesError;
  const hasPosts = !postsError;

  console.log(`   Environment: ${hasUrl && hasKey ? '✅' : '❌'}`);
  console.log(`   Authentication: ${hasUser ? '✅' : '⚠️'}`);
  console.log(`   Profiles table: ${hasProfiles ? '✅' : '❌'}`);
  console.log(`   Posts table: ${hasPosts ? '✅' : '❌'}`);

  if (!hasProfiles || !hasPosts) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run the DATABASE_SCHEMA.sql script');
    console.log('   3. Refresh this page and run the test again');
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
