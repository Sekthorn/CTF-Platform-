import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';

export interface LessonReference {
  title: string;
  url: string;
  type?: string;
}

export interface LessonSeedData {
  challengeSlug: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: ChallengeDifficulty;
  owaspReference?: string;
  cweReference?: string;
  cvssScore?: number;
  status?: ChallengeStatus;

  overview: string;
  rootCause: string;
  mechanics: string;
  attackScenario: string;
  securityImpact: string;
  prevention: string;
  vulnerableCode: string;
  secureCode: string;
  codeLanguage: string;
  realWorldExample: string;
  references: LessonReference[];
  keyTakeaways: string;
}

export const AUTH_LESSONS: LessonSeedData[] = [
  // -------------------------------------------------------------------------
  // 0. Client-Side Inspection & Reconnaissance
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'client-side-inspection',
    title: 'Client-Side Inspection, Information Disclosure & Reconnaissance',
    slug: 'client-side-inspection-security-guide',
    description: 'Learn how sensitive data exposure in client-side HTML, JavaScript comments, debug variables, and cookies allows attackers to conduct passive reconnaissance without triggering server alarms.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A05:2021 – Security Misconfiguration',
    cweReference: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor',
    cvssScore: 5.3,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Client-side information disclosure occurs when developers inadvertently include sensitive data—such as administrative credentials, API secrets, staging endpoints, internal logic remarks, or debug variables—within HTML source code, client-side JavaScript, or unencrypted browser storage (cookies and local storage). Because browsers execute code locally, any data transmitted to the user agent can be inspected using browser Developer Tools (F12), DOM tree explorers, or interception proxies without sending additional requests to the server.',
    rootCause: 'The vulnerability arises from relying on client-side obfuscation or hidden DOM elements for security (security through obscurity), leaving development debug flags active in production bundles, failing to strip comments during build minification, and storing sensitive session or application data in client-accessible browser storage without HttpOnly or Secure flags.',
    mechanics: '1. Passive Discovery: An analyst or attacker visits the web application and opens Developer Tools (Ctrl+Shift+I or F12).\n2. HTML Comment Audit: The attacker reviews DOM comments (<!-- TODO: remove staging credentials -->) or inspects elements for hidden inputs (type="hidden").\n3. Console & Global Scope Inspection: The attacker checks the JavaScript console for debug logs, error stack traces, or window-scoped state objects (window.__ENV__ or window.DEBUG_FLAG).\n4. Application Storage Analysis: The attacker examines document.cookie, localStorage, and sessionStorage for exposed authentication tokens or unencrypted flags.',
    attackScenario: 'GET /employee-directory/staging HTTP/1.1\nHost: ctf.websec.internal\nUser-Agent: Mozilla/5.0\n\nHTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nSet-Cookie: staging_session=eyJ1c2VyIjoiZ3Vlc3QifQ==; Path=/\n\n<!DOCTYPE html>\n<html>\n<head>\n  <!-- [DEBUG]: Internal staging portal v2.1 -->\n  <!-- [SEC_NOTE]: Developer access key active for QA: WEBSEC{client_side_recon_devtools_mastered} -->\n</head>\n<body>\n  <script>\n    console.info("[STAGING DEBUG]: Reconnaissance portal initialized.");\n  </script>\n</body>\n</html>',
    securityImpact: 'Exposure of architectural internal endpoints, leakage of hardcoded developer credentials or API keys, compromise of staging tokens, and rapid privilege escalation through unauthorized insight into backend data structures.',
    prevention: '1. Never transmit sensitive operational secrets, administrative tokens, or private business logic to the client.\n2. Configure modern build pipelines (Webpack, Vite, esbuild) with automated minification and comment stripping enabled.\n3. Disable all verbose console logging (console.log, console.debug) in production builds.\n4. Protect sensitive browser cookies with the HttpOnly, Secure, and SameSite=Strict attributes.\n5. Enforce automated SAST scanning to detect hardcoded secrets and credentials in source repositories prior to deployment.',
    vulnerableCode: `// Vulnerable Component: Staging secrets and debug remarks exposed to DOM & Console
export const StagingBanner: React.FC = () => {
  const debugSecret = "WEBSEC{client_side_recon_devtools_mastered}";
  
  useEffect(() => {
    // Insecure: Logging secrets to client console
    console.log("Portal initialized with secret:", debugSecret);
  }, []);

  return (
    <div>
      {/* Insecure: Developer comment left in rendered DOM */}
      {/* [DEBUG]: Staging QA Key: WEBSEC{client_side_recon_devtools_mastered} */}
      <h1>Employee Staging Directory</h1>
      <input type="hidden" name="stagingKey" value={debugSecret} />
    </div>
  );
};`,
    secureCode: `// Secure Implementation: Zero secrets on client; strictly server-side verified
import { useEffect, useState } from 'react';

export const ProductionDirectory: React.FC = () => {
  // Secrets are strictly held in server-side environment variables
  // Client only renders sanitized public user interface elements
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    // Verify authorization via secure HttpOnly session cookie without exposing keys
    fetch('/api/v1/directory/status', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => setIsAuthorized(data.authorized))
      .catch(() => setIsAuthorized(false));
  }, []);

  return (
    <div>
      <h1>Employee Directory</h1>
      {isAuthorized && <p>Authenticated Personnel Portal</p>}
    </div>
  );
};`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2021, an investigation into a government department website revealed that developer comments embedded in the HTML source code included database connection strings and administrative credentials, allowing unauthorized researchers to identify back-office systems without executing any active network attacks.',
    references: [
      {
        title: 'OWASP WSTG – Review Webpage Content for Information Leakage (WSTG-INFO-05)',
        url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/01-Information_Gathering/05-Review_Webpage_Content_for_Information_Leakage',
      },
      {
        title: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor',
        url: 'https://cwe.mitre.org/data/definitions/200.html',
      },
      {
        title: 'OWASP Top 10:2021 – A05 Security Misconfiguration',
        url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
      },
    ],
    keyTakeaways: '1. Anything sent to the browser can and will be inspected by end users.\n2. HTML comments, hidden inputs, and client JavaScript are not secure storage mechanisms.\n3. Build pipelines must strip comments and debug logs automatically.\n4. Always secure sensitive session identifiers with HttpOnly and Secure cookie flags.',
  },
  // -------------------------------------------------------------------------
  // 1. Weak Admin Password
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'weak-admin-password',
    title: 'Weak Administrative Credentials & Brute Force Vulnerability',
    slug: 'weak-admin-password-security-guide',
    description: 'Learn how predictable default passwords and missing rate limiting expose administrative portals to credential guessing attacks.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A07:2021 – Identification and Authentication Failures',
    cweReference: 'CWE-521: Weak Password Requirements',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Weak administrative credentials occur when privileged accounts are configured with default, common, or predictable passwords. Administrative accounts hold elevated access to system configurations, user records, and sensitive operational commands. When coupled with the absence of account lockout thresholds, CAPTCHAs, or IP-based rate limiting, attackers can quickly discover valid credentials using dictionary attacks and automated brute-force tools.',
    rootCause: 'The vulnerability exists because developers or system administrators failed to enforce strong password complexity policies during account provisioning, left default factory or deployment credentials active in production, and omitted defensive rate limiting on the authentication endpoint.',
    mechanics: '1. Reconnaissance: An attacker discovers the administrative login endpoint (e.g., /admin/login).\n2. Wordlist Selection: The attacker compiles a targeted list of common administrative defaults (admin, admin2026, password123, root).\n3. Automated Submission: The attacker submits successive POST requests with credential pairs.\n4. Verification: The server responds with HTTP 200 and an authenticated session cookie rather than HTTP 401, confirming successful compromise without triggering any lockout or rate throttling.',
    attackScenario: 'POST /api/v1/auth/login HTTP/1.1\nHost: ctf.websec.internal\nContent-Type: application/json\n\n{\n  "username": "admin",\n  "password": "admin2026"\n}\n\nResponse:\nHTTP/1.1 200 OK\nSet-Cookie: session_id=s%3Aadm987654321; HttpOnly; Path=/\n\n{\n  "success": true,\n  "role": "ADMIN",\n  "message": "Welcome Administrator. Flag: WEBSEC{weak_admin_password_cracked_2026}"\n}',
    securityImpact: 'Complete administrative takeover, full data breach of tenant records, arbitrary configuration modification, and unauthorized access to privileged CTF management features.',
    prevention: '1. Enforce minimum password length (at least 12-16 characters) with entropy and complexity checks.\n2. Ban common passwords using lists such as SecLists or HaveIBeenPwned Pwned Passwords API.\n3. Implement exponential backoff or progressive delays and rate limiting on login routes.\n4. Mandate Multi-Factor Authentication (MFA) on all administrative interfaces.\n5. Force initial password reset upon first administrative deployment.',
    vulnerableCode: `// Vulnerable Express/NestJS Handler: No lockout, permits weak passwords
@Post('login')
async login(@Body() body: LoginDto) {
  const user = await this.userService.findByUsername(body.username);
  if (!user || user.password !== body.password) {
    throw new UnauthorizedException('Invalid credentials');
  }
  return { token: this.authService.createToken(user) };
}`,
    secureCode: `// Remediated Handler: Secure password hashing (Argon2id/bcrypt), rate limiting, and generic error
@Post('login')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 attempts per minute
async login(@Body() body: LoginDto) {
  const user = await this.userService.findByUsername(body.username);
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    // Constant-time check and generic failure message
    throw new UnauthorizedException('Invalid username or password');
  }
  return { token: this.authService.createToken(user) };
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In enterprise deployments, internet-facing devices (routers, cameras, CMS panels) often ship with manufacturer defaults like admin/admin or admin/year. The Mirai botnet compromised hundreds of thousands of IoT devices worldwide purely by scanning for 60 common default credential combinations.',
    references: [
      { title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' },
      { title: 'CWE-521: Weak Password Requirements', url: 'https://cwe.mitre.org/data/definitions/521.html' },
      { title: 'OWASP WSTG-ATHN-07: Testing for Weak Password Policy', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/03-Identity_Management_Testing/07-Testing_for_Weak_Password_Policy' }
    ],
    keyTakeaways: '• Never rely on default or predictable passwords in production environments.\n• Implement multi-layered brute-force defense (rate limiting, progressive delays, CAPTCHA).\n• Enforce Multi-Factor Authentication (MFA) for administrative access.\n• Always compare passwords using secure hashing algorithms (Argon2id or bcrypt) with constant-time comparison.'
  },

  // -------------------------------------------------------------------------
  // 2. Username Enumeration
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'username-enumeration',
    title: 'Username Enumeration via Differential Responses',
    slug: 'username-enumeration-security-guide',
    description: 'Understand how varying error messages and timing discrepancies allow attackers to map valid usernames on a system.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A07:2021 – Identification and Authentication Failures',
    cweReference: 'CWE-204: Observable Response Discrepancy',
    cvssScore: 5.3,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Username enumeration occurs when an authentication, registration, or password reset feature reveals whether a specific username or email address exists in the system database. The revelation often happens through distinct error messages (e.g., "User does not exist" vs. "Password incorrect"), subtle HTTP status code variations, or detectable response latency differences.',
    rootCause: 'The application explicitly validates the account identity before verifying the credential and leaks the validation outcome directly into client-facing error messages to provide user convenience, violating defensive ambiguity.',
    mechanics: '1. Discovery: The tester submits arbitrary usernames (e.g., non_existent_user_999) with random passwords and notes the message: "User does not exist".\n2. Differential Testing: The tester tests candidate usernames from a company employee list (e.g., sec_analyst) and receives: "Incorrect password for user sec_analyst".\n3. Attack Automation: By feeding a dictionary of common usernames into an automated fuzzer, the attacker extracts a comprehensive list of verified target accounts for targeted credential stuffing.',
    attackScenario: 'Request 1 (Invalid User):\nPOST /api/v1/auth/login\n{"username": "ghost_user", "password": "x"}\nResponse: {"error": "Account does not exist"}\n\nRequest 2 (Valid User):\nPOST /api/v1/auth/login\n{"username": "sec_analyst", "password": "x"}\nResponse: {"error": "Invalid password for sec_analyst"}\n\nOutcome: The attacker now knows "sec_analyst" is a valid active account and focuses brute-force efforts exclusively on this username.',
    securityImpact: 'Facilitates targeted password spraying, phishing, and credential stuffing attacks by reducing the attack surface to confirmed existing identities.',
    prevention: '1. Standardize authentication error messages to a single generic statement: "Invalid username or password".\n2. Equalize execution response times by executing dummy password hashing even when the username is not found in the database (preventing side-channel timing attacks).\n3. Standardize registration and password-reset workflows using out-of-band communication (e.g., "If an account exists with this email, a reset link has been dispatched").',
    vulnerableCode: `// Vulnerable: Leaks account existence through granular errors
if (!user) {
  return res.status(404).json({ error: 'User not found in system' });
}
if (!bcrypt.compareSync(password, user.passwordHash)) {
  return res.status(401).json({ error: 'Incorrect password for user ' + user.username });
}`,
    secureCode: `// Remediated: Generic error message and constant-time execution
const DUMMY_HASH = '$2a$12$e8uqgXhWd6P9Pq3fXQ6eE.l1BvZg9W8t6zYq0e2m5v8o0p1q2r3s4';
const user = await db.user.findUnique({ where: { username } });
const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
const isValid = await bcrypt.compare(password, hashToCompare);

if (!user || !isValid) {
  throw new UnauthorizedException('Invalid username or password');
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major SaaS platforms and banking portals frequently suffered from username enumeration on their "Forgot Password" forms, allowing threat actors to bulk-validate scraped databases containing millions of corporate email addresses.',
    references: [
      { title: 'OWASP WSTG-IDNT-04: Testing for Account Enumeration', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration' },
      { title: 'CWE-204: Observable Response Discrepancy', url: 'https://cwe.mitre.org/data/definitions/204.html' }
    ],
    keyTakeaways: '• Never distinguish between missing usernames and wrong passwords in API responses.\n• Return identical HTTP status codes (e.g., 401 Unauthorized) and identical error payloads.\n• Perform dummy password hashing on non-existent accounts to eliminate timing side-channels.'
  },

  // -------------------------------------------------------------------------
  // 3. IDOR Profile View
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'idor-profile-view',
    title: 'Insecure Direct Object Reference (IDOR) in User Profiles',
    slug: 'idor-profile-view-security-guide',
    description: 'Examine how client-supplied record identifiers without server-side tenancy verification result in unauthorized profile data disclosure.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-639: Authorization Bypass Through User-Controlled Key',
    cvssScore: 6.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Insecure Direct Object Reference (IDOR) is an access control vulnerability that arises when an application utilizes user-controlled input (such as database primary keys, sequential integers, or filenames) to access records directly without verifying whether the authenticated user has permission to view or manipulate that specific object.',
    rootCause: 'The server verifies that the incoming request originates from an authenticated session, but fails to check whether the record requested belongs to or is authorized for the authenticated user.',
    mechanics: '1. Identification: The user logs in as account ID 105 and navigates to the profile page, observing an API call to GET /api/users/profile?id=105.\n2. Parameter Tampering: The user modifies the query parameter to id=1.\n3. Flawed Execution: The server query executes `SELECT * FROM users WHERE id = :id` without checking `WHERE id = :id AND user_id = :sessionUserId`.\n4. Privilege Leak: The server serializes and returns the complete administrative user record with recovery codes and sensitive flags.',
    attackScenario: 'GET /api/users/profile?id=1 HTTP/1.1\nHost: ctf.websec.internal\nCookie: session_id=student_session_105\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "id": 1,\n  "username": "admin",\n  "email": "admin@websec.ctf",\n  "role": "ADMIN",\n  "recovery_flag": "WEBSEC{idor_profile_privilege_leak_success}"\n}',
    securityImpact: 'Unauthorized disclosure of Personally Identifiable Information (PII), confidential credentials, private communications, or unauthorized record modifications.',
    prevention: '1. Tie object retrieval directly to the authenticated session context (e.g., `req.user.id`) rather than untrusted request parameters.\n2. When access to other records is legitimately required, implement fine-grained Access Control Lists (ACLs) or Policy-Based Access Control (PBAC).\n3. Utilize non-sequential, cryptographically random identifiers (UUID v4) to prevent trivial sequential enumeration.',
    vulnerableCode: `// Vulnerable: Trusts client-supplied id parameter directly
@Get('profile')
async getProfile(@Query('id') id: string) {
  const profile = await this.prisma.user.findUnique({
    where: { id },
  });
  return profile;
}`,
    secureCode: `// Remediated: Resolves current user directly from authenticated session token
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Req() req: AuthenticatedRequest) {
  // Always derive identity from the verified cryptographic session
  const currentUserId = req.user.id;
  const profile = await this.prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });
  return profile;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2019, First American Financial Corporation leaked over 885 million confidential mortgage records because their document portal allowed anyone with a valid document link to increment the numeric document ID in the URL to view other customers\' deeds, bank numbers, and social security records.',
    references: [
      { title: 'OWASP Top 10 A01:2021 Broken Access Control', url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/' },
      { title: 'CWE-639: Authorization Bypass Through User-Controlled Key', url: 'https://cwe.mitre.org/data/definitions/639.html' },
      { title: 'OWASP WSTG-ATHZ-04: Testing for Insecure Direct Object References', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References' }
    ],
    keyTakeaways: '• Never rely on client-provided object IDs for sensitive data lookup.\n• Always bind database queries to the current user\'s session token.\n• Use server-side authorization checks before returning any object.'
  },

  // -------------------------------------------------------------------------
  // 4. Password Reset Token Flaw
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'password-reset-token-flaw',
    title: 'Predictable Password Reset Token Generation',
    slug: 'predictable-password-reset-token-guide',
    description: 'Learn how low-entropy pseudo-random token generation allows attackers to forge valid password reset links and take over accounts.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A07:2021 – Identification and Authentication Failures',
    cweReference: 'CWE-330: Use of Insufficiently Random Values',
    cvssScore: 8.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Password reset workflows depend on generating unique, temporary, unguessable cryptographic tokens dispatched to the account owner\'s verified email address. When tokens are derived from deterministic algorithms—such as hashing a username combined with the current timestamp or using non-cryptographic PRNGs—attackers can compute valid reset tokens offline and take over arbitrary accounts.',
    rootCause: 'The token generation function relied on deterministic input data (e.g., md5(username + Math.floor(Date.now() / 1000))) or non-cryptographic pseudo-random number generators (such as Math.random()) lacking cryptographic entropy.',
    mechanics: '1. Initiation: Attacker triggers a password reset for target user "admin@websec.ctf".\n2. Timestamp Deduction: Attacker inspects the HTTP response Date header (e.g., Tue, 10 Nov 2026 14:22:10 GMT) to establish the approximate epoch second (1794320530).\n3. Offline Calculation: Attacker computes MD5 hashes for "admin" concatenated with timestamps across a +/- 5 second window.\n4. Reset Submission: Attacker submits the password reset request using the calculated token to overwrite the target administrator password.',
    attackScenario: '1. Request password reset for admin:\nPOST /api/auth/forgot-password\n{"email": "admin@websec.ctf"}\nHTTP/1.1 200 OK\nDate: Tue, 10 Nov 2026 14:22:10 GMT\n\n2. Compute token offline:\nmd5("admin1794320530") -> "a4f89b6c12d3..."\n\n3. Execute reset:\nPOST /api/auth/reset-password\n{\n  "token": "a4f89b6c12d3...",\n  "newPassword": "HackedPassword2026!"\n}\nResponse: {"success": true, "flag": "WEBSEC{password_reset_token_entropy_flawed}"}',
    securityImpact: 'Unrestricted account takeover across all platform users including administrators, leading to total unauthorized identity compromise.',
    prevention: '1. Generate reset tokens using cryptographically secure pseudorandom number generators (CSPRNG), such as `crypto.randomBytes(32).toString(\'hex\')`.\n2. Store only salted cryptographic hashes of the reset tokens in the database, comparing incoming tokens using constant-time comparison.\n3. Enforce short token lifespans (10–15 minutes) and invalidate tokens immediately upon single use.',
    vulnerableCode: `// Vulnerable: Predictable MD5 hash of username and current timestamp
function generateResetToken(user: User): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return crypto.createHash('md5').update(user.username + timestamp).digest('hex');
}`,
    secureCode: `// Remediated: High-entropy CSPRNG with salted hash persistence
import * as crypto from 'crypto';

async function createSecureResetToken(userId: string) {
  // 256 bits of cryptographically secure random entropy
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await db.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken; // Dispatched out-of-band via email
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'A famous flaw in early Web 2.0 web applications involved generating activation and reset tokens using PHP\'s `microtime()` or `uniqid()`, allowing attackers who knew when an account was created to enumerate and take over user accounts within minutes.',
    references: [
      { title: 'OWASP Forgot Password Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html' },
      { title: 'CWE-330: Use of Insufficiently Random Values', url: 'https://cwe.mitre.org/data/definitions/330.html' }
    ],
    keyTakeaways: '• Always use cryptographically secure random number generators (CSPRNG) for security tokens.\n• Never construct tokens from predictable data such as timestamps, usernames, or sequential counters.\n• Store reset tokens in hashed form and expire them after single use or short timeouts.'
  },

  // -------------------------------------------------------------------------
  // 5. Missing Role Authorization Check
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'missing-role-authorization-check',
    title: 'Missing Server-Side Role-Based Authorization Check',
    slug: 'missing-role-authorization-guide',
    description: 'Understand the security risks of relying on UI-only access control when backend administrative endpoints fail to enforce role validation.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-862: Missing Authorization',
    cvssScore: 7.7,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Missing Role-Based Access Control occurs when a web application hides administrative user interface elements (buttons, navigation menus) from ordinary users on the frontend, but the underlying backend API endpoints fail to verify that incoming requests possess administrative privileges. Any authenticated user can access privileged functionality by calling the API directly.',
    rootCause: 'Developers conflated authentication (verifying who the user is) with authorization (verifying what the user is permitted to do), assuming that hiding the frontend UI components was sufficient protection.',
    mechanics: '1. Client Inspection: An attacker inspects client-side JavaScript bundles (main.js or routes.tsx) and identifies restricted routes like `/admin/system/metrics`.\n2. Direct Invocations: The user logs in with a normal "USER" account.\n3. Request Dispatch: The user sends a GET request to `/admin/system/metrics` supplying their standard session cookie.\n4. Endpoint Execution: The server middleware verifies the user is authenticated, but fails to check `if (user.role !== "ADMIN") throw ForbiddenException()`, executing the request and returning privileged system diagnostics.',
    attackScenario: 'GET /admin/system/metrics HTTP/1.1\nHost: ctf.websec.internal\nCookie: session_id=valid_regular_user_session\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "serverStatus": "OPTIMAL",\n  "activeUsers": 452,\n  "flag": "WEBSEC{missing_role_authorization_check_bypass}"\n}',
    securityImpact: 'Privilege escalation allowing unprivileged users to execute administrative operations, delete data, extract confidential system diagnostics, and alter platform settings.',
    prevention: '1. Enforce strict server-side Role-Based Access Control (RBAC) guards on all sensitive routes.\n2. Adopt a "Deny by Default" authorization architecture.\n3. Never rely on frontend obfuscation, hidden tabs, or client-side routing guards as security boundaries.',
    vulnerableCode: `// Vulnerable: Checks authentication but omits role check
@Get('admin/system/metrics')
@UseGuards(AuthGuard) // Only verifies session exists!
async getMetrics() {
  return this.systemService.getDiagnosticData();
}`,
    secureCode: `// Remediated: Enforces both Authentication and Role-Based Authorization Guards
@Get('admin/system/metrics')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN') // Strict role verification on server
async getMetrics(@Req() req: Request) {
  return this.systemService.getDiagnosticData();
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In many enterprise software deployments, users discover that while the "Admin Settings" button is hidden in the React navigation bar, navigating directly to `/api/v1/tenant/settings` or invoking it via cURL allows standard employees to alter billing plans and read audit logs.',
    references: [
      { title: 'OWASP Authorization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html' },
      { title: 'CWE-862: Missing Authorization', url: 'https://cwe.mitre.org/data/definitions/862.html' }
    ],
    keyTakeaways: '• Client-side UI checks provide user experience, not security.\n• Every privileged backend API endpoint must independently verify authorization.\n• Implement centralized role guards and policies across all controllers.'
  },

  // -------------------------------------------------------------------------
  // 6. BOLA Order Resource Hijack
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'bola-order-resource-hijack',
    title: 'Broken Object Level Authorization (BOLA) in REST APIs',
    slug: 'bola-order-resource-hijack-guide',
    description: 'Learn how modern microservices and REST APIs expose sensitive multi-tenant resources when record queries lack user ownership criteria.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP API Security Top 10 API1:2023 – Broken Object Level Authorization',
    cweReference: 'CWE-639: Authorization Bypass Through User-Controlled Key',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Broken Object Level Authorization (BOLA), also known as IDOR in API terminology, is the number one vulnerability in the OWASP API Security Top 10. It occurs when an API endpoint handles object identifiers (e.g., order IDs, invoices, documents) in request URIs or request payloads without validating that the authenticated caller owns or has rights to access that specific resource.',
    rootCause: 'Backend services frequently query objects using only the primary identifier provided in the URL parameter (e.g., `WHERE order_id = :orderId`) instead of scoping the query to the tenant or user context (e.g., `WHERE order_id = :orderId AND user_id = :currentUserId`).',
    mechanics: '1. Interception: A customer places an order and notes the API request `GET /api/orders/ORD-10023`.\n2. Hypothesis: The customer wonders whether other order identifiers follow predictable patterns or are accessible across accounts.\n3. Request Tampering: The customer issues `GET /api/orders/ORD-99021` using their own authorization token.\n4. Flawed Execution: The API gateway decodes the JWT and confirms the user is authenticated, but the downstream microservice executes `SELECT * FROM orders WHERE code = "ORD-99021"` and returns another user\'s private purchase order.',
    attackScenario: 'GET /api/orders/ORD-99021 HTTP/1.1\nHost: ctf.websec.internal\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "orderId": "ORD-99021",\n  "customerEmail": "executive@corporation.com",\n  "items": [\n    {\n      "sku": "FLAG-DELIVERABLE",\n      "title": "Digital Asset Flag",\n      "data": "WEBSEC{bola_order_resource_id_hijack}"\n    }\n  ]\n}',
    securityImpact: 'Cross-tenant data exposure, unauthorized modification or cancellation of customer orders, regulatory penalties (GDPR/HIPAA violations), and financial fraud.',
    prevention: '1. Always enforce tenant and ownership validation at the data access layer: filter queries by both resource ID and `user.id`.\n2. In role-based multi-user environments, verify explicit permissions before executing the database transaction.\n3. Use automated security unit tests to verify cross-user isolation for every API endpoint.',
    vulnerableCode: `// Vulnerable: Microservice fetches order strictly by orderId without tenancy check
@Get('orders/:orderId')
async getOrder(@Param('orderId') orderId: string) {
  const order = await this.prisma.order.findUnique({
    where: { orderNumber: orderId },
  });
  if (!order) throw new NotFoundException('Order not found');
  return order;
}`,
    secureCode: `// Remediated: Query explicitly scopes order lookup to current authenticated user
@Get('orders/:orderId')
@UseGuards(JwtAuthGuard)
async getOrder(
  @Param('orderId') orderId: string,
  @Req() req: AuthenticatedRequest,
) {
  const order = await this.prisma.order.findFirst({
    where: {
      orderNumber: orderId,
      userId: req.user.id, // Strictly scoped to authenticated owner
    },
  });
  if (!order) {
    // Return 404 to avoid leaking existence of other tenants' orders
    throw new NotFoundException('Order not found');
  }
  return order;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2021, an API vulnerability in a popular electric vehicle mobile app allowed any registered user to send vehicle unlock and climate control commands to other drivers\' cars simply by substituting the target vehicle\'s VIN in API request payloads.',
    references: [
      { title: 'OWASP API Security Top 10 2023 - API1 Broken Object Level Authorization', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' },
      { title: 'CWE-639: Authorization Bypass Through User-Controlled Key', url: 'https://cwe.mitre.org/data/definitions/639.html' }
    ],
    keyTakeaways: '• Always scope database queries to the authenticated tenant/user ID.\n• Never trust client-supplied entity IDs without verifying ownership.\n• Return 404 instead of 403 on unauthorized object access to prevent ID enumeration.'
  },

  // -------------------------------------------------------------------------
  // 7. Session Fixation
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'session-fixation-vulnerability',
    title: 'Session Fixation Vulnerability & Token Renewal Failures',
    slug: 'session-fixation-vulnerability-guide',
    description: 'Explore how failure to issue new session identifiers upon authentication allows adversaries to hijack active sessions.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A07:2021 – Identification and Authentication Failures',
    cweReference: 'CWE-384: Session Fixation',
    cvssScore: 7.4,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Session Fixation is an attack where an adversary establishes a legitimate session identifier on a target web application, tricks a victim into using this pre-established identifier (via a crafted link, cookie injection, or shared workstation), and waits for the victim to log in. If the application retains the pre-login session ID rather than issuing a new one upon authentication, the attacker can use the known ID to access the victim\'s authenticated session.',
    rootCause: 'The authentication controller mutates the internal state of an existing session (marking it as authenticated) instead of destroying the pre-authentication session and regenerating a completely fresh session identifier.',
    mechanics: '1. Pre-seeding: Attacker sends an HTTP request to the target site and obtains a valid anonymous session token (e.g., `session_id=FIXED_TOKEN_12345`).\n2. Victim Engagement: Attacker delivers a phishing link or injects the cookie into the victim\'s browser.\n3. Victim Authentication: Victim logs in successfully using their valid credentials.\n4. Session Hijack: Because the server failed to regenerate `session_id`, the attacker reuses `FIXED_TOKEN_12345` and gains instant authenticated access to the victim\'s dashboard.',
    attackScenario: 'Step 1: Attacker acquires session ID:\nCookie: session_id=FIXED_TOKEN_12345\n\nStep 2: Victim logs in with that session ID active in browser.\n\nStep 3: Attacker requests protected endpoint with the same token:\nGET /api/v1/user/dashboard HTTP/1.1\nCookie: session_id=FIXED_TOKEN_12345\n\nResponse:\nHTTP/1.1 200 OK\n{"user": "victim", "status": "AUTHENTICATED", "flag": "WEBSEC{session_fixation_auth_token_reused}"}',
    securityImpact: 'Full account takeover without ever knowing or cracking the victim\'s password, bypassing credential complexity requirements.',
    prevention: '1. Always invalidate the existing session and regenerate a brand-new session token immediately upon successful user login.\n2. Set strict cookie flags: `HttpOnly`, `Secure`, and `SameSite=Strict` or `Lax`.\n3. Do not accept session identifiers passed via URL query strings.\n4. Invalidate all previous sessions upon password reset or role elevation.',
    vulnerableCode: `// Vulnerable: Retains existing session object upon login
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) return res.status(401).send('Invalid');

  // Flaw: Mutates existing session without regenerating session ID!
  req.session.userId = user.id;
  req.session.isAuthenticated = true;
  res.json({ success: true });
});`,
    secureCode: `// Remediated: Explicitly regenerates session ID upon authentication
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) return res.status(401).send('Invalid');

  // Destroy old session and generate brand new session ID
  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Session error');
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ success: true });
  });
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Session fixation was historically rampant in PHP 4/5 applications before `session_regenerate_id(true)` was adopted as standard practice. Many webmail and banking portals allowed attackers to send URLs containing `?PHPSESSID=attacker_token` to hijack accounts.',
    references: [
      { title: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' },
      { title: 'CWE-384: Session Fixation', url: 'https://cwe.mitre.org/data/definitions/384.html' },
      { title: 'OWASP WSTG-SESS-03: Testing for Session Fixation', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/06-Session_Management_Testing/03-Testing_for_Session_Fixation' }
    ],
    keyTakeaways: '• Always destroy and regenerate session identifiers upon any authentication state change.\n• Never accept session tokens via URL parameters.\n• Configure session cookies with HttpOnly, Secure, and SameSite attributes.'
  },

  // -------------------------------------------------------------------------
  // 8. JWT None Algorithm
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'jwt-none-algorithm-bypass',
    title: 'JSON Web Token (JWT) Signature Bypass via "none" Algorithm',
    slug: 'jwt-none-algorithm-bypass-guide',
    description: 'Investigate how flawed JWT verification libraries that accept the unsecured "none" algorithm allow attackers to forge administrative tokens.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A02:2021 – Cryptographic Failures',
    cweReference: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm',
    cvssScore: 8.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'JSON Web Tokens (RFC 7519) define an optional "none" algorithm for unsigned tokens intended for debug or environments where integrity is guaranteed by transport security. However, if a backend verification service naively trusts the `alg` header specified inside the client-supplied token without enforcing an explicit algorithm whitelist, an attacker can modify the token payload, set `"alg": "none"`, strip the signature, and bypass cryptographic verification completely.',
    rootCause: 'The server-side JWT verification logic relied on the algorithm declared in the incoming token header rather than enforcing a server-mandated signing algorithm (e.g., `algorithms: [\'HS256\']`).',
    mechanics: '1. Interception: Attacker examines their valid JWT: `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiVVNFUiJ9.signature`.\n2. Header Forgery: Attacker changes `{"alg": "HS256"}` to `{"alg": "none"}` and base64url-encodes it.\n3. Payload Forgery: Attacker alters payload to `{"userId": "1", "role": "admin"}`.\n4. Signature Stripping: Attacker joins `base64(header) + "." + base64(payload) + "."` (notice the trailing dot, empty signature).\n5. Token Submission: The server accepts the token as valid because the library treats "none" as a valid algorithm requiring no signature check.',
    attackScenario: 'GET /api/admin/flag HTTP/1.1\nHost: ctf.websec.internal\nAuthorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOiIxIiwicm9sZSI6ImFkbWluIn0.\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "message": "Signature verified with alg=none. Welcome admin.",\n  "flag": "WEBSEC{jwt_alg_none_signature_stripped_admin}"\n}',
    securityImpact: 'Universal authentication bypass and arbitrary privilege escalation across any account on the system.',
    prevention: '1. Explicitly whitelist permitted cryptographic algorithms during token verification (e.g., `jwt.verify(token, secret, { algorithms: [\'HS256\'] })`).\n2. Explicitly forbid the "none" algorithm.\n3. Use modern, secure JWT libraries that disallow "none" by default unless explicitly configured.',
    vulnerableCode: `// Vulnerable: Accepts whatever algorithm is specified in the token header
const token = req.headers.authorization.split(' ')[1];
// jwt.decode or verify without algorithm restrictions
const decoded = jwt.verify(token, SECRET_KEY); // In vulnerable libraries, "none" bypasses SECRET_KEY!`,
    secureCode: `// Remediated: Enforces strict algorithm whitelist
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256'], // Explicitly rejects 'none' and mismatched asymmetric keys
  issuer: 'websec-ctf',
  audience: 'websec-users',
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2015, multiple popular JWT libraries across Node.js, Python, Ruby, and Java were discovered to be vulnerable to the "none" algorithm bypass, allowing attackers to forge administrator sessions on thousands of commercial web applications.',
    references: [
      { title: 'OWASP JSON Web Token Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html' },
      { title: 'RFC 7519: JSON Web Token (JWT)', url: 'https://datatracker.ietf.org/doc/html/rfc7519' },
      { title: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm', url: 'https://cwe.mitre.org/data/definitions/327.html' }
    ],
    keyTakeaways: '• Always specify an explicit `algorithms` whitelist in `jwt.verify()`.\n• Never allow client tokens to dictate the verification algorithm.\n• Reject tokens with `alg: "none"` unconditionally in production systems.'
  },

  // -------------------------------------------------------------------------
  // 9. Privilege Escalation via Parameter Tampering
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'privilege-escalation-parameter-tampering',
    title: 'Privilege Escalation via Parameter Tampering & Mass Assignment',
    slug: 'privilege-escalation-parameter-tampering-guide',
    description: 'Analyze how unchecked user profile update endpoints bind untrusted request parameters directly to sensitive user attributes.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-269: Improper Privilege Management',
    cvssScore: 8.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Privilege Escalation via Parameter Tampering (also known as Mass Assignment or Over-Posting) happens when an application automatically maps client-submitted JSON keys or form parameters directly onto database models or entity properties without sanitizing or filtering which fields the user is permitted to update. An attacker injects privileged attributes (such as `role`, `is_admin`, or `tier`) into routine profile update requests.',
    rootCause: 'The server passes the entire request body (`req.body`) straight into an ORM update call (e.g., `db.user.update({ data: req.body })`) instead of using explicit Data Transfer Objects (DTOs) with strict property whitelisting.',
    mechanics: '1. Reconnaissance: An attacker inspects legitimate profile update requests: `PUT /api/user/profile` with `{"bio": "Security Student", "phone": "555-0100"}`.\n2. Fuzzing: The attacker fuzzes additional common privilege parameters: `{"role": "superadmin", "tier": "executive"}`.\n3. Automatic Binding: The backend ORM binds these extra fields directly to the corresponding database columns.\n4. Verification: The attacker refreshes their session or accesses the administrative console, finding their account elevated to superadmin status.',
    attackScenario: 'PUT /api/user/profile HTTP/1.1\nHost: ctf.websec.internal\nContent-Type: application/json\nCookie: session_id=student_session\n\n{\n  "bio": "Research Analyst",\n  "role": "superadmin",\n  "tier": "executive"\n}\n\nResponse:\nHTTP/1.1 200 OK\n{\n  "success": true,\n  "role": "superadmin",\n  "tier": "executive",\n  "message": "Superadmin rights granted. Executive audit flag: WEBSEC{param_tamper_role_escalated_to_superadmin}"\n}',
    securityImpact: 'Unauthorized vertical privilege escalation to system administrator or root level, complete database compromise, and unauthorized administrative actions.',
    prevention: '1. Use strict DTOs (Data Transfer Objects) with class-validator and whitelist options (`whitelist: true`, `forbidNonWhitelisted: true`).\n2. Never pass raw request payloads directly to ORM or database persistence layers.\n3. Restrict role and privilege modifications to dedicated, administrator-only management endpoints protected by authorization guards.',
    vulnerableCode: `// Vulnerable: Blindly persists all fields submitted in the request body
@Put('profile')
@UseGuards(AuthGuard)
async updateProfile(@Req() req: AuthenticatedRequest, @Body() body: any) {
  // Disastrous: body contains whatever fields the attacker sent!
  return this.prisma.user.update({
    where: { id: req.user.id },
    data: body,
  });
}`,
    secureCode: `// Remediated: Explicit DTO with strict field whitelisting
export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  bio?: string;

  @IsString()
  @IsOptional()
  phone?: string;
  // Notice: 'role', 'isAdmin', 'tier' are completely omitted from the DTO!
}

@Put('profile')
@UseGuards(AuthGuard)
async updateProfile(
  @Req() req: AuthenticatedRequest,
  @Body() dto: UpdateProfileDto,
) {
  return this.prisma.user.update({
    where: { id: req.user.id },
    data: {
      bio: dto.bio,
      phone: dto.phone,
    },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2012, security researcher Egor Homakov demonstrated mass assignment in Ruby on Rails on GitHub by submitting a public key with a crafted parameter that granted his account committer rights to the public Ruby on Rails repository.',
    references: [
      { title: 'OWASP Mass Assignment Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html' },
      { title: 'CWE-269: Improper Privilege Management', url: 'https://cwe.mitre.org/data/definitions/269.html' }
    ],
    keyTakeaways: '• Never pass raw client input directly to database ORM update methods.\n• Use explicit DTOs with validation pipes that reject unlisted properties.\n• Isolate administrative attribute modifications to dedicated administrative routes.'
  },

  // -------------------------------------------------------------------------
  // 10. Multi-Factor Authentication Bypass
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'mfa-response-manipulation-bypass',
    title: 'Multi-Factor Authentication (MFA) Bypass via Response Manipulation',
    slug: 'mfa-response-manipulation-bypass-guide',
    description: 'Discover how client-side state decisions and weak server session handling enable attackers to bypass two-factor authentication barriers.',
    category: 'auth-access-control',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A07:2021 – Identification and Authentication Failures',
    cweReference: 'CWE-287: Improper Authentication',
    cvssScore: 8.7,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Multi-Factor Authentication (MFA) adds an essential secondary verification step beyond passwords. However, when the authentication workflow is improperly orchestrated—such as issuing a fully privileged session token before the second factor is verified, or having frontend single-page applications (SPAs) navigate solely based on whether the HTTP response JSON reads `{"success": true}`—an attacker can intercept the response, tamper with the JSON body or status code, and bypass the entire MFA challenge.',
    rootCause: 'The server either marked the session as authenticated before validating the OTP, or the client application controlled access to protected routes without server-side validation of the secondary factor on subsequent API calls.',
    mechanics: '1. Primary Auth: The attacker enters valid primary credentials (username and password).\n2. Challenge Prompt: The server returns a prompt for a 6-digit one-time passcode (OTP).\n3. Proxy Interception: The attacker submits a dummy code (`000000`) and intercepts the server response in an HTTP proxy (e.g., OWASP ZAP or Burp Suite).\n4. Response Tampering: The server sends HTTP 401 with `{"success": false, "status": "FAIL"}`. The attacker intercepts and rewrites this to HTTP 200 with `{"success": true, "status": "VERIFIED"}`.\n5. Access Granted: The client application accepts the tampered response and admits the attacker to the administrative console.',
    attackScenario: 'Request:\nPOST /api/auth/verify-2fa\n{"code": "000000"}\n\nServer Response Intercepted:\nHTTP/1.1 401 Unauthorized\n{"success": false, "status": "FAIL"}\n\nTampered Response Forwarded to Browser:\nHTTP/1.1 200 OK\n{"success": true, "status": "VERIFIED"}\n\nOutcome: Client unlocks admin view and queries console flag:\nWEBSEC{mfa_response_status_manipulation_passed}',
    securityImpact: 'Total circumvention of multi-factor authentication, negating the security value of 2FA tokens and hardware keys.',
    prevention: '1. Issue an intermediate, restricted "pre-auth" token that is strictly limited to invoking the 2FA verification endpoint.\n2. Do not issue full session cookies or fully scoped JWTs until the secondary factor is mathematically verified on the server.\n3. Validate MFA verification state on every subsequent API endpoint.',
    vulnerableCode: `// Vulnerable: Issues full session token BEFORE 2FA is verified!
@Post('login')
async login(@Body() body: LoginDto, @Res() res: Response) {
  const user = await this.authService.validateUser(body);
  // Flaw: Setting the full session cookie right now!
  res.cookie('session', this.authService.createToken(user));
  return res.json({ mfaRequired: true });
}`,
    secureCode: `// Remediated: Issues temporary restricted token; full token only after 2FA validation
@Post('login')
async login(@Body() body: LoginDto) {
  const user = await this.authService.validateUser(body);
  // Issue restricted token valid ONLY for /verify-mfa endpoint for 5 minutes
  const mfaSessionToken = this.jwtService.sign(
    { sub: user.id, stage: 'MFA_PENDING' },
    { expiresIn: '5m' }
  );
  return { mfaRequired: true, mfaSessionToken };
}

@Post('verify-mfa')
async verifyMfa(@Body() body: VerifyMfaDto) {
  const payload = this.jwtService.verify(body.mfaSessionToken);
  if (payload.stage !== 'MFA_PENDING') throw new UnauthorizedException();

  const isValidOtp = await this.mfaService.verifyOtp(payload.sub, body.code);
  if (!isValidOtp) throw new UnauthorizedException('Invalid 2FA code');

  // Only now generate fully authenticated session
  return { accessToken: this.authService.createFullToken(payload.sub) };
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Several bug bounty reports on major fintech platforms revealed that entering an incorrect SMS passcode and changing the HTTP response status code from 400 to 200 in a local proxy allowed researchers to transition directly into the user\'s banking dashboard.',
    references: [
      { title: 'OWASP Multi-Factor Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html' },
      { title: 'CWE-287: Improper Authentication', url: 'https://cwe.mitre.org/data/definitions/287.html' },
      { title: 'OWASP WSTG-ATHN-10: Testing for Multi-Factor Authentication', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/03-Identity_Management_Testing/10-Testing_for_Weaker_Multi-Factor_Authentication' }
    ],
    keyTakeaways: '• Never rely on client-side state to enforce authentication steps.\n• Issue scoped intermediate tokens during multi-step authentication.\n• Require server-side verification before issuing authorized session credentials.'
  }
];
