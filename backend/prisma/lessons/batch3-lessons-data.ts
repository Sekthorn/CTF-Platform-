import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from '../lessons-data';

export const NEW_BATCH3_LESSONS: LessonSeedData[] = [
  // 9. Flash Sale
  {
    challengeSlug: 'flash-sale',
    title: 'Business Logic Flaws: Quantity Manipulation & Price Tampering',
    slug: 'business-logic-flash-sale-remediation',
    description: 'Learn how missing numerical validation on item quantities and trusting client-provided prices causes catastrophic financial logic bypasses.',
    category: 'Business Logic Vulnerabilities',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'A04:2021-Insecure Design',
    cweReference: 'CWE-840',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Business logic flaws occur when an application\'s design permits users to manipulate operational workflows in ways that violate intended rules, such as purchasing expensive items using negative quantities or overriding product prices.',
    rootCause: 'Failing to assert that quantity is an integer >= 1, and relying on client-supplied price parameters rather than authoritative server-side price tables.',
    mechanics: 'An attacker submits a negative quantity for a cheaper item (e.g. quantity: -66 of a $20 item = -$1,320). When summed with a $1,337 luxury item, the total drops to $17, allowing an account with only $50 to complete the transaction.',
    attackScenario: 'In an e-commerce checkout API, an attacker modifies the checkout cart JSON to include negative item quantities or {"price": 0}. The server processes the arithmetic, accepts the payment, and marks the goods as paid and shipped.',
    securityImpact: 'Unauthorized acquisition of merchandise, financial losses, inventory distortion, and arbitrary credit generation.',
    prevention: 'Always retrieve product prices exclusively from database records on the server. Validate that quantities are strictly positive integers (quantity >= 1 and quantity <= MAX_LIMIT).',
    vulnerableCode: `// VULNERABLE: Client supplies price and unvalidated quantity
app.post('/api/checkout', (req, res) => {
  let total = 0;
  for (const item of req.body.items) {
    // Trusts item.price from client and permits negative item.quantity!
    total += item.price * item.quantity;
  }
  if (user.balance >= total) {
    user.balance -= total;
    shipItems(req.body.items);
  }
});`,
    secureCode: `// SECURE: Authoritative database prices & strict quantity validation
app.post('/api/checkout', async (req, res) => {
  let total = 0;
  for (const cartItem of req.body.items) {
    // 1. Enforce strictly positive integers
    const qty = parseInt(cartItem.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) return res.status(400).json({ error: 'Invalid quantity' });
    
    // 2. Authoritative price lookup from database (ignore client price)
    const product = await prisma.product.findUnique({ where: { id: cartItem.id } });
    if (!product) return res.status(404).json({ error: 'Item not found' });
    total += product.price * qty;
  }
  if (user.balance < total) return res.status(402).json({ error: 'Insufficient funds' });
  // Process atomic payment
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'A cryptocurrency exchange permitted negative withdrawal amounts, which inverted the arithmetic and credited the attacker\'s wallet with millions of tokens.',
    references: [
      { title: 'OWASP Business Logic Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/10-Business_Logic_Testing/01-Test_Business_Logic_Data_Validation' },
      { title: 'CWE-840: Business Logic Errors', url: 'https://cwe.mitre.org/data/definitions/840.html' }
    ],
    keyTakeaways: 'Never trust client-supplied prices or numerical parameters. Enforce server-side authoritative pricing and strict positive bounds checking.'
  },

  // 10. Double Spend
  {
    challengeSlug: 'double-spend',
    title: 'Concurrency Race Conditions & Double-Spending Vulnerabilities',
    slug: 'business-logic-double-spend-race-condition',
    description: 'Understand how Time-of-Check to Time-of-Use (TOCTOU) concurrency race conditions allow single-use coupons to be claimed multiple times.',
    category: 'Business Logic Vulnerabilities',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'A04:2021-Insecure Design',
    cweReference: 'CWE-362',
    cvssScore: 8.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'A concurrency race condition occurs when two or more operations must execute in a sequence, but the application context allows parallel threads or requests to interleave unpredictably. This enables attackers to "double-spend" single-use vouchers, transfers, or gift cards.',
    rootCause: 'Time-of-Check to Time-of-Use (TOCTOU) gap: The application checks if a voucher has been redeemed, performs asynchronous I/O, and only later marks it as redeemed.',
    mechanics: 'By sending multiple HTTP requests simultaneously within milliseconds, all parallel requests execute the "is redeemed?" check before any of them sets "redeemed = true", causing the credit to be added multiple times.',
    attackScenario: 'A player has a single-use $50 promo voucher. Using curl --parallel, they send 10 concurrent redemption requests. 2 or 3 requests succeed simultaneously, elevating the wallet balance to $100+ and allowing them to buy the exclusive vault flag.',
    securityImpact: 'Unauthorized duplication of currency, double redemption of gift cards, stock overselling, and financial asset drainage.',
    prevention: 'Use database-level atomic operations, mutexes, distributed Redis locks (Redlock), or optimistic/pessimistic locking (SELECT FOR UPDATE) within database transactions.',
    vulnerableCode: `// VULNERABLE: Non-atomic check and update (TOCTOU race condition)
app.post('/api/redeem', async (req, res) => {
  const coupon = await db.findCoupon(req.body.code);
  if (coupon.isRedeemed) return res.status(400).send('Already used');
  
  // Non-atomic async gap! Parallel requests arrive here before isRedeemed is set!
  await sleep(50);
  
  await db.addCredits(user.id, coupon.value);
  await db.markRedeemed(coupon.id);
});`,
    secureCode: `// SECURE: Atomic conditional update at database level
app.post('/api/redeem', async (req, res) => {
  // Atomic query: updates only if isRedeemed is false in a single transaction
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.coupon.updateMany({
      where: { code: req.body.code, isRedeemed: false },
      data: { isRedeemed: true, redeemedAt: new Date() }
    });
    if (updated.count === 0) throw new Error('Coupon already redeemed or invalid');
    return await tx.wallet.update({
      where: { userId: user.id },
      data: { balance: { increment: 50 } }
    });
  });
  res.json({ newBalance: result.balance });
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major financial and gaming platform incidents where concurrent API requests allowed users to redeem rewards and transfer balances repeatedly.',
    references: [
      { title: 'PortSwigger Race Conditions Research', url: 'https://portswigger.net/research/smashing-the-state-machine' },
      { title: 'CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization', url: 'https://cwe.mitre.org/data/definitions/362.html' }
    ],
    keyTakeaways: 'Never separate state verification from state mutation. Use atomic database transactions and conditional updates.'
  },

  // 11. Cookie Monster
  {
    challengeSlug: 'cookie-monster',
    title: 'Insecure Object Deserialization in Session Cookies',
    slug: 'deserialization-cookie-monster-remediation',
    description: 'Learn why storing serialized objects in unauthenticated client-side cookies enables arbitrary privilege escalation.',
    category: 'Insecure Deserialization',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'A08:2021-Software and Data Integrity Failures',
    cweReference: 'CWE-502',
    cvssScore: 8.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Insecure Deserialization occurs when untrusted user input is directly deserialized into application runtime objects without cryptographic signing or structural integrity verification.',
    rootCause: 'The server trusts base64-encoded cookie payloads submitted by the client, deserializes them directly, and uses the resulting object properties (e.g. isAdmin: true) to make authorization decisions.',
    mechanics: 'An attacker captures their session cookie, decodes it from base64, edits the serialized properties (setting "isAdmin": true), re-encodes, and sends it back in the Cookie header to obtain root administrator privileges.',
    attackScenario: 'A web portal stores user state in cookie session_data. The cookie decodes to {"username":"guest","isAdmin":false}. An attacker changes isAdmin to true, refreshes the page, and the server grants access to the secret administrative vault.',
    securityImpact: 'Complete privilege escalation, authentication bypass, and unauthorized administrative access.',
    prevention: 'Never store authorization state in unsigned client cookies. Store session state server-side in a database or Redis, or sign cookies with HMAC (e.g., using signed-cookies or express-session with strong secrets).',
    vulnerableCode: `// VULNERABLE: Direct deserialization of client-supplied cookie
app.get('/api/profile', (req, res) => {
  const cookie = req.cookies.session_data;
  const rawJson = Buffer.from(cookie, 'base64').toString('utf8');
  const user = JSON.parse(rawJson); // Unauthenticated client data trusted!
  if (user.isAdmin) {
    res.json({ secret: 'ADMIN_VAULT_FLAG' });
  }
});`,
    secureCode: `// SECURE: Cryptographically signed cookies / server-side session
import cookieParser from 'cookie-parser';
app.use(cookieParser(SERVER_COOKIE_SECRET));

app.get('/api/profile', async (req, res) => {
  const sessionId = req.signedCookies.sessionId;
  if (!sessionId) return res.status(401).json({ error: 'Invalid session' });
  // Authoritative server-side database lookup
  const user = await db.getUserBySession(sessionId);
  if (user.role === 'ADMIN') {
    res.json({ secret: 'ADMIN_VAULT_FLAG' });
  }
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Numerous web frameworks historically stored serialized session state in cookies, resulting in critical remote code execution and administrative takeover vulnerabilities.',
    references: [
      { title: 'OWASP Deserialization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html' },
      { title: 'CWE-502: Deserialization of Untrusted Data', url: 'https://cwe.mitre.org/data/definitions/502.html' }
    ],
    keyTakeaways: 'Treat all client-supplied cookies as untrusted. Use cryptographically signed session tokens and store privilege state strictly on the server.'
  },

  // 12. Object Lessons
  {
    challengeSlug: 'object-lessons',
    title: 'Insecure Deserialization & Gadget Chain Execution',
    slug: 'deserialization-object-lessons-gadget-chains',
    description: 'Explore how object instantiation and magic method execution during deserialization allow attackers to construct lethal gadget chains.',
    category: 'Insecure Deserialization',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'A08:2021-Software and Data Integrity Failures',
    cweReference: 'CWE-502',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Object-oriented deserialization parsers often trigger automatic "magic methods" (such as __destruct, __wakeup, or readObject) upon instantiating serialized objects. Attackers chain these existing application classes ("gadgets") together to execute arbitrary file operations or code execution.',
    rootCause: 'Deserializing arbitrary class definitions from untrusted inputs without a strict class allowlist or type enforcement.',
    mechanics: 'An attacker crafts a serialized payload specifying an existing application gadget class (such as FileReaderGadget) and targets restricted system files. When the deserializer reconstructs the object, its cleanup or initialization methods execute automatically.',
    attackScenario: 'A telemetry service accepts serialized objects. An attacker crafts a payload specifying {"class":"FileReaderGadget","filePath":"flag.txt"}. When deserialized, the runtime invokes the object\'s destructor method, reading and leaking the flag.',
    securityImpact: 'Remote code execution (RCE), arbitrary file reading, denial of service, and full server compromise.',
    prevention: 'Do not accept complex serialized objects from untrusted sources. Use safe data interchange formats (standard JSON) instead of native object serialization. When serialization is unavoidable, enforce strict class allowlists.',
    vulnerableCode: `// VULNERABLE: Native object deserialization invoking arbitrary classes
app.post('/api/analytics', (req, res) => {
  const raw = Buffer.from(req.body.payload, 'base64').toString();
  // In native runtimes, deserialize() automatically invokes magic methods
  const obj = nativeDeserialize(raw); // Instantiates arbitrary gadget classes!
  res.json({ status: 'Ingested' });
});`,
    secureCode: `// SECURE: Restrict data interchange strictly to primitive JSON schemas
import Ajv from 'ajv';
const ajv = new Ajv();
const schema = {
  type: 'object',
  properties: {
    metric: { type: 'string' },
    value: { type: 'number' }
  },
  required: ['metric', 'value'],
  additionalProperties: false // Prohibits unexpected object structures
};

app.post('/api/analytics', (req, res) => {
  const valid = ajv.validate(schema, req.body);
  if (!valid) return res.status(400).json({ error: 'Schema validation failed' });
  // Process pure primitive data safely
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Apache Commons Collections (Java) and PHPGGC demonstrated how universal gadget chains turn simple deserialization endpoints into instant remote code execution.',
    references: [
      { title: 'OWASP Deserialization Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html' }
    ],
    keyTakeaways: 'Never use native object serialization for public APIs. Stick strictly to flat, validated JSON schemas with zero class instantiation.'
  }
];
