import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * SSRF Target Microservices (100% In-Memory Simulation)
 * Safe implementation: No real outbound network sockets are ever created.
 * The server evaluates URLs strictly in JavaScript memory.
 */
export function handleSsrfTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const cleanPath = subpath.replace(/\/+$/, '') || '/';
  const rawUrl =
    req.query.url ||
    req.body?.url ||
    req.query.target ||
    req.body?.target ||
    '';
  const urlStr = String(rawUrl).trim();

  // -------------------------------------------------------------------------
  // Challenge 3: Link Preview (SSRF - Medium, 200 pts, CWE-918)
  // Scenario: Link preview fetcher reaches simulated internal service at 127.0.0.1:8080
  // -------------------------------------------------------------------------
  if (slug === 'link-preview' || slug === 'basic-ssrf-loopback-service') {
    // Root discovery endpoint
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/preview'
    ) {
      if (!urlStr) {
        return res.status(HttpStatus.OK).json({
          service: 'Apex CardLink & OpenGraph Preview Generator v2.3',
          status: 'ONLINE',
          message:
            'Submit a website URL to generate an automated social card preview.',
          usage: {
            method: 'GET or POST',
            endpoint: '/api/preview?url=https://example.com',
            body: { url: 'https://example.com' },
          },
          internalNotice:
            'Notice: Internal cluster monitoring is active on administrative loopback port 8080.',
        });
      }

      // Check if URL targets internal service at localhost / 127.0.0.1 on port 8080
      const isInternalLoopback =
        /^(?:https?:\/\/)?(?:127\.0\.0\.1|localhost)(?::8080)?(?:\/.*)?$/i.test(
          urlStr,
        );

      if (isInternalLoopback) {
        if (
          /admin|flag|secret|config|metrics|dashboard/i.test(urlStr) ||
          urlStr.endsWith(':8080') ||
          urlStr.endsWith(':8080/')
        ) {
          return res.status(HttpStatus.OK).json({
            status: 200,
            preview: {
              url: urlStr,
              title: 'Apex Cluster Administration & Key Management Console',
              description:
                'INTERNAL CLUSTER SERVICE ONLY &bull; RESTRICTED ACCESS GRANTED VIA LOOPBACK PROXY',
              headers: {
                'X-Cluster-Internal': 'true',
                'X-Server-Node': 'worker-internal-01',
              },
              bodySnippet: `CONFIDENTIAL CLUSTER MASTER TOKEN & FLAG: ${rawFlag}`,
              flag: rawFlag,
            },
          });
        }

        return res.status(HttpStatus.OK).json({
          status: 200,
          preview: {
            url: urlStr,
            title: 'Internal Cluster Daemon (Port 8080)',
            description:
              'Internal HTTP Service Active. Available endpoints: /admin, /metrics, /config',
          },
        });
      }

      // Default external URL simulation (pure in-memory dummy card)
      return res.status(HttpStatus.OK).json({
        status: 200,
        preview: {
          url: urlStr,
          title: 'External Resource Preview',
          description: `Generated OpenGraph preview metadata for: ${urlStr}`,
          statusCode: 200,
        },
      });
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoint: /api/preview',
    });
  }

  // -------------------------------------------------------------------------
  // Challenge 4: Metadata Maze (SSRF - Hard, 375 pts, CWE-918)
  // Scenario: Localhost is blocklisted. Bypass filters to reach simulated cloud metadata.
  // Target: http://169.254.169.254/latest/meta-data/
  // -------------------------------------------------------------------------
  if (slug === 'metadata-maze' || slug === 'ssrf-cloud-metadata-exfiltration') {
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/fetch-asset' ||
      cleanPath === '/api/fetch'
    ) {
      if (!urlStr) {
        return res.status(HttpStatus.OK).json({
          service: 'CloudAsset Asset Pipeline & CDN Ingestion Gateway v5.0',
          status: 'ONLINE',
          message:
            'Ingest remote images and assets. Direct loopback addresses are blocked by WAF policy.',
          usage: {
            method: 'GET or POST',
            endpoint: '/api/fetch-asset?url=http://cdn.example.com/asset.png',
            body: { url: 'http://cdn.example.com/asset.png' },
          },
          securityPolicy:
            'WAF Rule #104: Blocklist active for localhost, 127.0.0.1, 0.0.0.0, and ::1.',
        });
      }

      // Check WAF blocklist (explicitly blocks localhost, 127.0.0.1, 0.0.0.0)
      if (
        /localhost|127\.0\.0\.1|0\.0\.0\.0|::1|127\.\d+\.\d+\.\d+/i.test(urlStr)
      ) {
        return res.status(HttpStatus.FORBIDDEN).json({
          error: 'Security WAF Blocked Request',
          code: 'WAF_BLOCKLIST_HIT',
          message:
            'Access denied by Rule #104: Local loopback addresses are strictly forbidden.',
          blockedTarget: urlStr,
        });
      }

      // Check if URL matches cloud metadata service in standard, decimal, hex, octal, or IPv6 forms
      const isCloudMetadata =
        /169\.254\.169\.254/i.test(urlStr) || // Standard dotted quad
        /2852039166/i.test(urlStr) || // Decimal representation (169*256^3 + 254*256^2 + 169*256 + 254)
        /0xa9fea9fe/i.test(urlStr) || // Hexadecimal representation
        /0251\.0376\.0251\.0376/i.test(urlStr) || // Octal representation
        /\[::ffff:169\.254\.169\.254\]/i.test(urlStr) || // IPv6 mapped
        /metadata\.google\.internal/i.test(urlStr) ||
        /169\.254\.169\.254\.nip\.io/i.test(urlStr);

      if (isCloudMetadata) {
        // Path handling within simulated cloud metadata
        if (/iam|security-credentials|credentials|token|role/i.test(urlStr)) {
          return res.status(HttpStatus.OK).json({
            Code: 'Success',
            Type: 'AWS-HMAC',
            AccessKeyId: 'ASIAV3K98MNC2026ADMIN',
            SecretAccessKey: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY_${rawFlag}`,
            Token: rawFlag,
            Expiration: '2026-12-31T23:59:59Z',
            RoleArn: 'arn:aws:iam::112233445566:role/CloudAssetMasterAdminRole',
            flag: rawFlag,
          });
        }

        return res
          .status(HttpStatus.OK)
          .send(
            `ami-id\nami-launch-index\nami-manifest-path\nhostname\niam/\ninstance-action\ninstance-id\ninstance-type\nlocal-hostname\nlocal-ipv4\npublic-hostname\npublic-ipv4\nsecurity-groups\n(Hint: Request /latest/meta-data/iam/security-credentials/admin-role to retrieve credentials)`,
          );
      }

      // Standard remote asset simulated response
      return res.status(HttpStatus.OK).json({
        status: 200,
        assetUrl: urlStr,
        contentType: 'image/png',
        bytesFetched: 10420,
        message: 'Asset cached successfully.',
      });
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoint: /api/fetch-asset',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Unknown SSRF Challenge Slug',
  });
}
