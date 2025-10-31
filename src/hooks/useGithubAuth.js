import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'github-analytics-auth';

function readStoredAuth() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken || !parsed?.user?.login) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to read stored auth state', err);
    return null;
  }
}

function persistAuth(auth) {
  try {
    if (!auth) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    }
  } catch (err) {
    console.warn('Failed to persist auth state', err);
  }
}

function useGithubAuth() {
  const [status, setStatus] = useState('initializing');
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const exchangeInFlight = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = readStoredAuth();
    if (stored) {
      setAccessToken(stored.accessToken);
      setUser(stored.user);
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || exchangeInFlight.current) {
      return;
    }

    exchangeInFlight.current = true;
    setStatus('authenticating');
    setError(null);

    fetch('/api/auth/github/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: 'OAuth exchange failed.' }));
          throw new Error(payload.error || 'OAuth exchange failed.');
        }
        return response.json();
      })
      .then((payload) => {
        const authPayload = {
          accessToken: payload.accessToken,
          user: payload.user,
        };
        persistAuth(authPayload);
        setAccessToken(authPayload.accessToken);
        setUser(authPayload.user);
        setStatus('authenticated');
        setError(null);
      })
      .catch((err) => {
        console.error('OAuth exchange failed', err);
        persistAuth(null);
        setStatus('unauthenticated');
        setAccessToken(null);
        setUser(null);
        setError(err.message || 'GitHub authentication failed.');
      })
      .finally(() => {
        exchangeInFlight.current = false;
        if (typeof window !== 'undefined') {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      });
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      persistAuth({ accessToken, user });
    }
  }, [status, accessToken, user]);

  const login = useCallback(() => {
    window.location.assign('/api/auth/github/login');
  }, []);

  const logout = useCallback(() => {
    persistAuth(null);
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
    setError(null);
    fetch('/api/auth/github/logout', { method: 'POST' }).catch(() => undefined);
  }, []);

  return useMemo(
    () => ({
      status,
      user,
      accessToken,
      error,
      login,
      logout,
    }),
    [status, user, accessToken, error, login, logout]
  );
}

export default useGithubAuth;
