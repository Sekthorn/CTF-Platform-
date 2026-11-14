import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Copy,
  Check,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
  Radio,
  Lock,
  Unlock,
  Clock,
  Sparkles,
  ShieldCheck,
  Terminal,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { ConfettiCelebration } from '@/components/ui/ConfettiCelebration';
import { SolveCelebrationModal } from '@/components/ui/SolveCelebrationModal';
import { apiClient } from '@/services/api';
import { labService } from '@/services/lab.service';
import { mockChallenges } from '@/data/mock/challenges';
import { Challenge } from '@/types';

interface ChallengeHint {
  id: string;
  title: string;
  costPoints: number;
  content: string;
}

interface SubmissionAttempt {
  flag: string;
  isCorrect: boolean;
  timestamp: string;
}

export const ChallengeWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Challenge State
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hints State
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [hintToUnlock, setHintToUnlock] = useState<ChallengeHint | null>(null);

  // Target Information State (Host & Port displayed separately)
  const [targetHost, setTargetHost] = useState<string>('127.0.0.1');
  const [targetPort, setTargetPort] = useState<string>('5173');
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [copiedHostPort, setCopiedHostPort] = useState<boolean>(false);
  const [copiedTargetUrl, setCopiedTargetUrl] = useState<boolean>(false);

  // Submission State
  const [flagInput, setFlagInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    status: 'success' | 'incorrect' | 'already_solved' | 'rate_limited' | null;
    message: string;
    pointsAwarded?: number;
    unlockedLesson?: { id: string; title: string; slug: string } | null;
  }>({ status: null, message: '' });
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Rate Limiting & Cooldown State (Max 5 attempts / 60 seconds)
  const [recentAttempts, setRecentAttempts] = useState<number[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Session Attempts Log
  const [submissionsLog, setSubmissionsLog] = useState<SubmissionAttempt[]>([]);

  // 1. Detect Host & Port from current browser environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || '127.0.0.1';
      const port =
        window.location.port ||
        (window.location.protocol === 'https:' ? '443' : '80');
      setTargetHost(hostname);
      setTargetPort(port);
    }
  }, []);

  // 2. Fetch challenge metadata
  useEffect(() => {
    setLoading(true);

    // Try finding in mock list first for fast initial display
    const local = mockChallenges.find((c) => c.slug === slug);
    if (local) {
      setChallenge(local);
    }

    // Fetch live metadata from backend API
    apiClient
      .get(`/challenges/${slug}`)
      .then((res) => {
        if (res.data?.data) {
          const apiData = res.data.data;
          setChallenge((prev) => ({
            id: apiData.id || prev?.id || 'ch-01',
            title: apiData.title || prev?.title || 'Challenge',
            slug: apiData.slug || slug || '',
            category: apiData.category?.name || prev?.category || 'Web Security',
            difficulty: apiData.difficulty || prev?.difficulty || 'Medium',
            points: apiData.points || prev?.points || 100,
            owaspReference:
              apiData.references?.[0]?.identifier || prev?.owaspReference || 'A01:2021',
            cweReference:
              apiData.references?.[1]?.identifier || prev?.cweReference || 'CWE-269',
            shortDescription:
              apiData.description || prev?.shortDescription || '',
            description: apiData.description || prev?.description,
            instructions: apiData.instructions || prev?.instructions || '',
            objectives: apiData.objectives || prev?.objectives || '',
            solved:
              apiData.userProgress?.status === 'SOLVED' || prev?.solved || false,
            solvedCount: apiData.solvedCount || prev?.solvedCount || 0,
            author: 'WebSec Core Team',
            createdAt: apiData.createdAt || '2026-01-01',
            tags: prev?.tags || ['CTF', 'Web Security'],
          }));
        }
      })
      .catch(() => {
        // Fallback gracefully to local mock
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // 3. Retrieve player target instance identifier (opaque token, no username in URL)
  useEffect(() => {
    if (!challenge?.id) return;
    labService
      .getTarget(challenge.id)
      .then((res) => {
        if (res?.instanceId) {
          setInstanceId(res.instanceId);
        }
      })
      .catch(() => {
        // Lab instance endpoint fallback
      });
  }, [challenge?.id]);

  // 4. Rate-Limiting Cooldown Countdown Timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Progressive Hints Definition
  const hints: ChallengeHint[] = [
    {
      id: 'hint-1',
      title: 'Hint 1: Reconnaissance & Parameter Behavior',
      costPoints: 0, // Free vague hint
      content:
        'Inspect how the application exchanges state with the server during requests. Analyze response status codes and hidden headers. Does the server truly verify the transition or trust client parameters?',
    },
    {
      id: 'hint-2',
      title: 'Hint 2: Parameter Tampering & Logic Manipulation',
      costPoints: 10, // Deducts 10 pts
      content:
        'Use an intercepting proxy (e.g. Burp Suite or OWASP ZAP) to intercept the HTTP request and response flow. Observe whether modifying client-supplied privilege fields or role status bypasses backend verification.',
    },
  ];

  // Progressive Hint Unlock Handlers
  const handleRequestUnlockHint = (hint: ChallengeHint) => {
    if (revealedHints.has(hint.id)) {
      // Toggle accordion if already unlocked
      setRevealedHints((prev) => {
        const next = new Set(prev);
        next.delete(hint.id);
        return next;
      });
      return;
    }

    if (hint.costPoints > 0) {
      // Show confirmation dialog before unlocking with point deduction
      setHintToUnlock(hint);
    } else {
      // Free hint unlocks immediately
      setRevealedHints((prev) => new Set(prev).add(hint.id));
    }
  };

  const confirmUnlockHint = () => {
    if (hintToUnlock) {
      setRevealedHints((prev) => new Set(prev).add(hintToUnlock.id));
      setHintToUnlock(null);
    }
  };

  // High-level methodology guidance by vulnerability category (general, without spoiling exploit details)
  const getCategoryGuideline = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('foundations') || cat.includes('fundamentals')) {
      return 'Inspect HTTP requests/responses, security headers (HSTS, Set-Cookie, Allow, CORS Origin reflection), browser storage boundaries, and OWASP/CVSS risk classifications using DevTools Network tab, curl -i, or an intercepting proxy.';
    }

    if (cat.includes('auth') || cat.includes('access')) {
      return 'Inspect how user permissions, 2FA validation, session states, and role checks are performed. Intercept authentication requests and analyze whether the application relies on client-side status codes or unverified trust states.';
    }
    if (cat.includes('sql') || (cat.includes('injection') && !cat.includes('command'))) {
      return 'Identify input fields communicating with the database. Probe with boundary characters (\', ", --) and analyze differential responses to extract schema structures, table rows, or bypass credentials.';
    }
    if (cat.includes('xss') || cat.includes('scripting')) {
      return 'Look for user input reflected directly into HTML responses or handled by dangerous DOM sinks. Analyze context boundaries, character sanitization, and execution of client-side payloads.';
    }
    if (cat.includes('file') || cat.includes('traversal')) {
      return 'Observe how path parameters, document retrieval endpoints, or upload routines handle relative directory sequences (../) and file extensions to access sensitive server files.';
    }
    if (cat.includes('api') || cat.includes('server-side vulnerabilities')) {
      return 'Analyze REST endpoints and JSON structures. Probe for unlisted object attributes, Mass Assignment privileges, BOLA/BOPLA weaknesses, or rate limit bypass headers.';
    }
    if (cat.includes('idor') || cat.includes('direct object')) {
      return 'Inspect sequential, numeric, or UUID object identifiers in URLs and API payloads. Alter identifiers to cross authorization boundaries and test unsupported HTTP methods.';
    }
    if (cat.includes('ssrf') || cat.includes('forgery')) {
      return 'Locate endpoints fetching remote URLs or webhooks. Probe internal network interfaces (127.0.0.1, localhost) and simulated cloud metadata endpoints using IP representation and schema bypasses.';
    }

    if (cat.includes('command') || cat.includes('cmd')) {
      return 'Identify diagnostics, ping tools, or system utilities that pass user input to shell interpreters. Inject shell command separators (;, &&, |) and evade character filters using environment variables ($IFS).';
    }
    if (cat.includes('jwt') || cat.includes('token')) {
      return 'Examine JSON Web Token structure across headers and claims. Test algorithm downgrade (alg: none), RSA to HMAC key confusion with public keys, or role claim tampering without signature checks.';
    }
    if (cat.includes('business') || cat.includes('logic')) {
      return 'Map multi-step workflows, coupon redemption, and asset checkout operations. Probe for numerical boundary flaws (negative quantities) or time-of-check to time-of-use (TOCTOU) race conditions.';
    }
    if (cat.includes('deserialization') || cat.includes('object')) {
      return 'Identify serialized objects in cookies or payload bodies. Analyze serialized class properties, assemble gadget chains, and tamper with state variables to trigger internal execution sinks.';
    }
    return 'Inspect HTTP traffic, probe parameter boundaries, and analyze server-side validation behavior to uncover the hidden flag.';
  };

  // Dynamic 3-stage testing methodology based on the challenge
  const getTestingSteps = (c: Challenge) => {
    const cat = (c.category || '').toLowerCase();
    const title = (c.title || '').toLowerCase();

    if (title.includes('2fa') || title.includes('mfa') || title.includes('multi-factor')) {
      return [
        {
          num: 1,
          name: 'Traffic Interception',
          color: 'emerald',
          desc: 'Monitor the 2FA verification request in Burp Suite or browser DevTools Network tab.',
        },
        {
          num: 2,
          name: 'Response Tampering',
          color: 'cyan',
          desc: 'Submit an invalid code, intercept the server response, and alter HTTP status code or JSON success flags to true.',
        },
        {
          num: 3,
          name: 'Flag Extraction',
          color: 'amber',
          desc: 'Forward the modified response to fool client-side navigation and access the dashboard flag.',
        },
      ];
    }

    if (cat.includes('foundations') || cat.includes('fundamentals')) {
      return [
        {
          num: 1,
          name: 'Inspect HTTP & Origins',
          color: 'emerald',
          desc: 'Request the target endpoint with Browser DevTools (Network) or curl -i to inspect status codes, headers, and cookies.',
        },
        {
          num: 2,
          name: 'Probe Policy Boundaries',
          color: 'cyan',
          desc: 'Test HTTP verbs (OPTIONS/PUT), Origin reflection, SameSite/HttpOnly flags, SOP tuples, or HSTS headers.',
        },
        {
          num: 3,
          name: 'Verify & Capture Flag',
          color: 'amber',
          desc: 'Submit the verified security finding or tampered proxy payload to obtain and capture the flag.',
        },
      ];
    }

    if (cat.includes('auth') || cat.includes('access')) {
      return [
        {
          num: 1,
          name: 'Reconnaissance',
          color: 'emerald',
          desc: 'Inspect authentication flow, session cookies, password reset parameters, and access controls.',
        },
        {
          num: 2,
          name: 'Privilege Testing',
          color: 'cyan',
          desc: 'Probe session tokens, default credentials, role parameters, or force-browse protected routes.',
        },
        {
          num: 3,
          name: 'Flag Capture',
          color: 'amber',
          desc: 'Bypass authorization barriers to access restricted administrative assets and exfiltrate the flag.',
        },
      ];
    }

    if (cat.includes('idor') || cat.includes('direct object')) {
      return [
        {
          num: 1,
          name: 'ID Enumeration',
          color: 'emerald',
          desc: 'Identify sequential or UUID object references in URL parameters, API routes, or headers.',
        },
        {
          num: 2,
          name: 'Boundary Probing',
          color: 'cyan',
          desc: 'Modify target identifiers to reference admin records and test HTTP verb tampering (GET vs PUT).',
        },
        {
          num: 3,
          name: 'Flag Retrieval',
          color: 'amber',
          desc: 'Extract private data or administrative invoices containing the dynamic flag.',
        },
      ];
    }

    if (cat.includes('ssrf') || cat.includes('forgery')) {
      return [
        {
          num: 1,
          name: 'Input Tracing',
          color: 'emerald',
          desc: 'Locate user-supplied URL inputs in preview tools, PDF generators, or media fetching services.',
        },
        {
          num: 2,
          name: 'Loopback & Metadata',
          color: 'cyan',
          desc: 'Target internal endpoints (127.0.0.1, 169.254.169.254) using IP encodings or schema bypasses.',
        },
        {
          num: 3,
          name: 'Internal Exfiltration',
          color: 'amber',
          desc: 'Capture the internal service response or cloud credentials revealing the flag.',
        },
      ];
    }

    if (cat.includes('command') || cat.includes('cmd')) {
      return [
        {
          num: 1,
          name: 'Sink Detection',
          color: 'emerald',
          desc: 'Identify system utilities (ping, log analyzer) executing external system commands.',
        },
        {
          num: 2,
          name: 'Filter Evasion',
          color: 'cyan',
          desc: 'Inject command separators (;, &&, |) and bypass whitespace filters with ${IFS} or $().',
        },
        {
          num: 3,
          name: 'Command Capture',
          color: 'amber',
          desc: 'Execute file read commands (cat flag.txt) inside the simulated sandbox to capture the flag.',
        },
      ];
    }

    if (cat.includes('jwt') || cat.includes('token')) {
      return [
        {
          num: 1,
          name: 'Token Inspection',
          color: 'emerald',
          desc: 'Decode JWT tokens with jwt.io or CyberChef to inspect header algorithms and claim structures.',
        },
        {
          num: 2,
          name: 'Cryptographic Tampering',
          color: 'cyan',
          desc: 'Test alg: none signature evasion, RS256-to-HS256 key confusion, or privilege claim elevation.',
        },
        {
          num: 3,
          name: 'Authenticated Exploit',
          color: 'amber',
          desc: 'Send forged tokens in Authorization Bearer headers to access the admin portal and flag.',
        },
      ];
    }

    if (cat.includes('business') || cat.includes('logic')) {
      return [
        {
          num: 1,
          name: 'Workflow Mapping',
          color: 'emerald',
          desc: 'Map multi-step state transitions, coupon redemptions, wallet balances, or checkout totals.',
        },
        {
          num: 2,
          name: 'Logic & Race Probing',
          color: 'cyan',
          desc: 'Probe negative numbers, price tampering, or send rapid concurrent requests to trigger TOCTOU races.',
        },
        {
          num: 3,
          name: 'State Desync & Flag',
          color: 'amber',
          desc: 'Purchase target items for zero cost or duplicate reward balance to obtain the flag.',
        },
      ];
    }

    if (cat.includes('deserialization') || cat.includes('object')) {
      return [
        {
          num: 1,
          name: 'Serialization Audit',
          color: 'emerald',
          desc: 'Identify serialized objects in base64 cookies, session tokens, or structured API inputs.',
        },
        {
          num: 2,
          name: 'Gadget Crafting',
          color: 'cyan',
          desc: 'Tamper with object fields (isAdmin: true) or chain gadget classes that execute file reader methods.',
        },
        {
          num: 3,
          name: 'Payload Ingestion',
          color: 'amber',
          desc: 'Submit the crafted serialized object to trigger deserialization and reveal the flag.',
        },
      ];
    }

    if (cat.includes('sql') || cat.includes('injection')) {
      return [
        {
          num: 1,
          name: 'Injection Probing',
          color: 'emerald',
          desc: 'Test input fields with single quotes, comments (--), and arithmetic expressions for SQL anomalies.',
        },
        {
          num: 2,
          name: 'Schema Enumeration',
          color: 'cyan',
          desc: 'Construct UNION SELECT payloads or boolean/time blind conditions to extract database tables.',
        },
        {
          num: 3,
          name: 'Data Extraction',
          color: 'amber',
          desc: 'Extract administrator credentials or secret database rows holding the challenge flag.',
        },
      ];
    }

    if (cat.includes('xss') || cat.includes('scripting')) {
      return [
        {
          num: 1,
          name: 'Sink & Source Tracing',
          color: 'emerald',
          desc: 'Locate user input reflection points in HTML responses, attributes, or client DOM sinks.',
        },
        {
          num: 2,
          name: 'Filter & Context Break',
          color: 'cyan',
          desc: 'Break out of quoting contexts using closing tags or event handlers (<img src=x onerror=...>).',
        },
        {
          num: 3,
          name: 'Script Execution',
          color: 'amber',
          desc: 'Execute JavaScript to read secret storage (cookies, localStorage) or trigger the target dialog flag.',
        },
      ];
    }

    if (cat.includes('file') || cat.includes('traversal')) {
      return [
        {
          num: 1,
          name: 'Parameter Inspection',
          color: 'emerald',
          desc: 'Identify parameters handling file downloads, inclusions, or templates (?file=, ?page=).',
        },
        {
          num: 2,
          name: 'Directory Traversal',
          color: 'cyan',
          desc: 'Test relative path sequences (../, ....//), null-byte or encoding tricks to escape root folders.',
        },
        {
          num: 3,
          name: 'File Exfiltration',
          color: 'amber',
          desc: 'Read system files (/etc/passwd) or dedicated flag.txt files to capture the dynamic token.',
        },
      ];
    }

    // Default Fallback
    return [
      {
        num: 1,
        name: 'Reconnaissance',
        color: 'emerald',
        desc: 'Analyze request and response structures using DevTools or an intercepting proxy.',
      },
      {
        num: 2,
        name: 'Parameter Testing',
        color: 'cyan',
        desc: 'Probe unlisted parameters, boundary inputs, or client trust assumptions.',
      },
      {
        num: 3,
        name: 'Flag Capture',
        color: 'amber',
        desc: 'Locate and exfiltrate the dynamic flag, then submit it in the capture panel.',
      },
    ];
  };

  // Dynamic suggested tools tailored to the specific challenge
  const getSuggestedTools = (c: Challenge): string[] => {
    const cat = (c.category || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    const tags = (c.tags || []).map((t) => t.toLowerCase());

    if (title.includes('2fa') || title.includes('mfa') || title.includes('multi-factor')) {
      return ['Burp Suite (Interception)', 'DevTools (Network)', 'curl', 'Postman', 'Python'];
    }

    if (cat.includes('foundations') || cat.includes('fundamentals')) {
      return ['Browser DevTools (Network/Storage)', 'curl -i / --http2', 'Burp Suite Repeater', 'OWASP ZAP', 'CyberChef'];
    }

    if (cat.includes('command') || cat.includes('cmd')) {
      return ['curl', 'Burp Repeater', 'Bash / sh', 'Netcat', 'CyberChef'];
    }

    if (cat.includes('jwt') || cat.includes('token')) {
      return ['jwt.io', 'jwt_tool', 'Burp Suite (JWT Editor)', 'CyberChef', 'Python'];
    }

    if (cat.includes('business') || cat.includes('logic')) {
      return ['Burp Turbo Intruder', 'curl --parallel', 'Python asyncio', 'ffuf', 'Postman'];
    }

    if (cat.includes('deserialization') || cat.includes('object')) {
      return ['CyberChef', 'Burp Suite', 'ysoserial', 'Python', 'Base64 decoder'];
    }

    if (cat.includes('ssrf') || cat.includes('forgery')) {
      return ['Burp Suite', 'curl', 'Interactsh / Webhook', 'Netcat', 'Python'];
    }

    if (cat.includes('idor') || cat.includes('direct object')) {
      return ['Burp Repeater', 'ffuf', 'curl', 'Postman', 'Python'];
    }

    if (cat.includes('sql') || cat.includes('injection')) {
      return ['sqlmap', 'Burp Repeater', 'curl', 'CyberChef', 'Python'];
    }

    if (cat.includes('xss') || cat.includes('scripting')) {
      return ['Browser DevTools', 'Burp Suite', 'DOM Invader', 'CyberChef', 'curl'];
    }

    if (cat.includes('file') || cat.includes('traversal')) {
      return ['Burp Repeater', 'curl', 'ffuf', 'Dirsearch', 'Python'];
    }

    if (cat.includes('api') || cat.includes('server')) {
      return ['Postman', 'Burp Suite', 'ffuf', 'curl', 'Kiterunner'];
    }

    if (tags.includes('devtools') || tags.includes('clientside')) {
      return ['DevTools (F12)', 'curl', 'Browser DOM Inspector', 'CyberChef'];
    }

    // Default tools
    return ['Burp Suite', 'curl', 'DevTools (F12)', 'Postman', 'Python'];
  };

  // Copy Host:Port
  const handleCopyHostPort = () => {
    const textToCopy = `${targetHost}:${targetPort}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedHostPort(true);
    setTimeout(() => setCopiedHostPort(false), 2000);
  };

  const getTargetBaseUrl = () => {
    const portStr = targetPort && targetPort !== '80' && targetPort !== '443' ? `:${targetPort}` : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    return `${protocol}//${targetHost}${portStr}/api/v1/targets/${slug || challenge?.slug || ''}`;
  };

  const handleCopyTargetUrl = () => {
    const fullUrl = getTargetBaseUrl();
    navigator.clipboard?.writeText(fullUrl);
    setCopiedTargetUrl(true);
    setTimeout(() => setCopiedTargetUrl(false), 2000);
  };

  // Handle Flag Submission with Rate Limiting
  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFlag = flagInput.trim();
    if (!cleanFlag || !challenge || challenge.solved || cooldownSeconds > 0) return;

    // Check client-side rate limit: max 5 attempts per 60s
    const now = Date.now();
    const recent = recentAttempts.filter((t) => now - t < 60000);
    if (recent.length >= 5) {
      const waitTime = Math.ceil((60000 - (now - recent[0])) / 1000);
      setCooldownSeconds(waitTime > 0 ? waitTime : 60);
      setSubmissionFeedback({
        status: 'rate_limited',
        message: `Rate limit active: Maximum 5 flag submissions per minute. Please wait ${waitTime}s.`,
      });
      return;
    }

    setRecentAttempts([...recent, now]);
    setSubmitting(true);
    setSubmissionFeedback({ status: null, message: '' });

    try {
      // Ensure we submit using a valid backend identifier (real UUID or slug, never mock ID like 'ch-01')
      const challengeIdentifier =
        challenge.id && !challenge.id.startsWith('ch-')
          ? challenge.id
          : (challenge.slug || slug || challenge.id);

      const res = await apiClient.post(`/challenges/${challengeIdentifier}/submit`, {
        flag: cleanFlag,
      });

      const data = res.data?.data;
      if (data?.isCorrect) {
        if (data.alreadySolved) {
          setSubmissionFeedback({
            status: 'already_solved',
            message: data.message || 'You have already solved this challenge!',
            pointsAwarded: 0,
            unlockedLesson: data.unlockedLesson,
          });
        } else {
          setSubmissionFeedback({
            status: 'success',
            message: data.message || 'Congratulations! Flag accepted and verified.',
            pointsAwarded: data.pointsAwarded || challenge.points,
            unlockedLesson: data.unlockedLesson,
          });
          // Update challenge solved state
          setChallenge((prev) => (prev ? { ...prev, solved: true } : null));
          // Trigger celebratory animation and modal
          setShowCelebration(true);
        }
      } else {
        setSubmissionFeedback({
          status: 'incorrect',
          message: data?.message || 'Incorrect flag. Inspect the vulnerability and try again!',
        });
      }

      // Record in Session Attempts
      setSubmissionsLog((prev) => [
        {
          flag: cleanFlag,
          isCorrect: Boolean(data?.isCorrect),
          timestamp: 'Just now',
        },
        ...prev,
      ]);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setCooldownSeconds(60);
        setSubmissionFeedback({
          status: 'rate_limited',
          message: 'Rate limit exceeded: Too many attempts. Please wait 60 seconds.',
        });
      } else {
        const errMsg =
          err.response?.data?.message ||
          (Array.isArray(err.response?.data?.message)
            ? err.response.data.message.join(', ')
            : err.message) ||
          'Submission verification error';
        setSubmissionFeedback({
          status: 'incorrect',
          message: errMsg,
        });
      }

      setSubmissionsLog((prev) => [
        { flag: cleanFlag, isCorrect: false, timestamp: 'Just now' },
        ...prev,
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-mono">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-cyber-muted">Connecting to challenge target...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="py-16 text-center space-y-4 font-sans">
        <h2 className="text-lg font-bold text-cyber-text">Challenge Not Found</h2>
        <p className="text-xs text-cyber-muted max-w-sm mx-auto">
          The requested challenge scenario does not exist or has not been published.
        </p>
        <Link to="/challenges">
          <Button size="sm" variant="outline" className="border-cyber-border text-xs">
            Return to Challenges
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 font-sans pb-12">
      {/* ======================================================== */}
      {/* TOP HEADER: Breadcrumbs & Challenge Meta                 */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cyber-border/70 pb-3">
        <div className="flex items-center space-x-3">
          <Link
            to="/challenges"
            className="p-2 rounded-lg border border-cyber-border bg-cyber-elevated hover:bg-cyber-card text-cyber-muted hover:text-cyber-text transition-colors"
            title="Back to Challenges"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-cyber-text font-mono">
                {challenge.title}
              </h1>
              <DifficultyBadge difficulty={challenge.difficulty} />
              {challenge.solved && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
                  <Check className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-cyber-muted mt-1">
              <span>{typeof challenge.category === 'object' && challenge.category !== null ? (challenge.category as any).name : challenge.category}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">+{challenge.points} PTS</span>
              <span>•</span>
              <span>{challenge.owaspReference}</span>
              <span>•</span>
              <span className="text-cyan-400">{challenge.cweReference}</span>
              <span>•</span>
              <span>{challenge.solvedCount} Solves</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2-COLUMN STANDARD CTF WORKSPACE LAYOUT                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN (Wide): Scenario, Hints, Post-Solve Lesson   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4 md:space-y-5">
          {/* 1. Challenge Scenario Card */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <h2 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Challenge Scenario
              </h2>
              <span className="text-[11px] font-mono text-cyber-muted">
                Standard CTF Challenge
              </span>
            </div>

            {/* Story-style vague description without spoon-feeding exploit steps */}
            <p className="text-sm text-cyber-text/90 leading-relaxed font-sans">
              {challenge.shortDescription || challenge.description}
            </p>

            <div className="pt-3 border-t border-cyber-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/50 gap-2">
                <span className="text-cyber-muted text-[11px] flex-shrink-0">Category:</span>
                <span className="text-cyber-text font-medium text-right break-words">{typeof challenge.category === 'object' && challenge.category !== null ? (challenge.category as any).name : challenge.category}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/50 gap-2">
                <span className="text-cyber-muted text-[11px] flex-shrink-0">Difficulty:</span>
                <span className="text-emerald-400 font-bold">{challenge.difficulty}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/50 gap-2">
                <span className="text-cyber-muted text-[11px] flex-shrink-0">Flag Bounty:</span>
                <span className="text-emerald-400 font-bold">+{challenge.points} Points</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-bg/50 border border-cyber-border/50 gap-2">
                <span className="text-cyber-muted text-[11px] flex-shrink-0">Solves Recorded:</span>
                <span className="text-cyber-text">{challenge.solvedCount}</span>
              </div>
            </div>
          </div>

          {/* 2. Testing Guidelines Card (High-level methodology to guide players without revealing the solution) */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono">
                  Testing Guidelines
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                Methodology
              </span>
            </div>

            {/* High-level challenge guidance (category or challenge instruction) */}
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {challenge.instructions || getCategoryGuideline(challenge.category)}
            </p>

            {/* Dynamic 3-stage testing workflow based on challenge vulnerability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {getTestingSteps(challenge).map((step) => {
                const badgeColor =
                  step.color === 'emerald'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : step.color === 'cyan'
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                const titleColor =
                  step.color === 'emerald'
                    ? 'text-emerald-400'
                    : step.color === 'cyan'
                    ? 'text-cyan-400'
                    : 'text-amber-400';

                return (
                  <div key={step.num} className="p-3 rounded-lg bg-cyber-bg/60 border border-cyber-border/50 space-y-1">
                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${titleColor}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${badgeColor}`}>
                        {step.num}
                      </span>
                      <span>{step.name}</span>
                    </div>
                    <p className="text-[11px] text-cyber-muted font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Dynamic suggested tools badge bar tailored to challenge */}
            <div className="pt-2 border-t border-cyber-border/50 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-cyber-muted text-[10px]">Suggested Tools:</span>
              {getSuggestedTools(challenge).map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 rounded bg-cyber-bg text-cyber-text border border-cyber-border text-[10px]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Progressive Hints Card */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono">
                  Progressive Hints
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyber-muted">
                {revealedHints.size}/{hints.length} Unlocked
              </span>
            </div>

            <div className="space-y-2.5">
              {hints.map((hint) => {
                const isUnlocked = revealedHints.has(hint.id);
                return (
                  <div
                    key={hint.id}
                    className="border border-cyber-border rounded-lg overflow-hidden bg-cyber-bg/40 transition-colors"
                  >
                    <div className="p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-cyber-text font-medium">{hint.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isUnlocked && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {hint.costPoints === 0 ? 'Free' : `-${hint.costPoints} PTS`}
                          </span>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRequestUnlockHint(hint)}
                          className="h-7 text-xs font-mono px-2.5 hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-text"
                        >
                          {isUnlocked ? (
                            <span className="flex items-center gap-1">
                              Hide <ChevronUp className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              Unlock Hint <ChevronDown className="w-3 h-3" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="p-3.5 border-t border-cyber-border text-xs text-cyber-muted bg-cyber-elevated/20 leading-relaxed font-sans">
                        {hint.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Post-Solve Section: Lesson & Remediation (Revealed ONLY after solve) */}
          {challenge.solved && (
            <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-cyber-card to-cyber-card p-5 space-y-4 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400 font-mono">
                      Lesson & Remediation
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Challenge solved • Security knowledge and remediation guide unlocked
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Sparkles className="w-3.5 h-3.5" /> Solved (+{challenge.points} PTS)
                </span>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Key Learning Objectives
                </h4>
                <ul className="text-xs text-cyber-muted space-y-1.5 list-disc list-inside leading-relaxed bg-cyber-bg/40 p-3 rounded-lg border border-cyber-border">
                  <li>Analyze untrusted user input handling and client-server trust boundaries.</li>
                  <li>Identify logic flaws where server decisions rely on client-supplied parameters.</li>
                  <li>Understand how penetration testers intercept and manipulate API transactions.</li>
                  <li>Implement robust server-side validation and defense-in-depth controls.</li>
                </ul>
              </div>

              {/* Remediation & How to Fix */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Vulnerability Remediation & Defense
                </h4>
                <div className="p-3.5 rounded-lg bg-cyber-bg/60 border border-cyber-border space-y-2 text-xs text-zinc-300 leading-relaxed font-sans">
                  <p>
                    <strong className="text-cyber-text">Root Cause:</strong> Client-side state reliance or insufficient parameter authorization allows an attacker to manipulate values that dictate account state, execution flow, or privilege level.
                  </p>
                  <p>
                    <strong className="text-emerald-400">Defensive Implementation:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-cyber-muted">
                    <li>Enforce all authorization and role checks strictly on the backend.</li>
                    <li>Use strict DTO schema whitelisting to reject unexpected or privileged parameters.</li>
                    <li>Never trust client-side response codes or parameters for critical access decisions.</li>
                    <li>Audit all database interactions with parameterized queries and ORM validation.</li>
                  </ul>
                </div>
              </div>

              {/* Link to Knowledge Lesson */}
              <div className="pt-1">
                <Link to="/knowledge">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs gap-2 shadow-md shadow-emerald-950/40"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Explore Security Knowledge Module</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (Narrow): Target Info, Flag Submit, Logs    */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* 1. Target Information Card (Replaces Vulnerable Target Environment) */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-4 sm:p-5 space-y-3 sm:space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-cyber-text uppercase tracking-wider">
                  Target Information
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Host and Port displayed separately in monospace */}
            <div className="space-y-2 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 sm:p-2.5 rounded-lg bg-cyber-bg border border-cyber-border">
                  <span className="text-[10px] text-cyber-muted block mb-0.5 font-sans">Host</span>
                  <span className="text-emerald-400 font-bold select-all tracking-wider text-xs sm:text-sm">
                    {targetHost}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-cyber-bg border border-cyber-border">
                  <span className="text-[10px] text-cyber-muted block mb-0.5 font-sans">Port</span>
                  <span className="text-emerald-400 font-bold select-all tracking-wider text-xs sm:text-sm">
                    {targetPort}
                  </span>
                </div>
              </div>

              {/* Target Endpoint Base Path */}
              <div className="p-2 sm:p-2.5 rounded-lg bg-cyber-bg border border-cyber-border space-y-0.5">
                <span className="text-[10px] text-cyber-muted block font-sans">
                  Target Endpoint Path
                </span>
                <span className="text-emerald-400 font-mono text-[11px] block select-all break-all">
                  /api/v1/targets/{slug || challenge?.slug || ''}
                </span>
              </div>

              {/* Opaque instance token (if assigned, no username exposed) */}
              {instanceId && (
                <div className="p-2 sm:p-2.5 rounded-lg bg-cyber-bg/70 border border-cyber-border/80">
                  <span className="text-[10px] text-cyber-muted block mb-0.5 font-sans">
                    Target Instance Token
                  </span>
                  <span className="text-cyan-400 text-[11px] font-mono break-all block select-all">
                    {instanceId}
                  </span>
                </div>
              )}

              {/* Action Buttons: Copy Target URL and Copy Host:Port */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTargetUrl}
                  className="w-full border-cyber-border hover:bg-cyber-elevated text-cyber-text font-mono text-[11px] h-8.5 flex items-center justify-center gap-1.5"
                >
                  {copiedTargetUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied URL</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyber-muted" />
                      <span>Copy URL</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyHostPort}
                  className="w-full border-cyber-border hover:bg-cyber-elevated text-cyber-text font-mono text-[11px] h-8.5 flex items-center justify-center gap-1.5"
                >
                  {copiedHostPort ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Host</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyber-muted" />
                      <span>Copy Host:Port</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] text-cyber-muted/90 text-center font-mono">
              Attack this target using your own tools.
            </p>
          </div>

          {/* 2. Capture the Flag Card */}
          <div
            className={`rounded-xl border p-4 sm:p-5 space-y-3 sm:space-y-3.5 shadow-sm transition-all duration-500 ${
              challenge.solved
                ? 'border-emerald-500/50 bg-gradient-to-br from-cyber-card to-emerald-950/25 shadow-[0_0_25px_rgba(34,197,94,0.18)]'
                : 'border-cyber-border bg-cyber-card'
            }`}
          >
            <div>
              <h3 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono flex items-center gap-2">
                {challenge.solved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                )}
                Capture The Flag
              </h3>
              <p className="text-[11px] text-cyber-muted mt-1 font-sans">
                {challenge.solved
                  ? 'Challenge completed! Your flag token has been verified and registered.'
                  : 'Enter the exact flag discovered inside your target environment.'}
              </p>
            </div>

            <form onSubmit={handleSubmitFlag} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-cyber-muted block">
                  Flag Token (Format: WEBSEC&#123;...&#125;)
                </label>
                <Input
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  placeholder={challenge.solved ? "Challenge already solved" : "WEBSEC{challenge_flag_...}"}
                  disabled={submitting || challenge.solved || cooldownSeconds > 0}
                  className={`h-10 text-xs font-mono bg-cyber-bg border-cyber-border text-cyber-text placeholder:text-cyber-muted/40 transition-colors ${
                    challenge.solved ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' : 'focus:border-emerald-500'
                  }`}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  submitting ||
                  !flagInput.trim() ||
                  challenge.solved ||
                  cooldownSeconds > 0
                }
                className={`w-full font-mono text-xs h-9 shadow-md transition-all duration-300 ${
                  challenge.solved
                    ? 'bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 shadow-emerald-950/40 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validating Flag...
                  </span>
                ) : challenge.solved ? (
                  <span className="flex items-center gap-1.5 text-emerald-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Solved (+{challenge.points} pts)
                  </span>
                ) : cooldownSeconds > 0 ? (
                  <span className="flex items-center gap-1.5 text-amber-200">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Cooldown ({cooldownSeconds}s)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Submit Flag
                  </span>
                )}
              </Button>
            </form>

            {/* Rate Limit Cooldown Warning Notice */}
            {cooldownSeconds > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800 text-amber-300 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rate Limit Active</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                  Maximum 5 attempts per minute. Please wait {cooldownSeconds}s before submitting again.
                </p>
              </div>
            )}

            {/* Submission Alerts */}
            {submissionFeedback.status === 'success' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono space-y-2 animate-in fade-in zoom-in-95 duration-300 shadow-[0_0_20px_rgba(34,197,94,0.18)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />
                    <span>Flag Accepted! (+{submissionFeedback.pointsAwarded} pts)</span>
                  </div>
                  <button
                    onClick={() => setShowCelebration(true)}
                    className="text-[10px] text-emerald-300/80 hover:text-emerald-200 underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" /> Celebration
                  </button>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {submissionFeedback.message}
                </p>
              </div>
            )}

            {submissionFeedback.status === 'already_solved' && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Already Solved</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  {submissionFeedback.message}
                </p>
              </div>
            )}

            {submissionFeedback.status === 'incorrect' && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono space-y-1.5 animate-in shake duration-200 shadow-md">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Flag Verification Notice</span>
                </div>
                <p className="text-xs text-rose-200/90 font-sans leading-relaxed">
                  {submissionFeedback.message}
                </p>
              </div>
            )}
          </div>

          {/* 3. Session Attempts Card */}
          <div className="rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-cyber-text uppercase tracking-wider font-mono">
              Session Attempts ({submissionsLog.length})
            </h4>

            {submissionsLog.length > 0 ? (
              <div className="space-y-2.5 divide-y divide-cyber-border/40 text-xs font-mono">
                {submissionsLog.map((attempt, index) => (
                  <div
                    key={index}
                    className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="break-all select-all text-xs font-mono text-cyber-text font-medium leading-relaxed block bg-zinc-950/70 px-2.5 py-1.5 rounded-md border border-cyber-border/60">
                        {attempt.flag}
                      </span>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-1 rounded text-[10px] shrink-0 font-mono tracking-wider ${
                        attempt.isCorrect
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {attempt.isCorrect ? 'VALID' : 'INVALID'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-cyber-muted font-mono">
                No flag submission attempts recorded yet this session.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONFIRMATION DIALOG: Unlock Hint Point Deduction          */}
      {/* ======================================================== */}
      {hintToUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-cyber-text font-mono">
                Unlock Progressive Hint?
              </h3>
            </div>

            <p className="text-xs text-cyber-muted leading-relaxed font-sans">
              Unlocking <strong className="text-cyber-text font-mono">{hintToUnlock.title}</strong> will deduct{' '}
              <strong className="text-amber-400 font-mono">{hintToUnlock.costPoints} points</strong> from your final reward for this challenge.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyber-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHintToUnlock(null)}
                className="text-xs font-mono border-cyber-border"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmUnlockHint}
                className="text-xs font-mono bg-amber-600 hover:bg-amber-500 text-white"
              >
                Confirm Unlock (-{hintToUnlock.costPoints} PTS)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUCCESS CELEBRATION: Particle Burst & Solved Dialog       */}
      {/* ======================================================== */}
      {showCelebration && (
        <>
          <ConfettiCelebration durationMs={4500} particleCount={160} />
          {challenge && (
            <SolveCelebrationModal
              isOpen={showCelebration}
              onClose={() => setShowCelebration(false)}
              challengeTitle={challenge.title}
              pointsAwarded={submissionFeedback.pointsAwarded || challenge.points}
              category={typeof challenge.category === 'object' && challenge.category !== null ? (challenge.category as any).name : challenge.category}
              unlockedLesson={submissionFeedback.unlockedLesson}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChallengeWorkspacePage;
