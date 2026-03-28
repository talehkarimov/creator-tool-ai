# Prompt Engineering: Caption Generator

**Agent:** Prompt
**Status:** Complete
**Created:** 2026-03-28
**Feature:** Caption Generator (MVP)
**Depends On:** `tasks/task-001-caption-generator.md`

---

## Section 1 — System Prompt

The following system prompt is sent as the `system` parameter in every Claude API call for the Caption Generator feature. It establishes Claude's role, strict behavioral rules, and output format requirements.

```
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
```

---

## Section 2 — User Message Template

This template is populated server-side by the backend before the API call is made. All `{{placeholder}}` tokens are replaced with sanitized, validated user input. The entire populated string is sent as the `user` message in the API call.

```
Generate 3 social media captions using the following inputs:

- Topic: {{topic}}
- Platform: {{platform}}
- Tone: {{tone}}
- Hashtag count: {{hashtag_count}}

Platform-specific guidance:
{{platform_guidance}}

Tone-specific guidance:
{{tone_guidance}}

Return your response as a single JSON object matching this exact schema:
{
  "captions": [
    { "id": 1, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 2, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 3, "text": "...", "hashtags": ["#...", "#..."] }
  ]
}

Do not include any text outside the JSON object.
```

### Placeholder reference

| Placeholder | Source | Notes |
|---|---|---|
| `{{topic}}` | User input | Trimmed, max 200 chars, HTML-escaped |
| `{{platform}}` | Enum selection | One of: `Instagram`, `TikTok`, `LinkedIn`, `Twitter/X` |
| `{{tone}}` | Enum selection | One of: `Casual`, `Professional`, `Funny`, `Inspirational` |
| `{{hashtag_count}}` | User input or default | Integer 0–10; default is 5 if omitted |
| `{{platform_guidance}}` | Server-side lookup | Injected from the platform guidance table in Section 7 |
| `{{tone_guidance}}` | Server-side lookup | Injected from the tone guidance table in Section 7 |

---

## Section 3 — Full Example (Filled Prompt)

### Inputs

| Field | Value |
|---|---|
| topic | Morning coffee routine for productivity |
| platform | Instagram |
| tone | Casual |
| hashtag_count | 5 |

### Populated System Prompt (sent as-is from Section 1)

```
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
```

### Populated User Message

```
Generate 3 social media captions using the following inputs:

- Topic: Morning coffee routine for productivity
- Platform: Instagram
- Tone: Casual
- Hashtag count: 5

Platform-specific guidance:
Instagram captions can be up to 2,200 characters but perform best at 138–150 characters. Use a conversational, visual-first hook in the first line because text is truncated after 2 lines. Emoji usage is welcome and common. Line breaks improve readability. The audience expects authenticity and personal voice.

Tone-specific guidance:
Casual tone on Instagram means writing the way you would talk to a friend. Use contractions, everyday vocabulary, and a relaxed sentence structure. Avoid jargon, buzzwords, and anything that sounds like a press release. Short punchy sentences and relatable observations work well.

Return your response as a single JSON object matching this exact schema:
{
  "captions": [
    { "id": 1, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 2, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 3, "text": "...", "hashtags": ["#...", "#..."] }
  ]
}

Do not include any text outside the JSON object.
```

### Expected Claude Response

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

## Section 4 — Expected Output Format

Claude must return a single, valid JSON object with no surrounding text, no markdown code fences, and no trailing commentary.

### Schema definition

```json
{
  "captions": [
    {
      "id": <integer>,
      "text": <string>,
      "hashtags": <array of strings>
    }
  ]
}
```

### Field-level specification

| Field | Type | Required | Constraints |
|---|---|---|---|
| `captions` | array | yes | Exactly 3 elements |
| `captions[n].id` | integer | yes | Values must be 1, 2, 3 in order |
| `captions[n].text` | string | yes | Non-empty; must not contain hashtags; must respect platform character limits (see Section 8) |
| `captions[n].hashtags` | array of strings | yes | Each element starts with `#`; array length equals `hashtag_count`; empty array `[]` when `hashtag_count` is 0 |

### Error response schema

When the topic is flagged as harmful or the request cannot be fulfilled safely, Claude must return this structure instead:

```json
{
  "error": true,
  "code": "UNSAFE_TOPIC",
  "message": "The topic provided cannot be used to generate captions."
}
```

The backend must detect the `error` key and route to the error UI state without displaying any caption output.

---

## Section 5 — Output Validation Rules

The backend must validate Claude's raw response before passing it to the frontend. A response is considered **valid** only when all of the following conditions are true.

### Structural validity

- The response body can be parsed as JSON without errors.
- The top-level object contains a `captions` key (or an `error` key for the error path).
- `captions` is an array.
- `captions` contains exactly 3 elements.

### Per-caption validity

- `id` is an integer equal to the caption's 1-based position (1, 2, or 3).
- `text` is a non-empty string.
- `text` does not contain any token that matches the pattern `#\w+` (hashtag guard).
- `hashtags` is an array.
- `hashtags.length` equals the `hashtag_count` sent in the request.
- Every element of `hashtags` is a string beginning with `#`.
- `text.length` does not exceed the platform's maximum caption length (see Section 8).

### What makes a response invalid

| Failure condition | Action |
|---|---|
| JSON parse error | Retry once with a stricter format reminder appended to the user message (see Section 9). |
| `captions` array has fewer or more than 3 items | Retry once. |
| Any `text` field contains a `#` character | Strip hashtag tokens from `text` and move them to `hashtags` if the count allows, otherwise retry. |
| `hashtags.length` does not match `hashtag_count` | Retry once. |
| `text` exceeds platform character limit | Truncate at the last complete sentence before the limit and append `…` |
| `error` key present in response | Surface error UI to the user; do not retry automatically. |
| Second retry also fails validation | Return a generic API error to the frontend and log the raw response for review. |

---

## Section 6 — Edge Case Handling

### Empty or whitespace-only topic

- Caught at the frontend form validation layer before the API call is made.
- The "Generate Captions" button is disabled until `topic` contains at least one non-whitespace character.
- Backend should also reject requests where `topic.trim().length === 0` with HTTP 400 and message: `"topic is required"`.
- Do not forward to Claude.

### Topic that is too short (1–3 characters)

- Allow the request to proceed; do not block at validation.
- Append the following note to the user message, after the hashtag count line:

  ```
  Note: The topic provided is very short. Use reasonable creative interpretation to build relevant captions around it.
  ```

- Example: topic `"AI"` should still yield three coherent captions about artificial intelligence.

### Topic at maximum length (200 characters)

- Accept as-is; no special prompt modification required.
- The prompt naturally handles this because the topic is embedded verbatim.

### Offensive, harmful, or policy-violating topic

- Backend performs a lightweight keyword pre-check against a blocklist before calling Claude.
- If the pre-check flags the topic, return HTTP 422 with `{ "error": true, "code": "UNSAFE_TOPIC" }` immediately — do not call Claude.
- If the pre-check passes but Claude itself returns an `error` response (see Section 4), surface the error UI to the user without retry.
- Do not reveal the blocklist contents or explain in detail why the topic was rejected. The UI message should read: "We weren't able to generate captions for this topic. Please try a different topic."

### Platform not provided

- Caught at frontend validation; field is required.
- Backend rejects with HTTP 400 if missing.

### Tone not provided

- Same as platform — required field, rejected before reaching Claude.

### hashtag_count not provided

- Default to `5` server-side. Never pass an undefined or null value to the prompt.

### hashtag_count of 0

- Valid input. The prompt instructs Claude to return `"hashtags": []` for each caption.
- Backend validation must accept empty arrays when `hashtag_count` is 0.

### Non-English topic

- The MVP does not officially support non-English input (out-of-scope per task-001).
- Backend does not perform language detection.
- If a non-English topic is submitted, Claude will likely generate captions in that language. This is accepted behavior for MVP; it will be addressed in a future multi-language milestone.

### Very long words or URLs in topic

- Truncate `topic` to 200 characters server-side before embedding in the prompt.
- If a URL is detected in the topic (matches `https?://`), strip it and substitute `[link removed]` to avoid prompt injection via redirected content.

---

## Section 7 — Tone Guidance per Platform

The following tables define the `{{platform_guidance}}` and `{{tone_guidance}}` strings that are injected into the user message at runtime. The backend selects the correct strings based on the `platform` and `tone` inputs.

---

### Platform guidance strings

**Instagram**
```
Instagram captions can be up to 2,200 characters but perform best at 138–150 characters. Use a conversational, visual-first hook in the first line because text is truncated after 2 lines. Emoji usage is welcome and common. Line breaks improve readability. The audience expects authenticity and personal voice.
```

**TikTok**
```
TikTok captions are capped at 2,200 characters but most successful captions are under 100 characters. The caption plays second fiddle to the video, so be punchy. A question or a bold statement invites comments. Trending slang and lowercase informal text are acceptable and often preferred. Emoji can reinforce energy but do not overload.
```

**LinkedIn**
```
LinkedIn captions (post body) can be up to 3,000 characters; the first 210 characters appear before the "see more" cut-off. Lead with a professional insight, a data point, or a thought-provoking question. Write in first person. Avoid excessive emoji — one or two per post maximum. Hashtags appear at the end of the post, not inline. The audience is professional, career-focused, and values substance over hype.
```

**Twitter/X**
```
Twitter/X posts are hard-limited to 280 characters including spaces. Every character counts. Lead with the most interesting word or claim. Avoid filler phrases. Hashtags count toward the 280-character limit, so use them sparingly (1–2 is ideal). Dry wit, hot takes, and concise observations perform well. Do not pad the caption to fill space.
```

---

### Tone guidance strings

The tone guidance strings below are combined with the platform context. The combination is what distinguishes, for example, "Casual on Instagram" from "Casual on LinkedIn."

**Casual**

| Platform | Casual tone guidance |
|---|---|
| Instagram | Write the way you would talk to a friend. Use contractions, everyday vocabulary, and a relaxed sentence structure. Avoid jargon, buzzwords, and anything that sounds like a press release. Short punchy sentences and relatable observations work well. |
| TikTok | Sound like a real person, not a brand. Lowercase is fine. Slang is fine. Keep it short and high-energy. If it sounds like something you'd say on camera, it's working. |
| LinkedIn | Casual on LinkedIn still means professional. Use "I" statements, speak directly, drop the corporate jargon, and write how you would talk in a team meeting — approachable but credible. |
| Twitter/X | Relaxed, conversational, and direct. Use contractions. Skip formalities. If it sounds like something you'd text a friend who works in your field, that's the right register. |

**Professional**

| Platform | Professional tone guidance |
|---|---|
| Instagram | Polished but not cold. Use complete sentences and correct grammar. Avoid slang. Suitable for business accounts, product launches, or B2B brands. Maintain warmth without being informal. |
| TikTok | Professional TikTok means confident and clear, not stiff. Speak with authority. Use plain language. Avoid corporate-speak — the TikTok audience will scroll past it instantly. |
| LinkedIn | Formal, substantive, and insight-driven. Use industry-appropriate vocabulary. Back up claims with specifics. Write in the first person. Proofread-level polish expected. |
| Twitter/X | Concise and authoritative. Strip all filler. Every word must carry weight. Use precise vocabulary. Avoid hedging language. |

**Funny**

| Platform | Funny tone guidance |
|---|---|
| Instagram | Light humor, relatable comedy, or clever wordplay. Avoid puns that require too much setup — Instagram truncates. The punchline should land in the first two lines. Self-deprecating humor resonates with lifestyle audiences. |
| TikTok | TikTok humor is absurdist, fast, and self-aware. Lean into irony, unexpected twists, or "main character" energy. Reference formats the platform already finds funny without copying a specific trend verbatim. |
| LinkedIn | Rare but powerful when done right. Dry wit and self-aware professional humor work (e.g., poking fun at corporate clichés). Avoid anything that could be misread as sarcasm about your field or audience. Never punch down. |
| Twitter/X | This is humor's home platform. One-liners, dry takes, and absurdist observations thrive. The setup-punchline format works in a single post. Don't over-explain the joke. |

**Inspirational**

| Platform | Inspirational tone guidance |
|---|---|
| Instagram | Warm, uplifting, and personal. Share a genuine moment of growth, struggle overcome, or lesson learned. Avoid generic motivational-poster phrases — make it feel lived-in and specific. End with an empowering call to action or question. |
| TikTok | Inspirational on TikTok means high energy and relatable, not preachy. Frame it as a personal win or a challenge accepted. Keep it brief — the video carries the emotional weight. |
| LinkedIn | Frame inspiration as professional growth, resilience, or industry insight. Story-driven openings perform well. Avoid fluffy affirmations — the LinkedIn audience wants actionable takeaways tied to the inspiration. |
| Twitter/X | Keep inspirational posts short and punchy — no multi-line manifestos. A single powerful sentence or a bold reframe of a common belief is more effective than a paragraph of motivation. |

---

## Section 8 — Token / Length Constraints

### Platform caption character limits

| Platform | Hard limit (chars) | Recommended max for generated `text` field | Notes |
|---|---|---|---|
| Instagram | 2,200 | 220 | Truncated in feed after ~125 chars; keep hook in first line |
| TikTok | 2,200 | 150 | Caption is secondary to video; shorter performs better |
| LinkedIn | 3,000 | 700 | Up to 210 chars visible before "see more"; lead with the hook |
| Twitter/X | 280 | 220 | Hard platform limit; hashtags count toward 280 chars |

The "Recommended max for generated `text` field" column is the limit the backend enforces during output validation. It is intentionally shorter than the platform hard limit to leave room for hashtags when the user copies the full caption (text + hashtags joined by a space).

### Hashtag character budget (Twitter/X only)

On Twitter/X, hashtags count toward the 280-character limit. The backend must calculate:

```
available_chars = 280 - text.length - 1  // 1 for the separating space
hashtag_budget  = available_chars
```

If the combined length of all hashtags (including spaces between them) would push the total past 280 characters, the backend must trim the hashtags array from the end until it fits, then update `hashtag_count` in the response metadata. This is a post-processing step — do not alter the Claude prompt to handle this.

### Token budget for the Claude API call

| Parameter | Value |
|---|---|
| `max_tokens` | 600 |
| Rationale | 3 captions × ~150 chars text + hashtags + JSON structure overhead ≈ 450–550 tokens; 600 gives a safe buffer |

If Claude consistently hits the token limit (response ends mid-JSON), increase `max_tokens` to 800 and log a warning.

---

## Section 9 — Retry Strategy

The Regenerate button and server-side validation retries both reuse the same prompt pipeline but apply specific modifications to ensure output variety and avoid structural failures.

### User-initiated regenerate (Regenerate button click)

When the user clicks Regenerate, the same inputs are sent to the backend, which makes a new Claude API call. To ensure variety, the backend appends the following instruction to the end of the user message, after the JSON schema block:

```
Important: This is a regeneration request. The previous response has already been shown to the user. You must produce 3 entirely new captions that differ meaningfully from a typical first response. Use different opening hooks, different structural approaches, and different angles on the topic. Do not repeat any phrase, sentence structure, or hook style from the most obvious interpretation of this topic.
```

Do not send the previous captions back to Claude — this costs tokens and can cause Claude to anchor on them. The instruction above is sufficient to drive variety.

### Automatic retry on validation failure (server-side)

When output validation fails (see Section 5), the backend performs one automatic retry before returning an error to the frontend.

**Retry trigger: JSON parse failure**

Append to the end of the user message:

```
IMPORTANT: Your previous response could not be parsed as JSON. Return only a valid JSON object. Do not include any text, explanation, markdown, or code fences outside the JSON. Start your response with { and end with }.
```

**Retry trigger: Wrong number of captions**

Append to the end of the user message:

```
IMPORTANT: You must return exactly 3 captions in the captions array — no more, no fewer. Your previous response did not contain exactly 3 items.
```

**Retry trigger: Hashtag count mismatch**

Append to the end of the user message:

```
IMPORTANT: The hashtags array for each caption must contain exactly {{hashtag_count}} items. Count carefully before responding.
```

### Temperature adjustment on retry

On a user-initiated regenerate, raise `temperature` by 0.1 above the baseline (see Section 10) to increase lexical diversity. Cap at `temperature: 1.0`.

On a server-side validation retry, keep `temperature` at the baseline value. Raising temperature on a structural failure may make the JSON less reliable.

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
- Sonnet-class models produce high-quality creative writing with strong instruction-following, which is essential for strict JSON output compliance.
- Haiku-class models are faster and cheaper but less reliably follow multi-constraint formatting rules, which increases validation retry rates and degrades user experience.
- Opus-class models offer marginal creative quality improvement for this task and are not justified by the cost difference for a high-volume, low-complexity generation task.

### Temperature setting

| Context | Temperature | Rationale |
|---|---|---|
| Standard generation (first request) | `0.9` | Produces creative, varied captions while remaining coherent and on-topic |
| Server-side validation retry | `0.9` | Keep stable; do not increase on structural failures |
| User-initiated regenerate | `1.0` (capped) | Increases lexical diversity to avoid repetition across regenerations |

### Additional API parameters

| Parameter | Value | Notes |
|---|---|---|
| `max_tokens` | `600` | See Section 8 for rationale; increase to 800 if truncation is observed |
| `top_p` | Not set (default) | Temperature alone is sufficient for controlling diversity; setting both can produce unpredictable results |
| `top_k` | Not set (default) | Same rationale as `top_p` |
| Streaming | Optional | Can be enabled to reduce perceived latency; the frontend must buffer the full response before running JSON validation |

### Why not a higher temperature?

Temperatures above `1.0` on structured-output tasks cause Claude to deviate from the JSON schema more frequently, increasing validation failures and retry rates. The `0.9` / `1.0` range was chosen as the practical ceiling for this use case.

### Future model upgrade path

When upgrading to a newer model version, run the prompt through the full validation suite against the 10 canonical test inputs (documented separately in `tests/prompt-caption-generator-test-cases.md` — to be created by the Backend agent) before deploying to production. Pay particular attention to JSON schema compliance and hashtag count accuracy, as these are the two most common regression points across model versions.

---

*End of document. This file satisfies the Prompt agent deliverable for `task-001-caption-generator.md`.*
