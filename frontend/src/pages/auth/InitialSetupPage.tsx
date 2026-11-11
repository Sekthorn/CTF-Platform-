import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '@/services/api';
import { Shield, KeyRound, User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const InitialSetupPage: React.FC = () => {
  const navigate = useNavigate();

  const [setupSecret, setSetupSecret] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isSetupAllowed, setIsSetupAllowed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiClient.get('/auth/setup-status');
        setIsSetupAllowed(res.data?.isSetupRequired === true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to check setup status.');
      } finally {
        setIsChecking(false);
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.post('/auth/initial-setup', {
        setupSecret,
        username,
        email,
        password,
      });

      setSuccessMessage(res.data?.message || 'Initial administrator account created successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Setup failed. Please verify your setup secret and information.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#080B0A] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <p className="mt-4 text-xs font-mono text-cyber-muted">Verifying Platform State...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#080B0A] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#101614] border border-[#1E2925] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Emblem & Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <img
            src="/logo-icon.png"
            alt="websec.ctf"
            className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(44,255,122,0.3)]"
          />

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-cyber-text tracking-tight font-mono">
              Initial Admin Setup
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Create the root administrator account to bootstrap WebSec CTF.
            </p>
          </div>
        </div>

        {/* Setup Not Allowed Notice */}
        {!isSetupAllowed && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 mb-1">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-amber-200">Setup Already Completed</h3>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              An administrator account already exists. For security reasons, initial setup can only be executed once.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
              >
                Return to Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3 text-xs text-emerald-300 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">{successMessage}</p>
              <p className="text-emerald-400/80 text-[11px] mt-1">Redirecting to login portal...</p>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Setup Form */}
        {isSetupAllowed && !successMessage && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Setup Secret */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cyber-muted">
                Setup Secret Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={setupSecret}
                  onChange={(e) => setSetupSecret(e.target.value)}
                  placeholder="SETUP_SECRET from server .env"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cyber-muted">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cyber-muted">
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@websec.ctf"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cyber-muted">
                Password (min 8 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cyber-muted">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-semibold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    <span>Provisioning Root Admin...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Root Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InitialSetupPage;
