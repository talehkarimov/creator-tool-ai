# Backend Specification: Bio Generator

**Agent:** Backend
**Status:** Complete
**Created:** 2026-03-28
**Feature:** Bio Generator (MVP)
**Depends On:** `tasks/task-002-bio-generator.md`, `docs/prompt-bio-generator.md`

---

## Section 1 — API Endpoint Definition

### Method and Route

```
POST /api/generate-bio
```

### Request Body Schema

Content-Type: `application/json`

```json
{
  "platform":   "<string>",
  "tone":       "<string>",
  "niche":      "<string>",
  "traits":     "<string>",
  "char_limit": "<number | optional>"
}
```

| Field        | Type   | Required | Description                                                                                      |
|--------------|--------|----------|--------------------------------------------------------------------------------------------------|
| `platform`   | string | yes      | Target social platform enum value.                                                               |
| `tone`       | string | yes      | Desired bio tone enum value.                                                                     |
| `niche`      | string | yes      | Creator's profession or niche. Max 100 chars after trim.                                         |
| `traits`     | string | yes      | Key personality traits or descriptors. Max 150 chars after trim.                                 |
| `char_limit` | number | no       | Character limit per bio. `0` = use platform default. Defaults to platform default when omitted.  |

### Success Response Schema

HTTP `200 OK`

```json
{
  "bios": [
    { "id": 1, "text": "..." },
    { "id": 2, "text": "..." },
    { "id": 3, "text": "..." }
  ]
}
```

| Field          | Type    | Description                                                                                  |
|----------------|---------|----------------------------------------------------------------------------------------------|
| `bios`         | array   | Always exactly 3 bio objects.                                                                |
| `bios[n].id`   | integer | 1-based index (1, 2, or 3).                                                                  |
| `bios[n].text` | string  | Complete bio string. Hashtags, if platform-appropriate, are embedded inline within the text. |

> There is no `hashtags` field on bio objects. This is an intentional schema difference from the Caption Generator.

### Error Response Schema

```json
{
  "error":   true,
  "code":    "<ERROR_CODE>",
  "message": "<human-readable description>"
}
```

### HTTP Status Codes

| Code | Condition                                                                 |
|------|---------------------------------------------------------------------------|
| 200  | Success — 3 valid bios returned.                                          |
| 400  | Validation failure — missing or invalid request fields.                   |
| 422  | Content policy violation — niche or traits flagged by blocklist pre-check.|
| 429  | Rate limit exceeded.                                                      |
| 500  | Internal server error — Claude API failure or unrecoverable parse failure.|
| 503  | Claude API unavailable or timeout after retry.                            |

---

## Section 2 — Request Validation Rules

All validation runs server-side before any call to Claude is made.

### Field: `platform`

| Rule                              | Error Code         | HTTP | Message                                                           |
|-----------------------------------|--------------------|------|-------------------------------------------------------------------|
| Field must be present             | `MISSING_PLATFORM` | 400  | `"platform is required"`                                          |
| Must be one of the allowed values | `INVALID_PLATFORM` | 400  | `"platform must be one of: instagram, tiktok, linkedin, twitter"` |

Allowed values (case-insensitive, normalized to lowercase internally):
`instagram`, `tiktok`, `linkedin`, `twitter`

### Field: `tone`

| Rule                              | Error Code      | HTTP | Message                                                                  |
|-----------------------------------|-----------------|------|--------------------------------------------------------------------------|
| Field must be present             | `MISSING_TONE`  | 400  | `"tone is required"`                                                     |
| Must be one of the allowed values | `INVALID_TONE`  | 400  | `"tone must be one of: casual, professional, funny, inspirational"`      |

Allowed values (case-insensitive, normalized to lowercase internally):
`casual`, `professional`, `funny`, `inspirational`

### Field: `niche`

| Rule                             | Error Code          | HTTP | Message                                                                                                    |
|----------------------------------|---------------------|------|------------------------------------------------------------------------------------------------------------|
| Field must be present            | `MISSING_NICHE`     | 400  | `"niche is required"`                                                                                      |
| After trim, length must be > 0   | `MISSING_NICHE`     | 400  | `"niche is required"`                                                                                      |
| Max length 100 characters        | Silently truncated  | —    | No error; truncation applied server-side after trim.                                                       |
| Contains `https?://` pattern     | Silently sanitized  | —    | URL stripped and replaced with `[link removed]`.                                                           |
| Matches keyword blocklist        | `UNSAFE_CONTENT`    | 422  | `"We weren't able to generate bios for this content. Please try different inputs."`                        |

Additional handling:
- If `niche.trim().length` is 1–3 characters the request proceeds, but a short-input note is appended to the user message (see Section 3).
- `niche` is HTML-escaped before prompt injection.

### Field: `traits`

| Rule                             | Error Code          | HTTP | Message                                                                                                    |
|----------------------------------|---------------------|------|------------------------------------------------------------------------------------------------------------|
| Field must be present            | `MISSING_TRAITS`    | 400  | `"traits is required"`                                                                                     |
| After trim, length must be > 0   | `MISSING_TRAITS`    | 400  | `"traits is required"`                                                                                     |
| Max length 150 characters        | Silently truncated  | —    | No error; truncation applied server-side after trim.                                                       |
| Contains `https?://` pattern     | Silently sanitized  | —    | URL stripped and replaced with `[link removed]`.                                                           |
| Matches keyword blocklist        | `UNSAFE_CONTENT`    | 422  | `"We weren't able to generate bios for this content. Please try different inputs."`                        |

Additional handling:
- If `traits.trim().length` is 1–3 characters the request proceeds. The short-input note is appended to the user message in the same pass as any short `niche` note (see Section 3).
- `traits` is HTML-escaped before prompt injection.

### Field: `char_limit`

| Rule                                   | Error Code            | HTTP | Message                                           |
|----------------------------------------|-----------------------|------|---------------------------------------------------|
| If omitted, resolve from platform default | —                  | —    | No error; default applied server-side.            |
| Must be an integer if provided         | `INVALID_CHAR_LIMIT`  | 400  | `"char_limit must be an integer greater than or equal to 0"` |
| Must be >= 0                           | `INVALID_CHAR_LIMIT`  | 400  | `"char_limit must be an integer greater than or equal to 0"` |
| `0` means "use platform default"       | —                     | —    | Resolved server-side; `0` is never forwarded to Claude. |
| Exceeds platform hard limit            | Silently capped       | —    | Capped at platform hard limit; warning logged.    |

Character limit resolution logic (applied before prompt injection):

```typescript
if (char_limit === undefined || char_limit === null) {
  effective_limit = PLATFORM_DEFAULTS[platform];
} else if (char_limit === 0) {
  effective_limit = PLATFORM_DEFAULTS[platform];
} else if (char_limit > PLATFORM_HARD_LIMITS[platform]) {
  effective_limit = PLATFORM_HARD_LIMITS[platform]; // cap + log warning
} else {
  effective_limit = char_limit;
}
```

Platform default and hard limits:

| Platform  | Hard limit (chars) | Default `effective_limit` |
|-----------|-------------------|---------------------------|
| instagram | 150               | 150                       |
| tiktok    | 80                | 80                        |
| linkedin  | 220               | 220                       |
| twitter   | 160               | 160                       |

### Validation Order

1. Parse JSON body — reject non-JSON with HTTP 400.
2. Validate `platform` presence and enum membership.
3. Validate `tone` presence and enum membership.
4. Validate `niche` presence and content.
5. Validate `traits` presence and content.
6. Validate `char_limit` type and range (apply default if absent; resolve `0` to platform default).
7. Sanitize `niche` and `traits` (trim, truncate, strip URLs, HTML-escape).
8. Run blocklist pre-check on sanitized `niche` and `traits`.
9. Check rate limit for the requesting IP.
10. Forward to Claude API integration layer.

---

## Section 3 — Claude API Integration

### Overview

The backend constructs a two-part message payload (system prompt + user message) using the templates defined in `docs/prompt-bio-generator.md` and forwards it to the Anthropic Messages API.

### Anthropic Messages API Call

**Endpoint:** `https://api.anthropic.com/v1/messages`
**Method:** `POST`
**Auth header:** `x-api-key: ${ANTHROPIC_API_KEY}`
**Version header:** `anthropic-version: 2023-06-01`

### Model

```
claude-sonnet-4-5
```

This is the Sonnet-class model as specified in `docs/prompt-bio-generator.md` Section 10. Bio generation requires tighter constraint adherence than caption generation (hard platform character limits with no soft-limit fallback), making the reliability advantage of Sonnet-class models more important here. Upgrade to the latest Sonnet release when available after running the validation suite.

### API Request Payload

```json
{
  "model":      "claude-sonnet-4-5",
  "max_tokens": 400,
  "temperature": 0.9,
  "system":     "<system prompt from docs/prompt-bio-generator.md Section 1>",
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
- Server-side validation retry: `0.9` (unchanged — do not raise on structural or length failures)
- User-initiated regenerate: `1.0` (capped)

If Claude consistently hits the token limit (response ends mid-JSON), increase `max_tokens` to `600` and log a warning.

### System Prompt Injection

The system prompt is taken verbatim from `docs/prompt-bio-generator.md` Section 1. It is a static string stored as a server-side constant — it does not vary per request.

```
SYSTEM_PROMPT = """
You are an expert social media profile writer. Your only job is to write social media bios for content creators.

Rules you must follow without exception:
1. Always return exactly 3 bio variants — no more, no fewer.
2. Always return valid JSON matching the exact schema provided. Never add prose, explanation, or markdown outside the JSON block.
3. Each bio must be unique in structure, angle, and phrasing. Do not produce three versions of the same sentence or the same identity framing.
4. Tailor every bio to the target platform's culture, character limits, and profile conventions.
5. Match the requested tone precisely. Do not blend tones unless explicitly instructed.
6. Each bio is a single cohesive text string. There is no separate hashtags field. If hashtags are appropriate for the platform, embed them naturally within the bio text.
7. The bio text must not exceed the char_limit value provided. If char_limit is 0, apply the platform's default recommended maximum length.
8. Do not include the creator's name or any placeholder like "[Your Name]" in the bio — the user will add their own name if desired.
9. Do not produce bios that contain hate speech, harassment, explicit sexual content, self-harm glorification, or instructions for illegal activity. If the niche or traits imply any of these, return the structured error response described in Section 6.
10. Do not add commentary about the inputs, the user, or your own output. Return only the JSON.
"""
```

### User Message Template Population

The backend performs the following substitutions on the template from `docs/prompt-bio-generator.md` Section 2 before sending:

| Placeholder              | Source                                                                          |
|--------------------------|---------------------------------------------------------------------------------|
| `{{platform}}`           | Display-form enum: `Instagram`, `TikTok`, `LinkedIn`, `Twitter/X`              |
| `{{tone}}`               | Display-form enum: `Casual`, `Professional`, `Funny`, `Inspirational`          |
| `{{niche}}`              | Sanitized, trimmed, truncated to 100 chars, HTML-escaped user input.           |
| `{{traits}}`             | Sanitized, trimmed, truncated to 150 chars, HTML-escaped user input.           |
| `{{char_limit}}`         | Resolved `effective_limit` integer (never `0` or `undefined`).                 |
| `{{platform_guidance}}`  | Looked up from the platform guidance map in `lib/bio-generator/platformGuidance.ts`. |
| `{{tone_guidance}}`      | Looked up from the tone + platform guidance map in `lib/bio-generator/toneGuidance.ts`. |

#### Platform guidance map

The platform guidance strings are sourced verbatim from `docs/prompt-bio-generator.md` Section 7 and stored in `lib/bio-generator/platformGuidance.ts`. The lookup key is the normalized (lowercase) platform string.

| Key         | Guidance string summary (see prompt doc for full text)                                                                    |
|-------------|---------------------------------------------------------------------------------------------------------------------------|
| `instagram` | 150-char cap; line breaks for visual rhythm; emoji accepted; lead with what makes you worth following; CTA at end.        |
| `tiktok`    | 80-char cap; brevity mandatory; emoji compress meaning; one sharp memorable line; hashtags only if identity-defining.     |
| `linkedin`  | 220-char cap; plain professional language; no emoji; no hashtags; lead with professional value proposition.               |
| `twitter`   | 160-char cap; single punchy identity statement; emoji acceptable; hashtags only for community identity; wit performs well.|

#### Tone guidance map

The tone guidance map is a two-dimensional lookup keyed by `[tone][platform]`. Full strings are sourced from `docs/prompt-bio-generator.md` Section 7 and stored in `lib/bio-generator/toneGuidance.ts`.

```
TONE_GUIDANCE[tone][platform] -> string
```

Example lookup: `TONE_GUIDANCE["inspirational"]["instagram"]` returns the "Inspirational on Instagram" guidance string.

### Short-input note injection

If either `niche.trim().length <= 3` or `traits.trim().length <= 3`, append the following line to the user message after the `char_limit` line:

```
Note: One or more inputs are very short. Use reasonable creative interpretation to build a complete, coherent bio around the information provided.
```

This note is appended once regardless of whether one or both fields are short.

### Regenerate request injection

If the request includes `"regenerate": true` in the body, append the following block after the JSON schema section of the user message:

```
Important: This is a regeneration request. The previous response has already been shown to the user. You must produce 3 entirely new bios that differ meaningfully from a typical first response. Use different structural approaches, different opening angles, and different ways of expressing the creator's identity. Do not repeat any phrase, structural pattern, or framing device from the most obvious interpretation of these inputs.
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

1. Top-level object contains key `bios` OR key `error`.
2. If `error` key is present, route immediately to the safety refusal handler (see Section 5).
3. `bios` is an array.
4. `bios.length === 3`.
5. No `hashtags` key exists anywhere in the response. If found, strip it silently; do not retry (guard against model regression to the Caption Generator schema).

If checks 1–4 fail (excluding the `hashtags` strip), trigger the wrong-bio-count retry.

### Step 4 — Per-Bio Validation

For each bio object in the array:

| Check                                              | Action on failure                                                                  |
|----------------------------------------------------|------------------------------------------------------------------------------------|
| `id` equals bio's 1-based position                 | Reassign `id` values as 1, 2, 3 in order.                                         |
| `text` is a non-empty string                       | Trigger retry.                                                                     |
| `text` is not solely whitespace                    | Trigger retry.                                                                     |
| `text.length <= effective_limit`                   | Truncate at last complete word or sentence before the limit; append `…`. No retry. |

#### Emoji character counting

| Platform  | Emoji counting rule for enforcement                                          |
|-----------|------------------------------------------------------------------------------|
| twitter   | Count each emoji as 2 characters (matches Twitter/X's counter behavior).    |
| instagram | Count each emoji as 2 characters (conservative; stays safely under limit).  |
| tiktok    | Count each emoji as 2 characters (conservative).                            |
| linkedin  | Count each emoji as 2 characters (conservative).                            |

Line breaks (`\n`) on Instagram count as 1 character each. The backend must count them when enforcing the 150-character limit.

### Step 5 — Return Validated Payload

Construct the final response object and return it to the frontend:

```json
{
  "bios": [
    { "id": 1, "text": "..." },
    { "id": 2, "text": "..." },
    { "id": 3, "text": "..." }
  ]
}
```

There is no Twitter/X hashtag budget step for the Bio Generator. Hashtags are embedded inline in `text` and counted within the same `effective_limit` enforcement as the rest of the bio.

---

## Section 5 — Error Handling

### Claude API Failure (Non-2xx HTTP)

- Log the Anthropic API status code and response body.
- Do not retry.
- Return HTTP `503` to the client:

```json
{
  "error":   true,
  "code":    "CLAUDE_API_ERROR",
  "message": "The bio service is temporarily unavailable. Please try again."
}
```

### Timeout

- Set a request timeout of `CLAUDE_TIMEOUT_MS` milliseconds (default: 15,000 ms).
- If the Anthropic API does not respond within the timeout, abort the request.
- Return HTTP `503`:

```json
{
  "error":   true,
  "code":    "TIMEOUT",
  "message": "The request took too long. Please try again."
}
```

### JSON Parse Failure (Invalid / Malformed Response)

**First occurrence:** Append the JSON format reminder to the user message and retry the call at the same temperature (`0.9`). Do not raise temperature on structural failures.

Appended retry instruction:
```
IMPORTANT: Your previous response could not be parsed as JSON. Return only a valid JSON object. Do not include any text, explanation, markdown, or code fences outside the JSON. Start your response with { and end with }.
```

**If retry also fails:** Log the raw Claude response for review. Return HTTP `500`:

```json
{
  "error":   true,
  "code":    "GENERATION_FAILED",
  "message": "We couldn't generate bios right now. Please try again."
}
```

### Wrong Bio Count

**First occurrence:** Append the bio count reminder to the user message and retry.

Appended retry instruction:
```
IMPORTANT: You must return exactly 3 bios in the bios array — no more, no fewer. Your previous response did not contain exactly 3 items.
```

**If retry also fails:** Return HTTP `500` with `GENERATION_FAILED` (same body as above).

### Bio Text Exceeds Character Limit

- Do not retry.
- Truncate the `text` field at the last complete word or sentence before the `effective_limit`, then append `…`.
- Log a warning noting the platform, requested limit, and actual length before truncation.

### Safety Refusal (Claude Returns `error` Key)

Detected when the parsed response contains `"error": true` at the top level with `"code": "UNSAFE_CONTENT"`.

- Do not retry.
- Return HTTP `422`:

```json
{
  "error":   true,
  "code":    "UNSAFE_CONTENT",
  "message": "We weren't able to generate bios for this content. Please try different inputs."
}
```

### Blocklist Pre-check Failure (Before Claude Call)

- Return HTTP `422` immediately (same body as safety refusal above).
- Claude is never called.
- Do not reveal blocklist contents or explain in detail why the content was rejected.

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

| Trigger                       | Max server-side retries | Action after exhaustion           |
|-------------------------------|-------------------------|-----------------------------------|
| JSON parse failure            | 1                       | HTTP 500, `GENERATION_FAILED`     |
| Wrong bio count               | 1                       | HTTP 500, `GENERATION_FAILED`     |
| Bio text too long             | 0 (truncate, no retry)  | Truncate and return               |
| User-initiated regenerate     | Unlimited (each click is a new independent request) | N/A    |

---

## Section 6 — Rate Limiting Strategy

The Bio Generator endpoint reuses the existing rate limiter middleware established in task-001 without modification.

### Shared Middleware

Import directly from:

```
middleware/rateLimiter.ts
```

Do not create a new rate limiter for the Bio Generator. Apply the same middleware instance to `POST /api/generate-bio` as is applied to `POST /api/generate-caption`.

### Limits (inherited from task-001)

| Window     | Max requests per IP | Burst allowance                     |
|------------|---------------------|-------------------------------------|
| 1 minute   | 10 requests         | Up to 3 in any 5-second window      |
| 1 hour     | 60 requests         | —                                   |

The per-minute and per-hour limits apply **across all endpoints combined** per IP. A user who has exhausted their caption generator quota cannot bypass it by switching to the bio generator.

### Key Format

```
ratelimit:ip:<hashed_ip>:<window_bucket>
```

This key format is defined in `middleware/rateLimiter.ts` and shared across endpoints.

### Headers Returned on Every Response

```
X-RateLimit-Limit:     10
X-RateLimit-Remaining: <remaining requests in current window>
X-RateLimit-Reset:     <Unix timestamp of window reset>
```

When the limit is exceeded, set the `Retry-After` header to the number of seconds until the window resets.

---

## Section 7 — Environment Variables

Only variables that are new or different from task-001 are listed here. All task-001 variables (`ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, `CLAUDE_TEMPERATURE`, `CLAUDE_TEMPERATURE_REGEN`, `CLAUDE_TIMEOUT_MS`, `RATE_LIMIT_PER_MINUTE`, `RATE_LIMIT_PER_HOUR`, `MAX_DAILY_CLAUDE_CALLS`, `BLOCKLIST_PATH`, `PORT`, `NODE_ENV`, `LOG_LEVEL`) carry forward unchanged.

### Changed from task-001

| Variable           | task-001 value | task-002 value | Reason for change                                                        |
|--------------------|---------------|----------------|--------------------------------------------------------------------------|
| `CLAUDE_MAX_TOKENS`| `600`         | `400`          | Bio responses are shorter than caption responses (3 short strings vs. 3 captions + hashtag arrays). Increase to `600` if truncation is observed. |

### No New Required Variables

The Bio Generator introduces no new required environment variables. `ANTHROPIC_API_KEY` from task-001 covers authentication.

### `.env.example` Delta

Add or update the following line in `.env.example` (all other lines remain unchanged from task-001):

```
# Bio Generator — override max tokens if truncation is observed
CLAUDE_MAX_TOKENS=400
```

---

## Section 8 — File/Folder Structure

Only new files introduced by the Bio Generator are listed. Shared files are referenced by path and must not be duplicated.

```
creator-tool-ai/
├── app/
│   └── api/
│       └── generate-bio/
│           └── route.ts                    # NEW — POST handler entry point for /api/generate-bio
│
├── lib/
│   └── bio-generator/
│       ├── buildPrompt.ts                  # NEW — constructs system prompt and user message from inputs
│       ├── callClaude.ts                   # NEW — Anthropic SDK wrapper (parallel to caption-generator/callClaude.ts)
│       ├── parseResponse.ts                # NEW — JSON parsing + structural validation of Claude bio output
│       ├── validateBio.ts                  # NEW — per-bio field validation and truncation logic
│       ├── platformGuidance.ts             # NEW — bio-specific platform guidance string map
│       ├── toneGuidance.ts                 # NEW — bio-specific tone × platform guidance map
│       └── types.ts                        # NEW — Zod schema for request body; TypeScript types for Bio, BioResponse, ErrorResponse
│
├── tests/
│   └── bio-generator/
│       ├── buildPrompt.test.ts             # NEW
│       ├── parseResponse.test.ts           # NEW
│       ├── validateBio.test.ts             # NEW
│       └── prompt-bio-generator-test-cases.md  # NEW — canonical test inputs (referenced in docs/prompt-bio-generator.md Section 10)
```

### Shared Files Referenced (Do Not Duplicate)

| Shared file                                     | Used by                  | Notes                                                           |
|-------------------------------------------------|--------------------------|-----------------------------------------------------------------|
| `middleware/rateLimiter.ts`                     | `app/api/generate-bio/route.ts` | Import directly; no changes needed.                      |
| `lib/caption-generator/blocklist.ts`            | `app/api/generate-bio/route.ts` | Import directly; exposes `isBlocked(input: string): boolean`. |

### Responsibility of Each New File

| File                              | Responsibility                                                                                            |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------|
| `route.ts`                        | Parse request body, call validation, call rate limiter, orchestrate the bio pipeline, return HTTP response.|
| `buildPrompt.ts`                  | Substitute all `{{placeholder}}` tokens, inject guidance strings, resolve `effective_limit`, append regenerate/retry modifiers. |
| `callClaude.ts`                   | Initialize Anthropic client, send the message payload, enforce timeout, surface SDK errors.               |
| `parseResponse.ts`                | Extract text from SDK response, run `JSON.parse`, check top-level `bios`/`error` structure, strip rogue `hashtags` key. |
| `validateBio.ts`                  | Per-bio checks: `id` ordering, `text` non-empty, whitespace-only guard, character limit enforcement with truncation. |
| `platformGuidance.ts`             | Export a `PLATFORM_GUIDANCE` record keyed by normalized platform string (bio-specific strings from prompt doc Section 7). |
| `toneGuidance.ts`                 | Export a `TONE_GUIDANCE` nested record keyed by `[tone][platform]` (bio-specific strings from prompt doc Section 7). |
| `types.ts`                        | Zod schema for `BioRequestSchema`; TypeScript types for `Bio`, `BioResponse`, `BioErrorResponse`.         |

---

## Section 9 — Reuse Notes

This section explicitly states which task-001 library files are imported versus which new files are created for the Bio Generator.

### Imported Directly from task-001 (No Duplication)

| task-001 file                           | Import in Bio Generator             | What it provides                                         |
|-----------------------------------------|-------------------------------------|----------------------------------------------------------|
| `middleware/rateLimiter.ts`             | `app/api/generate-bio/route.ts`     | Per-IP sliding-window rate limiting middleware.          |
| `lib/caption-generator/blocklist.ts`    | `app/api/generate-bio/route.ts`     | `isBlocked(input: string): boolean` pre-check function.  |

### New Files Created for task-002 (Not Shared with Caption Generator)

| New file                              | Reason not reused from task-001                                                                          |
|---------------------------------------|----------------------------------------------------------------------------------------------------------|
| `lib/bio-generator/buildPrompt.ts`    | Different prompt template, different placeholder set (`niche`, `traits`, `char_limit` vs. `topic`, `hashtag_count`). |
| `lib/bio-generator/callClaude.ts`     | Parallel structure to caption-generator version but with `max_tokens: 400` default and bio-specific logging context. |
| `lib/bio-generator/parseResponse.ts`  | Different top-level key (`bios` vs. `captions`); strips rogue `hashtags` key; no hashtag array validation path. |
| `lib/bio-generator/validateBio.ts`    | No hashtag count validation; char limit enforcement replaces platform text length check; different truncation logic. |
| `lib/bio-generator/platformGuidance.ts` | Bio-specific platform guidance strings (profile conventions vs. post-level best practices).            |
| `lib/bio-generator/toneGuidance.ts`   | Bio-specific tone × platform guidance strings.                                                           |
| `lib/bio-generator/types.ts`          | Different Zod schema (`niche`, `traits`, `char_limit` fields); `Bio` type has no `hashtags` property.   |

### Not Reused (Per task-002 Reuse Notes)

| task-001 file                              | Disposition in task-002                                                     |
|--------------------------------------------|-----------------------------------------------------------------------------|
| `lib/caption-generator/types.ts`           | Do NOT import. Create a separate `lib/bio-generator/types.ts` with bio-specific schemas. The `PLATFORMS` and `TONES` enums may be copied as local constants, not imported across feature boundaries. |
| `lib/caption-generator/platformGuidance.ts`| Do NOT import. Bio platform guidance is fundamentally different from caption platform guidance. |
| `lib/caption-generator/toneGuidance.ts`    | Do NOT import. Bio tone guidance is bio-specific.                           |
| `lib/caption-generator/twitterBudget.ts`   | Do NOT import or reference. Bios have no separate hashtags array; there is no hashtag budget calculation for the Bio Generator. |

---

## Section 10 — Example Request and Response

### Example A — Success (Standard Generation)

**Request**

```http
POST /api/generate-bio
Content-Type: application/json

{
  "platform": "instagram",
  "tone": "inspirational",
  "niche": "fitness coach",
  "traits": "marathon runner, dog lover, coffee addict",
  "char_limit": 150
}
```

**Response** — HTTP 200

```json
{
  "bios": [
    {
      "id": 1,
      "text": "Fitness coach turning everyday people into marathon finishers 🏅\nDog walks. Black coffee. Big goals.\n⬇️ Your first race starts here"
    },
    {
      "id": 2,
      "text": "I run 26.2 miles so I know you can run one more rep 💪\nCoaching bodies & mindsets | Dog mom | Fueled by espresso ☕"
    },
    {
      "id": 3,
      "text": "Certified coach. Marathon runner. Proof that consistency beats talent every time 🔥\nBringing the dog, the coffee & the plan 👇"
    }
  ]
}
```

---

### Example B — Success (Regenerate Request)

**Request**

```http
POST /api/generate-bio
Content-Type: application/json

{
  "platform": "instagram",
  "tone": "inspirational",
  "niche": "fitness coach",
  "traits": "marathon runner, dog lover, coffee addict",
  "char_limit": 150,
  "regenerate": true
}
```

**Response** — HTTP 200 (same schema, different bios)

```json
{
  "bios": [
    {
      "id": 1,
      "text": "Every mile is a lesson. Every rep is a choice. 🏃\nCoach | Marathon maniac | Dog & coffee powered ☕\n📲 Let's build your strongest year"
    },
    {
      "id": 2,
      "text": "I didn't start fast — I started consistent 💥\nFitness coaching for real humans | 26.2 miles proven | Dog walks count as recovery"
    },
    {
      "id": 3,
      "text": "Helping you go from couch to finish line 🏅\nMarathon runner. Coffee ritualist. Dog walk evangelist.\n⬇️ Start with one small step"
    }
  ]
}
```

---

### Example C — Validation Error (Missing Required Field)

**Request**

```http
POST /api/generate-bio
Content-Type: application/json

{
  "platform": "instagram",
  "tone": "casual",
  "traits": "dog lover, reader, home cook"
}
```

**Response** — HTTP 400

```json
{
  "error": true,
  "code": "MISSING_NICHE",
  "message": "niche is required"
}
```

---

### Example D — Validation Error (Invalid Enum)

**Request**

```http
POST /api/generate-bio
Content-Type: application/json

{
  "platform": "snapchat",
  "tone": "casual",
  "niche": "travel photographer",
  "traits": "adventure seeker, minimalist, film lover"
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

### Example E — Validation Error (Invalid char_limit)

**Request**

```http
POST /api/generate-bio
Content-Type: application/json

{
  "platform": "twitter",
  "tone": "funny",
  "niche": "stand-up comedian",
  "traits": "self-deprecating, dad jokes, always late",
  "char_limit": -5
}
```

**Response** — HTTP 400

```json
{
  "error": true,
  "code": "INVALID_CHAR_LIMIT",
  "message": "char_limit must be an integer greater than or equal to 0"
}
```

---

### Example F — Content Policy Violation

**Request**

```http
POST /api/generate-bio
Content-Type: application/json

{
  "platform": "instagram",
  "tone": "casual",
  "niche": "<blocked niche>",
  "traits": "some traits here"
}
```

**Response** — HTTP 422

```json
{
  "error": true,
  "code": "UNSAFE_CONTENT",
  "message": "We weren't able to generate bios for this content. Please try different inputs."
}
```

---

### Example G — Rate Limit Exceeded

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

### Example H — Claude API Unavailable

**Response** — HTTP 503

```json
{
  "error": true,
  "code": "CLAUDE_API_ERROR",
  "message": "The bio service is temporarily unavailable. Please try again."
}
```

---

### Example I — Unrecoverable Generation Failure (After Retry)

**Response** — HTTP 500

```json
{
  "error": true,
  "code": "GENERATION_FAILED",
  "message": "We couldn't generate bios right now. Please try again."
}
```

---

*End of document. This file satisfies the Backend agent deliverable for `task-002-bio-generator.md`.*
