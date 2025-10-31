import { useEffect, useMemo, useState } from 'react';
import { formatForInput } from '../utils/analytics.js';

const DATE_FIELD_ID = 'github-analytics-date';

function CredentialsForm({
  defaultValues,
  onSubmit,
  repositories,
  authStatus,
  authError,
  authenticatedUser,
  onLogin,
  onLogout,
}) {
  const [formValues, setFormValues] = useState({
    since: defaultValues.since,
    until: defaultValues.until,
    repos: defaultValues.repos ?? [],
  });

  useEffect(() => {
    setFormValues({
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
    if (authStatus !== 'authenticated') {
      return;
    }
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
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthenticating = authStatus === 'authenticating';
  const avatarUrl = authenticatedUser?.avatarUrl
    || (authenticatedUser?.id
      ? `https://avatars.githubusercontent.com/u/${authenticatedUser.id}?v=4`
      : undefined);

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connect to GitHub</h2>
      <p>
        Sign in with GitHub to securely grant the dashboard read-only access to
        your repositories. Authentication happens through OAuth—we never see or
        store your password or personal access tokens.
      </p>

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {isAuthenticated && authenticatedUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${authenticatedUser.login} avatar`}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                }}
              />
            ) : null}
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {authenticatedUser.name || authenticatedUser.login}
              </div>
              <a
                href={authenticatedUser.htmlUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#2563eb', fontSize: '0.85rem' }}
              >
                @{authenticatedUser.login}
              </a>
            </div>
          </div>
        ) : (
          <div style={{ color: '#475569', fontSize: '0.9rem' }}>
            {isAuthenticating
              ? 'Finishing GitHub sign-in...'
              : 'Sign in to enable private repository metrics and personalise insights.'}
          </div>
        )}

        {isAuthenticated ? (
          <button
            type="button"
            className="button secondary"
            onClick={onLogout}
            style={{ minWidth: '160px' }}
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            className="button"
            onClick={onLogin}
            disabled={isAuthenticating}
            style={{ minWidth: '200px' }}
          >
            {isAuthenticating ? 'Connecting…' : 'Sign in with GitHub'}
          </button>
        )}
      </div>

      {authError ? (
        <p style={{ marginTop: '0.75rem', color: '#dc2626' }}>{authError}</p>
      ) : null}

      <div className="input-group">
        <label htmlFor={`${DATE_FIELD_ID}-since`}>
          Since
          <input
            id={`${DATE_FIELD_ID}-since`}
            type="date"
            value={formatForInput(formValues.since)}
            onChange={handleChange('since')}
            disabled={!isAuthenticated}
          />
        </label>

        <label htmlFor={`${DATE_FIELD_ID}-until`}>
          Until
          <input
            id={`${DATE_FIELD_ID}-until`}
            type="date"
            value={formatForInput(formValues.until)}
            onChange={handleChange('until')}
            disabled={!isAuthenticated}
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
                    cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRepository(repo.name)}
                    disabled={!isAuthenticated}
                    style={{ width: '1rem', height: '1rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {repo.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      ⭐ {repo.stars.toLocaleString()} • Forks{' '}
                      {repo.forks.toLocaleString()} • Updated {repo.lastPushed}
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
        <button className="button" type="submit" disabled={!isAuthenticated}>
          Generate analytics
        </button>
        <span style={{ color: '#475569', fontSize: '0.85rem' }}>
          Tip: OAuth scopes requested are <code>repo</code> and <code>read:org</code>
          to unlock private repositories and organisation context.
        </span>
      </div>
    </form>
  );
}

export default CredentialsForm;
