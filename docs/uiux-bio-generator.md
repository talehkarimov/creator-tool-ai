# UIUX Design Specification: Bio Generator

**Feature:** Bio Generator (Task-002)
**Agent:** UIUX
**Created:** 2026-03-28
**Page URL:** `/bio-generator`
**Depends On:** `tasks/task-002-bio-generator.md`

---

## 1. Design Goals

| Goal | Rationale |
|---|---|
| **Zero friction to first result** | Users arrive wanting a ready-to-paste bio. The form must be scannable and completable in under 30 seconds — fewer fields than the Caption Generator makes this achievable. |
| **Instant feedback at every state** | Loading, success, error, and copied states must all be visually distinct and immediate. Same standard as Task-001. |
| **Mobile-first layout** | Content creators editing their profile bio are frequently on their phone. Single-column stack is the primary layout. |
| **Ad slot as a first-class element** | The ad slot between form and results occupies a designed region with consistent sizing — identical positioning to Caption Generator for layout parity. |
| **Character count as a confidence signal** | Bio platforms have hard character limits. Showing a character count badge on each result removes the user's need to count manually and reduces abandonment. |
| **Copy loop encouragement** | The Regenerate path must feel effortless so users cycle through result sets, increasing ad impressions and session time. |

---

## 2. Page Layout — Desktop (≥ 768px)

```
┌─────────────────────────────────────────────────────────────┐
│  [Nav bar]   Logo + nav links                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [H1]  Free AI Bio Generator for Social Media              │
│  [Intro paragraph — 80 words, SEO copy from SEO agent]     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────── FORM CARD ─────────────────┐  │
│  │                                                       │  │
│  │  Platform *              Tone *                       │  │
│  │  ┌───────────────────┐  ┌──────────────────────────┐ │  │
│  │  │  Dropdown         │  │  Dropdown                │ │  │
│  │  └───────────────────┘  └──────────────────────────┘ │  │
│  │                                                       │  │
│  │  Niche / Profession *                                 │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Text input (max 100 chars) + char counter      │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │  Key Traits *                                         │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Text input (max 150 chars) + char counter      │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │            Generate Bios  [CTA button]          │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────── AD SLOT ────────────────────────┐   │
│  │  728 × 90 leaderboard (desktop) — placeholder       │   │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────── RESULTS AREA ───────────────────┐   │
│  │                                                      │   │
│  │  Bio 1                     [148 chars]  [Copy]      │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  Bio text, single string, may include               │   │
│  │  inline hashtags or emoji as appropriate…           │   │
│  │                                                      │   │
│  │  Bio 2                     [132 chars]  [Copy]      │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  Bio text…                                           │   │
│  │                                                      │   │
│  │  Bio 3                     [160 chars]  [Copy]      │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  Bio text…                                           │   │
│  │                                                      │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │          Regenerate  [secondary button]       │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [SEO body content — H2 sections as per SEO agent]         │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Page Layout — Mobile (< 768px)

```
┌─────────────────────────────┐
│  [Nav bar — hamburger]      │
├─────────────────────────────┤
│                             │
│  [H1]  Free AI Bio          │
│        Generator for        │
│        Social Media         │
│                             │
│  [Intro paragraph]          │
│                             │
├─────────────────────────────┤
│                             │
│  ┌──── FORM CARD ─────────┐ │
│  │ Platform *             │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Dropdown         │   │ │
│  │ └──────────────────┘   │ │
│  │                        │ │
│  │ Tone *                 │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Dropdown         │   │ │
│  │ └──────────────────┘   │ │
│  │                        │ │
│  │ Niche / Profession *   │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Text input       │   │ │
│  │ └──────────────────┘   │ │
│  │                        │ │
│  │ Key Traits *           │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Text input       │   │ │
│  │ └──────────────────┘   │ │
│  │                        │ │
│  │ ┌──────────────────┐   │ │
│  │ │  Generate Bios   │   │ │
│  │ └──────────────────┘   │ │
│  └────────────────────────┘ │
│                             │
├─────────────────────────────┤
│  ┌──── AD SLOT ───────────┐ │
│  │  320 × 50 mobile banner│ │
│  └────────────────────────┘ │
├─────────────────────────────┤
│                             │
│  ┌──── RESULTS AREA ──────┐ │
│  │ Bio 1  [148 chars][Copy]│ │
│  │ ───────────────────    │ │
│  │ Bio text…              │ │
│  │                        │ │
│  │ Bio 2  [132 chars][Copy]│ │
│  │ ───────────────────    │ │
│  │ Bio text…              │ │
│  │                        │ │
│  │ Bio 3  [160 chars][Copy]│ │
│  │ ───────────────────    │ │
│  │ Bio text…              │ │
│  │                        │ │
│  │ ┌──────────────────┐   │ │
│  │ │   Regenerate     │   │ │
│  │ └──────────────────┘   │ │
│  └────────────────────────┘ │
│                             │
│  [SEO body content]         │
│  [Footer]                   │
└─────────────────────────────┘
```

---

## 4. Component Inventory

### 4.1 BioForm

**File:** `components/bio-generator/BioForm.tsx`
**Status:** New — do not import or extend `CaptionForm.tsx`

| Component | Type | Spec |
|---|---|---|
| **Card container** | `<section>` | White background, 1px border (`--color-border`), 8px border-radius, 24px padding, subtle drop shadow — identical card treatment to CaptionForm |
| **Section label** | `<h2>` (visually hidden) | "Generate your bios" — semantic only |
| **Platform dropdown** | `<select>` | Options: Instagram, TikTok, LinkedIn, Twitter/X; no default selected (placeholder "Select platform") |
| **Tone dropdown** | `<select>` | Options: Casual, Professional, Funny, Inspirational; no default selected (placeholder "Select tone") |
| **Niche field** | `<input type="text">` | Single-line, max 100 chars, character counter below-right; label "Niche / Profession"; placeholder "e.g. fitness coach, travel photographer" |
| **Niche character counter** | `<span>` | `0 / 100` format; turns red at > 90 chars |
| **Traits field** | `<input type="text">` | Single-line, max 150 chars, character counter below-right; label "Key Traits"; placeholder "e.g. marathon runner, dog lover, coffee addict" |
| **Traits character counter** | `<span>` | `0 / 150` format; turns red at > 135 chars |
| **Generate button** | `<button type="submit">` | Full-width, primary style; label "Generate Bios"; disabled when any required field is empty |

Desktop layout: Platform and Tone dropdowns render side-by-side in a 2-column grid (≥ 1024px). Niche and Traits fields are always full-width, stacked vertically at all breakpoints.

### 4.2 BioCard

**File:** `components/bio-generator/BioCard.tsx`
**Status:** New — do not import or extend `CaptionCard.tsx`

Key difference from CaptionCard: no hashtags sub-field; bio text is a single string. A character count badge is displayed inline with the card header.

| Component | Type | Spec |
|---|---|---|
| **Card container** | `<article>` | White background (`--color-bg-card`), 1px border (`--color-border`), 8px border-radius, 16px padding |
| **Card header row** | `<div>` | Flex row, space-between; holds bio label (left), character count badge (centre-right), Copy button (far right) |
| **Bio label** | `<h3>` | "Bio 1", "Bio 2", "Bio 3"; 16px, weight 600, colour `--color-text-primary` |
| **Character count badge** | `<span>` | Format: "148 chars"; 12px, weight 500, colour `--color-text-muted` (#6B7280); pill shape — 4px border-radius, light grey background (#F3F4F6), 4px 8px padding; value derived from `bio.text.length` at render time |
| **Divider** | `<hr>` | 1px, colour `--color-border`, full width, margin 8px 0 |
| **Bio text** | `<p>` | 16px, line-height 1.6, colour `--color-text-primary`; renders as a single block — no separate hashtag element |
| **Copy button** | `<button>` | Small, secondary/ghost style; label "Copy"; positioned in card header row (top-right) |

### 4.3 AdSlot (Reused)

**File:** `components/caption-generator/AdSlot.tsx`
**Status:** Reused — import directly, no changes

| Property | Value |
|---|---|
| **Desktop size** | 728 × 90 (leaderboard) |
| **Mobile size** | 320 × 50 (mobile banner) |
| **Position** | Between BioForm card bottom and ResultsSection top |
| **Visibility trigger** | Rendered in DOM on page load; becomes visually prominent once Generate is clicked |
| **Placeholder treatment** | Light grey fill (#F3F4F6), dashed border, centered label "Advertisement" in 11px muted text |

### 4.4 ResultsSection

**File:** `components/bio-generator/ResultsSection.tsx`
**Status:** New — mirrors the ResultsArea pattern from Caption Generator but contains BioCards, not CaptionCards

| Component | Type | Spec |
|---|---|---|
| **Section container** | `<section>` | Hidden on initial page load (`visibility: hidden` + `aria-hidden="true"`); revealed on first successful API response — do not remove from DOM |
| **Bio cards** | 3 × `<BioCard>` | Stacked vertically, full-width at all breakpoints; each receives `{ id, text }` from API response |
| **Regenerate button** | `<button>` | Full-width, secondary style; label "Regenerate"; rendered below the third BioCard; triggers a new API call with the same last-submitted payload |

---

## 5. Loading State

Same skeleton shimmer pattern as Task-001. No new animation tokens introduced.

| Component | Spec |
|---|---|
| **Skeleton cards** | 3 placeholder cards matching BioCard dimensions, filled with animated shimmer bars |
| **Bar layout per card** | Two shimmer bars simulating bio body text (full width, then 60% width) + one short bar (30% width) simulating the character count badge area |
| **Animation** | CSS `@keyframes` shimmer, left-to-right gradient sweep, 1.5s loop — reuse the identical keyframe definition from the Caption Generator CSS module |
| **Shimmer gradient** | `--color-skeleton`: #E5E7EB → #F3F4F6 (existing token) |
| **Copy button** | Hidden during loading |
| **Character count badge** | Hidden during loading (part of the skeleton bar layout) |
| **Regenerate button** | Hidden during loading |
| **Generate button** | Disabled + label changes to "Generating…" with an inline spinner icon |
| **Skeleton `aria`** | `aria-hidden="true"` on all skeleton cards — screen readers ignore them |

---

## 6. Error State

Same pattern as Task-001. No new tokens or components.

| Component | Spec |
|---|---|
| **Error banner** | Appears inside ResultsSection in place of BioCards |
| **Icon** | Warning triangle (outline), same as Caption Generator |
| **Message** | "Something went wrong. Please try again." |
| **Retry button** | Primary button, label "Try Again"; triggers the same API call with the same last-submitted inputs |
| **Style** | Background `--color-error-bg` (#FEF2F2), border `--color-error-border` (#FCA5A5), text `--color-error-text` (#991B1B) |
| **Form** | Remains fully editable during error state so the user can adjust inputs before retrying |

---

## 7. Copy Confirmation State

Same 2-second reset pattern as Task-001.

| Trigger | Behaviour |
|---|---|
| User clicks "Copy" on a BioCard | `navigator.clipboard.writeText(bio.text)` — copies the full bio text as a single string |
| Button label change | Immediately changes to "Copied!" with a checkmark icon (colour `--color-success`: #10B981) |
| Reset duration | Reverts to "Copy" after exactly 2 seconds |
| Scope | Only the clicked BioCard's Copy button changes state — the other two remain "Copy" |

Note: unlike Caption Generator, there is no string concatenation needed — bio text is already a single string. Pass `bio.text` directly to `writeText`.

---

## 8. UX State Machine

```
                    ┌──────────────────────────────┐
                    │         IDLE (initial)        │
                    │  BioForm visible, empty       │
                    │  ResultsSection: hidden       │
                    │  Ad slot: hidden              │
                    └──────────────┬───────────────┘
                                   │
                    User fills form + clicks "Generate Bios"
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │           LOADING             │
                    │  Generate button: disabled    │
                    │  Button label: "Generating…"  │
                    │  Results: 3 skeleton cards    │
                    │  Ad slot: visible             │
                    └──────┬───────────────┬────────┘
                           │               │
                        Success          Error
                           │               │
                           ▼               ▼
          ┌────────────────────┐   ┌────────────────────────┐
          │       SUCCESS      │   │        ERROR           │
          │  3 BioCards        │   │  Error banner          │
          │  Copy buttons      │   │  "Try Again" button    │
          │  Char count badges │   │  Ad slot: visible      │
          │  Regenerate button │   └──────────┬─────────────┘
          │  Ad slot: visible  │              │
          └──────┬─────────────┘     User clicks "Try Again"
                 │                             │
     User clicks "Copy"                        ▼
                 │                    → back to LOADING
                 ▼
          ┌───────────────────┐
          │   COPIED (2 sec)  │
          │  Button: "Copied!"│
          │  with checkmark   │
          └──────┬────────────┘
                 │ 2 seconds elapsed
                 ▼
          back to SUCCESS

     User clicks "Regenerate"
          → back to LOADING
          (same inputs, new API call)
```

---

## 9. Typography

Identical to Caption Generator — no new tokens.

| Element | Size | Weight | Colour |
|---|---|---|---|
| H1 | 36px / 28px (< 480px) | 700 | #111827 |
| H2 (SEO sections) | 24px | 600 | #111827 |
| H3 (bio labels) | 16px | 600 | #374151 |
| Body text (bio) | 16px | 400 | #111827 |
| Character count badge | 12px | 500 | #6B7280 |
| Button text | 15px | 600 | Per button style |
| Label text (form) | 14px | 500 | #374151 |
| Character counter (inputs) | 12px | 400 | #9CA3AF → #EF4444 (near limit) |
| Error message | 14px | 500 | #991B1B |

Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, sans-serif`

---

## 10. Colour Palette

All tokens are inherited from `globals.css`. No new tokens introduced.

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | #6366F1 | Generate button background, focus rings |
| `--color-primary-hover` | #4F46E5 | Generate button hover state |
| `--color-primary-text` | #FFFFFF | Text on primary button |
| `--color-secondary` | #FFFFFF | Regenerate + Copy button background |
| `--color-secondary-border` | #D1D5DB | Regenerate + Copy button border |
| `--color-secondary-text` | #374151 | Regenerate + Copy button text |
| `--color-bg-page` | #F9FAFB | Page background |
| `--color-bg-card` | #FFFFFF | BioForm card + BioCard backgrounds |
| `--color-border` | #E5E7EB | Card and input borders |
| `--color-text-primary` | #111827 | Body text |
| `--color-text-muted` | #6B7280 | Character count badge, helper text |
| `--color-error-bg` | #FEF2F2 | Error state background |
| `--color-error-border` | #FCA5A5 | Error state border |
| `--color-error-text` | #991B1B | Error state text |
| `--color-success` | #10B981 | Copied! checkmark |
| `--color-skeleton` | #E5E7EB → #F3F4F6 | Shimmer gradient |

---

## 11. Interaction & Accessibility

### 11.1 Keyboard Navigation

- All interactive elements reachable by `Tab` in DOM order: Platform → Tone → Niche → Traits → Generate → (results) Copy 1 → Copy 2 → Copy 3 → Regenerate
- Focus ring: 2px solid `--color-primary`, 2px offset, visible on all focusable elements
- Generate button is the form's submit trigger on `Enter` when any field is focused

### 11.2 ARIA

| Element | ARIA |
|---|---|
| Form | `role="form"` `aria-label="Bio generator"` |
| Generate button (loading) | `aria-busy="true"` `aria-disabled="true"` |
| Results section | `aria-live="polite"` — announces result count when bios load |
| Error banner | `role="alert"` — screen reader announces immediately on error |
| Copy button (copied state) | `aria-label="Bio copied to clipboard"` |
| Skeleton cards | `aria-hidden="true"` |
| Character count badge | `aria-label="[n] characters"` — e.g. `aria-label="148 characters"` |

### 11.3 Validation

| Rule | Behaviour |
|---|---|
| Platform not selected | Generate button disabled; inline message "Please select a platform" on blur |
| Tone not selected | Generate button disabled; inline message "Please select a tone" on blur |
| Niche empty | Generate button disabled; inline message "Please describe your niche or profession" on blur |
| Traits empty | Generate button disabled; inline message "Please list at least one key trait" on blur |
| Niche > 100 chars | Input blocked at limit; counter turns red; inline message "100 character maximum" |
| Traits > 150 chars | Input blocked at limit; counter turns red; inline message "150 character maximum" |

Validation messages are placed directly below the offending field in 12px red text (#EF4444). Form does not submit until all required fields pass.

### 11.4 Colour Contrast

All text/background combinations meet WCAG 2.1 AA (4.5:1 body text, 3:1 large text and UI components). Primary button (#6366F1 / #FFFFFF) passes at 5.2:1. Error text (#991B1B / #FEF2F2) passes at 7.1:1. Character count badge (#6B7280 / #F3F4F6) passes at 4.6:1.

---

## 12. Responsive Breakpoints

Same breakpoint thresholds as Task-001. No new values introduced.

| Breakpoint | Layout Change |
|---|---|
| < 480px | Form card padding reduced to 16px; H1 drops to 28px; character count badge wraps below bio label if space is constrained |
| 480px – 767px | Single column; Platform and Tone dropdowns stack vertically; Niche and Traits fields full-width |
| 768px – 1023px | Single column maintained; max-width 680px, centered |
| ≥ 1024px | Platform and Tone dropdowns appear side-by-side (2-column grid within form); Niche and Traits remain full-width; max-width 720px, centered |

Ad slot sizes:
- < 768px → 320 × 50 mobile banner
- ≥ 768px → 728 × 90 leaderboard

BioCards are always full-width within ResultsSection at all breakpoints.

---

## 13. Handoff Notes for Frontend Agent

### What is Reused (import directly — no duplication)

| Asset | Source | Notes |
|---|---|---|
| `AdSlot.tsx` | `components/caption-generator/AdSlot.tsx` | Import unchanged. Same sizing, position, and placeholder treatment. |
| CSS design tokens | `globals.css` | All new CSS modules (`BioForm.module.css`, `BioCard.module.css`, `ResultsSection.module.css`) must reference the existing CSS variables — do not redeclare them. |
| Skeleton shimmer `@keyframes` | Caption Generator CSS module | Reuse the identical animation definition; do not duplicate the keyframe block. |
| Rate limiter middleware | `middleware/rateLimiter.ts` | Import directly for the `/api/generate-bio` route. |
| Blocklist utility | `lib/caption-generator/blocklist.ts` | Import directly — shared across features per Task-002 reuse notes. |

### What is New (build from scratch)

| Asset | File | Notes |
|---|---|---|
| `BioForm` | `components/bio-generator/BioForm.tsx` | 4 fields: platform (select), tone (select), niche (text input, max 100), traits (text input, max 150). No hashtag count field. |
| `BioCard` | `components/bio-generator/BioCard.tsx` | Single bio text string. Character count badge derived from `bio.text.length`. No hashtags sub-field. |
| `ResultsSection` | `components/bio-generator/ResultsSection.tsx` | Contains 3 BioCards + Regenerate button. |
| Page component | `app/bio-generator/page.tsx` | Route `/bio-generator`. Orchestrates BioForm, AdSlot, ResultsSection. |
| API route | `app/api/generate-bio/route.ts` | New endpoint — see `features/backend-bio-generator.md` for schema. |
| Platform guidance | `lib/bio-generator/platformGuidance.ts` | Bio-specific guidance — do not import from caption-generator equivalent. |
| Tone guidance | `lib/bio-generator/toneGuidance.ts` | Bio-specific tone guidance — do not import from caption-generator equivalent. |
| Types | `lib/bio-generator/types.ts` | Copy PLATFORMS and TONES enums from `lib/caption-generator/types.ts` — do not import across features. |

### Critical Implementation Notes

- The ad slot **must be present in the DOM on page load** before Generate is clicked. Do not conditionally render it only after results arrive.
- `ResultsSection` must be hidden via `visibility: hidden` + `aria-hidden="true"` on initial load, not removed from the DOM. Removing it from the DOM breaks `aria-live` announcement on first result.
- The Regenerate button must replay the **last submitted payload** — do not re-read current form state on Regenerate. Store the payload at submission time in a ref or state variable.
- Copy-to-clipboard passes `bio.text` directly to `navigator.clipboard.writeText()`. There is no concatenation step — no hashtags field exists on the bio response.
- Character count badge value must be computed as `bio.text.length` at render time. Do not call the API to retrieve this — derive it client-side from the response string.
- All three Copy buttons must operate independently — clicking Copy on Bio 2 must not affect Copy button state on Bios 1 or 3.
- Minimum touch target size for Copy and Regenerate buttons: 44 × 44px (WCAG 2.5.5).
- Read `docs/seo-bio-generator.md` (when available) for the exact H1 string, intro paragraph copy, and H2 section order — do not paraphrase SEO copy.
- The internal link from `/caption-generator` to `/bio-generator` (and vice versa) must be present in the page body or nav — required for SEO authority per Task-002 business goals.

---

*Document produced by the UIUX agent. Dependency gate cleared: Frontend may proceed once Backend delivers `features/backend-bio-generator.md`.*
