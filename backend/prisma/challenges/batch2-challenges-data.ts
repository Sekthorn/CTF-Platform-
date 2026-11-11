import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { ChallengeSeedData } from '../challenges-data';

export const NEW_BATCH2_CHALLENGES: ChallengeSeedData[] = [
  // =========================================================================
  // CATEGORY 8: Command Injection
  // =========================================================================
  {
    title: 'Ping Pong',
    slug: 'ping-pong',
    categorySlug: 'command-injection',
    difficulty: ChallengeDifficulty.MEDIUM,
    points: 150,
    status: ChallengeStatus.PUBLISHED,
    description:
      'A network diagnostics utility allows engineers to test remote host reachability via ICMP echo requests. Input parameters are concatenated into a system shell command without sanitization. Chain commands to locate and read the confidential flag.',
    instructions:
      'Analyze the ping tool endpoint and inject standard command chaining operators (; && | ||) to inspect directory contents and read the flag.',
    objectives:
      'Exploit basic command injection through shell chaining operators in a simulated sandbox environment.',
    flag: 'WEBSEC{ping_pong_command_injection_chaining_mastered_2026}',
    hints: [
      {
        title: 'Command Chaining',
        content:
          'Standard command separators like semicolon (;), logical AND (&&), or pipe (|) allow executing a second command following the ping.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Flag Extraction',
        content:
          'Pass 127.0.0.1; cat flag.txt or 8.8.8.8 && cat /flag.txt in the host parameter to dump the flag.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A03:2021', 'CWE:CWE-78', 'OWASP_WSTG:WSTG-INPV-12'],
  },
  {
    title: 'Log Cruncher',
    slug: 'log-cruncher',
    categorySlug: 'command-injection',
    difficulty: ChallengeDifficulty.HARD,
    points: 350,
    status: ChallengeStatus.PUBLISHED,
    description:
      'An enterprise log aggregation utility queries system event logs based on user search criteria. A security filter strictly prohibits semicolons and standard whitespace characters. Formulate a command injection payload bypassing these constraints to read flag.txt.',
    instructions:
      'Analyze the input filtering rules and utilize shell environment variables ($IFS) and subshell operators ($(cat...)) to bypass whitespace and semicolon filters.',
    objectives:
      'Bypass restrictive command injection character filters utilizing shell environment variables and subshell substitution.',
    flag: 'WEBSEC{log_cruncher_command_injection_ifs_subshell_bypass_2026}',
    hints: [
      {
        title: 'Whitespace Bypass',
        content:
          'Unix shells utilize the Internal Field Separator environment variable ($IFS or ${IFS}) as whitespace.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Semicolon Bypass',
        content:
          'Instead of semicolon, use command substitution $(cat${IFS}flag.txt) or pipe (|) or double pipe (||) to execute the command.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A03:2021', 'CWE:CWE-78', 'OWASP_WSTG:WSTG-INPV-12'],
  },

  // =========================================================================
  // CATEGORY 9: JSON Web Token (JWT)
  // =========================================================================
  {
    title: 'Token Trouble',
    slug: 'token-trouble',
    categorySlug: 'jwt',
    difficulty: ChallengeDifficulty.MEDIUM,
    points: 200,
    status: ChallengeStatus.PUBLISHED,
    description:
      'An employee portal authenticates users using JSON Web Tokens (JWT). The signature verification module trusts client-specified algorithms and accepts unsigned tokens when the algorithm header is modified. Forge an administrator token to unlock the executive vault.',
    instructions:
      'Inspect the sample guest token, alter the role claim to "admin", and change the algorithm header to "none" with an empty signature.',
    objectives:
      'Exploit the alg:none cryptographic downgrade vulnerability to forge elevated administrative tokens.',
    flag: 'WEBSEC{token_trouble_jwt_alg_none_privilege_escalation_2026}',
    hints: [
      {
        title: 'Algorithm Header Downgrade',
        content:
          'JWT headers contain {"alg": "HS256"}. Modifying alg to "none" instructs vulnerable libraries to skip signature verification.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Token Formulation',
        content:
          'Encode base64url({"alg":"none","typ":"JWT"}).base64url({"role":"admin",...}). (note the trailing period with empty signature) and pass via Bearer header.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A02:2021', 'CWE:CWE-347', 'OWASP_WSTG:WSTG-CRYP-04'],
  },
  {
    title: 'Key Confusion',
    slug: 'key-confusion',
    categorySlug: 'jwt',
    difficulty: ChallengeDifficulty.HARD,
    points: 400,
    status: ChallengeStatus.PUBLISHED,
    description:
      'An enterprise cloud dashboard verifies asymmetric RS256 JWT tokens using an RSA public key published at /.well-known/jwks.json. When the algorithm header is swapped to symmetric HS256, the server mistakenly verifies the signature using the public key as the HMAC secret.',
    instructions:
      'Retrieve the public RSA key from the well-known JWKS endpoint, craft an admin token with alg: HS256, and sign it using HMAC-SHA256 with the public key as the secret.',
    objectives:
      'Execute an asymmetric-to-symmetric key confusion attack (RS256 to HS256) to sign arbitrary administrative tokens.',
    flag: 'WEBSEC{key_confusion_rs256_to_hs256_public_key_forged_2026}',
    hints: [
      {
        title: 'Public Key Extraction',
        content:
          'Query /.well-known/jwks.json to obtain the public key PEM string used by the identity provider.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Key Confusion Signing',
        content:
          'Change alg to "HS256", set role to "admin", and compute the HMAC-SHA256 signature using the exact public key string as your shared HMAC secret.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A02:2021', 'CWE:CWE-327', 'OWASP_WSTG:WSTG-CRYP-04'],
  },
];
