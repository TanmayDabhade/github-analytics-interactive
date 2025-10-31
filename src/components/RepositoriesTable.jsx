function RepositoriesTable({ repositories }) {
  if (!repositories || repositories.length === 0) {
    return null;
  }

  return (
    <div>
      <h2>Repository health</h2>
      <p>
        Highlights the busiest repositories with last push dates, open issues,
        and productivity signals. Sorts by stargazers to surface flagship
        projects first.
      </p>
      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Repository</th>
            <th>Stars</th>
            <th>Forks</th>
            <th>Open issues</th>
            <th>Last push</th>
            <th>Primary language</th>
          </tr>
        </thead>
        <tbody>
          {repositories.slice(0, 15).map((repo) => (
            <tr key={repo.id}>
              <td>{repo.name}</td>
              <td>{repo.stars.toLocaleString()}</td>
              <td>{repo.forks.toLocaleString()}</td>
              <td>{repo.openIssues.toLocaleString()}</td>
              <td>{repo.lastPushed}</td>
              <td>{repo.language ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RepositoriesTable;
