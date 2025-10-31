import { formatDistanceToNowStrict, parseISO } from 'date-fns';

const API_BASE = 'https://api.github.com';
const MAX_PAGES = 2;

async function fetchWithAuth(path, token, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        }
      : { Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `GitHub API error (${response.status}): ${errorMessage || response.statusText}`
    );
  }

  return response.json();
}

export async function fetchRepositories({ username, token, self = false }) {
  const path = self ? '/user/repos' : `/users/${username}/repos`;
  if (!self && !username) {
    throw new Error('A username is required to list repositories.');
  }

  const repositories = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await fetchWithAuth(path, token, {
      per_page: 100,
      page,
      sort: 'pushed',
      direction: 'desc',
    });

    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    repositories.push(
      ...payload.map((repo) => ({
        id: repo.id,
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        lastPushed: formatDistanceToNowStrict(parseISO(repo.pushed_at), {
          addSuffix: true,
        }),
        language: repo.language,
        visibility: repo.private ? 'private' : 'public',
      }))
    );

    if (payload.length < 100) {
      break;
    }
  }

  return repositories;
}

export async function fetchCommitsForRepo({ owner, name, token, since, until }) {
  const commits = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await fetchWithAuth(
      `/repos/${owner}/${name}/commits`,
      token,
      {
        per_page: 100,
        page,
        since: since?.toISOString?.(),
        until: until?.toISOString?.(),
      }
    );

    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    commits.push(
      ...payload.map((commit) => ({
        sha: commit.sha,
        author: commit.commit?.author?.name ?? commit.author?.login ?? 'Unknown',
        message: commit.commit?.message?.split('\n')[0] ?? 'No message',
        date: commit.commit?.author?.date,
        additions: commit.stats?.additions ?? 0,
        deletions: commit.stats?.deletions ?? 0,
        filesChanged: commit.stats?.total ?? '—',
      }))
    );

    if (payload.length < 100) {
      break;
    }
  }

  return commits;
}

export async function fetchPullRequestsForRepo({
  owner,
  name,
  token,
  since,
  until,
}) {
  const pullRequests = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await fetchWithAuth(`/repos/${owner}/${name}/pulls`, token, {
      per_page: 50,
      page,
      state: 'all',
      sort: 'updated',
      direction: 'desc',
    });

    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    pullRequests.push(
      ...payload
        .filter((pr) => {
          const created = pr.created_at ? new Date(pr.created_at) : null;
          if (!created) return true;
          if (since && created < since) return false;
          if (until && created > until) return false;
          return true;
        })
        .map((pr) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          createdAt: pr.created_at,
          closedAt: pr.closed_at,
          mergedAt: pr.merged_at,
          url: pr.html_url,
          draft: pr.draft,
        }))
    );

    if (payload.length < 50) {
      break;
    }
  }

  return pullRequests;
}

export async function fetchLanguagesForRepo({ owner, name, token }) {
  const payload = await fetchWithAuth(`/repos/${owner}/${name}/languages`, token);
  const totalBytes = Object.values(payload).reduce((acc, value) => acc + value, 0);
  return Object.entries(payload).map(([language, bytes]) => ({
    name: language,
    percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
  }));
}
