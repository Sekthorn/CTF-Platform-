import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from './auth-lessons';

export const API_LESSONS: LessonSeedData[] = [
  // -------------------------------------------------------------------------
  // 41. Debug Endpoint Disclosure
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'api-debug-endpoint-disclosure',
    title: 'Information Disclosure via Unprotected API Debug Endpoints',
    slug: 'api-debug-endpoint-disclosure-guide',
    description: 'Understand how forgotten internal test endpoints, swagger docs, and debug routes expose sensitive environmental credentials.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP API Security Top 10 API8:2023 – Security Misconfiguration',
    cweReference: 'CWE-200: Exposure of Sensitive Information to an Unauthorized Actor',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'During development, engineers frequently implement diagnostic, debugging, and profiling endpoints (such as `/api/debug/env`, `/api/health/full`, `/swagger`, or Spring Boot `/actuator/env`) to monitor internal application state. When applications are deployed to staging or production without disabling these endpoints or restricting them behind strict administrative authentication, attackers can query them to extract environment variables, API secrets, and encryption keys.',
    rootCause: 'Development and diagnostic controllers left active in production deployments without environment-specific guards or authentication barriers.',
    mechanics: '1. Reconnaissance: An attacker enumerates common debug routes: `/api/debug`, `/api/v1/diagnostics`, `/actuator`.\n2. Endpoint Response: The server exposes `/api/v1/debug/config` returning HTTP 200.\n3. Inspection: The JSON response dumps configuration dictionaries, including database connection strings, third-party API tokens, and secret flags.\n4. Exploitation: Attacker uses the disclosed secrets to achieve further lateral compromise.',
    attackScenario: 'GET /api/v1/debug/config HTTP/1.1\nHost: ctf.websec.internal\n\nResponse:\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "environment": "production",\n  "db": "mysql://user:pass@internal-db:3306",\n  "debug_key": "DEBUG_MASTER_KEY_2026",\n  "flag": "WEBSEC{debug_endpoint_env_disclosure_found}"\n}',
    securityImpact: 'Exposure of database passwords, API master keys, secret signing tokens, and infrastructure topology.',
    prevention: '1. Disable debug controllers and actuators in production builds via environment variable flags.\n2. Strip sensitive fields (`process.env.SECRET`) from diagnostic health checks.\n3. Implement network-level restrictions or VPN-only access for internal metrics endpoints.',
    vulnerableCode: `// Vulnerable: Debug controller exposed unconditionally in all environments
@Controller('api/v1/debug')
export class DebugController {
  @Get('config')
  getConfig() {
    // Dangerous: Dumps entire process.env to anyone who asks!
    return process.env;
  }
}`,
    secureCode: `// Remediated: Conditional registration and sanitization
@Controller('api/v1/health')
export class HealthController {
  @Get('status')
  getStatus() {
    // Only return safe, non-sensitive operational health signals
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Misconfigured Spring Boot Actuator endpoints (`/actuator/env`) have been responsible for hundreds of corporate cloud credential leaks where attackers retrieved AWS access keys directly from JSON responses.',
    references: [
      { title: 'OWASP API Security Top 10 API8:2023 Security Misconfiguration', url: 'https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/' },
      { title: 'CWE-200: Exposure of Sensitive Information', url: 'https://cwe.mitre.org/data/definitions/200.html' }
    ],
    keyTakeaways: '• Never expose debug or internal diagnostic endpoints to public internet traffic.\n• Disable development profiling tools in production environments.\n• Return only high-level status booleans in public health check endpoints.'
  },

  // -------------------------------------------------------------------------
  // 42. Missing API Authentication
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'missing-api-authentication',
    title: 'Missing Authentication on Internal Microservice & API Endpoints',
    slug: 'missing-api-authentication-guide',
    description: 'Learn how neglecting authentication guards on new or microservice API routes exposes sensitive business operations to anonymous access.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP API Security Top 10 API2:2023 – Broken Authentication',
    cweReference: 'CWE-306: Missing Authentication for Critical Function',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Missing API Authentication occurs when developers implement a REST or GraphQL endpoint to handle business logic, export reports, or update user records, but neglect to apply authentication middleware or security guards. Unlike traditional web applications where session guards are applied globally, microservice architectures often require explicit per-route guards. Unprotected routes can be accessed anonymously by anyone on the internet.',
    rootCause: 'Developers forgot to attach `@UseGuards(JwtAuthGuard)` to a newly implemented controller or assumed the API gateway was intercepting requests.',
    mechanics: '1. Endpoint Discovery: An attacker reviews client JavaScript or documentation and notices `/api/v1/reports/export`.\n2. Anonymous Request: Attacker sends a GET request without any `Authorization` header or cookie.\n3. Handler Execution: The backend router does not require authentication and immediately executes the export logic.\n4. Data Return: Confidential organizational reports and flag data are returned to the anonymous caller.',
    attackScenario: 'GET /api/v1/reports/export HTTP/1.1\nHost: ctf.websec.internal\n(No Authorization Header provided)\n\nResponse:\nHTTP/1.1 200 OK\n{\n  "reportId": "EXPORT-992",\n  "totalUsers": 1280,\n  "auditData": "WEBSEC{missing_api_auth_guard_exposed}"\n}',
    securityImpact: 'Unauthorized data exposure, unauthorized modification of records, and abuse of backend business logic.',
    prevention: '1. Enforce a "Deny by Default" global authentication guard across the entire NestJS application (`APP_GUARD`).\n2. Require developers to explicitly decorate public endpoints with `@Public()` rather than opting into authentication.\n3. Conduct automated CI/CD API security tests verifying that all unauthenticated calls receive HTTP 401.',
    vulnerableCode: `// Vulnerable: Controller lacks authentication guards entirely
@Controller('api/v1/reports')
export class ReportsController {
  @Get('export')
  async exportData() {
    // Flaw: Accessible anonymously by anyone!
    return this.reportsService.generateFullExport();
  }
}`,
    secureCode: `// Remediated: Global authentication guard with explicit opt-out decorator
// In app.module.ts:
// { provide: APP_GUARD, useClass: JwtAuthGuard }

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard) // Explicitly protected
export class ReportsController {
  @Get('export')
  async exportData(@Req() req: AuthenticatedRequest) {
    return this.reportsService.generateUserExport(req.user.id);
  }
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'A large cellular carrier suffered an API breach exposing the account PINs of millions of customers because an internal billing lookup API endpoint had no authentication middleware attached.',
    references: [
      { title: 'OWASP API Security Top 10 API2:2023 Broken Authentication', url: 'https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/' },
      { title: 'CWE-306: Missing Authentication for Critical Function', url: 'https://cwe.mitre.org/data/definitions/306.html' }
    ],
    keyTakeaways: '• Adopt a "Deny by Default" security model for all API endpoints.\n• Protect routes globally and use explicit decorators for public endpoints.\n• Regularly scan API routes with automated unauthorized-access tests.'
  },

  // -------------------------------------------------------------------------
  // 43. Mass Assignment Privilege Escalation
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'mass-assignment-privilege-escalation',
    title: 'Mass Assignment (Over-Posting) in API Entity Persistence',
    slug: 'mass-assignment-privilege-escalation-guide',
    description: 'Learn how modern ORMs and REST APIs allow attackers to overwrite sensitive entity attributes (isAdmin, balance, role) via extra JSON fields.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP API Security Top 10 API3:2023 – Broken Object Property Level Authorization',
    cweReference: 'CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes',
    cvssScore: 8.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Mass Assignment occurs when an API endpoint binds incoming JSON request payloads directly to backend data models without filtering allowed properties. Attackers inspect or guess internal model properties (such as `isAdmin`, `role`, `verified`, or `accountBalance`) and include them in ordinary update requests (e.g., updating user settings), tricking the ORM into updating restricted database columns.',
    rootCause: 'Passing untyped request bodies directly to database operations (`db.user.update({ data: req.body })`) instead of whitelisting permitted fields.',
    mechanics: '1. Normal Request: User updates profile: `PATCH /api/user/settings` with `{"theme": "dark"}`.\n2. Model Guessing: Attacker adds sensitive attributes: `{"theme": "dark", "isVerified": true, "role": "ADMIN"}`.\n3. Automatic Binding: The ORM matches `role` to the database column and writes the value.\n4. Verification: Attacker now possesses full administrative privileges.',
    attackScenario: 'PATCH /api/user/settings HTTP/1.1\nContent-Type: application/json\n\n{\n  "theme": "dark",\n  "role": "ADMIN",\n  "credits": 999999\n}\n\nResponse:\nHTTP/1.1 200 OK\n{\n  "id": "usr_102",\n  "role": "ADMIN",\n  "credits": 999999,\n  "flag": "WEBSEC{mass_assignment_model_binding_success}"\n}',
    securityImpact: 'Unauthorized vertical privilege escalation, balance manipulation, and account verification bypass.',
    prevention: '1. Use strict Data Transfer Objects (DTOs) with class-validator and NestJS `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.\n2. Never pass `req.body` directly to database update or create methods.\n3. Explicitly select which properties are copied into the database entity.',
    vulnerableCode: `// Vulnerable: Blindly binds request body to database update
@Patch('settings')
async updateSettings(@Req() req: AuthenticatedRequest, @Body() data: any) {
  // Flaw: data may contain { role: 'ADMIN', credits: 1000000 }
  return this.prisma.user.update({
    where: { id: req.user.id },
    data,
  });
}`,
    secureCode: `// Remediated: Explicit DTO and property whitelisting
export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}

@Patch('settings')
async updateSettings(
  @Req() req: AuthenticatedRequest,
  @Body() dto: UpdateSettingsDto,
) {
  return this.prisma.user.update({
    where: { id: req.user.id },
    data: {
      theme: dto.theme,
      notificationsEnabled: dto.notificationsEnabled,
    },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2012, security researcher Egor Homakov demonstrated mass assignment against GitHub\'s public key form, allowing him to push an unauthorized commit directly to the Ruby on Rails master repository.',
    references: [
      { title: 'OWASP API Security Top 10 API3:2023 Broken Object Property Level Authorization', url: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/' },
      { title: 'CWE-915: Mass Assignment', url: 'https://cwe.mitre.org/data/definitions/915.html' }
    ],
    keyTakeaways: '• Never pass raw request payloads directly to database ORM methods.\n• Use DTOs with strict validation pipes that strip or reject unexpected fields.\n• Isolate administrative property changes to dedicated admin endpoints.'
  },

  // -------------------------------------------------------------------------
  // 44. Excessive Data Exposure
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'excessive-data-exposure-api',
    title: 'Excessive Data Exposure: Over-Fetching in API Responses',
    slug: 'excessive-data-exposure-api-guide',
    description: 'Examine how returning entire database records in API JSON responses exposes confidential fields relying on frontend filtering.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP API Security Top 10 API3:2023 – Broken Object Property Level Authorization',
    cweReference: 'CWE-213: Exposure of Sensitive Information Due to Incompatible Policies',
    cvssScore: 6.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Excessive Data Exposure occurs when an API endpoint returns full database objects or internal models (including password hashes, reset tokens, internal flags, or social security numbers) in its JSON response, relying on client-side frontend code to filter out or ignore the sensitive properties before rendering the user interface. Attackers easily inspect the raw network response to view the confidential data.',
    rootCause: 'Developers serialized full database entities directly into API responses without using projection, serializers, or data transfer objects.',
    mechanics: '1. UI Observation: A user directory shows only `Name` and `Department` for staff members.\n2. Network Inspection: Attacker inspects DevTools Network tab for `GET /api/users`.\n3. Payload Inspection: The JSON response contains full database rows: `passwordHash`, `twoFactorSecret`, and `secretNotes`.\n4. Secret Extraction: Attacker extracts the administrative recovery key and flag.',
    attackScenario: 'GET /api/users HTTP/1.1\n\nResponse:\nHTTP/1.1 200 OK\n[\n  {\n    "id": "1",\n    "name": "Admin",\n    "department": "Security",\n    "internalFlag": "WEBSEC{excessive_data_exposure_json_response_filtered}",\n    "passwordHash": "$2b$12$..."\n  }\n]',
    securityImpact: 'Leakage of sensitive PII, authentication hashes, recovery secrets, and business intelligence.',
    prevention: '1. Use Prisma `select` or `omit` to explicitly define which fields are fetched and returned.\n2. Use class-transformer with `@Exclude()` on sensitive entity properties.\n3. Never rely on frontend client code to filter out sensitive API properties.',
    vulnerableCode: `// Vulnerable: Returns complete database entity without projection
@Get('users')
async getUsers() {
  // Disastrous: Fetches and returns all columns including passwordHash and internalFlag!
  return this.prisma.user.findMany();
}`,
    secureCode: `// Remediated: Explicit field projection
@Get('users')
async getUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      username: true,
      department: true,
      createdAt: true,
      // Notice: passwordHash, flag, and secret tokens are completely omitted
    },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'A prominent dating app leaked exact GPS coordinates and device identifiers for millions of users because its API returned complete profile JSON objects while the mobile app only displayed photos and names.',
    references: [
      { title: 'OWASP API Security Top 10 Excessive Data Exposure', url: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/' },
      { title: 'CWE-213: Exposure of Sensitive Information', url: 'https://cwe.mitre.org/data/definitions/213.html' }
    ],
    keyTakeaways: '• Frontend code filtering does NOT protect data sent over the network.\n• Use server-side projections (Prisma select) to fetch only required fields.\n• Strip sensitive attributes before returning API responses.'
  },

  // -------------------------------------------------------------------------
  // 45. Basic SSRF to Loopback Service
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'basic-ssrf-loopback-service',
    title: 'Server-Side Request Forgery (SSRF) to Loopback & Localhost Services',
    slug: 'basic-ssrf-loopback-guide',
    description: 'Learn how user-supplied URL fetching features allow attackers to make HTTP requests from the server to internal loopback interfaces (127.0.0.1).',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A10:2021 – Server-Side Request Forgery (SSRF)',
    cweReference: 'CWE-918: Server-Side Request Forgery (SSRF)',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Server-Side Request Forgery (SSRF) occurs when a web application fetches a remote resource (such as a URL for an image preview, webhook, or website screenshot) based on user input without validating the target destination. An attacker can supply loopback addresses (such as `http://127.0.0.1:8080` or `http://localhost:6379`) to coerce the server into sending requests to internal, non-internet-facing management ports and microservices.',
    rootCause: 'The server invoked HTTP client libraries (e.g., `axios.get(userUrl)`) directly on user-supplied URLs without checking whether the destination resolves to private or loopback IP ranges.',
    mechanics: '1. Identification: The application has a feature: `POST /api/preview` with `{"url": "https://example.com"}`.\n2. SSRF Formulation: The attacker inputs `{"url": "http://127.0.0.1:8080/admin/status"}`.\n3. Server Fetch: The server initiates an outbound request from its own network interface to localhost port 8080.\n4. Internal Trust: The internal management service trusts localhost connections and responds with administrative data.\n5. Reflection: The application returns the internal HTTP response back to the attacker.',
    attackScenario: 'POST /api/v1/fetch-url HTTP/1.1\nContent-Type: application/json\n\n{\n  "url": "http://127.0.0.1:9000/internal-metrics"\n}\n\nResponse:\nHTTP/1.1 200 OK\n{\n  "service": "Internal Flag Vault",\n  "status": "HEALTHY",\n  "secret_flag": "WEBSEC{basic_ssrf_loopback_service_accessed}"\n}',
    securityImpact: 'Access to internal administrative interfaces, port scanning of internal networks, and execution of internal commands.',
    prevention: '1. Use a strict domain allowlist for outbound fetches.\n2. Resolve domain names to IP addresses and verify that the target IP does NOT belong to loopback (`127.0.0.0/8`), private RFC 1918 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), or link-local ranges.\n3. Block requests to internal ports at the network and firewall layer.',
    vulnerableCode: `// Vulnerable: Fetches any user-supplied URL without destination validation
import axios from 'axios';

app.post('/api/fetch-url', async (req, res) => {
  const targetUrl = req.body.url;
  // Dangerous: Attacker can supply http://127.0.0.1:9000
  const response = await axios.get(targetUrl);
  res.send(response.data);
});`,
    secureCode: `// Remediated: IP resolution and private range verification
import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

async function safeFetchUrl(inputUrl: string): Promise<string> {
  const parsed = new URL(inputUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid protocol');
  }

  // Resolve hostname to IP
  const addresses = await dns.resolve4(parsed.hostname);
  const ip = ipaddr.parse(addresses[0]);

  // Block private and loopback address ranges
  const range = ip.range();
  if (['loopback', 'private', 'linkLocal'].includes(range)) {
    throw new Error('Access to private/loopback network blocked');
  }

  const response = await axios.get(inputUrl, { timeout: 3000 });
  return response.data;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major cloud breaches have occurred where SSRF in document converter features allowed attackers to query internal Redis instances and Kubernetes cluster services running on localhost.',
    references: [
      { title: 'OWASP Server-Side Request Forgery Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-918: Server-Side Request Forgery (SSRF)', url: 'https://cwe.mitre.org/data/definitions/918.html' }
    ],
    keyTakeaways: '• SSRF forces the server to act as a proxy into its own internal network.\n• Never trust URLs supplied in webhook, image, or preview features.\n• Resolve IP addresses and block loopback (`127.0.0.1`) and private RFC 1918 ranges.'
  },

  // -------------------------------------------------------------------------
  // 46. SSRF Cloud Metadata Exfiltration
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'ssrf-cloud-metadata-exfiltration',
    title: 'SSRF Cloud Metadata Service Exfiltration (AWS, GCP, Azure)',
    slug: 'ssrf-cloud-metadata-guide',
    description: 'Learn how SSRF vulnerabilities allow attackers to query cloud link-local metadata endpoints (169.254.169.254) to steal IAM credentials.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A10:2021 – Server-Side Request Forgery (SSRF)',
    cweReference: 'CWE-918: Server-Side Request Forgery (SSRF)',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Cloud providers (such as AWS, Google Cloud, and Microsoft Azure) provide an internal link-local Instance Metadata Service (IMDS) at IP address `169.254.169.254`. This service is accessible without authentication to instances running in the cloud. When a cloud-hosted application is vulnerable to SSRF, an attacker can coerce the server into requesting `http://169.254.169.254/latest/meta-data/iam/security-credentials/`, extracting temporary IAM role credentials that grant full cloud access.',
    rootCause: 'The server permitted outbound HTTP requests to the cloud link-local metadata IP address (`169.254.169.254`), and the cloud environment used legacy IMDSv1 without token header enforcement.',
    mechanics: '1. Endpoint Discovery: Application contains an avatar import from URL feature.\n2. Metadata Formulation: Attacker submits `http://169.254.169.254/latest/meta-data/iam/security-credentials/app-role`.\n3. Request Execution: The cloud instance queries the link-local metadata service.\n4. Extraction: The metadata service returns `AccessKeyId`, `SecretAccessKey`, `Token`, and system identity flags.\n5. Exploitation: Attacker configures AWS CLI with the stolen keys and takes over cloud resources.',
    attackScenario: 'POST /api/v1/import-avatar HTTP/1.1\nContent-Type: application/json\n\n{\n  "imageUrl": "http://169.254.169.254/latest/meta-data/identity-credentials/ec2/security-credentials/ec2-instance"\n}\n\nResponse:\n{\n  "AccessKeyId": "ASIAIOSFODNN7EXAMPLE",\n  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",\n  "Token": "WEBSEC{ssrf_cloud_metadata_imds_exfiltrated}"\n}',
    securityImpact: 'Full cloud infrastructure compromise, access to S3 buckets, databases, and lateral movement throughout corporate cloud accounts.',
    prevention: '1. Enforce IMDSv2 (requiring a `X-aws-ec2-metadata-token` session token header) on all cloud instances.\n2. Block requests to `169.254.169.254` at the host firewall level (`iptables` / Windows Defender Firewall).\n3. Strictly validate and restrict outbound IP addresses in code.',
    vulnerableCode: `// Vulnerable: Fetches remote images without filtering cloud link-local metadata
app.post('/api/import-avatar', async (req, res) => {
  const url = req.body.imageUrl;
  // Catastrophic in AWS/GCP: can query http://169.254.169.254!
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  res.type('image/png').send(response.data);
});`,
    secureCode: `// Remediated: Explicitly blocks link-local 169.254.169.254 and enforces IMDSv2
import ipaddr from 'ipaddr.js';

function isForbiddenIp(ipString: string): boolean {
  const addr = ipaddr.parse(ipString);
  // Block link-local addresses (169.254.0.0/16) and RFC1918
  return addr.range() === 'linkLocal' || addr.range() === 'private' || addr.range() === 'loopback';
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2019, the Capital One data breach compromised over 100 million customer credit records when an attacker exploited an SSRF vulnerability in a misconfigured WAF to query AWS metadata and steal IAM credentials.',
    references: [
      { title: 'AWS: Transitioning to IMDSv2', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html' },
      { title: 'OWASP SSRF Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' }
    ],
    keyTakeaways: '• Cloud metadata endpoints (`169.254.169.254`) hold temporary cloud credentials.\n• Always enforce IMDSv2 to require session token headers.\n• Block link-local addresses at both code and host network levels.'
  },

  // -------------------------------------------------------------------------
  // 47. BOPLA Property Tampering
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'bopla-property-tampering',
    title: 'Broken Object Property Level Authorization (BOPLA)',
    slug: 'bopla-property-tampering-guide',
    description: 'Learn how APIs that fail to restrict which specific properties a user is authorized to read or modify lead to property-level compromise.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP API Security Top 10 API3:2023 – Broken Object Property Level Authorization',
    cweReference: 'CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Broken Object Property Level Authorization (BOPLA) combines Mass Assignment and Excessive Data Exposure into a unified OWASP API 2023 category. It occurs when an API allows a user to access or manipulate specific properties of an object that they should not have access to, even though they are legitimately authorized to access the object itself (e.g., a student can update their bio, but cannot alter their grade or account credit balance).',
    rootCause: 'Lack of property-level access control rules in API endpoint handlers.',
    mechanics: '1. Identification: A user is authorized to edit their own profile: `PUT /api/user/profile`.\n2. Fuzzing: The user analyzes available properties on the user model.\n3. Tampering: The user includes `"subscriptionTier": "VIP_PREMIUM"` in their update payload.\n4. Execution: The server updates the profile and applies the privileged tier without verifying property authorization.\n5. Outcome: Free access to premium services and flags.',
    attackScenario: 'PUT /api/user/profile HTTP/1.1\nContent-Type: application/json\n\n{\n  "displayName": "Alex",\n  "subscriptionTier": "ENTERPRISE_VIP"\n}\n\nResponse:\nHTTP/1.1 200 OK\n{\n  "displayName": "Alex",\n  "subscriptionTier": "ENTERPRISE_VIP",\n  "status": "UPGRADED",\n  "flag": "WEBSEC{bopla_property_level_authorization_bypassed}"\n}',
    securityImpact: 'Unauthorized elevation of subscription tiers, modification of billing properties, and privilege alteration.',
    prevention: '1. Define explicit write-schemas (DTOs) for different user tiers.\n2. Validate that property changes match user permissions.\n3. Keep billing and subscription changes on dedicated administrative endpoints.',
    vulnerableCode: `// Vulnerable: Allows user to mutate any property on their profile
@Put('profile')
async updateProfile(@Req() req: AuthenticatedRequest, @Body() body: any) {
  // Allows user to change subscriptionTier, isStaff, balance!
  return this.prisma.user.update({
    where: { id: req.user.id },
    data: body,
  });
}`,
    secureCode: `// Remediated: Explicitly restricted editable properties
@Put('profile')
async updateProfile(
  @Req() req: AuthenticatedRequest,
  @Body() dto: UpdateUserProfileDto,
) {
  return this.prisma.user.update({
    where: { id: req.user.id },
    data: {
      displayName: dto.displayName,
      bio: dto.bio,
      // subscriptionTier is NOT editable here
    },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Ride-sharing apps have suffered from BOPLA vulnerabilities where drivers could update their own ratings or trip fares by including extra attributes in trip completion API calls.',
    references: [
      { title: 'OWASP API Security Top 10 API3:2023 BOPLA', url: 'https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/' },
      { title: 'CWE-915: Mass Assignment', url: 'https://cwe.mitre.org/data/definitions/915.html' }
    ],
    keyTakeaways: '• Having access to an object does not imply permission to edit all of its properties.\n• Restrict user-editable properties to explicit DTO fields.\n• Separate sensitive business properties into controlled administrative workflows.'
  },

  // -------------------------------------------------------------------------
  // 48. Jinja2 SSTI Secret Leak
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'jinja2-ssti-secret-leak',
    title: 'Server-Side Template Injection (SSTI) in Python Jinja2 / Flask',
    slug: 'jinja2-ssti-secret-leak-guide',
    description: 'Master the mechanics of Server-Side Template Injection where user input rendered inside template engines achieves remote code execution.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-1336: Improper Neutralization of Special Elements Used in a Template Engine',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Server-Side Template Injection (SSTI) occurs when user-supplied input is concatenated directly into a template string (such as Jinja2 in Python, Twig in PHP, or Freemarker in Java) rather than being passed into the template as a context variable. Because template engines treat the string as template code, attackers can inject template expressions (such as `{{7*7}}`) to evaluate code, leak configuration secrets, and traverse object hierarchies to execute operating system commands.',
    rootCause: 'The server compiled a template using dynamic string formatting (e.g., `render_template_string("Hello " + userInput)`) instead of passing `userInput` as a context parameter.',
    mechanics: '1. Probe: Attacker inputs `{{7*7}}` into a greeting form.\n2. Server Evaluation: The server renders `Hello 49`, confirming SSTI.\n3. Secret Inspection: Attacker inspects template globals: `{{config.items()}}` to leak Flask secret keys.\n4. MRO Traversal: Attacker traverses Python\'s Method Resolution Order: `{{\'\'.__class__.__mro__[1].__subclasses__()}}` to locate subprocess execution classes.\n5. Remote Code Execution: Attacker invokes `os.popen()` to execute commands and retrieve the flag.',
    attackScenario: 'GET /greet?name={{config}} HTTP/1.1\n\nResponse:\n<Config {\'SECRET_KEY\': \'flask_super_secret_key\', \'FLAG\': \'WEBSEC{jinja2_ssti_template_expression_evaluated}\'}>',
    securityImpact: 'Direct Remote Code Execution (RCE) on the server, disclosure of application configuration, and host compromise.',
    prevention: '1. Never concatenate user input into template strings: always pass user data as context variables: `render_template(\'greet.html\', name=user_input)`.\n2. Use sandboxed template environments (e.g. Jinja2 SandboxedEnvironment).\n3. Avoid rendering dynamic template strings on the fly.',
    vulnerableCode: `# Vulnerable Python/Flask: String formatting into template
from flask import Flask, request, render_template_string

app = Flask(__name__)

@app.route('/greet')
def greet():
    name = request.args.get('name', 'Guest')
    # Disastrous: String concatenation into template string allows SSTI!
    template = f"<h1>Welcome, {name}!</h1>"
    return render_template_string(template)`,
    secureCode: `# Remediated: Passes input as a context parameter
from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/greet')
def greet():
    name = request.args.get('name', 'Guest')
    # Safe: Input is treated strictly as data within the pre-compiled template
    return render_template('greet.html', name=name)

# In greet.html:
# <h1>Welcome, {{ name }}!</h1>`,
    codeLanguage: 'python',
    realWorldExample: 'SSTI vulnerabilities have been discovered in multiple enterprise wiki platforms, CMS frameworks, and email templating engines, frequently leading to full remote code execution.',
    references: [
      { title: 'PortSwigger: Server-Side Template Injection', url: 'https://portswigger.net/web-security/server-side-template-injection' },
      { title: 'CWE-1336: Template Engine Injection', url: 'https://cwe.mitre.org/data/definitions/1336.html' }
    ],
    keyTakeaways: '• Never format user strings directly into template definitions.\n• Always pass user data as context variables to pre-compiled templates.\n• `{{7*7}}` evaluating to `49` is the classic signature of SSTI.'
  },

  // -------------------------------------------------------------------------
  // 49. API Rate Limit Bypass via Header Spoofing
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'rate-limit-bypass-header-spoof',
    title: 'API Rate Limiting Bypass via IP Header Spoofing (X-Forwarded-For)',
    slug: 'rate-limit-bypass-header-spoof-guide',
    description: 'Learn how reverse proxy misconfigurations that trust client-supplied X-Forwarded-For headers allow attackers to bypass API throttling.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP API Security Top 10 API4:2023 – Unrestricted Resource Consumption',
    cweReference: 'CWE-770: Allocation of Resources Without Limits or Throttling',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'API Rate Limiting protects endpoints against brute-force attacks and resource exhaustion by tracking client request rates by IP address. However, when an application behind a reverse proxy naively trusts the incoming `X-Forwarded-For`, `X-Real-IP`, or `Client-IP` headers without verifying proxy trust, an attacker can rotate these headers on every request to spoof different client IPs, bypassing rate limiting completely.',
    rootCause: 'The server\'s rate limiting middleware used untrusted client-supplied HTTP headers (e.g. `req.headers[\'x-forwarded-for\']`) to determine the client\'s IP address.',
    mechanics: '1. Rate Limit Discovery: Attacker submits 5 rapid requests to `/api/auth/login` and receives HTTP 429 Too Many Requests.\n2. Header Injection: Attacker adds `X-Forwarded-For: 198.51.100.1` and retries.\n3. Reset: The server resets the rate counter because it views this as a new IP.\n4. Automation: The attacker automates requests, generating random IP addresses per request to conduct unlimited brute-force attacks.',
    attackScenario: 'Request 1:\nPOST /api/login HTTP/1.1\nX-Forwarded-For: 203.0.113.1\n\nRequest 2:\nPOST /api/login HTTP/1.1\nX-Forwarded-For: 203.0.113.2\n\nResult:\nThrottling bypassed! Flag retrieved: WEBSEC{rate_limit_bypass_x_forwarded_for_spoofed}',
    securityImpact: 'Unrestricted brute-force attacks against authentication, credential stuffing, and Denial of Service.',
    prevention: '1. Configure Express/NestJS `app.set(\'trust proxy\', true)` with an explicit whitelist of trusted proxy IP addresses (e.g., your Cloudflare or Nginx reverse proxy IPs).\n2. Strip untrusted `X-Forwarded-For` headers at your edge reverse proxy before forwarding requests to backends.\n3. Track rate limits by authenticated user ID or session token in addition to IP address.',
    vulnerableCode: `// Vulnerable: Blindly reads client IP from header without proxy trust
app.use((req, res, next) => {
  // Flaw: Attacker can supply arbitrary X-Forwarded-For headers!
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
});`,
    secureCode: `// Remediated: Express configured with explicit trusted reverse proxy IP
import rateLimit from 'express-rate-limit';

// Only trust the immediate reverse proxy (e.g. local Nginx container)
app.set('trust proxy', 'loopback');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Express-rate-limit safely parses req.ip according to trusted proxy settings
});

app.use('/api/auth/login', limiter);`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major password spraying campaigns across Microsoft 365 and banking APIs frequently randomize `X-Forwarded-For` headers to distribute brute-force attempts across thousands of virtual IPs.',
    references: [
      { title: 'OWASP API Security Top 10 API4:2023 Unrestricted Resource Consumption', url: 'https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/' },
      { title: 'Express.js Behind Proxies Guide', url: 'https://expressjs.com/en/guide/behind-proxies.html' }
    ],
    keyTakeaways: '• Clients can send arbitrary `X-Forwarded-For` headers.\n• Never trust forwarding headers unless validated by an explicit trusted reverse proxy.\n• Rate limit by user ID and session in addition to IP address.'
  },

  // -------------------------------------------------------------------------
  // 50. Multi-Stage API Exploitation Chain
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'multi-stage-api-exploitation-chain',
    title: 'Multi-Stage API Attack Chaining: From Recon to Complete Compromise',
    slug: 'multi-stage-api-exploitation-chain-guide',
    description: 'Synthesize full-spectrum API security knowledge by chaining information disclosure, IDOR, and mass assignment to conquer the ultimate CTF challenge.',
    category: 'api-security-server-side',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP API Security Top 10 – Multi-Vulnerability Chain',
    cweReference: 'CWE-699: Software Development Concepts (Compound Weakness)',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Real-world cybersecurity incidents rarely rely on a single isolated vulnerability. Instead, advanced adversaries chain multiple low- and medium-severity weaknesses into an end-to-end critical exploit chain: 1) Information disclosure to discover hidden administrative endpoints, 2) IDOR to hijack an elevated user token, 3) Mass assignment to escalate roles to superadministrator, and 4) Final command invocation to achieve full system compromise.',
    rootCause: 'Failure to apply Defense-in-Depth across multiple system boundaries, allowing attackers to leverage minor design flaws into catastrophic compromise.',
    mechanics: '1. Stage 1 (Recon): Attacker discovers `/api/v1/meta/internal-routes` revealing undocumented endpoints.\n2. Stage 2 (IDOR): Attacker exploits IDOR on `/api/v1/delegation/claim?id=500` to retrieve an executive invitation token.\n3. Stage 3 (Mass Assignment): Attacker submits registration with `{"role": "SYSTEM_ROOT", "mfaBypass": true}`.\n4. Stage 4 (Flag Capture): Attacker accesses `/api/v1/vault/ultimate-flag` with root privileges and extracts the final platform flag.',
    attackScenario: 'Step 1: Discover /api/v1/meta/routes\nStep 2: IDOR token extraction: GET /api/v1/tokens/claim?id=1\nStep 3: Elevate account: PATCH /api/v1/user/role with {"role": "ROOT"}\nStep 4: Ultimate Vault Access:\nGET /api/v1/vault/master-flag\n\nResponse:\nHTTP/1.1 200 OK\n{\n  "status": "VAULT_UNLOCKED",\n  "grand_master_flag": "WEBSEC{multi_stage_api_chain_complete_mastery_2026}"\n}',
    securityImpact: 'Complete system takeover, unauthorized access to all encrypted platform records, and full compromise of platform integrity.',
    prevention: '1. Defense-in-Depth: Secure every layer independently; assume outer layers will be breached.\n2. Apply strict API authentication, authorization, input validation, and output filtering across all routes.\n3. Maintain continuous security auditing, threat modeling, and automated penetration testing.',
    vulnerableCode: `// Vulnerable Architecture: Multiple unlinked weaknesses allowing chaining
// 1. Unprotected route documentation
app.get('/api/internal/routes', (req, res) => res.json(internalRouteManifest));

// 2. IDOR token claim
app.get('/api/token/:id', (req, res) => res.json(db.getToken(req.params.id)));

// 3. Unfiltered role assignment
app.patch('/api/profile', (req, res) => db.user.update(req.body));`,
    secureCode: `// Remediated: Comprehensive defense-in-depth across all tiers
@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HardenedPlatformController {
  // Routes are protected by default, strictly typed with DTOs,
  // database queries are scoped to req.user.id, and outputs are projected.
  @Get('vault/status')
  @Roles('SYSTEM_ROOT')
  async getVaultStatus(@Req() req: AuthenticatedRequest) {
    return this.vaultService.getSecureStatus(req.user.id);
  }
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Virtually all major modern breaches (including the Equifax, Uber, and SolarWinds incidents) involved attackers chaining multiple small configuration oversights and API flaws to achieve full organizational access.',
    references: [
      { title: 'OWASP API Security Project', url: 'https://owasp.org/www-project-api-security/' },
      { title: 'MITRE ATT&CK Enterprise Matrix', url: 'https://attack.mitre.org/' }
    ],
    keyTakeaways: '• Real-world attacks chain multiple smaller vulnerabilities together.\n• Defense-in-depth ensures that a failure in one layer does not compromise the entire system.\n• Continuous security auditing and strict access control are paramount.'
  }
];
