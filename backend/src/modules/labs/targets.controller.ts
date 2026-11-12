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
  ) {
    return this.dispatchTarget(username, slug, '', req, res);
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
  ) {
    const rawParam = (req.params as any)?.path || req.params?.[0] || '';
    const subPath = rawParam.startsWith('/') ? rawParam : `/${rawParam}`;
    return this.dispatchTarget(username, slug, subPath, req, res);
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
  ) {
    return this.dispatchTarget(identifier, undefined, '', req, res);
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
  ) {
    const rawParam = (req.params as any)?.path || req.params?.[0] || '';
    const subPath = rawParam.startsWith('/') ? rawParam : `/${rawParam}`;
    return this.dispatchTarget(identifier, undefined, subPath, req, res);
  }

  private async dispatchTarget(
    identifier1: string,
    identifier2: string | undefined,
    subPath: string,
    req: Request,
    res: Response,
  ) {
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
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Target Environment Not Found',
        message:
          'Could not resolve target environment. Verify your target host, port, or instance token.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const { challenge, rawFlag, user } = context;
    const actualSubpath = context.effectiveSubpath
      ? `${context.effectiveSubpath}${subPath}`
      : subPath;
    const categorySlug = challenge.category?.slug || '';
    const method = req.method.toUpperCase();

    // -----------------------------------------------------------------------
    // Category: Insecure Direct Object Reference (IDOR)
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'idor' ||
      challenge.slug === 'invoice-vault' ||
      challenge.slug === 'ghost-patient'
    ) {
      return handleIdorTarget(challenge.slug, actualSubpath, req, res, rawFlag);
    }

    // -----------------------------------------------------------------------
    // Category: Server-Side Request Forgery (SSRF)
    // -----------------------------------------------------------------------
    if (
      categorySlug === 'ssrf' ||
      challenge.slug === 'link-preview' ||
      challenge.slug === 'metadata-maze'
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
      challenge.slug === 'key-confusion'
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

      // Challenge: Weak Admin Password (admin:admin2026)
      if (
        (challenge.slug === 'weak-admin-password' || categorySlug === 'auth-access-control') &&
        username.toLowerCase() === 'admin'
      ) {
        if (password === 'admin2026' || password === 'admin') {
          return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Authentication successful for target admin',
            user: { id: 1, username: 'admin', role: 'admin' },
            flag: rawFlag,
          });
        }
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Incorrect password for user',
          message: 'Authentication failed for admin account',
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

      if (username && username !== 'target_user' && username !== 'admin') {
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

    return res.status(HttpStatus.OK).json({
      status: 'TARGET_ONLINE',
      player: user.username,
      challengeSlug: challenge.slug,
      endpointRequested: actualSubpath,
      method,
      message:
        'Request received by target microservice. Craft your exploit payload to discover the flag.',
    });
  }
}
