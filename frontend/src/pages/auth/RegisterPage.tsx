import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/services/api';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_AVATAR } from '@/data/avatars';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live countdown timer state (ticks down from 06:42:08)
  const [clockTime, setClockTime] = useState<string>('06:42:08');

  // Ticking countdown timer
  useEffect(() => {
    let secondsLeft = 6 * 3600 + 42 * 60 + 8;
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
        avatarUrl: DEFAULT_AVATAR,
      });

      const message =
        response.data?.message ||
        'Registration successful! Redirecting to login...';

      setSuccessMessage(message);

      // Redirect to login after 1.5 seconds with prefilled identifier
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
    <div className="register-page-root">
      <style>{`
        .register-page-root {
          --bg: #060908;
          --bg-grid: rgba(45, 255, 122, 0.05);
          --accent: #2dff7a;
          --accent-hover: #8dffb8;
          --accent-glow: rgba(45, 255, 122, 0.35);
          --text: #e6f5ec;
          --text-muted: #93ab9f;
          --text-label: #b9d3c4;
          --input-bg: #0b110e;
          --input-border: #22372b;
          --input-focus-ring: rgba(45, 255, 122, 0.3);
          --divider: #14231b;
          --btn-text: #04120a;
          --danger: #ff5d5d;

          --font-heading: 'Sora', sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;

          min-height: 100vh;
          min-height: 900px;
          width: 100%;
          background-color: var(--bg);
          background-image: 
            linear-gradient(to right, var(--bg-grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--bg-grid) 1px, transparent 1px);
          background-size: 32px 32px;
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 14px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .register-grid {
          display: grid;
          grid-template-columns: 1.05fr 1px 1.15fr;
          min-height: 100vh;
          min-height: 900px;
          width: 100%;
        }

        .register-v-divider {
          background-color: var(--divider);
          width: 1px;
          height: 100%;
        }

        /* LEFT PANEL: Branding, Radar & Stats */
        .register-left-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px 48px 64px;
          position: relative;
        }

        .register-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          width: fit-content;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .register-brand:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .register-brand-title {
          font-family: var(--font-heading);
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text);
          display: flex;
          align-items: center;
        }

        .chromatic-title {
          position: relative;
          display: inline-block;
          color: #ffffff;
        }

        .chromatic-title::before {
          content: 'websec';
          position: absolute;
          left: -1px;
          top: 0;
          color: #ff2a5f;
          opacity: 0.65;
          pointer-events: none;
        }

        .chromatic-title::after {
          content: 'websec';
          position: absolute;
          left: 1px;
          top: 0;
          color: #00f0ff;
          opacity: 0.65;
          pointer-events: none;
        }

        .register-brand-title .accent {
          color: var(--accent);
          text-shadow: 0 0 10px rgba(45, 255, 122, 0.55);
        }

        /* RADAR SVG & ANIMATIONS */
        .register-radar-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px 0;
          position: relative;
        }

        .register-radar-svg {
          width: 440px;
          height: 440px;
          max-width: 100%;
          overflow: visible;
          user-select: none;
        }

        .radar-sweep-arm {
          transform-origin: 220px 220px;
          animation: radar-sweep-rot 4s linear infinite;
        }

        @keyframes radar-sweep-rot {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .radar-ping-circle {
          transform-origin: 220px 220px;
          animation: radar-ping-expand 3s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }

        @keyframes radar-ping-expand {
          0% {
            r: 24px;
            opacity: 0.9;
            stroke-width: 1.5px;
          }
          70% {
            r: 72px;
            opacity: 0;
            stroke-width: 1px;
          }
          100% {
            r: 72px;
            opacity: 0;
            stroke-width: 0.5px;
          }
        }

        /* Blips matching 4s rotation */
        .blip-1-dot { animation: blip-flash 4s cubic-bezier(0.1, 0.9, 0.2, 1) infinite; animation-delay: 0.5s; }
        .blip-1-halo { animation: halo-expand 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: 0.5s; }

        .blip-2-dot { animation: blip-flash 4s cubic-bezier(0.1, 0.9, 0.2, 1) infinite; animation-delay: 1.33s; }
        .blip-2-halo { animation: halo-expand 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: 1.33s; }

        .blip-3-dot { animation: blip-flash 4s cubic-bezier(0.1, 0.9, 0.2, 1) infinite; animation-delay: 2.5s; }
        .blip-3-halo { animation: halo-expand 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: 2.5s; }

        .blip-4-dot { animation: blip-flash 4s cubic-bezier(0.1, 0.9, 0.2, 1) infinite; animation-delay: 3.5s; }
        .blip-4-halo { animation: halo-expand 4s cubic-bezier(0, 0.2, 0.8, 1) infinite; animation-delay: 3.5s; }

        @keyframes blip-flash {
          0% { opacity: 0; transform: scale(0.6); }
          5% { opacity: 1; transform: scale(1.3); }
          25% { opacity: 0.8; transform: scale(1); }
          60% { opacity: 0.15; }
          100% { opacity: 0; }
        }

        @keyframes halo-expand {
          0% { r: 3px; opacity: 0; }
          4% { opacity: 0.9; }
          30% { r: 18px; opacity: 0; stroke-width: 0.75px; }
          100% { r: 18px; opacity: 0; }
        }

        /* Bottom Hero & Stats */
        .register-left-bottom {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .register-hero-heading {
          font-family: var(--font-heading);
          font-size: 38px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .register-hero-heading .line-white {
          color: var(--text);
          display: block;
        }

        .register-hero-heading .line-green {
          color: var(--accent);
          display: block;
        }

        .register-stats-row {
          display: flex;
          align-items: flex-start;
          gap: 36px;
          padding-top: 4px;
        }

        .register-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .register-stat-value {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .register-stat-value.live {
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .register-stat-value.live::before {
          content: '';
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .register-stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* RIGHT PANEL: ELEVATED CYBER CARD */
        .register-right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 48px;
          position: relative;
        }

        .register-card-box {
          width: 100%;
          max-width: 520px;
          background: rgba(11, 17, 14, 0.88);
          border: 1px solid rgba(45, 255, 122, 0.18);
          border-top: 2px solid var(--accent);
          border-radius: 12px;
          padding: 38px 42px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 
            0 24px 60px rgba(0, 0, 0, 0.75),
            0 0 1px rgba(45, 255, 122, 0.35),
            inset 0 1px 0 rgba(45, 255, 122, 0.15);
          backdrop-filter: blur(16px);
          position: relative;
        }

        /* Top Brand & Status Row inside Card */
        .register-card-brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(45, 255, 122, 0.1);
          margin-bottom: 2px;
        }

        .register-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          background: rgba(45, 255, 122, 0.08);
          border: 1px solid rgba(45, 255, 122, 0.22);
          border-radius: 999px;
          padding: 3px 9px;
        }

        .register-status-pill .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
          animation: reg-pulse 2s infinite ease-in-out;
        }

        @keyframes reg-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .register-form-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .register-kicker {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .register-form-title {
          font-family: var(--font-heading);
          font-size: 32px;
          font-weight: 800;
          line-height: 1.15;
          color: var(--text);
          letter-spacing: -0.025em;
        }

        .register-form-subtitle {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-top: 2px;
        }

        /* Inputs & Form Groups */
        .register-field-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .register-field-label {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-label);
          cursor: pointer;
        }

        .register-field-label .req {
          color: var(--accent);
          margin-left: 2px;
        }

        .register-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .register-text-input {
          width: 100%;
          height: 48px;
          background-color: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 6px;
          padding: 0 16px;
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 13.5px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .register-text-input::placeholder {
          color: rgba(147, 171, 159, 0.45);
        }

        .register-text-input:hover {
          border-color: #2e4d3c;
        }

        .register-text-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--input-focus-ring), 0 0 14px rgba(45, 255, 122, 0.12);
          background-color: #0d1511;
        }

        .register-text-input.has-toggle {
          padding-right: 48px;
        }

        .register-show-toggle {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: rgba(45, 255, 122, 0.06);
          border: 1px solid rgba(45, 255, 122, 0.16);
          color: var(--accent);
          cursor: pointer;
          border-radius: 6px;
          transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
          user-select: none;
        }

        .register-show-toggle:hover {
          color: #fff;
          background-color: rgba(45, 255, 122, 0.2);
          border-color: rgba(45, 255, 122, 0.45);
        }

        .register-show-toggle:active {
          transform: scale(0.94);
        }

        .register-show-toggle:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Password Requirements Grid */
        .register-req-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 12px;
          padding: 8px 12px;
          background: rgba(14, 24, 19, 0.5);
          border: 1px solid rgba(45, 255, 122, 0.1);
          border-radius: 6px;
          font-size: 11.5px;
          margin-top: 2px;
        }

        .register-req-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          transition: color 0.15s ease;
        }

        .register-req-item.valid {
          color: var(--accent);
          font-weight: 600;
        }

        /* Submit Button */
        .register-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 52px;
          background: linear-gradient(180deg, #38ff82 0%, #20e66b 100%);
          color: var(--btn-text);
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 4px 18px rgba(45, 255, 122, 0.25);
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
        }

        .register-submit-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #5eff9c 0%, #2dff7a 100%);
          box-shadow: 0 0 28px var(--accent-glow), 0 4px 20px rgba(0, 0, 0, 0.5);
          transform: translateY(-1px);
        }

        .register-submit-btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
          box-shadow: 0 0 28px var(--accent-glow);
        }

        .register-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .register-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Links & Disclaimers */
        .register-link-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .register-accent-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.15s ease, text-decoration 0.15s ease;
        }

        .register-accent-link:hover {
          color: var(--accent-hover);
          text-decoration: underline;
        }

        .register-divider {
          height: 1px;
          background-color: rgba(45, 255, 122, 0.12);
          margin: 6px 0 2px;
          border: none;
        }

        .register-disclaimer-box {
          background: rgba(18, 30, 24, 0.55);
          border: 1px solid rgba(45, 255, 122, 0.08);
          border-radius: 6px;
          padding: 12px 14px;
        }

        .register-disclaimer-text {
          font-size: 11px;
          color: #7d9688;
          line-height: 1.55;
          margin: 0;
        }

        /* Alerts */
        .register-alert-box {
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.45;
        }

        .register-alert-error {
          background-color: rgba(255, 93, 93, 0.1);
          border: 1px solid rgba(255, 93, 93, 0.35);
          color: var(--danger);
        }

        .register-alert-success {
          background-color: rgba(45, 255, 122, 0.1);
          border: 1px solid rgba(45, 255, 122, 0.35);
          color: var(--accent);
        }

        /* RESPONSIVE & REDUCED MOTION */
        @media (max-width: 900px) {
          .register-grid {
            grid-template-columns: 1fr;
          }

          .register-left-panel,
          .register-v-divider {
            display: none !important;
          }

          .register-right-panel {
            padding: 32px 16px;
            min-height: 100vh;
          }

          .register-card-box {
            padding: 30px 22px;
            max-width: 480px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .radar-sweep-arm,
          .radar-ping-circle,
          .blip-1-dot,
          .blip-1-halo,
          .blip-2-dot,
          .blip-2-halo,
          .blip-3-dot,
          .blip-3-halo,
          .blip-4-dot,
          .blip-4-halo,
          .register-stat-value.live::before,
          .register-status-pill .pulse-dot {
            animation: none !important;
          }

          .radar-sweep-arm {
            transform: rotate(45deg);
          }

          .blip-1-dot,
          .blip-2-dot,
          .blip-3-dot,
          .blip-4-dot {
            opacity: 0.8 !important;
          }

          .blip-1-halo,
          .blip-2-halo,
          .blip-3-halo,
          .blip-4-halo {
            opacity: 0 !important;
          }
        }
      `}</style>

      <main className="register-grid">
        {/* ======================================================== */}
        {/* LEFT PANEL: Tactical Radar & Event Telemetry             */}
        {/* ======================================================== */}
        <aside className="register-left-panel" aria-label="Operation Overview">
          {/* Top Logo */}
          <Link to="/" className="register-brand" aria-label="websec.ctf home">
            <img
              src="/logo-shield.svg"
              alt="websec.ctf"
              className="w-7 h-8 flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 10px rgba(45, 255, 122, 0.55))' }}
            />
            <span className="register-brand-title">
              <span className="chromatic-title">websec</span>
              <span className="accent">.ctf</span>
            </span>
          </Link>

          {/* Center: 440x440 Animated Radar SVG */}
          <div className="register-radar-wrapper" aria-hidden="true">
            <svg
              className="register-radar-svg"
              viewBox="0 0 440 440"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="regRadarCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2dff7a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2dff7a" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="regSweepTrailGrad" x1="100%" y1="0%" x2="0%" y2="80%">
                  <stop offset="0%" stopColor="#2dff7a" stopOpacity="0.32" />
                  <stop offset="40%" stopColor="#2dff7a" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2dff7a" stopOpacity="0" />
                </linearGradient>

                <filter id="regNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Diagonal Faint Lines */}
              <line x1="78" y1="78" x2="362" y2="362" stroke="#15241c" strokeWidth="1" />
              <line x1="78" y1="362" x2="362" y2="78" stroke="#15241c" strokeWidth="1" />

              {/* Concentric Reference Circles */}
              <circle cx="220" cy="220" r="200" stroke="#1c3024" strokeWidth="1" fill="none" />
              <circle cx="220" cy="220" r="140" stroke="#1c3024" strokeWidth="1" strokeDasharray="4 6" fill="none" />
              <circle cx="220" cy="220" r="80" stroke="#1c3024" strokeWidth="1" fill="none" />

              {/* Center Crosshairs */}
              <line x1="220" y1="12" x2="220" y2="428" stroke="#1a2d21" strokeWidth="1" />
              <line x1="12" y1="220" x2="428" y2="220" stroke="#1a2d21" strokeWidth="1" />

              {/* Radar Center Ping Ripple */}
              <circle
                className="radar-ping-circle"
                cx="220"
                cy="220"
                r="24"
                stroke="#2dff7a"
                fill="none"
              />

              {/* Center Radar Node */}
              <circle
                cx="220"
                cy="220"
                r="22"
                stroke="#2dff7a"
                strokeWidth="1.5"
                fill="url(#regRadarCenterGlow)"
                filter="url(#regNeonGlow)"
              />
              <circle cx="220" cy="220" r="3" fill="#2dff7a" />

              {/* 4 Synchronized Target Blips */}
              <g>
                <circle className="blip-1-halo" cx="298" cy="142" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-1-dot" cx="298" cy="142" r="3" fill="#2dff7a" filter="url(#regNeonGlow)" />
              </g>

              <g>
                <circle className="blip-2-halo" cx="359" cy="300" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-2-dot" cx="359" cy="300" r="3" fill="#2dff7a" filter="url(#regNeonGlow)" />
              </g>

              <g>
                <circle className="blip-3-halo" cx="128" cy="312" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-3-dot" cx="128" cy="312" r="3" fill="#2dff7a" filter="url(#regNeonGlow)" />
              </g>

              <g>
                <circle className="blip-4-halo" cx="160" cy="160" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-4-dot" cx="160" cy="160" r="3" fill="#2dff7a" filter="url(#regNeonGlow)" />
              </g>

              {/* Rotating Sweep Arm & Trailing Wedge */}
              <g className="radar-sweep-arm">
                <path d="M 220 220 L 220 20 A 200 200 0 0 0 66.8 91.4 Z" fill="url(#regSweepTrailGrad)" />
                <line
                  x1="220"
                  y1="220"
                  x2="220"
                  y2="20"
                  stroke="#2dff7a"
                  strokeWidth="1.75"
                  filter="url(#regNeonGlow)"
                />
              </g>
            </svg>
          </div>

          {/* Bottom Headline & Live Event Stats */}
          <div className="register-left-bottom">
            <h2 className="register-hero-heading">
              <span className="line-white">Initialize operator.</span>
              <span className="line-green">Join the operation.</span>
            </h2>

            <div className="register-stats-row" role="region" aria-label="Event Status Indicators">
              <div className="register-stat-item">
                <span className="register-stat-value">{clockTime}</span>
                <span className="register-stat-label">TIME LEFT</span>
              </div>
              <div className="register-stat-item">
                <span className="register-stat-value live">LIVE</span>
                <span className="register-stat-label">EVENT STATUS</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 1px Vertical Divider */}
        <div className="register-v-divider" role="separator" aria-orientation="vertical" />

        {/* ======================================================== */}
        {/* RIGHT PANEL: Registration Form & Cyber Card             */}
        {/* ======================================================== */}
        <section className="register-right-panel" aria-labelledby="register-heading">
          <div className="register-card-box">
            {/* Top Brand inside Card */}
            <div className="register-card-brand-row">
              <Link to="/" className="register-brand" aria-label="websec.ctf home">
                <img
                  src="/logo-shield.svg"
                  alt="websec.ctf"
                  className="w-7 h-8 flex-shrink-0"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(45, 255, 122, 0.55))' }}
                />
                <span className="register-brand-title">
                  <span className="chromatic-title">websec</span>
                  <span className="accent">.ctf</span>
                </span>
              </Link>
            </div>

            {/* Form Header */}
            <header className="register-form-header">
              <span className="register-kicker">// NEW OPERATOR COMMISSION</span>
              <h1 id="register-heading" className="register-form-title">
                Register player
              </h1>
              <p className="register-form-subtitle">
                Create a new cybersecurity training account to solve challenges and climb the scoreboard.
              </p>
            </header>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="register-alert-box register-alert-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Success Message Box */}
            {successMessage && (
              <div className="register-alert-box register-alert-success" role="status">
                {successMessage}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Username Field */}
                <div className="register-field-group">
                  <label htmlFor="reg-username" className="register-field-label">
                    Username <span className="req">*</span>
                  </label>
                  <div className="register-input-wrapper">
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
                      className="register-text-input"
                      required
                    />
                  </div>
                </div>

                {/* Email Address Field */}
                <div className="register-field-group">
                  <label htmlFor="reg-email" className="register-field-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <div className="register-input-wrapper">
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="you@domain.com"
                      className="register-text-input"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="register-field-group">
                  <label htmlFor="reg-pw" className="register-field-label">
                    Password <span className="req">*</span>
                  </label>
                  <div className="register-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reg-pw"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Min 8 chars, letter & number"
                      className="register-text-input has-toggle"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="register-show-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="register-field-group">
                  <label htmlFor="reg-pw-confirm" className="register-field-label">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="register-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="reg-pw-confirm"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className="register-text-input has-toggle"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="register-show-toggle"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Checklist */}
                {password.length > 0 && (
                  <div className="register-req-grid" aria-live="polite">
                    <div className={`register-req-item ${hasMinLength ? 'valid' : ''}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-zinc-500" />}
                      8+ Characters
                    </div>
                    <div className={`register-req-item ${hasLetter ? 'valid' : ''}`}>
                      {hasLetter ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-zinc-500" />}
                      Contains Letter
                    </div>
                    <div className={`register-req-item ${hasNumber ? 'valid' : ''}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-zinc-500" />}
                      Contains Number
                    </div>
                    <div className={`register-req-item ${passwordsMatch ? 'valid' : ''}`}>
                      {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-zinc-500" />}
                      Passwords Match
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="register-submit-btn"
                  id="submit"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'COMMISSIONING OPERATOR...' : 'REGISTER ACCOUNT →'}</span>
                </button>
              </div>
            </form>

            {/* Navigation Link to Login */}
            <nav className="register-link-group" aria-label="Alternative entry paths">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="register-accent-link">
                  Sign in here →
                </Link>
              </p>
            </nav>

            {/* Divider & Disclaimer */}
            <hr className="register-divider" />

            <div className="register-disclaimer-box">
              <p className="register-disclaimer-text">
                Registration assigns a standard player account. Public registration cannot grant administrator privileges.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
