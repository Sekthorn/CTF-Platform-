import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Shield,
  ExternalLink,
  Search,
  AlertTriangle,
  Server,
  Key,
  Cpu,
  Layers,
  Code2,
  Flag,
  X,
  ChevronRight,
  CheckCircle2,
  Info,
  Terminal,
} from 'lucide-react';

interface SecurityFramework {
  code: string;
  title: string;
  category: 'owasp' | 'methodology' | 'taxonomy';
  version: string;
  summary: string;
  description: string;
  officialUrl: string;
  specUrl: string;
  repoUrl?: string;
  tags: string[];
  keyCategories: { id: string; name: string; focus: string }[];
  ctfRelevance: string;
}

export const DocsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'owasp' | 'methodology' | 'roe' | 'platform'>('all');
  const [selectedFramework, setSelectedFramework] = useState<SecurityFramework | null>(null);

  // Authoritative Security Frameworks and Vulnerability Taxonomies
  const frameworks: SecurityFramework[] = [
    {
      code: 'OWASP-TOP10',
      title: 'OWASP Top 10:2021 (with 2025 Roadmap)',
      category: 'owasp',
      version: 'v2021 / 2025 Draft',
      summary: 'The foundational globally recognized awareness standard for critical web application security risks.',
      description:
        'The OWASP Top 10 is the premier consensus-based document detailing the most critical security risks facing modern web applications. Adopted by PCI-DSS, NIST, FTC, and international cybersecurity bodies, it provides developers and penetration testers with essential guidance on application vulnerabilities and mitigation techniques.',
      officialUrl: 'https://owasp.org/www-project-top-ten/',
      specUrl: 'https://owasp.org/Top10/',
      repoUrl: 'https://github.com/OWASP/Top10',
      tags: ['Broken Access Control', 'Cryptographic Failures', 'Injection', 'Insecure Design', 'SSRF'],
      ctfRelevance:
        'WebSec CTF structures its primary challenge matrix around OWASP Top 10 categories, ranging from basic SQL injection to advanced multi-step SSRF attacks.',
      keyCategories: [
        { id: 'A01:2021', name: 'Broken Access Control', focus: 'Enforcement failures, IDOR, path traversal, bypassing authorization checks.' },
        { id: 'A02:2021', name: 'Cryptographic Failures', focus: 'Sensitive data exposure in transit/at rest, weak ciphers, missing TLS.' },
        { id: 'A03:2021', name: 'Injection', focus: 'SQL, NoSQL, OS command, ORM, and LDAP injection from untrusted input.' },
        { id: 'A04:2021', name: 'Insecure Design', focus: 'Missing threat modeling, insecure architectural patterns, flawed business logic.' },
        { id: 'A05:2021', name: 'Security Misconfiguration', focus: 'Default credentials, verbose error stack traces, unhardened HTTP headers.' },
        { id: 'A06:2021', name: 'Vulnerable & Outdated Components', focus: 'Dependencies with known CVEs, unpatched frameworks, supply chain risks.' },
        { id: 'A07:2021', name: 'Identification & Auth Failures', focus: 'Credential stuffing, brute force, weak session management, missing MFA.' },
        { id: 'A08:2021', name: 'Software & Data Integrity Failures', focus: 'Insecure CI/CD pipelines, untrusted deserialization, integrity bypasses.' },
        { id: 'A09:2021', name: 'Security Logging & Monitoring', focus: 'Failure to log authentication failures, missing alerts for suspicious activity.' },
        { id: 'A10:2021', name: 'Server-Side Request Forgery (SSRF)', focus: 'Fetching remote resources without validating user-supplied destination URLs.' },
      ],
    },
    {
      code: 'OWASP-WSTG',
      title: 'OWASP Web Security Testing Guide (WSTG)',
      category: 'owasp',
      version: 'v4.2 / v5.0 Master',
      summary: 'The premier cybersecurity testing playbook for penetration testers and application security auditors.',
      description:
        'The OWASP Web Security Testing Guide (WSTG) is a comprehensive framework for testing the security of web applications and web services. Created by security professionals and penetration testing experts, it details over 90 specialized test cases spanning information gathering, identity management, authentication, and client-side security.',
      officialUrl: 'https://owasp.org/www-project-web-security-testing-guide/',
      specUrl: 'https://owasp.org/www-project-web-security-testing-guide/stable/',
      repoUrl: 'https://github.com/OWASP/wstg',
      tags: ['Black-box Testing', 'Grey-box Testing', 'Methodology', 'Burp Suite', 'Vulnerability Assessment'],
      ctfRelevance:
        'Every challenge solution walkthrough in WebSec CTF is mapped directly to standard WSTG test identifiers (e.g. WSTG-INPV-05 for SQL Injection).',
      keyCategories: [
        { id: 'WSTG-INFO', name: 'Information Gathering', focus: 'OSINT, banner grabbing, directory enumeration, web server fingerprinting.' },
        { id: 'WSTG-CONF', name: 'Configuration Management', focus: 'Infrastructure review, HTTP methods, HSTS, CORS configuration.' },
        { id: 'WSTG-IDNT', name: 'Identity Management', focus: 'Role definition, user registration, account enumeration, username harvesting.' },
        { id: 'WSTG-ATHN', name: 'Authentication Testing', focus: 'Password reset flaws, brute force resistance, remember-me token security.' },
        { id: 'WSTG-ATHZ', name: 'Authorization Testing', focus: 'Horizontal/vertical privilege escalation, BOLA/IDOR, directory traversal.' },
        { id: 'WSTG-SESS', name: 'Session Management', focus: 'Session fixation, cookie attributes (HttpOnly, Secure, SameSite), CSRF.' },
        { id: 'WSTG-INPV', name: 'Input Validation', focus: 'XSS, SQLi, command injection, path traversal, XML external entities (XXE).' },
        { id: 'WSTG-CRYP', name: 'Cryptography Testing', focus: 'Weak SSL/TLS ciphers, padding oracles, predictable random number generators.' },
        { id: 'WSTG-BIZ', name: 'Business Logic Testing', focus: 'Price tampering, race conditions, skipping transactional workflow steps.' },
        { id: 'WSTG-CLNT', name: 'Client-Side Testing', focus: 'DOM-based XSS, WebSocket vulnerabilities, postMessage security, clickjacking.' },
      ],
    },
    {
      code: 'OWASP-ASVS',
      title: 'OWASP Application Security Verification Standard (ASVS)',
      category: 'owasp',
      version: 'v4.0.3 / v5.0',
      summary: 'Rigorous technical requirements and controls for designing, developing, and auditing secure applications.',
      description:
        'The OWASP Application Security Verification Standard (ASVS) provides developers and architects with a basis for designing and building secure web applications. It defines three progressive verification levels (L1 Automated, L2 Standard Applications, L3 Critical Infrastructure), serving as a benchmark for technical security verification.',
      officialUrl: 'https://owasp.org/www-project-application-security-verification-standard/',
      specUrl: 'https://github.com/OWASP/ASVS/releases',
      repoUrl: 'https://github.com/OWASP/ASVS',
      tags: ['Verification Levels', 'Security Architecture', 'Compliance', 'Defensive Controls'],
      ctfRelevance:
        'Used in our defense and remediation challenges, teaching players how to verify and implement secure controls that meet ASVS standards.',
      keyCategories: [
        { id: 'Level 1', name: 'Opportunistic Baseline', focus: 'Verification that can be performed using automated penetration testing tools.' },
        { id: 'Level 2', name: 'Standard Commercial Apps', focus: 'Required for applications handling sensitive B2B data, PII, and financial transactions.' },
        { id: 'Level 3', name: 'High Assurance & Critical', focus: 'Required for defense, healthcare, and critical national infrastructure systems.' },
        { id: 'Chapter V2', name: 'Authentication Verification', focus: 'NIST 800-63b alignment, credential hygiene, password managers compatibility.' },
        { id: 'Chapter V3', name: 'Session Management', focus: 'Secure cookie attributes, token revocation, anti-session hijacking controls.' },
        { id: 'Chapter V5', name: 'Validation & Encoding', focus: 'Context-aware output encoding, strict parameter allowlisting, safe parsers.' },
      ],
    },
    {
      code: 'OWASP-API',
      title: 'OWASP API Security Top 10',
      category: 'owasp',
      version: '2023 Edition',
      summary: 'Top 10 vulnerability classifications targeting modern REST, GraphQL, and microservice APIs.',
      description:
        'APIs power modern web and mobile applications, but often introduce unique attack surfaces that traditional web security models miss. The OWASP API Security Top 10 focuses on API-specific vulnerabilities such as Broken Object Level Authorization (BOLA), mass assignment, and lack of resource consumption rate limits.',
      officialUrl: 'https://owasp.org/www-project-api-security/',
      specUrl: 'https://owasp.org/API-Security/editions/2023/en/0x00-header/',
      repoUrl: 'https://github.com/OWASP/API-Security',
      tags: ['BOLA', 'IDOR', 'JWT Exploitation', 'GraphQL', 'REST API Security', 'Mass Assignment'],
      ctfRelevance:
        'WebSec CTF includes dedicated API training labs featuring vulnerable JWT validation, GraphQL introspection, and microservice token forgery.',
      keyCategories: [
        { id: 'API1:2023', name: 'Broken Object Level Authorization (BOLA)', focus: 'IDOR where users manipulate object IDs in API endpoints to access other tenants.' },
        { id: 'API2:2023', name: 'Broken Authentication', focus: 'JWT signature bypass (alg:none), predictable tokens, lack of rate limiting on login.' },
        { id: 'API3:2023', name: 'Broken Object Property Level Authorization', focus: 'Mass assignment leading to privilege escalation; excessive data exposure in JSON responses.' },
        { id: 'API4:2023', name: 'Unrestricted Resource Consumption', focus: 'Lack of pagination limits, regex DoS (ReDoS), memory exhaustion via large payloads.' },
        { id: 'API5:2023', name: 'Broken Function Level Authorization (BFLA)', focus: 'Non-admin users accessing /api/v1/admin/users endpoints due to missing RBAC.' },
        { id: 'API6:2023', name: 'Unrestricted Access to Business Flows', focus: 'Botting, automated coupon brute-forcing, inventory hoarding without CAPTCHA.' },
        { id: 'API7:2023', name: 'Server-Side Request Forgery (SSRF)', focus: 'Exploiting webhook registration or URL validation to pivot into internal cloud APIs.' },
        { id: 'API8:2023', name: 'Security Misconfiguration', focus: 'Unprotected Swagger/OpenAPI docs, unhandled exceptions returning stack traces.' },
        { id: 'API9:2023', name: 'Improper Inventory Management', focus: 'Deprecated /v1 endpoints left running with unpatched security flaws (Shadow APIs).' },
        { id: 'API10:2023', name: 'Unsafe Consumption of APIs', focus: 'Blindly trusting third-party API responses without input sanitization.' },
      ],
    },
    {
      code: 'MITRE-CWE',
      title: 'CWE — Common Weakness Enumeration',
      category: 'taxonomy',
      version: 'v4.14 / Top 25',
      summary: 'Community-developed formal dictionary of software security weaknesses, flaws, and vulnerabilities.',
      description:
        'Maintained by the MITRE Corporation, Common Weakness Enumeration (CWE) provides a unified, measurable taxonomy of software flaws. It connects real-world CVE vulnerability advisories to underlying code defects, providing developers with clear mitigation advice.',
      officialUrl: 'https://cwe.mitre.org/',
      specUrl: 'https://cwe.mitre.org/top25/archive/2023/2023_cwe_top25.html',
      repoUrl: 'https://github.com/CWE-CAPEC/cwe-schema',
      tags: ['CWE Top 25', 'Code Flaws', 'Vulnerability Taxonomy', 'Static Analysis'],
      ctfRelevance:
        'Every single challenge in WebSec CTF is tagged with its formal CWE identifier so players learn to correlate vulnerabilities with real CVE alerts.',
      keyCategories: [
        { id: 'CWE-79', name: 'Improper Neutralization of Input (XSS)', focus: 'Cross-site Scripting via reflected, stored, or DOM-based vectors.' },
        { id: 'CWE-89', name: 'SQL Injection', focus: 'Improper neutralization of special elements used in an SQL Command.' },
        { id: 'CWE-20', name: 'Improper Input Validation', focus: 'Failure to validate that incoming input conforms to expected specifications.' },
        { id: 'CWE-22', name: 'Path Traversal', focus: 'Using ../ sequences to access restricted files outside the intended root directory.' },
        { id: 'CWE-352', name: 'Cross-Site Request Forgery (CSRF)', focus: 'Forcing an authenticated victim browser to execute unwanted actions.' },
        { id: 'CWE-434', name: 'Unrestricted Upload of File with Dangerous Type', focus: 'Uploading executable PHP/JSP scripts via file upload functionality.' },
        { id: 'CWE-862', name: 'Missing Authorization', focus: 'Executing privileged code without verifying that the requester has permissions.' },
        { id: 'CWE-918', name: 'Server-Side Request Forgery (SSRF)', focus: 'Server making unexpected network connections on behalf of an attacker.' },
      ],
    },
    {
      code: 'FIRST-CVSS',
      title: 'CVSS — Common Vulnerability Scoring System',
      category: 'taxonomy',
      version: 'v3.1 & v4.0 Specification',
      summary: 'Open industry standard for assessing the severity and exploitability metrics of software vulnerabilities.',
      description:
        'Managed by FIRST (Forum of Incident Response and Security Teams), the Common Vulnerability Scoring System (CVSS) provides a standard numerical rating (0.0 to 10.0) reflecting vulnerability severity. It combines Base (intrinsic qualities), Temporal (exploit maturity), and Environmental metrics.',
      officialUrl: 'https://www.first.org/cvss/',
      specUrl: 'https://www.first.org/cvss/v3.1/specification-document',
      repoUrl: 'https://www.first.org/cvss/calculator/3.1',
      tags: ['CVSS 3.1', 'CVSS 4.0', 'Severity Scoring', 'Exploitability Metrics', 'FIRST'],
      ctfRelevance:
        'Challenges show CVSS v3.1 vector strings (e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H) to help operators understand real-world risk calculation.',
      keyCategories: [
        { id: 'Base Metrics', name: 'Exploitability Metrics', focus: 'Attack Vector (AV), Attack Complexity (AC), Privileges Required (PR), User Interaction (UI).' },
        { id: 'Impact Metrics', name: 'Technical Impact', focus: 'Confidentiality (C), Integrity (I), Availability (A), Scope (S).' },
        { id: 'Severity Ratings', name: 'Qualitative Scale', focus: 'None (0.0), Low (0.1 - 3.9), Medium (4.0 - 6.9), High (7.0 - 8.9), Critical (9.0 - 10.0).' },
        { id: 'CVSS v4.0', name: 'Macro-vectors', focus: 'Introduces CVSS-B (Base), CVSS-BT (Threat), CVSS-BE (Environmental), and CVSS-BTE.' },
      ],
    },
    {
      code: 'MITRE-ATT&CK',
      title: 'MITRE ATT&CK Framework',
      category: 'methodology',
      version: 'Enterprise Matrix v14',
      summary: 'Globally accessible knowledge base of adversary tactics and techniques based on real-world observations.',
      description:
        'MITRE ATT&CK is a curated knowledge base detailing adversary behavior across the entire cyber attack lifecycle. For web penetration testing, it describes how initial access via public-facing applications (T1190) transitions to credential harvesting, lateral movement, and command execution.',
      officialUrl: 'https://attack.mitre.org/',
      specUrl: 'https://attack.mitre.org/matrices/enterprise/',
      repoUrl: 'https://attack.mitre.org/techniques/T1190/',
      tags: ['Adversary Simulation', 'Threat Modeling', 'TTPs', 'Initial Access', 'Web Shells'],
      ctfRelevance:
        'Simulates real adversarial attack chains: chaining web vulnerabilities into reverse shells and privilege escalation.',
      keyCategories: [
        { id: 'TA0001', name: 'Initial Access (T1190)', focus: 'Exploiting public-facing applications via unpatched zero-days or web vulnerabilities.' },
        { id: 'TA0002', name: 'Execution (T1059)', focus: 'Command and scripting interpreter execution (sh, bash, Python, PowerShell).' },
        { id: 'TA0003', name: 'Persistence (T1505)', focus: 'Placing server web shells in public web directories to maintain persistent access.' },
        { id: 'TA0004', name: 'Privilege Escalation (T1068)', focus: 'Exploiting local sudo privileges, SUID binaries, or vulnerable kernel modules.' },
        { id: 'TA0006', name: 'Credential Access (T1552)', focus: 'Harvesting environment variables, .env files, database credentials, and cloud metadata.' },
      ],
    },
    {
      code: 'PTES-STANDARD',
      title: 'PTES — Penetration Testing Execution Standard',
      category: 'methodology',
      version: 'Release 1.0',
      summary: 'Standardized operational lifecycle guiding professional penetration testing engagements from scoping to reporting.',
      description:
        'The Penetration Testing Execution Standard (PTES) defines a baseline methodology for technical security testing engagements. Developed by industry leaders, it establishes the 7 distinct phases required to conduct thorough, repeatable, and ethical penetration tests.',
      officialUrl: 'http://www.pentest-standard.org/',
      specUrl: 'http://www.pentest-standard.org/index.php/PTES_Technical_Guidelines',
      tags: ['Methodology', 'Engagement Lifecycle', 'Scoping', 'Rules of Engagement', 'Reporting'],
      ctfRelevance:
        'Teaches players to approach CTF challenges systematically using professional reconnaissance, threat modeling, and documented proof-of-concept steps.',
      keyCategories: [
        { id: 'Phase 1', name: 'Pre-engagement Interactions', focus: 'Scoping, rules of engagement, legal authority, emergency escalation procedures.' },
        { id: 'Phase 2', name: 'Intelligence Gathering', focus: 'OSINT, domain reconnaissance, banner grabbing, technology stack detection.' },
        { id: 'Phase 3', name: 'Threat Modeling', focus: 'Identifying crown-jewel assets, threat actor motivation, attack surface mapping.' },
        { id: 'Phase 4', name: 'Vulnerability Analysis', focus: 'Verifying automated scanner output, manual exploit payload development.' },
        { id: 'Phase 5', name: 'Exploitation', focus: 'Executing controlled attacks without disrupting client availability or data integrity.' },
        { id: 'Phase 6', name: 'Post Exploitation', focus: 'Determining the value and impact of compromised machines, identifying sensitive data.' },
        { id: 'Phase 7', name: 'Reporting', focus: 'Documenting findings with executive summaries, CVSS scores, and reproducible remediation steps.' },
      ],
    },
    {
      code: 'PORTSWIGGER',
      title: 'PortSwigger Web Security Academy & Research',
      category: 'methodology',
      version: 'Active 2026 Curriculum',
      summary: 'Cutting-edge web security research, practical exploit walkthroughs, and modern vulnerability advisories.',
      description:
        'Created by PortSwigger (the developers of Burp Suite), the Web Security Academy provides premier hands-on web penetration testing training. It documents cutting-edge attack techniques such as HTTP Request Smuggling, WebSockets vulnerabilities, Prototype Pollution, and OAuth 2.0 implementation flaws.',
      officialUrl: 'https://portswigger.net/web-security',
      specUrl: 'https://portswigger.net/research',
      tags: ['Burp Suite', 'HTTP Request Smuggling', 'Prototype Pollution', 'OAuth 2.0', 'Advanced Web Exploitation'],
      ctfRelevance:
        'Our Medium and Hard challenges draw directly from advanced PortSwigger research papers, including HTTP header manipulation and prototype pollution.',
      keyCategories: [
        { id: 'Advanced Web', name: 'HTTP Request Smuggling', focus: 'Exploiting discrepant parsing between reverse proxies and backends (CL.TE, TE.CL).' },
        { id: 'Client/Server', name: 'Server-Side Template Injection', focus: 'Gaining remote code execution via Jinja2, FreeMarker, and Twig template engines.' },
        { id: 'Authentication', name: 'OAuth 2.0 & OpenID Connect', focus: 'Flawed token exchange, redirect_uri hijacking, CSRF in state parameter.' },
        { id: 'JavaScript Flaws', name: 'Prototype Pollution', focus: 'Modifying Object.prototype in Node.js backends and client-side applications.' },
      ],
    },
    {
      code: 'NIST-SP800-115',
      title: 'NIST SP 800-115 — InfoSec Testing & Assessment Guide',
      category: 'methodology',
      version: 'Final Publication',
      summary: 'Federal technical guide for conducting information security testing, vulnerability scanning, and pen-testing.',
      description:
        'NIST Special Publication 800-115 provides recommendations for improving an organization’s security posture through technical testing and examination. It covers target identification, port and vulnerability scanning, wireless security, password cracking, and structured penetration testing.',
      officialUrl: 'https://csrc.nist.gov/publications/detail/sp/800-115/final',
      specUrl: 'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf',
      tags: ['NIST', 'Compliance', 'Security Assessment', 'Vulnerability Scanning', 'Federal Standards'],
      ctfRelevance:
        'Provides the methodological rigor behind WebSec CTF reporting standards and objective technical evidence collection.',
      keyCategories: [
        { id: 'Section 4', name: 'Target Identification', focus: 'Network port scanning, service identification, network device enumeration.' },
        { id: 'Section 5', name: 'Vulnerability Analysis', focus: 'Automated vulnerability scanning, application security testing, configuration audit.' },
        { id: 'Section 6', name: 'Penetration Testing', focus: 'Phase-based testing (Planning, Discovery, Attack, Reporting), risk mitigation.' },
        { id: 'Section 7', name: 'Post-Testing Activities', focus: 'Removing backdoors/testing artifacts, restoring original configuration states.' },
      ],
    },
  ];

  // Filter frameworks based on search and active tab
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter((fw) => {
      const matchesSearch =
        fw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fw.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fw.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fw.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === 'all') return true;
      if (activeTab === 'owasp') return fw.category === 'owasp';
      if (activeTab === 'methodology') return fw.category === 'methodology' || fw.category === 'taxonomy';
      return true;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="space-y-8 max-w-6xl font-sans pb-16">
      {/* Page Header */}
      <div className="border-b border-cyber-border/70 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                // PLATFORM KNOWLEDGE BASE
              </span>
              <span className="text-xs font-mono text-cyber-muted">STANDARDS & OPERATIONAL MANUAL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-cyber-text tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              Documentation & Security Frameworks
            </h1>
            <p className="text-sm text-cyber-muted mt-1 max-w-2xl leading-relaxed">
              Official industry standards, vulnerability taxonomies, testing methodologies, and operational rules of engagement for WebSec CTF.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 bg-cyber-card border border-cyber-border rounded-xl px-4 py-2.5 shadow-sm">
            <div className="text-center pr-3 border-r border-cyber-border">
              <div className="text-lg font-bold font-mono text-emerald-400">10</div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">Frameworks</div>
            </div>
            <div className="text-center pr-3 border-r border-cyber-border">
              <div className="text-lg font-bold font-mono text-sky-400">100%</div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">Official Links</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-amber-400">v2.4</div>
              <div className="text-[10px] font-mono text-cyber-muted uppercase">CTF Standard</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-2 border-t border-cyber-border/50 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
            }`}
          >
            <span>All References</span>
            <span className="text-[10px] opacity-75">({frameworks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('owasp')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'owasp'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
            }`}
          >
            <span>OWASP Standards</span>
            <span className="text-[10px] opacity-75">(4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('methodology')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'methodology'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
            }`}
          >
            <span>Methodologies & Taxonomies</span>
            <span className="text-[10px] opacity-75">(6)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roe')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'roe'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Rules of Engagement (ROE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('platform')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'platform'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Platform Architecture & Mechanics</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION: RULES OF ENGAGEMENT (Visible when 'all' or 'roe' active)    */}
      {/* ==================================================================== */}
      {(activeTab === 'all' || activeTab === 'roe') && (
        <section aria-labelledby="roe-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="roe-heading" className="text-base font-bold text-cyber-text flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Platform Rules of Engagement (ROE)</span>
              <span className="text-[11px] font-mono text-emerald-400/80 font-normal px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                MANDATORY PROTOCOL
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule 1: Scoped Targets */}
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>1. AUTHORIZED TARGETS & ISOLATED CONTAINERS</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Security testing and exploit activities are strictly authorized <strong className="text-cyber-text">only against your designated challenge container instances</strong>. Each challenge runs in a private Docker bridge sandbox. Under no circumstances should you target other players&apos; instances.
              </p>
            </div>

            {/* Rule 2: Out of Bounds */}
            <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs font-mono">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>2. OUT-OF-BOUNDS PLATFORM INFRASTRUCTURE</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Attacking the main platform infrastructure (<code className="text-red-300 font-mono">CTF Backend :3000</code>, <code className="text-red-300 font-mono">MySQL Database :3306</code>, <code className="text-red-300 font-mono">Redis :6379</code>, or Docker Host daemon) is strictly forbidden and triggers automated IP disqualification.
              </p>
            </div>

            {/* Rule 3: Flag Integrity */}
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs font-mono">
                <Key className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>3. PER-PLAYER DYNAMIC FLAGS & INTEGRITY</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Flags in WebSec CTF use per-player cryptographic HMAC generation (<code className="text-sky-300 font-mono">websec&#123;...&#125;</code>). Sharing plaintext flags with other participants bypasses learning and will fail server-side validation. Methodological discussions are welcomed; flag trading is prohibited.
              </p>
            </div>

            {/* Rule 4: DoS Limits */}
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <Cpu className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>4. VOLUMETRIC DOS & AGGRESSIVE FUZZING LIMITS</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Automated volumetric denial-of-service (DoS), flood attacks, and high-frequency scanners (&gt; 50 req/sec) are strictly blocked. Solutions do not require brute forcing network bandwidth; all challenges are solvable through targeted vulnerability exploitation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* SECTION: PLATFORM MECHANICS (Visible when 'all' or 'platform' active) */}
      {/* ==================================================================== */}
      {(activeTab === 'all' || activeTab === 'platform') && (
        <section aria-labelledby="platform-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="platform-heading" className="text-base font-bold text-cyber-text flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>CTF Platform Architecture & Game Mechanics</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dynamic Flag Format */}
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <Flag className="w-4 h-4" />
                <span>Flag Standard</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Standard format is <code className="text-emerald-400 font-mono font-bold bg-cyber-elevated px-1.5 py-0.5 rounded">websec&#123;...&#125;</code>.
                Dynamic flags are seeded using the player&apos;s cryptographic token, ensuring that each operator must exploit the target application themselves to obtain their unique flag.
              </p>
              <div className="text-[11px] font-mono text-cyber-muted bg-cyber-elevated/60 p-2.5 rounded border border-cyber-border/40">
                Format: <span className="text-emerald-300">websec&#123;[a-z0-9_]+&#125;</span>
              </div>
            </div>

            {/* Docker Isolation */}
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold">
                <Layers className="w-4 h-4" />
                <span>Container Isolation</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Challenge environments are deployed on-demand in isolated Docker containers with non-root privileges, read-only root filesystems, CPU quotas (0.5 vCPU), and memory limits (256MB).
              </p>
              <div className="text-[11px] font-mono text-cyber-muted bg-cyber-elevated/60 p-2.5 rounded border border-cyber-border/40">
                Instance TTL: <span className="text-sky-300">60-minute auto-expiry</span>
              </div>
            </div>

            {/* Hint System & Penalties */}
            <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                <Code2 className="w-4 h-4" />
                <span>Scoring & Hint Penalties</span>
              </div>
              <p className="text-xs text-cyber-muted leading-relaxed">
                Challenges award dynamic points that decay slightly as more operators solve them. Hints are structured in 3 progressive tiers with transparent point deductions.
              </p>
              <div className="text-[11px] font-mono text-cyber-muted bg-cyber-elevated/60 p-2.5 rounded border border-cyber-border/40">
                Tier 1 (Free) • Tier 2 (-15%) • Tier 3 (-40%)
              </div>
            </div>
          </div>

          {/* Step-by-Step Guide: How to Find Flags & Web Security Fundamentals Targets */}
          <div className="rounded-xl border border-emerald-500/25 bg-cyber-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>How to Find Flags — Practical Field Guide (Including Web Security Fundamentals)</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300/80 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 w-fit">
                12 Categories • 73 Live Challenges
              </span>
            </div>

            <p className="text-xs text-cyber-muted leading-relaxed">
              Every challenge exposes an HTTP microservice target under{' '}
              <code className="text-emerald-300 font-mono bg-cyber-elevated px-1.5 py-0.5 rounded">
                /api/v1/targets/:username/:slug/...
              </code>{' '}
              (or the shorthand{' '}
              <code className="text-emerald-300 font-mono bg-cyber-elevated px-1.5 py-0.5 rounded">
                /api/v1/targets/:slug/...
              </code>
              ). Flags follow the format <code className="text-emerald-400 font-mono">WEBSEC&#123;...&#125;</code> and are returned inside HTTP response headers, JSON API responses, DOM/console leaks, or database query output once you trigger or verify the target condition.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/50 p-3 space-y-1.5">
                <div className="font-mono font-bold text-cyan-400 text-[11px]">1. Inspect Headers &amp; Cookies</div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">
                  Open DevTools (<kbd className="px-1 py-0.5 bg-cyber-card border border-cyber-border rounded">F12</kbd> → Network) or run <code className="text-cyan-300 font-mono">curl -i</code>. Body-only output hides tokens inside <code className="text-cyan-300 font-mono">X-Foundations-Trace</code>, <code className="text-cyan-300 font-mono">Strict-Transport-Security</code>, or <code className="text-cyan-300 font-mono">Set-Cookie</code>.
                </p>
              </div>
              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/50 p-3 space-y-1.5">
                <div className="font-mono font-bold text-amber-400 text-[11px]">2. Probe Verbs &amp; Preflight</div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">
                  Send <code className="text-amber-300 font-mono">OPTIONS</code> to enumerate <code className="text-amber-300 font-mono">Allow</code> methods, then replay state-changing verbs (<code className="text-amber-300 font-mono">PUT</code> / <code className="text-amber-300 font-mono">POST</code>) or spoofed <code className="text-amber-300 font-mono">Origin</code> headers.
                </p>
              </div>
              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/50 p-3 space-y-1.5">
                <div className="font-mono font-bold text-violet-400 text-[11px]">3. Intercept &amp; Tamper Payloads</div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">
                  Browser forms and disabled fields only constrain UI. Replay <code className="text-violet-300 font-mono">POST</code> requests with Burp Repeater or <code className="text-violet-300 font-mono">curl -X POST</code> modifying prices, roles, cookies, or JWT claims.
                </p>
              </div>
              <div className="rounded-lg border border-cyber-border bg-cyber-elevated/50 p-3 space-y-1.5">
                <div className="font-mono font-bold text-emerald-400 text-[11px]">4. Verify &amp; Capture</div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">
                  Once your probe triggers the vulnerable response or validates the security control (SOP tuple, STRIDE trust boundary, ASVS V3), copy the <code className="text-emerald-300 font-mono">WEBSEC&#123;...&#125;</code> token and submit it in the Challenge Workspace.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-cyber-border bg-cyber-elevated/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Web Security Fundamentals (Foundations) — Target Endpoints Cheat Sheet
                </span>
                <span className="text-[10px] font-mono text-cyber-muted">
                  Full solutions: docs/CHALLENGE_SOLUTIONS_WALKTHROUGH.md
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] font-mono">
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">http2-header-semantics-lab</span> → <span className="text-cyber-text">curl -i .../api/v1/health</span> (check <code className="text-emerald-400">X-Foundations-Trace</code> header)
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">http-method-verb-safety-lab</span> → <span className="text-cyber-text">OPTIONS / PUT .../status</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">owasp-top10-taxonomy-lab</span> → <span className="text-cyber-text">GET .../api/triage?owasp=A01&amp;attackVector=AV:N</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">tls-https-transport-basics-lab</span> → <span className="text-cyber-text">GET .../tls-check?enforce=hsts</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">same-origin-policy-boundaries-lab</span> → <span className="text-cyber-text">GET .../api/origin-check?url=https://portal.websec.local/admin</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">cors-preflight-trust-flaws-lab</span> → <span className="text-cyber-text">curl -i -H &quot;Origin: https://attacker.example&quot; .../api/account</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">rfc6265-cookie-flags-lab</span> → <span className="text-cyber-text">curl -i .../login?mode=secure</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">browser-storage-session-basics-lab</span> → <span className="text-cyber-text">GET .../api/storage-audit?recommended=httponly_cookie</span>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">web-proxy-interception-lab</span> → <span className="text-cyber-text">POST .../api/checkout</span> with tampered <code className="text-emerald-400">&#123;&quot;price&quot;:1,&quot;role&quot;:&quot;admin&quot;&#125;</code>
                </div>
                <div className="text-cyber-muted">
                  <span className="text-cyan-300">owasp-threat-modeling-a00-lab</span> → <span className="text-cyber-text">GET .../api/threat-model?stride=spoofing,tampering&amp;trustBoundary=browser-to-api</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* SECTION: SECURITY FRAMEWORKS & OFFICIAL REFERENCES                   */}
      {/* ==================================================================== */}
      {(activeTab === 'all' || activeTab === 'owasp' || activeTab === 'methodology') && (
        <section aria-labelledby="frameworks-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="frameworks-heading" className="text-base font-bold text-cyber-text flex items-center gap-2 font-mono uppercase tracking-wider">
                <span>Security Framework References & Taxonomies</span>
                <span className="text-xs font-normal text-cyber-muted lowercase">
                  ({filteredFrameworks.length} specifications available)
                </span>
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search framework or CWE..."
                className="w-full h-9 pl-9 pr-8 text-xs bg-cyber-card border border-cyber-border rounded-lg text-cyber-text placeholder:text-cyber-muted/60 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Framework Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFrameworks.map((fw) => (
              <div
                key={fw.code}
                className="rounded-xl border border-cyber-border bg-cyber-card p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-md group"
              >
                <div className="space-y-3">
                  {/* Top Bar with Badge & Version */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold">
                      {fw.code}
                    </span>
                    <span className="text-[11px] font-mono text-cyber-muted">
                      {fw.version}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-base font-bold text-cyber-text group-hover:text-emerald-300 transition-colors">
                      {fw.title}
                    </h3>
                    <p className="text-xs text-cyber-muted leading-relaxed mt-1.5">
                      {fw.summary}
                    </p>
                  </div>

                  {/* Key Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fw.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-elevated text-slate-300 border border-cyber-border/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTF Relevance Callout */}
                  <div className="text-[11.5px] text-cyber-muted bg-cyber-elevated/50 p-2.5 rounded-lg border border-cyber-border/60 flex items-start gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{fw.ctfRelevance}</span>
                  </div>
                </div>

                {/* Footer Action Links with Verified Official URLs */}
                <div className="pt-3 border-t border-cyber-border flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFramework(fw)}
                    className="text-xs font-mono text-cyber-muted hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>View Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-3">
                    {fw.repoUrl && (
                      <a
                        href={fw.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                        title="GitHub / Project Source"
                      >
                        <span>Source / Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a
                      href={fw.specUrl || fw.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20"
                    >
                      <span>Official Specification</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFrameworks.length === 0 && (
            <div className="rounded-xl border border-dashed border-cyber-border p-8 text-center text-cyber-muted text-xs font-mono">
              No security framework or taxonomy matches &quot;{searchQuery}&quot;. Try searching for &quot;OWASP&quot;, &quot;SQL&quot;, &quot;API&quot;, or &quot;CWE&quot;.
            </div>
          )}
        </section>
      )}

      {/* ==================================================================== */}
      {/* DETAILED FRAMEWORK BREAKDOWN MODAL                                   */}
      {/* ==================================================================== */}
      {selectedFramework && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-cyber-card border border-cyber-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-cyber-border flex items-start justify-between gap-3 bg-cyber-elevated/40">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {selectedFramework.code}
                  </span>
                  <span className="text-xs font-mono text-cyber-muted">{selectedFramework.version}</span>
                </div>
                <h3 id="modal-title" className="text-lg font-bold text-cyber-text">
                  {selectedFramework.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="text-cyber-muted hover:text-white p-1 rounded-lg hover:bg-cyber-elevated transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
              <div>
                <h4 className="text-xs font-bold text-cyber-text font-mono uppercase tracking-wider mb-1">
                  Overview & Scope
                </h4>
                <p className="text-cyber-muted leading-relaxed">
                  {selectedFramework.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-cyber-text font-mono uppercase tracking-wider mb-2">
                  Key Categories & Vulnerability Focus
                </h4>
                <div className="space-y-2">
                  {selectedFramework.keyCategories.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-cyber-elevated/70 border border-cyber-border/70 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3"
                    >
                      <span className="font-mono text-emerald-400 font-bold whitespace-nowrap text-[11px]">
                        {item.id}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-cyber-text">{item.name}: </span>
                        <span className="text-cyber-muted">{item.focus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">WebSec CTF Alignment: </strong>
                  {selectedFramework.ctfRelevance}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cyber-border bg-cyber-elevated/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-cyber-muted hover:text-cyber-text hover:bg-cyber-elevated transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={selectedFramework.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-cyber-elevated transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Project Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={selectedFramework.specUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Official Spec</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Author & Attribution Footer */}
      <div className="pt-6 border-t border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-cyber-muted">
        <div>
          WebSec CTF — Designed & Architected by <span className="text-emerald-400 font-bold">SEK Thorn</span>
        </div>
        <div className="text-[11px] text-cyber-muted/70">
          Standards compliant with OWASP, MITRE ATT&CK, NIST SP 800-115, and PTES.
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
