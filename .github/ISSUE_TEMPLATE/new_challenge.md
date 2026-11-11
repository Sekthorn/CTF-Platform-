---
name: New Challenge Proposal
about: Propose a new vulnerable web application lab scenario
title: "[CHALLENGE] "
labels: ["challenge", "proposal"]
assignees: ""
---

## Challenge Summary
- **Title**: 
- **Vulnerability Category**: [e.g. SQL Injection, SSRF, IDOR, Broken Authentication]
- **Estimated Difficulty**: [Easy / Medium / Hard / Insane]
- **Target Points**: [e.g. 150]

## Learning Objectives
What will the student researcher learn by exploiting and solving this scenario?

## Standards Mapping
- **OWASP Reference**: [e.g. A03:2021-Injection]
- **CWE Identifier**: [e.g. CWE-89]

## Technology Stack of Target
[e.g. Python Flask + SQLite / Node Express / PHP 8.2]

## Container Isolation Readiness
- [ ] Runs with non-root user
- [ ] Respects CPU (`<= 0.5`) and memory limits (`<= 256M`)
- [ ] No access to host Docker socket or production network
- [ ] Flag format follows `WEBSEC{...}`
