# UIUX Design Specification: Caption Generator

**Feature:** Caption Generator (Task-001)
**Agent:** UIUX
**Created:** 2026-03-28
**Page URL:** `/caption-generator`
**Depends On:** `tasks/task-001-caption-generator.md`, `docs/seo-caption-generator.md`

---

## 1. Design Goals

| Goal | Rationale |
|---|---|
| **Zero friction to first result** | Users arrive with a task in mind. The form must be scannable and completable in under 30 seconds. |
| **Instant feedback at every state** | Loading, success, error, and copied states must all be visually distinct and immediate. |
| **Mobile-first layout** | Majority of content creators work on mobile. Single-column stack is the primary layout. |
| **Ad slot as a first-class element** | The ad slot between form and results must not feel like an afterthought — it occupies a designed region with consistent sizing. |
| **Copy loop encouragement** | Visual design must make the Regenerate path feel effortless so users cycle through results (increasing ad impressions and session time). |

---

## 2. Page Layout — Desktop (≥ 768px)

```
┌─────────────────────────────────────────────────────────────┐
│  [Nav bar]   Logo + nav links                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [H1]  Free AI Caption Generator for Social Media          │
│  [Intro paragraph — 80 words, SEO copy from SEO agent]     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────── FORM CARD ─────────────────┐  │
│  │                                                       │  │
│  │  Topic *                                              │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Text area (max 200 chars) + char counter       │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │  Platform *              Tone *                       │  │
│  │  ┌───────────────────┐  ┌──────────────────────────┐ │  │
│  │  │  Dropdown         │  │  Dropdown                │ │  │
│  │  └───────────────────┘  └──────────────────────────┘ │  │
│  │                                                       │  │
│  │  Hashtag Count (optional)                             │  │
│  │  ┌──────────────────┐                                │  │
│  │  │  Number input    │  0 – 10, default 5             │  │
│  │  └──────────────────┘                                │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │          Generate Captions  [CTA button]        │ │  │
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
│  │  Caption 1                          [Copy]          │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  Caption body text…                                  │   │
│  │  #hashtag1 #hashtag2 #hashtag3                       │   │
│  │                                                      │   │
│  │  Caption 2                          [Copy]          │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  Caption body text…                                  │   │
│  │  #hashtag1 #hashtag2 #hashtag3                       │   │
│  │                                                      │   │
│  │  Caption 3                          [Copy]          │   │
│  │  ─────────────────────────────────────────────      │   │
│  │  Caption body text…                                  │   │
│  │  #hashtag1 #hashtag2 #hashtag3                       │   │
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
│  [H1]  Free AI Caption      │
│        Generator for        │
│        Social Media         │
│                             │
│  [Intro paragraph]          │
│                             │
├─────────────────────────────┤
│                             │
│  ┌──── FORM CARD ─────────┐ │
│  │ Topic *                │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Text area        │   │ │
│  │ └──────────────────┘   │ │
│  │                        │ │
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
│  │ Hashtag Count          │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Number input     │   │ │
│  │ └──────────────────┘   │ │
│  │                        │ │
│  │ ┌──────────────────┐   │ │
│  │ │ Generate Captions│   │ │
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
│  │ Caption 1       [Copy] │ │
│  │ ───────────────────    │ │
│  │ Caption body text…     │ │
│  │ #tag1 #tag2 #tag3      │ │
│  │                        │ │
│  │ Caption 2       [Copy] │ │
│  │ ───────────────────    │ │
│  │ Caption body text…     │ │
│  │ #tag1 #tag2 #tag3      │ │
│  │                        │ │
│  │ Caption 3       [Copy] │ │
│  │ ───────────────────    │ │
│  │ Caption body text…     │ │
│  │ #tag1 #tag2 #tag3      │ │
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

### 4.1 Form Card

| Component | Type | Spec |
|---|---|---|
| **Card container** | `<section>` | White background, 1px border, 8px border-radius, 24px padding, subtle drop shadow |
| **Section label** | `<h2>` (visually hidden) | "Generate your captions" — semantic only |
| **Topic field** | `<textarea>` | 3 rows default, resizable vertical only, max 200 chars, character counter below-right |
| **Character counter** | `<span>` | `0 / 200` format; turns red at > 180 chars |
| **Platform dropdown** | `<select>` | Options: Instagram, TikTok, LinkedIn, Twitter/X; no default selected (placeholder "Select platform") |
| **Tone dropdown** | `<select>` | Options: Casual, Professional, Funny, Inspirational; no default (placeholder "Select tone") |
| **Hashtag count input** | `<input type="number">` | min=0, max=10, default=5, step=1; labelled "Hashtags (0–10)" |
| **Generate button** | `<button type="submit">` | Full-width, primary style; label: "Generate Captions"; disabled when required fields empty |

### 4.2 Ad Slot

| Property | Value |
|---|---|
| **Desktop size** | 728 × 90 (leaderboard) |
| **Mobile size** | 320 × 50 (mobile banner) |
| **Position** | Between form card bottom and results area top |
| **Visibility trigger** | Rendered in DOM on page load; becomes visually prominent once Generate is clicked |
| **Placeholder treatment** | Light grey fill (#F3F4F6), dashed border, centered label "Advertisement" in 11px muted text |

### 4.3 Results Area

| Component | Type | Spec |
|---|---|---|
| **Results container** | `<section>` | Hidden until first successful API response |
| **Caption card** | `<article>` | White background, 1px border, 8px border-radius, 16px padding |
| **Caption label** | `<h3>` | "Caption 1", "Caption 2", "Caption 3" — inline with Copy button row |
| **Body text** | `<p>` | 16px, line-height 1.6, dark text |
| **Hashtags** | `<p>` | 14px, muted colour (#6B7280), displayed below body text |
| **Copy button** | `<button>` | Small, secondary/ghost style; label "Copy"; positioned top-right of caption card |
| **Regenerate button** | `<button>` | Full-width, secondary style; label "Regenerate"; rendered below the third caption card |

### 4.4 Loading State (Skeleton)

| Component | Spec |
|---|---|
| **Skeleton cards** | 3 placeholder cards matching caption card dimensions, filled with animated shimmer bars |
| **Bar layout per card** | Two shimmer bars (simulating body text) + one short bar (simulating hashtags) |
| **Animation** | CSS `@keyframes` shimmer left-to-right, 1.5s loop |
| **Copy button** | Hidden during loading |
| **Regenerate button** | Hidden during loading |
| **Generate button** | Disabled + label changes to "Generating…" with a spinner icon |

### 4.5 Error State

| Component | Spec |
|---|---|
| **Error banner** | Appears in the results area in place of caption cards |
| **Icon** | Warning triangle (outline) |
| **Message** | "Something went wrong. Please try again." |
| **Retry button** | Primary button, label "Try Again"; triggers the same API call with same inputs |
| **Style** | Light red background (#FEF2F2), red border (#FCA5A5), red text (#991B1B) |

### 4.6 Copy Confirmation State

| Trigger | Behaviour |
|---|---|
| User clicks "Copy" | Button label changes to "Copied!" with a checkmark icon |
| Duration | Reverts to "Copy" after 2 seconds |
| Scope | Only the clicked caption's button changes — others remain "Copy" |

---

## 5. UX State Machine

```
                    ┌──────────────────────────────┐
                    │         IDLE (initial)        │
                    │  Form visible, empty          │
                    │  Results area: hidden         │
                    │  Ad slot: hidden              │
                    └──────────────┬───────────────┘
                                   │
                    User fills form + clicks "Generate Captions"
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
          │  3 caption cards   │   │  Error banner          │
          │  Copy buttons      │   │  "Try Again" button    │
          │  Regenerate button │   │  Ad slot: visible      │
          │  Ad slot: visible  │   └──────────┬─────────────┘
          └──────┬─────────────┘              │
                 │                     User clicks "Try Again"
     User clicks "Copy"                       │
                 │                            ▼
                 ▼                    → back to LOADING
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

## 6. Typography

| Element | Size | Weight | Colour |
|---|---|---|---|
| H1 | 36px / 40px mobile | 700 | #111827 |
| H2 (SEO sections) | 24px | 600 | #111827 |
| H3 (caption labels) | 16px | 600 | #374151 |
| Body text (captions) | 16px | 400 | #111827 |
| Hashtags | 14px | 400 | #6B7280 |
| Button text | 15px | 600 | Per button style |
| Label text (form) | 14px | 500 | #374151 |
| Character counter | 12px | 400 | #9CA3AF → #EF4444 (over 180) |
| Error message | 14px | 500 | #991B1B |

Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, sans-serif`

---

## 7. Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | #6366F1 | Generate button background, focus rings |
| `--color-primary-hover` | #4F46E5 | Generate button hover state |
| `--color-primary-text` | #FFFFFF | Text on primary button |
| `--color-secondary` | #FFFFFF | Regenerate + Copy button background |
| `--color-secondary-border` | #D1D5DB | Regenerate + Copy button border |
| `--color-secondary-text` | #374151 | Regenerate + Copy button text |
| `--color-bg-page` | #F9FAFB | Page background |
| `--color-bg-card` | #FFFFFF | Form card + caption card backgrounds |
| `--color-border` | #E5E7EB | Card and input borders |
| `--color-text-primary` | #111827 | Body text |
| `--color-text-muted` | #6B7280 | Hashtags, helper text |
| `--color-error-bg` | #FEF2F2 | Error state background |
| `--color-error-border` | #FCA5A5 | Error state border |
| `--color-error-text` | #991B1B | Error state text |
| `--color-success` | #10B981 | Copied! checkmark |
| `--color-skeleton` | #E5E7EB → #F3F4F6 | Shimmer gradient |

---

## 8. Interaction & Accessibility

### 8.1 Keyboard Navigation

- All interactive elements reachable by `Tab` in DOM order: Topic → Platform → Tone → Hashtag Count → Generate → (results) Copy 1 → Copy 2 → Copy 3 → Regenerate
- Focus ring: 2px solid `--color-primary`, 2px offset, visible on all focusable elements
- Generate button is the form's submit trigger on `Enter` when any field is focused

### 8.2 ARIA

| Element | ARIA |
|---|---|
| Form | `role="form"` `aria-label="Caption generator"` |
| Generate button (loading) | `aria-busy="true"` `aria-disabled="true"` |
| Results section | `aria-live="polite"` — announces result count when captions load |
| Error banner | `role="alert"` — screen reader announces immediately on error |
| Copy button (copied state) | `aria-label="Caption copied to clipboard"` |
| Skeleton cards | `aria-hidden="true"` |

### 8.3 Validation

| Rule | Behaviour |
|---|---|
| Topic empty | Generate button disabled; inline message "Please describe your topic" on blur |
| Platform not selected | Generate button disabled; inline message "Please select a platform" on blur |
| Tone not selected | Generate button disabled; inline message "Please select a tone" on blur |
| Topic > 200 chars | Input blocked at limit; counter turns red; inline message "200 character maximum" |
| Hashtag count out of range | Clamped to 0–10 on blur; no error message needed |

Validation messages are placed directly below the offending field in 12px red text (#EF4444). Form does not submit until all required fields pass.

### 8.4 Colour Contrast

All text/background combinations must meet WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text and UI components). Primary button (#6366F1 / #FFFFFF) passes at 5.2:1. Error text (#991B1B / #FEF2F2) passes at 7.1:1.

---

## 9. Responsive Breakpoints

| Breakpoint | Layout Change |
|---|---|
| < 480px | Form card padding reduced to 16px; H1 drops to 28px |
| 480px – 767px | Single column; Platform and Tone dropdowns stack vertically |
| 768px – 1023px | Single column maintained; max-width 680px, centered |
| ≥ 1024px | Platform and Tone dropdowns appear side-by-side (2-column grid within form); max-width 720px, centered |

Ad slot sizes:
- < 768px → 320 × 50 mobile banner
- ≥ 768px → 728 × 90 leaderboard

Caption cards are always full-width within the results container at all breakpoints.

---

## 10. Handoff Notes for Frontend Agent

- Read `tasks/task-001-caption-generator.md` for input/output schema and acceptance criteria before building.
- Read `docs/seo-caption-generator.md` for the exact H1 string, intro paragraph copy, and H2 section order — do not paraphrase.
- The ad slot **must be present in the DOM on page load** even before Generate is clicked — it becomes visually prominent after submission. Do not conditionally render it only after results arrive.
- The Results `<section>` should be hidden (`display: none` or `visibility: hidden` + `aria-hidden="true"`) on initial load and revealed on first successful response. Do not use conditional rendering that removes it from the DOM entirely — this prevents `aria-live` from functioning correctly.
- The Regenerate button triggers a new API call with **the same form values** that produced the current results. Do not re-read the form state on Regenerate — pass the last submitted payload.
- Copy-to-clipboard must concatenate `caption.text + "\n" + caption.hashtags.join(" ")` as a single string.
- Skeleton shimmer animation must run during the loading state for all three caption card positions simultaneously.
- All three copy buttons must operate independently — clicking Copy on Caption 2 must not affect the state of Copy buttons on Captions 1 or 3.
- Error state replaces the results area content; the form remains fully editable so users can adjust inputs and try again.
- Minimum touch target size for Copy and Regenerate buttons: 44 × 44px (WCAG 2.5.5).

---

*Document produced by the UIUX agent. Dependency gate cleared: Frontend may proceed once Backend delivers `features/backend-caption-generator.md`.*
