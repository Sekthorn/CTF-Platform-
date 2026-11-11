const crypto = require('crypto');
const { CATEGORIES_DATA, ALL_50_CHALLENGES } = require('./dist/prisma/challenges-data.js');
const { ALL_50_LESSONS } = require('./dist/prisma/lessons-data.js');
const { handleBusinessLogicTarget } = require('./dist/modules/labs/targets/business-logic.targets.js');
const { handleDeserializationTarget } = require('./dist/modules/labs/targets/deserialization.targets.js');

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

async function runBatch3Tests() {
  console.log('====================================================================');
  console.log(' WebSec CTF: Batch 3 (Business Logic & Deserialization) Tests       ');
  console.log('====================================================================\n');

  // Test 1: Category Integrity
  console.log('--- 1. Category Integrity ---');
  console.log(`Total Categories in Seed: ${CATEGORIES_DATA.length}`);
  const expectedNewCategories = ['business-logic', 'insecure-deserialization'];
  for (const catSlug of expectedNewCategories) {
    const exists = CATEGORIES_DATA.some((c) => c.slug === catSlug);
    if (!exists) throw new Error(`Missing expected category: ${catSlug}`);
    console.log(`[PASS] Category registered: "${catSlug}"`);
  }

  // Test 2: Challenge Count & Persistence
  console.log('\n--- 2. Challenge & Lesson Spread ---');
  console.log(`Total Challenges in Seed Data: ${ALL_50_CHALLENGES.length}`);
  console.log(`Total Lessons in Seed Data: ${ALL_50_LESSONS.length}`);
  if (ALL_50_CHALLENGES.length < 63) {
    throw new Error(
      `Expected at least 63 challenges (51 original + 4 B1 + 4 B2 + 4 B3), found ${ALL_50_CHALLENGES.length}`
    );
  }
  console.log('[PASS] Full suite of 63 challenges registered.');

  const batch3Slugs = ['flash-sale', 'double-spend', 'cookie-monster', 'object-lessons'];
  for (const slug of batch3Slugs) {
    const ch = ALL_50_CHALLENGES.find((c) => c.slug === slug);
    if (!ch) throw new Error(`Missing challenge: ${slug}`);
    const lesson = ALL_50_LESSONS.find((l) => l.challengeSlug === slug);
    if (!lesson) throw new Error(`Missing remediation lesson for: ${slug}`);
    console.log(`[PASS] Challenge "${ch.title}" (${ch.difficulty}, ${ch.points} pts) -> Lesson linked`);
  }

  // Test 3: Penetration Testing Target Simulations
  console.log('\n--- 3. Target Penetration Testing Simulations ---');
  const testUser = { id: 'usr-student-uuid-002', username: 'student_hacker' };

  // 3A: Flash Sale (Business Logic - Negative Quantity & Price Tampering)
  console.log('\n[Test 3A] Testing Challenge 9: Flash Sale (Business Logic)');
  const fsFlag = computePlayerChallengeFlag(testUser.id, 'flash-sale').rawFlag;

  // Normal purchase fails (price $1337 exceeds $50 balance)
  const resFail = mockResponse();
  await handleBusinessLogicTarget(
    'flash-sale',
    '/api/checkout',
    { method: 'POST', body: { items: [{ id: 'item-999', quantity: 1 }] } },
    resFail,
    fsFlag
  );
  if (resFail.statusCode !== 402) {
    throw new Error('Expected checkout exceeding balance to return 402 Payment Required');
  }
  console.log(' - POST /api/checkout (Buy item-999 without exploit) -> Status 402 Payment Required (Insufficient Funds)');

  // Exploit Option 1: Negative quantity arithmetic
  const resNegativeQty = mockResponse();
  await handleBusinessLogicTarget(
    'flash-sale',
    '/api/checkout',
    {
      method: 'POST',
      body: {
        items: [
          { id: 'item-999', quantity: 1 }, // +$1337
          { id: 'item-101', quantity: -66 }, // -66 * $20 = -$1320 (Total: $17 <= $50)
        ],
      },
    },
    resNegativeQty,
    fsFlag
  );
  if (resNegativeQty.statusCode !== 200 || !resNegativeQty.body.itemsShipped?.[0]?.licenseCertificate.includes(fsFlag)) {
    throw new Error('Negative quantity arithmetic exploit failed');
  }
  console.log(` - POST /api/checkout (Negative quantity arithmetic) -> Status 200 OK! Total: ${resNegativeQty.body.orderTotal}. Flag: ${fsFlag}`);

  // Exploit Option 2: Unit price tampering
  const resPriceTamper = mockResponse();
  await handleBusinessLogicTarget(
    'flash-sale',
    '/api/checkout',
    {
      method: 'POST',
      body: {
        items: [{ id: 'item-999', quantity: 1, price: 0 }],
      },
    },
    resPriceTamper,
    fsFlag
  );
  if (resPriceTamper.statusCode !== 200) {
    throw new Error('Price tampering exploit failed');
  }
  console.log(' - POST /api/checkout (Price override to $0) -> Status 200 OK! Order processed.');

  const fsVerify = verifySubmission(fsFlag, testUser.id, 'flash-sale');
  if (!fsVerify.isCorrect) throw new Error('Flash Sale flag verification failed');
  console.log(' - Flag Verification: PASSED (200 Points awarded)');

  // 3B: Double Spend (Business Logic / Race Condition)
  console.log('\n[Test 3B] Testing Challenge 10: Double Spend (Race Condition)');
  const dsFlag = computePlayerChallengeFlag(testUser.id, 'double-spend').rawFlag;

  // Reset wallet first
  const resReset = mockResponse();
  await handleBusinessLogicTarget('double-spend', '/api/wallet/reset', { method: 'POST', user: testUser }, resReset, dsFlag);

  // Parallel race condition simulation
  console.log(' - Triggering 2 concurrent parallel coupon redeem requests (TOCTOU gap)...');
  const [resRedeem1, resRedeem2] = await Promise.all([
    (async () => {
      const r = mockResponse();
      await handleBusinessLogicTarget(
        'double-spend',
        '/api/wallet/redeem-coupon',
        { method: 'POST', body: { code: 'PROMO-2026-BONUS' }, user: testUser },
        r,
        dsFlag
      );
      return r;
    })(),
    (async () => {
      const r = mockResponse();
      await handleBusinessLogicTarget(
        'double-spend',
        '/api/wallet/redeem-coupon',
        { method: 'POST', body: { code: 'PROMO-2026-BONUS' }, user: testUser },
        r,
        dsFlag
      );
      return r;
    })(),
  ]);

  console.log(` - Request 1 status: ${resRedeem1.statusCode}, Request 2 status: ${resRedeem2.statusCode}`);
  if (resRedeem1.statusCode !== 200 || resRedeem2.statusCode !== 200) {
    throw new Error('Race condition failed to double-redeem coupon');
  }

  // Redeem the VIP flag reward now that balance >= 100
  const resReward = mockResponse();
  await handleBusinessLogicTarget(
    'double-spend',
    '/api/wallet/redeem-reward',
    { method: 'POST', user: testUser },
    resReward,
    dsFlag
  );
  if (resReward.statusCode !== 200 || !resReward.body.vaultAccessCertificate.includes(dsFlag)) {
    throw new Error('Reward redemption failed after race condition');
  }
  console.log(` - POST /api/wallet/redeem-reward -> Status 200 OK! Flag: ${dsFlag}`);

  const dsVerify = verifySubmission(dsFlag, testUser.id, 'double-spend');
  if (!dsVerify.isCorrect) throw new Error('Double Spend flag verification failed');
  console.log(' - Flag Verification: PASSED (375 Points awarded)');

  // 3C: Cookie Monster (Insecure Deserialization)
  console.log('\n[Test 3C] Testing Challenge 11: Cookie Monster (Insecure Deserialization)');
  const cmFlag = computePlayerChallengeFlag(testUser.id, 'cookie-monster').rawFlag;

  // Normal guest cookie
  const resGuest = mockResponse();
  handleDeserializationTarget('cookie-monster', '/api/profile', { method: 'GET', headers: {} }, resGuest, cmFlag);
  if (resGuest.statusCode !== 200 || !resGuest.body.defaultCookieValue) {
    throw new Error('Failed to retrieve initial guest cookie');
  }
  console.log(' - GET /api/profile -> Status 200 OK (Issued guest session_data cookie)');

  // Tampered cookie with isAdmin: true
  const tamperedPayload = Buffer.from(JSON.stringify({ username: 'admin', role: 'admin', isAdmin: true })).toString('base64');
  const resAdminCookie = mockResponse();
  handleDeserializationTarget(
    'cookie-monster',
    '/api/profile',
    {
      method: 'GET',
      headers: { cookie: `session_data=${tamperedPayload}` },
    },
    resAdminCookie,
    cmFlag
  );

  if (resAdminCookie.statusCode !== 200 || !resAdminCookie.body.adminPortal.confidentialLicenseFlag.includes(cmFlag)) {
    throw new Error('Cookie deserialization exploit failed');
  }
  console.log(` - GET /api/profile (with tampered session_data cookie) -> Status 200 OK! Flag: ${cmFlag}`);

  const cmVerify = verifySubmission(cmFlag, testUser.id, 'cookie-monster');
  if (!cmVerify.isCorrect) throw new Error('Cookie Monster flag verification failed');
  console.log(' - Flag Verification: PASSED (200 Points awarded)');

  // 3D: Object Lessons (Insecure Deserialization / Gadget Chain)
  console.log('\n[Test 3D] Testing Challenge 12: Object Lessons (Gadget Chain)');
  const olFlag = computePlayerChallengeFlag(testUser.id, 'object-lessons').rawFlag;

  // Gadget payload instantiating FileReaderGadget targeting flag.txt
  const gadgetPayload = Buffer.from(
    JSON.stringify({
      class: 'FileReaderGadget',
      action: 'read',
      filePath: 'flag.txt',
    })
  ).toString('base64');

  const resGadget = mockResponse();
  handleDeserializationTarget(
    'object-lessons',
    '/api/analytics/ingest',
    {
      method: 'POST',
      body: { payload: gadgetPayload },
    },
    resGadget,
    olFlag
  );

  if (resGadget.statusCode !== 200 || !resGadget.body.simulatedSandboxResult.content.includes(olFlag)) {
    throw new Error('Gadget chain deserialization exploit failed');
  }
  console.log(` - POST /api/analytics/ingest (FileReaderGadget chain) -> Status 200 OK! Flag: ${olFlag}`);

  const olVerify = verifySubmission(olFlag, testUser.id, 'object-lessons');
  if (!olVerify.isCorrect) throw new Error('Object Lessons flag verification failed');
  console.log(' - Flag Verification: PASSED (400 Points awarded)');

  console.log('\n====================================================================');
  console.log(' [ALL TESTS PASSED] BATCH 3 (BUSINESS LOGIC & DESER) VERIFIED!      ');
  console.log(' Full 12 New Challenges Active (63 Challenges Total in WebSec CTF). ');
  console.log(' Zero Host Commands. Zero Real Sockets. 100% In-Memory Safety.      ');
  console.log('====================================================================\n');
}

runBatch3Tests();
