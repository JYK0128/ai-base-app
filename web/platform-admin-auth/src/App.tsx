import { type SubmitEventHandler, useEffect, useState } from 'react';

type LoginResult = {
  accountId: string
  email: string
  user: {
    id: string
    role: string
    organizationId: string | null
    organizationName: string | null
  }
  clientIp: string
  loggedInAt: string
};

type UserProfile = {
  userId: string
  role: string
  email: string
  accountId: string
  organization: {
    id: string
    name: string
  } | null
};

type ApiResponse<T> = {
  success: boolean
  data: T
};

type ApiErrorResponse = {
  error?: {
    message?: string | string[]
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const SESSION_STORAGE_KEY = 'platform-admin-session';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<LoginResult | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as LoginResult;
      setSession(parsed);
    }
    catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    void fetchUserProfile(session.user.id);
  }, [session]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user?userId=${encodeURIComponent(userId)}`);
      const payload = (await response.json()) as ApiResponse<UserProfile> & ApiErrorResponse;

      if (!response.ok || !payload.success) {
        const message = Array.isArray(payload.error?.message)
          ? payload.error?.message.join(', ')
          : payload.error?.message || 'Failed to load user profile';
        throw new Error(message);
      }

      setProfile(payload.data);
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load user profile';
      setErrorMessage(message);
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const login = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const payload = (await response.json()) as ApiResponse<LoginResult> & ApiErrorResponse;
        if (!response.ok || !payload.success) {
          const message = Array.isArray(payload.error?.message)
            ? payload.error?.message.join(', ')
            : payload.error?.message || 'Login failed';
          throw new Error(message);
        }

        setSession(payload.data);
        setPassword('');
      }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setErrorMessage(message);
      }
      finally {
        setIsSubmitting(false);
      }
    };

    void login();
  };

  const handleLogout = () => {
    setSession(null);
    setProfile(null);
    setPassword('');
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Auth Remote</p>
        <h1>Login and session UI shipped as a federated remote.</h1>
        <p className="hero-copy">
          This remote owns the auth interaction while the host controls shell, routing,
          and deployment orchestration.
        </p>
        <dl className="hero-metadata">
          <div>
            <dt>Remote URL</dt>
            <dd>http://localhost:3001/assets/remoteEntry.js</dd>
          </div>
          <div>
            <dt>API Gateway</dt>
            <dd>{API_BASE_URL}</dd>
          </div>
        </dl>
      </section>

      <section className="login-panel">
        {!session
          ? (
            <>
              <div className="panel-header">
                <p className="eyebrow">Sign In</p>
                <h2>Use a real `platform_account` record</h2>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <label className="field">
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@company.com"
                    required
                  />
                </label>

                <label className="field">
                  <span>Password</span>
                  <input
                    autoComplete="current-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </label>

                {errorMessage ? <p className="message error">{errorMessage}</p> : null}

                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </>
          )
          : (
            <>
              <div className="panel-header">
                <p className="eyebrow">Authenticated</p>
                <h2>{session.email}</h2>
              </div>

              {errorMessage ? <p className="message error">{errorMessage}</p> : null}

              <div className="info-grid">
                <article className="info-card">
                  <span>Account ID</span>
                  <strong>{session.accountId}</strong>
                </article>
                <article className="info-card">
                  <span>User ID</span>
                  <strong>{session.user.id}</strong>
                </article>
                <article className="info-card">
                  <span>Role</span>
                  <strong>{profile?.role || session.user.role}</strong>
                </article>
                <article className="info-card">
                  <span>Organization</span>
                  <strong>{profile?.organization?.name || session.user.organizationName || 'None'}</strong>
                </article>
              </div>

              <div className="result-card">
                <h3>Fetched user profile</h3>
                <pre>{JSON.stringify(profile, null, 2)}</pre>
              </div>

              <div className="actions">
                <button className="secondary-button" type="button" onClick={() => void fetchUserProfile(session.user.id)}>
                  Refresh from DB
                </button>
                <button className="primary-button" type="button" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </>
          )}
      </section>
    </main>
  );
}

export default App;
