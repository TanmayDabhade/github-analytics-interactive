import { useCallback, useEffect, useMemo, useState } from 'react';
import CredentialsForm from './components/CredentialsForm.jsx';
import AnalyticsSummary from './components/AnalyticsSummary.jsx';
import CommitActivityChart from './components/CommitActivityChart.jsx';
import PullRequestStatus from './components/PullRequestStatus.jsx';
import CommitTimeline from './components/CommitTimeline.jsx';
import RepositoriesTable from './components/RepositoriesTable.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import LoadingOverlay from './components/LoadingOverlay.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';
import useGithubAnalytics from './hooks/useGithubAnalytics.js';
import useGithubAuth from './hooks/useGithubAuth.js';
import { getDefaultDateRange } from './utils/analytics.js';

function App() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [filters, setFilters] = useState({
    since: defaultRange.since,
    until: defaultRange.until,
    repos: [],
  });

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const { data, loading, error, loadAnalytics, reset } = useGithubAnalytics();
  const auth = useGithubAuth();

  const handleLoad = useCallback(
    async (formValues) => {
      if (!auth?.accessToken || !auth?.user?.login) {
        return;
      }

      const payload = {
        ...formValues,
        username: auth.user.login,
        token: auth.accessToken,
        since: formValues.since || defaultRange.since,
        until: formValues.until || defaultRange.until,
      };

      setFilters({
        since: payload.since,
        until: payload.until,
        repos: payload.repos ?? [],
      });

      await loadAnalytics(payload);
    },
    [auth?.accessToken, auth?.user?.login, defaultRange.since, defaultRange.until, loadAnalytics]
  );

  useEffect(() => {
    if (auth.status === 'authenticated' && auth.accessToken && auth.user?.login) {
      if (!initialLoadComplete) {
        handleLoad(filters).finally(() => setInitialLoadComplete(true));
      }
    } else if (auth.status === 'unauthenticated') {
      setInitialLoadComplete(false);
      reset();
      const hasCustomFilters =
        filters.repos.length > 0 ||
        (filters.since && filters.since.getTime?.() !== defaultRange.since.getTime?.()) ||
        (filters.until && filters.until.getTime?.() !== defaultRange.until.getTime?.());
      if (hasCustomFilters) {
        setFilters({
          since: defaultRange.since,
          until: defaultRange.until,
          repos: [],
        });
      }
    }
  }, [
    auth.status,
    auth.accessToken,
    auth.user?.login,
    filters,
    handleLoad,
    initialLoadComplete,
    defaultRange,
    reset,
  ]);

  return (
    <div className="main-layout">
      <header>
        <h1>GitHub Analytics Interactive</h1>
        <p>
          Drill into contribution patterns, pull requests, and repository health
          with a dashboard tailored for power users. Connect with GitHub OAuth
          to analyse your personal or organization activity with richer commit
          histories and metadata that go beyond built-in insights.
        </p>
      </header>

      <section className="dashboard grid-3" style={{ gridAutoRows: 'minmax(120px, auto)' }}>
        <div className="card grid-3">
          <CredentialsForm
            defaultValues={filters}
            repositories={data?.repositories ?? []}
            onSubmit={handleLoad}
            authStatus={auth.status}
            authError={auth.error}
            authenticatedUser={auth.user}
            onLogin={auth.login}
            onLogout={auth.logout}
          />
          {error ? <ErrorBanner message={error} /> : null}
        </div>

        {data ? (
          <>
            <div className="card grid-3">
              <AnalyticsSummary summary={data.summary} />
            </div>
            <div className="card grid-2">
              <CommitActivityChart dataset={data.commitActivity} />
            </div>
            <div className="card">
              <PullRequestStatus status={data.pullRequestStatus} />
            </div>
            <div className="card grid-2">
              <RepositoriesTable repositories={data.repositories} />
            </div>
            <div className="card grid-3">
              <CommitTimeline timeline={data.commitTimeline} />
            </div>
            <div className="card">
              <InsightsPanel insights={data.insights} languages={data.languages} />
            </div>
          </>
        ) : (
          <div className="card grid-3">
            <p>
              Authenticate with GitHub to generate a live snapshot of your
              repositories and contribution analytics. Once connected, adjust
              the date range or focus repositories to refine the insights.
            </p>
          </div>
        )}
      </section>

      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}

export default App;
