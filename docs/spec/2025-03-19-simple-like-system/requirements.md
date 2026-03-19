# Product Requirements Document: Simple Like System

**Document ID:** PRD-SLS-001  
**Version:** 1.1  
**Status:** Draft  
**Last Updated:** 2025-03-19  
**Author:** —  
**Owner:** —  

---

## Revision History

| Version | Date       | Author | Changes                    |
|---------|------------|--------|----------------------------|
| 1.0     | 2025-03-19 | —      | Initial draft              |
| 1.1     | 2025-03-19 | —      | Added demo page requirement (FR-5) |

---

## 1. Executive Summary

This document defines the product requirements for a **Simple Like System** — a zero-friction, anonymous engagement feature for blog posts. The system enables readers to express appreciation via a single click without creating accounts or signing in. User identity is derived from IP address (hashed for privacy) to enforce one-like-per-article-per-user while preserving anonymity.

**Key Value Proposition:** Reduce engagement friction by eliminating the need for GitHub sign-in (required by Giscus) and increase reader interaction through an instant, one-click like mechanism.

---

## 2. Objectives & Success Criteria

### 2.1 Objectives

| ID   | Objective                                      | Priority |
|------|------------------------------------------------|----------|
| O-1  | Enable anonymous like/unlike with zero sign-up | P0       |
| O-2  | Prevent duplicate likes per article per user   | P0       |
| O-3  | Maintain user privacy (no raw IP storage)      | P0       |
| O-4  | Resist abuse via rate limiting                 | P1       |
| O-5  | Support cross-origin consumption from blog     | P0       |
| O-6  | Provide an in-playground demo page for the like feature | P0       |

### 2.2 Success Criteria

| ID   | Criterion                                      | Measurement                    |
|------|------------------------------------------------|--------------------------------|
| SC-1 | Like toggle completes in &lt; 500ms (p95)      | API latency monitoring         |
| SC-2 | Zero raw IP addresses in persistent storage   | Security audit                 |
| SC-3 | CORS allows blog origin; rejects unknown       | Integration test               |
| SC-4 | Rate limit enforced when exceeded              | Load test / manual verification|

---

## 3. Problem Statement

**Current State:** Blog engagement metrics (comments, reactions) are low. The incumbent system (Giscus) requires users to authenticate via GitHub before they can comment or react. This creates friction: users must have or create a GitHub account and complete an OAuth flow to express appreciation.

**Impact:** Readers who wish to show appreciation abandon the action due to the sign-in barrier. Engagement remains low despite content quality.

**Desired State:** Readers can like or unlike an article with a single click, with no account creation, sign-in, or form submission required.

---

## 4. Stakeholders

| Role           | Responsibility                          |
|----------------|-----------------------------------------|
| Product Owner  | Prioritization, acceptance               |
| Engineering    | Implementation, technical design         |
| End Users      | Blog readers consuming content           |

---

## 5. User Stories

| ID   | Story                                                                 | Priority |
|------|-----------------------------------------------------------------------|----------|
| US-1 | As a reader, I want to click a like button to show I enjoyed a post   | P0       |
| US-2 | As a reader, I want to click again to remove my like if I changed my mind | P0  |
| US-3 | As a reader, I want to see the total like count for the article       | P0       |
| US-4 | As a reader, I want to see whether I have already liked (button state) | P0       |
| US-5 | As a reader, I want to do this without creating an account           | P0       |
| US-6 | As a visitor, I want to try the like feature on a demo page before it appears on the blog | P0       |

---

## 6. Functional Requirements

### 6.1 Like Toggle (FR-1)

| ID     | Requirement                                                         | Acceptance Criteria                                                                 |
|--------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| FR-1.1 | The system SHALL allow a user to increment the like count by clicking a like button. | Click triggers POST; count increases by 1; response reflects new state.     |
| FR-1.2 | The system SHALL allow a user to decrement the like count by clicking again (unlike). | Second click from same IP removes like; count decreases by 1.                 |
| FR-1.3 | The system SHALL enforce at most one like per (article, IP) pair.    | Duplicate like from same IP does not increase count; toggle semantics apply.   |
| FR-1.4 | The system SHALL return the updated state (count, liked) after each toggle. | POST response includes `count` and `liked` reflecting post-operation state. |

### 6.2 Read Like State (FR-2)

| ID     | Requirement                                                         | Acceptance Criteria                                                                 |
|--------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| FR-2.1 | The system SHALL expose an endpoint to retrieve total like count for an article. | GET returns `count` (non-negative integer).                                  |
| FR-2.2 | The system SHALL indicate whether the requesting client has liked the article.   | GET returns `liked` (boolean) based on requester IP.                          |
| FR-2.3 | The system SHALL return consistent state for articles with zero likes.           | GET returns `{ count: 0, liked: false }` when no likes exist.                  |

### 6.3 Article Identification (FR-3)

| ID     | Requirement                                                         | Acceptance Criteria                                                                 |
|--------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| FR-3.1 | Articles SHALL be identified by a slug (e.g., `building-ai-apps-with-go`). | Slug is the sole identifier; no separate numeric ID required.                 |
| FR-3.2 | The system SHALL validate slug format before processing.           | Invalid slug returns 400; valid slug: 1–200 chars, `[a-zA-Z0-9_-]+`.           |
| FR-3.3 | The system SHALL treat slug as case-sensitive.                      | `Hello-World` and `hello-world` are distinct articles.                          |

### 6.4 Cross-Origin Support (FR-4)

| ID     | Requirement                                                         | Acceptance Criteria                                                                 |
|--------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| FR-4.1 | The API SHALL be callable from `https://isaacfei.com`.              | CORS allows origin; GET and POST succeed from blog.                             |
| FR-4.2 | The API SHALL respond to OPTIONS preflight requests.                | OPTIONS returns 204 with appropriate CORS headers.                            |
| FR-4.3 | The API SHALL restrict allowed origins to a configured allowlist.   | Requests from non-allowlisted origins receive CORS error or 403.                |

### 6.5 Demo Page (FR-5)

| ID     | Requirement                                                         | Acceptance Criteria                                                                 |
|--------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| FR-5.1 | The playground SHALL include a demo page that showcases the like feature. | A route exists (e.g. `/like-demo`); page is linked from playground home and sidebar. |
| FR-5.2 | The like button on the demo page SHALL use a fixed slug for that page. | Slug is `playground-like-demo`; likes are scoped to this exact page only.        |
| FR-5.3 | The demo page SHALL display the like count and allow toggle (like/unlike). | Same UX as blog integration: fetch on load, optimistic update on click.         |
| FR-5.4 | The demo page SHALL be same-origin with the API (no CORS needed for demo). | Demo page and API share `playground.isaacfei.com` origin.                        |

---

## 7. Non-Functional Requirements

### 7.1 Performance (NFR-1)

| ID      | Requirement                                              | Target        |
|---------|----------------------------------------------------------|---------------|
| NFR-1.1 | GET (read like state) response time                      | p95 &lt; 200ms |
| NFR-1.2 | POST (toggle like) response time                         | p95 &lt; 500ms |
| NFR-1.3 | Database queries for like operations SHALL use indexes.  | Index on (slug), unique on (slug, ip_hash) |

### 7.2 Availability (NFR-2)

| ID      | Requirement                                              |
|---------|----------------------------------------------------------|
| NFR-2.1 | The service SHALL be available when the playground is deployed. |
| NFR-2.2 | Downtime SHALL align with playground deployment (Cloudflare Workers + Neon PostgreSQL). |

### 7.3 Abuse Prevention (NFR-3)

| ID      | Requirement                                              | Specification                    |
|---------|----------------------------------------------------------|----------------------------------|
| NFR-3.1 | The system SHALL rate limit like-toggle (POST) requests per IP. | Max 30 POST per IP per rolling hour. |
| NFR-3.2 | The system SHALL rate limit read (GET) requests per IP.  | Max 60 GET per IP per minute.   |
| NFR-3.3 | Rate limit exceeded SHALL return HTTP 429.               | Response body indicates retry-after. |

### 7.4 Privacy (NFR-4)

| ID      | Requirement                                              |
|---------|----------------------------------------------------------|
| NFR-4.1 | Raw IP addresses SHALL NOT be stored in any persistent store. |
| NFR-4.2 | Only a salted, one-way hash of the IP MAY be persisted.  |
| NFR-4.3 | Application logs SHALL NOT contain raw IP addresses.     |
| NFR-4.4 | The hash SHALL be non-reversible (e.g., SHA-256).        |

### 7.5 Security (NFR-5)

| ID      | Requirement                                              |
|---------|----------------------------------------------------------|
| NFR-5.1 | Slug input SHALL be validated to prevent injection.     |
| NFR-5.2 | CORS SHALL NOT use `Access-Control-Allow-Origin: *` in production. |
| NFR-5.3 | The hashing salt SHALL be stored as an environment variable. |

---

## 8. Assumptions & Dependencies

### 8.1 Assumptions

- Readers access the blog from environments where the client IP is available (e.g., behind Cloudflare).
- The playground backend is deployed and accessible at `playground.isaacfei.com`.
- Neon PostgreSQL and Drizzle ORM are the approved data layer.
- One like per IP per article is an acceptable tradeoff (shared IPs = shared identity).
- The blog uses static site generation; like interaction is client-side only.

### 8.2 Dependencies

- Playground project (TanStack Start, Cloudflare Workers, Neon PostgreSQL).
- mysite (Astro) for frontend integration.
- Environment variable `LIKE_SYSTEM_SALT` for IP hashing.

### 8.3 Demo Page Slug

The demo page uses slug `playground-like-demo`. This slug is reserved for the in-playground demo and SHALL NOT be used by blog posts.

---

## 9. Constraints

| ID   | Constraint                                                                 |
|------|----------------------------------------------------------------------------|
| C-1  | Backend implementation SHALL reside within the playground codebase.       |
| C-2  | Frontend integration SHALL reside within the mysite (Astro) codebase.      |
| C-3  | The system SHALL operate with static site generation (no SSR for like UI).  |
| C-4  | No new infrastructure beyond existing playground stack.                    |
| C-5  | Demo page SHALL be implemented within the playground codebase (same as API). |

---

## 10. Risks & Mitigations

| Risk                               | Likelihood | Impact | Mitigation                                      |
|------------------------------------|------------|--------|-------------------------------------------------|
| Abuse via automated like spam     | Medium     | Medium | Rate limiting (NFR-3); consider CAPTCHA if needed |
| Shared IP undercounts unique users| Low        | Low    | Accept as known limitation; document           |
| Dynamic IP allows multiple likes  | Low        | Low    | Accept as known limitation; document           |
| Salt compromise invalidates hashes| Low        | Medium | Rotate salt; existing likes reset               |

---

## 11. Out of Scope

The following are explicitly excluded from this release:

- View counts.
- Multiple reaction types (heart, star, clap, etc.).
- User accounts or authentication.
- Analytics or tracking beyond aggregate like counts.
- Server-side rendering of like state (SSR).
- Like notifications or webhooks.

---

## 12. Appendix

### 12.1 References

| Source | URL | Relevance |
|--------|-----|-----------|
| Connor Slade — Like System | https://connorcode.com/writing/programming/like-system | IP-based likes, toggle semantics, SQLite |
| iine — Small Web Like Buttons | https://osc.garden/blog/iine-small-web-like-buttons/ | Rate limiting, Supabase, increment-only |
| barbajoe — Like without Login | https://blog.barbajoe.tech/post/like-without-login | MongoDB, IP-based, multiple likes |

### 12.2 Glossary

| Term    | Definition                                                                 |
|---------|----------------------------------------------------------------------------|
| Slug    | URL-safe identifier for a likeable entity (e.g., blog post id, demo page id). |
| IP hash | One-way hash of client IP + salt; used as anonymous user identifier.       |
| Toggle  | Action that adds a like if absent, removes it if present.                  |
| Demo slug | Fixed slug `playground-like-demo` reserved for the in-playground demo page. |

### 12.3 Demo Page Specification

| Attribute | Value |
|-----------|-------|
| Route     | `/like-demo` |
| Slug (for API) | `playground-like-demo` |
| Purpose   | Allow visitors to try the like feature before blog integration; validate API and UX. |
