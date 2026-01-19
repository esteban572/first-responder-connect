import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Also check query params (some flows use query params)
        const queryParams = new URLSearchParams(window.location.search);
        const errorDescription = queryParams.get('error_description');

        if (errorDescription) {
          setStatus('error');
          setMessage(errorDescription);
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session using the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus('error');
            setMessage(error.message);
            return;
          }

          if (type === 'signup' || type === 'email_change') {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting...');
          } else if (type === 'recovery') {
            setStatus('success');
            setMessage('Password reset verified! Redirecting...');
          } else {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
          }

          // Redirect to feed after a short delay
          setTimeout(() => {
            navigate('/feed');
          }, 2000);
        } else {
          // No tokens in URL, check if we have an existing session
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            setStatus('success');
            setMessage('Already authenticated! Redirecting...');
            setTimeout(() => {
              navigate('/feed');
            }, 1500);
          } else {
            setStatus('error');
            setMessage('Invalid or expired verification link. Please try again.');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button
                onClick={() => navigate('/')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
