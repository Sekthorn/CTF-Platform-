# CTF Challenge Architecture & Difficulty Guidelines

Official standard for designing isolated, educational, and realistic web application penetration testing challenges in WebSec CTF.

---

## 1. Difficulty Tier Specifications

| Tier | Target Audience | Hints Available | Exploit Complexity | Learning Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Beginner** | Students, Security Starters | 3 detailed progressive hints | 1-step direct exploit (e.g., viewing HTML source, basic parameter tampering, simple `' OR 1=1 --` SQLi) | Understanding HTTP requests, input tampering basics, viewing web assets |
| **Easy** | Junior Pentesters, Intermediate Students | 2 hints (conceptual + syntax) | 1-2 step exploit (e.g., reflected XSS, predictable IDOR ID increment, cleartext cookie tampering) | Vulnerability identification, decoding common encodings (Base64, URL), IDOR mechanics |
| **Medium** | Practitioners, Bug Bounty Hunters | 1 high-level conceptual hint | Multi-step chained exploit (e.g., blind SQL injection, JWT algorithm confusion `none`, filter bypass, SSRF to internal service) | Bypassing defensive filters, chaining flaws, cryptographic weaknesses, timing attacks |
| **Hard / Advanced** | Senior Specialists, Advanced CTF Players | 0 or 1 subtle hint | Complex exploit chain (e.g., second-order injection, prototype pollution to RCE, custom deserialization, race conditions) | Deep runtime internals, zero-day style exploitation, complex environmental pivoting |

---

## 2. Dynamic Per-Player Flag Architecture

In WebSec CTF, flags are unique per player to prevent answer sharing:
- **Format:** `websec{<deterministic_signature_hash>}`
- **Algorithm:**
  $$\text{Flag} = \text{"websec\{"} + \text{HMAC-SHA256}(K_{\text{secret}}, \text{challenge\_slug} + \text{":"} + \text{player\_id})[:24] + \text{"\}"}$$
- **Verification Rule:** The server dynamically computes the expected flag using its internal HMAC secret key and the authenticated user's ID. Static flags stored in frontend code are strictly prohibited.

---

## 3. Hint Progression & Scoring Penalty

To encourage independent problem solving while preventing dead-ends:
- **Hint 1 (Reconnaissance / Observation):** Clarifies what area of the application warrants inspection. **Penalty: 10% of base points.**
- **Hint 2 (Vulnerability Category & Concept):** Explains the underlying vulnerability mechanism without giving exploit strings. **Penalty: 25% of base points.**
- **Hint 3 (Syntax & Exploit Direction):** Suggests specific tool syntax or payload structure. **Penalty: 40% of base points.**

---

## 4. Container Isolation Boundary Enforcements

- Every challenge runs in an isolated container network.
- Containers must NOT mount host `/var/run/docker.sock`.
- Containers must NOT have access to the production MySQL database (`3306`).
- Containers must enforce CPU limit (`cpus: "0.5"`) and memory limit (`mem_limit: 256m`).
- Root filesystems should be read-only with a temporary writeable `/tmp`.
