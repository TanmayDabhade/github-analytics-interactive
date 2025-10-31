function AnalyticsSummary({ summary }) {
  if (!summary) {
    return null;
  }

  const metrics = [
    {
      key: 'totalCommits',
      label: 'Commits analysed',
      value: summary.totalCommits.toLocaleString(),
    },
    {
      key: 'activeRepos',
      label: 'Active repositories',
      value: summary.activeRepos.toLocaleString(),
    },
    {
      key: 'uniqueAuthors',
      label: 'Unique authors',
      value: summary.uniqueAuthors.toLocaleString(),
    },
    {
      key: 'velocity',
      label: 'Weekly velocity',
      value: `${summary.velocity} commits`,
    },
    {
      key: 'reviewTurnaround',
      label: 'Median PR review time',
      value: summary.reviewTurnaround,
    },
    {
      key: 'longLivedBranches',
      label: 'Long lived branches',
      value: summary.longLivedBranches,
    },
  ];

  return (
    <div>
      <h2>Pulse overview</h2>
      <p>
        Quick glance at your organisation&apos;s current engineering heartbeat.
        Velocity, collaboration and review health metrics update as soon as new
        data is fetched.
      </p>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div className="metric" key={metric.key}>
            <h3>{metric.label}</h3>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalyticsSummary;
