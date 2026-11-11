import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from '../lessons-data';

export const NEW_BATCH2_LESSONS: LessonSeedData[] = [
  // 5. Ping Pong
  {
    challengeSlug: 'ping-pong',
    title: 'Command Injection via Unsanitized System Calls',
    slug: 'cmd-injection-ping-pong-remediation',
    description: 'Learn how concatenating user input directly into shell commands enables arbitrary command execution.',
    category: 'Command Injection',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'A03:2021-Injection',
    cweReference: 'CWE-78',
    cvssScore: 8.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'OS Command Injection occurs when an application passes unvalidated user data directly to a system shell interpreter (such as bash, sh, or cmd.exe). Attackers append shell control operators to execute arbitrary commands with the privileges of the web application process.',
    rootCause: 'Calling system execution functions (e.g. system(), exec(), or child_process.exec) with string concatenation instead of parameterized APIs or native system libraries.',
    mechanics: 'Using command separators like semicolon (;), logical AND (&&), or pipes (|), an attacker forces the shell to run an injected command immediately after the intended program.',
    attackScenario: 'A network diagnostic tool executes "ping -c 2 " + host. An attacker passes "8.8.8.8 && cat /flag.txt", causing the server to ping Google and then immediately dump the flag to standard output.',
    securityImpact: 'Remote code execution (RCE), full host compromise, lateral movement through internal networks, and unauthorized data exfiltration.',
    prevention: 'Avoid system shell execution whenever possible. Use native language network libraries (e.g., node:net or socket APIs). When external binaries must be called, use parameterized execFile() with arrays, never shell execution.',
    vulnerableCode: `// VULNERABLE: Direct shell interpolation
import { exec } from 'child_process';
app.get('/api/ping', (req, res) => {
  const host = req.query.host;
  exec(\`ping -c 2 \${host}\`, (err, stdout) => {
    res.json({ output: stdout });
  });
});`,
    secureCode: `// SECURE: Use execFile with array arguments (no shell interpreter)
import { execFile } from 'child_process';
import net from 'net';

app.get('/api/ping', (req, res) => {
  const host = String(req.query.host);
  if (!net.isIP(host)) return res.status(400).json({ error: 'Valid IP required' });
  // execFile does NOT invoke /bin/sh; arguments are passed directly
  execFile('ping', ['-c', '2', host], (err, stdout) => {
    res.json({ output: stdout });
  });
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'A popular router management interface vulnerability where ping diagnostic fields allowed unauthenticated remote command execution as root.',
    references: [
      { title: 'OWASP Command Injection Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html' },
      { title: 'CWE-78: OS Command Injection', url: 'https://cwe.mitre.org/data/definitions/78.html' }
    ],
    keyTakeaways: 'Never pass user input to a shell. Use parameterized execution without a shell interpreter, and strictly validate inputs with IP/hostname allowlists.'
  },

  // 6. Log Cruncher
  {
    challengeSlug: 'log-cruncher',
    title: 'Command Injection Filter Evasion via Shell Variables & Subshells',
    slug: 'cmd-injection-log-cruncher-filter-bypass',
    description: 'Examine how naive character blocklists fail against Unix shell variable expansion ($IFS) and subshell operators.',
    category: 'Command Injection',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'A03:2021-Injection',
    cweReference: 'CWE-78',
    cvssScore: 9.2,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Developers often attempt to secure command execution using blocklists that ban common characters like semicolons and spaces. However, Unix shells provide rich syntax alternatives (such as $IFS for whitespace, and $(...) or pipes for chaining) that easily bypass string-based sanitization.',
    rootCause: 'Relying on character blocklists rather than removing shell execution or using strict positive allowlists.',
    mechanics: 'The $IFS environment variable holds default field delimiters (space, tab, newline). Attackers substitute spaces with $IFS or ${IFS} and bypass semicolons using command substitution or pipeline redirection.',
    attackScenario: 'A log tool rejects queries containing spaces or semicolons. An attacker submits $(cat${IFS}/flag.txt) or pattern|cat$IFS/flag.txt, executing the payload without triggering the filter.',
    securityImpact: 'Full remote code execution even behind WAF filters or naive input sanitizers.',
    prevention: 'Never rely on blacklists for command safety. Use native programmatic APIs for searching data (e.g. database queries or grep streams) without shell invocation.',
    vulnerableCode: `// VULNERABLE: Naive character blocklist
app.get('/api/logs', (req, res) => {
  const q = req.query.query;
  if (q.includes(';') || q.includes(' ')) return res.status(400).send('Blocked');
  // Vulnerable to: q="test|cat\${IFS}/flag.txt"
  exec(\`grep "\${q}" /var/log/app.log\`, (err, stdout) => res.send(stdout));
});`,
    secureCode: `// SECURE: Programmatic file reading without shell
import fs from 'fs';
import readline from 'readline';

app.get('/api/logs', async (req, res) => {
  const query = String(req.query.query || '');
  const matches: string[] = [];
  const fileStream = fs.createReadStream('/var/log/app.log');
  const rl = readline.createInterface({ input: fileStream });
  for await (const line of rl) {
    if (line.includes(query)) matches.push(line);
  }
  res.json({ matches });
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Log4Shell (CVE-2021-44228) and Shellshock demonstrated how complex string and environment evaluations bypass naive gateway filters.',
    references: [
      { title: 'OWASP Input Validation Guide', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html' }
    ],
    keyTakeaways: 'Blocklists are easily bypassed in command contexts. Eliminate shell execution entirely and use native application APIs.'
  },

  // 7. Token Trouble
  {
    challengeSlug: 'token-trouble',
    title: 'JWT Algorithm Downgrade & alg:none Vulnerabilities',
    slug: 'jwt-token-trouble-alg-none',
    description: 'Understand the security risks of trusting client-specified JWT algorithm headers and accepting unsigned tokens.',
    category: 'JSON Web Token (JWT)',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'A02:2021-Cryptographic Failures',
    cweReference: 'CWE-347',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'The JSON Web Signature (JWS) standard specifies the "none" algorithm for unsigned tokens. When server verification logic does not enforce a strict algorithm whitelist, attackers modify the header to {"alg":"none"} and forge arbitrary claims without a signature.',
    rootCause: 'The JWT verification function accepts tokens with alg: "none" or allows the token header to dictate which algorithm is used for verification.',
    mechanics: 'An attacker modifies the payload to {"role":"admin"}, updates the header to {"alg":"none"}, removes the signature segment (header.payload.), and submits the forged token to access administrative endpoints.',
    attackScenario: 'A contractor receives a guest token. By decoding the base64url segments, altering "role":"guest" to "role":"admin", setting "alg":"none", and appending a trailing dot, they gain full administrative clearance.',
    securityImpact: 'Complete authentication bypass, horizontal and vertical privilege escalation, and full identity impersonation.',
    prevention: 'Always enforce a strict algorithm whitelist on the server (e.g. algorithms: [\'HS256\']), explicitly reject alg: "none", and verify signatures unconditionally.',
    vulnerableCode: `// VULNERABLE: Algorithm determined by token header
import jwt from 'jsonwebtoken';
app.get('/api/admin', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Vulnerable if algorithms option is omitted or accepts none
  const decoded = jwt.decode(token); // Trusting unverified payload!
  if (decoded.role === 'admin') res.json({ secret: 'admin_data' });
});`,
    secureCode: `// SECURE: Enforces HS256 algorithm and rejects unsigned tokens
import jwt from 'jsonwebtoken';
app.get('/api/admin', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const verified = jwt.verify(token, SERVER_SECRET, {
      algorithms: ['HS256'] // Explicit algorithm whitelist!
    });
    if (verified.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    res.json({ secret: 'admin_data' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or unsigned token' });
  }
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Multiple popular open-source JWT verification libraries historically permitted alg:none bypasses prior to formal security advisories.',
    references: [
      { title: 'OWASP JWT Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html' },
      { title: 'RFC 7519: JSON Web Token', url: 'https://datatracker.ietf.org/doc/html/rfc7519' }
    ],
    keyTakeaways: 'Never let client tokens specify the verification algorithm. Enforce server-side algorithm whitelisting and reject alg:none.'
  },

  // 8. Key Confusion
  {
    challengeSlug: 'key-confusion',
    title: 'JWT Asymmetric-to-Symmetric (RS256 to HS256) Key Confusion',
    slug: 'jwt-key-confusion-rs256-hs256',
    description: 'Learn how public key confusion allows attackers to sign valid tokens using an RSA public key as an HMAC shared secret.',
    category: 'JSON Web Token (JWT)',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'A02:2021-Cryptographic Failures',
    cweReference: 'CWE-327',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Key Confusion (algorithm confusion) occurs when an application expects tokens signed with an asymmetric algorithm (like RS256) but accepts symmetric algorithms (like HS256). In HS256 mode, the server uses its verification key—the publicly known RSA public key—as the HMAC shared secret.',
    rootCause: 'The server passes the same key variable (the RSA public key) to a generic jwt.verify() call without fixing the expected algorithm to RS256.',
    mechanics: 'Because the RSA public key is freely available at /.well-known/jwks.json, an attacker signs a token using HS256 with the public key as the secret. The server verifies it with HMAC using that same public key and accepts it as valid.',
    attackScenario: 'An attacker downloads the server\'s public key from /.well-known/jwks.json, changes alg to HS256, sets "role":"admin", computes an HMAC-SHA256 signature using the public key string, and authenticates as administrator.',
    securityImpact: 'Arbitrary administrative token forgery, complete account takeover, and bypass of asymmetric cryptographic controls.',
    prevention: 'Strictly bind keys to their cryptographic algorithms. Enforce algorithms: [\'RS256\'] in verification parameters, and never pass public keys to symmetric HMAC verifiers.',
    vulnerableCode: `// VULNERABLE: Key passed without algorithm restriction
app.post('/api/verify', (req, res) => {
  const token = req.body.token;
  // If token specifies alg: HS256, verify uses publicKey as HMAC secret!
  const user = jwt.verify(token, publicKey); 
  res.json(user);
});`,
    secureCode: `// SECURE: Enforce RS256 algorithm explicitly
app.post('/api/verify', (req, res) => {
  const token = req.body.token;
  const user = jwt.verify(token, publicKey, {
    algorithms: ['RS256'] // Rejects HS256 key confusion attacks!
  });
  res.json(user);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Authentication bypasses identified in enterprise SSO implementations where OpenID Connect tokens were downgraded to HS256 using public JWKS certs.',
    references: [
      { title: 'Auth0 JWT Algorithm Confusion Analysis', url: 'https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/' }
    ],
    keyTakeaways: 'Strictly enforce the expected cryptographic algorithm on verification. An asymmetric public key must never be used with a symmetric algorithm.'
  }
];
