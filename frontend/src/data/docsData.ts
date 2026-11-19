export interface SecurityFramework {
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

export interface FoundationsTargetCheatItem {
  slug: string;
  method: string;
  endpoint: string;
  hint: string;
  command: string;
}

export const SECURITY_FRAMEWORKS: SecurityFramework[] = [
  {
    code: 'OWASP-TOP10',
    title: 'OWASP Top 10:2021 (with 2025 Roadmap)',
    category: 'owasp',
    version: 'v2021 / 2025 Draft',
    summary:
      'The foundational globally recognized awareness standard for critical web application security risks.',
    description:
      'The OWASP Top 10 is the premier consensus-based document detailing the most critical security risks facing modern web applications. Adopted by PCI-DSS, NIST, FTC, and international cybersecurity bodies, it provides developers and penetration testers with essential guidance on application vulnerabilities and mitigation techniques.',
    officialUrl: 'https://owasp.org/www-project-top-ten/',
    specUrl: 'https://owasp.org/Top10/',
    repoUrl: 'https://github.com/OWASP/Top10',
    tags: [
      'Broken Access Control',
      'Cryptographic Failures',
      'Injection',
      'Insecure Design',
      'SSRF',
    ],
    ctfRelevance:
      'WebSec CTF structures its primary challenge matrix around OWASP Top 10 categories, ranging from basic SQL injection to advanced multi-step SSRF attacks.',
    keyCategories: [
      {
        id: 'A01:2021',
        name: 'Broken Access Control',
        focus:
          'Enforcement failures, IDOR, path traversal, bypassing authorization checks.',
      },
      {
        id: 'A02:2021',
        name: 'Cryptographic Failures',
        focus:
          'Sensitive data exposure in transit/at rest, weak ciphers, missing TLS.',
      },
      {
        id: 'A03:2021',
        name: 'Injection',
        focus:
          'SQL, NoSQL, OS command, ORM, and LDAP injection from untrusted input.',
      },
      {
        id: 'A04:2021',
        name: 'Insecure Design',
        focus:
          'Missing threat modeling, insecure architectural patterns, flawed business logic.',
      },
      {
        id: 'A05:2021',
        name: 'Security Misconfiguration',
        focus:
          'Default credentials, verbose error stack traces, unhardened HTTP headers.',
      },
      {
        id: 'A06:2021',
        name: 'Vulnerable & Outdated Components',
        focus:
          'Dependencies with known CVEs, unpatched frameworks, supply chain risks.',
      },
      {
        id: 'A07:2021',
        name: 'Identification & Auth Failures',
        focus:
          'Credential stuffing, brute force, weak session management, missing MFA.',
      },
      {
        id: 'A08:2021',
        name: 'Software & Data Integrity Failures',
        focus:
          'Insecure CI/CD pipelines, untrusted deserialization, integrity bypasses.',
      },
      {
        id: 'A09:2021',
        name: 'Security Logging & Monitoring',
        focus:
          'Failure to log authentication failures, missing alerts for suspicious activity.',
      },
      {
        id: 'A10:2021',
        name: 'Server-Side Request Forgery (SSRF)',
        focus:
          'Fetching remote resources without validating user-supplied destination URLs.',
      },
    ],
  },
  {
    code: 'OWASP-WSTG',
    title: 'OWASP Web Security Testing Guide (WSTG)',
    category: 'owasp',
    version: 'v4.2 / v5.0 Master',
    summary:
      'The premier cybersecurity testing playbook for penetration testers and application security auditors.',
    description:
      'The OWASP Web Security Testing Guide (WSTG) is a comprehensive framework for testing the security of web applications and web services. Created by security professionals and penetration testing experts, it details over 90 specialized test cases spanning information gathering, identity management, authentication, and client-side security.',
    officialUrl: 'https://owasp.org/www-project-web-security-testing-guide/',
    specUrl:
      'https://owasp.org/www-project-web-security-testing-guide/stable/',
    repoUrl: 'https://github.com/OWASP/wstg',
    tags: [
      'Black-box Testing',
      'Grey-box Testing',
      'Methodology',
      'Burp Suite',
      'Vulnerability Assessment',
    ],
    ctfRelevance:
      'Every challenge solution walkthrough in WebSec CTF is mapped directly to standard WSTG test identifiers (e.g. WSTG-INPV-05 for SQL Injection).',
    keyCategories: [
      {
        id: 'WSTG-INFO',
        name: 'Information Gathering',
        focus:
          'OSINT, banner grabbing, directory enumeration, web server fingerprinting.',
      },
      {
        id: 'WSTG-CONF',
        name: 'Configuration Management',
        focus:
          'Infrastructure review, HTTP methods, HSTS, CORS configuration.',
      },
      {
        id: 'WSTG-IDNT',
        name: 'Identity Management',
        focus:
          'Role definition, user registration, account enumeration, username harvesting.',
      },
      {
        id: 'WSTG-ATHN',
        name: 'Authentication Testing',
        focus:
          'Password reset flaws, brute force resistance, remember-me token security.',
      },
      {
        id: 'WSTG-ATHZ',
        name: 'Authorization Testing',
        focus:
          'Horizontal/vertical privilege escalation, BOLA/IDOR, directory traversal.',
      },
      {
        id: 'WSTG-SESS',
        name: 'Session Management',
        focus:
          'Session fixation, cookie attributes (HttpOnly, Secure, SameSite), CSRF.',
      },
      {
        id: 'WSTG-INPV',
        name: 'Input Validation',
        focus:
          'XSS, SQLi, command injection, path traversal, XML external entities (XXE).',
      },
      {
        id: 'WSTG-CRYP',
        name: 'Cryptography Testing',
        focus:
          'Weak SSL/TLS ciphers, padding oracles, predictable random number generators.',
      },
      {
        id: 'WSTG-BIZ',
        name: 'Business Logic Testing',
        focus:
          'Price tampering, race conditions, skipping transactional workflow steps.',
      },
      {
        id: 'WSTG-CLNT',
        name: 'Client-Side Testing',
        focus:
          'DOM-based XSS, WebSocket vulnerabilities, postMessage security, clickjacking.',
      },
    ],
  },
  {
    code: 'OWASP-ASVS',
    title: 'OWASP Application Security Verification Standard (ASVS)',
    category: 'owasp',
    version: 'v4.0.3 / v5.0',
    summary:
      'Rigorous technical requirements and controls for designing, developing, and auditing secure applications.',
    description:
      'The OWASP Application Security Verification Standard (ASVS) provides developers and architects with a basis for designing and building secure web applications. It defines three progressive verification levels (L1 Automated, L2 Standard Applications, L3 Critical Infrastructure), serving as a benchmark for technical security verification.',
    officialUrl:
      'https://owasp.org/www-project-application-security-verification-standard/',
    specUrl: 'https://github.com/OWASP/ASVS/releases',
    repoUrl: 'https://github.com/OWASP/ASVS',
    tags: [
      'Verification Levels',
      'Security Architecture',
      'Compliance',
      'Defensive Controls',
    ],
    ctfRelevance:
      'Used in our defense and remediation challenges, teaching players how to verify and implement secure controls that meet ASVS standards.',
    keyCategories: [
      {
        id: 'Level 1',
        name: 'Opportunistic Baseline',
        focus:
          'Verification that can be performed using automated penetration testing tools.',
      },
      {
        id: 'Level 2',
        name: 'Standard Commercial Apps',
        focus:
          'Required for applications handling sensitive B2B data, PII, and financial transactions.',
      },
      {
        id: 'Level 3',
        name: 'High Assurance & Critical',
        focus:
          'Required for defense, healthcare, and critical national infrastructure systems.',
      },
      {
        id: 'Chapter V2',
        name: 'Authentication Verification',
        focus:
          'NIST 800-63b alignment, credential hygiene, password managers compatibility.',
      },
      {
        id: 'Chapter V3',
        name: 'Session Management',
        focus:
          'Secure cookie attributes, token revocation, anti-session hijacking controls.',
      },
      {
        id: 'Chapter V5',
        name: 'Validation & Encoding',
        focus:
          'Context-aware output encoding, strict parameter allowlisting, safe parsers.',
      },
    ],
  },
  {
    code: 'OWASP-API',
    title: 'OWASP API Security Top 10',
    category: 'owasp',
    version: '2023 Edition',
    summary:
      'Top 10 vulnerability classifications targeting modern REST, GraphQL, and microservice APIs.',
    description:
      'APIs power modern web and mobile applications, but often introduce unique attack surfaces that traditional web security models miss. The OWASP API Security Top 10 focuses on API-specific vulnerabilities such as Broken Object Level Authorization (BOLA), mass assignment, and lack of resource consumption rate limits.',
    officialUrl: 'https://owasp.org/www-project-api-security/',
    specUrl:
      'https://owasp.org/API-Security/editions/2023/en/0x00-header/',
    repoUrl: 'https://github.com/OWASP/API-Security',
    tags: [
      'BOLA',
      'IDOR',
      'JWT Exploitation',
      'GraphQL',
      'REST API Security',
      'Mass Assignment',
    ],
    ctfRelevance:
      'WebSec CTF includes dedicated API training labs featuring vulnerable JWT validation, GraphQL introspection, and microservice token forgery.',
    keyCategories: [
      {
        id: 'API1:2023',
        name: 'Broken Object Level Authorization (BOLA)',
        focus:
          'IDOR where users manipulate object IDs in API endpoints to access other tenants.',
      },
      {
        id: 'API2:2023',
        name: 'Broken Authentication',
        focus:
          'JWT signature bypass (alg:none), predictable tokens, lack of rate limiting on login.',
      },
      {
        id: 'API3:2023',
        name: 'Broken Object Property Level Authorization',
        focus:
          'Mass assignment leading to privilege escalation; excessive data exposure in JSON responses.',
      },
      {
        id: 'API4:2023',
        name: 'Unrestricted Resource Consumption',
        focus:
          'Lack of pagination limits, regex DoS (ReDoS), memory exhaustion via large payloads.',
      },
      {
        id: 'API5:2023',
        name: 'Broken Function Level Authorization (BFLA)',
        focus:
          'Non-admin users accessing /api/v1/admin/users endpoints due to missing RBAC.',
      },
      {
        id: 'API6:2023',
        name: 'Unrestricted Access to Business Flows',
        focus:
          'Botting, automated coupon brute-forcing, inventory hoarding without CAPTCHA.',
      },
      {
        id: 'API7:2023',
        name: 'Server-Side Request Forgery (SSRF)',
        focus:
          'Exploiting webhook registration or URL validation to pivot into internal cloud APIs.',
      },
      {
        id: 'API8:2023',
        name: 'Security Misconfiguration',
        focus:
          'Unprotected Swagger/OpenAPI docs, unhandled exceptions returning stack traces.',
      },
      {
        id: 'API9:2023',
        name: 'Improper Inventory Management',
        focus:
          'Deprecated /v1 endpoints left running with unpatched security flaws (Shadow APIs).',
      },
      {
        id: 'API10:2023',
        name: 'Unsafe Consumption of APIs',
        focus:
          'Blindly trusting third-party API responses without input sanitization.',
      },
    ],
  },
  {
    code: 'MITRE-CWE',
    title: 'CWE — Common Weakness Enumeration',
    category: 'taxonomy',
    version: 'v4.14 / Top 25',
    summary:
      'Community-developed formal dictionary of software security weaknesses, flaws, and vulnerabilities.',
    description:
      'Maintained by the MITRE Corporation, Common Weakness Enumeration (CWE) provides a unified, measurable taxonomy of software flaws. It connects real-world CVE vulnerability advisories to underlying code defects, providing developers with clear mitigation advice.',
    officialUrl: 'https://cwe.mitre.org/',
    specUrl:
      'https://cwe.mitre.org/top25/archive/2023/2023_cwe_top25.html',
    repoUrl: 'https://github.com/CWE-CAPEC/cwe-schema',
    tags: [
      'CWE Top 25',
      'Code Flaws',
      'Vulnerability Taxonomy',
      'Static Analysis',
    ],
    ctfRelevance:
      'Every single challenge in WebSec CTF is tagged with its formal CWE identifier so players learn to correlate vulnerabilities with real CVE alerts.',
    keyCategories: [
      {
        id: 'CWE-79',
        name: 'Improper Neutralization of Input (XSS)',
        focus:
          'Cross-site Scripting via reflected, stored, or DOM-based vectors.',
      },
      {
        id: 'CWE-89',
        name: 'SQL Injection',
        focus:
          'Improper neutralization of special elements used in an SQL Command.',
      },
      {
        id: 'CWE-20',
        name: 'Improper Input Validation',
        focus:
          'Failure to validate that incoming input conforms to expected specifications.',
      },
      {
        id: 'CWE-22',
        name: 'Path Traversal',
        focus:
          'Using ../ sequences to access restricted files outside the intended root directory.',
      },
      {
        id: 'CWE-352',
        name: 'Cross-Site Request Forgery (CSRF)',
        focus:
          'Forcing an authenticated victim browser to execute unwanted actions.',
      },
      {
        id: 'CWE-434',
        name: 'Unrestricted Upload of File with Dangerous Type',
        focus:
          'Uploading executable PHP/JSP scripts via file upload functionality.',
      },
      {
        id: 'CWE-862',
        name: 'Missing Authorization',
        focus:
          'Executing privileged code without verifying that the requester has permissions.',
      },
      {
        id: 'CWE-918',
        name: 'Server-Side Request Forgery (SSRF)',
        focus:
          'Server making unexpected network connections on behalf of an attacker.',
      },
    ],
  },
  {
    code: 'FIRST-CVSS',
    title: 'CVSS — Common Vulnerability Scoring System',
    category: 'taxonomy',
    version: 'v3.1 & v4.0 Specification',
    summary:
      'Open industry standard for assessing the severity and exploitability metrics of software vulnerabilities.',
    description:
      'Managed by FIRST (Forum of Incident Response and Security Teams), the Common Vulnerability Scoring System (CVSS) provides a standard numerical rating (0.0 to 10.0) reflecting vulnerability severity. It combines Base (intrinsic qualities), Temporal (exploit maturity), and Environmental metrics.',
    officialUrl: 'https://www.first.org/cvss/',
    specUrl: 'https://www.first.org/cvss/v3.1/specification-document',
    repoUrl: 'https://www.first.org/cvss/calculator/3.1',
    tags: [
      'CVSS 3.1',
      'CVSS 4.0',
      'Severity Scoring',
      'Exploitability Metrics',
      'FIRST',
    ],
    ctfRelevance:
      'Challenges show CVSS v3.1 vector strings (e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H) to help operators understand real-world risk calculation.',
    keyCategories: [
      {
        id: 'Base Metrics',
        name: 'Exploitability Metrics',
        focus:
          'Attack Vector (AV), Attack Complexity (AC), Privileges Required (PR), User Interaction (UI).',
      },
      {
        id: 'Impact Metrics',
        name: 'Technical Impact',
        focus:
          'Confidentiality (C), Integrity (I), Availability (A), Scope (S).',
      },
      {
        id: 'Severity Ratings',
        name: 'Qualitative Scale',
        focus:
          'None (0.0), Low (0.1 - 3.9), Medium (4.0 - 6.9), High (7.0 - 8.9), Critical (9.0 - 10.0).',
      },
      {
        id: 'CVSS v4.0',
        name: 'Macro-vectors',
        focus:
          'Introduces CVSS-B (Base), CVSS-BT (Threat), CVSS-BE (Environmental), and CVSS-BTE.',
      },
    ],
  },
  {
    code: 'MITRE-ATT&CK',
    title: 'MITRE ATT&CK Framework',
    category: 'methodology',
    version: 'Enterprise Matrix v14',
    summary:
      'Globally accessible knowledge base of adversary tactics and techniques based on real-world observations.',
    description:
      'MITRE ATT&CK is a curated knowledge base detailing adversary behavior across the entire cyber attack lifecycle. For web penetration testing, it describes how initial access via public-facing applications (T1190) transitions to credential harvesting, lateral movement, and command execution.',
    officialUrl: 'https://attack.mitre.org/',
    specUrl: 'https://attack.mitre.org/matrices/enterprise/',
    repoUrl: 'https://attack.mitre.org/techniques/T1190/',
    tags: [
      'Adversary Simulation',
      'Threat Modeling',
      'TTPs',
      'Initial Access',
      'Web Shells',
    ],
    ctfRelevance:
      'Simulates real adversarial attack chains: chaining web vulnerabilities into reverse shells and privilege escalation.',
    keyCategories: [
      {
        id: 'TA0001',
        name: 'Initial Access (T1190)',
        focus:
          'Exploiting public-facing applications via unpatched zero-days or web vulnerabilities.',
      },
      {
        id: 'TA0002',
        name: 'Execution (T1059)',
        focus:
          'Command and scripting interpreter execution (sh, bash, Python, PowerShell).',
      },
      {
        id: 'TA0003',
        name: 'Persistence (T1505)',
        focus:
          'Placing server web shells in public web directories to maintain persistent access.',
      },
      {
        id: 'TA0004',
        name: 'Privilege Escalation (T1068)',
        focus:
          'Exploiting local sudo privileges, SUID binaries, or vulnerable kernel modules.',
      },
      {
        id: 'TA0006',
        name: 'Credential Access (T1552)',
        focus:
          'Harvesting environment variables, .env files, database credentials, and cloud metadata.',
      },
    ],
  },
  {
    code: 'PTES-STANDARD',
    title: 'PTES — Penetration Testing Execution Standard',
    category: 'methodology',
    version: 'Release 1.0',
    summary:
      'Standardized operational lifecycle guiding professional penetration testing engagements from scoping to reporting.',
    description:
      'The Penetration Testing Execution Standard (PTES) defines a baseline methodology for technical security testing engagements. Developed by industry leaders, it establishes the 7 distinct phases required to conduct thorough, repeatable, and ethical penetration tests.',
    officialUrl: 'http://www.pentest-standard.org/',
    specUrl:
      'http://www.pentest-standard.org/index.php/PTES_Technical_Guidelines',
    tags: [
      'Methodology',
      'Engagement Lifecycle',
      'Scoping',
      'Rules of Engagement',
      'Reporting',
    ],
    ctfRelevance:
      'Teaches players to approach CTF challenges systematically using professional reconnaissance, threat modeling, and documented proof-of-concept steps.',
    keyCategories: [
      {
        id: 'Phase 1',
        name: 'Pre-engagement Interactions',
        focus:
          'Scoping, rules of engagement, legal authority, emergency escalation procedures.',
      },
      {
        id: 'Phase 2',
        name: 'Intelligence Gathering',
        focus:
          'OSINT, domain reconnaissance, banner grabbing, technology stack detection.',
      },
      {
        id: 'Phase 3',
        name: 'Threat Modeling',
        focus:
          'Identifying crown-jewel assets, threat actor motivation, attack surface mapping.',
      },
      {
        id: 'Phase 4',
        name: 'Vulnerability Analysis',
        focus:
          'Verifying automated scanner output, manual exploit payload development.',
      },
      {
        id: 'Phase 5',
        name: 'Exploitation',
        focus:
          'Executing controlled attacks without disrupting client availability or data integrity.',
      },
      {
        id: 'Phase 6',
        name: 'Post Exploitation',
        focus:
          'Determining the value and impact of compromised machines, identifying sensitive data.',
      },
      {
        id: 'Phase 7',
        name: 'Reporting',
        focus:
          'Documenting findings with executive summaries, CVSS scores, and reproducible remediation steps.',
      },
    ],
  },
  {
    code: 'PORTSWIGGER',
    title: 'PortSwigger Web Security Academy & Research',
    category: 'methodology',
    version: 'Active 2026 Curriculum',
    summary:
      'Cutting-edge web security research, practical exploit walkthroughs, and modern vulnerability advisories.',
    description:
      'Created by PortSwigger (the developers of Burp Suite), the Web Security Academy provides premier hands-on web penetration testing training. It documents cutting-edge attack techniques such as HTTP Request Smuggling, WebSockets vulnerabilities, Prototype Pollution, and OAuth 2.0 implementation flaws.',
    officialUrl: 'https://portswigger.net/web-security',
    specUrl: 'https://portswigger.net/research',
    tags: [
      'Burp Suite',
      'HTTP Request Smuggling',
      'Prototype Pollution',
      'OAuth 2.0',
      'Advanced Web Exploitation',
    ],
    ctfRelevance:
      'Our Medium and Hard challenges draw directly from advanced PortSwigger research papers, including HTTP header manipulation and prototype pollution.',
    keyCategories: [
      {
        id: 'Advanced Web',
        name: 'HTTP Request Smuggling',
        focus:
          'Exploiting discrepant parsing between reverse proxies and backends (CL.TE, TE.CL).',
      },
      {
        id: 'Client/Server',
        name: 'Server-Side Template Injection',
        focus:
          'Gaining remote code execution via Jinja2, FreeMarker, and Twig template engines.',
      },
      {
        id: 'Authentication',
        name: 'OAuth 2.0 & OpenID Connect',
        focus:
          'Flawed token exchange, redirect_uri hijacking, CSRF in state parameter.',
      },
      {
        id: 'JavaScript Flaws',
        name: 'Prototype Pollution',
        focus:
          'Modifying Object.prototype in Node.js backends and client-side applications.',
      },
    ],
  },
  {
    code: 'NIST-SP800-115',
    title: 'NIST SP 800-115 — InfoSec Testing & Assessment Guide',
    category: 'methodology',
    version: 'Final Publication',
    summary:
      'Federal technical guide for conducting information security testing, vulnerability scanning, and pen-testing.',
    description:
      'NIST Special Publication 800-115 provides recommendations for improving an organization’s security posture through technical testing and examination. It covers target identification, port and vulnerability scanning, wireless security, password cracking, and structured penetration testing.',
    officialUrl:
      'https://csrc.nist.gov/publications/detail/sp/800-115/final',
    specUrl:
      'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-115.pdf',
    tags: [
      'NIST',
      'Compliance',
      'Security Assessment',
      'Vulnerability Scanning',
      'Federal Standards',
    ],
    ctfRelevance:
      'Provides the methodological rigor behind WebSec CTF reporting standards and objective technical evidence collection.',
    keyCategories: [
      {
        id: 'Section 4',
        name: 'Target Identification',
        focus:
          'Network port scanning, service identification, network device enumeration.',
      },
      {
        id: 'Section 5',
        name: 'Vulnerability Analysis',
        focus:
          'Automated vulnerability scanning, application security testing, configuration audit.',
      },
      {
        id: 'Section 6',
        name: 'Penetration Testing',
        focus:
          'Phase-based testing (Planning, Discovery, Attack, Reporting), risk mitigation.',
      },
      {
        id: 'Section 7',
        name: 'Post-Testing Activities',
        focus:
          'Removing backdoors/testing artifacts, restoring original configuration states.',
      },
    ],
  },
];

export const FOUNDATIONS_CHEAT_SHEET: FoundationsTargetCheatItem[] = [
  {
    slug: 'http2-header-semantics-lab',
    method: 'GET',
    endpoint: '/api/v1/health',
    hint: 'Inspect X-Foundations-Trace response header',
    command: 'curl -i http://localhost:3000/api/v1/targets/http2-header-semantics-lab/api/v1/health',
  },
  {
    slug: 'http-method-verb-safety-lab',
    method: 'OPTIONS / PUT',
    endpoint: '/status',
    hint: 'Enumerate Allow header via OPTIONS, then send PUT',
    command: 'curl -i -X PUT http://localhost:3000/api/v1/targets/http-method-verb-safety-lab/status',
  },
  {
    slug: 'owasp-top10-taxonomy-lab',
    method: 'GET',
    endpoint: '/api/triage',
    hint: 'Pass owasp=A01 and attackVector=AV:N query params',
    command: 'curl -s "http://localhost:3000/api/v1/targets/owasp-top10-taxonomy-lab/api/triage?owasp=A01&attackVector=AV:N"',
  },
  {
    slug: 'tls-https-transport-basics-lab',
    method: 'GET',
    endpoint: '/tls-check',
    hint: 'Verify strict HSTS transport policy enforcement',
    command: 'curl -i "http://localhost:3000/api/v1/targets/tls-https-transport-basics-lab/tls-check?enforce=hsts"',
  },
  {
    slug: 'same-origin-policy-boundaries-lab',
    method: 'GET',
    endpoint: '/api/origin-check',
    hint: 'Validate same-origin scheme + host + port tuple',
    command: 'curl -s "http://localhost:3000/api/v1/targets/same-origin-policy-boundaries-lab/api/origin-check?url=https://portal.websec.local/admin"',
  },
  {
    slug: 'cors-preflight-trust-flaws-lab',
    method: 'GET',
    endpoint: '/api/account',
    hint: 'Test reflected Origin + Access-Control-Allow-Credentials',
    command: 'curl -i -H "Origin: https://attacker.example" http://localhost:3000/api/v1/targets/cors-preflight-trust-flaws-lab/api/account',
  },
  {
    slug: 'rfc6265-cookie-flags-lab',
    method: 'GET',
    endpoint: '/login',
    hint: 'Inspect hardened Set-Cookie HttpOnly/Secure/SameSite flags',
    command: 'curl -i "http://localhost:3000/api/v1/targets/rfc6265-cookie-flags-lab/login?mode=secure"',
  },
  {
    slug: 'browser-storage-session-basics-lab',
    method: 'GET',
    endpoint: '/api/storage-audit',
    hint: 'Verify HttpOnly session cookie storage over localStorage',
    command: 'curl -s "http://localhost:3000/api/v1/targets/browser-storage-session-basics-lab/api/storage-audit?recommended=httponly_cookie"',
  },
  {
    slug: 'web-proxy-interception-lab',
    method: 'POST',
    endpoint: '/api/checkout',
    hint: 'Tamper JSON price and role payload server-side',
    command: 'curl -s -X POST -H "Content-Type: application/json" -d "{\\"price\\":1,\\"role\\":\\"admin\\"}" http://localhost:3000/api/v1/targets/web-proxy-interception-lab/api/checkout',
  },
  {
    slug: 'owasp-threat-modeling-a00-lab',
    method: 'GET',
    endpoint: '/api/threat-model',
    hint: 'Map STRIDE threats across browser-to-api trust boundary',
    command: 'curl -s "http://localhost:3000/api/v1/targets/owasp-threat-modeling-a00-lab/api/threat-model?stride=spoofing,tampering&trustBoundary=browser-to-api"',
  },
];
