import { PrismaClient, UserRole, ChallengeStatus, ProgressStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { CATEGORIES_DATA, ALL_50_CHALLENGES } from './challenges-data';
import { ALL_50_LESSONS } from './lessons-data';

const prisma = new PrismaClient();

// Helper function to create a secure salted hash for passwords
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Helper function to hash CTF flags with SHA-256
function hashFlag(flag: string): string {
  return crypto.createHash('sha256').update(flag.trim()).digest('hex');
}

// Full collection of standardized security references used across the 50 challenges
const SECURITY_REFERENCES = [
  // OWASP Top 10 (2021)
  { referenceType: 'OWASP_TOP_10', identifier: 'A01:2021', name: 'Broken Access Control', version: '2021', description: 'Restrictions on what authenticated users are allowed to do are not properly enforced.', url: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A02:2021', name: 'Cryptographic Failures', version: '2021', description: 'Failures related to cryptography leading to sensitive data exposure or system compromise.', url: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A03:2021', name: 'Injection', version: '2021', description: 'SQL, NoSQL, OS command, and LDAP injection when untrusted data is sent to an interpreter.', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A04:2021', name: 'Insecure Design', version: '2021', description: 'Risks related to design flaws and architectural weaknesses.', url: 'https://owasp.org/Top10/A04_2021-Insecure_Design/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A05:2021', name: 'Security Misconfiguration', version: '2021', description: 'Default passwords, verbose error messages, open cloud storage, and unhardened systems.', url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A07:2021', name: 'Identification and Authentication Failures', version: '2021', description: 'Confirmation of the user\'s identity, authentication, and session management flaws.', url: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A10:2021', name: 'Server-Side Request Forgery (SSRF)', version: '2021', description: 'Web application fetches a remote resource without validating the user-supplied URL.', url: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/' },

  // OWASP API Security Top 10 (2023)
  { referenceType: 'OWASP_API', identifier: 'API1:2023', name: 'Broken Object Level Authorization (BOLA)', version: '2023', description: 'Endpoints handle object identifiers creating authorization bypasses.', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' },
  { referenceType: 'OWASP_API', identifier: 'API2:2023', name: 'Broken Authentication', version: '2023', description: 'Poorly implemented API authentication mechanisms allowing credential takeover.', url: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/' },
  { referenceType: 'OWASP_API', identifier: 'API3:2023', name: 'Broken Object Property Level Authorization (BOPLA)', version: '2023', description: 'Lack of authorization validation when modifying object properties or mass assignment.', url: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/' },
  { referenceType: 'OWASP_API', identifier: 'API4:2023', name: 'Unrestricted Resource Consumption', version: '2023', description: 'Satisfying API requests requires resources without proper rate limiting or quotas.', url: 'https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/' },

  // Common Weakness Enumeration (CWE)
  { referenceType: 'CWE', identifier: 'CWE-22', name: 'Improper Limitation of a Pathname to a Restricted Directory', version: '4.14', description: 'Path traversal / dot-dot-slash allowing access to files outside intended boundaries.', url: 'https://cwe.mitre.org/data/definitions/22.html' },
  { referenceType: 'CWE', identifier: 'CWE-79', name: 'Improper Neutralization of Input During Web Page Generation (XSS)', version: '4.14', description: 'Untrusted user input placed into web output without proper encoding or sanitization.', url: 'https://cwe.mitre.org/data/definitions/79.html' },
  { referenceType: 'CWE', identifier: 'CWE-89', name: 'Improper Neutralization of Special Elements used in an SQL Command', version: '4.14', description: 'Untrusted user input embedded into SQL query without quoting or parameters.', url: 'https://cwe.mitre.org/data/definitions/89.html' },
  { referenceType: 'CWE', identifier: 'CWE-98', name: 'Improper Control of Filename for Include/Require Statement in PHP', version: '4.14', description: 'PHP file inclusion flaws allowing local or remote script execution.', url: 'https://cwe.mitre.org/data/definitions/98.html' },
  { referenceType: 'CWE', identifier: 'CWE-200', name: 'Exposure of Sensitive Information to an Unauthorized Actor', version: '4.14', description: 'The product exposes sensitive information to an actor that is not explicitly authorized.', url: 'https://cwe.mitre.org/data/definitions/200.html' },
  { referenceType: 'CWE', identifier: 'CWE-204', name: 'Observable Response Discrepancy', version: '4.14', description: 'Different responses allow an attacker to infer secret system state or username existence.', url: 'https://cwe.mitre.org/data/definitions/204.html' },
  { referenceType: 'CWE', identifier: 'CWE-209', name: 'Generation of Error Message Containing Sensitive Information', version: '4.14', description: 'Error messages display system diagnostics or database contents.', url: 'https://cwe.mitre.org/data/definitions/209.html' },
  { referenceType: 'CWE', identifier: 'CWE-213', name: 'Exposure of Sensitive Information Due to Incompatible Policies', version: '4.14', description: 'Excessive data returned in API response relying on client-side filtering.', url: 'https://cwe.mitre.org/data/definitions/213.html' },
  { referenceType: 'CWE', identifier: 'CWE-269', name: 'Improper Privilege Management', version: '4.14', description: 'Software fails to properly assign, verify, or isolate privileges.', url: 'https://cwe.mitre.org/data/definitions/269.html' },
  { referenceType: 'CWE', identifier: 'CWE-287', name: 'Improper Authentication', version: '4.14', description: 'When an actor claims to have a given identity, the software does not prove the claim.', url: 'https://cwe.mitre.org/data/definitions/287.html' },
  { referenceType: 'CWE', identifier: 'CWE-306', name: 'Missing Authentication for Critical Function', version: '4.14', description: 'A critical system function does not require authentication before execution.', url: 'https://cwe.mitre.org/data/definitions/306.html' },
  { referenceType: 'CWE', identifier: 'CWE-327', name: 'Use of a Broken or Risky Cryptographic Algorithm', version: '4.14', description: 'Cryptographic algorithm is broken or permits algorithm downgrade.', url: 'https://cwe.mitre.org/data/definitions/327.html' },
  { referenceType: 'CWE', identifier: 'CWE-330', name: 'Use of Insufficiently Random Values', version: '4.14', description: 'Tokens or secrets are generated using predictable or low-entropy seeds.', url: 'https://cwe.mitre.org/data/definitions/330.html' },
  { referenceType: 'CWE', identifier: 'CWE-384', name: 'Session Fixation', version: '4.14', description: 'Authenticating a user does not invalidate the existing pre-authentication session identifier.', url: 'https://cwe.mitre.org/data/definitions/384.html' },
  { referenceType: 'CWE', identifier: 'CWE-434', name: 'Unrestricted Upload of File with Dangerous Type', version: '4.14', description: 'The software allows an attacker to upload or transfer dangerous executable files.', url: 'https://cwe.mitre.org/data/definitions/434.html' },
  { referenceType: 'CWE', identifier: 'CWE-521', name: 'Weak Password Requirements', version: '4.14', description: 'System permits simple or default passwords without complexity enforcement.', url: 'https://cwe.mitre.org/data/definitions/521.html' },
  { referenceType: 'CWE', identifier: 'CWE-639', name: 'Authorization Bypass Through User-Controlled Key', version: '4.14', description: 'Insecure Direct Object Reference (IDOR) allows accessing records using predictable keys.', url: 'https://cwe.mitre.org/data/definitions/639.html' },
  { referenceType: 'CWE', identifier: 'CWE-770', name: 'Allocation of Resources Without Limits or Throttling', version: '4.14', description: 'Missing rate-limiting allows automated brute force or exhaustion.', url: 'https://cwe.mitre.org/data/definitions/770.html' },
  { referenceType: 'CWE', identifier: 'CWE-862', name: 'Missing Authorization', version: '4.14', description: 'Software does not perform an authorization check when an actor attempts to access a resource.', url: 'https://cwe.mitre.org/data/definitions/862.html' },
  { referenceType: 'CWE', identifier: 'CWE-915', name: 'Improperly Controlled Modification of Dynamically-Determined Object Attributes', version: '4.14', description: 'Mass assignment vulnerability allowing client modification of protected properties.', url: 'https://cwe.mitre.org/data/definitions/915.html' },
  { referenceType: 'CWE', identifier: 'CWE-918', name: 'Server-Side Request Forgery (SSRF)', version: '4.14', description: 'Server creates requests to arbitrary destinations based on user input.', url: 'https://cwe.mitre.org/data/definitions/918.html' },
  { referenceType: 'CWE', identifier: 'CWE-1336', name: 'Improper Neutralization of Special Elements Used in a Template Engine', version: '4.14', description: 'Server-Side Template Injection (SSTI) leading to remote code or expression execution.', url: 'https://cwe.mitre.org/data/definitions/1336.html' },

  // OWASP Web Security Testing Guide (WSTG v4.2)
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHN-01', name: 'Testing for Credentials Transported over an Encrypted Channel', version: 'v4.2', description: 'Verifying transport layer encryption and endpoint authorization.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHN-07', name: 'Testing for Weak Password Policy', version: 'v4.2', description: 'Assessing password strength requirements and default credentials.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHN-09', name: 'Testing for Weak Password Reset Function', version: 'v4.2', description: 'Verifying token entropy and delivery mechanisms during password reset.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHN-10', name: 'Testing for Multi-Factor Authentication', version: 'v4.2', description: 'Evaluating 2FA enforcement and client-side bypass vulnerabilities.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHZ-02', name: 'Testing for Bypassing Authorization Schema', version: 'v4.2', description: 'Verifying administrative role checks on internal URLs and API endpoints.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHZ-03', name: 'Testing for Privilege Escalation', version: 'v4.2', description: 'Horizontal and vertical privilege escalation methodology.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-ATHZ-04', name: 'Testing for Insecure Direct Object References', version: 'v4.2', description: 'Testing identifier-based resource access authorization.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-IDNT-04', name: 'Testing for Account Enumeration and Guessable User Account', version: 'v4.2', description: 'Detecting username leakage through observable response discrepancies.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-INPV-01', name: 'Testing for Reflected Cross Site Scripting', version: 'v4.2', description: 'Testing input reflections in HTML, attributes, and scripts.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-INPV-02', name: 'Testing for Stored Cross Site Scripting', version: 'v4.2', description: 'Testing persistent script storage in databases and administrative logs.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-INPV-05', name: 'Testing for SQL Injection', version: 'v4.2', description: 'Testing methodology for input validation and database exploitation.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-INPV-18', name: 'Testing for Server-Side Template Injection', version: 'v4.2', description: 'Testing template engines for arbitrary expression evaluation.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-INPV-19', name: 'Testing for Server-Side Request Forgery', version: 'v4.2', description: 'Testing for remote resource fetching to internal networks and cloud metadata.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-CLNT-01', name: 'Testing for DOM-Based Cross Site Scripting', version: 'v4.2', description: 'Analyzing client-side JavaScript sources and sinks.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-CONF-12', name: 'Testing for Content Security Policy', version: 'v4.2', description: 'Evaluating CSP directives and identifying CDN script gadgets.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-FILE-01', name: 'Testing for Directory Traversal / File Inclusion', version: 'v4.2', description: 'Testing relative path traversal, LFI, and RFI flaws.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-FILE-02', name: 'Testing for File Upload Vulnerabilities', version: 'v4.2', description: 'Testing extension filtering, MIME types, and web shell execution.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-INFO-05', name: 'Review Webpage Content for Information Leakage', version: 'v4.2', description: 'Detecting exposed API documentation, debug routes, and excessive JSON data.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-BUSL-01', name: 'Testing Business Logic Data Validation', version: 'v4.2', description: 'Testing multi-step application workflow integrity.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-BUSL-03', name: 'Testing for Integrity Checks', version: 'v4.2', description: 'Testing object property modification and mass assignment authorization.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-SESS-03', name: 'Testing for Session Fixation', version: 'v4.2', description: 'Assessing session identifier regeneration upon authentication.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-UIR-01', name: 'Testing for Rate Limiting', version: 'v4.2', description: 'Evaluating request rate limiting and proxy header bypasses.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_WSTG', identifier: 'WSTG-CRYP-04', name: 'Testing for Weak Cryptography and Algorithm Downgrade', version: 'v4.2', description: 'Verifying JWT token verification algorithms and cryptographic integrity.', url: 'https://owasp.org/www-project-web-security-testing-guide/' },
  { referenceType: 'OWASP_TOP_10', identifier: 'A00:2021', name: 'Introduction & Web Security Foundations', version: '2021', description: 'Foundational taxonomy and architecture guidance for the OWASP Top 10 web application security risks.', url: 'https://owasp.org/Top10/A00_2021_Introduction/' },
  { referenceType: 'IETF_RFC', identifier: 'RFC-6265', name: 'HTTP State Management Mechanism (Cookies)', version: '2011', description: 'Standardized browser cookie parsing, Secure, HttpOnly, Domain, Path, and SameSite security semantics.', url: 'https://www.rfc-editor.org/rfc/rfc6265.html' },
  { referenceType: 'IETF_RFC', identifier: 'RFC-9110', name: 'HTTP Semantics', version: '2022', description: 'Core HTTP request/response semantics, safe and idempotent methods, status codes, and content negotiation.', url: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
  { referenceType: 'IETF_RFC', identifier: 'RFC-9113', name: 'HTTP/2 Specification', version: '2022', description: 'Binary multiplexed framing, HPACK header compression, and request pseudo-headers.', url: 'https://www.rfc-editor.org/rfc/rfc9113.html' },
  { referenceType: 'NIST', identifier: 'SP-800-95', name: 'Guide to Secure Web Services', version: '2007', description: 'NIST defense-in-depth architecture, TLS transport protection, and web service boundary validation.', url: 'https://csrc.nist.gov/pubs/sp/800/95/final' },
  { referenceType: 'OWASP_ASVS', identifier: 'V1', name: 'Architecture, Design and Threat Modeling', version: '4.0.3', description: 'Foundational security architecture, STRIDE threat modeling, and trust boundary verification requirements.', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
  { referenceType: 'OWASP_ASVS', identifier: 'V3', name: 'Session Management Verification Requirements', version: '4.0.3', description: 'Session lifecycle, cookie flags, session rotation on login, and server-side revocation controls.', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
  { referenceType: 'OWASP_ASVS', identifier: 'V14', name: 'Configuration & HTTP Security Headers', version: '4.0.3', description: 'HSTS, CSP, X-Content-Type-Options, CORS allowlisting, and secure server defaults.', url: 'https://owasp.org/www-project-application-security-verification-standard/' },
];

async function main() {
  console.log('🌱 Starting WebSec CTF 50-Challenge Database Seeding...');

  // ----------------------------------------------------
  // 1. Seed Security References
  // ----------------------------------------------------
  const refMap = new Map<string, string>();
  for (const ref of SECURITY_REFERENCES) {
    const record = await prisma.securityReference.upsert({
      where: {
        referenceType_identifier: {
          referenceType: ref.referenceType,
          identifier: ref.identifier,
        },
      },
      update: { name: ref.name, description: ref.description, url: ref.url },
      create: ref,
    });
    refMap.set(`${ref.referenceType}:${ref.identifier}`, record.id);
  }
  console.log(`✅ Seeded ${refMap.size} security references.`);

  // ----------------------------------------------------
  // 2. Seed Users
  // ----------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@websec.ctf' },
    update: {
      avatarUrl: '/avatars/anime-cyber-male-01.jpg',
    },
    create: {
      username: 'admin',
      email: 'admin@websec.ctf',
      passwordHash: hashPassword('AdminSecurePass2026!'),
      role: UserRole.ADMIN,
      avatarUrl: '/avatars/anime-cyber-male-01.jpg',
      totalPoints: 1200,
      isActive: true,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@websec.ctf' },
    update: {
      avatarUrl: '/avatars/anime-matrix-hacker-01.jpg',
      totalPoints: 0,
    },
    create: {
      username: 'student_hacker',
      email: 'student@websec.ctf',
      passwordHash: hashPassword('StudentPass2026!'),
      role: UserRole.USER,
      avatarUrl: '/avatars/anime-matrix-hacker-01.jpg',
      totalPoints: 0,
      isActive: true,
    },
  });
  console.log(`✅ Seeded users: ${adminUser.username} (ADMIN), ${studentUser.username} (USER).`);

  // ----------------------------------------------------
  // 3. Seed Exactly 5 Security Categories
  // ----------------------------------------------------
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES_DATA) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ Seeded exactly ${categoryMap.size} security categories.`);

  // Clean up any old prototype challenges not in the 50 challenges catalog
  const activeSlugs = new Set(ALL_50_CHALLENGES.map((c) => c.slug));
  const oldChallenges = await prisma.challenge.findMany({
    where: { slug: { notIn: Array.from(activeSlugs) } },
    select: { id: true, slug: true },
  });

  if (oldChallenges.length > 0) {
    console.log(`🧹 Removing ${oldChallenges.length} outdated prototype challenges...`);
    for (const old of oldChallenges) {
      await prisma.challenge.delete({ where: { id: old.id } });
    }
  }

  // Clean up any old unused categories
  const activeCategorySlugs = new Set(CATEGORIES_DATA.map((c) => c.slug));
  const oldCategories = await prisma.category.findMany({
    where: { slug: { notIn: Array.from(activeCategorySlugs) } },
    include: { _count: { select: { challenges: true } } },
  });

  for (const oldCat of oldCategories) {
    if (oldCat._count.challenges === 0) {
      await prisma.category.delete({ where: { id: oldCat.id } });
    }
  }

  // ----------------------------------------------------
  // 4. Seed All 50 Challenges
  // ----------------------------------------------------
  console.log(`🚀 Seeding all 50 challenges across 5 categories...`);
  let challengeCount = 0;
  let hintCount = 0;

  for (const c of ALL_50_CHALLENGES) {
    const categoryId = categoryMap.get(c.categorySlug);
    if (!categoryId) {
      console.warn(`⚠️ Warning: Category ${c.categorySlug} not found for challenge ${c.slug}`);
      continue;
    }

    // Upsert challenge
    const challenge = await prisma.challenge.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        description: c.description,
        instructions: c.instructions,
        difficulty: c.difficulty,
        points: c.points,
        status: c.status,
        objectives: c.objectives,
        categoryId: categoryId,
      },
      create: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        instructions: c.instructions,
        difficulty: c.difficulty,
        points: c.points,
        status: c.status,
        objectives: c.objectives,
        categoryId: categoryId,
      },
    });
    challengeCount++;

    // Upsert Flag (secure SHA-256 hash)
    const flagHash = hashFlag(c.flag);
    const existingFlag = await prisma.challengeFlag.findFirst({
      where: { challengeId: challenge.id },
    });
    if (existingFlag) {
      await prisma.challengeFlag.update({
        where: { id: existingFlag.id },
        data: {
          flagHash: flagHash,
          flagPrefix: 'WEBSEC{',
          isCaseSensitive: true,
          isActive: true,
        },
      });
    } else {
      await prisma.challengeFlag.create({
        data: {
          challengeId: challenge.id,
          flagHash: flagHash,
          flagPrefix: 'WEBSEC{',
          isCaseSensitive: true,
          isActive: true,
        },
      });
    }

    // Upsert 3 Progressive Hints
    for (const h of c.hints) {
      await prisma.hint.upsert({
        where: {
          challengeId_order: {
            challengeId: challenge.id,
            order: h.order,
          },
        },
        update: { title: h.title, content: h.content, costPoints: h.costPoints },
        create: {
          challengeId: challenge.id,
          title: h.title,
          content: h.content,
          costPoints: h.costPoints,
          order: h.order,
        },
      });
      hintCount++;
    }

    // Connect Security References
    for (const refKey of c.references) {
      const refId = refMap.get(refKey);
      if (refId) {
        await prisma.challengeReference.upsert({
          where: {
            challengeId_referenceId: {
              challengeId: challenge.id,
              referenceId: refId,
            },
          },
          update: {},
          create: {
            challengeId: challenge.id,
            referenceId: refId,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded exactly ${challengeCount} challenges with ${hintCount} progressive hints.`);

  // ----------------------------------------------------
  // 5. Seed All 50 Security Knowledge Lessons
  // ----------------------------------------------------
  console.log(`📚 Seeding all 50 Security Knowledge Lessons matching challenges 1:1...`);
  let lessonCount = 0;

  for (const l of ALL_50_LESSONS) {
    const challenge = await prisma.challenge.findUnique({
      where: { slug: l.challengeSlug },
      select: { id: true },
    });

    if (!challenge) {
      console.warn(`⚠️ Warning: Challenge ${l.challengeSlug} not found for lesson ${l.slug}`);
      continue;
    }

    await prisma.knowledgeLesson.upsert({
      where: { challengeId: challenge.id },
      update: {
        title: l.title,
        slug: l.slug,
        description: l.description,
        category: l.category,
        difficulty: l.difficulty,
        owaspReference: l.owaspReference,
        cweReference: l.cweReference,
        cvssScore: l.cvssScore,
        status: l.status || ChallengeStatus.PUBLISHED,
        overview: l.overview,
        rootCause: l.rootCause,
        mechanics: l.mechanics,
        attackScenario: l.attackScenario,
        securityImpact: l.securityImpact,
        prevention: l.prevention,
        vulnerableCode: l.vulnerableCode,
        secureCode: l.secureCode,
        codeLanguage: l.codeLanguage,
        realWorldExample: l.realWorldExample,
        referencesJson: JSON.stringify(l.references),
        keyTakeaways: l.keyTakeaways,
      },
      create: {
        challengeId: challenge.id,
        title: l.title,
        slug: l.slug,
        description: l.description,
        category: l.category,
        difficulty: l.difficulty,
        owaspReference: l.owaspReference,
        cweReference: l.cweReference,
        cvssScore: l.cvssScore,
        status: l.status || ChallengeStatus.PUBLISHED,
        overview: l.overview,
        rootCause: l.rootCause,
        mechanics: l.mechanics,
        attackScenario: l.attackScenario,
        securityImpact: l.securityImpact,
        prevention: l.prevention,
        vulnerableCode: l.vulnerableCode,
        secureCode: l.secureCode,
        codeLanguage: l.codeLanguage,
        realWorldExample: l.realWorldExample,
        referencesJson: JSON.stringify(l.references),
        keyTakeaways: l.keyTakeaways,
      },
    });
    lessonCount++;
  }
  console.log(`✅ Seeded exactly ${lessonCount} comprehensive security knowledge lessons.`);

  // ----------------------------------------------------
  // 6. Clean Slate: All student/player accounts start at 0 points & 0 solves
  // ----------------------------------------------------
  await prisma.user.updateMany({
    where: { role: UserRole.USER },
    data: { totalPoints: 0 },
  });

  console.log('🎉 WebSec CTF 50-Challenge database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
