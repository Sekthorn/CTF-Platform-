import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { ChallengeSeedData } from '../challenges-data';

export const NEW_BATCH1_CHALLENGES: ChallengeSeedData[] = [
  // =========================================================================
  // CATEGORY 6: Insecure Direct Object Reference (IDOR)
  // =========================================================================
  {
    title: 'Invoice Vault',
    slug: 'invoice-vault',
    categorySlug: 'idor',
    difficulty: ChallengeDifficulty.MEDIUM,
    points: 200,
    status: ChallengeStatus.PUBLISHED,
    description:
      'A corporate billing portal allows contractors to view their issued invoices. Sequential numeric invoice identifiers are exposed directly in the API parameters without tenant boundary enforcement. Locate the executive invoice to recover the flag.',
    instructions:
      'Inspect how the billing portal requests your invoices. Enumerate invoice identifiers to discover administrative billing notes.',
    objectives:
      'Exploit horizontal and vertical IDOR to access unlinked administrative invoices and exfiltrate confidential billing records.',
    flag: 'WEBSEC{invoice_vault_idor_sequential_numeric_2026}',
    hints: [
      {
        title: 'Numeric Sequence',
        content:
          'Your invoices are numbered sequentially (1001, 1002, 1003). Look for lower or nearby numbers in the sequence.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Target Record',
        content:
          'Request invoice ID 1000 directly via /api/invoices/1000 or the ?id= parameter to inspect the administrator payment notes.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A01:2021', 'CWE:CWE-639', 'OWASP_WSTG:WSTG-ATHZ-04'],
  },
  {
    title: 'Ghost Patient',
    slug: 'ghost-patient',
    categorySlug: 'idor',
    difficulty: ChallengeDifficulty.HARD,
    points: 350,
    status: ChallengeStatus.PUBLISHED,
    description:
      'A hospital clinic portal protects individual patient records using cryptographically generated UUIDs. An auxiliary directory leaks patient identifiers, and while GET requests enforce attending physician authorization, alternative HTTP methods omit access validation.',
    instructions:
      'Discover leaked patient UUIDs from public directory endpoints and test alternative HTTP methods against protected records to bypass authorization.',
    objectives:
      'Combine identifier leakage with HTTP method tampering to bypass authorization schemas and read confidential medical notes.',
    flag: 'WEBSEC{ghost_patient_idor_verb_tampering_bypass_2026}',
    hints: [
      {
        title: 'Identifier Discovery',
        content:
          'Inspect /api/patients/directory to uncover registered patient UUIDs including restricted VIP records.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Verb Tampering',
        content:
          'GET requests are blocked by the clearance check. Use PUT, PATCH, or DELETE with Burp Suite or curl to trigger the insecure record handler.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A01:2021', 'CWE:CWE-639', 'OWASP_WSTG:WSTG-ATHZ-02'],
  },

  // =========================================================================
  // CATEGORY 7: Server-Side Request Forgery (SSRF)
  // =========================================================================
  {
    title: 'Link Preview',
    slug: 'link-preview',
    categorySlug: 'ssrf',
    difficulty: ChallengeDifficulty.MEDIUM,
    points: 200,
    status: ChallengeStatus.PUBLISHED,
    description:
      'A social media card generation service generates OpenGraph previews for user-submitted URLs. The backend fetches submitted links directly from the server without validating target hostnames or IP ranges, exposing internal cluster microservices.',
    instructions:
      'Provide internal loopback addresses to the link preview generator to inspect internal daemon responses and retrieve secret tokens.',
    objectives:
      'Leverage basic Server-Side Request Forgery (SSRF) to scan internal loopback interfaces and access administrative services on port 8080.',
    flag: 'WEBSEC{link_preview_ssrf_internal_loopback_captured_2026}',
    hints: [
      {
        title: 'Internal Target',
        content:
          'The target application is running an internal administrative service on loopback port 8080.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Payload Formulation',
        content:
          'Submit http://127.0.0.1:8080/admin or http://localhost:8080/admin as the url parameter to fetch internal cluster secrets.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A10:2021', 'CWE:CWE-918', 'OWASP_WSTG:WSTG-INPV-19'],
  },
  {
    title: 'Metadata Maze',
    slug: 'metadata-maze',
    categorySlug: 'ssrf',
    difficulty: ChallengeDifficulty.HARD,
    points: 375,
    status: ChallengeStatus.PUBLISHED,
    description:
      'A cloud asset ingestion pipeline fetches remote media assets. The security team implemented a WAF blocklist prohibiting standard loopback terms like localhost and 127.0.0.1. Bypass the filter to reach the simulated cloud metadata endpoint and exfiltrate IAM credentials.',
    instructions:
      'Analyze the URL blocklist filtering behavior. Utilize alternative IP encodings (decimal, hex, octal, or cloud metadata addressing) to bypass the filter.',
    objectives:
      'Bypass WAF loopback blocklists using alternative IP notations and extract IAM role security credentials from simulated cloud metadata.',
    flag: 'WEBSEC{metadata_maze_ssrf_cloud_credentials_extracted_2026}',
    hints: [
      {
        title: 'Cloud Metadata Addressing',
        content:
          'Cloud infrastructure exposes instance metadata at 169.254.169.254. Check if direct access or alternative IP representations pass the WAF.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Alternative IP Encodings',
        content:
          'Convert 169.254.169.254 to decimal (2852039166), hex (0xa9fea9fe), or request http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A10:2021', 'CWE:CWE-918', 'OWASP_WSTG:WSTG-INPV-19'],
  },
];
