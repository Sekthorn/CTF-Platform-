import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/services/api';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { DEFAULT_AVATAR } from '@/data/avatars';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_AVATAR);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Animation Refs & State for Left Terminal Panel
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [flagText, setFlagText] = useState<string>('');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [clockTime, setClockTime] = useState<string>('06:42:10');

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
    const targetFlag = 'websec{n3w_pl4y3r_r3g1st3r}';
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
      '<span class="log-ok">[ ok ]</span> security perimeter active',
      '<span class="log-ok">[ ok ]</span> encryption suites initialized',
      '<span class="log-ok">[ ok ]</span> challenge arena open for registration',
      '<span class="log-wn">[warn]</span> duplicate usernames are rejected',
      'awaiting player credentials<span class="blinking-cursor"></span>',
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

  // Matrix Rain Background Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth / 2);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const cols = Math.floor(width / 18);
    const ypos = Array(cols).fill(0).map(() => Math.floor(Math.random() * -50));
    const chars = '01{}[]_/>$#%*+=~|';

    const render = () => {
      ctx.fillStyle = 'rgba(10, 14, 12, 0.15)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#2CFF7A';
      ctx.font = '12px "JetBrains Mono", monospace';

      ypos.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 18;
        ctx.fillText(text, x, y);
        if (y > 100 + Math.random() * 10000) ypos[i] = 0;
        else ypos[i] = y + 14;
      });

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Real-time password validations
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isUsernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Front-end Validations
    if (!username.trim()) {
      setErrorMessage('Username is required.');
      return;
    }
    if (!isUsernameValid) {
      setErrorMessage('Username must be 3–30 characters and only contain letters, numbers, and underscores.');
      return;
    }
    if (!email.trim() || !isEmailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!hasMinLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (!hasLetter || !hasNumber) {
      setErrorMessage('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatarUrl: selectedAvatar,
      });

      const message =
        response.data?.message ||
        'Registration successful! Redirecting to login...';

      setSuccessMessage(message);

      // Redirect to login after 1.5 seconds with prefilled info
      setTimeout(() => {
        navigate('/login', {
          state: {
            registered: true,
            identifier: username.trim(),
            message: 'Registration successful! Please sign in with your credentials.',
          },
        });
      }, 1500);
    } catch (err: any) {
      const errorText =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(', ')
          : err.message) ||
        'Registration failed. Please check your details and try again.';
      setErrorMessage(errorText);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <style>{`
        :root {
          --bg: #0A0E0C;
          --panel: #0D1310;
          --line: #18261F;
          --accent: #2CFF7A;
          --accent-dim: #1ea850;
          --text: #D8E4DC;
          --muted: #667D70;
          --danger: #FF5A5A;
          --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-root {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-mono);
          display: flex;
          align-items: stretch;
          overflow-x: hidden;
        }

        .login-shell {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          width: 100%;
        }

        .login-side {
          position: relative;
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(circle at 15% 20%, rgba(44, 255, 122, 0.04) 0%, transparent 60%);
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
          font-size: clamp(1.5rem, 3.2vw, 2.8rem);
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
          font-size: .6875rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .08em;
          margin-bottom: 2px;
        }
        .login-status dd {
          margin: 0;
          font-size: .875rem;
          font-weight: 600;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .35; }
        }

        .login-main {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: var(--panel);
        }

        .login-card {
          width: 100%;
          max-width: 440px;
        }

        .login-h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .login-h1::before {
          content: "$";
          color: var(--accent);
          font-weight: 800;
        }

        .login-sub {
          margin: 0 0 24px;
          font-size: .8125rem;
          color: var(--muted);
          line-height: 1.5;
        }

        .login-field {
          margin-bottom: 16px;
        }

        .login-label {
          display: block;
          font-size: .75rem;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--line);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: .875rem;
          padding: 10px 14px;
          border-radius: 4px;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 15%, transparent);
        }

        .login-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: .75rem;
          font-family: var(--font-mono);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-toggle:hover {
          color: var(--accent);
        }

        .login-btn {
          width: 100%;
          background: var(--accent);
          color: #06150B;
          border: none;
          padding: 12px;
          font-family: var(--font-mono);
          font-size: .875rem;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: background .15s, transform .05s;
          margin-top: 8px;
        }
        .login-btn:hover:not(:disabled) {
          background: #44ff88;
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .login-btn:disabled {
          opacity: .6;
          cursor: progress;
        }

        .login-error {
          border-left: 3px solid var(--danger);
          padding: 8px 12px;
          margin: 0 0 20px;
          color: var(--danger);
          font-size: .8125rem;
          background: color-mix(in srgb, var(--danger) 8%, transparent);
        }

        .login-success {
          border-left: 3px solid var(--accent);
          padding: 8px 12px;
          margin: 0 0 20px;
          color: var(--accent);
          font-size: .8125rem;
          background: color-mix(in srgb, var(--accent) 8%, transparent);
        }

        .req-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 12px;
          margin: 8px 0 16px;
          font-size: .75rem;
        }
        .req-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--muted);
        }
        .req-item.valid {
          color: var(--accent);
        }

        .login-foot {
          margin: 24px 0 0;
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

        {/* Right Side: Registration Panel */}
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
            <h1 className="login-h1">register player</h1>
            <p className="login-sub">
              Create a new cybersecurity training account to solve challenges and climb the scoreboard.
            </p>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="login-error" role="alert">
                <AlertCircle className="w-4 h-4 inline mr-2 align-text-bottom" />
                {errorMessage}
              </div>
            )}

            {/* Success Message Box */}
            {successMessage && (
              <div className="login-success" role="status">
                <Check className="w-4 h-4 inline mr-2 align-text-bottom" />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Username Field */}
              <div className="login-field">
                <label className="login-label" htmlFor="reg-username">
                  Username <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  id="reg-username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="e.g. shadow_hacker"
                  className="login-input"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="login-field">
                <label className="login-label" htmlFor="reg-email">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="you@domain.com"
                  className="login-input"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="login-field">
                <label className="login-label" htmlFor="reg-pw">
                  Password <span className="text-emerald-400">*</span>
                </label>
                <div className="login-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-pw"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Min 8 chars, letter & number"
                    className="login-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="login-field">
                <label className="login-label" htmlFor="reg-pw-confirm">
                  Confirm Password <span className="text-emerald-400">*</span>
                </label>
                <div className="login-input-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="reg-pw-confirm"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="login-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="login-toggle"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Checklist */}
              {password.length > 0 && (
                <div className="req-list">
                  <div className={`req-item ${hasMinLength ? 'valid' : ''}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    8+ Characters
                  </div>
                  <div className={`req-item ${hasLetter ? 'valid' : ''}`}>
                    {hasLetter ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    Contains Letter
                  </div>
                  <div className={`req-item ${hasNumber ? 'valid' : ''}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    Contains Number
                  </div>
                  <div className={`req-item ${passwordsMatch ? 'valid' : ''}`}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    Passwords Match
                  </div>
                </div>
              )}

              {/* Anime Persona Avatar Picker */}
              <div className="login-field" style={{ marginTop: '16px', marginBottom: '20px' }}>
                <AvatarPicker
                  value={selectedAvatar}
                  onChange={(url) => setSelectedAvatar(url)}
                  label="Select Starting Anime Persona"
                  description="Choose your cyber hacker avatar. Can be updated anytime in Profile."
                />
              </div>

              {/* Submit Button */}
              <button
                className="login-btn"
                id="submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account…' : '> Register Account'}
              </button>
            </form>

            {/* Link to Login */}
            <p className="login-sub" style={{ margin: '24px 0 0' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Sign in here
              </Link>
            </p>

            <p className="login-foot">
              Registration assigns a standard player account. Public registration cannot grant administrator privileges.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterPage;
