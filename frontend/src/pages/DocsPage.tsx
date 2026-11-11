import React from 'react';
import { BookOpen, Shield, ExternalLink } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const frameworks = [
    {
      title: 'OWASP Top 10:2025',
      code: 'OWASP-TOP10',
      description: 'The standard awareness document representing a broad consensus about the most critical security risks to web applications.',
      link: 'https://owasp.org/www-project-top-ten/',
    },
    {
      title: 'OWASP Web Security Testing Guide (WSTG)',
      code: 'OWASP-WSTG',
      description: 'The premier cybersecurity testing resource for web application developers and security professionals.',
      link: 'https://owasp.org/www-project-web-security-testing-guide/',
    },
    {
      title: 'OWASP Application Security Verification Standard (ASVS)',
      code: 'OWASP-ASVS',
      description: 'A basis for designing, building, and testing technical application security controls.',
      link: 'https://owasp.org/www-project-application-security-verification-standard/',
    },
    {
      title: 'OWASP API Security Top 10',
      code: 'OWASP-API',
      description: 'Focuses on the top 10 security vulnerabilities found in modern APIs and microservice architectures.',
      link: 'https://owasp.org/www-project-api-security/',
    },
    {
      title: 'MITRE ATT&CK & PTES',
      code: 'ATT&CK / PTES',
      description: 'Globally accessible knowledge base of adversary tactics and techniques based on real-world observations.',
      link: 'https://attack.mitre.org/',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-cyber-text tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Documentation & References
        </h1>
        <p className="text-xs md:text-sm text-cyber-muted">
          Standards, vulnerability taxonomies, and rules of engagement for WebSec CTF.
        </p>
      </div>

      {/* Rules of Engagement */}
      <div className="rounded-xl border border-cyber-border bg-cyber-card p-6 space-y-3 shadow-lg">
        <h2 className="text-sm font-bold text-cyber-text flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Rules of Engagement (ROE)
        </h2>
        <ul className="text-xs text-cyber-muted space-y-2 list-disc list-inside leading-relaxed">
          <li>Attacks are strictly authorized only against isolated challenge target instances.</li>
          <li>Never attack or probe the core WebSec CTF platform infrastructure or hosting servers.</li>
          <li>Do not share plaintext flags with other participants; collaborative methodology is encouraged.</li>
          <li>Automated aggressive volumetric denial-of-service (DoS) tools are strictly prohibited.</li>
        </ul>
      </div>

      {/* Security Framework Standards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-cyber-text uppercase tracking-wider font-mono">
          Security Framework References
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {frameworks.map((fw) => (
            <div
              key={fw.code}
              className="rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated text-emerald-400 border border-emerald-800/30">
                    {fw.code}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-cyber-text">
                  {fw.title}
                </h3>
                <p className="text-xs text-cyber-muted leading-relaxed">
                  {fw.description}
                </p>
              </div>

              <div className="pt-3 border-t border-cyber-border flex justify-end">
                <a
                  href={fw.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Official Specification</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Author & Copyright Footer */}
      <div className="pt-6 border-t border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-cyber-muted">
        <div>
          WebSec CTF — Designed & Architected by <span className="text-emerald-400 font-bold">SEK Thorn</span>
        </div>
        <div className="text-[11px] text-cyber-muted/70">
          © 2026 SEK Thorn. All rights reserved. (MIT License)
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
