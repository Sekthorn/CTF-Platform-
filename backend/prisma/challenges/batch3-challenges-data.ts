import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { ChallengeSeedData } from '../challenges-data';

export const NEW_BATCH3_CHALLENGES: ChallengeSeedData[] = [
  // =========================================================================
  // CATEGORY 10: Business Logic Vulnerabilities
  // =========================================================================
  {
    title: 'Flash Sale',
    slug: 'flash-sale',
    categorySlug: 'business-logic',
    difficulty: ChallengeDifficulty.MEDIUM,
    points: 200,
    status: ChallengeStatus.PUBLISHED,
    description:
      'An e-commerce flash sale storefront permits users to purchase cyber merchandise. The exclusive Golden Flag Token costs $1,337.00, but your starting balance is only $50.00. Exploit flawed numerical validation or client-side pricing logic to acquire the flag item.',
    instructions:
      'Inspect the checkout JSON payload sent to /api/checkout. Test negative quantities or price tampering parameters to reduce the total order cost to within your $50 budget.',
    objectives:
      'Exploit business logic quantity manipulation and price tampering to purchase high-value items without sufficient funds.',
    flag: 'WEBSEC{flash_sale_business_logic_price_tampering_mastered_2026}',
    hints: [
      {
        title: 'Negative Quantity Arithmetic',
        content:
          'If you buy 1 Golden Flag Token ($1337) and a negative quantity of T-shirts (-66 * $20 = -$1320), the math offsets the grand total to $17.00.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Price Override',
        content:
          'Alternatively, pass {"id":"item-999","quantity":1,"price":0} in the checkout array to test if the server trusts client-provided unit prices.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A04:2021', 'CWE:CWE-840', 'OWASP_WSTG:WSTG-BUSL-01'],
  },
  {
    title: 'Double Spend',
    slug: 'double-spend',
    categorySlug: 'business-logic',
    difficulty: ChallengeDifficulty.HARD,
    points: 375,
    status: ChallengeStatus.PUBLISHED,
    description:
      'A rewards platform issues single-use promotional vouchers worth 50 credits each. The executive vault pass requires 100 credits. A concurrency race condition between the database check and update permits redeeming the voucher multiple times simultaneously.',
    instructions:
      'Analyze the coupon redemption API. Send concurrent, parallel HTTP requests with tools like curl --parallel, Turbo Intruder, or a Python script to double-spend the voucher.',
    objectives:
      'Exploit a Time-of-Check to Time-of-Use (TOCTOU) concurrency race condition to double-spend single-use coupons and buy the vault pass.',
    flag: 'WEBSEC{double_spend_race_condition_toctou_parallel_mastered_2026}',
    hints: [
      {
        title: 'Concurrency Window',
        content:
          'The promo code PROMO-2026-BONUS has an asynchronous delay between checking if it was used and updating the wallet.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Parallel Request Execution',
        content:
          'Send 5 to 10 parallel requests to /api/wallet/redeem-coupon at the exact same millisecond using curl --parallel or a script, then purchase /api/wallet/redeem-reward.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A04:2021', 'CWE:CWE-362', 'OWASP_WSTG:WSTG-BUSL-03'],
  },

  // =========================================================================
  // CATEGORY 11: Insecure Deserialization
  // =========================================================================
  {
    title: 'Cookie Monster',
    slug: 'cookie-monster',
    categorySlug: 'insecure-deserialization',
    difficulty: ChallengeDifficulty.MEDIUM,
    points: 200,
    status: ChallengeStatus.PUBLISHED,
    description:
      'An enterprise portal tracks user session state using a base64-encoded serialized cookie. The backend deserializes the cookie object without verifying an integrity signature. Modify the serialized object properties to elevate your session to administrator.',
    instructions:
      'Capture and base64-decode the session_data cookie. Change the isAdmin property from false to true (or b:0 to b:1), re-encode, and refresh the dashboard.',
    objectives:
      'Exploit insecure object deserialization in session cookies to escalate privileges to administrator.',
    flag: 'WEBSEC{cookie_monster_insecure_deserialization_isadmin_escalated_2026}',
    hints: [
      {
        title: 'Cookie Inspection',
        content:
          'Examine the session_data cookie in your browser DevTools or curl output. It decodes from Base64 into a serialized JSON or object structure.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Tampering the Payload',
        content:
          'Set {"username":"admin","role":"admin","isAdmin":true}, base64-encode it, and send it as the session_data cookie or in X-Session-Data header.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A08:2021', 'CWE:CWE-502', 'OWASP_WSTG:WSTG-ATHZ-02'],
  },
  {
    title: 'Object Lessons',
    slug: 'object-lessons',
    categorySlug: 'insecure-deserialization',
    difficulty: ChallengeDifficulty.HARD,
    points: 400,
    status: ChallengeStatus.PUBLISHED,
    description:
      'An automated diagnostic telemetry service ingests serialized diagnostic objects into a sandboxed runtime. By formulating an object payload that instantiates the FileReaderGadget class, trigger magic method execution to read /flag.txt from the virtual filesystem.',
    instructions:
      'Inspect the supported telemetry classes and craft a serialized payload with class: "FileReaderGadget" and target file "flag.txt" to trigger simulated gadget execution.',
    objectives:
      'Formulate an insecure deserialization gadget chain in a simulated sandbox runtime to read restricted system files.',
    flag: 'WEBSEC{object_lessons_deserialization_gadget_chain_sandbox_conquered_2026}',
    hints: [
      {
        title: 'Class Enumeration',
        content:
          'Query /api/analytics/ingest to inspect the supported class list: TelemetryLogger, MetricAggregator, and FileReaderGadget.',
        costPoints: 0,
        order: 1,
      },
      {
        title: 'Gadget Payload',
        content:
          'Submit a base64 payload containing {"class":"FileReaderGadget","filePath":"flag.txt"} or {"action":"read","target":"flag.txt"}.',
        costPoints: 10,
        order: 2,
      },
    ],
    references: ['OWASP_TOP_10:A08:2021', 'CWE:CWE-502', 'OWASP_WSTG:WSTG-INPV-12'],
  },
];
