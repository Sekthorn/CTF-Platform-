import { HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Command Injection Target Microservices (100% In-Memory Simulation)
 * SAFE ARCHITECTURE GUARANTEE:
 * - ZERO execution of real OS commands (NO child_process, exec, spawn, powershell, or cmd.exe).
 * - All command parsing and evaluation takes place strictly in JavaScript memory.
 * - The host operating system, files, and platform administrator account are completely isolated.
 */
export function handleCmdInjectionTarget(
  slug: string,
  subpath: string,
  req: Request,
  res: Response,
  rawFlag: string,
) {
  const cleanPath = subpath.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  // -------------------------------------------------------------------------
  // Challenge 5: Ping Pong (Command Injection - Medium, 150 pts, CWE-78)
  // Scenario: Network diagnostics ping utility.
  // Input reaches a simulated shell interpreter supporting command chaining (; && | ||).
  // -------------------------------------------------------------------------
  if (slug === 'ping-pong') {
    const rawHost =
      req.query.host ||
      req.body?.host ||
      req.query.ip ||
      req.body?.ip ||
      req.query.target ||
      req.body?.target ||
      '';
    const hostInput = String(rawHost).trim();

    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/ping' ||
      cleanPath === '/ping'
    ) {
      if (!hostInput) {
        return res.status(HttpStatus.OK).json({
          tool: 'NetProbe Diagnostic Utility v1.2',
          status: 'ONLINE',
          message:
            'Submit an IP address or hostname to execute ICMP echo diagnostics.',
          usage: {
            method: 'GET or POST',
            endpoint: '/api/ping?host=8.8.8.8',
            body: { host: '8.8.8.8' },
          },
          note: 'Diagnostic service executes under unprivileged container context: uid=1001(diag_worker).',
        });
      }

      // Check for command injection separators: ; , && , || , |
      const hasChaining = /[;&|]/.test(hostInput);

      if (hasChaining) {
        // Extract injected command tokens
        const tokens = hostInput.split(/[;&|]+/).map((t) => t.trim());
        const injectedCommand = tokens.slice(1).join(' ').trim().toLowerCase();

        // 1. Cat flag / read flag simulation
        if (
          /cat\s+.*flag|grep\s+.*flag|head\s+.*flag|tail\s+.*flag|more\s+.*flag|less\s+.*flag/i.test(
            injectedCommand,
          )
        ) {
          return res.status(HttpStatus.OK).json({
            commandExecuted: `ping -c 2 ${tokens[0]} && ${tokens.slice(1).join(' && ')}`,
            pingOutput: `PING ${tokens[0]} (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms\n\n--- ${tokens[0]} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`,
            injectedOutput: `FLAG RECORD [confidential]: ${rawFlag}`,
            flag: rawFlag,
            systemContext: 'SIMULATED_SECURE_RUNTIME (Virtual Sandbox)',
          });
        }

        // 2. ls / dir simulation
        if (/ls|dir/i.test(injectedCommand)) {
          return res.status(HttpStatus.OK).json({
            commandExecuted: `ping -c 2 ${tokens[0]} && ${tokens.slice(1).join(' && ')}`,
            pingOutput: `PING ${tokens[0]} 56(84) bytes of data.`,
            injectedOutput:
              'bin\ndev\netc\nflag.txt\nhome\nlib\nproc\nroot\nsys\ntmp\nusr\nvar',
            hint: 'Target file discovered: flag.txt. Read it using standard shell commands.',
          });
        }

        // 3. id / whoami simulation
        if (/id|whoami/i.test(injectedCommand)) {
          return res.status(HttpStatus.OK).json({
            commandExecuted: `ping -c 2 ${tokens[0]} && ${tokens.slice(1).join(' && ')}`,
            injectedOutput:
              'uid=1001(diag_worker) gid=1001(diag_worker) groups=1001(diag_worker)',
          });
        }

        // Fallback simulated execution output
        return res.status(HttpStatus.OK).json({
          commandExecuted: `ping -c 2 ${tokens[0]} && ${tokens.slice(1).join(' && ')}`,
          pingOutput: `PING ${tokens[0]} 56(84) bytes of data.`,
          injectedOutput: `Simulated shell executed: "${tokens.slice(1).join(' ')}"`,
        });
      }

      // Normal safe ping simulation
      return res.status(HttpStatus.OK).json({
        host: hostInput,
        pingOutput: `PING ${hostInput} 56(84) bytes of data.\n64 bytes from ${hostInput}: icmp_seq=1 ttl=64 time=0.042 ms\n64 bytes from ${hostInput}: icmp_seq=2 ttl=64 time=0.045 ms\n\n--- ${hostInput} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`,
      });
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoint: /api/ping',
    });
  }

  // -------------------------------------------------------------------------
  // Challenge 6: Log Cruncher (Command Injection - Hard, 350 pts, CWE-78)
  // Scenario: Log analysis query tool. Filters strictly block ';' and raw spaces.
  // Bypass requires alternative separators ($IFS, $(...), ||, |, %0a).
  // -------------------------------------------------------------------------
  if (slug === 'log-cruncher') {
    const rawQuery =
      req.query.query ||
      req.body?.query ||
      req.query.filter ||
      req.body?.filter ||
      req.query.log ||
      req.body?.log ||
      '';
    const queryInput = String(rawQuery).trim();

    if (
      cleanPath === '/' ||
      cleanPath === '/api' ||
      cleanPath === '/api/logs' ||
      cleanPath === '/api/logs/query' ||
      cleanPath === '/api/logs/crunch'
    ) {
      if (!queryInput) {
        return res.status(HttpStatus.OK).json({
          service: 'LogCrunch Streamlined Log Aggregator v3.0',
          status: 'ONLINE',
          message:
            'Submit pattern matching criteria for log parsing. Strict input filtering is enforced.',
          usage: {
            method: 'GET or POST',
            endpoint: '/api/logs/query?query=ERROR',
            body: { query: 'ERROR' },
          },
          securityPolicy:
            'WAF Rule #82: Semicolon (;) and standard whitespace characters are rejected.',
        });
      }

      // Strict WAF filter: Rejects raw semicolon (;) and raw space (' ')
      if (/;/.test(queryInput)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Security Filter Triggered',
          code: 'FILTER_SEMICOLON_BLOCKED',
          message:
            'Syntax error: Semicolon (;) is prohibited by security policy.',
        });
      }

      if (/ /.test(queryInput)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Security Filter Triggered',
          code: 'FILTER_WHITESPACE_BLOCKED',
          message:
            'Syntax error: Standard whitespace (space) is prohibited by query sanitizer.',
        });
      }

      // Check for bypass patterns:
      // 1. Whitespace bypass via $IFS, ${IFS}, $IFS$9, or <
      // 2. Chaining or command substitution via |, ||, &&, $(...), `...`, or newline
      const usesIfs = /\$(?:IFS|\{IFS\}|IFS\$9)/i.test(queryInput);
      const usesSubshell = /\$\([^\)]+\)|`[^`]+`/i.test(queryInput);
      const usesPipeOrAnd = /[|&]/.test(queryInput);

      if (usesIfs || usesSubshell || usesPipeOrAnd) {
        // Normalize simulated input by replacing $IFS representations with spaces
        const normalized = queryInput
          .replace(/\$(?:IFS|\{IFS\}|IFS\$9)/g, ' ')
          .toLowerCase();

        // Check if normalized command reads flag.txt
        if (
          /cat\s+.*flag|grep\s+.*flag|head\s+.*flag|more\s+.*flag|\/flag/i.test(
            normalized,
          )
        ) {
          return res.status(HttpStatus.OK).json({
            status: 200,
            filterPassed: true,
            bypassedWith: usesIfs
              ? 'Internal Field Separator ($IFS)'
              : 'Subshell Expansion',
            parsedQuery: normalized,
            matchedLogs: [
              '[2026-03-01 10:14:02] INFO System boot initialized.',
              '[2026-03-01 10:14:03] AUTH Root cluster security credentials mounted.',
              `[2026-03-01 10:14:04] EXPLOIT_EXTRACTED_FLAG: ${rawFlag}`,
              '[2026-03-01 10:14:05] AUDIT Log indexing completed successfully.',
            ],
            flag: rawFlag,
          });
        }

        return res.status(HttpStatus.OK).json({
          status: 200,
          filterPassed: true,
          message:
            'Query executed without matches. Verify target filename (flag.txt).',
          normalizedQuery: normalized,
        });
      }

      // Default log search simulation
      return res.status(HttpStatus.OK).json({
        status: 200,
        query: queryInput,
        matchedLogs: [
          `[2026-03-01 12:00:00] INFO Searching logs for pattern: "${queryInput}"`,
          '[2026-03-01 12:00:01] INFO No anomalous events recorded.',
        ],
      });
    }

    return res.status(HttpStatus.NOT_FOUND).json({
      error: 'Endpoint Not Found',
      message: 'Available endpoint: /api/logs/query',
    });
  }

  return res.status(HttpStatus.NOT_FOUND).json({
    error: 'Unknown Command Injection Challenge Slug',
  });
}
