# GitHub Analytics Interactive

An interactive web dashboard that surfaces advanced GitHub insights for power users: commit cadence, pull request health, repository activity, and language mix. Authenticate via GitHub OAuth to unlock private repositories and richer metrics than what GitHub offers out of the box.

## Features

- **Secure GitHub connection** – Sign in with OAuth to grant read-only access without sharing personal access tokens.
- **Repository focus** – Choose the repositories that matter most to trim API calls and spotlight important work.
- **Commit cadence visualisation** – Beautiful line chart with per-repository commit counts across the selected date range.
- **Pull request health** – Track open, merged, and closed PRs, plus automatically surfaced stale work items.
- **Commit timeline** – Drill into the latest commits with author, message, and change metadata to jump straight into reviews.
- **Repository health table** – Compare stars, forks, open issues, and recent pushes for your flagship projects.
- **Curated insights** – Automatic narrative callouts to celebrate velocity and highlight risks, alongside a language usage breakdown.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure a GitHub OAuth app and copy the credentials into `.env`:

   ```bash
   cp .env.example .env
   # populate GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
   ```

   The OAuth app redirect URL should point to `http://localhost:5173/` during development.

3. Start the Vite dev server:

   ```bash
   npm run dev
   ```

4. In a separate terminal, run the OAuth helper server that exchanges authorization codes for access tokens:

   ```bash
   npm run server
   ```

5. Visit `http://localhost:5173` and sign in with GitHub. Select repositories (optional) and pick a date range to tailor the dashboard to the work you care about.

## Project structure

```text
src/
├── App.jsx                # Application shell and layout
├── components/            # Presentational dashboard components
├── hooks/useGithubAnalytics.js  # Orchestrates API calls and data shaping
├── hooks/useGithubAuth.js # Handles OAuth login lifecycle and token storage
├── services/github.js     # Thin GitHub REST API client
├── server/index.js        # Lightweight OAuth exchange server
└── utils/analytics.js     # Pure helpers for transforming raw data
```

## Deployment

Build the static bundle with:

```bash
npm run build
```

The generated assets in `dist/` can be served from any static hosting provider.

## Security notes

- OAuth access tokens are stored in `sessionStorage` and cleared on sign-out.
- Server-side state cookies protect the OAuth flow from CSRF replay.
- Only read-only scopes (`repo`, `read:org`) are requested and API usage remains client-side to minimise exposure.
