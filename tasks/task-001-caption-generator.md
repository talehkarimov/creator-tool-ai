# Task-001: Caption Generator

**Agent:** Product
**Status:** Ready
**Created:** 2026-03-28
**Feature:** Caption Generator (MVP)

---

## Objective

Build an AI-powered caption generator that takes a topic, tone, and platform as input and outputs ready-to-use social media captions — helping content creators save time and drive traffic.

---

## Business Goal

- Deliver core value to content creators on day one of the MVP
- Generate ad impressions by keeping users on the tool (copy → edit → retry loop)
- Establish SEO footprint with a high-intent landing page targeting "caption generator" queries
- Create the foundation (API, prompt layer, UI shell) that all future tools will reuse

---

## In-Scope

- Single-page caption generator UI
- Input fields: topic, platform (Instagram / TikTok / LinkedIn / Twitter/X), tone (Casual / Professional / Funny / Inspirational), optional hashtag count
- Claude API call via backend endpoint
- Return 3 caption variants per request
- Copy-to-clipboard per caption
- Regenerate button
- Ad slot placeholder (above results)
- SEO-optimized landing page (title, meta, H1, intro paragraph)

---

## Out-of-Scope

- User accounts / auth
- Saved captions / history
- Image or video upload
- Scheduling or posting to social platforms
- Multi-language support
- Bulk generation

---

## Input / Output

### Input
| Field | Type | Required | Values |
|---|---|---|---|
| `topic` | string | yes | free text, max 200 chars |
| `platform` | enum | yes | instagram, tiktok, linkedin, twitter |
| `tone` | enum | yes | casual, professional, funny, inspirational |
| `hashtag_count` | number | no | 0–10, default 5 |

### Output
```json
{
  "captions": [
    { "id": 1, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 2, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 3, "text": "...", "hashtags": ["#...", "#..."] }
  ]
}
```

---

## User Flow

```
1. User lands on /caption-generator
       ↓
2. User fills: topic + platform + tone (+ optional hashtag count)
       ↓
3. User clicks "Generate Captions"
       ↓
4. Loading state shown (skeleton or spinner)
       ↓
5. 3 caption variants appear below the form
   [Ad slot rendered above results]
       ↓
6. User clicks "Copy" on preferred caption
       ↓
7. User can click "Regenerate" to get 3 new variants
   (same inputs, new AI call)
```

---

## Acceptance Criteria

- [ ] Form validates all required fields before submission
- [ ] API returns exactly 3 caption variants
- [ ] Each caption includes body text + hashtags as separate fields
- [ ] Copy button copies full caption (text + hashtags) to clipboard
- [ ] Regenerate triggers a new API call with the same inputs
- [ ] Loading state is visible during API call
- [ ] Error state shown if API fails (with retry option)
- [ ] Page has correct SEO title, meta description, and H1
- [ ] Ad slot placeholder renders above the results section
- [ ] Mobile responsive (single-column layout on < 768px)
- [ ] Response time < 5 seconds under normal conditions

---

## Involved Agents

| Agent | Role | Depends On |
|---|---|---|
| **Product** | Task definition, user flow, acceptance criteria | — |
| **SEO** | Keyword strategy, page copy, meta tags | Product |
| **UIUX** | Wireframe, component layout, UX states | Product |
| **Prompt** | Claude prompt template, input/output format | Product |
| **Backend** | `/api/generate-caption` endpoint, Claude API integration | Prompt |
| **Frontend** | Form UI, results display, copy/regenerate, ad slot | UIUX, Backend |

---

## Deliverables

| Agent | Output File |
|---|---|
| Product | `tasks/task-001-caption-generator.md` ✅ |
| SEO | `docs/seo-caption-generator.md` |
| UIUX | `docs/uiux-caption-generator.md` |
| Prompt | `docs/prompt-caption-generator.md` |
| Backend | `features/backend-caption-generator.md` |
| Frontend | `features/frontend-caption-generator.md` |

---

## Dependency Map

```
[Product] task-001
    │
    ├──────────────────────────────┐──────────────────────────┐
    ▼                              ▼                          ▼
[SEO]                           [UIUX]                   [Prompt]
seo-caption-generator.md    uiux-caption-generator.md   prompt-caption-generator.md
                                   │                          │
                                   │                          ▼
                                   │                      [Backend]
                                   │                  backend-caption-generator.md
                                   │                          │
                                   └──────────────────────────┘
                                                  ▼
                                             [Frontend]
                                      frontend-caption-generator.md
```

**Execution order:**
1. **Product** → task-001 (this file)
2. **Parallel:** SEO + UIUX + Prompt (no inter-dependencies)
3. **Backend** — starts after Prompt delivers `prompt-caption-generator.md`
4. **Frontend** — starts after UIUX delivers `uiux-caption-generator.md` AND Backend delivers `backend-caption-generator.md`

---

## Execution Rules

- Each agent **must read this task file** before starting their work
- Each agent **must read all completed upstream deliverables** before starting (e.g., Backend reads Prompt output first)
- All outputs **must be saved to the file paths listed** in Deliverables — no exceptions
- No agent may skip ahead of their dependency gate
- If a dependency is incomplete, the blocked agent must **wait and flag** rather than guess
- Acceptance criteria are **the definition of done** — all items must be checked before marking the feature complete
- Changes to input/output schema must be re-approved by Product before implementation begins
- Ad slot must be treated as a first-class UI element, not an afterthought
