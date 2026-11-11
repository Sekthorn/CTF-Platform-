import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Form State
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [capsLockActive, setCapsLockActive] = useState<boolean>(false);
  const [setupRequired, setSetupRequired] = useState<boolean>(false);

  // Check registration success redirect or session expiry
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      setErrorMessage('Your session has expired (1-day limit). Please sign in to generate a new session.');
    }

    if (location.state?.registered && location.state?.message) {
      setSuccessNotice(location.state.message);
      if (location.state?.identifier) {
        setIdentifier(location.state.identifier);
      }
    }
  }, [location.state, location.search]);

  // Animation Refs & State for Left Terminal Panel
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [flagText, setFlagText] = useState<string>('');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [clockTime, setClockTime] = useState<string>('06:42:10');

  // Check setup status on load
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await apiClient.get('/auth/setup-status');
        if (res.data?.isSetupRequired) {
          setSetupRequired(true);
        }
      } catch (e) {
        console.warn('Failed to check setup status:', e);
      }
    };
    checkSetup();
  }, []);

  // Countdown timer
  useEffect(() => {
    let secondsLeft = 6 * 3600 + 42 * 60 + 10;
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const interval = setInterval(() => {
      secondsLeft = Math.max(0, secondsLeft - 1);
      const h = pad(Math.floor(secondsLeft / 3600));
      const m = pad(Math.floor((secondsLeft % 3600) / 60));
      const s = pad(secondsLeft % 60);
      setClockTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scrambling Flag & Terminal Logs Animation
  useEffect(() => {
    const targetFlag = 'websec{s1gn_1n_t0_4dm1n}';
    const pool = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    let step = 0;
    const total = targetFlag.length;

    const flagTimer = setInterval(() => {
      let out = '';
      for (let i = 0; i < total; i++) {
        if (i < step || targetFlag[i] === '{' || targetFlag[i] === '}') {
          out += targetFlag[i];
        } else if (i < step + 6) {
          out += pool[Math.floor(Math.random() * pool.length)];
        }
      }
      setFlagText(out);
      step++;
      if (step > total + 1) {
        clearInterval(flagTimer);
        setFlagText(targetFlag);
      }
    }, 55);

    const fullLogs = [
      '<span class="log-ok">[ ok ]</span> tls handshake complete',
      '<span class="log-ok">[ ok ]</span> ctf-core v2.0 online',
      '<span class="log-ok">[ ok ]</span> scoreboard sync healthy',
      '<span class="log-wn">[warn]</span> all sign-ins are logged',
      'waiting for credentials<span class="blinking-cursor"></span>',
    ];

    let lineIndex = 0;
    const logTimer = setInterval(() => {
      lineIndex++;
      setLogLines(fullLogs.slice(0, lineIndex));
      if (lineIndex >= fullLogs.length) {
        clearInterval(logTimer);
      }
    }, 420);

    return () => {
      clearInterval(flagTimer);
      clearInterval(logTimer);
    };
  }, []);

  // Digital Rain Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cols = 0;
    let drops: number[] = [];
    const fontSize = 16;
    const chars = '01abcdef{}<>/$#';

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < cols; i++) {
        drops[i] = Math.random() * -40;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const rainTimer = setInterval(() => {
      if (!canvas.offsetWidth) return;
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#2CFF7A';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    }, 60);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(rainTimer);
    };
  }, []);

  // CapsLock Detection
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Enter your username or email.');
      return;
    }
    if (!password) {
      setErrorMessage('Enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(identifier, password, rememberMe);
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || '';
      if (msg.includes('Network') || msg.includes('ECONNREFUSED') || msg.includes('Failed to fetch') || err.code === 'ERR_NETWORK') {
        setErrorMessage('Cannot reach backend server. Please verify backend is running on port 3000.');
      } else if (msg.includes('suspended')) {
        setErrorMessage('That account has been suspended. Please contact platform management.');
      } else if (msg.toLowerCase().includes('database') || msg.includes('Can\'t reach database') || msg.includes('500') || msg.toLowerCase().includes('internal server error')) {
        setErrorMessage('Cannot connect to database. Please make sure Docker Desktop (MySQL) is running.');
      } else {
        setErrorMessage(msg || 'That username and password don’t match. Attempts are logged and reviewed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-theme min-h-screen w-full bg-[var(--bg)] text-[var(--text)] font-mono text-[15px] leading-relaxed">
      <style>{`
        .login-theme {
          --bg: #060A07;
          --panel: #0B120D;
          --side: #040705;
          --line: #1B2B1F;
          --text: #CFF5D8;
          --muted: #6F8F77;
          --accent: #2CFF7A;
          --accent-bg: #2CFF7A;
          --accent-ink: #021208;
          --danger: #FF5D5D;
          --focus: #2CFF7A;
          font-family: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
        }

        .login-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
        }

        .login-side {
          position: relative;
          overflow: hidden;
          background: var(--side);
          padding: clamp(24px, 4vw, 56px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 32px;
          border-right: 1px solid var(--line);
        }

        .login-side::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 3px);
          opacity: .5;
        }

        .login-side > * {
          position: relative;
          z-index: 1;
        }

        #rain-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: .16;
          z-index: 0;
        }

        .login-brand {
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.02em;
        }
        .login-brand span {
          color: var(--accent);
        }

        .login-flag {
          font-weight: 800;
          font-size: clamp(1.7rem, 3.8vw, 3.2rem);
          line-height: 1.15;
          word-break: break-all;
          margin: 0 0 24px;
          min-height: 3.5em;
          text-shadow: 0 0 18px color-mix(in srgb, var(--accent) 45%, transparent);
        }
        .login-flag b {
          color: var(--accent);
        }

        .blinking-cursor {
          display: inline-block;
          width: .55ch;
          height: 1em;
          background: var(--accent);
          vertical-align: -.12em;
          margin-left: 2px;
          animation: blink 1s steps(1) infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }

        .login-log {
          margin: 0;
          color: var(--muted);
          font-size: .8125rem;
          min-height: 7.5em;
          white-space: pre-wrap;
          line-height: 1.7;
        }
        .log-ok { color: var(--accent); }
        .log-wn { color: #E8B93A; }

        .login-status {
          display: grid;
          grid-template-columns: repeat(3, auto);
          gap: 8px 40px;
          justify-content: start;
          margin: 0;
        }
        .login-status dt {
          color: var(--muted);
          font-size: .8125rem;
        }
        .login-status dd {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .login-status div {
          display: flex;
          flex-direction: column-reverse;
        }

        .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          margin-right: 8px;
          box-shadow: 0 0 8px var(--accent);
        }

        .login-main {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 4vw, 56px);
          background: var(--bg);
        }

        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .login-h1 {
          font-size: 1.75rem;
          line-height: 1.15;
          font-weight: 800;
          margin: 0 0 8px;
          color: var(--text);
        }
        .login-h1::before {
          content: "$ ";
          color: var(--accent);
        }

        .login-sub {
          color: var(--muted);
          margin: 0 0 32px;
          font-size: .875rem;
          line-height: 1.5;
        }

        .login-field {
          margin-bottom: 20px;
        }

        .login-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .login-label {
          display: block;
          font-weight: 500;
          font-size: .875rem;
          margin-bottom: 6px;
          color: var(--muted);
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--line);
          border-radius: 3px;
          font: inherit;
          caret-color: var(--accent);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input::placeholder {
          color: var(--muted);
          opacity: .6;
        }
        .login-input.pw {
          padding-right: 72px;
        }
        .login-input:focus-visible {
          outline: 2px solid var(--focus);
          outline-offset: 0;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
        }

        .login-toggle {
          position: absolute;
          right: 6px;
          top: 6px;
          height: 36px;
          padding: 0 10px;
          background: none;
          border: 0;
          border-radius: 3px;
          color: var(--muted);
          font: inherit;
          font-size: .8125rem;
          font-weight: 700;
          cursor: pointer;
        }
        .login-toggle:hover {
          color: var(--accent);
        }

        .login-hint {
          color: var(--danger);
          font-size: .8125rem;
          margin: 6px 0 0;
          min-height: 1.3em;
        }

        .login-check {
          display: flex;
          gap: 10px;
          align-items: center;
          font-weight: 400;
          margin: 0 0 24px;
          cursor: pointer;
          color: var(--text);
          font-size: .875rem;
        }
        .login-check input {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-bg);
          margin: 0;
          cursor: pointer;
        }

        .login-btn {
          width: 100%;
          height: 50px;
          border: 0;
          border-radius: 3px;
          background: var(--accent-bg);
          color: var(--accent-ink);
          font: inherit;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 0 22px color-mix(in srgb, var(--accent-bg) 35%, transparent);
          transition: transform .12s, filter .12s;
        }
        .login-btn:hover {
          filter: brightness(1.08);
        }
        .login-btn:active {
          transform: translateY(1px);
        }
        .login-btn[disabled] {
          opacity: .6;
          cursor: progress;
        }

        .login-error {
          border-left: 3px solid var(--danger);
          padding: 8px 12px;
          margin: 0 0 20px;
          color: var(--danger);
          font-size: .875rem;
          background: color-mix(in srgb, var(--danger) 8%, transparent);
        }

        .login-foot {
          margin: 28px 0 0;
          padding-top: 16px;
          border-top: 1px dashed var(--line);
          color: var(--muted);
          font-size: .8125rem;
          line-height: 1.5;
        }

        @media (max-width: 860px) {
          .login-shell {
            grid-template-columns: 1fr;
          }
          .login-side {
            border-right: 0;
            border-bottom: 1px solid var(--line);
            gap: 16px;
            padding-bottom: 28px;
          }
          .login-flag {
            font-size: 1.5rem;
            min-height: 2.4em;
            margin-bottom: 8px;
          }
          .login-status, .login-log {
            display: none;
          }
        }
      `}</style>

      <div className="login-shell">
        {/* Left Side: Hacker Terminal & Live Event Telemetry */}
        <aside className="login-side" aria-label="Event status">
          <canvas id="rain-canvas" ref={canvasRef} aria-hidden="true" />

          <div className="login-brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/logo-icon.png"
              alt="websec.ctf"
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 16px rgba(44, 255, 122, 0.45))',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  fontSize: '2.2rem',
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
                  lineHeight: 1.05,
                }}
              >
                websec<span style={{ color: 'var(--accent)' }}>.ctf</span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--accent)',
                  opacity: 0.9,
                  letterSpacing: '0.06em',
                  marginTop: '4px',
                  fontWeight: 600,
                }}
              >
                &gt; capture the flag ■
              </span>
            </div>
          </div>

          <div>
            <p className="login-flag" aria-hidden="true">
              {flagText.split(/({|})/).map((part, idx) =>
                part === '{' || part === '}' ? (
                  <b key={idx}>{part}</b>
                ) : (
                  <React.Fragment key={idx}>{part}</React.Fragment>
                )
              )}
              <span className="blinking-cursor" />
            </p>

            <pre className="login-log" aria-hidden="true">
              {logLines.map((line, idx) => (
                <div key={idx} dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </pre>
          </div>

          <dl className="login-status">
            <div>
              <dt>event</dt>
              <dd>
                <span className="live-dot" />
                live
              </dd>
            </div>
            <div>
              <dt>teams online</dt>
              <dd>142</dd>
            </div>
            <div>
              <dt>time left</dt>
              <dd id="clock">{clockTime}</dd>
            </div>
          </dl>
        </aside>

        {/* Right Side: Authentication Panel */}
        <main className="login-main">
          <div className="login-card">
            <div style={{ marginBottom: '24px' }}>
              <img
                src="/logo-full.png"
                alt="websec.ctf"
                style={{
                  height: '54px',
                  maxWidth: '300px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 16px rgba(44, 255, 122, 0.25))',
                }}
              />
            </div>
            <h1 className="login-h1">sign in</h1>
            <p className="login-sub">
              WebSec CTF Platform. Enter your username or email to sign in.
            </p>

            {/* Registration Success Banner */}
            {successNotice && (
              <div
                className="login-error"
                style={{
                  borderLeftColor: '#2CFF7A',
                  color: '#2CFF7A',
                  background: 'rgba(44, 255, 122, 0.08)',
                }}
                role="status"
              >
                {successNotice}
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="login-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Setup Required Banner */}
            {setupRequired && (
              <div
                className="login-error"
                style={{
                  borderLeftColor: '#2CFF7A',
                  color: '#2CFF7A',
                  background: 'rgba(44, 255, 122, 0.08)',
                }}
              >
                Initial administrator setup has not been run.{' '}
                <Link to="/admin/setup" style={{ textDecoration: 'underline' }}>
                  Run Initial Setup &gt;
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="user">
                  Username or email
                </label>
                <input
                  type="text"
                  id="user"
                  name="user"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="username or you@websec.ctf"
                  className="login-input"
                />
              </div>

              <div className="login-field">
                <div className="login-row">
                  <label className="login-label" htmlFor="pw">
                    Password
                  </label>
                  <Link to="/forgot-password" className="small" style={{ color: 'var(--accent)' }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="login-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="pw"
                    name="pw"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyUp}
                    onBlur={() => setCapsLockActive(false)}
                    autoComplete="current-password"
                    className="login-input pw"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-toggle"
                    aria-pressed={showPassword}
                    aria-controls="pw"
                  >
                    {showPassword ? 'hide' : 'show'}
                  </button>
                </div>
                <p className="login-hint" aria-live="polite">
                  {capsLockActive ? 'Caps Lock is on.' : ''}
                </p>
              </div>

              <label className="login-check">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Keep me signed in on this device
              </label>

              <button className="login-btn" id="submit" type="submit" disabled={isLoading}>
                {isLoading ? 'Authenticating…' : '> Sign in'}
              </button>
            </form>

            <div className="login-sub" style={{ margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>
                  Register here
                </Link>
              </div>
              <div style={{ fontSize: '.75rem' }}>
                Have an invitation token?{' '}
                <Link to="/admin/accept-invitation" style={{ color: 'var(--muted)' }}>
                  Accept invitation
                </Link>
              </div>
            </div>

            <p className="login-foot">
              Sign-in attempts are logged and reviewed. Five failed attempts lock the account for 15 minutes.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
