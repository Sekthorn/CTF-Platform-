import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/api';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setMessage(res.data?.message || 'Password reset request acknowledged.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080B0A] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      <div className="w-full max-w-md bg-[#101614] border border-[#1E2925] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <img
            src="/logo-icon.png"
            alt="websec.ctf"
            className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(44,255,122,0.3)]"
          />

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-cyber-text tracking-tight font-mono">
              Password Recovery
            </h1>
            <p className="text-xs text-cyber-muted mt-1">
              Request administrative password reset instructions.
            </p>
          </div>
        </div>

        {message ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-3 text-xs text-emerald-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{message}</p>
            </div>
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-cyber-muted">
                Administrator Email Address
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
                  className="w-full pl-9 pr-3 py-2.5 bg-[#141A18] border border-[#222E29] rounded-xl text-xs text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-semibold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-cyber-muted hover:text-cyber-text transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
