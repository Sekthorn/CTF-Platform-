# Automated QA Test Scenarios Matrix

Regression test suite and validation specifications for the WebSec CTF core platform.

---

## 1. Authentication & Account Lifecycle Tests

| ID | Test Scenario | Input Data | Expected Result | Negative / Edge Case Checks |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Standard Player Registration | Valid username, email, password ($\ge 8$ chars, letter + number) | 201 Created; Password hashed; Redirect to login | Duplicate username/email yields 409 Conflict. |
| **AUTH-02** | Weak Password Rejection | Password $< 8$ chars or all letters | 400 Bad Request; Descriptive error message | Null, empty string, or whitespace password. |
| **AUTH-03** | Valid Login & JWT Issuance | Correct username/email & password | 200 OK; JWT token returned in secure cookie or bearer payload | Case-insensitive email handling. |
| **AUTH-04** | Invalid Credentials & Lockout | Wrong password | 401 Unauthorized; Attempts incremented | 5 consecutive failures triggers 15-min lockout. |
| **AUTH-05** | Admin Access Enforcement | Regular player token requesting `/admin/*` | 403 Forbidden; Access denied | Expired JWT, tampered signature. |

---

## 2. Challenge & Flag Submission Workflows

| ID | Test Scenario | Input Data | Expected Result | Anti-Tampering Checks |
| :--- | :--- | :--- | :--- | :--- |
| **FLAG-01** | Valid Dynamic Flag Submission | `websec{<player_hmac_hash>}` | 200 OK; Challenge marked solved; Points credited | Submission for player A submitted by player B is rejected (400). |
| **FLAG-02** | Duplicate Submission Prevention | Resubmitting already solved flag | 400 Bad Request ("Already solved") | Points must NOT increase on repeated submissions. |
| **FLAG-03** | Malformed Flag Format | Raw string without `websec{...}` | 400 Bad Request ("Invalid flag format") | SQL injection in flag string (`websec{' OR 1=1--}`) safely escaped. |
| **FLAG-04** | Brute Force Submission Throttling | Rapid fire submissions (> 10 req/min) | 429 Too Many Requests; Exponential backoff | Submissions blocked until cooldown expires. |

---

## 3. Scoreboard & Leaderboard Integrity

| ID | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **LB-01** | Score Calculation | Player score equals exact sum of solved challenge points minus unlocked hint penalties. |
| **LB-02** | Tie-Breaking Logic | Players with identical scores ordered by earliest timestamp of last successful solve. |
| **LB-03** | Negative Score Tampering | Hint deductions cannot reduce total challenge score below 0. |
