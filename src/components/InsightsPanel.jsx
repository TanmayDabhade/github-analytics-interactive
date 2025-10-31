function InsightsPanel({ insights, languages }) {
  if (!insights) {
    return null;
  }

  return (
    <div>
      <h2>Curated insights</h2>
      <p>
        Machine generated observations based on your latest data. Use these to
        guide retros, identify risks, and celebrate momentum.
      </p>
      <ul style={{ paddingLeft: '1.2rem', marginTop: '1rem', color: '#1f2937' }}>
        {insights.map((insight, index) => (
          <li key={index} style={{ marginBottom: '0.75rem' }}>
            {insight}
          </li>
        ))}
      </ul>
      {languages && languages.length > 0 ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Language mix</h3>
          <div className="tag-cloud">
            {languages.map((language) => (
              <span className="tag" key={language.name}>
                {language.name}: {language.percentage}%
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default InsightsPanel;
