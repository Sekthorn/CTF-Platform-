import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';

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

  // Live countdown timer state (ticks down from 06:42:08)
  const [clockTime, setClockTime] = useState<string>('06:42:08');

  // Check registration success redirect or session expiry
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      setErrorMessage('Your session has expired. Please sign in to generate a new session.');
    }

    if (location.state?.registered && location.state?.message) {
      setSuccessNotice(location.state.message);
      if (location.state?.identifier) {
        setIdentifier(location.state.identifier);
      }
    }
  }, [location.state, location.search]);

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
      const from = (location.state as any)?.from?.pathname || '/challenges';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.message || '';
      if (
        msg.includes('Network') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('Failed to fetch') ||
        err.code === 'ERR_NETWORK'
      ) {
        setErrorMessage('Cannot reach backend server. Please verify backend is running on port 3000.');
      } else if (msg.includes('suspended')) {
        setErrorMessage('That account has been suspended. Please contact platform management.');
      } else if (
        msg.toLowerCase().includes('database') ||
        msg.includes("Can't reach database") ||
        msg.includes('500') ||
        msg.toLowerCase().includes('internal server error')
      ) {
        setErrorMessage('Cannot connect to database. Please make sure Docker Desktop (MySQL) is running.');
      } else {
        setErrorMessage(msg || 'That username and password don’t match. Attempts are logged and reviewed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      <style>{`
        .login-page-root {
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

        .login-grid {
          display: grid;
          grid-template-columns: 1.1fr 1px 1fr;
          min-height: 100vh;
          min-height: 900px;
          width: 100%;
        }

        .login-v-divider {
          background-color: var(--divider);
          width: 1px;
          height: 100%;
        }

        /* LEFT PANEL */
        .login-left-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px 48px 64px;
          position: relative;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          width: fit-content;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .login-brand:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .login-brand-title {
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

        .login-brand-title .accent {
          color: var(--accent);
          text-shadow: 0 0 10px rgba(45, 255, 122, 0.55);
        }

        .login-mobile-brand {
          display: none;
          margin-bottom: 12px;
        }

        /* RADAR SVG & ANIMATIONS */
        .login-radar-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 24px 0;
          position: relative;
        }

        .login-radar-svg {
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
            stroke-width: 0;
          }
        }

        /* 4 Synchronized Blips */
        .blip-1-dot {
          animation: blip-1-f 4s linear infinite;
        }
        .blip-1-halo {
          transform-origin: 298px 142px;
          animation: blip-1-h 4s cubic-bezier(0.1, 0.4, 0.6, 1) infinite;
        }
        @keyframes blip-1-f {
          0%, 12% { opacity: 0; }
          12.5% { opacity: 1; }
          22% { opacity: 0.85; }
          36% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes blip-1-h {
          0%, 12.4% { opacity: 0; r: 3px; stroke-width: 2px; }
          12.5% { opacity: 1; r: 3px; stroke-width: 2px; }
          24% { opacity: 0; r: 20px; stroke-width: 0.5px; }
          100% { opacity: 0; }
        }

        .blip-2-dot {
          animation: blip-2-f 4s linear infinite;
        }
        .blip-2-halo {
          transform-origin: 359px 300px;
          animation: blip-2-h 4s cubic-bezier(0.1, 0.4, 0.6, 1) infinite;
        }
        @keyframes blip-2-f {
          0%, 33% { opacity: 0; }
          33.3% { opacity: 1; }
          43% { opacity: 0.85; }
          58% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes blip-2-h {
          0%, 33.2% { opacity: 0; r: 3px; stroke-width: 2px; }
          33.3% { opacity: 1; r: 3px; stroke-width: 2px; }
          45% { opacity: 0; r: 22px; stroke-width: 0.5px; }
          100% { opacity: 0; }
        }

        .blip-3-dot {
          animation: blip-3-f 4s linear infinite;
        }
        .blip-3-halo {
          transform-origin: 128px 312px;
          animation: blip-3-h 4s cubic-bezier(0.1, 0.4, 0.6, 1) infinite;
        }
        @keyframes blip-3-f {
          0%, 62% { opacity: 0; }
          62.5% { opacity: 1; }
          72% { opacity: 0.85; }
          86% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes blip-3-h {
          0%, 62.4% { opacity: 0; r: 3px; stroke-width: 2px; }
          62.5% { opacity: 1; r: 3px; stroke-width: 2px; }
          74% { opacity: 0; r: 20px; stroke-width: 0.5px; }
          100% { opacity: 0; }
        }

        .blip-4-dot {
          animation: blip-4-f 4s linear infinite;
        }
        .blip-4-halo {
          transform-origin: 160px 160px;
          animation: blip-4-h 4s cubic-bezier(0.1, 0.4, 0.6, 1) infinite;
        }
        @keyframes blip-4-f {
          0%, 87% { opacity: 0; }
          87.5% { opacity: 1; }
          96% { opacity: 0.85; }
          100% { opacity: 0.2; }
        }
        @keyframes blip-4-h {
          0%, 87.4% { opacity: 0; r: 3px; stroke-width: 2px; }
          87.5% { opacity: 1; r: 3px; stroke-width: 2px; }
          98% { opacity: 0; r: 20px; stroke-width: 0.5px; }
          100% { opacity: 0; }
        }

        /* BOTTOM HERO HEADLINE & STATS */
        .login-left-bottom {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .login-hero-heading {
          font-family: var(--font-heading);
          font-size: 38px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .login-hero-heading .line-white {
          color: var(--text);
          display: block;
        }

        .login-hero-heading .line-green {
          color: var(--accent);
          display: block;
        }

        .login-stats-row {
          display: flex;
          align-items: flex-start;
          gap: 36px;
          padding-top: 6px;
        }

        .login-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .login-stat-value {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .login-stat-value.live {
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .login-stat-value.live::before {
          content: '';
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .login-stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* RIGHT PANEL: FORM */
        .login-right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 48px;
          position: relative;
        }

        .login-form-box {
          width: 100%;
          max-width: 480px;
          background: rgba(11, 17, 14, 0.88);
          border: 1px solid rgba(45, 255, 122, 0.18);
          border-top: 2px solid var(--accent);
          border-radius: 12px;
          padding: 40px 42px 36px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          box-shadow: 
            0 24px 60px rgba(0, 0, 0, 0.75),
            0 0 1px rgba(45, 255, 122, 0.35),
            inset 0 1px 0 rgba(45, 255, 122, 0.15);
          backdrop-filter: blur(16px);
          position: relative;
        }

        /* Top Bar of the Card with Logo and Status Pill */
        .login-card-brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(45, 255, 122, 0.1);
          margin-bottom: 2px;
        }

        .login-status-pill {
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

        .login-status-pill .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
          animation: status-pulse 2s infinite ease-in-out;
        }

        @keyframes status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .login-form-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-kicker {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .login-form-title {
          font-family: var(--font-heading);
          font-size: 34px;
          font-weight: 800;
          line-height: 1.15;
          color: var(--text);
          letter-spacing: -0.025em;
        }

        .login-form-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-top: 2px;
        }

        /* Inputs & Form Groups */
        .login-field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .login-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .login-field-label {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--text-label);
          cursor: pointer;
        }

        .login-forgot-link {
          font-size: 11.5px;
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s ease, text-decoration 0.15s ease;
        }

        .login-forgot-link:hover {
          color: var(--accent-hover);
          text-decoration: underline;
        }

        .login-forgot-link:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-radius: 2px;
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .login-text-input {
          width: 100%;
          height: 50px;
          background-color: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 6px;
          padding: 0 16px;
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .login-text-input::placeholder {
          color: rgba(147, 171, 159, 0.45);
        }

        .login-text-input:hover {
          border-color: #2e4d3c;
        }

        .login-text-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--input-focus-ring), 0 0 14px rgba(45, 255, 122, 0.12);
          background-color: #0d1511;
        }

        .login-text-input.has-toggle {
          padding-right: 48px;
        }

        .login-show-toggle {
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

        .login-show-toggle:hover {
          color: #fff;
          background-color: rgba(45, 255, 122, 0.2);
          border-color: rgba(45, 255, 122, 0.45);
        }

        .login-show-toggle:active {
          transform: scale(0.94);
        }

        .login-show-toggle:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        /* Custom Checkbox */
        .login-checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          width: fit-content;
          margin-top: 4px;
        }

        .login-checkbox-container input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .login-custom-checkbox {
          width: 18px;
          height: 18px;
          border: 1px solid var(--input-border);
          background-color: var(--input-bg);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .login-checkbox-container:hover .login-custom-checkbox {
          border-color: #2e4d3c;
        }

        .login-checkbox-container input[type="checkbox"]:focus-visible + .login-custom-checkbox {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-color: var(--accent);
        }

        .login-checkbox-container input[type="checkbox"]:checked + .login-custom-checkbox {
          background-color: var(--accent);
          border-color: var(--accent);
        }

        .login-custom-checkbox svg {
          width: 11px;
          height: 9px;
          opacity: 0;
          transform: scale(0.6);
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        .login-checkbox-container input[type="checkbox"]:checked + .login-custom-checkbox svg {
          opacity: 1;
          transform: scale(1);
        }

        .login-checkbox-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        /* Submit Button */
        .login-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 54px;
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

        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #5eff9c 0%, #2dff7a 100%);
          box-shadow: 0 0 28px var(--accent-glow), 0 4px 20px rgba(0, 0, 0, 0.5);
          transform: translateY(-1px);
        }

        .login-submit-btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
          box-shadow: 0 0 28px var(--accent-glow);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Navigation Links & Disclaimers */
        .login-link-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .login-accent-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.15s ease, text-decoration 0.15s ease;
        }

        .login-accent-link:hover {
          color: var(--accent-hover);
          text-decoration: underline;
        }

        .login-accent-link:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-radius: 2px;
        }

        .login-divider {
          height: 1px;
          background-color: rgba(45, 255, 122, 0.12);
          margin: 6px 0 2px;
          border: none;
        }

        .login-disclaimer-box {
          background: rgba(18, 30, 24, 0.55);
          border: 1px solid rgba(45, 255, 122, 0.08);
          border-radius: 6px;
          padding: 12px 14px;
        }

        .login-disclaimer-text {
          font-size: 11.5px;
          color: #7d9688;
          line-height: 1.55;
          margin: 0;
        }

        /* Alerts and notices */
        .login-alert-box {
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.45;
        }

        .login-alert-error {
          background-color: rgba(255, 93, 93, 0.1);
          border: 1px solid rgba(255, 93, 93, 0.35);
          color: var(--danger);
        }

        .login-alert-success {
          background-color: rgba(45, 255, 122, 0.1);
          border: 1px solid rgba(45, 255, 122, 0.35);
          color: var(--accent);
        }

        /* RESPONSIVE & REDUCED MOTION */
        @media (max-width: 900px) {
          .login-grid {
            grid-template-columns: 1fr;
          }

          .login-left-panel,
          .login-v-divider {
            display: none !important;
          }

          .login-right-panel {
            padding: 32px 16px;
            min-height: 100vh;
          }

          .login-form-box {
            padding: 32px 24px;
            max-width: 440px;
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
          .login-stat-value.live::before {
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

      <main className="login-grid">
        {/* ======================================================== */}
        {/* LEFT PANEL: Branding, Animated Radar & Event Stats       */}
        {/* ======================================================== */}
        <aside className="login-left-panel" aria-label="Operation Overview">
          {/* Top Logo */}
          <Link to="/" className="login-brand" aria-label="websec.ctf home">
            <img
              src="/logo-shield.svg"
              alt="websec.ctf"
              className="w-7 h-8 flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 10px rgba(45, 255, 122, 0.55))' }}
            />
            <span className="login-brand-title">
              <span className="chromatic-title">websec</span>
              <span className="accent">.ctf</span>
            </span>
          </Link>

          {/* Center: 440x440 Animated Radar SVG */}
          <div className="login-radar-wrapper" aria-hidden="true">
            <svg
              className="login-radar-svg"
              viewBox="0 0 440 440"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2dff7a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2dff7a" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="sweepTrailGrad" x1="100%" y1="0%" x2="0%" y2="80%">
                  <stop offset="0%" stopColor="#2dff7a" stopOpacity="0.32" />
                  <stop offset="40%" stopColor="#2dff7a" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2dff7a" stopOpacity="0" />
                </linearGradient>

                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Diagonal Faint Lines */}
              <line x1="78" y1="78" x2="362" y2="362" stroke="#15241c" strokeWidth="1" />
              <line x1="78" y1="362" x2="362" y2="78" stroke="#15241c" strokeWidth="1" />

              {/* Concentric Reference Circles */}
              <circle cx="220" cy="220" r="200" stroke="#1c3024" strokeWidth="1" fill="none" />
              <circle
                cx="220"
                cy="220"
                r="140"
                stroke="#1c3024"
                strokeWidth="1"
                strokeDasharray="4 4"
                fill="none"
              />
              <circle cx="220" cy="220" r="80" stroke="#1c3024" strokeWidth="1" fill="none" />

              {/* Cardinal Crosshairs */}
              <line x1="20" y1="220" x2="420" y2="220" stroke="#1c3024" strokeWidth="1" />
              <line x1="220" y1="20" x2="220" y2="420" stroke="#1c3024" strokeWidth="1" />

              {/* Expanding Center Ping Ripple */}
              <circle
                className="radar-ping-circle"
                cx="220"
                cy="220"
                r="24"
                stroke="#2dff7a"
                fill="none"
              />

              {/* Center Bullseye Ring & Dot */}
              <circle
                cx="220"
                cy="220"
                r="24"
                stroke="#2dff7a"
                strokeWidth="1.5"
                fill="url(#radarCenterGlow)"
                filter="url(#neonGlow)"
              />
              <circle cx="220" cy="220" r="3" fill="#2dff7a" />

              {/* 4 Synchronized Target Blips */}
              {/* Blip 1: 45°, r=110 (298, 142) */}
              <g>
                <circle className="blip-1-halo" cx="298" cy="142" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-1-dot" cx="298" cy="142" r="3" fill="#2dff7a" filter="url(#neonGlow)" />
              </g>

              {/* Blip 2: 120°, r=160 (359, 300) */}
              <g>
                <circle className="blip-2-halo" cx="359" cy="300" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-2-dot" cx="359" cy="300" r="3" fill="#2dff7a" filter="url(#neonGlow)" />
              </g>

              {/* Blip 3: 225°, r=130 (128, 312) */}
              <g>
                <circle className="blip-3-halo" cx="128" cy="312" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-3-dot" cx="128" cy="312" r="3" fill="#2dff7a" filter="url(#neonGlow)" />
              </g>

              {/* Blip 4: 315°, r=85 (160, 160) */}
              <g>
                <circle className="blip-4-halo" cx="160" cy="160" r="3" stroke="#2dff7a" fill="none" />
                <circle className="blip-4-dot" cx="160" cy="160" r="3" fill="#2dff7a" filter="url(#neonGlow)" />
              </g>

              {/* Rotating Sweep Arm & Trailing Wedge */}
              <g className="radar-sweep-arm">
                <path d="M 220 220 L 220 20 A 200 200 0 0 0 66.8 91.4 Z" fill="url(#sweepTrailGrad)" />
                <line
                  x1="220"
                  y1="220"
                  x2="220"
                  y2="20"
                  stroke="#2dff7a"
                  strokeWidth="1.75"
                  filter="url(#neonGlow)"
                />
              </g>
            </svg>
          </div>

          {/* Bottom Headline & Live Event Stats */}
          <div className="login-left-bottom">
            <h2 className="login-hero-heading">
              <span className="line-white">Find the flag.</span>
              <span className="line-green">Before they do.</span>
            </h2>

            <div className="login-stats-row" role="region" aria-label="Event Status Indicators">
              <div className="login-stat-item">
                <span className="login-stat-value">{clockTime}</span>
                <span className="login-stat-label">TIME LEFT</span>
              </div>
              <div className="login-stat-item">
                <span className="login-stat-value live">LIVE</span>
                <span className="login-stat-label">EVENT STATUS</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 1px Vertical Divider */}
        <div className="login-v-divider" role="separator" aria-orientation="vertical" />

        {/* ======================================================== */}
        {/* RIGHT PANEL: Form & Secure Operator Sign-In             */}
        {/* ======================================================== */}
        <section className="login-right-panel" aria-labelledby="signin-heading">
          <div className="login-form-box">
            {/* Top Brand */}
            <div className="login-card-brand-row">
              <Link to="/" className="login-brand" aria-label="websec.ctf home">
                <img
                  src="/logo-shield.svg"
                  alt="websec.ctf"
                  className="w-7 h-8 flex-shrink-0"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(45, 255, 122, 0.55))' }}
                />
                <span className="login-brand-title">
                  <span className="chromatic-title">websec</span>
                  <span className="accent">.ctf</span>
                </span>
              </Link>
            </div>

            {/* Form Header */}
            <header className="login-form-header">
              <span className="login-kicker">// SECURE ACCESS GATEWAY</span>
              <h1 id="signin-heading" className="login-form-title">
                Sign in
              </h1>
              <p className="login-form-subtitle">
                Enter your operator credentials to join the operation.
              </p>
            </header>

            {/* Error Message */}
            {errorMessage && (
              <div className="login-alert-box login-alert-error" role="alert">
                {errorMessage}
              </div>
            )}

            {/* Success Notice (e.g. from registration) */}
            {successNotice && (
              <div className="login-alert-box login-alert-success" role="status">
                {successNotice}
              </div>
            )}

            {/* Setup Required Notice */}
            {setupRequired && (
              <div className="login-alert-box login-alert-success">
                Initial administrator setup has not been run.{' '}
                <Link to="/admin/setup" className="underline font-bold text-emerald-400">
                  Run Initial Setup &gt;
                </Link>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Field 1: Username / Email */}
                <div className="login-field-group">
                  <label htmlFor="user" className="login-field-label">
                    USERNAME OR EMAIL
                  </label>
                  <div className="login-input-wrapper">
                    <input
                      type="text"
                      id="user"
                      name="user"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="you@websec.ctf"
                      className="login-text-input"
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="login-field-group">
                  <div className="login-field-header">
                    <label htmlFor="pw" className="login-field-label">
                      PASSWORD
                    </label>
                    <Link to="/forgot-password" className="login-forgot-link">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="login-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="pw"
                      name="pw"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={handleKeyUp}
                      onBlur={() => setCapsLockActive(false)}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      className="login-text-input has-toggle"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-show-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {capsLockActive && (
                    <p className="text-[11px] text-amber-400 font-mono mt-1" aria-live="polite">
                      Caps Lock is on.
                    </p>
                  )}
                </div>

                {/* Checkbox */}
                <label className="login-checkbox-container">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="login-custom-checkbox" aria-hidden="true">
                    <svg viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1.5 5L4.5 8L10.5 1.5"
                        stroke="#04120a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="login-checkbox-label">Keep me signed in on this device</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="login-submit-btn"
                  id="submit"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'AUTHENTICATING...' : 'SIGN IN →'}</span>
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="login-link-group" aria-label="Alternative entry paths">
              <p>
                New operator?{' '}
                <Link to="/register" className="login-accent-link">
                  Register here
                </Link>
              </p>
            </nav>

            {/* Divider & Disclaimer */}
            <hr className="login-divider" />

            <div className="login-disclaimer-box">
              <p className="login-disclaimer-text">
                All sign-ins are logged and reviewed. Five failed attempts lock the account for 15 minutes.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
