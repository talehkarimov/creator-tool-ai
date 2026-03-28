# Task-002 Execution Brief: Bio Generator

**Prepared by:** Orchestrator
**Date:** 2026-03-28
**Status:** All planning complete — ready for implementation

---

## Planning Status

| Agent | Deliverable | Status |
|---|---|---|
| Product | `tasks/task-002-bio-generator.md` | ✅ Complete |
| SEO | `docs/seo-bio-generator.md` | ✅ Complete |
| UIUX | `docs/uiux-bio-generator.md` | ✅ Complete |
| Prompt | `docs/prompt-bio-generator.md` | ✅ Complete |
| Backend | `features/backend-bio-generator.md` | ✅ Complete |
| Frontend | `features/frontend-bio-generator.md` | ✅ Complete |

---

## What Is Being Built

An AI-powered social media bio generator at `/bio-generator`. Users input their platform, tone, niche, and key traits. Claude returns 3 ready-to-use bio variants. Users copy the one they like.

**Endpoint:** `POST /api/generate-bio`
**Input:** `platform`, `tone`, `niche` (max 100), `traits` (max 150), `char_limit` (optional)
**Output:** `{ "bios": [{ "id": 1, "text": "..." }, ...] }` — 3 variants, no hashtags field

---

## Key Decisions Made During Planning

| Decision | Rationale |
|---|---|
| No hashtags field in output | Bios embed hashtags naturally in text; a separate array adds schema complexity for no UX gain |
| `char_limit: 0` = use platform default | Cleaner UX than a blank field; platform defaults are Instagram 150, TikTok 80, LinkedIn 220, Twitter/X 160 |
| `max_tokens: 400` (vs 600 for captions) | Bios are shorter output; reduces cost and latency |
| Blocklist runs on both `niche` AND `traits` | Both are free-text fields that could carry harmful content |
| Error code `UNSAFE_CONTENT` (not `UNSAFE_TOPIC`) | More accurate for a feature with multiple free-text inputs |
| `AdSlot` imported from caption-generator | Zero duplication; the component has no feature-specific logic |
| `BioCard` is a new component (not a fork of `CaptionCard`) | Different schema (no hashtags), adds char count badge — too different to extend cleanly |
| `ResultsSection` is new (bio nomenclature) | Announces "3 bios generated" vs "3 captions generated" for screen readers |

---

## What Is Shared vs New

### Shared — import directly, do not duplicate

| Asset | Path |
|---|---|
| Rate limiter | `middleware/rateLimiter.ts` |
| Blocklist | `lib/caption-generator/blocklist.ts` |
| Ad slot component | `components/caption-generator/AdSlot.tsx` |
| Ad slot CSS | `styles/caption-generator/AdSlot.module.css` |
| CSS design tokens | `app/globals.css` (`:root` variables) |
| Platform + Tone enums | `lib/caption-generator/types.ts` (PLATFORMS, TONES) |

### New — must be created

| Asset | Path |
|---|---|
| Types + Zod schema | `lib/bio-generator/types.ts` |
| Platform guidance (bio-specific) | `lib/bio-generator/platformGuidance.ts` |
| Tone guidance (bio-specific) | `lib/bio-generator/toneGuidance.ts` |
| Prompt builder | `lib/bio-generator/buildPrompt.ts` |
| Response parser | `lib/bio-generator/parseResponse.ts` |
| Bio validator | `lib/bio-generator/validateBio.ts` |
| API route | `app/api/generate-bio/route.ts` |
| BioForm component | `components/bio-generator/BioForm.tsx` |
| BioCard component | `components/bio-generator/BioCard.tsx` |
| ResultsSection component | `components/bio-generator/ResultsSection.tsx` |
| Page | `app/bio-generator/page.tsx` |
| Layout (SEO metadata) | `app/bio-generator/layout.tsx` |
| CSS modules (×4) | `styles/bio-generator/*.module.css` |

### Explicitly forbidden — do not copy or fork

| Asset | Reason |
|---|---|
| `lib/caption-generator/twitterBudget.ts` | No separate hashtags array in bio output |
| `components/caption-generator/CaptionCard.tsx` | Different schema; char count badge not present |
| `components/caption-generator/CaptionForm.tsx` | Different fields (niche + traits vs topic + hashtag count) |

---

## Implementation Order for Backend Agent

1. `lib/bio-generator/types.ts` — Zod schema, interfaces, platform char limits
2. `lib/bio-generator/platformGuidance.ts` — bio-specific platform strings
3. `lib/bio-generator/toneGuidance.ts` — bio-specific tone × platform matrix
4. `lib/bio-generator/buildPrompt.ts` — system prompt + user message builder
5. `lib/bio-generator/parseResponse.ts` — JSON parse + structural validation
6. `lib/bio-generator/validateBio.ts` — per-bio field checks + char limit enforcement
7. `app/api/generate-bio/route.ts` — POST handler (mirrors route.ts structure from task-001)

## Implementation Order for Frontend Agent

1. `lib/bio-generator/types.ts` (if not already created by backend)
2. `styles/bio-generator/*.module.css` — all 4 CSS modules
3. `components/bio-generator/BioCard.tsx`
4. `components/bio-generator/BioForm.tsx`
5. `components/bio-generator/ResultsSection.tsx`
6. `app/bio-generator/layout.tsx` — SEO metadata
7. `app/bio-generator/page.tsx` — page orchestrator

---

## Acceptance Criteria (from task-002)

- [ ] Form validates all required fields before submission
- [ ] API returns exactly 3 bio variants
- [ ] Each bio is a single text string (no hashtags field)
- [ ] Copy button copies the full bio text to clipboard
- [ ] Regenerate triggers a new API call with the same inputs
- [ ] Loading state (skeleton) visible during API call
- [ ] Error state shown if API fails (with retry option)
- [ ] Page has correct SEO title, meta description, and H1
- [ ] Ad slot placeholder renders above results
- [ ] Mobile responsive (single-column on < 768px)
- [ ] Response time < 5 seconds
- [ ] Character count shown on each bio result card

---

## SEO Targets (from seo-bio-generator.md)

| Element | Value |
|---|---|
| Title | `AI Bio Generator — Free & Instant \| Creator Tool AI` |
| Meta description | `Generate 3 ready-to-use social media bios for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.` |
| H1 | `Free AI Bio Generator for Social Media` |
| Primary keyword | `AI bio generator` |

---

## Notes for Implementors

- Read `features/backend-bio-generator.md` in full before writing any backend code
- Read `features/frontend-bio-generator.md` in full before writing any frontend code
- The mock mode pattern from task-001 (`MOCK_AI=true`) applies here too — add a bio-specific mock response to `callClaude.ts` or create a parallel `callClaudeBio.ts` with its own mock
- Internal link: add a "Generate captions" link on the bio generator page pointing to `/caption-generator`, and vice versa — both SEO docs specify this bidirectional link
