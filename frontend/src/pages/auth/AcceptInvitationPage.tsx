import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '@/services/api';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const AcceptInvitationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [email, setEmail] = useState<string>('');
  const [invitedBy, setInvitedBy] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage('No invitation token provided in URL.');
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await apiClient.get(`/auth/invitations/${token}`);
        if (res.data?.valid) {
          setEmail(res.data.email);
          setInvitedBy(res.data.invitedBy);
          setIsTokenValid(true);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Invitation token is invalid, revoked, or has expired.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

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
      const res = await apiClient.post('/auth/invitations/accept', {
        token,
        username,
        password,
      });

      setSuccessMessage(res.data?.message || 'Administrator account successfully created!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#080B0A] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <p className="mt-4 text-xs font-mono text-cyber-muted">Validating Invitation Token...</p>
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
              Accept Admin Invitation
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Complete your security profile to access the WebSec CTF management console.
            </p>
          </div>
        </div>

        {/* Invalid Token Banner */}
        {!isTokenValid && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 mb-1">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-rose-200">Invalid or Expired Invitation</h3>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              {errorMessage || 'This single-use invitation is invalid, revoked, or has expired.'}
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors"
              >
                Back to Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3 text-xs text-emerald-300 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">{successMessage}</p>
              <p className="text-emerald-400/80 text-[11px] mt-1">Redirecting to login portal...</p>
            </div>
          </div>
        )}

        {/* Form Error Box */}
        {errorMessage && isTokenValid && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300 mb-4">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Accept Form */}
        {isTokenValid && !successMessage && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email (Readonly) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cyber-muted">
                Invited Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-[#141A18]/60 border border-[#222E29] rounded-xl text-xs text-cyber-muted font-mono cursor-not-allowed opacity-80"
                />
              </div>
              {invitedBy && (
                <p className="text-[10px] text-cyber-muted/60 font-mono">
                  Invited by: <span className="text-emerald-400">{invitedBy}</span>
                </p>
              )}
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
                  placeholder="e.g. sec_lead_01"
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
                    <span>Completing Setup...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Admin Provisioning</span>
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

export default AcceptInvitationPage;
