import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from '../lessons-data';

export const NEW_BATCH1_LESSONS: LessonSeedData[] = [
  // 1. Invoice Vault
  {
    challengeSlug: 'invoice-vault',
    title: 'Insecure Direct Object Reference (IDOR) in Financial Portals',
    slug: 'idor-invoice-vault-remediation',
    description: 'Learn how missing tenancy checks on numeric database IDs allow unauthorized access to sensitive financial records.',
    category: 'Insecure Direct Object Reference (IDOR)',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'A01:2021-Broken Access Control',
    cweReference: 'CWE-639',
    cvssScore: 6.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Insecure Direct Object References (IDOR) occur when an application accepts user-supplied identifiers (such as database primary keys) to fetch records without validating whether the authenticated user owns that specific record.',
    rootCause: 'The server retrieves records directly using WHERE id = :id without combining user ownership filters (WHERE id = :id AND userId = :currentUserId).',
    mechanics: 'Attackers identify sequential or predictable IDs in API requests (e.g., /api/invoices/1001) and increment or decrement the ID to exfiltrate other users\' data.',
    attackScenario: 'A contractor notes that their invoice is #1001. By sending a request to /api/invoices/1000, they view the confidential billing notes and payment vouchers of the enterprise CEO.',
    securityImpact: 'Unauthorized disclosure of financial invoices, customer PII, corporate payment tokens, and intellectual property.',
    prevention: 'Always enforce tenancy verification on the backend by combining resource lookups with the authenticated user\'s session token. Alternatively, use cryptographically random UUIDv4 or indirect mapping tables.',
    vulnerableCode: `// VULNERABLE: Direct lookup by ID without owner check
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(req.params.id) }
  });
  res.json(invoice);
});`,
    secureCode: `// SECURE: Enforces tenant isolation using session userId
app.get('/api/invoices/:id', authenticateJwt, async (req, res) => {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id // Strict ownership verification
    }
  });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'A 2021 financial portal breach where over 1.2 million invoices were accessed because the endpoint /download/invoice?id=12345 did not verify the session identity.',
    references: [
      { title: 'OWASP IDOR Prevention Guide', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-639: User-Controlled Key', url: 'https://cwe.mitre.org/data/definitions/639.html' }
    ],
    keyTakeaways: 'Never trust user-supplied record IDs. Always validate session ownership at the database query layer.'
  },

  // 2. Ghost Patient
  {
    challengeSlug: 'ghost-patient',
    title: 'HTTP Verb Tampering & IDOR in Healthcare Systems',
    slug: 'idor-ghost-patient-verb-tampering',
    description: 'Understand how access control lists applied only to GET requests allow unauthorized access via PUT, PATCH, or DELETE.',
    category: 'Insecure Direct Object Reference (IDOR)',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'A01:2021-Broken Access Control',
    cweReference: 'CWE-639',
    cvssScore: 8.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'HTTP Verb Tampering occurs when an application applies security rules or authentication checks to some HTTP methods (like GET) while omitting identical checks on other methods (like PUT, PATCH, or POST).',
    rootCause: 'Security middleware was configured to intercept GET requests specifically, leaving mutating verbs unrestricted.',
    mechanics: 'An attacker accesses a protected endpoint with an alternative verb (PUT /api/patients/:uuid). The backend processes the request and returns the full patient record in the response payload.',
    attackScenario: 'A medical worker cannot read a VIP patient record with GET. By switching the request to PUT, the update handler executes and echoes back the confidential clinical diagnosis and flag.',
    securityImpact: 'Unauthorized modification and disclosure of protected health information (PHI) violating HIPAA and enterprise privacy standards.',
    prevention: 'Apply authorization guards globally across all HTTP methods on resource controllers, and validate object ownership regardless of verb.',
    vulnerableCode: `// VULNERABLE: Only GET is guarded by clearance check
router.get('/api/patients/:id', requirePhysicianClearance, getPatient);
router.put('/api/patients/:id', updatePatient); // Missing clearance guard!`,
    secureCode: `// SECURE: Guard applied uniformly to the entire patient controller
router.use('/api/patients/:id', authenticateJwt, requirePhysicianClearance);
router.get('/api/patients/:id', getPatient);
router.put('/api/patients/:id', updatePatient);`,
    codeLanguage: 'typescript',
    realWorldExample: 'A major hospital API allowed arbitrary record modification because WAF rules only inspected GET query strings and ignored PUT bodies.',
    references: [
      { title: 'OWASP Bypassing Authorization Schema', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/02-Testing_for_Bypassing_Authorization_Schema' }
    ],
    keyTakeaways: 'Apply authentication and tenancy policies globally across all HTTP methods, not just GET.'
  },

  // 3. Link Preview
  {
    challengeSlug: 'link-preview',
    title: 'Server-Side Request Forgery (SSRF) via URL Preview Fetchers',
    slug: 'ssrf-link-preview-remediation',
    description: 'Learn how server-side URL fetching without host validation exposes internal cluster daemons and loopback services.',
    category: 'Server-Side Request Forgery (SSRF)',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'A10:2021-Server-Side Request Forgery (SSRF)',
    cweReference: 'CWE-918',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Server-Side Request Forgery (SSRF) occurs when a web application makes HTTP requests to remote resources specified by untrusted user input without proper validation.',
    rootCause: 'The server accepts user-supplied URLs and fetches them directly from the server\'s network context, bypassing firewalls and NAT boundaries.',
    mechanics: 'An attacker supplies internal loopback addresses (http://127.0.0.1:8080/admin) to reach administrative microservices that are not exposed to the public Internet.',
    attackScenario: 'A social card generator takes a URL and fetches OpenGraph tags. By passing 127.0.0.1:8080, an attacker reads internal cluster tokens and administration interfaces.',
    securityImpact: 'Internal network port scanning, remote internal daemon exploitation, and confidential cluster token exfiltration.',
    prevention: 'Implement strict protocol allowlisting (only http/https), DNS resolution verification, and block all private IP ranges (RFC 1918, 127.0.0.0/8, 169.254.0.0/16).',
    vulnerableCode: `// VULNERABLE: Direct fetch without IP range verification
app.post('/api/preview', async (req, res) => {
  const { url } = req.body;
  const response = await axios.get(url); // Can target 127.0.0.1!
  res.json({ preview: response.data });
});`,
    secureCode: `// SECURE: Validates target IP against private/loopback ranges
import ipaddr from 'ipaddr.js';
import dns from 'dns/promises';

async function validateSafeUrl(urlStr) {
  const parsed = new URL(urlStr);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol');
  const lookup = await dns.lookup(parsed.hostname);
  const addr = ipaddr.parse(lookup.address);
  if (addr.range() !== 'unicast') throw new Error('Access to private/loopback IP is forbidden');
  return urlStr;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'The 2019 Capital One breach where SSRF allowed attackers to query internal cloud services and exfiltrate over 100 million customer records.',
    references: [
      { title: 'OWASP SSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' }
    ],
    keyTakeaways: 'Never fetch user-supplied URLs directly from application servers without resolving DNS and blocking private IP ranges.'
  },

  // 4. Metadata Maze
  {
    challengeSlug: 'metadata-maze',
    title: 'Cloud Metadata SSRF & WAF Filter Evasion',
    slug: 'ssrf-metadata-maze-remediation',
    description: 'Examine how naive string blocklists fail against alternative IP representations, exposing cloud instance metadata.',
    category: 'Server-Side Request Forgery (SSRF)',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'A10:2021-Server-Side Request Forgery (SSRF)',
    cweReference: 'CWE-918',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Cloud instance metadata services (e.g. AWS/GCP at 169.254.169.254) provide sensitive runtime credentials to workloads. When SSRF filters rely on naive keyword blocklists (like "localhost"), attackers use alternative IP encodings to bypass the filter.',
    rootCause: 'WAF rules checked for string literals ("127.0.0.1", "localhost") rather than canonicalizing the IP address and enforcing IMDSv2.',
    mechanics: 'Attackers supply decimal (2852039166), hex (0xa9fea9fe), or direct link-local IP 169.254.169.254 to reach cloud metadata and extract IAM credentials.',
    attackScenario: 'An attacker bypasses a media ingestion WAF by requesting http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role, obtaining temporary cloud admin tokens.',
    securityImpact: 'Full cloud infrastructure compromise through stolen IAM role credentials and cloud privilege escalation.',
    prevention: 'Enforce AWS IMDSv2 (requiring session tokens with PUT headers), disable instance metadata access if unnecessary, and validate canonical IP addresses.',
    vulnerableCode: `// VULNERABLE: Ineffective string blocklist
if (url.includes('localhost') || url.includes('127.0.0.1')) {
  return res.status(403).send('Blocked');
}
// Still vulnerable to 169.254.169.254 or decimal 2852039166!
const data = await fetch(url);`,
    secureCode: `// SECURE: Enforce canonical IP resolution and host isolation
const parsed = new URL(url);
const resolved = await dns.lookup(parsed.hostname);
if (isPrivateOrLinkLocal(resolved.address)) {
  throw new ForbiddenException('Restricted destination');
}
// In AWS, enforce IMDSv2 via launch template: HttpTokens=required`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major cloud breaches where SSRF combined with IMDSv1 allowed attackers to steal AWS IAM role session keys and dump S3 buckets.',
    references: [
      { title: 'AWS IMDSv2 Defense Guide', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html' }
    ],
    keyTakeaways: 'Naive blocklists never work for IP filtering. Enforce canonical IP parsing and migrate cloud workloads to IMDSv2.'
  }
];
