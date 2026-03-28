# Backend Specification: Caption Generator

**Agent:** Backend
**Status:** Complete
**Created:** 2026-03-28
**Feature:** Caption Generator (MVP)
**Depends On:** `tasks/task-001-caption-generator.md`, `docs/prompt-caption-generator.md`

---

## Section 1 — API Endpoint Definition

### Method and Route

```
POST /api/generate-caption
```

### Request Body Schema

Content-Type: `application/json`

```json
{
  "topic":         "<string>",
  "platform":      "<string>",
  "tone":          "<string>",
  "hashtag_count": "<number | optional>"
}
```

| Field           | Type    | Required | Description                                      |
|-----------------|---------|----------|--------------------------------------------------|
| `topic`         | string  | yes      | Free-text subject of the captions. Max 200 chars.|
| `platform`      | string  | yes      | Target social platform enum value.               |
| `tone`          | string  | yes      | Desired caption tone enum value.                 |
| `hashtag_count` | number  | no       | Number of hashtags per caption. Default: `5`.    |

### Success Response Schema

HTTP `200 OK`

```json
{
  "captions": [
    { "id": 1, "text": "...", "hashtags": ["#Tag1", "#Tag2"] },
    { "id": 2, "text": "...", "hashtags": ["#Tag1", "#Tag2"] },
    { "id": 3, "text": "...", "hashtags": ["#Tag1", "#Tag2"] }
  ]
}
```

| Field                  | Type             | Description                                      |
|------------------------|------------------|--------------------------------------------------|
| `captions`             | array            | Always exactly 3 caption objects.                |
| `captions[n].id`       | integer          | 1-based index (1, 2, or 3).                      |
| `captions[n].text`     | string           | Caption body. No hashtags embedded in this field.|
| `captions[n].hashtags` | array of strings | Each element begins with `#`.                    |

### Error Response Schema

```json
{
  "error": true,
  "code":  "<ERROR_CODE>",
  "message": "<human-readable description>"
}
```

### HTTP Status Codes

| Code | Condition                                                                  |
|------|----------------------------------------------------------------------------|
| 200  | Success — 3 valid captions returned.                                       |
| 400  | Validation failure — missing or invalid request fields.                    |
| 422  | Content policy violation — topic flagged by blocklist pre-check.           |
| 429  | Rate limit exceeded.                                                       |
| 500  | Internal server error — Claude API failure or unrecoverable parse failure. |
| 503  | Claude API unavailable or timeout after retry.                             |

---

## Section 2 — Request Validation Rules

All validation runs server-side before any call to Claude is made.

### Field: `topic`

| Rule                         | Error Code          | HTTP | Message                                           |
|------------------------------|---------------------|------|---------------------------------------------------|
| Field must be present        | `MISSING_TOPIC`     | 400  | `"topic is required"`                             |
| After trim, length must be > 0 | `MISSING_TOPIC`   | 400  | `"topic is required"`                             |
| Max length 200 characters    | Silently truncated  | —    | No error; truncation is applied server-side.      |
| Contains `https?://` pattern | Silently sanitized  | —    | URL stripped and replaced with `[link removed]`.  |
| Matches keyword blocklist    | `UNSAFE_TOPIC`      | 422  | `"We weren't able to generate captions for this topic. Please try a different topic."` |

Additional handling:
- If `topic.trim().length` is 1–3 characters the request proceeds, but a short-topic note is appended to the user message (see Section 3).
- `topic` is HTML-escaped before prompt injection.

### Field: `platform`

| Rule                              | Error Code           | HTTP | Message                                            |
|-----------------------------------|----------------------|------|----------------------------------------------------|
| Field must be present             | `MISSING_PLATFORM`   | 400  | `"platform is required"`                           |
| Must be one of the allowed values | `INVALID_PLATFORM`   | 400  | `"platform must be one of: instagram, tiktok, linkedin, twitter"` |

Allowed values (case-insensitive, normalized to lowercase internally):
`instagram`, `tiktok`, `linkedin`, `twitter`

### Field: `tone`

| Rule                              | Error Code        | HTTP | Message                                              |
|-----------------------------------|-------------------|------|------------------------------------------------------|
| Field must be present             | `MISSING_TONE`    | 400  | `"tone is required"`                                 |
| Must be one of the allowed values | `INVALID_TONE`    | 400  | `"tone must be one of: casual, professional, funny, inspirational"` |

Allowed values (case-insensitive, normalized to lowercase internally):
`casual`, `professional`, `funny`, `inspirational`

### Field: `hashtag_count`

| Rule                              | Error Code                 | HTTP | Message                                         |
|-----------------------------------|----------------------------|------|-------------------------------------------------|
| If omitted, default to `5`        | —                          | —    | No error.                                       |
| Must be an integer                | `INVALID_HASHTAG_COUNT`    | 400  | `"hashtag_count must be an integer between 0 and 10"` |
| Must be in range 0–10             | `INVALID_HASHTAG_COUNT`    | 400  | `"hashtag_count must be an integer between 0 and 10"` |

### Validation Order

1. Parse JSON body — reject non-JSON with HTTP 400.
2. Validate `topic` presence and content.
3. Validate `platform` presence and enum membership.
4. Validate `tone` presence and enum membership.
5. Validate `hashtag_count` type and range (apply default if absent).
6. Run blocklist pre-check on sanitized `topic`.
7. Check rate limit for the requesting IP.
8. Forward to Claude API integration layer.

---

## Section 3 — Claude API Integration

### Overview

The backend constructs a two-part message payload (system prompt + user message) using the templates defined in `docs/prompt-caption-generator.md` and forwards it to the Anthropic Messages API.

### Anthropic Messages API Call

**Endpoint:** `https://api.anthropic.com/v1/messages`
**Method:** `POST`
**Auth header:** `x-api-key: ${ANTHROPIC_API_KEY}`
**Version header:** `anthropic-version: 2023-06-01`

### Model

```
claude-sonnet-4-5
```

This is the Sonnet-class model as specified in `docs/prompt-caption-generator.md` Section 10. Upgrade to the latest Sonnet release when available after running the validation suite.

### API Request Payload

```json
{
  "model":      "claude-sonnet-4-5",
  "max_tokens": 600,
  "temperature": 0.9,
  "system":     "<system prompt from docs/prompt-caption-generator.md Section 1>",
  "messages": [
    {
      "role":    "user",
      "content": "<populated user message — see below>"
    }
  ]
}
```

Temperature rules:
- Standard (first) generation: `0.9`
- Server-side validation retry: `0.9` (unchanged)
- User-initiated regenerate: `1.0` (capped)

### System Prompt Injection

The system prompt is taken verbatim from `docs/prompt-caption-generator.md` Section 1. It is a static string stored as a server-side constant — it does not vary per request.

```
SYSTEM_PROMPT = """
You are an expert social media copywriter. Your only job is to write social media captions for content creators.

Rules you must follow without exception:
1. Always return exactly 3 caption variants — no more, no fewer.
2. Always return valid JSON matching the exact schema provided. Never add prose, explanation, or markdown outside the JSON block.
3. Each caption must be unique in structure, opening hook, and phrasing. Do not produce three versions of the same sentence.
4. Tailor every caption to the target platform's culture, character limits, and audience expectations.
5. Match the requested tone precisely. Do not blend tones unless explicitly instructed.
6. Include exactly the number of hashtags specified by `hashtag_count`. If `hashtag_count` is 0, return an empty array for `hashtags`.
7. Hashtags must be relevant, specific, and cased in standard hashtag style (e.g., #ContentCreator, not #contentcreator or #CONTENTCREATOR).
8. Never include hashtags inside the `text` field. Hashtags belong only in the `hashtags` array.
9. Do not produce captions that contain hate speech, harassment, explicit sexual content, self-harm glorification, or instructions for illegal activity. If the input topic implies any of these, return the structured error response described in Section 6.
10. Do not add commentary about the topic, the user, or your own output. Return only the JSON.
"""
```

### User Message Template Population

The backend performs the following substitutions on the template from `docs/prompt-caption-generator.md` Section 2 before sending:

| Placeholder            | Source                                              |
|------------------------|-----------------------------------------------------|
| `{{topic}}`            | Sanitized, trimmed, HTML-escaped user input.        |
| `{{platform}}`         | Display-form enum: `Instagram`, `TikTok`, `LinkedIn`, `Twitter/X` |
| `{{tone}}`             | Display-form enum: `Casual`, `Professional`, `Funny`, `Inspirational` |
| `{{hashtag_count}}`    | Validated integer, defaulted to `5`.               |
| `{{platform_guidance}}`| Looked up from the platform guidance map (see below). |
| `{{tone_guidance}}`    | Looked up from the tone + platform guidance map (see below). |

#### Platform guidance map

| Key         | Value (injected verbatim)                                                                                                                                                                                                                                       |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `instagram` | Instagram captions can be up to 2,200 characters but perform best at 138–150 characters. Use a conversational, visual-first hook in the first line because text is truncated after 2 lines. Emoji usage is welcome and common. Line breaks improve readability. The audience expects authenticity and personal voice. |
| `tiktok`    | TikTok captions are capped at 2,200 characters but most successful captions are under 100 characters. The caption plays second fiddle to the video, so be punchy. A question or a bold statement invites comments. Trending slang and lowercase informal text are acceptable and often preferred. Emoji can reinforce energy but do not overload. |
| `linkedin`  | LinkedIn captions (post body) can be up to 3,000 characters; the first 210 characters appear before the "see more" cut-off. Lead with a professional insight, a data point, or a thought-provoking question. Write in first person. Avoid excessive emoji — one or two per post maximum. Hashtags appear at the end of the post, not inline. The audience is professional, career-focused, and values substance over hype. |
| `twitter`   | Twitter/X posts are hard-limited to 280 characters including spaces. Every character counts. Lead with the most interesting word or claim. Avoid filler phrases. Hashtags count toward the 280-character limit, so use them sparingly (1–2 is ideal). Dry wit, hot takes, and concise observations perform well. Do not pad the caption to fill space. |

#### Tone guidance map

The tone guidance map is a two-dimensional lookup keyed by `[tone][platform]`. Full strings are sourced from `docs/prompt-caption-generator.md` Section 7.

```
TONE_GUIDANCE[tone][platform] -> string
```

Example lookup: `TONE_GUIDANCE["casual"]["instagram"]` returns the "Casual on Instagram" guidance string.

### Short-topic note injection

If `topic.trim().length <= 3`, append the following line to the user message after the `Hashtag count` line:

```
Note: The topic provided is very short. Use reasonable creative interpretation to build relevant captions around it.
```

### Regenerate request injection

If the request includes `"regenerate": true` in the body, append the following block after the JSON schema section of the user message:

```
Important: This is a regeneration request. The previous response has already been shown to the user. You must produce 3 entirely new captions that differ meaningfully from a typical first response. Use different opening hooks, different structural approaches, and different angles on the topic. Do not repeat any phrase, sentence structure, or hook style from the most obvious interpretation of this topic.
```

Also raise `temperature` to `1.0` for regenerate requests.

---

## Section 4 — Response Parsing

### Step 1 — Extract Raw Text

Read `response.content[0].text` from the Anthropic API response object.

### Step 2 — JSON Parse

Attempt `JSON.parse()` on the raw text.

- If parse succeeds, proceed to structural validation.
- If parse fails, trigger the JSON parse error retry (see Section 5).

### Step 3 — Structural Validation

Check the following in order:

1. Top-level object contains key `captions` OR key `error`.
2. If `error` key is present, route immediately to the safety refusal handler (see Section 5).
3. `captions` is an array.
4. `captions.length === 3`.

If any check fails, trigger the wrong-caption-count retry.

### Step 4 — Per-Caption Validation

For each caption object in the array:

| Check                                         | Action on failure                                      |
|-----------------------------------------------|--------------------------------------------------------|
| `id` equals caption's 1-based position        | Reassign `id` values as 1, 2, 3 in order.             |
| `text` is a non-empty string                  | Trigger retry.                                         |
| `text` does not match pattern `/#\w+/`        | Strip hashtag tokens from `text`, move to `hashtags` if count allows; otherwise trigger retry. |
| `hashtags` is an array                        | Trigger retry.                                         |
| `hashtags.length === hashtag_count`           | Trigger hashtag count mismatch retry.                  |
| Every `hashtags` element starts with `#`      | Prepend `#` to elements that are missing it.           |
| `text.length <= platform_text_limit`          | Truncate at last complete sentence before limit; append `…`. |

#### Platform text length limits

| Platform  | Recommended max `text` chars |
|-----------|------------------------------|
| instagram | 220                          |
| tiktok    | 150                          |
| linkedin  | 700                          |
| twitter   | 220                          |

### Step 5 — Twitter/X Hashtag Budget Enforcement

For Twitter/X only, after per-caption validation:

```
available_chars = 280 - text.length - 1
```

If the combined character length of all hashtags (plus spaces between them) exceeds `available_chars`, trim hashtags from the end of the array until the combined caption fits within 280 characters. Record the actual hashtag count used in a `hashtag_count_actual` metadata field (not returned to the frontend, but logged).

### Step 6 — Return Validated Payload

Construct the final response object and return it to the frontend:

```json
{
  "captions": [
    { "id": 1, "text": "...", "hashtags": ["#..."] },
    { "id": 2, "text": "...", "hashtags": ["#..."] },
    { "id": 3, "text": "...", "hashtags": ["#..."] }
  ]
}
```

---

## Section 5 — Error Handling

### Claude API Failure (Non-2xx HTTP)

- Log the Anthropic API status code and response body.
- Do not retry.
- Return HTTP `503` to the client:

```json
{
  "error": true,
  "code":  "CLAUDE_API_ERROR",
  "message": "The caption service is temporarily unavailable. Please try again."
}
```

### Timeout

- Set a request timeout of `CLAUDE_TIMEOUT_MS` milliseconds (default: 15,000 ms).
- If the Anthropic API does not respond within the timeout, abort the request.
- Return HTTP `503`:

```json
{
  "error": true,
  "code":  "TIMEOUT",
  "message": "The request took too long. Please try again."
}
```

### JSON Parse Failure (Invalid / Malformed Response)

**First occurrence:** Append the JSON format reminder to the user message and retry the call at the same temperature.

Appended retry instruction:
```
IMPORTANT: Your previous response could not be parsed as JSON. Return only a valid JSON object. Do not include any text, explanation, markdown, or code fences outside the JSON. Start your response with { and end with }.
```

**If retry also fails:** Log the raw Claude response for review. Return HTTP `500`:

```json
{
  "error": true,
  "code":  "GENERATION_FAILED",
  "message": "We couldn't generate captions right now. Please try again."
}
```

### Wrong Caption Count

**First occurrence:** Append the caption count reminder to the user message and retry.

Appended retry instruction:
```
IMPORTANT: You must return exactly 3 captions in the captions array — no more, no fewer. Your previous response did not contain exactly 3 items.
```

**If retry also fails:** Return HTTP `500` with `GENERATION_FAILED` (same as above).

### Hashtag Count Mismatch

**First occurrence:** Append the hashtag count reminder and retry.

Appended retry instruction (with `hashtag_count` substituted):
```
IMPORTANT: The hashtags array for each caption must contain exactly {{hashtag_count}} items. Count carefully before responding.
```

**If retry also fails:** Return HTTP `500` with `GENERATION_FAILED`.

### Safety Refusal (Claude Returns `error` Key)

Detected when the parsed response contains `"error": true` at the top level with `"code": "UNSAFE_TOPIC"`.

- Do not retry.
- Return HTTP `422`:

```json
{
  "error":   true,
  "code":    "UNSAFE_TOPIC",
  "message": "We weren't able to generate captions for this topic. Please try a different topic."
}
```

### Blocklist Pre-check Failure (Before Claude Call)

- Return HTTP `422` immediately (same body as safety refusal above).
- Claude is never called.

### Validation Errors (Request Body)

- Return HTTP `400`:

```json
{
  "error":   true,
  "code":    "<VALIDATION_ERROR_CODE>",
  "message": "<field-specific message>"
}
```

### Rate Limit Exceeded

- Return HTTP `429`:

```json
{
  "error":   true,
  "code":    "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please wait a moment and try again."
}
```

### Retry Limits Summary

| Trigger                          | Max server-side retries | Action after exhaustion   |
|----------------------------------|-------------------------|---------------------------|
| JSON parse failure               | 1                       | HTTP 500, `GENERATION_FAILED` |
| Wrong caption count              | 1                       | HTTP 500, `GENERATION_FAILED` |
| Hashtag count mismatch           | 1                       | HTTP 500, `GENERATION_FAILED` |
| User-initiated regenerate        | Unlimited (each click is a new independent request) | N/A |

---

## Section 6 — Rate Limiting Strategy

### Scope

The free tier has no user accounts. Rate limiting is applied per originating IP address, extracted from the `X-Forwarded-For` header (first IP in chain) or the socket remote address as fallback.

### Limits

| Window     | Max requests per IP | Burst allowance |
|------------|---------------------|-----------------|
| 1 minute   | 10 requests         | Up to 3 in any 5-second window |
| 1 hour     | 60 requests         | —               |

Rationale: 10 requests/minute supports a normal generate + regenerate usage loop (average user generates 2–4 times per session) while preventing automated abuse. 60 requests/hour limits sustained scraping.

### Implementation

Use a sliding-window counter backed by an in-memory store (e.g., Redis or a local in-process LRU cache for single-instance deployments).

Key format: `ratelimit:ip:<hashed_ip>:<window_bucket>`

When the limit is exceeded, set the `Retry-After` header to the number of seconds until the window resets and return HTTP `429`.

### Headers Returned on Every Response

```
X-RateLimit-Limit:     10
X-RateLimit-Remaining: <remaining requests in current window>
X-RateLimit-Reset:     <Unix timestamp of window reset>
```

### Future Considerations

- When user accounts are introduced, switch to per-user-ID rate limiting.
- Consider a tiered limit (higher limits for users who have viewed an ad impression) as a monetization lever.
- Add a global rate limit (across all IPs) to cap total Claude API spend per day: configurable via `MAX_DAILY_CLAUDE_CALLS` environment variable.

---

## Section 7 — Environment Variables

All configuration is read from environment variables. No secrets are hardcoded. The application must fail to start if any required variable is absent.

### Required

| Variable              | Type   | Description                                                     |
|-----------------------|--------|-----------------------------------------------------------------|
| `ANTHROPIC_API_KEY`   | string | Secret key for authenticating with the Anthropic Messages API.  |

### Optional (with defaults)

| Variable                   | Type    | Default              | Description                                                                   |
|----------------------------|---------|----------------------|-------------------------------------------------------------------------------|
| `CLAUDE_MODEL`             | string  | `claude-sonnet-4-5`  | Anthropic model ID. Override to upgrade without a code deploy.                |
| `CLAUDE_MAX_TOKENS`        | integer | `600`                | `max_tokens` passed to the Claude API. Increase to `800` if truncation occurs.|
| `CLAUDE_TEMPERATURE`       | float   | `0.9`                | Baseline temperature for standard generation.                                 |
| `CLAUDE_TEMPERATURE_REGEN` | float   | `1.0`                | Temperature for user-initiated regenerate requests.                           |
| `CLAUDE_TIMEOUT_MS`        | integer | `15000`              | HTTP timeout in milliseconds for Anthropic API calls.                         |
| `RATE_LIMIT_PER_MINUTE`    | integer | `10`                 | Max Claude API calls per IP per minute.                                       |
| `RATE_LIMIT_PER_HOUR`      | integer | `60`                 | Max Claude API calls per IP per hour.                                         |
| `MAX_DAILY_CLAUDE_CALLS`   | integer | `10000`              | Global hard cap on total Claude API calls per UTC day.                        |
| `BLOCKLIST_PATH`           | string  | `./config/blocklist.txt` | Path to the newline-delimited keyword blocklist file.                    |
| `PORT`                     | integer | `3001`               | Port the API server listens on.                                               |
| `NODE_ENV`                 | string  | `development`        | Runtime environment. Set to `production` in deployed environments.            |
| `LOG_LEVEL`                | string  | `info`               | Logging verbosity: `debug`, `info`, `warn`, `error`.                          |

### `.env.example` File

```
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Claude API settings
CLAUDE_MODEL=claude-sonnet-4-5
CLAUDE_MAX_TOKENS=600
CLAUDE_TEMPERATURE=0.9
CLAUDE_TEMPERATURE_REGEN=1.0
CLAUDE_TIMEOUT_MS=15000

# Rate limiting
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_HOUR=60
MAX_DAILY_CLAUDE_CALLS=10000

# Content safety
BLOCKLIST_PATH=./config/blocklist.txt

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

---

## Section 8 — Tech Stack Recommendation

### Language: TypeScript (Node.js)

**Rationale:**
- TypeScript provides compile-time safety for the JSON schema validation and prompt-building logic — two areas where silent type mismatches cause production bugs that are hard to reproduce.
- Node.js has a mature Anthropic SDK (`@anthropic-ai/sdk`) maintained by Anthropic, reducing integration surface area and keeping up with API changes automatically.
- The same language as the frontend (likely React/Next.js) means the team shares tooling, linting rules, and type definitions across the stack.
- Single-threaded async I/O is efficient for this workload — the endpoint is almost entirely waiting on the Claude API, not performing CPU-intensive work.

### Framework: Next.js API Routes (or Express.js)

**Primary recommendation: Next.js API Routes**

If the frontend is built on Next.js (the natural choice for SEO-optimized React apps), the backend endpoint lives as an API route in the same repository. This eliminates CORS configuration, simplifies deployment, and reduces infrastructure overhead for the MVP.

- Route file: `app/api/generate-caption/route.ts` (App Router) or `pages/api/generate-caption.ts` (Pages Router)
- Deployed as a serverless function on Vercel with zero additional configuration.

**Alternative: Express.js**

If the backend must be a standalone service (e.g., the frontend is not Next.js, or a separate deployment is preferred):

- Lightweight, well-understood, minimal overhead.
- Add `express-rate-limit` for rate limiting and `zod` for request schema validation.

### Key Dependencies

| Package                    | Purpose                                       |
|----------------------------|-----------------------------------------------|
| `@anthropic-ai/sdk`        | Official Anthropic API client.                |
| `zod`                      | Runtime request body validation with TypeScript inference. |
| `ioredis` (optional)       | Redis client for distributed rate limiting. Use only if multi-instance deployment is required; skip for MVP. |
| `pino` or `winston`        | Structured logging for production observability. |

### Why Not Python / Other Languages?

- Python is a valid alternative (FastAPI + `anthropic` SDK), but adds a language boundary if the frontend is TypeScript.
- Go would provide better raw performance but offers no meaningful benefit for an I/O-bound endpoint and significantly slows initial development.
- The MVP priority is speed of delivery; TypeScript + Next.js minimizes the number of moving parts.

---

## Section 9 — Folder/File Structure

The structure below assumes a Next.js monorepo. If using a standalone Express server, adapt `app/api/` to `src/routes/`.

```
creator-tool-ai/
├── app/
│   └── api/
│       └── generate-caption/
│           └── route.ts              # POST handler — entry point for the endpoint
│
├── lib/
│   └── caption-generator/
│       ├── buildPrompt.ts            # Constructs system prompt and user message from inputs
│       ├── callClaude.ts             # Anthropic SDK wrapper — sends request, handles timeout
│       ├── parseResponse.ts          # JSON parsing + structural validation of Claude output
│       ├── validateCaption.ts        # Per-caption field validation and post-processing
│       ├── twitterBudget.ts          # Twitter/X hashtag character budget enforcement
│       ├── blocklist.ts              # Keyword blocklist loader and pre-check function
│       ├── platformGuidance.ts       # Platform guidance string map (Section 3)
│       ├── toneGuidance.ts           # Tone guidance string map (Section 3)
│       └── types.ts                  # Shared TypeScript types and Zod schemas
│
├── middleware/
│   └── rateLimiter.ts                # Per-IP sliding window rate limiter
│
├── config/
│   └── blocklist.txt                 # Newline-delimited keyword blocklist
│
├── tests/
│   └── caption-generator/
│       ├── buildPrompt.test.ts
│       ├── parseResponse.test.ts
│       ├── validateCaption.test.ts
│       └── prompt-caption-generator-test-cases.md  # 10 canonical test inputs (see prompt doc Section 10)
│
├── features/
│   └── backend-caption-generator.md  # This file
│
├── docs/
│   └── prompt-caption-generator.md   # Upstream prompt spec
│
├── tasks/
│   └── task-001-caption-generator.md # Product task definition
│
├── .env.example                      # Environment variable template
├── .env.local                        # Local secrets (git-ignored)
└── package.json
```

### Responsibility of Each File

| File                    | Responsibility                                                                 |
|-------------------------|--------------------------------------------------------------------------------|
| `route.ts`              | Parse request body, call validation, call rate limiter, orchestrate the pipeline, return HTTP response. |
| `buildPrompt.ts`        | Substitute all `{{placeholder}}` tokens, inject guidance strings, append regenerate/retry modifiers. |
| `callClaude.ts`         | Initialize Anthropic client, send the message, enforce timeout, surface SDK errors. |
| `parseResponse.ts`      | Extract text from SDK response, run `JSON.parse`, check top-level structure. |
| `validateCaption.ts`    | Per-caption checks: `id`, `text` cleanliness, hashtag count, length limits.   |
| `twitterBudget.ts`      | Trim hashtags to fit the 280-character hard limit for Twitter/X.               |
| `blocklist.ts`          | Load blocklist file at startup, expose a `isBlocked(topic: string): boolean` function. |
| `platformGuidance.ts`   | Export a `PLATFORM_GUIDANCE` record keyed by normalized platform string.       |
| `toneGuidance.ts`       | Export a `TONE_GUIDANCE` nested record keyed by `[tone][platform]`.            |
| `types.ts`              | Zod schema for request body; TypeScript types for `Caption`, `CaptionResponse`, `ErrorResponse`. |
| `rateLimiter.ts`        | Sliding-window counter logic; exports middleware compatible with Next.js route handlers. |

---

## Section 10 — Example Request and Response

### Example A — Success (Standard Generation)

**Request**

```http
POST /api/generate-caption
Content-Type: application/json

{
  "topic": "Morning coffee routine for productivity",
  "platform": "instagram",
  "tone": "casual",
  "hashtag_count": 5
}
```

**Response** — HTTP 200

```json
{
  "captions": [
    {
      "id": 1,
      "text": "First sip hits different when you've got a plan for the day. ☕ My morning coffee routine is basically my unofficial productivity meeting — and it always shows up on time.",
      "hashtags": ["#MorningCoffee", "#ProductivityHacks", "#CoffeeLover", "#MorningRoutine", "#GetThingsDone"]
    },
    {
      "id": 2,
      "text": "Hot coffee, quiet house, no notifications. That's my superpower right there. 🙌 What's the one thing that sets your morning up right?",
      "hashtags": ["#CoffeeOClock", "#MorningVibes", "#ProductivityTips", "#SlowMorning", "#CoffeeCommunity"]
    },
    {
      "id": 3,
      "text": "Okay but who else literally cannot function before coffee? ☕✨ I turned my morning brew into a whole ritual and honestly my to-do list has never been more scared.",
      "hashtags": ["#CoffeeFirst", "#MorningMotivation", "#ProductivityLife", "#CoffeeAddict", "#DailyRoutine"]
    }
  ]
}
```

---

### Example B — Success (Regenerate Request)

**Request**

```http
POST /api/generate-caption
Content-Type: application/json

{
  "topic": "Morning coffee routine for productivity",
  "platform": "instagram",
  "tone": "casual",
  "hashtag_count": 5,
  "regenerate": true
}
```

**Response** — HTTP 200 (same schema, different captions)

```json
{
  "captions": [
    {
      "id": 1,
      "text": "You don't need a 5 AM alarm to win the morning. You need good coffee and zero screen time for the first 20 minutes. ☕ Trust the ritual.",
      "hashtags": ["#MorningRitual", "#CoffeeLife", "#ProductivityMindset", "#SlowMorning", "#CaffeinatedGoals"]
    },
    {
      "id": 2,
      "text": "Coffee: the only meeting I never reschedule. ☕ What does your morning routine actually look like before the chaos kicks in?",
      "hashtags": ["#MorningRoutine", "#CoffeeTalk", "#ProductiveHabits", "#DayStarter", "#CommunityQuestion"]
    },
    {
      "id": 3,
      "text": "Pour. Breathe. Plan. There's something about that quiet coffee moment that makes everything feel possible. 🌅 This is my non-negotiable.",
      "hashtags": ["#CoffeeMoment", "#MorningMindset", "#ProductivityTips", "#GratefulMorning", "#QuietTime"]
    }
  ]
}
```

---

### Example C — Validation Error (Missing Required Field)

**Request**

```http
POST /api/generate-caption
Content-Type: application/json

{
  "topic": "Morning coffee routine",
  "tone": "casual",
  "hashtag_count": 5
}
```

**Response** — HTTP 400

```json
{
  "error": true,
  "code": "MISSING_PLATFORM",
  "message": "platform is required"
}
```

---

### Example D — Validation Error (Invalid Enum)

**Request**

```http
POST /api/generate-caption
Content-Type: application/json

{
  "topic": "Morning coffee routine",
  "platform": "snapchat",
  "tone": "casual",
  "hashtag_count": 5
}
```

**Response** — HTTP 400

```json
{
  "error": true,
  "code": "INVALID_PLATFORM",
  "message": "platform must be one of: instagram, tiktok, linkedin, twitter"
}
```

---

### Example E — Content Policy Violation

**Request**

```http
POST /api/generate-caption
Content-Type: application/json

{
  "topic": "<blocked topic>",
  "platform": "instagram",
  "tone": "casual",
  "hashtag_count": 5
}
```

**Response** — HTTP 422

```json
{
  "error": true,
  "code": "UNSAFE_TOPIC",
  "message": "We weren't able to generate captions for this topic. Please try a different topic."
}
```

---

### Example F — Rate Limit Exceeded

**Response** — HTTP 429

```
Retry-After: 42
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1743175200
```

```json
{
  "error": true,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please wait a moment and try again."
}
```

---

### Example G — Claude API Unavailable

**Response** — HTTP 503

```json
{
  "error": true,
  "code": "CLAUDE_API_ERROR",
  "message": "The caption service is temporarily unavailable. Please try again."
}
```

---

### Example H — Unrecoverable Generation Failure (After Retry)

**Response** — HTTP 500

```json
{
  "error": true,
  "code": "GENERATION_FAILED",
  "message": "We couldn't generate captions right now. Please try again."
}
```

---

*End of document. This file satisfies the Backend agent deliverable for `task-001-caption-generator.md`.*
