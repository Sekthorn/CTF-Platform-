import React, { useEffect, useState } from 'react';
import { Terminal, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/services/api';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkBackendHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<HealthStatus>('/health');
      setHealth(response.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not connect to backend API');
      }
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo-icon.png" alt="websec.ctf" className="w-10 h-10 object-contain rounded-lg" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              websec<span className="text-emerald-400">.ctf</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">&gt; capture the flag</p>
          </div>
        </div>

        {/* Backend Status Badge */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={checkBackendHealth}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check API</span>
          </button>

          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border font-mono ${
              health?.status === 'ok'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/50'
            }`}
          >
            {health?.status === 'ok' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Backend Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                <span>Backend Disconnected</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Hero Section */}
        <div className="p-8 rounded-xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <Terminal className="h-3.5 w-3.5" />
            <span>Environment Initialized</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Practical Web Security Training Lab
          </h2>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            WebSec CTF is designed to provide real-world offensive and defensive security exercises
            mapped directly against industry-standard cybersecurity frameworks.
          </p>
        </div>

        {/* Security Frameworks Mapping */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Aligned Security Frameworks & Standards
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'OWASP Top 10:2025', desc: 'Critical Web Risks' },
              { name: 'OWASP WSTG', desc: 'Web Security Testing' },
              { name: 'OWASP ASVS', desc: 'Verification Standard' },
              { name: 'OWASP API Sec', desc: 'API Top 10 Vulnerabilities' },
              { name: 'CWE / CVSS', desc: 'Weakness Classification' },
              { name: 'MITRE ATT&CK', desc: 'Tactics & Techniques' },
              { name: 'PTES Standard', desc: 'Penetration Execution' },
              { name: 'Docker Labs', desc: 'Isolated Target Instances' },
            ].map((f) => (
              <div
                key={f.name}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="font-semibold text-xs text-white">{f.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Diagnostic Status */}
        <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Server className="h-4 w-4 text-emerald-400" />
            <span>System Diagnostic Connection</span>
          </h3>
          {loading && !health && (
            <p className="text-xs text-slate-400 animate-pulse font-mono">
              Probing NestJS health endpoint (/api/health)...
            </p>
          )}
          {error && (
            <div className="p-3 rounded bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs font-mono">
              Diagnostic notice: {error}
            </div>
          )}
          {health && (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Service:</span>
                <span className="text-emerald-400 font-bold">{health.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Health Status:</span>
                <span className="text-emerald-400 uppercase">{health.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Server Timestamp:</span>
                <span className="text-slate-300">{health.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        WebSec CTF Platform Foundation &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
