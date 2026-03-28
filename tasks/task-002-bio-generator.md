# Task-002: Bio Generator

**Agent:** Product
**Status:** Ready
**Created:** 2026-03-28
**Feature:** Bio Generator (MVP)

---

## Objective

Build an AI-powered social media bio generator that takes a platform, tone, profession/niche, and key traits as input and outputs 3 ready-to-use bio variants — helping content creators establish their identity and drive profile visits.

---

## Business Goal

- Extend the tool suite with a second high-intent feature to increase pages indexed and return visits
- Reuse the existing API, prompt, and UI patterns established in Task-001 to minimize new build surface
- Generate ad impressions on the bio generator page (same ad slot pattern as Caption Generator)
- Establish an internal link between `/caption-generator` and `/bio-generator` to strengthen SEO authority

---

## In-Scope

- Single-page bio generator UI at `/bio-generator`
- Input fields: platform, tone, profession/niche (free text), key traits (free text), optional character limit toggle
- Claude API call via a new backend endpoint `/api/generate-bio`
- Return 3 bio variants per request
- Copy-to-clipboard per bio
- Regenerate button
- Ad slot placeholder (same position as task-001)
- SEO-optimized landing page (title, meta, H1, intro paragraph)
- Reuse existing component patterns from Caption Generator (form card, result card, ad slot, loading skeleton, error state)

---

## Out-of-Scope

- User accounts / auth
- Saved bios / history
- Profile photo or link-in-bio features
- Auto-publishing to social platforms
- Multi-language support
- Bio analytics or A/B testing

---

## Input / Output

### Input

| Field | Type | Required | Values / Constraints |
|---|---|---|---|
| `platform` | enum | yes | instagram, tiktok, linkedin, twitter |
| `tone` | enum | yes | casual, professional, funny, inspirational |
| `niche` | string | yes | free text, max 100 chars — e.g. "fitness coach", "travel photographer" |
| `traits` | string | yes | free text, max 150 chars — e.g. "marathon runner, dog lover, coffee addict" |
| `char_limit` | number | no | 0 = no limit, otherwise platform-aware max; default: platform default |

### Output

```json
{
  "bios": [
    { "id": 1, "text": "..." },
    { "id": 2, "text": "..." },
    { "id": 3, "text": "..." }
  ]
}
```

> Note: Bios do not have a separate hashtag field — hashtags (if appropriate for the platform) are embedded naturally in the bio text by the AI.

---

## User Flow

```
1. User lands on /bio-generator
       ↓
2. User fills: platform + tone + niche + traits (+ optional char limit)
       ↓
3. User clicks "Generate Bios"
       ↓
4. Loading state shown (skeleton cards)
       ↓
5. 3 bio variants appear below the form
   [Ad slot rendered above results]
       ↓
6. User clicks "Copy" on preferred bio
       ↓
7. User can click "Regenerate" to get 3 new variants
   (same inputs, new AI call)
```

---

## Acceptance Criteria

- [ ] Form validates all required fields before submission
- [ ] API returns exactly 3 bio variants
- [ ] Each bio is a single text string (no separate hashtags field)
- [ ] Copy button copies the full bio text to clipboard
- [ ] Regenerate triggers a new API call with the same inputs
- [ ] Loading state (skeleton) is visible during API call
- [ ] Error state shown if API fails (with retry option)
- [ ] Page has correct SEO title, meta description, and H1
- [ ] Ad slot placeholder renders above the results section
- [ ] Mobile responsive (single-column layout on < 768px)
- [ ] Response time < 5 seconds under normal conditions
- [ ] Character count shown on each bio result (so user knows if it fits)

---

## Involved Agents

| Agent | Role | Depends On |
|---|---|---|
| **Product** | Task definition, user flow, acceptance criteria | — |
| **SEO** | Keyword strategy, page copy, meta tags | Product |
| **UIUX** | Wireframe, component layout, UX states | Product |
| **Prompt** | Claude prompt template, input/output format | Product |
| **Backend** | `/api/generate-bio` endpoint, Claude API integration | Prompt |
| **Frontend** | Form UI, results display, copy/regenerate, ad slot | UIUX, Backend |

---

## Deliverables

| Agent | Output File | Status |
|---|---|---|
| Product | `tasks/task-002-bio-generator.md` | ✅ |
| SEO | `docs/seo-bio-generator.md` | Pending |
| UIUX | `docs/uiux-bio-generator.md` | Pending |
| Prompt | `docs/prompt-bio-generator.md` | Pending |
| Backend | `features/backend-bio-generator.md` | Pending |
| Frontend | `features/frontend-bio-generator.md` | Pending |

---

## Dependency Map

```
[Product] task-002
    │
    ├─────────────────────────────┬──────────────────────────┐
    ▼                             ▼                          ▼
[SEO]                          [UIUX]                   [Prompt]
docs/seo-bio-generator.md  docs/uiux-bio-generator.md  docs/prompt-bio-generator.md
                                  │                          │
                                  │                          ▼
                                  │                      [Backend]
                                  │              features/backend-bio-generator.md
                                  │                          │
                                  └──────────────────────────┘
                                                 ▼
                                            [Frontend]
                                   features/frontend-bio-generator.md
```

**Execution order:**
1. **Product** → task-002 (this file)
2. **Parallel:** SEO + UIUX + Prompt
3. **Backend** — starts after Prompt delivers `docs/prompt-bio-generator.md`
4. **Frontend** — starts after UIUX delivers `docs/uiux-bio-generator.md` AND Backend delivers `features/backend-bio-generator.md`

---

## Reuse Notes (from Task-001)

| Task-001 Asset | Reuse in Task-002 |
|---|---|
| `lib/caption-generator/types.ts` — Platform/Tone enums | Copy PLATFORMS and TONES — do not import across features |
| `lib/caption-generator/platformGuidance.ts` | Create equivalent `lib/bio-generator/platformGuidance.ts` with bio-specific guidance |
| `lib/caption-generator/toneGuidance.ts` | Create equivalent with bio-specific tone guidance |
| `lib/caption-generator/blocklist.ts` | Shared — import directly, no duplication needed |
| `middleware/rateLimiter.ts` | Shared — import directly |
| `components/caption-generator/CaptionForm.tsx` | Do NOT import — build `BioForm.tsx` with bio-specific fields |
| `components/caption-generator/CaptionCard.tsx` | Do NOT import — build `BioCard.tsx` (no hashtags field, add char count display) |
| `components/caption-generator/AdSlot.tsx` | Import directly — no changes needed |
| CSS design tokens in `globals.css` | Shared — all new CSS modules reference the same CSS variables |

---

## Execution Rules

- Each agent must read this task file before starting their work
- Each agent must read all upstream deliverables before starting
- All outputs must be saved to the file paths listed in Deliverables — no exceptions
- No agent may skip ahead of their dependency gate
- Acceptance criteria are the definition of done
- Do not duplicate shared infrastructure (blocklist, rate limiter, ad slot, CSS tokens)
- Bio output has no hashtags array — the schema is simpler than task-001; do not add fields that are not needed
