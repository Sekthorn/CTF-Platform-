import {
  Controller,
  All,
  Req,
  Res,
  Param,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LabsService } from './labs.service';
import { handleIdorTarget } from './targets/idor.targets';
import { handleSsrfTarget } from './targets/ssrf.targets';
import { handleCmdInjectionTarget } from './targets/command-injection.targets';
import { handleJwtTarget } from './targets/jwt.targets';
import { handleBusinessLogicTarget } from './targets/business-logic.targets';
import { handleDeserializationTarget } from './targets/deserialization.targets';

@ApiTags('Challenge Target Microservices')
@Controller('targets')
export class TargetsController {
  private readonly logger = new Logger(TargetsController.name);

  constructor(private readonly labsService: LabsService) {}

  private extractSubPath(req: Request): string {
    const raw = (req.params as any)?.path ?? (req.params as any)?.[0] ?? '';
    if (Array.isArray(raw)) {
      const joined = raw.filter(Boolean).join('/');
      return joined ? `/${joined}` : '';
    }
    const str = String(raw || '');
    if (!str) return '';
    return str.startsWith('/') ? str : `/${str}`;
  }

  /**
   * Two-Segment Route: /api/v1/targets/:username/:slug
   * Provides immediate access to player's integrated target without manual lab provisioning.
   */
  @All(':username/:slug')
  @ApiOperation({ summary: 'Execute penetration testing against target root' })
  @ApiParam({
    name: 'username',
    description: 'Player username or challenge slug',
  })
  @ApiParam({ name: 'slug', description: 'Challenge slug or first subpath' })
  async handleUserChallengeRoot(
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.dispatchTarget(username, slug, '', req, res);
    } catch (err: any) {
      this.logger.error(
        `Error in handleUserChallengeRoot: ${err.message}`,
        err.stack,
      );
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Target Execution Error',
          message: err.message || 'Target routing error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @All(':username/:slug/*path')
  @ApiOperation({
    summary: 'Execute penetration testing against target subpaths',
  })
  @ApiParam({
    name: 'username',
    description: 'Player username or challenge slug',
  })
  @ApiParam({ name: 'slug', description: 'Challenge slug or first subpath' })
  async handleUserChallengeSubpath(
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const subPath = this.extractSubPath(req);
      await this.dispatchTarget(username, slug, subPath, req, res);
    } catch (err: any) {
      this.logger.error(
        `Error in handleUserChallengeSubpath: ${err.message}`,
        err.stack,
      );
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Target Subpath Error',
          message: err.message || 'Target routing error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  /**
   * Single-Segment Route: /api/v1/targets/:identifier
   * Fallback for direct challenge slug, or legacy instance UUID
   */
  @All(':identifier')
  @ApiOperation({
    summary:
      'Execute penetration testing against target root by slug or instance ID',
  })
  @ApiParam({
    name: 'identifier',
    description: 'Challenge slug or instance UUID',
  })
  async handleSingleIdentifierRoot(
    @Param('identifier') identifier: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.dispatchTarget(identifier, undefined, '', req, res);
    } catch (err: any) {
      this.logger.error(
        `Error in handleSingleIdentifierRoot: ${err.message}`,
        err.stack,
      );
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Target Execution Error',
          message: err.message || 'Target routing error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  @All(':identifier/*path')
  @ApiOperation({
    summary:
      'Execute penetration testing against target subpaths by slug or instance ID',
  })
  @ApiParam({
    name: 'identifier',
    description: 'Challenge slug or instance UUID',
  })
  async handleSingleIdentifierSubpath(
    @Param('identifier') identifier: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const subPath = this.extractSubPath(req);
      await this.dispatchTarget(identifier, undefined, subPath, req, res);
    } catch (err: any) {
      this.logger.error(
        `Error in handleSingleIdentifierSubpath: ${err.message}`,
        err.stack,
      );
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Target Subpath Error',
          message: err.message || 'Target routing error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    }
  }

  private async dispatchTarget(
    identifier1: string,
    identifier2: string | undefined,
    subPath: string,
    req: Request,
    res: Response,
  ): Promise<any> {
    try {
      // 1. Resolve player target context & deterministic flag (supports instance UUID, token, or legacy pair)
      const effectiveIdentifier1 =
        identifier1 ||
        (req.headers['x-instance-token'] as string) ||
        (req.headers['x-target-token'] as string);

      const context = await this.labsService.resolveTargetContext(
        effectiveIdentifier1,
        identifier2,
        (req as any).user,
      );

      if (!context) {
        res.status(HttpStatus.NOT_FOUND).json({
          error: 'Target Environment Not Found',
          message:
            'Could not resolve target environment. Verify your target host, port, or instance token.',
          statusCode: HttpStatus.NOT_FOUND,
        });
        return;
      }

    const { challenge, rawFlag, user } = context;
    const rawSubpath = context.effectiveSubpath
      ? `${context.effectiveSubpath}${subPath}`
      : subPath;
    const actualSubpath = rawSubpath ? rawSubpath.replace(/\/+/g, '/') : '';
    const categorySlug = challenge.category?.slug || '';
    const method = req.method.toUpperCase();

    // -----------------------------------------------------------------------
    // Category: Insecure Direct Object Reference (IDOR)
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'idor' ||
      challenge.slug === 'invoice-vault' ||
      challenge.slug === 'ghost-patient' ||
      challenge.slug === 'bola-order-resource-hijack'
    ) {
      return handleIdorTarget(challenge.slug, actualSubpath, req, res, rawFlag);
    }

    // -----------------------------------------------------------------------
    // Category: Server-Side Request Forgery (SSRF)
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'ssrf' ||
      challenge.slug === 'link-preview' ||
      challenge.slug === 'metadata-maze' ||
      challenge.slug === 'basic-ssrf-loopback-service' ||
      challenge.slug === 'ssrf-cloud-metadata-exfiltration'
    ) {
      return handleSsrfTarget(challenge.slug, actualSubpath, req, res, rawFlag);
    }

    // -----------------------------------------------------------------------
    // Category: Command Injection
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'command-injection' ||
      challenge.slug === 'ping-pong' ||
      challenge.slug === 'log-cruncher'
    ) {
      return handleCmdInjectionTarget(
        challenge.slug,
        actualSubpath,
        req,
        res,
        rawFlag,
      );
    }

    // -----------------------------------------------------------------------
    // Category: JSON Web Token (JWT)
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'jwt' ||
      challenge.slug === 'token-trouble' ||
      challenge.slug === 'key-confusion' ||
      challenge.slug === 'jwt-none-algorithm-bypass'
    ) {
      return handleJwtTarget(challenge.slug, actualSubpath, req, res, rawFlag);
    }

    // -----------------------------------------------------------------------
    // Category: Business Logic Vulnerabilities
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'business-logic' ||
      challenge.slug === 'flash-sale' ||
      challenge.slug === 'double-spend'
    ) {
      return handleBusinessLogicTarget(
        challenge.slug,
        actualSubpath,
        req,
        res,
        rawFlag,
      );
    }

    // -----------------------------------------------------------------------
    // Category: Insecure Deserialization
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'insecure-deserialization' ||
      challenge.slug === 'cookie-monster' ||
      challenge.slug === 'object-lessons'
    ) {
      return handleDeserializationTarget(
        challenge.slug,
        actualSubpath,
        req,
        res,
        rawFlag,
      );
    }

    // -----------------------------------------------------------------------
    // Challenge: Privilege Escalation Parameter Tampering
    // -----------------------------------------------------------------------
    if (challenge.slug === 'privilege-escalation-parameter-tampering') {
      const bodyRole = (
        req.body?.role ||
        req.body?.user_role ||
        req.query?.role ||
        ''
      ).toLowerCase();
      const isAdminFlag =
        req.body?.is_admin === true ||
        req.body?.isAdmin === true ||
        req.query?.is_admin === 'true';

      if (bodyRole === 'superadmin' || bodyRole === 'admin' || isAdminFlag) {
        return res.status(HttpStatus.OK).json({
          success: true,
          status: 'PRIVILEGE_ESCALATED',
          message:
            'Access granted: Successfully escalated privileges to superadmin via parameter tampering!',
          user: {
            id: 42,
            username: 'researcher',
            role: 'superadmin',
            clearance: 'LEVEL_5',
          },
          flag: rawFlag,
        });
      }

      return res.status(HttpStatus.OK).json({
        service: 'Apex User Profile & Role Administration',
        currentRole: 'operator',
        message:
          'Standard profile loaded. Administrative access requires superadmin privileges.',
        endpoints: ['POST /api/user/role', 'POST /api/profile'],
        hint: 'Inspect user role parameters and attempt parameter tampering to claim elevated privileges.',
      });
    }

    // -----------------------------------------------------------------------
    // Challenge: Mass Assignment Privilege Escalation
    // -----------------------------------------------------------------------
    if (challenge.slug === 'mass-assignment-privilege-escalation') {
      const hasAdminField =
        req.body?.is_admin === true ||
        req.body?.isAdmin === true ||
        (typeof req.body?.role === 'string' &&
          req.body.role.toLowerCase() === 'admin');

      if (hasAdminField) {
        return res.status(HttpStatus.OK).json({
          success: true,
          status: 'MASS_ASSIGNMENT_VULNERABILITY_CONFIRMED',
          message:
            'Profile updated with unauthorized administrative attributes: is_admin=true!',
          user: {
            id: 105,
            username: req.body?.username || 'researcher',
            is_admin: true,
            role: 'admin',
          },
          flag: rawFlag,
        });
      }

      return res.status(HttpStatus.OK).json({
        service: 'Apex User Profile Management API',
        message: 'Submit user profile JSON to update attributes.',
        allowedFieldsExpected: ['username', 'email', 'bio'],
        endpoints: ['PUT /api/user/update', 'PATCH /api/v1/users/profile'],
        hint: 'The backend blindly binds all received JSON properties into the database model without a whitelist.',
      });
    }

    // -----------------------------------------------------------------------
    // Category 0: Client-Side Inspection & Reconnaissance (Beginner Flaw)
    // -----------------------------------------------------------------------
    if (
      challenge.slug === 'client-side-inspection' ||
      actualSubpath.startsWith('/portal') ||
      actualSubpath.startsWith('/client') ||
      actualSubpath.startsWith('/inspect')
    ) {
      // Set debug session cookie and header
      res.setHeader(
        'Set-Cookie',
        `websec_debug_session=${rawFlag}; Path=/; SameSite=Lax`,
      );
      res.setHeader('X-Debug-Flag-Header', rawFlag);

      if (
        req.headers.accept?.includes('application/json') &&
        !req.headers.accept?.includes('text/html')
      ) {
        return res.status(HttpStatus.OK).json({
          targetStatus: 'ONLINE',
          suite: 'WebSec CTF — Client-Side Reconnaissance Portal',
          challengeTitle: challenge.title,
          category: categorySlug,
          message:
            'Diagnostic mode is active. Examine HTML comments, browser console logs, and cookies to capture the flag.',
          htmlComment: `<!-- DO NOT PUSH TO PRODUCTION: ${rawFlag} -->`,
          cookie: `websec_debug_session=${rawFlag}`,
          flag: rawFlag,
        });
      }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Global Corp &mdash; Internal Staging Directory</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; margin: 0; padding: 40px 20px; }
    .card { max-width: 640px; margin: 0 auto; background: #131c2e; border-radius: 12px; padding: 28px; border: 1px solid #1e293b; box-shadow: 0 12px 30px rgba(0,0,0,0.6); }
    h1 { color: #38bdf8; font-size: 20px; margin-top: 10px; font-family: monospace; }
    p { color: #94a3b8; line-height: 1.6; font-size: 13px; }
    .badge { display: inline-block; background: #0369a1; color: #e0f2fe; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: bold; }
    .emp-list { margin-top: 20px; border-top: 1px solid #1e293b; padding-top: 15px; }
    .emp { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 13px; font-family: monospace; }
    .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">DIAGNOSTIC STAGING PORTAL</span>
    <h1>Apex Global &bull; Employee Registry v2.4.1</h1>
    <p>This staging directory is restricted to authorized personnel. Diagnostic mode is active for pre-production quality assurance.</p>

    <!-- DEVELOPER NOTE [QA-Release-Team]: -->
    <!-- Emergency bypass flag left for local testing: ${rawFlag} -->

    <div class="emp-list">
      <div class="emp"><span>Sarah Connor</span><span style="color:#38bdf8;">DevOps Lead</span></div>
      <div class="emp"><span>John Doe</span><span style="color:#38bdf8;">Systems Architect</span></div>
      <div class="emp"><span>Alice Vance</span><span style="color:#38bdf8;">Security Auditor</span></div>
    </div>

    <!-- Hidden administrative configuration element -->
    <div id="staging-debug-panel" style="display: none;" data-auth-token="${rawFlag}">
      <span>Debug Flag: ${rawFlag}</span>
    </div>

    <div class="footer">
      Apex Global Systems &bull; Build 2026.11 &bull; Diagnostic Mode Active
    </div>
  </div>

  <script>
    // Developer diagnostic logging
    console.log("%c[Apex Diagnostic Console] Ready.", "color: #38bdf8; font-weight: bold; font-size: 13px;");
    console.log("%c[DEBUG] Staging Flag: %c${rawFlag}", "color: #94a3b8;", "color: #4ade80; font-weight: bold; font-family: monospace; font-size: 12px;");
    window.__STAGING_FLAG_TOKEN__ = "${rawFlag}";
  </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(HttpStatus.OK).send(html);
    }

    // 2. Target Discovery / Root Endpoint
    if (!actualSubpath || actualSubpath === '/') {
      return res.status(HttpStatus.OK).json({
        targetStatus: 'ONLINE',
        suite: `WebSec CTF — Vulnerable Target Lab [${challenge.category?.name || 'Vulnerability Lab'}]`,
        challengeTitle: challenge.title,
        category: categorySlug,
        message:
          'Target is live and ready for penetration testing. Inspect parameters, formulate exploits, and capture your dynamic flag.',
        availableEndpoints: [
          '/api/login',
          '/api/users/profile',
          '/api/products',
          '/api/search',
          '/view',
          '/report',
          '/search',
          '/api/v1/debug/env',
          '/api/v1/export/users',
          '/api/v1/user/profile',
        ],
      });
    }

    // -----------------------------------------------------------------------
    // Category 1: Authentication & Access Control Scenarios
    // -----------------------------------------------------------------------
    if (actualSubpath.startsWith('/api/login') || actualSubpath.startsWith('/login')) {
      const body = req.body || {};
      const username = (body.username || body.identifier || req.query.username || req.query.identifier || '').toString();
      const password = (body.password || req.query.password || '').toString();

      // Challenge: Weak Admin Password & Username Enumeration targets
      const validUsers: Record<string, string[]> = {
        admin: ['admin2026', 'admin'],
        sec_analyst: ['password123', 'admin2026'],
      };

      const lowerUser = username.toLowerCase();
      if (
        (challenge.slug === 'weak-admin-password' ||
          challenge.slug === 'username-enumeration' ||
          categorySlug === 'auth-access-control') &&
        validUsers[lowerUser]
      ) {
        if (validUsers[lowerUser].includes(password)) {
          return res.status(HttpStatus.OK).json({
            success: true,
            message: `Authentication successful for target user ${lowerUser}`,
            user: { id: 1, username: lowerUser, role: 'operator' },
            flag: rawFlag,
          });
        }
        if (challenge.slug === 'username-enumeration') {
          return res.status(HttpStatus.OK).json({
            vulnerability: 'Username Enumeration Confirmed',
            differentialResponse: 'Incorrect password for user',
            message: `Differential response confirmed: '${lowerUser}' is a valid user!`,
            flag: rawFlag,
            hint: `Account '${lowerUser}' exists. Use credentials '${lowerUser}:admin2026' or submit this flag token.`,
          });
        }
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Incorrect password for user',
          message: `Authentication failed for ${lowerUser} account`,
        });
      }

      // Simulated Target Application Test Accounts
      if (
        username === 'target_user' &&
        (password === 'TargetPass2026!' || password === 'test1234')
      ) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'Authentication successful for target application user',
          user: { id: 101, username: 'target_user', role: 'target_operator' },
          flag: rawFlag,
        });
      }

      if (username === 'target_user') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Invalid credentials',
          message: 'Authentication failed for user account',
        });
      }

      if (username && username !== 'target_user' && !validUsers[lowerUser]) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Account not found',
          message: 'The requested username does not exist',
        });
      }

      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Missing credentials',
        usage: 'POST JSON { "username": "...", "password": "..." }',
      });
    }

    if (actualSubpath.startsWith('/api/users/profile')) {
      const id = req.query.id || req.body?.id || '105';
      if (String(id) === '1') {
        return res.status(HttpStatus.OK).json({
          id: 1,
          username: 'target_manager',
          role: 'Supervisor',
          recovery_key: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        id: Number(id) || 105,
        username: 'target_guest',
        role: 'Standard',
      });
    }

    // Challenge: Password Reset Token Flaw
    if (
      actualSubpath.startsWith('/api/reset') ||
      actualSubpath.startsWith('/api/auth/reset') ||
      challenge.slug === 'password-reset-token-flaw'
    ) {
      const body = req.body || {};
      const token = (body.token || req.query.token || '').toString();
      const resetUser = (body.username || req.query.username || 'admin').toString();
      if (token === 'admin_token_2026' || token.includes('admin') || token.includes('2026') || token.length > 5) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: `Password reset token accepted for user ${resetUser}. Account recovered.`,
          newCredentials: { username: resetUser, tempPassword: 'AdminReset2026!' },
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        endpoint: '/api/reset',
        usage: 'POST { "username": "admin", "token": "admin_token_2026" }',
        hint: 'Reset tokens are predictable: admin_token_2026',
      });
    }

    // Challenge: Missing Role Authorization Check
    if (
      (challenge.slug === 'missing-role-authorization-check' &&
        (actualSubpath.startsWith('/admin') ||
          actualSubpath.startsWith('/api/admin') ||
          !actualSubpath ||
          actualSubpath === '/')) ||
      actualSubpath.startsWith('/api/admin/metrics') ||
      actualSubpath.startsWith('/admin/dashboard')
    ) {
      return res.status(HttpStatus.OK).json({
        system: 'Apex Platform Internal Metrics & Telemetry',
        roleCheckEnforced: false,
        vulnerability: 'Missing Role Authorization Check on Admin API',
        adminMetrics: {
          activeServers: 42,
          securityLevel: 'ELEVATED',
          systemFlag: rawFlag,
        },
        flag: rawFlag,
      });
    }

    // Challenge: Session Fixation Vulnerability
    if (
      actualSubpath.startsWith('/api/auth/session') ||
      actualSubpath.startsWith('/api/session') ||
      challenge.slug === 'session-fixation-vulnerability'
    ) {
      const sessionId = (req.headers['x-session-id'] || req.query.session_id || req.body?.session_id || '').toString();
      if (sessionId || req.headers.cookie?.includes('session_id')) {
        return res.status(HttpStatus.OK).json({
          success: true,
          vulnerability: 'SESSION_FIXATION_SUCCESS',
          authenticatedSessionId: sessionId || 'attacker_fixed_session_2026',
          message: 'Session authenticated without regenerating session identifier.',
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        endpoint: '/api/auth/session',
        usage: 'POST /api/auth/session with body { "session_id": "attacker_session_1337" }',
      });
    }

    // Challenge: MFA Response Manipulation Bypass
    if (
      actualSubpath.startsWith('/api/auth/mfa') ||
      actualSubpath.startsWith('/api/mfa') ||
      challenge.slug === 'mfa-response-manipulation-bypass'
    ) {
      const body = req.body || {};
      if (body.status === 'SUCCESS' || body.success === true || body.mfaPassed === true || req.headers['x-mfa-bypass'] === 'true') {
        return res.status(HttpStatus.OK).json({
          success: true,
          status: 'MFA_VERIFIED_BYPASS',
          message: 'Client-side response manipulation verified. 2FA requirement bypassed.',
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        endpoint: '/api/auth/mfa/verify',
        usage: 'POST { "code": "000000", "status": "SUCCESS" }',
        hint: 'Intercept client response and manipulate validation status.',
      });
    }

    if (
      actualSubpath.startsWith('/api/admin/flag') ||
      actualSubpath.startsWith('/admin/system/metrics')
    ) {
      return res.status(HttpStatus.FORBIDDEN).json({
        error: 'Access Denied',
        message:
          'Administrative interface is strictly secured against header spoofing. Platform administrator privileges require authenticated cryptographic session tokens.',
      });
    }

    // -----------------------------------------------------------------------
    // Category 2: SQL Injection Scenarios
    // -----------------------------------------------------------------------
    if (actualSubpath.startsWith('/api/search')) {
      const query = String(req.query.query || req.body?.query || '').trim();
      const lower = query.toLowerCase();

      // Check common SQLi bypasses
      const hasQuoteBypass =
        query.includes("'") ||
        query.includes('"') ||
        lower.includes('or 1=1') ||
        lower.includes("or '1'='1");
      const hasUnion = lower.includes('union') && lower.includes('select');

      if (hasUnion || hasQuoteBypass) {
        return res.status(HttpStatus.OK).json({
          results: [
            {
              id: 999,
              name: 'Confidential Production Vault Flag',
              category: 'Secret',
              description: 'Exfiltrated through SQL Injection Union query.',
              system_secret: rawFlag,
            },
          ],
        });
      }

      // Simulated database syntax error on unhandled quote
      if (query.includes("'") || query.includes('"')) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Database Syntax Error',
          message: `You have an error in your SQL syntax near '${query}' at line 1`,
        });
      }

      return res.status(HttpStatus.OK).json({
        results: [
          {
            id: 101,
            name: 'Public Corporate Brochure',
            category: 'Marketing',
            price: '$0.00',
          },
          {
            id: 102,
            name: 'Annual Security Overview',
            category: 'Whitepaper',
            price: '$0.00',
          },
        ],
      });
    }

    if (actualSubpath.startsWith('/api/products')) {
      const category = String(req.query.cat || req.body?.category || '');
      if (
        category.includes("'") ||
        category.includes('--') ||
        category.includes(';')
      ) {
        return res.status(HttpStatus.OK).json({
          status: 'SUCCESS',
          vulnerability: 'SQL_INJECTION_TRIGGERED',
          data: [
            { id: 1, name: 'Web Application Firewall Appliance', in_stock: 4 },
            { id: 2, name: 'Encrypted Token Storage', in_stock: 12 },
            { id: 3, name: 'Master System Recovery Key', flag: rawFlag },
          ],
        });
      }

      return res.status(HttpStatus.OK).json({
        status: 'SUCCESS',
        data: [
          { id: 1, name: 'Standard Antivirus License', in_stock: 50 },
          { id: 2, name: 'Network Tap Probe', in_stock: 15 },
        ],
      });
    }

    // -----------------------------------------------------------------------
    // Category 3: Path Traversal & File Handling Scenarios
    // -----------------------------------------------------------------------
    if (
      actualSubpath.startsWith('/view') ||
      actualSubpath.startsWith('/api/files/download')
    ) {
      const file = String(
        req.query.file || req.query.path || req.body?.file || '',
      );

      // Traversal detected
      if (
        file.includes('../') ||
        file.includes('..\\') ||
        file.includes('/etc/') ||
        file.includes('win.ini') ||
        file.includes('passwd')
      ) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res
          .status(HttpStatus.OK)
          .send(
            `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwebsec_vault:x:1001:1001:CTF Vault User,,,:${rawFlag}:/bin/sh\n`,
          );
      }

      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Missing file parameter',
          usage: 'GET /view?file=public_notice.txt',
        });
      }

      return res
        .status(HttpStatus.OK)
        .send(
          `Public file contents for: ${file}\nNo confidential keys in this directory.`,
        );
    }

    if (actualSubpath.startsWith('/report')) {
      const reportFile = String(req.query.file || '');
      if (
        reportFile.includes('secret') ||
        reportFile.includes('flag') ||
        reportFile.includes('config')
      ) {
        return res.status(HttpStatus.OK).json({
          report: 'Server Audit Summary',
          retrievedPath: reportFile,
          confidentialFlag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        report: 'Standard Monthly Summary',
        retrievedPath: reportFile || 'default.pdf',
        status: 'Compliant',
      });
    }

    // -----------------------------------------------------------------------
    // Category 4: Cross-Site Scripting (XSS) Scenarios
    // -----------------------------------------------------------------------
    if (
      actualSubpath.startsWith('/search') ||
      actualSubpath.startsWith('/profile/view')
    ) {
      const query = String(req.query.q || req.query.name || '');

      // Check if XSS payload is present
      const isXss =
        query.toLowerCase().includes('<script') ||
        query.toLowerCase().includes('javascript:') ||
        query.toLowerCase().includes('onerror=') ||
        query.toLowerCase().includes('onload=') ||
        query.toLowerCase().includes('<svg') ||
        query.toLowerCase().includes('<img');

      if (isXss) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res
          .status(HttpStatus.OK)
          .send(
            `<!DOCTYPE html><html><head><title>Search Results</title></head><body><h1>Search Results for: ${query}</h1><div id="admin-cookie" data-secret="${rawFlag}" style="display:none;"></div><p>Simulated bot verified payload execution. Captured Flag: <strong>${rawFlag}</strong></p></body></html>`,
          );
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res
        .status(HttpStatus.OK)
        .send(
          `<!DOCTYPE html><html><head><title>Search</title></head><body><h1>Search Results</h1><p>No results found for: <code>${query.replace(/</g, '&lt;')}</code></p></body></html>`,
        );
    }

    // -----------------------------------------------------------------------
    // Category 5: API Security & Server-Side Scenarios
    // -----------------------------------------------------------------------
    if (actualSubpath.startsWith('/api/v1/debug/env')) {
      return res.status(HttpStatus.OK).json({
        status: 'DEVELOPMENT_MODE_ACTIVE',
        NODE_ENV: 'development',
        PORT: 8080,
        DEBUG: true,
        SYSTEM_FLAG: rawFlag,
      });
    }

    if (actualSubpath.startsWith('/api/v1/export/users')) {
      return res.status(HttpStatus.OK).json({
        total_exported: 2,
        users: [
          {
            id: 1,
            username: 'target_manager',
            role: 'manager',
            secretFlag: rawFlag,
          },
          { id: 2, username: 'operator', role: 'staff', secretFlag: null },
        ],
      });
    }

    if (
      actualSubpath.startsWith('/api/v1/user/profile') &&
      (method === 'PUT' || method === 'POST')
    ) {
      const body = req.body || {};
      // Parameter Tampering in target application service
      if (
        body.role === 'manager' ||
        body.role === 'supervisor' ||
        body.isManager === true ||
        body.role === 'admin' ||
        body.isAdmin === true
      ) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'Target service role elevated via parameter tampering.',
          targetRole: 'manager',
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          username: user.username,
          role: 'standard_user',
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Challenge: Excessive Data Exposure
    if (
      actualSubpath.startsWith('/api/v1/users/export') ||
      actualSubpath.startsWith('/api/v1/users') ||
      challenge.slug === 'excessive-data-exposure-api'
    ) {
      return res.status(HttpStatus.OK).json({
        users: [
          {
            id: 1,
            username: 'superadmin',
            email: 'admin@apex-corp.internal',
            role: 'GlobalAdministrator',
            passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dGVzdGhhc2g',
            mfaSecret: 'JBSWY3DPEHPK3PXP',
            internalSecretToken: rawFlag,
            flag: rawFlag,
          },
        ],
      });
    }

    // Challenge: BOPLA Property Tampering
    if (
      actualSubpath.startsWith('/api/v1/employee') ||
      challenge.slug === 'bopla-property-tampering'
    ) {
      const body = req.body || {};
      if (body.salary || body.compensation || body.role === 'executive') {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'BOPLA Property Tampering Succeeded. Sensitive property modified without authorization.',
          updatedRecord: { id: 104, salary: body.salary || 999999, role: body.role || 'executive' },
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        endpoint: '/api/v1/employee/profile',
        usage: 'PUT with body { "salary": 999999, "role": "executive" }',
      });
    }

    // Challenge: Jinja2 SSTI
    if (
      actualSubpath.startsWith('/api/render') ||
      actualSubpath.startsWith('/template') ||
      challenge.slug === 'jinja2-ssti-secret-leak'
    ) {
      const query = String(req.query.q || req.query.template || req.body?.template || '');
      if (query.includes('{{') || query.includes('{%') || query.includes('config') || query.includes('7*7')) {
        return res.status(HttpStatus.OK).json({
          renderedTemplate: `Template evaluation result for: ${query}`,
          evaluatedValue: `Secret Environment Config: ${rawFlag}`,
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        endpoint: '/template?template={{config.SECRET_KEY}}',
        usage: 'GET with Jinja2 expression',
      });
    }

    // Challenge: Rate Limit Bypass Header Spoof
    if (challenge.slug === 'rate-limit-bypass-header-spoof') {
      const xff = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
      if (xff) {
        return res.status(HttpStatus.OK).json({
          success: true,
          rateLimitBucket: `Spoofed Client IP: ${xff}`,
          message: 'Rate limit bypassed using IP rotation header. Brute force authentication accepted.',
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded for client IP. Rotate your client IP via X-Forwarded-For header.',
      });
    }

    // Challenge: Multi-Stage API Exploitation Chain
    if (
      actualSubpath.startsWith('/api/v1/chain') ||
      challenge.slug === 'multi-stage-api-exploitation-chain'
    ) {
      const step = req.headers['x-chain-step'] || req.query.step || req.body?.step || '1';
      if (String(step) === '2' || actualSubpath.includes('final') || actualSubpath.includes('step2')) {
        return res.status(HttpStatus.OK).json({
          chainState: 'COMPLETED',
          stagesPassed: [
            'Stage 1: Token Leaked from /api/v1/debug',
            'Stage 2: Privileged Gateway Route Invocation',
          ],
          flag: rawFlag,
        });
      }
      return res.status(HttpStatus.OK).json({
        chainState: 'STAGE_1_ACCEPTED',
        nextStep: 'Pass header X-Chain-Step: 2 or query ?step=2 to execute final exploit payload.',
        flag: rawFlag,
      });
    }

    // Fallback: If generic exploit payload or query is sent, return flag if vulnerability triggered
    const fullUrl = req.url || '';
    if (
      fullUrl.includes('flag') ||
      fullUrl.includes('secret') ||
      fullUrl.includes('exploit')
    ) {
      return res.status(HttpStatus.OK).json({
        status: 'EXPLOIT_SUCCESSFUL',
        challenge: challenge.title,
        flag: rawFlag,
      });
    }

    res.status(HttpStatus.OK).json({
      status: 'TARGET_ONLINE',
      player: user.username,
      challengeSlug: challenge.slug,
      endpointRequested: actualSubpath,
      method,
      message:
        'Request received by target microservice. Craft your exploit payload to discover the flag.',
    });
  } catch (err: any) {
    this.logger.error(`Target simulation error: ${err.message}`, err.stack);
    if (!res.headersSent) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Target Execution Error',
        message: err.message || 'Target simulation internal error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
}
