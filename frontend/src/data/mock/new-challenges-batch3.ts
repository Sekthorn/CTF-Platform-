import { Challenge } from '@/types';

export const newMockChallengesBatch3: Challenge[] = [
  {
    id: 'ch-busl-01',
    title: 'Flash Sale',
    slug: 'flash-sale',
    category: 'Business Logic Vulnerabilities',
    difficulty: 'Medium',
    points: 200,
    owaspReference: 'A04:2021-Insecure Design',
    cweReference: 'CWE-840',
    shortDescription:
      'Exploit negative quantity arithmetic and client price tampering in a shopping cart to purchase the VIP flag item.',
    instructions:
      'Inspect the checkout payload and send negative item quantities or price overrides to balance the order total to under $50.',
    objectives:
      'Bypass business logic data validation to purchase the $1,337 golden flag token within a $50 balance.',
    solved: false,
    solvedCount: 128,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['BusinessLogic', 'PriceTampering', 'NegativeQuantity', 'CWE-840'],
  },
  {
    id: 'ch-busl-02',
    title: 'Double Spend',
    slug: 'double-spend',
    category: 'Business Logic Vulnerabilities',
    difficulty: 'Hard',
    points: 375,
    owaspReference: 'A04:2021-Insecure Design',
    cweReference: 'CWE-362',
    shortDescription:
      'Exploit a Time-of-Check to Time-of-Use (TOCTOU) concurrency race condition on single-use vouchers using parallel requests.',
    instructions:
      'Send concurrent HTTP requests using curl --parallel or a script to redeem the promo voucher multiple times simultaneously.',
    objectives:
      'Achieve a concurrency race condition, elevate wallet balance to 100+ credits, and purchase the executive vault pass.',
    solved: false,
    solvedCount: 47,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['BusinessLogic', 'RaceCondition', 'TOCTOU', 'ParallelRequests', 'CWE-362'],
  },
  {
    id: 'ch-deser-01',
    title: 'Cookie Monster',
    slug: 'cookie-monster',
    category: 'Insecure Deserialization',
    difficulty: 'Medium',
    points: 200,
    owaspReference: 'A08:2021-Software and Data Integrity Failures',
    cweReference: 'CWE-502',
    shortDescription:
      'Decode, modify, and re-encode a serialized session cookie to elevate user privileges to administrator.',
    instructions:
      'Capture the session_data cookie, decode from Base64, change isAdmin from false to true, and refresh the dashboard.',
    objectives:
      'Exploit insecure object deserialization in session cookies to gain root administrator access.',
    solved: false,
    solvedCount: 140,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['Deserialization', 'Cookies', 'PrivilegeEscalation', 'CWE-502'],
  },
  {
    id: 'ch-deser-02',
    title: 'Object Lessons',
    slug: 'object-lessons',
    category: 'Insecure Deserialization',
    difficulty: 'Hard',
    points: 400,
    owaspReference: 'A08:2021-Software and Data Integrity Failures',
    cweReference: 'CWE-502',
    shortDescription:
      'Formulate a gadget chain payload in a simulated object-oriented runtime to invoke file reading magic methods.',
    instructions:
      'Inspect supported classes and submit a serialized payload that instantiates FileReaderGadget targeting flag.txt.',
    objectives:
      'Trigger simulated gadget execution in a sandboxed deserializer to read restricted system files.',
    solved: false,
    solvedCount: 36,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['Deserialization', 'GadgetChain', 'MagicMethods', 'CWE-502'],
  },
];
