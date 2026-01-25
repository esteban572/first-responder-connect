import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const OAuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    currentUrl: '',
    supabaseUrl: '',
    redirectUrl: '',
  });

  useEffect(() => {
    setDebugInfo({
      currentUrl: window.location.origin,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
      redirectUrl: `${window.location.origin}/feed`,
    });
  }, []);

  const testGoogleAuth = async () => {
    console.log('🔍 Testing Google OAuth...');
    console.log('Current Origin:', window.location.origin);
    console.log('Redirect To:', `${window.location.origin}/feed`);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/feed`,
        },
      });

      console.log('OAuth Response:', { data, error });

      if (error) {
        console.error('❌ OAuth Error:', error);
        alert(`OAuth Error: ${error.message}`);
      } else {
        console.log('✅ OAuth initiated successfully');
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      alert(`Exception: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Paranet</span>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 OAuth Debug Tool</h1>
          <p className="text-gray-600 mb-8">
            This page helps debug Google OAuth configuration issues.
          </p>

          {/* Debug Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Configuration</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current URL Origin:</p>
                  <code className="block mt-1 p-2 bg-white rounded border text-sm">
                    {debugInfo.currentUrl}
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Supabase URL:</p>
                  <code className="block mt-1 p-2 bg-white rounded border text-sm">
                    {debugInfo.supabaseUrl}
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">OAuth Redirect URL:</p>
                  <code className="block mt-1 p-2 bg-white rounded border text-sm">
                    {debugInfo.redirectUrl}
                  </code>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Supabase Callback:</p>
                  <code className="block mt-1 p-2 bg-white rounded border text-sm">
                    {debugInfo.supabaseUrl.replace('https://', 'https://').split('.supabase.co')[0]}.supabase.co/auth/v1/callback
                  </code>
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test OAuth Flow</h2>
              <p className="text-gray-700 mb-4">
                Click the button below to test Google OAuth. Check the browser console (F12) for detailed logs.
              </p>
              <Button 
                onClick={testGoogleAuth}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                🧪 Test Google Sign-In
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Verification Checklist</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-medium">In Google Cloud Console, verify:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>OAuth client type is "Web application"</li>
                  <li>Authorized JavaScript origins includes: <code className="bg-white px-1 rounded">{debugInfo.currentUrl}</code></li>
                  <li>Authorized redirect URI includes the Supabase callback URL above</li>
                  <li>OAuth consent screen is configured</li>
                  <li>If in Testing mode, your email is added as a test user</li>
                  <li>Privacy Policy and Terms links are added</li>
                </ul>
              </div>
            </div>

            {/* Common Errors */}
            <div className="bg-red-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🐛 Common Errors</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-red-900">"Access blocked: This app's request is invalid"</p>
                  <p className="mt-1">→ OAuth client is not "Web application" type OR consent screen not configured</p>
                </div>
                <div>
                  <p className="font-medium text-red-900">"redirect_uri_mismatch"</p>
                  <p className="mt-1">→ Supabase callback URL not added to Google Console redirect URIs</p>
                </div>
                <div>
                  <p className="font-medium text-red-900">"invalid_client"</p>
                  <p className="mt-1">→ Client ID or Secret is incorrect in Supabase</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 Quick Links</h2>
              <div className="space-y-2">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-indigo-600 hover:underline"
                >
                  → Google Cloud Console - Credentials
                </a>
                <a 
                  href="https://console.cloud.google.com/apis/credentials/consent" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-indigo-600 hover:underline"
                >
                  → Google Cloud Console - OAuth Consent Screen
                </a>
                <a 
                  href="https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/providers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-indigo-600 hover:underline"
                >
                  → Supabase - Auth Providers
                </a>
                <a 
                  href="https://supabase.com/dashboard/project/ibatkglpnvqjserqfjmm/auth/url-configuration" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-indigo-600 hover:underline"
                >
                  → Supabase - URL Configuration
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthDebug;
