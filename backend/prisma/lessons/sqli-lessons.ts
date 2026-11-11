import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from './auth-lessons';

export const SQLI_LESSONS: LessonSeedData[] = [
  // -------------------------------------------------------------------------
  // 11. Classic Login Bypass
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'classic-login-bypass-sqli',
    title: 'Classic SQL Injection: Authentication Bypass via String Concatenation',
    slug: 'classic-login-bypass-sqli-guide',
    description: 'Learn how unsanitized string interpolation in SQL authentication queries allows attackers to bypass login without knowing passwords.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'SQL Injection (SQLi) occurs when untrusted user input is directly concatenated into a database query string instead of being passed as parameterized data. In authentication queries, an attacker can input SQL syntax (such as quotation marks, boolean logic operators `OR`, and comment delimiters `--`) to alter query logic, forcing the database to evaluate the query as TRUE regardless of the password supplied.',
    rootCause: 'The server constructs SQL statements using dynamic string concatenation (e.g. SELECT * FROM users WHERE username = "USER" AND password = "PASS") instead of parameterized prepared statements.',
    mechanics: '1. Input Formulation: The user submits username: `admin\' OR 1=1 -- -`.\n2. Query Rewriting: The server concatenates the string into: `SELECT * FROM users WHERE username = \'admin\' OR 1=1 -- -\' AND password = \'...\'`.\n3. Evaluation: The SQL parser evaluates the clause `username = \'admin\' OR 1=1` as TRUE. The comment characters `-- -` instruct the engine to discard the remaining password clause.\n4. Execution: The database returns the first row (the administrator record), granting immediate privileged login.',
    attackScenario: 'POST /api/v1/auth/login HTTP/1.1\nContent-Type: application/json\n\n{\n  "username": "admin\' OR 1=1 -- -",\n  "password": "anypassword"\n}\n\nGenerated Server Query:\nSELECT * FROM users WHERE username = \'admin\' OR 1=1 -- -\' AND password = \'anypassword\'\n\nResult:\nLogged in as administrator! Flag: WEBSEC{basic_single_quote_sqli_success}',
    securityImpact: 'Complete authentication bypass, full database compromise, unauthorized access to sensitive records, and data manipulation or deletion.',
    prevention: '1. Always use parameterized queries (Prepared Statements) or an Object-Relational Mapper (ORM) like Prisma, TypeORM, or Sequelize.\n2. Ensure the database user operates with the Principle of Least Privilege.\n3. Input validation should be used as defense-in-depth, but never as the sole defense against SQL injection.',
    vulnerableCode: `// Vulnerable: Dynamic string concatenation in raw SQL
async function authenticate(username: string, passwordHash: string) {
  const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${passwordHash}'\`;
  const result = await db.raw(query);
  return result[0];
}`,
    secureCode: `// Remediated: Prepared statement using Prisma ORM parameterized query
async function authenticate(username: string) {
  // Prisma uses parameterized SQL under the hood automatically
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2011, Sony Pictures suffered a massive data breach affecting 1 million accounts due to a basic SQL injection vulnerability in their login form, leading to public data dumping and severe reputation loss.',
    references: [
      { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' },
      { title: 'OWASP WSTG-INPV-05: Testing for SQL Injection', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection' }
    ],
    keyTakeaways: '• Never concatenate user input into database queries.\n• Use parameterized queries (prepared statements) for all database operations.\n• Do not rely on input escaping or blacklisting as primary defense.'
  },

  // -------------------------------------------------------------------------
  // 12. Numeric SQL Injection
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'numeric-sql-injection-query',
    title: 'Numeric SQL Injection: Exploiting Unquoted Database Queries',
    slug: 'numeric-sql-injection-guide',
    description: 'Understand how numeric SQL injection occurs without single quotes and how attackers bypass basic input filters to extract hidden rows.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Numeric SQL Injection occurs when an application accepts a numeric parameter (such as a product category, item ID, or page number) and inserts it directly into an SQL query without enclosing quotes. Because no quotes surround the parameter in the query template, attackers do not need single quotes or escape sequences to inject SQL syntax, rendering naive quote-filtering mechanisms completely ineffective.',
    rootCause: 'The developer assumed that because the parameter was intended to be a number, quote filtering or sanitization was unnecessary, while omitting strict type conversion (e.g., `parseInt()` or `@IsInt()`).',
    mechanics: '1. Inspection: The application queries `/api/products?category=1`.\n2. Query Form: The query is executed as `SELECT * FROM products WHERE category_id = 1 AND is_public = 1`.\n3. Injection: The attacker supplies `1 OR 1=1`.\n4. Alteration: The query becomes `SELECT * FROM products WHERE category_id = 1 OR 1=1 AND is_public = 1`.\n5. Row Leakage: Because `1=1` evaluates to TRUE for all rows, confidential unreleased products and secret records are returned.',
    attackScenario: 'GET /api/products?category=1+OR+1=1 HTTP/1.1\nHost: ctf.websec.internal\n\nDatabase Query:\nSELECT id, name, price, secret_flag FROM products WHERE category_id = 1 OR 1=1;\n\nResult in response:\n[\n  {"id": 999, "name": "Confidential Product", "secret_flag": "WEBSEC{numeric_sqli_no_quote_filtered}"}\n]',
    securityImpact: 'Unauthorized disclosure of unpublished, confidential, or restricted records across entire database tables without requiring quote breakout.',
    prevention: '1. Enforce strict type validation: cast inputs to numbers before building queries (`Number(input)` or `parseInt(input, 10)`).\n2. Use parameterized queries even for numeric fields (`WHERE category_id = ?`).\n3. Use DTO validation pipes with `@IsInt()` and `@Type(() => Number)`.',
    vulnerableCode: `// Vulnerable: Directly embeds category parameter without typecasting or parameterization
app.get('/api/products', async (req, res) => {
  const category = req.query.category;
  // If category is "1 OR 1=1", all products are dumped
  const sql = \`SELECT * FROM products WHERE category_id = \${category} AND status = 'ACTIVE'\`;
  const products = await db.query(sql);
  res.json(products);
});`,
    secureCode: `// Remediated: Parameterized query with strict numeric parsing
app.get('/api/products', async (req, res) => {
  const categoryId = parseInt(req.query.category as string, 10);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  // Prepared statement with parameterized placeholder
  const products = await db.query(
    'SELECT id, name, price FROM products WHERE category_id = ? AND status = ?',
    [categoryId, 'ACTIVE']
  );
  res.json(products);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Many e-commerce catalog filters and news pagination endpoints have suffered from numeric SQL injection when developers validated against single quotes but neglected to typecast URL query strings to integers.',
    references: [
      { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' }
    ],
    keyTakeaways: '• Numeric parameters do not require single quotes to be exploited.\n• Always parse and validate numeric inputs with strict integer casting.\n• Parameterize every input, regardless of data type.'
  },

  // -------------------------------------------------------------------------
  // 13. UNION-Based Data Extraction
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'union-based-data-extraction',
    title: 'UNION-Based SQL Injection: Complete Database Exfiltration',
    slug: 'union-based-sql-injection-guide',
    description: 'Master the mechanics of UNION-based SQL injection to determine column counts, match data types, and extract data from foreign tables.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 9.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'UNION-based SQL Injection allows an attacker to append the results of an injected `SELECT` query to the original query\'s results using the SQL `UNION` operator. This enables direct, fast data exfiltration from arbitrary tables (including credentials, flags, and configuration secrets) directly in the application\'s HTTP response.',
    rootCause: 'The application reflects database query results into the user interface and constructs the underlying SQL statement via unsanitized string formatting.',
    mechanics: '1. Column Count Probing: Attacker injects `\' ORDER BY 1--`, `\' ORDER BY 2--` until a database error occurs to determine the exact number of columns (e.g., 3 columns).\n2. Type Matching: Attacker tests compatibility using `\' UNION SELECT NULL, \'test\', NULL-- -`.\n3. Foreign Table Extraction: Attacker replaces a compatible column with a target column: `\' UNION SELECT 1, flag, 3 FROM ctf_secrets-- -`.\n4. Retrieval: The database unions the rows and the server returns the secret flag in the user directory list.',
    attackScenario: 'GET /api/staff?department=\' UNION SELECT 1, flag, 3 FROM ctf_secrets -- - HTTP/1.1\n\nCombined Query Executed:\nSELECT id, name, department FROM staff WHERE department = \'\' UNION SELECT 1, flag, 3 FROM ctf_secrets -- -\'\n\nResponse:\n[\n  {"id": 1, "name": "WEBSEC{union_select_credentials_extracted}", "department": "3"}\n]',
    securityImpact: 'Unrestricted database extraction: attackers can read schema metadata (information_schema), dump user credential tables, and extract private business records.',
    prevention: '1. Use parameterized queries everywhere without exception.\n2. Restrict database user privileges so the web application cannot access database metadata or administrative tables.\n3. Disable detailed SQL error messages in production.',
    vulnerableCode: `// Vulnerable: Reflects query results from string-concatenated query
async function getStaffByDepartment(dept: string) {
  const sql = \`SELECT id, name, email FROM staff WHERE department = '\${dept}'\`;
  return await db.query(sql);
}`,
    secureCode: `// Remediated: Parameterized query using Prisma
async function getStaffByDepartment(dept: string) {
  return await prisma.staff.findMany({
    where: { department: dept },
    select: { id: true, name: true, email: true },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2014, the Yahoo Voices data breach leaked 450,000 plaintext passwords via a simple UNION-based SQL injection in a public URI parameter.',
    references: [
      { title: 'PortSwigger Web Security Academy: UNION Attacks', url: 'https://portswigger.net/web-security/sql-injection/union-attacks' },
      { title: 'OWASP SQL Injection Testing', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection' }
    ],
    keyTakeaways: '• UNION operators require identical column counts and compatible data types.\n• Use ORDER BY or NULL selection to determine column schema.\n• Parameterization eliminates UNION injection entirely.'
  },

  // -------------------------------------------------------------------------
  // 14. Error-Based SQL Injection
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'error-based-sql-injection',
    title: 'Error-Based SQL Injection: Exfiltration via Database Exception Messages',
    slug: 'error-based-sql-injection-guide',
    description: 'Learn how verbose database error messages and conversion errors (XPATH, ExtractValue) are leveraged to leak database contents.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-209: Generation of Error Message Containing Sensitive Information',
    cvssScore: 8.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Error-Based SQL Injection occurs when an application fails to display database query output directly, but exposes unhandled database error messages to the client. Attackers deliberately trigger mathematical or XML parsing errors (such as MySQL\'s `EXTRACTVALUE()` or `UPDATEXML()`, or PostgreSQL\'s `CAST()`) containing the results of subqueries. The database includes the subquery output inside the error message string.',
    rootCause: 'Unsanitized input interpolation combined with verbose application error handling that displays raw database exception messages to end users.',
    mechanics: '1. Identification: Attacker submits a single quote and receives a detailed MySQL database error.\n2. Error Construct: Attacker crafts an XML function with invalid syntax: `AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT flag FROM secrets), 0x7e))`.\n3. Execution: MySQL attempts to parse the XPATH expression, fails because `~` is invalid, and outputs: `XPATH syntax error: \'~WEBSEC{error_based_leak_extractvalue}~\'`.\n4. Extraction: The application displays the database error in the HTTP response, leaking the flag.',
    attackScenario: 'GET /api/user?id=1 AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT flag FROM flag_storage LIMIT 1), 0x7e)) HTTP/1.1\n\nResponse:\nHTTP/1.1 500 Internal Server Error\n{\n  "error": "Database error: XPATH syntax error: \'~WEBSEC{error_based_leak_extractvalue_found}~\'"\n}',
    securityImpact: 'Data exfiltration of confidential records even when the application UI does not display query results directly.',
    prevention: '1. Use parameterized queries to prevent the injection.\n2. Configure generic error handling in production: never display raw SQL exceptions to clients.\n3. Log detailed database errors to secure, server-side log aggregators.',
    vulnerableCode: `// Vulnerable: Concatenates input and sends raw database error back to client
app.get('/api/user', async (req, res) => {
  try {
    const user = await db.query(\`SELECT * FROM users WHERE id = \${req.query.id}\`);
    res.json(user);
  } catch (err: any) {
    // Leaks raw database exception message!
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});`,
    secureCode: `// Remediated: Parameterized query and generic error response
app.get('/api/user', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.query.id) },
    });
    res.json(user);
  } catch (err: any) {
    logger.error('Database query failure', err); // Log internally
    res.status(500).json({ error: 'An unexpected internal error occurred' });
  }
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Many WordPress plugins and forum software suites historically suffered from error-based SQLi where admin password hashes were leaked through SQL syntax errors on search pages.',
    references: [
      { title: 'OWASP Error Handling Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html' },
      { title: 'CWE-209: Generation of Error Message Containing Sensitive Information', url: 'https://cwe.mitre.org/data/definitions/209.html' }
    ],
    keyTakeaways: '• Never expose database error details to clients in production.\n• Error-based SQLi turns database exceptions into an exfiltration channel.\n• Parameterization is the primary defense; generic error handling is defense-in-depth.'
  },

  // -------------------------------------------------------------------------
  // 15. Boolean-Based Blind SQLi
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'boolean-based-blind-sqli',
    title: 'Boolean-Based Blind SQL Injection: Character-by-Character Inference',
    slug: 'boolean-based-blind-sqli-guide',
    description: 'Understand how attackers extract sensitive database contents when no data or errors are displayed, using True/False conditional responses.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Boolean-Based Blind SQL Injection occurs when an application is vulnerable to SQL injection, but the HTTP response does not return any data from the database and does not display any SQL errors. However, the application responds differently depending on whether the injected condition evaluates to TRUE or FALSE (e.g., "User exists" vs. "User not found").',
    rootCause: 'Unsanitized input interpolation in SQL queries where the result manifests only as a binary condition in application logic.',
    mechanics: '1. Baseline Test: Attacker tests `\' AND 1=1 --` (page returns "Product Available") vs `\' AND 1=2 --` (page returns "Product Not Found").\n2. Length Deduction: Attacker asks `\' AND LENGTH((SELECT flag FROM secrets))=32 --` to determine target string length.\n3. Character Extraction: Attacker tests individual characters: `\' AND SUBSTRING((SELECT flag FROM secrets), 1, 1) = \'W\' --`.\n4. Automation: Using a script or binary search, the attacker extracts the entire secret string character by character.',
    attackScenario: 'Request 1 (True):\nGET /api/inventory?id=1+AND+SUBSTRING((SELECT+flag+FROM+secrets),1,1)=\'W\'\nResponse: {"available": true}\n\nRequest 2 (False):\nGET /api/inventory?id=1+AND+SUBSTRING((SELECT+flag+FROM+secrets),1,1)=\'A\'\nResponse: {"available": false}\n\nInference: First character is confirmed to be "W". Full flag extracted: WEBSEC{boolean_blind_inference_success}',
    securityImpact: 'Complete exfiltration of sensitive database data through binary inference.',
    prevention: '1. Use prepared statements and parameterized queries.\n2. Employ automated SAST/DAST scanning to detect blind injection flaws.\n3. Enforce rate limiting to thwart high-frequency character probing.',
    vulnerableCode: `// Vulnerable: Dynamic concatenation with binary output response
app.get('/api/check-user', async (req, res) => {
  const result = await db.query(\`SELECT 1 FROM users WHERE username = '\${req.query.username}'\`);
  res.json({ exists: result.length > 0 });
});`,
    secureCode: `// Remediated: Parameterized lookup
app.get('/api/check-user', async (req, res) => {
  const count = await prisma.user.count({
    where: { username: String(req.query.username) },
  });
  res.json({ exists: count > 0 });
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Blind SQL injection is frequently found in "username availability check" endpoints during registration on major websites, where an attacker can automate queries to dump password hashes.',
    references: [
      { title: 'PortSwigger Web Security Academy: Blind SQL Injection', url: 'https://portswigger.net/web-security/sql-injection/blind' },
      { title: 'OWASP Testing for Blind SQL Injection', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection' }
    ],
    keyTakeaways: '• Blind SQLi does not require reflected data or error messages.\n• Any observable difference (HTTP status, message, HTML content) enables data extraction.\n• Parameterization completely prevents blind SQL injection.'
  },

  // -------------------------------------------------------------------------
  // 16. Time-Based Blind SQLi
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'time-based-blind-sqli',
    title: 'Time-Based Blind SQL Injection: Exfiltration via Server Delays',
    slug: 'time-based-blind-sqli-guide',
    description: 'Learn how to detect and exploit blind SQL injection when applications return identical responses by measuring server-side sleep delays.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Time-Based Blind SQL Injection is a blind injection technique utilized when the target application shows no difference in response content or HTTP status codes regardless of whether an injected query is TRUE or FALSE. Instead, the attacker injects database delay functions (such as `SLEEP(5)` in MySQL or `pg_sleep(5)` in PostgreSQL) conditioned on a boolean test.',
    rootCause: 'Unsanitized input interpolation in backend queries where application responses are completely normalized and error messages are suppressed.',
    mechanics: '1. Probe: Attacker injects `\'; SELECT SLEEP(5); --` and observes a 5-second delay in HTTP response delivery.\n2. Conditional Injection: Attacker injects `\' OR IF(SUBSTRING((SELECT flag FROM secrets), 1, 1) = \'W\', SLEEP(3), 0) -- -`.\n3. Response Measurement: If the server takes >3 seconds to respond, the condition was TRUE. If it responds in <100ms, it was FALSE.\n4. Extraction: The attacker automates requests to extract the flag character by character.',
    attackScenario: 'GET /api/tracking?code=TRK001\'+AND+(SELECT+IF(SUBSTRING(flag,1,1)=\'W\',+SLEEP(3),+0)+FROM+ctf_flags)--+- HTTP/1.1\n\nServer Response Time: 3,124 ms (3.12 seconds)\n\nInference: Character is "W". Repeating yields: WEBSEC{time_based_sqli_delay_inferred}',
    securityImpact: 'Full exfiltration of database contents despite completely uniform UI output.',
    prevention: '1. Parameterized queries and prepared statements.\n2. Database query timeout limits (kill queries running longer than expected thresholds).\n3. Web Application Firewall (WAF) anomaly detection on sleep functions.',
    vulnerableCode: `// Vulnerable: Tracking query vulnerable to time delays
async function trackPackage(trackingCode: string) {
  const query = \`SELECT * FROM tracking WHERE code = '\${trackingCode}'\`;
  return await db.query(query);
}`,
    secureCode: `// Remediated: Parameterized execution with query timeout
async function trackPackage(trackingCode: string) {
  return await prisma.tracking.findUnique({
    where: { code: trackingCode },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Time-based blind SQLi was historically used to exfiltrate credit card databases from retailers where checkout endpoints gave identical generic error messages for all input.',
    references: [
      { title: 'OWASP SQL Injection Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' }
    ],
    keyTakeaways: '• Time-based attacks measure server latency to infer data.\n• Database functions like SLEEP(), BENCHMARK(), and pg_sleep() are key indicators.\n• Prepared statements eliminate time-based injection at the source.'
  },

  // -------------------------------------------------------------------------
  // 17. Second-Order Stored SQLi
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'second-order-stored-sqli',
    title: 'Second-Order SQL Injection: Stored Payloads Triggered in Subsequent Queries',
    slug: 'second-order-stored-sqli-guide',
    description: 'Analyze how benignly stored inputs execute maliciously when retrieved and interpolated into secondary SQL queries.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 8.1,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Second-Order SQL Injection occurs when an attacker submits input that is safely stored in a database without immediate vulnerability (e.g., during registration). However, when the application later retrieves that stored data and embeds it into a subsequent SQL query without parameterization, the malicious payload executes.',
    rootCause: 'Developers often assume that data originating from their own database is "trusted" and safe to concatenate directly into dynamic SQL queries.',
    mechanics: '1. Storage Phase: Attacker registers an account with username `admin\'--`.\n2. Persistence: The username is inserted into the database safely using prepared statements.\n3. Trigger Phase: The attacker updates their password. The application runs `UPDATE users SET password = \'$hash\' WHERE username = \'$storedUsername\'`.\n4. Flawed Execution: Because `$storedUsername` contains `admin\'--`, the query becomes `UPDATE users SET password = \'$hash\' WHERE username = \'admin\'--\'`.\n5. Hijack: The administrator\'s password is overwritten instead of the attacker\'s.',
    attackScenario: 'Step 1: Register username: admin\'-- -\nStep 2: Submit password reset for your own account.\nStep 3: Server executes:\nUPDATE users SET password = \'newpass\' WHERE username = \'admin\'-- -\'\n\nOutcome: The real "admin" user password is changed to "newpass". Flag: WEBSEC{second_order_stored_sqli_executed}',
    securityImpact: 'Administrative account takeover, secondary data destruction, and privilege escalation from an unprivileged position.',
    prevention: '1. Never trust data retrieved from the database; treat all data as untrusted.\n2. Always use parameterized queries for ALL database queries, including updates and reads.\n3. Validate usernames strictly against safe alphanumeric character sets upon registration.',
    vulnerableCode: `// Vulnerable: Trusts database-stored username in subsequent password reset query
async function updatePassword(userId: string, newPassword: string) {
  const user = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
  const rawUsername = user[0].username; // e.g. "admin'--"

  // Flaw: Concatenates stored data into second query!
  await db.query(\`UPDATE users SET password = '\${newPassword}' WHERE username = '\${rawUsername}'\`);
}`,
    secureCode: `// Remediated: Parameterizes both queries completely
async function updatePassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'A well-known vulnerability in early forum platforms allowed attackers to register usernames containing SQL payloads to overwrite administrator permissions when the admin viewed the user list.',
    references: [
      { title: 'PortSwigger: Second-Order SQL Injection', url: 'https://portswigger.net/web-security/sql-injection' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' }
    ],
    keyTakeaways: '• Internal database records must never be treated as trusted.\n• Second-order attacks separate storage from execution.\n• Prepared statements must be used across all application layers.'
  },

  // -------------------------------------------------------------------------
  // 18. SQL Injection in ORDER BY Clause
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'order-by-clause-sqli',
    title: 'SQL Injection in ORDER BY and Column Identifier Clauses',
    slug: 'order-by-clause-sqli-guide',
    description: 'Learn why standard prepared statements cannot parameterize ORDER BY clauses and how to safely implement dynamic sorting.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'In SQL standard prepared statements, parameter placeholders (`?` or `$1`) can only represent literal data values (strings, numbers, dates). They cannot represent SQL identifiers like column names, table names, or sorting directions (`ASC`/`DESC`). Consequently, developers often concatenate user-supplied sorting parameters directly into `ORDER BY` clauses, creating SQL injection vulnerabilities.',
    rootCause: 'Dynamic sorting parameters concatenated directly into SQL queries because prepared statement placeholders do not support column identifiers.',
    mechanics: '1. Identification: The application provides sorting via `/api/users?sort=username`.\n2. Query Form: The query is executed as `SELECT id, username, email FROM users ORDER BY username ASC`.\n3. Injection: Attacker injects conditional sorting: `(CASE WHEN (SELECT 1)=1 THEN username ELSE email END)`.\n4. Extraction: Attacker replaces `(SELECT 1)=1` with a subquery extracting the flag character by character, observing changes in the resulting list sort order.',
    attackScenario: 'GET /api/users?sort=(CASE+WHEN+(SUBSTRING((SELECT+flag+FROM+secrets),1,1)=\'W\')+THEN+username+ELSE+id+END) HTTP/1.1\n\nOutcome: If condition is true, rows are sorted alphabetically by username; if false, sorted numerically by ID. Flag: WEBSEC{order_by_clause_injection_blind}',
    securityImpact: 'Blind database exfiltration and conditional timing manipulation.',
    prevention: '1. Implement strict server-side whitelisting for permitted sorting columns.\n2. Map client sort keys to predefined safe column identifiers using lookup tables.\n3. Validate sort direction strictly against `ASC` or `DESC`.',
    vulnerableCode: `// Vulnerable: Concatenates sort column directly into ORDER BY
app.get('/api/users', async (req, res) => {
  const sortBy = req.query.sort || 'id';
  // Flaw: sortBy cannot be parameterized with ?
  const sql = \`SELECT id, username, email FROM users ORDER BY \${sortBy} ASC\`;
  const users = await db.query(sql);
  res.json(users);
});`,
    secureCode: `// Remediated: Strict column whitelisting lookup table
const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  id: 'id',
  username: 'username',
  email: 'email',
  created: 'createdAt',
};

app.get('/api/users', async (req, res) => {
  const sortKey = String(req.query.sort || 'id');
  const safeColumn = ALLOWED_SORT_COLUMNS[sortKey];

  if (!safeColumn) {
    return res.status(400).json({ error: 'Invalid sort field' });
  }

  // Use ORM with validated safe column identifier
  const users = await prisma.user.findMany({
    orderBy: { [safeColumn]: 'asc' },
  });
  res.json(users);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Dynamic sortable data tables in administrative CRM panels frequently suffer from ORDER BY injection when developers pass the column name parameter directly to SQL.',
    references: [
      { title: 'OWASP SQL Injection Prevention - SQL Identifier Handling', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#sql-identifers' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' }
    ],
    keyTakeaways: '• Standard SQL placeholders cannot parameterize column or table names.\n• Always use an explicit whitelist dictionary to validate column identifiers.\n• Default to a safe fallback column when unrecognized inputs are received.'
  },

  // -------------------------------------------------------------------------
  // 19. Blind SQLi via HTTP Header
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'blind-sqli-http-header',
    title: 'Blind SQL Injection via HTTP Request Headers (User-Agent, X-Forwarded-For)',
    slug: 'blind-sqli-http-header-guide',
    description: 'Investigate how logging and analytics subsystems introduce SQL injection by storing unescaped HTTP headers.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 8.6,
    status: ChallengeStatus.PUBLISHED,
    overview: 'HTTP headers (such as `User-Agent`, `Referer`, `X-Forwarded-For`, and custom headers) are attacker-controlled strings. Many applications log these headers into database tables for analytics, audit trails, or session tracking. When developers concatenate header values into raw SQL queries under the mistaken assumption that headers are safe or trusted, blind SQL injection is introduced.',
    rootCause: 'Developers treated HTTP headers as server-controlled or trusted environment attributes rather than untrusted client input, embedding them into raw `INSERT INTO logs` queries without parameterization.',
    mechanics: '1. Identification: Attacker modifies the `User-Agent` or `X-Forwarded-For` header in their HTTP request.\n2. Injection: Attacker sets `User-Agent: Mozilla/5.0\' + (SELECT IF(1=1, SLEEP(3), 0)) + \'`.\n3. Logging Execution: The server\'s audit middleware executes `INSERT INTO audit_logs (ip, user_agent) VALUES (\'...\', \'$ua\')`.\n4. Server Delay: The database executes the sleep function, causing a measurable delay in response delivery.',
    attackScenario: 'GET /api/v1/status HTTP/1.1\nHost: ctf.websec.internal\nUser-Agent: Mozilla/5.0\', (SELECT IF(SUBSTRING((SELECT flag FROM secrets),1,1)=\'W\', SLEEP(3), 0))) -- -\n\nOutcome: Server pauses for 3 seconds. By automating header updates, the attacker extracts the flag: WEBSEC{blind_sqli_http_header_logged}',
    securityImpact: 'Remote blind database compromise through standard background logging processes.',
    prevention: '1. Use parameterized queries for all audit logging and database writes.\n2. Treat all HTTP headers as untrusted client data.\n3. Sanitize and length-limit header strings before processing.',
    vulnerableCode: `// Vulnerable: Concatenates User-Agent header into audit logging query
app.use(async (req, res, next) => {
  const ua = req.headers['user-agent'] || 'Unknown';
  const ip = req.ip;
  // Flaw: Raw concatenation of client header!
  await db.query(\`INSERT INTO request_logs (ip, user_agent) VALUES ('\${ip}', '\${ua}')\`);
  next();
});`,
    secureCode: `// Remediated: Parameterized audit log insertion
app.use(async (req, res, next) => {
  const ua = (req.headers['user-agent'] || 'Unknown').slice(0, 255);
  const ip = req.ip;

  await prisma.auditLog.create({
    data: { ip, userAgent: ua },
  });
  next();
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2013, multiple commercial web application firewalls and analytics dashboards were compromised via SQL injection in `X-Forwarded-For` and `User-Agent` headers.',
    references: [
      { title: 'OWASP Testing for SQL Injection in Headers', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' }
    ],
    keyTakeaways: '• Every HTTP header is completely under the client\'s control.\n• Never concatenate headers into database queries.\n• Always parameterize audit and access logs.'
  },

  // -------------------------------------------------------------------------
  // 20. WAF Filter Bypass SQLi
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'waf-filter-bypass-sqli',
    title: 'WAF Filter Bypass Techniques in SQL Injection',
    slug: 'waf-filter-bypass-sqli-guide',
    description: 'Learn how attackers circumvent naive regex filters and Web Application Firewall rules using SQL obfuscation techniques.',
    category: 'sql-injection',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 8.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Web Application Firewalls (WAFs) and input validation filters often attempt to block SQL injection by filtering common keywords like `UNION`, `SELECT`, `OR`, spaces, or single quotes. However, SQL syntax allows extensive obfuscation, including inline comments (`/**/`), hexadecimal encoding, case variation (`uNiOn`), and alternative boolean operators (`||`, `&&`, `LIKE`). Relying on regex filters instead of parameterized queries provides a false sense of security.',
    rootCause: 'The application relied on a blacklist-based regex filter to sanitize input before concatenating it into a dynamic query, failing to understand SQL grammar flexibility.',
    mechanics: '1. Reconnaissance: Attacker tests `UNION SELECT` and receives HTTP 403 "Blocked by WAF".\n2. Filter Analysis: The filter strips or blocks spaces and uppercase `UNION`.\n3. Obfuscation Formulation: Attacker replaces spaces with SQL inline comments `/**/` and mixes casing: `uNiOn/**/sElEcT/**/1,flag,3/**/fRoM/**/ctf_secrets`.\n4. Execution: The WAF regex misses the comment-separated tokens, while the database engine parses `/**/` as valid whitespace and executes the query.',
    attackScenario: 'GET /api/search?q=test\'/**/uNiOn/**/sElEcT/**/1,flag,3/**/fRoM/**/secrets/**/wHeRe/**/1=\'1 HTTP/1.1\n\nOutcome: The WAF allows the request through; the database executes the query and returns the secret flag: WEBSEC{waf_filter_bypass_comments_case_tamper}',
    securityImpact: 'Circumvention of perimeter defensive controls, leading to full database compromise.',
    prevention: '1. Never rely on blacklists, regex filters, or WAFs as the primary defense against SQL injection.\n2. Parameterized queries and prepared statements make SQL injection impossible, rendering WAF bypasses irrelevant.\n3. Use WAFs strictly as defense-in-depth, not as a replacement for secure coding.',
    vulnerableCode: `// Vulnerable: Naive blacklist filter easily bypassed by obfuscation
function sanitize(input: string): string {
  // Flaw: Blacklist misses casing, comments, and hex encodings!
  return input.replace(/UNION/g, '').replace(/SELECT/g, '').replace(/ /g, '');
}

app.get('/api/search', async (req, res) => {
  const clean = sanitize(req.query.q as string);
  const sql = \`SELECT * FROM items WHERE name LIKE '%\${clean}%'\`;
  return await db.query(sql);
});`,
    secureCode: `// Remediated: Parameterized search using Prisma
app.get('/api/search', async (req, res) => {
  const searchTerm = String(req.query.q || '');
  const items = await prisma.item.findMany({
    where: {
      name: { contains: searchTerm },
    },
  });
  return res.json(items);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Numerous enterprise breaches have occurred when companies deployed WAFs over vulnerable legacy code instead of fixing the underlying unparameterized database queries.',
    references: [
      { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
      { title: 'CWE-89: SQL Injection', url: 'https://cwe.mitre.org/data/definitions/89.html' }
    ],
    keyTakeaways: '• Blacklists and regex filters can always be bypassed with SQL obfuscation.\n• Inline comments, casing, and hex encoding defeat superficial pattern matching.\n• Parameterization is the only permanent solution to SQL injection.'
  }
];
