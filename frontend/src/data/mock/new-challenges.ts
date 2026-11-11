import { Challenge } from '@/types';

export const newMockChallengesBatch1: Challenge[] = [
  {
    id: 'ch-idor-01',
    title: 'Invoice Vault',
    slug: 'invoice-vault',
    category: 'Insecure Direct Object Reference (IDOR)',
    difficulty: 'Medium',
    points: 200,
    owaspReference: 'A01:2021-Broken Access Control',
    cweReference: 'CWE-639',
    shortDescription:
      'Enumerate sequential numeric invoice identifiers in an enterprise billing portal to uncover executive payment records.',
    instructions:
      'Inspect invoice endpoint parameters and traverse sequential numeric identifiers to access restricted administrative invoices.',
    objectives:
      'Locate executive invoice notes and extract the confidential payment validation flag.',
    solved: false,
    solvedCount: 142,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['IDOR', 'Billing', 'CWE-639', 'NumericID'],
  },
  {
    id: 'ch-idor-02',
    title: 'Ghost Patient',
    slug: 'ghost-patient',
    category: 'Insecure Direct Object Reference (IDOR)',
    difficulty: 'Hard',
    points: 350,
    owaspReference: 'A01:2021-Broken Access Control',
    cweReference: 'CWE-639',
    shortDescription:
      'Bypass attending physician access controls on hospital clinic patient records through identifier leakage and HTTP verb tampering.',
    instructions:
      'Discover leaked patient UUIDs and test alternative HTTP methods (PUT/PATCH) against restricted patient endpoints.',
    objectives:
      'Extract confidential clinical notes containing the dynamic flag by bypassing verb-restricted authorization.',
    solved: false,
    solvedCount: 88,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['IDOR', 'VerbTampering', 'Healthcare', 'UUID', 'CWE-639'],
  },
  {
    id: 'ch-ssrf-01',
    title: 'Link Preview',
    slug: 'link-preview',
    category: 'Server-Side Request Forgery (SSRF)',
    difficulty: 'Medium',
    points: 200,
    owaspReference: 'A10:2021-Server-Side Request Forgery (SSRF)',
    cweReference: 'CWE-918',
    shortDescription:
      'Abuse an automated social card preview fetcher to probe internal loopback services and extract secret cluster tokens.',
    instructions:
      'Submit internal loopback addresses on port 8080 to the URL preview endpoint to exfiltrate internal cluster management data.',
    objectives:
      'Achieve basic SSRF to reach internal services and capture the cluster administration flag.',
    solved: false,
    solvedCount: 165,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['SSRF', 'OpenGraph', 'Loopback', 'CWE-918'],
  },
  {
    id: 'ch-ssrf-02',
    title: 'Metadata Maze',
    slug: 'metadata-maze',
    category: 'Server-Side Request Forgery (SSRF)',
    difficulty: 'Hard',
    points: 375,
    owaspReference: 'A10:2021-Server-Side Request Forgery (SSRF)',
    cweReference: 'CWE-918',
    shortDescription:
      'Evade WAF loopback blocklists using alternative IP encodings to query cloud instance metadata and exfiltrate IAM role credentials.',
    instructions:
      'Analyze the URL blocklist and use decimal, hex, or cloud metadata addressing to access simulated cloud metadata.',
    objectives:
      'Bypass WAF filters to reach 169.254.169.254 and exfiltrate temporary IAM role security credentials.',
    solved: false,
    solvedCount: 64,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['SSRF', 'CloudMetadata', 'WAFBypass', 'IAM', 'CWE-918'],
  },
];
