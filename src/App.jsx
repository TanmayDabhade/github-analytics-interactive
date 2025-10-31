import { useMemo, useState } from 'react';
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
import { getDefaultDateRange } from './utils/analytics.js';

function App() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [filters, setFilters] = useState({
    username: '',
    token: '',
    since: defaultRange.since,
    until: defaultRange.until,
    repos: [],
  });

  const { data, loading, error, loadAnalytics } = useGithubAnalytics();

  const handleLoad = async (formValues) => {
    const payload = {
      ...formValues,
      since: formValues.since || defaultRange.since,
      until: formValues.until || defaultRange.until,
    };

    setFilters(payload);
    await loadAnalytics(payload);
  };

  return (
    <div className="main-layout">
      <header>
        <h1>GitHub Analytics Interactive</h1>
        <p>
          Drill into contribution patterns, pull requests, and repository health
          with a dashboard tailored for power users. Authenticate with a
          personal access token to unlock private repositories, richer commit
          histories, and metadata that goes beyond built-in GitHub insights.
        </p>
      </header>

      <section className="dashboard grid-3" style={{ gridAutoRows: 'minmax(120px, auto)' }}>
        <div className="card grid-3">
          <CredentialsForm
            defaultValues={filters}
            repositories={data?.repositories ?? []}
            onSubmit={handleLoad}
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
              Enter a username to generate a live snapshot of repositories and
              contribution analytics. Start with a public user like
              <strong> torvalds </strong> or <strong> gaearon</strong> to see the
              dashboard in action.
            </p>
          </div>
        )}
      </section>

      {loading ? <LoadingOverlay /> : null}
    </div>
  );
}

export default App;
