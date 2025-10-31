import {
  addDays,
  differenceInCalendarDays,
  differenceInHours,
  format,
  formatDistanceToNowStrict,
  parseISO,
} from 'date-fns';

export function getDefaultDateRange() {
  const until = new Date();
  const since = addDays(until, -30);
  return { since, until };
}

export function formatForInput(value) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, 'yyyy-MM-dd');
}

export function buildSummary({ repositories, commits, pullRequests, since, until }) {
  const activeRepos = new Set(commits.map((commit) => commit.repo)).size;
  const uniqueAuthors = new Set(commits.map((commit) => commit.author)).size;
  const totalCommits = commits.length;

  const days = Math.max(differenceInCalendarDays(until, since), 1);
  const velocity = Math.round((totalCommits / days) * 7);

  const reviewDurations = pullRequests
    .filter((pr) => pr.state !== 'open' && pr.createdAt && (pr.closedAt || pr.mergedAt))
    .map((pr) => {
      const start = parseISO(pr.createdAt);
      const end = parseISO(pr.mergedAt || pr.closedAt);
      return differenceInHours(end, start);
    })
    .filter((value) => value >= 0)
    .sort((a, b) => a - b);

  const medianIndex = Math.floor(reviewDurations.length / 2);
  const reviewTurnaround = reviewDurations.length
    ? `${reviewDurations[medianIndex]}h`
    : 'n/a';

  const longLivedBranches = pullRequests.filter((pr) => {
    if (pr.state !== 'open') return false;
    const created = parseISO(pr.createdAt);
    return differenceInHours(new Date(), created) > 24 * 7;
  }).length;

  return {
    totalCommits,
    activeRepos,
    uniqueAuthors,
    velocity,
    reviewTurnaround,
    longLivedBranches,
    repositories: repositories.length,
  };
}

export function buildCommitActivityDataset(commits) {
  const grouped = new Map();
  commits.forEach((commit) => {
    if (!commit.date) return;
    const date = format(parseISO(commit.date), 'yyyy-MM-dd');
    const repoData = grouped.get(commit.repo) ?? new Map();
    repoData.set(date, (repoData.get(date) ?? 0) + 1);
    grouped.set(commit.repo, repoData);
  });

  const allDates = Array.from(
    new Set(
      Array.from(grouped.values()).flatMap((repoData) => Array.from(repoData.keys()))
    )
  ).sort();

  const colors = ['#2563eb', '#7c3aed', '#0ea5e9', '#10b981', '#f97316', '#ec4899'];

  const datasets = Array.from(grouped.entries()).map(([repo, repoData], index) => ({
    label: repo,
    data: allDates.map((date) => repoData.get(date) ?? 0),
    borderColor: colors[index % colors.length],
    backgroundColor: `${colors[index % colors.length]}33`,
    tension: 0.3,
    fill: true,
  }));

  return {
    labels: allDates,
    datasets,
  };
}

export function buildCommitTimeline(commits) {
  return [...commits]
    .filter((commit) => commit.date)
    .sort((a, b) => parseISO(b.date) - parseISO(a.date))
    .map((commit) => ({
      sha: commit.sha,
      repo: commit.repo,
      author: commit.author,
      message: commit.message,
      date: format(parseISO(commit.date), 'MMM dd, HH:mm'),
      filesChanged: commit.filesChanged,
    }));
}

export function buildPullRequestStatus(pullRequests) {
  const status = {
    open: 0,
    merged: 0,
    closed: 0,
    stale: [],
  };

  pullRequests.forEach((pr) => {
    if (pr.state === 'open') {
      status.open += 1;
      const created = parseISO(pr.createdAt);
      const ageHours = differenceInHours(new Date(), created);
      if (ageHours > 24 * 7) {
        status.stale.push({
          id: pr.id,
          title: pr.title,
          repo: pr.repo,
          ageHuman: formatDistanceToNowStrict(created, { addSuffix: true }),
          ageHours,
        });
      }
    } else if (pr.mergedAt) {
      status.merged += 1;
    } else {
      status.closed += 1;
    }
  });

  status.stale.sort((a, b) => b.ageHours - a.ageHours);
  status.stale = status.stale.map(({ ageHours, ...rest }) => rest);
  return status;
}

export function buildRepositoriesSnapshot(repositories) {
  return [...repositories].sort((a, b) => b.stars - a.stars);
}

export function buildInsights({ summary, pullRequestStatus, timeline }) {
  const insights = [];
  if (summary.velocity > 0) {
    insights.push(
      `Teams are shipping at ${summary.velocity} commits per week across ${summary.activeRepos} active repositories.`
    );
  }
  if (pullRequestStatus.open > 0) {
    insights.push(
      `${pullRequestStatus.open} pull requests are still open. ${pullRequestStatus.stale.length} have been waiting longer than a week.`
    );
  }
  if (summary.totalCommits > 120) {
    insights.push('Commit throughput is high — consider splitting reviews across more maintainers.');
  }
  if (summary.longLivedBranches > 0) {
    insights.push(
      `${summary.longLivedBranches} long-lived branches could be blocking merges. Encourage smaller, incremental PRs.`
    );
  }
  if (insights.length === 0) {
    insights.push('Fetching more data will unlock tailored insights about your workflow.');
  }
  return insights;
}

export function buildLanguageMix(languageMaps) {
  const totals = new Map();
  languageMaps.forEach(({ languages }) => {
    languages.forEach(({ name, percentage }) => {
      totals.set(name, (totals.get(name) ?? 0) + percentage);
    });
  });

  const combined = Array.from(totals.entries()).map(([name, percentage]) => ({
    name,
    percentage: Math.min(100, Math.round(percentage)),
  }));

  combined.sort((a, b) => b.percentage - a.percentage);
  return combined;
}
