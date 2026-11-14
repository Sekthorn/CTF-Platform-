import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Web Security Fundamentals (Foundations) Target Microservices
 * Isolated educational HTTP/Browser Security diagnostic labs covering:
 * - HTTP/2 & Header Semantics (RFC 9110 / RFC 9113)
 * - HTTP Method Safety & Verb Tampering (RFC 9110)
 * - OWASP Top 10 (A00:2021), CWE & CVSS Taxonomy
 * - TLS Handshake, HTTPS & HSTS Transport Protection
 * - Same-Origin Policy (SOP) Tuple Analysis
 * - CORS Preflight & Reflected Origin Misconfigurations
 * - RFC 6265 Cookie Security Attributes
 * - Browser Storage & Session Token Boundaries
 * - Intercepting Proxy & Client-Header Tampering
 * - OWASP ASVS V1 & STRIDE Threat Modeling
 */
export function handleFoundationsTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const cleanPath = (subpath || '').replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const asText = (v: unknown): string =>
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : '';

  // -------------------------------------------------------------------------
  // 1. HTTP/2 & Request Header Semantics Inspection
  // -------------------------------------------------------------------------
  if (slug === 'http2-header-semantics-lab') {
    const forwardedHost =
      (req.headers['x-forwarded-host'] as string) ||
      (req.headers['host'] as string) ||
      'localhost';

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Foundations-Trace', rawFlag);
    res.setHeader('X-HTTP2-Authority-Observed', forwardedHost);
    res.setHeader('X-RFC-Reference', 'RFC-9110 / RFC-9113');

    return res.status(HttpStatus.OK).json({
      service: 'Foundations Edge Header Diagnostic Gateway',
      endpoint: cleanPath,
      observedRequest: {
        method,
        path: req.originalUrl,
        hostOrAuthority: forwardedHost,
        httpVersion: req.httpVersion,
      },
      securityHeadersPresent: {
        contentType: 'application/json; charset=utf-8',
        xContentTypeOptions: 'nosniff',
        xFoundationsTrace: 'PRESENT_IN_RESPONSE_HEADERS',
      },
      message:
        cleanPath === '/api/v1/health' || cleanPath === '/health'
          ? 'Health probe succeeded. Inspect the X-Foundations-Trace HTTP response header in DevTools Network tab or curl -i to capture the flag.'
          : 'Inspect HTTP response headers (X-Foundations-Trace) on / or /api/v1/health using Browser DevTools Network tab or curl -i.',
    });
  }

  // -------------------------------------------------------------------------
  // 2. HTTP Method Safety & Verb Tampering Basics
  // -------------------------------------------------------------------------
  if (slug === 'http-method-verb-safety-lab') {
    const overrideMethod = (
      (req.headers['x-http-method-override'] as string) ||
      (req.headers['x-method-override'] as string) ||
      ''
    ).toUpperCase();
    const effectiveMethod = overrideMethod || method;

    res.setHeader('Allow', 'GET, HEAD, OPTIONS, POST, PUT');

    if (method === 'OPTIONS') {
      res.setHeader('X-Method-Audit', 'unsafe-put-post-exposed');
      return res.status(HttpStatus.OK).json({
        service: 'HTTP Method Routing Auditor',
        endpoint: cleanPath,
        allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'],
        message:
          'OPTIONS discovery succeeded. Test non-GET state-changing verbs (PUT, POST, PATCH) or X-HTTP-Method-Override against /status to verify verb tampering.',
      });
    }

    if (
      ['PUT', 'POST', 'PATCH', 'DELETE'].includes(effectiveMethod) ||
      cleanPath === '/admin/toggle'
    ) {
      return res.status(HttpStatus.OK).json({
        status: 'UNSAFE_VERB_ACCEPTED',
        methodUsed: effectiveMethod,
        viaOverrideHeader: Boolean(overrideMethod),
        finding:
          'State-changing HTTP verb processed on /status without route-level authorization parity.',
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      status: 'SAFE_READ_ONLY',
      methodUsed: method,
      endpoint: cleanPath,
      endpoints: {
        statusEndpoint: '/status',
        discovery: 'OPTIONS /status',
      },
      hint: 'Send an OPTIONS request to read the Allow header, then replay PUT or POST to /status.',
    });
  }

  // -------------------------------------------------------------------------
  // 3. OWASP Top 10 & CVSS Risk Classification Lab
  // -------------------------------------------------------------------------
  if (slug === 'owasp-top10-taxonomy-lab') {
    const owaspInput = String(
      req.query.owasp || req.body?.owasp || '',
    ).toUpperCase();
    const vectorInput = String(
      req.query.attackVector || req.query.cvss || req.body?.attackVector || '',
    ).toUpperCase();

    if (
      owaspInput.includes('A01') ||
      vectorInput.includes('NETWORK') ||
      vectorInput.includes('AV:N')
    ) {
      return res.status(HttpStatus.OK).json({
        triageStatus: 'CLASSIFICATION_VERIFIED',
        matchedScenario: {
          owasp2021: 'A01:2021 - Broken Access Control',
          cwe: 'CWE-639 (Authorization Bypass Through User-Controlled Key)',
          cvss31Vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
          severity: 'CRITICAL (9.1)',
        },
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      service: 'Security Risk Classification & CVSS Triage Console',
      sampleFinding: {
        summary:
          'Unauthenticated remote attacker increments ?invoiceId=1001 to download another tenant invoice over HTTPS.',
        cvssVector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
      },
      howToVerify:
        'Classify this finding by requesting /api/triage?owasp=A01&attackVector=AV:N (or POST JSON { "owasp": "A01", "attackVector": "Network" }).',
    });
  }

  // -------------------------------------------------------------------------
  // 4. TLS Handshake, HTTPS & HSTS Transport Protection
  // -------------------------------------------------------------------------
  if (slug === 'tls-https-transport-basics-lab') {
    const forwardedProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
    const enforceParam = asText(req.query.enforce ?? req.query.verify).toLowerCase();

    if (
      cleanPath === '/tls-check' ||
      cleanPath === '/api/transport' ||
      enforceParam === 'hsts' ||
      forwardedProto === 'https'
    ) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
      res.setHeader('X-TLS-Enforcement', 'HSTS_ACTIVE');

      return res.status(HttpStatus.OK).json({
        transportStatus: 'HSTS_ENFORCED',
        hstsHeader: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        mixedContentRisk: 'BLOCKED',
        explanation:
          'With Strict-Transport-Security enabled, browsers refuse plaintext HTTP downgrades for 1 year across all subdomains.',
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      transportStatus: 'DOWNGRADE_VULNERABLE',
      hstsEnabled: false,
      explanation:
        'Relying only on HTTP 301 redirects exposes the first connection to SSL stripping on untrusted Wi-Fi.',
      nextStep:
        'Verify hardened HSTS transport enforcement by requesting /tls-check?enforce=hsts or sending header X-Forwarded-Proto: https.',
    });
  }

  // -------------------------------------------------------------------------
  // 5. Same-Origin Policy (SOP) Tuple Analysis
  // -------------------------------------------------------------------------
  if (slug === 'same-origin-policy-boundaries-lab') {
    const candidate = String(
      req.query.url || req.query.candidate || req.body?.url || '',
    ).trim();

    if (candidate) {
      try {
        const baseline = new URL('https://portal.websec.local:443');
        const parsed = new URL(candidate);
        const baselinePort = baseline.port || '443';
        const candidatePort =
          parsed.port || (parsed.protocol === 'https:' ? '443' : '80');

        const sameOrigin =
          parsed.protocol === baseline.protocol &&
          parsed.hostname.toLowerCase() === baseline.hostname.toLowerCase() &&
          candidatePort === baselinePort;

        if (sameOrigin) {
          return res.status(HttpStatus.OK).json({
            sameOrigin: true,
            baselineOrigin: 'https://portal.websec.local:443',
            evaluatedUrl: candidate,
            tupleMatched: [parsed.protocol.replace(':', ''), parsed.hostname, candidatePort],
            flag: rawFlag,
          });
        }

        return res.status(HttpStatus.OK).json({
          sameOrigin: false,
          baselineOrigin: 'https://portal.websec.local:443',
          evaluatedUrl: candidate,
          reason:
            'Origin tuple (scheme, host, port) does not match https://portal.websec.local:443.',
        });
      } catch {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid URL candidate',
          example: '/api/origin-check?url=https://portal.websec.local/admin',
        });
      }
    }

    return res.status(HttpStatus.OK).json({
      baselineOrigin: 'https://portal.websec.local:443',
      candidatesToTest: [
        'http://portal.websec.local/login',
        'https://api.portal.websec.local/v1',
        'https://portal.websec.local:8443/api',
        'https://portal.websec.local/admin',
      ],
      hint: 'Pass ?url=<candidate> to /api/origin-check for a candidate URL that shares the exact (scheme, host, port) tuple with https://portal.websec.local:443.',
    });
  }

  // -------------------------------------------------------------------------
  // 6. CORS Preflight & Reflected Origin Audit
  // -------------------------------------------------------------------------
  if (slug === 'cors-preflight-trust-flaws-lab') {
    const incomingOrigin = String(req.headers['origin'] || '').trim();

    if (incomingOrigin) {
      // Intentionally vulnerable reflected Origin + ACAC: true for learning demo
      res.setHeader('Access-Control-Allow-Origin', incomingOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Vary', 'Origin');
    }

    if (method === 'OPTIONS') {
      return res.status(HttpStatus.OK).json({
        preflightStatus: incomingOrigin ? 'REFLECTED_UNSAFE_ORIGIN' : 'NO_ORIGIN_HEADER',
        reflectedAllowOrigin: incomingOrigin || null,
        allowCredentials: Boolean(incomingOrigin),
        hint: 'Now issue a GET request to /api/account with an untrusted Origin header (e.g. Origin: https://attacker.example) to prove cross-origin credentialed reads.',
      });
    }

    const isUntrustedOrigin =
      Boolean(incomingOrigin) &&
      !incomingOrigin.startsWith('http://localhost') &&
      !incomingOrigin.startsWith('http://127.0.0.1');

    if (isUntrustedOrigin) {
      return res.status(HttpStatus.OK).json({
        corsAudit: 'VULNERABLE_ORIGIN_REFLECTION',
        reflectedAccessControlAllowOrigin: incomingOrigin,
        accessControlAllowCredentials: true,
        impact:
          'Any third-party origin can make credentialed fetch() reads and exfiltrate authenticated user account data.',
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      service: 'Partner Account CORS Endpoint',
      endpoint: cleanPath,
      hint: 'Send Origin: https://attacker.example (or Origin: null) to /api/account via curl -i -H "Origin: https://attacker.example" to test whether the server blindly reflects untrusted origins with Access-Control-Allow-Credentials: true.',
    });
  }

  // -------------------------------------------------------------------------
  // 7. RFC 6265 Cookie Security Flag Audit
  // -------------------------------------------------------------------------
  if (slug === 'rfc6265-cookie-flags-lab') {
    const mode = String(req.query.mode || req.body?.mode || '').toLowerCase();
    const hasHardenedFlags =
      mode === 'secure' ||
      cleanPath === '/audit' ||
      String(req.query.httponly || req.body?.httpOnly || '').toLowerCase() === 'true' &&
        String(req.query.secure || req.body?.secure || '').toLowerCase() === 'true';

    if (hasHardenedFlags) {
      res.setHeader(
        'Set-Cookie',
        '__Host-session=hardened_token_9912; Path=/; HttpOnly; Secure; SameSite=Lax',
      );
      return res.status(HttpStatus.OK).json({
        rfc6265Compliant: true,
        issuedSetCookie:
          '__Host-session=hardened_token_9912; Path=/; HttpOnly; Secure; SameSite=Lax',
        protectionsVerified: ['HttpOnly', 'Secure', 'SameSite=Lax', '__Host- prefix'],
        flag: rawFlag,
      });
    }

    // Default intentionally weak Set-Cookie for educational inspection
    res.setHeader('Set-Cookie', 'lab_session=weak_token_9912; Path=/');
    return res.status(HttpStatus.OK).json({
      rfc6265Compliant: false,
      issuedWeakSetCookie: 'lab_session=weak_token_9912; Path=/',
      missingAttributes: ['HttpOnly', 'Secure', 'SameSite=Lax', '__Host- prefix'],
      nextStep:
        'Audit the weak Set-Cookie header above, then request /login?mode=secure or /audit?httponly=true&secure=true to issue an RFC 6265 compliant __Host-session cookie and capture the flag.',
    });
  }

  // -------------------------------------------------------------------------
  // 8. Browser Storage & Session Token Boundary
  // -------------------------------------------------------------------------
  if (slug === 'browser-storage-session-basics-lab') {
    const recommendation = String(
      req.query.recommended || req.query.storage || req.body?.storage || '',
    ).toLowerCase();

    if (
      recommendation.includes('httponly') ||
      cleanPath === '/api/storage-audit' && recommendation === 'cookie' ||
      method === 'POST' && cleanPath === '/api/login'
    ) {
      return res.status(HttpStatus.OK).json({
        verdict: 'HTTPONLY_COOKIE_REQUIRED',
        sessionRotatedOnLogin: true,
        serverSideLogoutInvalidation: true,
        explanation:
          'Tokens in localStorage/sessionStorage are accessible to any script executing on the page. HttpOnly cookies isolate session credentials from JavaScript.',
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      currentStoragePattern: {
        accessTokenLocation: 'window.localStorage["auth_token"]',
        xssReadable: true,
        rotatesSessionIdOnLogin: false,
      },
      hint: 'Run /api/storage-audit?recommended=httponly_cookie (or POST /api/login) to verify the secure OWASP ASVS V3 token storage and session rotation architecture.',
    });
  }

  // -------------------------------------------------------------------------
  // 9. Intercepting Proxy & Client-Header Tampering
  // -------------------------------------------------------------------------
  if (slug === 'web-proxy-interception-lab') {
    const submittedPrice = body.price ?? req.query.price;
    const submittedRole = asText(body.role ?? req.query.role ?? 'user').toLowerCase();
    const isAdminFlag = body.isAdmin === true || asText(req.query.isAdmin) === 'true';
    const proxyTamperedHeader =
      String(req.headers['x-proxy-tampered'] || '').toLowerCase() === 'true';

    const priceTampered =
      submittedPrice !== undefined && !Number.isNaN(Number(submittedPrice)) && Number(submittedPrice) < 199;

    if (priceTampered || submittedRole === 'admin' || isAdminFlag || proxyTamperedHeader) {
      return res.status(HttpStatus.OK).json({
        interceptedTamperingDetected: true,
        receivedPayload: {
          price: submittedPrice ?? 199,
          role: submittedRole,
          isAdmin: isAdminFlag,
        },
        lesson:
          'An intercepting proxy (Burp Suite / OWASP ZAP) modifies requests AFTER browser JS validation runs. Never trust client-supplied prices or role fields.',
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      storefrontItem: 'Hardware Security Key',
      clientLockedPrice: 199,
      clientLockedRole: 'user',
      endpoint: '/api/checkout',
      hint: 'Send a POST request to /api/checkout tampering the JSON body with {"price": 1, "role": "admin"} (simulating Burp Repeater interception) to obtain the flag.',
    });
  }

  // -------------------------------------------------------------------------
  // 10. OWASP Top 10 & ASVS V1 Threat Modeling Assessment
  // -------------------------------------------------------------------------
  if (slug === 'owasp-threat-modeling-a00-lab') {
    const stride = String(req.query.stride || req.body?.stride || '').toLowerCase();
    const boundary = String(req.query.trustBoundary || req.query.boundary || req.body?.trustBoundary || '').toLowerCase();

    if (
      stride.includes('spoofing') ||
      stride.includes('tampering') ||
      stride.includes('elevation') ||
      boundary.includes('browser') ||
      boundary.includes('api') ||
      boundary.includes('db')
    ) {
      return res.status(HttpStatus.OK).json({
        threatModelStatus: 'VALIDATED',
        methodology: 'Shostack 4 Questions + STRIDE + OWASP ASVS V1',
        trustBoundariesMapped: [
          'TB-1: Untrusted Browser <-> API Gateway',
          'TB-2: API Gateway <-> Internal Auth Service',
          'TB-3: Auth Service <-> MySQL Database',
        ],
        flag: rawFlag,
      });
    }

    return res.status(HttpStatus.OK).json({
      architectureDataFlow: 'Browser -> API Gateway -> Auth Service -> MySQL Database',
      task: 'Map STRIDE threats across Trust Boundaries per OWASP ASVS V1.',
      hint: 'Query /api/threat-model?stride=spoofing,tampering&trustBoundary=browser-to-api (or POST JSON) to validate your threat model and retrieve the flag.',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Foundations Target Not Found',
    slug,
  });
}
