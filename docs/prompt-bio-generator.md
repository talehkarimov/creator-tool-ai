# Prompt Engineering: Bio Generator

**Agent:** Prompt
**Status:** Complete
**Created:** 2026-03-28
**Feature:** Bio Generator (MVP)
**Depends On:** `tasks/task-002-bio-generator.md`

---

## Section 1 — System Prompt

The following system prompt is sent as the `system` parameter in every Claude API call for the Bio Generator feature. It establishes Claude's role, strict behavioral rules, and output format requirements.

```
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
```

---

## Section 2 — User Message Template

This template is populated server-side by the backend before the API call is made. All `{{placeholder}}` tokens are replaced with sanitized, validated user input. The entire populated string is sent as the `user` message in the API call.

```
Generate 3 social media bios using the following inputs:

- Platform: {{platform}}
- Tone: {{tone}}
- Niche / Profession: {{niche}}
- Key traits: {{traits}}
- Character limit: {{char_limit}}

Platform-specific guidance:
{{platform_guidance}}

Tone-specific guidance:
{{tone_guidance}}

Return your response as a single JSON object matching this exact schema:
{
  "bios": [
    { "id": 1, "text": "..." },
    { "id": 2, "text": "..." },
    { "id": 3, "text": "..." }
  ]
}

Each "text" value must be a single string no longer than {{char_limit}} characters (0 means use the platform default maximum). Do not include any text outside the JSON object.
```

### Placeholder reference

| Placeholder | Source | Notes |
|---|---|---|
| `{{platform}}` | Enum selection | One of: `Instagram`, `TikTok`, `LinkedIn`, `Twitter/X` |
| `{{tone}}` | Enum selection | One of: `Casual`, `Professional`, `Funny`, `Inspirational` |
| `{{niche}}` | User input | Trimmed, max 100 chars, HTML-escaped |
| `{{traits}}` | User input | Trimmed, max 150 chars, HTML-escaped |
| `{{char_limit}}` | User input or default | Integer ≥ 0; 0 means no explicit limit — use platform default; see Section 8 for defaults |
| `{{platform_guidance}}` | Server-side lookup | Injected from the platform guidance table in Section 7 |
| `{{tone_guidance}}` | Server-side lookup | Injected from the tone guidance table in Section 7 |

---

## Section 3 — Full Example (Filled Prompt)

### Inputs

| Field | Value |
|---|---|
| platform | Instagram |
| tone | Inspirational |
| niche | fitness coach |
| traits | marathon runner, dog lover, coffee addict |
| char_limit | 150 |

### Populated System Prompt (sent as-is from Section 1)

```
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
```

### Populated User Message

```
Generate 3 social media bios using the following inputs:

- Platform: Instagram
- Tone: Inspirational
- Niche / Profession: fitness coach
- Key traits: marathon runner, dog lover, coffee addict
- Character limit: 150

Platform-specific guidance:
Instagram bios are capped at 150 characters and must make an impact in a single glance. Use line breaks to create visual rhythm. Emoji are widely accepted and add personality without consuming many characters. The bio is the first thing a visitor reads — lead with what makes you worth following, not just your job title. A subtle call to action or link-in-bio reference at the end is common practice.

Tone-specific guidance:
Inspirational on Instagram means writing a bio that signals a journey, not just a job. Lead with a belief, a mission, or a transformation the creator enables. Avoid generic motivational phrases — root the inspiration in the specific niche and traits provided. The reader should feel that following this account will change something for them.

Return your response as a single JSON object matching this exact schema:
{
  "bios": [
    { "id": 1, "text": "..." },
    { "id": 2, "text": "..." },
    { "id": 3, "text": "..." }
  ]
}

Each "text" value must be a single string no longer than 150 characters (0 means use the platform default maximum). Do not include any text outside the JSON object.
```

### Expected Claude Response

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

## Section 4 — Expected Output Format

Claude must return a single, valid JSON object with no surrounding text, no markdown code fences, and no trailing commentary.

### Schema definition

```json
{
  "bios": [
    {
      "id": <integer>,
      "text": <string>
    }
  ]
}
```

### Field-level specification

| Field | Type | Required | Constraints |
|---|---|---|---|
| `bios` | array | yes | Exactly 3 elements |
| `bios[n].id` | integer | yes | Values must be 1, 2, 3 in order |
| `bios[n].text` | string | yes | Non-empty; single cohesive bio string; must not exceed `char_limit` (or platform default when `char_limit` is 0); hashtags may be embedded inline if platform-appropriate |

### What is NOT in the schema

The `bios` schema has no `hashtags` field. This is an intentional difference from the Caption Generator schema. Hashtags are either embedded naturally inside `text` (for platforms like Instagram and TikTok where inline hashtags are a profile convention) or omitted entirely (for platforms like LinkedIn and Twitter/X where hashtags in a bio are uncommon). The model must never append a separate `hashtags` array.

### Error response schema

When the niche or traits are flagged as harmful or the request cannot be fulfilled safely, Claude must return this structure instead:

```json
{
  "error": true,
  "code": "UNSAFE_CONTENT",
  "message": "The content provided cannot be used to generate bios."
}
```

The backend must detect the `error` key and route to the error UI state without displaying any bio output.

---

## Section 5 — Output Validation Rules

The backend must validate Claude's raw response before passing it to the frontend. A response is considered **valid** only when all of the following conditions are true.

### Structural validity

- The response body can be parsed as JSON without errors.
- The top-level object contains a `bios` key (or an `error` key for the error path).
- `bios` is an array.
- `bios` contains exactly 3 elements.
- No `hashtags` key exists at any level of the response (guard against model regression to the caption schema).

### Per-bio validity

- `id` is an integer equal to the bio's 1-based position (1, 2, or 3).
- `text` is a non-empty string.
- `text.length` does not exceed the effective character limit: `char_limit` when `char_limit > 0`, or the platform default maximum when `char_limit === 0` (see Section 8).
- `text` does not consist solely of whitespace.

### What makes a response invalid

| Failure condition | Action |
|---|---|
| JSON parse error | Retry once with a stricter format reminder appended to the user message (see Section 9). |
| `bios` array has fewer or more than 3 items | Retry once. |
| Any `text` field is empty or whitespace-only | Retry once. |
| Any `text` field exceeds the effective character limit | Truncate at the last complete word or sentence before the limit and append `…`. Do not retry. |
| `hashtags` key present anywhere in the response | Strip it silently; do not retry. The `text` field is sufficient. |
| `error` key present in response | Surface error UI to the user; do not retry automatically. |
| Second retry also fails validation | Return a generic API error to the frontend and log the raw response for review. |

---

## Section 6 — Edge Case Handling

### Empty or whitespace-only niche

- Caught at the frontend form validation layer before the API call is made.
- The "Generate Bios" button is disabled until `niche` contains at least one non-whitespace character.
- Backend must also reject requests where `niche.trim().length === 0` with HTTP 400 and message: `"niche is required"`.
- Do not forward to Claude.

### Empty or whitespace-only traits

- Same treatment as niche — `traits` is a required field.
- Frontend disables submission; backend rejects with HTTP 400 and message: `"traits is required"` if missing.
- Do not forward to Claude.

### Very short niche or traits (1–3 characters)

- Allow the request to proceed; do not block at validation.
- Append the following note to the user message, after the `char_limit` line:

  ```
  Note: One or more inputs are very short. Use reasonable creative interpretation to build a complete, coherent bio around the information provided.
  ```

- Example: niche `"DJ"` and traits `"NYC"` should still yield three distinct, coherent bios about a DJ based in New York.

### Niche or traits at maximum length

- Accept as-is; no special prompt modification required.
- The prompt naturally handles this because the inputs are embedded verbatim.

### Offensive, harmful, or policy-violating content

- Backend performs a lightweight keyword pre-check against the shared blocklist (`lib/caption-generator/blocklist.ts`) before calling Claude.
- If the pre-check flags `niche` or `traits`, return HTTP 422 with `{ "error": true, "code": "UNSAFE_CONTENT" }` immediately — do not call Claude.
- If the pre-check passes but Claude itself returns an `error` response (see Section 4), surface the error UI to the user without retry.
- Do not reveal the blocklist contents or explain in detail why the content was rejected. The UI message should read: "We weren't able to generate bios for this content. Please try different inputs."

### char_limit not provided

- Default to the platform's recommended maximum (see Section 8). Never pass an undefined or null value to the prompt.
- Server-side resolution: look up the platform default from the character limit table and substitute it into `{{char_limit}}` before sending to Claude.

### char_limit = 0

- Valid input meaning "no explicit limit" — apply the platform's default recommended maximum.
- The backend resolves `0` to the platform default before embedding in the prompt. Claude never sees `0` as the char_limit value.
- Backend validation uses the resolved platform default as the enforcement ceiling.

### char_limit exceeds platform hard limit

- Cap silently at the platform hard limit (see Section 8). Do not return a validation error.
- Log a warning for monitoring purposes.

### Platform not provided

- Caught at frontend validation; field is required.
- Backend rejects with HTTP 400 if missing.

### Tone not provided

- Same as platform — required field, rejected before reaching Claude.

### Non-English niche or traits

- The MVP does not officially support non-English input (out-of-scope per task-002).
- Backend does not perform language detection.
- If non-English inputs are submitted, Claude will likely generate bios in that language. This is accepted behavior for MVP and will be addressed in a future multi-language milestone.

### Very long words or URLs in inputs

- Truncate `niche` to 100 characters and `traits` to 150 characters server-side before embedding in the prompt.
- If a URL is detected in either field (matches `https?://`), strip it and substitute `[link removed]` to avoid prompt injection via redirected content.

---

## Section 7 — Platform + Tone Guidance

The following tables define the `{{platform_guidance}}` and `{{tone_guidance}}` strings that are injected into the user message at runtime. The backend selects the correct strings based on the `platform` and `tone` inputs.

Bios are fundamentally different from captions: a bio must represent an identity at a glance rather than accompany a piece of content. Platform guidance here reflects profile conventions (layout, emoji norms, hashtag practices) rather than post-level best practices.

---

### Platform guidance strings

**Instagram**
```
Instagram bios are capped at 150 characters and must make an impact in a single glance. Use line breaks to create visual rhythm. Emoji are widely accepted and add personality without consuming many characters. The bio is the first thing a visitor reads — lead with what makes you worth following, not just your job title. A subtle call to action or link-in-bio reference at the end is common practice.
```

**TikTok**
```
TikTok bios are capped at 80 characters. Brevity is mandatory — every word must justify its existence. Use emoji to compress meaning and inject energy. The tone should feel like the creator is speaking directly to a potential follower. Hashtags are uncommon in TikTok bios and should only appear if they are genuinely identity-defining (e.g., #BookTok, #FitnessTok). Skip the full bio structure — one sharp, memorable line is more effective than a list.
```

**LinkedIn**
```
LinkedIn bios (the "About" headline shown under the name) are capped at 220 characters. Write in plain, professional language. No emoji. No hashtags — they look out of place in a LinkedIn profile bio. Lead with the creator's professional value proposition: what they do, who they help, and what makes them credible. Avoid buzzwords like "passionate" or "guru." The tone should feel like a confident handshake, not a sales pitch.
```

**Twitter/X**
```
Twitter/X bios are capped at 160 characters. Write a single, punchy identity statement. Emoji are acceptable and efficient. Hashtags are rarely used in Twitter/X bios and should only appear when they serve a community identity purpose (e.g., #OpenToWork, a niche community tag). Humor, wit, and a distinctive voice perform well. The bio should make someone decide to follow in under three seconds.
```

---

### Tone guidance strings

The tone guidance strings below are combined with the platform guidance. The combination distinguishes, for example, "Funny on LinkedIn" (dry wit, professionally safe) from "Funny on TikTok" (absurdist, high-energy).

**Casual**

| Platform | Casual tone guidance |
|---|---|
| Instagram | Write as if you're introducing yourself to a new friend at a coffee shop. Contractions, conversational phrasing, and a relaxed structure are ideal. Avoid anything that sounds like a job application. The bio should feel approachable and real. |
| TikTok | Sound like the first line of a video you'd actually watch. Informal, direct, zero pretension. Lowercase is fine. Slang is fine. The goal is "this person gets it," not "this person is impressive." |
| LinkedIn | Casual on LinkedIn still means credible. Drop the corporate jargon and write in plain first-person language — approachable but never unprofessional. Contractions are acceptable. Avoid slang. |
| Twitter/X | Relaxed and conversational. Write as you would talk in a DM with a colleague. Contractions, brevity, and a light touch of personality. Skip formalities entirely. |

**Professional**

| Platform | Professional tone guidance |
|---|---|
| Instagram | Polished and purposeful. Complete sentences, correct grammar, and a clear value statement. Suitable for business accounts, coaches, or consultants. Warmth is allowed — cold is not. |
| TikTok | Confident and clear, not stiff. Speak with authority in the fewest possible words. Avoid corporate phrasing — the TikTok audience will not engage with it. |
| LinkedIn | Formal, substantive, and specific. Use industry-appropriate vocabulary. State credentials or outcomes concisely. First-person voice. Proofread-level polish is expected. |
| Twitter/X | Authoritative and precise. Strip all filler. Every word carries weight. Use exact vocabulary that signals expertise to others in the field. |

**Funny**

| Platform | Funny tone guidance |
|---|---|
| Instagram | Light humor, clever wordplay, or self-deprecating observations. The punchline must land within the character limit — do not set up a joke that requires a second line that gets cut. Relatable absurdity works well for lifestyle and creator niches. |
| TikTok | Lean into the platform's native humor: absurdism, irony, unexpected juxtaposition, or "main character energy." Keep it tight — TikTok's 80-character bio limit means the joke must be fully contained in one line. |
| LinkedIn | Rare but effective when done right. Dry wit, self-aware professional humor, or gentle subversion of LinkedIn clichés (e.g., poking fun at "thought leader" culture). Never punch down. Never make a joke that could read as unprofessional to a recruiter. |
| Twitter/X | This is humor's native platform. One-liners, dry observations, and absurdist self-descriptions thrive here. The setup and punchline must fit in 160 characters. Do not explain the joke. |

**Inspirational**

| Platform | Inspirational tone guidance |
|---|---|
| Instagram | Signal a journey or mission, not just a job. Lead with a belief or transformation the creator enables. Avoid generic motivational-poster phrases — root the inspiration in the specific niche and traits provided. The reader should feel that following this account will change something for them. |
| TikTok | High-energy and relatable, not preachy. Frame inspiration as a personal win or a challenge being taken on. Keep it tight — the bio should feel like the tagline for a compelling story. |
| LinkedIn | Frame inspiration as professional growth, resilience, or a mission to create impact. Avoid fluffy affirmations. The LinkedIn reader wants the inspiration tied to a tangible outcome or track record. |
| Twitter/X | One powerful sentence that reframes how the reader thinks about the niche or the creator's mission. Avoid multi-part structures — a single bold claim lands harder than a list of aspirations in 160 characters. |

---

## Section 8 — Character Limit Constraints per Platform

### Platform bio character limits

| Platform | Hard limit (chars) | Recommended max for generated `text` field | char_limit default (when field omitted or 0) | Notes |
|---|---|---|---|---|
| Instagram | 150 | 150 | 150 | Hard platform limit; line breaks are allowed and count as 1 character each |
| TikTok | 80 | 80 | 80 | Hard platform limit; very short — one punchy line is the target |
| LinkedIn | 220 | 220 | 220 | This refers to the profile headline/bio shown under the name, not the "About" section body |
| Twitter/X | 160 | 160 | 160 | Hard platform limit; emoji count as 2 characters each on Twitter/X |

### Notes on character counting

- **Line breaks:** On Instagram, line breaks (`\n`) count as 1 character each. The backend must count them when enforcing the 150-character limit.
- **Emoji on Twitter/X:** Each emoji occupies 2 characters in Twitter/X's character counter. The backend should apply conservative emoji counting (2 chars per emoji code point) when validating Twitter/X bios to avoid output that appears valid but exceeds the limit in-platform.
- **Emoji on other platforms:** Count as 1–2 characters depending on the Unicode code point. For validation purposes on Instagram, TikTok, and LinkedIn, count each emoji as 2 characters to remain safely under limits.

### char_limit resolution logic (backend)

```
if (char_limit === undefined || char_limit === null) {
  effective_limit = PLATFORM_DEFAULTS[platform]  // from table above
} else if (char_limit === 0) {
  effective_limit = PLATFORM_DEFAULTS[platform]
} else if (char_limit > PLATFORM_HARD_LIMITS[platform]) {
  effective_limit = PLATFORM_HARD_LIMITS[platform]  // cap + log warning
} else {
  effective_limit = char_limit
}
```

The resolved `effective_limit` is what gets embedded as `{{char_limit}}` in the user message and used as the enforcement ceiling in output validation.

### Token budget for the Claude API call

| Parameter | Value |
|---|---|
| `max_tokens` | 400 |
| Rationale | 3 bios × ~160 chars text + JSON structure overhead ≈ 300–380 tokens; 400 gives a safe buffer |

If Claude consistently hits the token limit (response ends mid-JSON), increase `max_tokens` to 600 and log a warning.

---

## Section 9 — Retry Strategy

The Regenerate button and server-side validation retries both reuse the same prompt pipeline but apply specific modifications to ensure output variety and avoid structural failures.

### User-initiated regenerate (Regenerate button click)

When the user clicks Regenerate, the same inputs are sent to the backend, which makes a new Claude API call. To ensure variety, the backend appends the following instruction to the end of the user message, after the JSON schema block:

```
Important: This is a regeneration request. The previous response has already been shown to the user. You must produce 3 entirely new bios that differ meaningfully from a typical first response. Use different structural approaches, different opening angles, and different ways of expressing the creator's identity. Do not repeat any phrase, structural pattern, or framing device from the most obvious interpretation of these inputs.
```

Do not send the previous bios back to Claude — this costs tokens and can cause Claude to anchor on them. The instruction above is sufficient to drive variety.

### Automatic retry on validation failure (server-side)

When output validation fails (see Section 5), the backend performs one automatic retry before returning an error to the frontend.

**Retry trigger: JSON parse failure**

Append to the end of the user message:

```
IMPORTANT: Your previous response could not be parsed as JSON. Return only a valid JSON object. Do not include any text, explanation, markdown, or code fences outside the JSON. Start your response with { and end with }.
```

**Retry trigger: Wrong number of bios**

Append to the end of the user message:

```
IMPORTANT: You must return exactly 3 bios in the bios array — no more, no fewer. Your previous response did not contain exactly 3 items.
```

**Retry trigger: Bio text exceeds character limit**

Append to the end of the user message:

```
IMPORTANT: Each bio "text" value must be no longer than {{char_limit}} characters. Count every character including spaces, emoji, and line breaks before responding. Your previous response contained a bio that exceeded this limit.
```

### Temperature adjustment on retry

On a user-initiated regenerate, raise `temperature` by 0.1 above the baseline (see Section 10) to increase lexical diversity. Cap at `temperature: 1.0`.

On a server-side validation retry, keep `temperature` at the baseline value. Raising temperature on a structural failure may make the JSON less reliable and may increase the chance of character limit violations.

### Maximum retry depth

| Trigger | Max retries | Action after exhaustion |
|---|---|---|
| User-initiated regenerate | Unlimited (each click is a new call) | N/A |
| Server-side validation failure | 1 | Return HTTP 500 with `{ "error": "generation_failed" }`; display error UI with manual retry option |

---

## Section 10 — Model Recommendation + Temperature Setting

### Recommended model

**`claude-sonnet-4-5`** (or the latest Sonnet-class model available at integration time)

Rationale:
- Sonnet-class models produce high-quality creative writing with strong instruction-following, which is essential for strict JSON output compliance and precise character limit adherence.
- Haiku-class models are faster and cheaper but less reliably follow multi-constraint formatting rules, which increases character limit violations and validation retry rates.
- Opus-class models offer marginal creative quality improvement for this task and are not justified by the cost difference for a high-volume, low-complexity generation task.
- Bio generation requires tighter constraint adherence than caption generation (hard platform character limits with no soft-limit fallback), making the reliability advantage of Sonnet-class models more important here than in the Caption Generator.

### Temperature setting

| Context | Temperature | Rationale |
|---|---|---|
| Standard generation (first request) | `0.9` | Produces creative, varied bios while remaining coherent and on-topic |
| Server-side validation retry | `0.9` | Keep stable; do not increase on structural or length failures |
| User-initiated regenerate | `1.0` (capped) | Increases lexical diversity to avoid repetition across regenerations |

### Additional API parameters

| Parameter | Value | Notes |
|---|---|---|
| `max_tokens` | `400` | See Section 8 for rationale; increase to 600 if truncation is observed |
| `top_p` | Not set (default) | Temperature alone is sufficient for controlling diversity; setting both can produce unpredictable results |
| `top_k` | Not set (default) | Same rationale as `top_p` |
| Streaming | Optional | Can be enabled to reduce perceived latency; the frontend must buffer the full response before running JSON validation and character limit checks |

### Why not a higher temperature?

Temperatures above `1.0` on structured-output tasks cause Claude to deviate from the JSON schema more frequently and to generate text that ignores character limit constraints. Bio generation is particularly sensitive to length violations because the platform hard limits are strict and non-negotiable. The `0.9` / `1.0` range was chosen as the practical ceiling for this use case.

### Future model upgrade path

When upgrading to a newer model version, run the prompt through the full validation suite against the canonical test inputs (to be documented separately in `tests/prompt-bio-generator-test-cases.md` — to be created by the Backend agent) before deploying to production. Pay particular attention to character limit compliance and JSON schema correctness, as these are the two most common regression points across model versions for the Bio Generator.

---

*End of document. This file satisfies the Prompt agent deliverable for `task-002-bio-generator.md`.*
