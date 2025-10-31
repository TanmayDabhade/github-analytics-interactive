import { useEffect, useMemo, useState } from 'react';
import { formatForInput } from '../utils/analytics.js';

const DATE_FIELD_ID = 'github-analytics-date';

function CredentialsForm({ defaultValues, onSubmit, repositories }) {
  const [formValues, setFormValues] = useState({
    username: defaultValues.username,
    token: defaultValues.token,
    since: defaultValues.since,
    until: defaultValues.until,
    repos: defaultValues.repos ?? [],
  });

  useEffect(() => {
    setFormValues({
      username: defaultValues.username,
      token: defaultValues.token,
      since: defaultValues.since,
      until: defaultValues.until,
      repos: defaultValues.repos ?? [],
    });
  }, [defaultValues]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formValues,
      since: formValues.since ? new Date(formValues.since) : undefined,
      until: formValues.until ? new Date(formValues.until) : undefined,
    };
    onSubmit(payload);
  };

  const toggleRepository = (name) => {
    setFormValues((current) => {
      const repos = new Set(current.repos);
      if (repos.has(name)) {
        repos.delete(name);
      } else {
        repos.add(name);
      }

      return {
        ...current,
        repos: Array.from(repos),
      };
    });
  };

  const repositoryOptions = useMemo(() => {
    const sorted = [...repositories];
    sorted.sort((a, b) => b.stars - a.stars);
    return sorted.slice(0, 50);
  }, [repositories]);

  const selectedCount = formValues.repos?.length ?? 0;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connect to GitHub</h2>
      <p>
        Provide your GitHub username and an optional personal access token. We
        only request read-only repository metadata and never persist your
        credentials.
      </p>

      <div className="input-group">
        <label htmlFor="username">
          Username
          <input
            id="username"
            name="username"
            required
            placeholder="hubber extraordinaire"
            value={formValues.username}
            onChange={handleChange('username')}
          />
        </label>

        <label htmlFor="token">
          Personal access token (optional)
          <input
            id="token"
            name="token"
            type="password"
            placeholder="ghp_your_super_secret_token"
            value={formValues.token}
            onChange={handleChange('token')}
            autoComplete="off"
          />
        </label>

        <label htmlFor={`${DATE_FIELD_ID}-since`}>
          Since
          <input
            id={`${DATE_FIELD_ID}-since`}
            type="date"
            value={formatForInput(formValues.since)}
            onChange={handleChange('since')}
          />
        </label>

        <label htmlFor={`${DATE_FIELD_ID}-until`}>
          Until
          <input
            id={`${DATE_FIELD_ID}-until`}
            type="date"
            value={formatForInput(formValues.until)}
            onChange={handleChange('until')}
          />
        </label>
      </div>

      {repositoryOptions.length > 0 ? (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.75rem' }}>Focus repositories</h3>
          <p style={{ margin: '0 0 1rem', color: '#475569' }}>
            Narrow the analysis to high-signal repositories. Select up to 10 to
            reduce GitHub API calls and speed up dashboards.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '0.25rem',
            }}
          >
            {repositoryOptions.map((repo) => {
              const checked = formValues.repos.includes(repo.name);
              return (
                <label
                  key={repo.id}
                  style={{
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    backgroundColor: checked
                      ? 'rgba(59, 130, 246, 0.12)'
                      : 'rgba(255,255,255,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRepository(repo.name)}
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {repo.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      ⭐ {repo.stars.toLocaleString()} • Forks:{' '}
                      {repo.forks.toLocaleString()} • Updated{' '}
                      {repo.lastPushed}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <p style={{ marginTop: '0.75rem', color: '#475569' }}>
            {selectedCount > 0
              ? `${selectedCount} selected`
              : 'No repository filter applied'}
          </p>
        </div>
      ) : null}

      <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem' }}>
        <button className="button" type="submit">
          Generate analytics
        </button>
        <span style={{ color: '#475569', fontSize: '0.85rem' }}>
          Tip: tokens need <code>repo</code> and <code>read:org</code> scopes to
          include private work.
        </span>
      </div>
    </form>
  );
}

export default CredentialsForm;
