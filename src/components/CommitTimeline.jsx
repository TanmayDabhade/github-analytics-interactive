function CommitTimeline({ timeline }) {
  if (!timeline) {
    return null;
  }

  return (
    <div>
      <h2>Recent commits</h2>
      <p>
        The latest commits across your repositories with author, message, and
        throughput metrics. Use it to jump straight into interesting changes.
      </p>
      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={{ width: '140px' }}>Date</th>
            <th style={{ width: '200px' }}>Repository</th>
            <th>Message</th>
            <th style={{ width: '140px' }}>Author</th>
            <th style={{ width: '100px' }}>Files</th>
          </tr>
        </thead>
        <tbody>
          {timeline.slice(0, 20).map((commit) => (
            <tr key={commit.sha}>
              <td>{commit.date}</td>
              <td>{commit.repo}</td>
              <td>{commit.message}</td>
              <td>{commit.author}</td>
              <td>{commit.filesChanged}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CommitTimeline;
