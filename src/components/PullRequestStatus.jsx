function PullRequestStatus({ status }) {
  if (!status) {
    return null;
  }

  return (
    <div>
      <h2>Pull request flow</h2>
      <p>
        Track the state of pull requests across your focus repositories. Spot
        bottlenecks by reviewing open, merged, and closed-without-merge work.
      </p>
      <ul className="list-inline" style={{ marginTop: '1rem' }}>
        <li className="status-pill status-open">Open: {status.open}</li>
        <li className="status-pill status-merged">Merged: {status.merged}</li>
        <li className="status-pill status-closed">Closed: {status.closed}</li>
      </ul>
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Oldest open pull requests</h3>
        {status.stale.length === 0 ? (
          <p style={{ color: '#475569' }}>No open pull requests older than a week.</p>
        ) : (
          <ul style={{ paddingLeft: '1rem', color: '#1f2937' }}>
            {status.stale.map((pr) => (
              <li key={pr.id} style={{ marginBottom: '0.35rem' }}>
                <strong>{pr.title}</strong> in {pr.repo} • opened {pr.ageHuman}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PullRequestStatus;
