import { Challenge } from '@/types';

export const newMockChallengesBatch2: Challenge[] = [
  {
    id: 'ch-cmd-01',
    title: 'Ping Pong',
    slug: 'ping-pong',
    category: 'Command Injection',
    difficulty: 'Medium',
    points: 150,
    owaspReference: 'A03:2021-Injection',
    cweReference: 'CWE-78',
    shortDescription:
      'Inject standard command chaining operators into a network ping utility to read simulated system files.',
    instructions:
      'Identify how user input is passed to the ping diagnostic tool and append command separators (; && |) to locate flag.txt.',
    objectives:
      'Exploit basic command injection in a safe simulated runtime to extract the diagnostic flag.',
    solved: false,
    solvedCount: 110,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['CommandInjection', 'Ping', 'ShellChaining', 'CWE-78'],
  },
  {
    id: 'ch-cmd-02',
    title: 'Log Cruncher',
    slug: 'log-cruncher',
    category: 'Command Injection',
    difficulty: 'Hard',
    points: 350,
    owaspReference: 'A03:2021-Injection',
    cweReference: 'CWE-78',
    shortDescription:
      'Bypass WAF filters prohibiting semicolons and whitespace by using shell environment variables ($IFS) and subshells.',
    instructions:
      'Formulate a command injection payload using $IFS and command substitution ($(cat...)) to read flag.txt.',
    objectives:
      'Evade restrictive character filters in a simulated shell environment and capture the log aggregation flag.',
    solved: false,
    solvedCount: 52,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['CommandInjection', 'WAFBypass', 'IFS', 'Subshell', 'CWE-78'],
  },
  {
    id: 'ch-jwt-01',
    title: 'Token Trouble',
    slug: 'token-trouble',
    category: 'JSON Web Token (JWT)',
    difficulty: 'Medium',
    points: 200,
    owaspReference: 'A02:2021-Cryptographic Failures',
    cweReference: 'CWE-347',
    shortDescription:
      'Exploit alg:none algorithm downgrade to forge an administrative JWT token without a valid signature.',
    instructions:
      'Obtain a guest token, modify the role to admin, and set alg to none with an empty signature.',
    objectives:
      'Bypass signature verification using algorithm downgrade to access the executive vault.',
    solved: false,
    solvedCount: 135,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['JWT', 'AlgNone', 'PrivilegeEscalation', 'CWE-347'],
  },
  {
    id: 'ch-jwt-02',
    title: 'Key Confusion',
    slug: 'key-confusion',
    category: 'JSON Web Token (JWT)',
    difficulty: 'Hard',
    points: 400,
    owaspReference: 'A02:2021-Cryptographic Failures',
    cweReference: 'CWE-327',
    shortDescription:
      'Exploit asymmetric RS256 to symmetric HS256 key confusion using an RSA public key from /.well-known/jwks.json.',
    instructions:
      'Harvest the public key from the JWKS endpoint, switch alg to HS256, and sign an admin token using the public key as HMAC secret.',
    objectives:
      'Forge valid administrative tokens through RS256/HS256 key confusion and unlock the cloud dashboard.',
    solved: false,
    solvedCount: 41,
    author: 'WebSec Core Team',
    createdAt: '2026-03-01',
    tags: ['JWT', 'KeyConfusion', 'RS256', 'HS256', 'JWKS', 'CWE-327'],
  },
];
