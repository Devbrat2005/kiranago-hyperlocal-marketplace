import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';

export default function GoogleSignInButton({ onSuccess, text = 'Continue with Google', className = '' }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clientId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || '';

  useEffect(() => {
    // Load Google Identity Services script if client ID exists
    if (!clientId) return;

    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleGSI();
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGoogleGSI();
    }
  }, [clientId]);

  const initGoogleGSI = () => {
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
      } catch (err) {
        console.warn('GSI init error:', err.message);
      }
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
        if (onSuccess) onSuccess(data);
      } else {
        setErrorMsg(data.message || 'Google Sign-In failed');
      }
    } catch (err) {
      setErrorMsg('Network error during Google authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setErrorMsg('');
    // 1. Try Google Identity Services prompt if initialized
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to OAuth backend redirect flow
            window.location.href = getApiUrl('/api/auth/google');
          }
        });
        return;
      } catch (err) {
        console.warn('GSI prompt notice:', err.message);
      }
    }

    // 2. Direct backend OAuth redirect flow fallback
    window.location.href = getApiUrl('/api/auth/google');
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer hover:border-slate-300 active:scale-98 text-xs sm:text-sm ${className}`}
      >
        {loading ? (
          <span className="flex items-center gap-2 text-slate-500">
            <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Authenticating with Google...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <p className="text-[11px] text-rose-600 font-bold text-center animate-fadeIn">{errorMsg}</p>
      )}
    </div>
  );
}
