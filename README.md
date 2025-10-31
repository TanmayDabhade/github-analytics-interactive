# GitHub Analytics Interactive

An interactive web dashboard that surfaces advanced GitHub insights for power users: commit cadence, pull request health, repository activity, and language mix. Authenticate with a personal access token to unlock private repositories and richer metrics than what GitHub offers out of the box.

## Features

- **Secure GitHub connection** – Enter a username with optional personal access token. Tokens stay in the browser and enable analysis of private repositories.
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

2. Start the Vite dev server:

   ```bash
   npm run dev
   ```

3. Visit `http://localhost:5173` and enter a GitHub username. For private repositories, generate a [fine-grained personal access token](https://github.com/settings/tokens) with `repo` and `read:org` scopes and paste it into the token field.

4. Select repositories (optional) and pick a date range to tailor the dashboard to the work you care about.

## Project structure

```text
src/
├── App.jsx                # Application shell and layout
├── components/            # Presentational dashboard components
├── hooks/useGithubAnalytics.js  # Orchestrates API calls and data shaping
├── services/github.js     # Thin GitHub REST API client
└── utils/analytics.js     # Pure helpers for transforming raw data
```

## Deployment

Build the static bundle with:

```bash
npm run build
```

The generated assets in `dist/` can be served from any static hosting provider.

## Security notes

- Personal access tokens never leave the browser; they are injected into fetch requests at runtime.
- Only read-only endpoints are used and the client caps requests per repo to reduce rate-limit risk.
- Clear your token from the form after use if you share your machine.
