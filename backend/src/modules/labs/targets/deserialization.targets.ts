import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Insecure Deserialization Target Microservices (100% In-Memory Simulation)
 * SAFE ARCHITECTURE GUARANTEE:
 * - ZERO execution of native eval(), vm.runInContext(), or native unserialize().
 * - All object decoding and gadget inspection is performed through pure JavaScript property parsers.
 * - Host machine files, processes, and administrator accounts are completely isolated.
 */
export function handleDeserializationTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const cleanPath = subpath.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  // -------------------------------------------------------------------------
  // Challenge 11: Cookie Monster (Insecure Deserialization - Medium, 200 pts, CWE-502)
  // Scenario: Base64 cookie holds serialized object with an isAdmin boolean field.
  // -------------------------------------------------------------------------
  if (slug === 'cookie-monster') {
    // 1. Profile Discovery & Default Cookie
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/profile' ||
      cleanPath === '/api/dashboard'
    ) {
      const cookieHeader = req.headers?.['cookie'] || '';
      const customHeader = req.headers?.['x-session-data'] || '';

      // Look for session_data in cookies or query/body
      const rawCookie =
        extractCookie(cookieHeader, 'session_data') ||
        (customHeader as string) ||
        (req.query?.session as string) ||
        req.body?.session_data ||
        '';

      if (!rawCookie) {
        // Issue default guest session cookie
        const defaultObject = {
          username: 'guest_researcher',
          role: 'guest',
          isAdmin: false,
          created: '2026-03-01',
        };
        const defaultBase64 = Buffer.from(
          JSON.stringify(defaultObject),
        ).toString('base64');
        res.setHeader(
          'Set-Cookie',
          `session_data=${defaultBase64}; Path=/; SameSite=Lax`,
        );

        return res.status(HttpStatus.OK).json({
          application: 'Apex Enterprise Portal — User Profile Manager',
          status: 'ONLINE',
          message: 'Welcome! Session initialized with guest profile cookie.',
          cookieName: 'session_data',
          defaultCookieValue: defaultBase64,
          decodedObject: defaultObject,
          instructions:
            'Inspect and modify the session_data serialized cookie to elevate your privileges to administrator.',
        });
      }

      // Decode Base64 serialized payload
      try {
        const decodedText = Buffer.from(rawCookie, 'base64').toString('utf8');

        // Check if payload is JSON serialized or PHP serialized
        let isAdmin = false;
        let username = 'guest';

        // JSON format
        if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
          const parsed = JSON.parse(decodedText);
          if (
            parsed.isAdmin === true ||
            parsed.isAdmin === 'true' ||
            parsed.role === 'admin'
          ) {
            isAdmin = true;
            username = parsed.username || 'admin';
          }
        }

        // PHP serialized format (e.g., O:4:"User":2:{...s:7:"isAdmin";b:1;...})
        if (/isAdmin";b:1|isAdmin";i:1|role";s:5:"admin"/i.test(decodedText)) {
          isAdmin = true;
          username = 'admin';
        }

        if (isAdmin) {
          return res.status(HttpStatus.OK).json({
            status: 200,
            authenticatedAs: username,
            isAdmin: true,
            bypassNote:
              'Insecure deserialization successful! Serialized object property isAdmin modified.',
            adminPortal: {
              vaultStatus: 'UNLOCKED',
              confidentialLicenseFlag: rawFlag,
            },
            flag: rawFlag,
          });
        }

        return res.status(HttpStatus.OK).json({
          status: 200,
          authenticatedAs: username,
          isAdmin: false,
          message:
            'Standard profile loaded. Administrative vault access requires isAdmin: true.',
          receivedData: decodedText,
        });
      } catch (err) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Deserialization Parse Error',
          message:
            'Could not deserialize base64 payload. Ensure payload is valid base64 JSON or serialized object.',
        });
      }
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoint: /api/profile',
    });
  }

  // -------------------------------------------------------------------------
  // Challenge 12: Object Lessons (Insecure Deserialization - Hard, 400 pts, CWE-502)
  // Scenario: Simulated sandbox runtime evaluates magic methods in serialized payloads.
  // Gadget chain triggers virtual file reader method for /flag.txt.
  // -------------------------------------------------------------------------
  if (slug === 'object-lessons') {
    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/analytics' ||
      cleanPath === '/api/analytics/ingest' ||
      cleanPath === '/api/sandbox/run'
    ) {
      const rawPayload =
        req.body?.payload ||
        req.body?.object ||
        req.query?.payload ||
        req.query?.object ||
        '';

      if (!rawPayload) {
        return res.status(HttpStatus.OK).json({
          service: 'Apex Telemetry & Object Ingestion Engine v3.4',
          status: 'ONLINE',
          message:
            'Submit serialized diagnostic object telemetry for automated ingestion.',
          samplePayload: {
            payload: Buffer.from(
              JSON.stringify({
                class: 'TelemetryLogger',
                action: 'logMetric',
                data: 'latency=24ms',
              }),
            ).toString('base64'),
          },
          supportedClasses: [
            'TelemetryLogger',
            'MetricAggregator',
            'FileReaderGadget',
          ],
          instructions:
            'Post base64 serialized payload to /api/analytics/ingest to invoke diagnostic routines.',
        });
      }

      try {
        // Decode payload (supports raw string or base64)
        let decodedStr = String(rawPayload);
        if (!decodedStr.includes('{') && !decodedStr.includes('O:')) {
          decodedStr = Buffer.from(decodedStr, 'base64').toString('utf8');
        }

        // SIMULATED GADGET CHAIN EVALUATOR:
        // Detects gadget invocations that request flag.txt (e.g. FileReaderGadget, magic methods __destruct, action: "read")
        const targetsFlag = /flag\.txt|\/flag/i.test(decodedStr);
        const hasGadgetClass =
          /FileReader|FileReaderGadget|FileScanner|LogDump|DumpSecret/i.test(
            decodedStr,
          );
        const hasMagicMethod =
          /__destruct|__wakeup|__toString|action.*read|method.*read/i.test(
            decodedStr,
          );

        if (
          targetsFlag &&
          (hasGadgetClass ||
            hasMagicMethod ||
            decodedStr.includes('FileReader'))
        ) {
          return res.status(HttpStatus.OK).json({
            status: 200,
            gadgetChainExecuted: true,
            classNameInvoked: 'FileReaderGadget::__destruct()',
            simulatedSandboxResult: {
              fileRead: '/flag.txt',
              content: `CONFIDENTIAL SYSTEM FLAG: ${rawFlag}`,
            },
            flag: rawFlag,
          });
        }

        // Check if player instantiated the gadget without specifying flag.txt
        if (hasGadgetClass) {
          return res.status(HttpStatus.OK).json({
            status: 200,
            gadgetChainExecuted: true,
            message:
              'Gadget class recognized, but target file path was empty. Point the file property to "flag.txt".',
            decodedInspection: decodedStr,
          });
        }

        return res.status(HttpStatus.OK).json({
          status: 200,
          message:
            'Telemetry object ingested. No executable gadget method triggered.',
          decodedObject: decodedStr,
        });
      } catch (e) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Object Parse Failure',
          message: 'Unable to parse serialized object structure.',
        });
      }
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoint: /api/analytics/ingest',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Unknown Deserialization Challenge Slug',
  });
}

function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
