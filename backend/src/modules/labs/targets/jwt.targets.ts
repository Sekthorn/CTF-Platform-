import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';

/**
 * JWT Target Microservices (100% In-Memory Simulation)
 * SAFE ARCHITECTURE & ADMIN ISOLATION GUARANTEE:
 * - This microservice is completely isolated from the WebSec CTF platform's own authentication system.
 * - The platform administrator account (`admin`) and platform JWT secret are NEVER exposed or touched.
 * - All token issuance, algorithm parsing, and signature verification take place in safe local JavaScript functions.
 */

// Simulated public RSA key published for the Key Confusion challenge
const SIMULATED_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0r3N9zF2vGqT8k2wPz7N
4b8X1mQ9e4L0sY2kR7tW5oP3mX8jV1nC6bA4dE8fG0hI2jK4lM6nO8pQ0rS2tU4v
W6xY8zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM
9nO1pQ3rS5tU7vW9xY1zA3bC5dE7fG9hI1jK3lM5nO7pQ9rS1tU3vW5xY7zA9bC1
dE3fG5hI7jK9lM1nO3pQ5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ1rS3t
U5vW7xY9zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK
7wIDAQAB
-----END PUBLIC KEY-----`;

export function handleJwtTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const cleanPath = subpath.replace(/\/+$/, '') || '/';
  const authHeader = req.headers['authorization'] || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : (req.query.token as string) || (req.body?.token as string) || '';

  // -------------------------------------------------------------------------
  // Challenge 7: Token Trouble (JWT - Medium, 200 pts, CWE-347)
  // Scenario: alg:none or role claim tampering gives an admin token.
  // Real platform admin is completely protected; target uses isolated portal tokens.
  // -------------------------------------------------------------------------
  if (slug === 'token-trouble') {
    // 1. Discovery / Guest Token Issuer
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/portal' ||
      cleanPath === '/api/token/guest'
    ) {
      const guestHeader = Buffer.from(
        JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
      ).toString('base64url');
      const guestPayload = Buffer.from(
        JSON.stringify({
          sub: 'guest-1048',
          username: 'contractor_guest',
          role: 'guest',
          scope: ['read:public_docs'],
          iss: 'Apex-Portal-Auth-Service',
          iat: Math.floor(Date.now() / 1000),
        }),
      ).toString('base64url');
      const guestSig = crypto
        .createHmac('sha256', 'simulated_isolated_target_secret_2026')
        .update(`${guestHeader}.${guestPayload}`)
        .digest('base64url');

      const sampleToken = `${guestHeader}.${guestPayload}.${guestSig}`;

      return res.status(HttpStatus.OK).json({
        portal: 'Apex Enterprise Employee Gateway v3.1',
        status: 'ONLINE',
        isolatedEnvironmentNotice:
          'Target microservice token only. Platform admin account is protected.',
        message:
          'Authenticate via Bearer token to inspect restricted administrative directories.',
        endpoints: {
          guestTokenIssuer: '/api/token/guest',
          protectedVault: '/api/portal/admin-records',
        },
        sampleGuestToken: sampleToken,
      });
    }

    // 2. Protected Admin Records Endpoint
    if (
      cleanPath === '/api/portal/admin-records' ||
      cleanPath === '/api/portal/vault'
    ) {
      if (!tokenFromHeader) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Authentication Required',
          message:
            'Provide a valid JWT token in Authorization: Bearer <token> header.',
        });
      }

      const parts = tokenFromHeader.split('.');
      if (parts.length < 2) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Malformed Token',
          message:
            'JWT must contain header, payload, and signature components.',
        });
      }

      try {
        const headerJson = JSON.parse(
          Buffer.from(parts[0], 'base64url').toString('utf8'),
        );
        const payloadJson = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf8'),
        );

        const alg = String(headerJson.alg || '').toLowerCase();
        const role = String(payloadJson.role || '').toLowerCase();

        // Flaw Check: alg:none or missing signature accepted!
        if (
          alg === 'none' ||
          alg === 'none-algorithm' ||
          !parts[2] ||
          parts[2] === ''
        ) {
          if (
            role === 'admin' ||
            role === 'administrator' ||
            payloadJson.isAdmin === true
          ) {
            return res.status(HttpStatus.OK).json({
              status: 200,
              authenticatedRole: role,
              bypassType:
                'Unsigned / alg:none token accepted by vulnerable validator',
              adminRecord: {
                title: 'Executive Security Audit & Master Key Vault',
                authorizedUser: payloadJson.username || 'admin',
                confidentialRecordFlag: rawFlag,
              },
              flag: rawFlag,
            });
          }

          return res.status(HttpStatus.FORBIDDEN).json({
            error: 'Insufficient Privileges',
            currentRole: role,
            message:
              'Token accepted without signature verification, but role "admin" is required.',
          });
        }

        // Standard token verification (rejecting non-admin)
        if (role !== 'admin') {
          return res.status(HttpStatus.FORBIDDEN).json({
            error: 'Access Denied',
            message: `User with role "${role}" is not authorized to view admin records.`,
          });
        }

        // Token claimed admin with unsupported secret
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Signature Verification Failed',
          message: 'The token signature does not match the target signing key.',
        });
      } catch (e) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid Token Encoding',
          message: 'Failed to decode base64url JSON segments.',
        });
      }
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message:
        'Available endpoints: /api/portal, /api/token/guest, /api/portal/admin-records',
    });
  }

  // -------------------------------------------------------------------------
  // Challenge 8: Key Confusion (JWT - Hard, 400 pts, CWE-327)
  // Scenario: RS256 to HS256 algorithm confusion using public key from /.well-known/jwks.json
  // -------------------------------------------------------------------------
  if (slug === 'key-confusion') {
    // 1. Well-known JWKS / Public Key endpoint
    if (
      cleanPath === '/.well-known/jwks.json' ||
      cleanPath === '/.well-known/public.pem'
    ) {
      return res.status(HttpStatus.OK).json({
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            alg: 'RS256',
            kid: 'apex-auth-rsa-key-01',
            pem: SIMULATED_PUBLIC_KEY_PEM,
            n: '0r3N9zF2vGqT8k2wPz7N...',
            e: 'AQAB',
          },
        ],
        documentation:
          'Public verification key for Apex Identity Service (RS256)',
      });
    }

    // 2. Target Discovery / Service Status
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/v2' ||
      cleanPath === '/api/v2/secure-dashboard'
    ) {
      if (!tokenFromHeader) {
        return res.status(HttpStatus.OK).json({
          service: 'Apex NextGen Cloud Management Dashboard v2.0',
          status: 'ONLINE',
          message:
            'Authenticate via RS256 JWT to access executive infrastructure dashboard.',
          publicJwksEndpoint: '/.well-known/jwks.json',
          targetDashboard: '/api/v2/secure-dashboard',
          usage: 'Pass token via Authorization: Bearer <token>',
        });
      }

      const parts = tokenFromHeader.split('.');
      if (parts.length !== 3) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid JWT Format',
          message: 'Token must have header.payload.signature',
        });
      }

      try {
        const headerJson = JSON.parse(
          Buffer.from(parts[0], 'base64url').toString('utf8'),
        );
        const payloadJson = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf8'),
        );
        const providedSignature = parts[2];

        const alg = String(headerJson.alg || '').toUpperCase();
        const role = String(payloadJson.role || '').toLowerCase();

        // Algorithm Confusion Check:
        // Verifier flaw: When alg is changed to HS256, it verifies the signature
        // using the RSA Public Key string as the HMAC secret!
        if (alg === 'HS256') {
          // Check signature against either the PEM string or normalized public key
          const expectedSig1 = crypto
            .createHmac('sha256', SIMULATED_PUBLIC_KEY_PEM)
            .update(`${parts[0]}.${parts[1]}`)
            .digest('base64url');

          const expectedSig2 = crypto
            .createHmac('sha256', SIMULATED_PUBLIC_KEY_PEM.trim())
            .update(`${parts[0]}.${parts[1]}`)
            .digest('base64url');

          const sigMatches =
            providedSignature === expectedSig1 ||
            providedSignature === expectedSig2 ||
            crypto.timingSafeEqual(
              Buffer.from(providedSignature),
              Buffer.from(expectedSig1),
            ) ||
            crypto.timingSafeEqual(
              Buffer.from(providedSignature),
              Buffer.from(expectedSig2),
            );

          if (sigMatches) {
            if (role === 'admin' || role === 'administrator') {
              return res.status(HttpStatus.OK).json({
                status: 200,
                success: true,
                vulnerabilityExploited:
                  'RS256 -> HS256 Algorithm Key Confusion',
                message:
                  'Access granted. Verification library treated RSA public key as symmetric HMAC shared secret.',
                dashboard: {
                  tenant: 'Apex Global Infrastructure Cloud',
                  authorizedRole: 'admin',
                  executiveVaultFlag: rawFlag,
                },
                flag: rawFlag,
              });
            }

            return res.status(HttpStatus.FORBIDDEN).json({
              error: 'Forbidden',
              message:
                'HMAC signature valid with public key, but role "admin" is required.',
            });
          }

          return res.status(HttpStatus.UNAUTHORIZED).json({
            error: 'Signature Mismatch',
            message:
              'HMAC-SHA256 signature did not match. (Hint: Did you sign using the public key from /.well-known/jwks.json?)',
          });
        }

        // RS256 standard rejection (since player does not have private key)
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Unauthorized',
          algUsed: alg,
          message: 'RS256 private key signature verification failed.',
        });
      } catch (e) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Token Decode Error',
          message: 'Unable to parse JWT claims.',
        });
      }
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message:
        'Available endpoints: /.well-known/jwks.json, /api/v2/secure-dashboard',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Unknown JWT Challenge Slug',
  });
}
