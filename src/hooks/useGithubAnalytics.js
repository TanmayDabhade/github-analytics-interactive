import { useCallback, useState } from 'react';
import {
  fetchRepositories,
  fetchCommitsForRepo,
  fetchPullRequestsForRepo,
  fetchLanguagesForRepo,
} from '../services/github.js';
import {
  buildCommitActivityDataset,
  buildCommitTimeline,
  buildInsights,
  buildLanguageMix,
  buildPullRequestStatus,
  buildRepositoriesSnapshot,
  buildSummary,
} from '../utils/analytics.js';

function useGithubAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async ({
    username,
    token,
    since,
    until,
    repos,
  }) => {
    if (!username) {
      setError('Please enter a GitHub username.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const repositoryList = await fetchRepositories({ username, token });
      if (repositoryList.length === 0) {
        throw new Error('No repositories found. Check your username or token.');
      }

      const filteredRepositories = repos?.length
        ? repositoryList.filter((repo) => repos.includes(repo.name))
        : repositoryList;

      const selectedRepositories = filteredRepositories.slice(0, 10);

      const analytics = await Promise.all(
        selectedRepositories.map(async (repo) => {
          const [commits, pullRequests, languages] = await Promise.all([
            fetchCommitsForRepo({
              owner: repo.owner,
              name: repo.name,
              token,
              since,
              until,
            }),
            fetchPullRequestsForRepo({
              owner: repo.owner,
              name: repo.name,
              token,
              since,
              until,
            }),
            fetchLanguagesForRepo({ owner: repo.owner, name: repo.name, token }),
          ]);

          return {
            repo,
            commits,
            pullRequests,
            languages,
          };
        })
      );

      const allCommits = analytics.flatMap(({ repo, commits }) =>
        commits.map((commit) => ({
          ...commit,
          repo: repo.name,
        }))
      );

      const allPullRequests = analytics.flatMap(({ repo, pullRequests }) =>
        pullRequests.map((pr) => ({
          ...pr,
          repo: repo.name,
        }))
      );

      const languageMaps = analytics.map(({ repo, languages }) => ({
        repo: repo.name,
        languages,
      }));

      const summary = buildSummary({
        repositories: selectedRepositories,
        commits: allCommits,
        pullRequests: allPullRequests,
        since,
        until,
      });

      const commitActivity = buildCommitActivityDataset(allCommits);
      const commitTimeline = buildCommitTimeline(allCommits);
      const pullRequestStatus = buildPullRequestStatus(allPullRequests);
      const repositoriesSnapshot = buildRepositoriesSnapshot(selectedRepositories);
      const insights = buildInsights({
        summary,
        pullRequestStatus,
        timeline: commitTimeline,
      });
      const languages = buildLanguageMix(languageMaps);

      setData({
        summary,
        commitActivity,
        commitTimeline,
        pullRequestStatus,
        repositories: repositoriesSnapshot,
        insights,
        languages,
      });
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, loadAnalytics };
}

export default useGithubAnalytics;
