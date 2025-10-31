import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const app = express();
const PORT = process.env.SERVER_PORT ?? process.env.PORT ?? 5174;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GITHUB_REDIRECT_URI ?? 'http://localhost:5173/';
const STATE_COOKIE = 'github_oauth_state';
const COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes

app.use(cookieParser());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/auth/github/login', (req, res) => {
  if (!CLIENT_ID) {
    res
      .status(500)
      .json({ error: 'GitHub client ID is not configured on the server.' });
    return;
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'repo read:user',
    state,
    allow_signup: 'false',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.post('/api/auth/github/exchange', async (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.status(500).json({
      error: 'GitHub OAuth credentials are not configured on the server.',
    });
    return;
  }

  const { code, state } = req.body ?? {};
  if (!code || !state) {
    res.status(400).json({ error: 'Missing OAuth code or state.' });
    return;
  }

  const storedState = req.cookies?.[STATE_COOKIE];
  if (!storedState || storedState !== state) {
    res.status(400).json({ error: 'State verification failed.' });
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        state,
      }),
    });

    const payload = await response.json();
    if (!response.ok || payload.error || !payload.access_token) {
      const message = payload.error_description || payload.error || 'OAuth exchange failed.';
      res.status(400).json({ error: message });
      return;
    }

    const accessToken = payload.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userResponse.ok) {
      const details = await userResponse.text();
      res.status(502).json({
        error: `Failed to fetch authenticated user profile: ${details || userResponse.statusText}`,
      });
      return;
    }

    const user = await userResponse.json();

    res.clearCookie(STATE_COOKIE, { path: '/' });

    res.json({
      accessToken,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        avatarUrl: user.avatar_url,
        htmlUrl: user.html_url,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'OAuth exchange failed.' });
  }
});

app.post('/api/auth/github/logout', (req, res) => {
  res.clearCookie(STATE_COOKIE, { path: '/' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`GitHub OAuth helper listening on http://localhost:${PORT}`);
});
