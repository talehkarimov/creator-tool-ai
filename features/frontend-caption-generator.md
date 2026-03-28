# Frontend Specification: Caption Generator

**Agent:** Frontend
**Status:** Complete
**Created:** 2026-03-28
**Feature:** Caption Generator (MVP)
**Page URL:** `/caption-generator`
**Depends On:**
- `tasks/task-001-caption-generator.md`
- `docs/uiux-caption-generator.md`
- `docs/seo-caption-generator.md`
- `features/backend-caption-generator.md`

---

## Section 1 — Page File Structure

All paths are relative to the Next.js project root (`creator-tool-ai/`). The project uses the App Router.

```
creator-tool-ai/
├── app/
│   └── caption-generator/
│       ├── page.tsx                         # Route entry point — CaptionGeneratorPage
│       └── layout.tsx                       # Optional segment layout (inherits root layout)
│
├── components/
│   └── caption-generator/
│       ├── CaptionForm.tsx                  # Form card: topic, platform, tone, hashtag count, submit
│       ├── CaptionCard.tsx                  # Single caption result: body text, hashtags, copy button
│       ├── ResultsSection.tsx               # Wrapper: ad slot + caption cards list + regenerate button
│       └── AdSlot.tsx                       # Advertisement placeholder (responsive sizing)
│
├── styles/
│   └── caption-generator/
│       ├── CaptionForm.module.css           # Scoped styles for CaptionForm
│       ├── CaptionCard.module.css           # Scoped styles for CaptionCard (incl. skeleton shimmer)
│       ├── ResultsSection.module.css        # Scoped styles for ResultsSection
│       ├── AdSlot.module.css                # Scoped styles for AdSlot (responsive sizing)
│       └── CaptionGeneratorPage.module.css  # Page-level layout, typography, breakpoints
│
├── lib/
│   └── caption-generator/
│       └── types.ts                         # Shared frontend TypeScript types (re-exports or mirrors backend types)
│
└── app/
    └── api/
        └── generate-caption/
            └── route.ts                     # Backend POST handler (see backend-caption-generator.md)
```

### Notes on Structure

- CSS Modules are used for all component styles to guarantee zero class-name collisions.
- `types.ts` under `lib/caption-generator/` defines the `Caption`, `CaptionResponse`, and `ApiError` interfaces consumed by the page and components.
- No global CSS modifications are made by this feature; all styles are scoped.
- The page file at `app/caption-generator/page.tsx` exports the `generateMetadata` function (Next.js Metadata API) and the default page component.

---

## Section 2 — Component Breakdown

### 2.1 `CaptionForm`

**File:** `components/caption-generator/CaptionForm.tsx`

#### Props Interface

```typescript
interface CaptionFormProps {
  /** Called when the user submits the form with valid values. */
  onSubmit: (payload: GenerateCaptionPayload) => void;
  /** When true, the form submit button is disabled and shows "Generating…" */
  isLoading: boolean;
}

interface GenerateCaptionPayload {
  topic: string;
  platform: 'instagram' | 'tiktok' | 'linkedin' | 'twitter';
  tone: 'casual' | 'professional' | 'funny' | 'inspirational';
  hashtag_count: number;
}
```

#### Internal State

```typescript
const [topic, setTopic]               = useState<string>('');
const [platform, setPlatform]         = useState<string>('');
const [tone, setTone]                 = useState<string>('');
const [hashtagCount, setHashtagCount] = useState<number>(5);

// Per-field validation error messages; empty string = no error
const [topicError, setTopicError]       = useState<string>('');
const [platformError, setPlatformError] = useState<string>('');
const [toneError, setToneError]         = useState<string>('');
```

#### Behavior

- The Generate button is disabled when any of: `topic.trim() === ''`, `platform === ''`, or `tone === ''`.
- `topic` is limited to 200 characters; the `<textarea>` does not accept further input at the limit (enforced via `maxLength` attribute and confirmed in `onChange`).
- Character counter displays `{topic.length} / 200`. The counter text color switches to `#EF4444` when `topic.length > 180`.
- Inline validation fires **on blur** for each required field:
  - Topic empty on blur → `topicError = "Please describe your topic"`
  - Platform unselected on blur → `platformError = "Please select a platform"`
  - Tone unselected on blur → `toneError = "Please select a tone"`
- Hashtag count is clamped to 0–10 on blur (no error message shown for out-of-range values — clamping is silent).
- On submit: re-validates all fields; if any fail, focuses the first invalid field and does not call `onSubmit`. If all pass, calls `onSubmit` with the current payload.
- While `isLoading` is true: the submit button is disabled, its label reads "Generating…", and a spinner SVG is rendered inline to the left of the text.

#### JSX Outline

```tsx
<section
  className={styles.formCard}
  aria-labelledby="form-heading"
>
  <h2 id="form-heading" className={styles.visuallyHidden}>
    Generate your captions
  </h2>

  <form
    role="form"
    aria-label="Caption generator"
    onSubmit={handleSubmit}
    noValidate
  >
    {/* Topic */}
    <div className={styles.fieldGroup}>
      <label htmlFor="topic" className={styles.label}>
        Topic <span aria-hidden="true">*</span>
      </label>
      <textarea
        id="topic"
        name="topic"
        rows={3}
        maxLength={200}
        value={topic}
        onChange={handleTopicChange}
        onBlur={handleTopicBlur}
        aria-required="true"
        aria-describedby="topic-counter topic-error"
        aria-invalid={topicError !== ''}
        className={styles.textarea}
      />
      <div className={styles.counterRow}>
        <span
          id="topic-error"
          role="alert"
          className={styles.fieldError}
          aria-live="polite"
        >
          {topicError}
        </span>
        <span
          id="topic-counter"
          className={topic.length > 180 ? styles.counterRed : styles.counter}
          aria-label={`${topic.length} of 200 characters used`}
        >
          {topic.length} / 200
        </span>
      </div>
    </div>

    {/* Platform + Tone — 2-col on ≥ 1024px, stacked below */}
    <div className={styles.dropdownRow}>
      <div className={styles.fieldGroup}>
        <label htmlFor="platform" className={styles.label}>
          Platform <span aria-hidden="true">*</span>
        </label>
        <select
          id="platform"
          name="platform"
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          onBlur={handlePlatformBlur}
          aria-required="true"
          aria-describedby="platform-error"
          aria-invalid={platformError !== ''}
          className={styles.select}
        >
          <option value="" disabled>Select platform</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter/X</option>
        </select>
        <span
          id="platform-error"
          role="alert"
          className={styles.fieldError}
          aria-live="polite"
        >
          {platformError}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="tone" className={styles.label}>
          Tone <span aria-hidden="true">*</span>
        </label>
        <select
          id="tone"
          name="tone"
          value={tone}
          onChange={e => setTone(e.target.value)}
          onBlur={handleToneBlur}
          aria-required="true"
          aria-describedby="tone-error"
          aria-invalid={toneError !== ''}
          className={styles.select}
        >
          <option value="" disabled>Select tone</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
          <option value="funny">Funny</option>
          <option value="inspirational">Inspirational</option>
        </select>
        <span
          id="tone-error"
          role="alert"
          className={styles.fieldError}
          aria-live="polite"
        >
          {toneError}
        </span>
      </div>
    </div>

    {/* Hashtag Count */}
    <div className={styles.fieldGroup}>
      <label htmlFor="hashtag-count" className={styles.label}>
        Hashtags (0–10)
      </label>
      <input
        id="hashtag-count"
        name="hashtag_count"
        type="number"
        min={0}
        max={10}
        step={1}
        value={hashtagCount}
        onChange={e => setHashtagCount(Number(e.target.value))}
        onBlur={handleHashtagCountBlur}
        className={styles.numberInput}
      />
    </div>

    {/* Submit */}
    <button
      type="submit"
      disabled={isLoading || !isFormValid()}
      aria-busy={isLoading}
      aria-disabled={isLoading || !isFormValid()}
      className={styles.generateButton}
    >
      {isLoading
        ? <><SpinnerIcon aria-hidden="true" /> Generating…</>
        : 'Generate Captions'
      }
    </button>
  </form>
</section>
```

---

### 2.2 `AdSlot`

**File:** `components/caption-generator/AdSlot.tsx`

#### Props Interface

```typescript
interface AdSlotProps {
  /** Controls visual prominence. false = muted/hidden-ish on initial load,
   *  true = fully visible after Generate is clicked. */
  isVisible: boolean;
}
```

#### Behavior

- The component is **always present in the DOM** from page load (never conditionally removed).
- When `isVisible` is false, the slot has `opacity: 0` and reduced height so it does not visually intrude before first submission. It does not use `display: none` or `visibility: hidden` because this would prevent Google Ad Manager from detecting the slot.
- When `isVisible` is true, `opacity` transitions to `1` over 200ms.
- Responsive sizing is controlled by CSS Modules media queries (see Section 10).

#### JSX Outline

```tsx
<div
  className={`${styles.adSlot} ${isVisible ? styles.adSlotVisible : styles.adSlotHidden}`}
  aria-label="Advertisement"
  role="complementary"
>
  <span className={styles.adLabel}>Advertisement</span>
  {/* Ad network script / tag injected here in production */}
</div>
```

---

### 2.3 `CaptionCard`

**File:** `components/caption-generator/CaptionCard.tsx`

#### Props Interface

```typescript
interface CaptionCardProps {
  /** 1-based index used for the heading label. */
  index: number;
  /** Caption body text (no hashtags). */
  text: string;
  /** Array of hashtag strings, each starting with '#'. */
  hashtags: string[];
  /** When true, renders the skeleton shimmer variant instead of real content. */
  isSkeleton: boolean;
}
```

#### Internal State

```typescript
const [copied, setCopied] = useState<boolean>(false);
```

#### Behavior

- When `isSkeleton` is true: renders three shimmer bars (`aria-hidden="true"` on the entire card), the Copy button is not rendered.
- When `isSkeleton` is false: renders caption body text, hashtags, and the Copy button.
- Copy button click handler:
  1. Concatenates `text + "\n" + hashtags.join(" ")` into a single string.
  2. Calls `navigator.clipboard.writeText(fullText)`.
  3. On success: sets `copied = true`, which changes the button label to "Copied!" and its `aria-label` to `"Caption copied to clipboard"`, and renders the checkmark icon.
  4. Sets a `setTimeout` of 2000ms; after 2 seconds `setCopied(false)` resets the button to its default "Copy" state.
  5. `copied` state is per-card; clicking Copy on Caption 2 does not affect Captions 1 or 3.
- Minimum touch target for the Copy button: 44 × 44px enforced via CSS `min-height` / `min-width` or `padding`.

#### JSX Outline

```tsx
<article
  className={`${styles.captionCard} ${isSkeleton ? styles.skeletonCard : ''}`}
  aria-hidden={isSkeleton}
>
  {isSkeleton ? (
    /* Skeleton variant */
    <>
      <div className={styles.skeletonLabel} />
      <div className={styles.skeletonBar} />
      <div className={styles.skeletonBar} />
      <div className={`${styles.skeletonBar} ${styles.skeletonBarShort}`} />
    </>
  ) : (
    /* Real content variant */
    <>
      <div className={styles.cardHeader}>
        <h3 className={styles.captionLabel}>Caption {index}</h3>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Caption copied to clipboard' : `Copy caption ${index}`}
          className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ''}`}
        >
          {copied
            ? <><CheckIcon aria-hidden="true" /> Copied!</>
            : 'Copy'
          }
        </button>
      </div>
      <hr className={styles.divider} />
      <p className={styles.captionText}>{text}</p>
      <p className={styles.captionHashtags}>{hashtags.join(' ')}</p>
    </>
  )}
</article>
```

---

### 2.4 `ResultsSection`

**File:** `components/caption-generator/ResultsSection.tsx`

#### Props Interface

```typescript
interface ResultsSectionProps {
  /** Current UI state. Drives what the section renders. */
  status: 'idle' | 'loading' | 'success' | 'error';
  /** Caption data populated on successful API response. */
  captions: Caption[];
  /** Human-readable error message from the API or a generic fallback. */
  errorMessage: string;
  /** Called when the user clicks "Regenerate". */
  onRegenerate: () => void;
  /** Called when the user clicks "Try Again" in the error state. */
  onRetry: () => void;
}

interface Caption {
  id: number;
  text: string;
  hashtags: string[];
}
```

#### Behavior

- The `<section>` element is **always in the DOM** (not conditionally removed).
- When `status === 'idle'`: the section has `visibility: hidden` and `aria-hidden="true"`. It occupies no visible space (height is collapsed via CSS).
- When `status === 'loading'`: section is visible; renders three `<CaptionCard isSkeleton={true} />` components. The `aria-live` region announces nothing yet.
- When `status === 'success'`: renders three real `<CaptionCard />` components and the Regenerate button. The `aria-live="polite"` region announces the result count: `"3 captions generated."`.
- When `status === 'error'`: renders the error banner in place of caption cards.
- The `AdSlot` component is rendered inside `ResultsSection`, above the caption cards / error banner, and receives `isVisible={status !== 'idle'}`.
- Regenerate button passes the last submitted payload (held in the parent page's state) — it does not re-read the form.

#### JSX Outline

```tsx
<section
  ref={sectionRef}
  className={styles.resultsSection}
  aria-hidden={status === 'idle'}
  style={{ visibility: status === 'idle' ? 'hidden' : 'visible' }}
>
  {/* Screen-reader live region — announces when results are ready */}
  <div
    aria-live="polite"
    aria-atomic="true"
    className={styles.visuallyHidden}
  >
    {status === 'success' ? '3 captions generated.' : ''}
  </div>

  <AdSlot isVisible={status !== 'idle'} />

  {/* Loading state */}
  {status === 'loading' && (
    <div className={styles.cardList}>
      <CaptionCard index={1} text="" hashtags={[]} isSkeleton={true} />
      <CaptionCard index={2} text="" hashtags={[]} isSkeleton={true} />
      <CaptionCard index={3} text="" hashtags={[]} isSkeleton={true} />
    </div>
  )}

  {/* Success state */}
  {status === 'success' && (
    <>
      <div className={styles.cardList}>
        {captions.map(caption => (
          <CaptionCard
            key={caption.id}
            index={caption.id}
            text={caption.text}
            hashtags={caption.hashtags}
            isSkeleton={false}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onRegenerate}
        className={styles.regenerateButton}
      >
        Regenerate
      </button>
    </>
  )}

  {/* Error state */}
  {status === 'error' && (
    <div
      role="alert"
      className={styles.errorBanner}
    >
      <WarningIcon aria-hidden="true" className={styles.errorIcon} />
      <p className={styles.errorMessage}>{errorMessage}</p>
      <button
        type="button"
        onClick={onRetry}
        className={styles.retryButton}
      >
        Try Again
      </button>
    </div>
  )}
</section>
```

---

### 2.5 `CaptionGeneratorPage`

**File:** `app/caption-generator/page.tsx`

#### Props Interface

This is a Next.js page component; it receives no runtime props (route params or search params are unused for this feature).

```typescript
// No props — Next.js App Router page component
export default function CaptionGeneratorPage() { ... }
```

#### State

```typescript
// Core UI state machine
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// API results
const [captions, setCaptions] = useState<Caption[]>([]);

// Last successfully submitted payload — used for Regenerate
const [lastPayload, setLastPayload] = useState<GenerateCaptionPayload | null>(null);

// Error message to display in the error banner
const [errorMessage, setErrorMessage] = useState<string>('');
```

#### Behavior

- Handles the full generate/regenerate/retry lifecycle.
- `handleSubmit(payload)`: stores payload in `lastPayload`, triggers `fetchCaptions(payload, false)`.
- `handleRegenerate()`: triggers `fetchCaptions(lastPayload!, true)`.
- `handleRetry()`: triggers `fetchCaptions(lastPayload!, false)`.
- On first successful response, focus is moved programmatically to the `ResultsSection` heading (or the first caption card) so keyboard users know content has appeared.

#### JSX Outline

```tsx
<main className={styles.pageMain}>
  {/* SEO intro — H1 and intro paragraph are always visible */}
  <div className={styles.pageHero}>
    <h1 className={styles.h1}>
      Free AI Caption Generator for Social Media
    </h1>
    <p className={styles.introParagraph}>
      Writing the perfect caption takes time — time most content creators
      don't have. This free AI caption generator produces ready-to-use
      captions for Instagram, TikTok, LinkedIn, and Twitter in seconds.
      Just enter your topic, choose your platform and tone, and let the AI
      do the work. Get three unique caption variants — complete with
      hashtags — on every request. Copy your favorite with one click and
      go. No sign-up. No cost. Just captions that work.
    </p>
  </div>

  <CaptionForm
    onSubmit={handleSubmit}
    isLoading={status === 'loading'}
  />

  <ResultsSection
    status={status}
    captions={captions}
    errorMessage={errorMessage}
    onRegenerate={handleRegenerate}
    onRetry={handleRetry}
  />

  {/* SEO body content — H2 sections */}
  <div className={styles.seoBody}>
    <h2>How the AI Caption Generator Works</h2>
    {/* … */}
    <h2>Captions for Every Platform — Instagram, TikTok, LinkedIn & Twitter</h2>
    {/* … */}
    <h2>Choose Your Tone: Casual, Funny, Professional or Inspirational</h2>
    {/* … */}
    <h2>Generate Captions With the Right Hashtags</h2>
    {/* … */}
    <h2>Why Content Creators Use AI Caption Tools</h2>
    {/* … */}
    <h2>Tips for Writing Better Social Media Captions</h2>
    {/* … */}
    <h2>More Free AI Tools for Creators</h2>
    {/* … */}
  </div>
</main>
```

---

## Section 3 — API Integration

### Endpoint

```
POST /api/generate-caption
Content-Type: application/json
```

### Request Shape

Standard generation (first click of "Generate Captions"):

```typescript
interface GenerateCaptionRequest {
  topic: string;           // Trimmed, max 200 chars
  platform: string;        // 'instagram' | 'tiktok' | 'linkedin' | 'twitter'
  tone: string;            // 'casual' | 'professional' | 'funny' | 'inspirational'
  hashtag_count: number;   // 0–10, default 5
  regenerate?: boolean;    // Omitted on first call; true on Regenerate clicks
}
```

Regenerate call appends `"regenerate": true` to signal the backend to use a higher temperature and inject the regenerate modifier into the prompt.

### Fetch Implementation

```typescript
async function fetchCaptions(
  payload: GenerateCaptionPayload,
  isRegenerate: boolean
): Promise<void> {
  setStatus('loading');
  setErrorMessage('');

  const body: GenerateCaptionRequest = {
    ...payload,
    ...(isRegenerate ? { regenerate: true } : {}),
  };

  try {
    const response = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle all non-2xx status codes
      const message = getErrorMessage(response.status, data);
      setErrorMessage(message);
      setStatus('error');
      return;
    }

    // Success path
    setCaptions(data.captions);
    setStatus('success');

    // Move focus to results for keyboard users
    resultsSectionRef.current?.focus();

  } catch (networkError) {
    // fetch() itself threw — no network connectivity or CORS
    setErrorMessage('Something went wrong. Please try again.');
    setStatus('error');
  }
}
```

### Error Message Mapping

```typescript
function getErrorMessage(status: number, data: ApiErrorResponse): string {
  if (status === 422) {
    return data.message ?? 'We weren\'t able to generate captions for this topic. Please try a different topic.';
  }
  if (status === 429) {
    return data.message ?? 'Too many requests. Please wait a moment and try again.';
  }
  if (status === 400) {
    return data.message ?? 'Please check your inputs and try again.';
  }
  // 500, 503, and any unexpected status
  return data.message ?? 'Something went wrong. Please try again.';
}
```

### Response Shape (Success — HTTP 200)

```typescript
interface CaptionResponse {
  captions: Caption[];
}

interface Caption {
  id: number;        // 1 | 2 | 3
  text: string;      // Caption body — no hashtags embedded
  hashtags: string[]; // Each element starts with '#'
}
```

### Response Shape (Error — HTTP 4xx/5xx)

```typescript
interface ApiErrorResponse {
  error: true;
  code: string;    // e.g. 'RATE_LIMIT_EXCEEDED', 'UNSAFE_TOPIC', 'GENERATION_FAILED'
  message: string; // Human-readable; displayed directly in the error banner
}
```

---

## Section 4 — State Management

### State Definitions (in `CaptionGeneratorPage`)

```typescript
// UI state machine — single source of truth for what is rendered
const [status, setStatus] =
  useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// Caption data — populated on successful response; persists across regenerate cycles
const [captions, setCaptions] = useState<Caption[]>([]);

// The payload that produced the current (or last attempted) results
// Used by Regenerate and Retry so they do not re-read the form
const [lastPayload, setLastPayload] =
  useState<GenerateCaptionPayload | null>(null);

// Error message shown in the error banner
const [errorMessage, setErrorMessage] = useState<string>('');

// Ref to the ResultsSection element — used for focus management on success
const resultsSectionRef = useRef<HTMLElement>(null);
```

### State Transitions (matching UIUX state machine)

| Current State | Trigger | Next State | Side Effects |
|---|---|---|---|
| `idle` | User submits valid form | `loading` | Stores payload in `lastPayload`; calls `fetchCaptions(payload, false)` |
| `loading` | API returns 200 | `success` | Stores captions in `captions`; moves focus to `ResultsSection` |
| `loading` | API returns 4xx/5xx | `error` | Sets `errorMessage`; focus stays on last focused element |
| `loading` | `fetch()` throws (network) | `error` | Sets generic `errorMessage` |
| `success` | User clicks "Regenerate" | `loading` | Calls `fetchCaptions(lastPayload!, true)` |
| `success` | User clicks "Copy" on a card | (no page-level transition) | `CaptionCard` internal `copied` state toggles; resets after 2s |
| `error` | User clicks "Try Again" | `loading` | Calls `fetchCaptions(lastPayload!, false)` |
| Any | User modifies form, re-submits | `loading` | Updates `lastPayload` with new values |

### Per-Card Copied State (in `CaptionCard`)

```typescript
// Isolated per card instance — three cards = three independent state atoms
const [copied, setCopied] = useState<boolean>(false);
```

Transition: `false` → `true` on copy button click → `false` after 2000ms setTimeout.

### State Visibility Mapping

| `status` value | Form | AdSlot | Skeleton cards | Real caption cards | Regenerate button | Error banner |
|---|---|---|---|---|---|---|
| `idle` | Visible | In DOM, opacity 0 | Hidden | Hidden | Hidden | Hidden |
| `loading` | Visible, button disabled | Visible | Visible | Hidden | Hidden | Hidden |
| `success` | Visible | Visible | Hidden | Visible | Visible | Hidden |
| `error` | Visible | Visible | Hidden | Hidden | Hidden | Visible |

---

## Section 5 — SEO Implementation

### Next.js Metadata API

**File:** `app/caption-generator/page.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Caption Generator — Free & Instant | Creator Tool AI',
  description:
    'Generate ready-to-use social media captions for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.',
  openGraph: {
    title: 'AI Caption Generator — Free & Instant | Creator Tool AI',
    description:
      'Generate ready-to-use social media captions for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.',
    url: 'https://creatortoola.com/caption-generator',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Caption Generator — Free & Instant | Creator Tool AI',
    description:
      'Generate ready-to-use social media captions for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.',
  },
  alternates: {
    canonical: '/caption-generator',
  },
};
```

**Title tag (exact string from `docs/seo-caption-generator.md` Section 3):**
```
AI Caption Generator — Free & Instant | Creator Tool AI
```
Character count: 55. Under the 60-character limit.

**Meta description (exact string from `docs/seo-caption-generator.md` Section 4):**
```
Generate ready-to-use social media captions for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.
```
Character count: 150. Under the 155-character limit.

### H1 (exact string from `docs/seo-caption-generator.md` Section 5)

```html
<h1>Free AI Caption Generator for Social Media</h1>
```

This H1 must not be paraphrased. It contains the primary keyword `AI caption generator` and the high-intent qualifier `Free`.

### Intro Paragraph (exact copy from `docs/seo-caption-generator.md` Section 7)

Rendered as a `<p>` directly below the H1, verbatim:

> Writing the perfect caption takes time — time most content creators don't have. This free AI caption generator produces ready-to-use captions for Instagram, TikTok, LinkedIn, and Twitter in seconds. Just enter your topic, choose your platform and tone, and let the AI do the work. Get three unique caption variants — complete with hashtags — on every request. Copy your favorite with one click and go. No sign-up. No cost. Just captions that work.

### H2 Sections (below the tool, in order from `docs/seo-caption-generator.md` Section 6)

```html
<h2>How the AI Caption Generator Works</h2>
<h2>Captions for Every Platform — Instagram, TikTok, LinkedIn & Twitter</h2>
<h2>Choose Your Tone: Casual, Funny, Professional or Inspirational</h2>
<h2>Generate Captions With the Right Hashtags</h2>
<h2>Why Content Creators Use AI Caption Tools</h2>
<h2>Tips for Writing Better Social Media Captions</h2>
<h2>More Free AI Tools for Creators</h2>
```

H2 sections are rendered below the `ResultsSection` in the page-level JSX. They are static HTML — no React state involved.

### Internal Links (from `docs/seo-caption-generator.md` Section 8)

Links to place within H2 section body copy:

| Anchor Text | Target | H2 Section |
|---|---|---|
| "generate hashtags" | `/hashtag-generator` | Generate Captions With the Right Hashtags |
| "get post ideas first" | `/post-idea-generator` | How the AI Caption Generator Works |
| "write your social media bio" | `/bio-generator` | More Free AI Tools for Creators |

All internal links use Next.js `<Link>` component, not `<a>` tags.

---

## Section 6 — Copy-to-Clipboard

### Full Implementation (inside `CaptionCard.tsx`)

```typescript
const COPY_RESET_MS = 2000;

const handleCopy = async () => {
  // Build the full clipboard string:
  // caption body text + newline + space-separated hashtags
  const fullText = `${text}\n${hashtags.join(' ')}`;

  try {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);

    // Auto-reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, COPY_RESET_MS);

  } catch (err) {
    // navigator.clipboard is unavailable (non-HTTPS, old browser)
    // Fallback: legacy execCommand (deprecated but supported)
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch (fallbackErr) {
      // Both methods failed — silently fail; do not change button state
      console.error('Copy to clipboard failed:', fallbackErr);
    } finally {
      document.body.removeChild(textArea);
    }
  }
};
```

### Clipboard String Format

```
{caption.text}
{caption.hashtags.join(" ")}
```

Example output written to clipboard:

```
First sip hits different when you've got a plan for the day. ☕ My morning coffee routine is basically my unofficial productivity meeting — and it always shows up on time.
#MorningCoffee #ProductivityHacks #CoffeeLover #MorningRoutine #GetThingsDone
```

### Button State Transitions

| State | Button Label | Icon | `aria-label` |
|---|---|---|---|
| Default | `Copy` | None | `"Copy caption {index}"` |
| Copied (2s window) | `Copied!` | Checkmark (`#10B981`) | `"Caption copied to clipboard"` |
| After 2s | `Copy` | None | `"Copy caption {index}"` |

### Per-Card Independence

Each `CaptionCard` instance maintains its own `copied` state atom via `useState`. There is no shared clipboard state at the page or `ResultsSection` level. Clicking Copy on Caption 2 does not affect the `copied` state of Captions 1 or 3.

---

## Section 7 — Loading Skeleton

### Skeleton Structure

When `status === 'loading'`, three `<CaptionCard isSkeleton={true} />` instances are rendered. Each skeleton card contains:

- One narrow bar (simulating the "Caption N" heading)
- Two full-width bars (simulating body text lines)
- One short bar at ~60% width (simulating the hashtag line)

### CSS Shimmer Animation

**File:** `styles/caption-generator/CaptionCard.module.css`

```css
/* Shimmer keyframes — left-to-right sweep */
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

/* Applied to every skeleton bar */
.skeletonBar {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  background: linear-gradient(
    90deg,
    #E5E7EB 25%,   /* --color-skeleton from */
    #F3F4F6 50%,   /* --color-skeleton to   */
    #E5E7EB 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeletonLabel {
  composes: skeletonBar;
  width: 80px;       /* Narrow — matches "Caption N" label width */
  height: 14px;
  margin-bottom: 16px;
}

.skeletonBarShort {
  width: 60%;        /* Hashtag line — shorter than body lines */
  margin-bottom: 0;
}

/* The skeleton card container itself */
.skeletonCard {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
```

### Skeleton Accessibility

```tsx
<article
  className={styles.skeletonCard}
  aria-hidden="true"       /* Hidden from screen readers — content not meaningful */
  aria-label="Loading caption"
>
```

The three skeleton cards are collectively hidden from assistive technology. Screen readers instead hear the `aria-live="polite"` region in `ResultsSection` announce `"3 captions generated."` when content arrives.

### Generate Button During Loading

```tsx
<button
  type="submit"
  disabled={true}
  aria-busy="true"
  aria-disabled="true"
  className={styles.generateButton}
>
  <SpinnerIcon aria-hidden="true" />
  Generating…
</button>
```

The spinner is an inline SVG with `aria-hidden="true"` — the button's text label carries the meaning for screen readers.

---

## Section 8 — Error and Validation UI

### 8.1 Inline Field Validation Errors

Inline errors appear immediately below the offending input field on blur. They do not block form submission — the Generate button's disabled state handles that. Inline errors are supplementary guidance.

**Styling:**

```css
.fieldError {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: #EF4444;
  margin-top: 4px;
  min-height: 16px; /* Reserve space so layout does not shift when error appears */
}
```

**Validation rules and messages (from `docs/uiux-caption-generator.md` Section 8.3):**

| Field | Condition | Inline Message |
|---|---|---|
| Topic | Empty on blur | "Please describe your topic" |
| Topic | Exceeds 200 chars | "200 character maximum" (also blocked by `maxLength`) |
| Platform | Unselected on blur | "Please select a platform" |
| Tone | Unselected on blur | "Please select a tone" |
| Hashtag Count | Out of 0–10 range | Silently clamped; no message |

**ARIA wiring for field errors:**

Each field input has `aria-describedby` pointing to its error `<span>` ID and `aria-invalid="true"` when an error is active. Error spans have `role="alert"` and `aria-live="polite"` so screen readers announce the message immediately on blur.

### 8.2 API Error Banner

Rendered inside `ResultsSection` when `status === 'error'`. The form card remains fully editable and functional so users can adjust inputs and resubmit.

**Visual spec (from `docs/uiux-caption-generator.md` Section 4.5):**

```css
.errorBanner {
  background-color: #FEF2F2;   /* --color-error-bg */
  border: 1px solid #FCA5A5;   /* --color-error-border */
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.errorIcon {
  color: #991B1B;              /* --color-error-text */
  width: 24px;
  height: 24px;
}

.errorMessage {
  font-size: 14px;
  font-weight: 500;
  color: #991B1B;              /* --color-error-text */
  margin: 0;
}
```

**JSX:**

```tsx
<div role="alert" className={styles.errorBanner}>
  <WarningIcon aria-hidden="true" className={styles.errorIcon} />
  <p className={styles.errorMessage}>{errorMessage}</p>
  <button
    type="button"
    onClick={onRetry}
    className={styles.retryButton}
  >
    Try Again
  </button>
</div>
```

`role="alert"` causes screen readers to announce the error immediately without requiring focus — equivalent to `aria-live="assertive"`.

### 8.3 Retry Button

- Label: "Try Again"
- Style: Primary button (same as Generate button — full emphasis signals this is the recovery action).
- Behavior: Calls `fetchCaptions(lastPayload!, false)` — identical to the original request (not a regenerate).
- Min touch target: 44 × 44px.

### 8.4 Error Message Strings by Status Code

| HTTP Status | Code | Message Shown to User |
|---|---|---|
| 400 | `MISSING_*` / `INVALID_*` | `"Please check your inputs and try again."` |
| 422 | `UNSAFE_TOPIC` | `"We weren't able to generate captions for this topic. Please try a different topic."` |
| 429 | `RATE_LIMIT_EXCEEDED` | `"Too many requests. Please wait a moment and try again."` |
| 500 | `GENERATION_FAILED` | `"We couldn't generate captions right now. Please try again."` |
| 503 | `CLAUDE_API_ERROR` / `TIMEOUT` | `"The caption service is temporarily unavailable. Please try again."` |
| Network error | — | `"Something went wrong. Please try again."` |

The frontend always uses `data.message` from the API response when present, falling back to the strings in the table above.

---

## Section 9 — Accessibility

### 9.1 ARIA Attributes

| Element | ARIA Attributes | Notes |
|---|---|---|
| `<form>` | `role="form"` `aria-label="Caption generator"` | Provides a labelled landmark for screen readers |
| Topic `<textarea>` | `aria-required="true"` `aria-describedby="topic-counter topic-error"` `aria-invalid={topicError !== ''}` | Links to both the char counter and the error span |
| Platform `<select>` | `aria-required="true"` `aria-describedby="platform-error"` `aria-invalid={platformError !== ''}` | |
| Tone `<select>` | `aria-required="true"` `aria-describedby="tone-error"` `aria-invalid={toneError !== ''}` | |
| Field error `<span>` | `role="alert"` `aria-live="polite"` | Announces inline error on blur without focus move |
| Generate button (loading) | `aria-busy="true"` `aria-disabled="true"` | Communicates busy state to AT |
| Generate button (form invalid) | `aria-disabled="true"` | Button is disabled; AT reads reason via field errors |
| Spinner SVG | `aria-hidden="true"` | Decorative; button text label carries meaning |
| Results `<section>` | `aria-hidden={status === 'idle'}` | Hides empty section from AT on initial load |
| `aria-live` region (results) | `aria-live="polite"` `aria-atomic="true"` | Announces "3 captions generated." on success |
| Error banner | `role="alert"` | Announces immediately on error — no focus move needed |
| Copy button (default) | `aria-label="Copy caption {index}"` | Distinguishes three buttons for AT |
| Copy button (copied state) | `aria-label="Caption copied to clipboard"` | Confirms action for AT users |
| Skeleton cards | `aria-hidden="true"` | Loading placeholders are not meaningful content |
| Checkmark icon | `aria-hidden="true"` | Decorative; button label carries meaning |
| Warning icon | `aria-hidden="true"` | Decorative; error message `<p>` carries meaning |
| Ad slot | `role="complementary"` `aria-label="Advertisement"` | Identifies as supplementary content |

### 9.2 Focus Management

**Initial page load:** Focus is not moved programmatically. The browser's default focus starts at the first focusable element (Topic textarea) when the user tabs in.

**On successful caption generation:** Focus is moved to the `ResultsSection` `<section>` element programmatically:

```typescript
// In CaptionGeneratorPage, after setStatus('success')
useEffect(() => {
  if (status === 'success' && resultsSectionRef.current) {
    resultsSectionRef.current.setAttribute('tabindex', '-1');
    resultsSectionRef.current.focus();
  }
}, [status]);
```

The section is given `tabindex="-1"` programmatically (not in markup) so it is focusable by script but not reachable via Tab key by the user.

**On error:** Focus is not moved — `role="alert"` announces the error without requiring focus change, preserving the user's position in the form.

**After copy confirmation:** Focus stays on the Copy button; it reverts to "Copy" label after 2s without focus movement.

### 9.3 Tab Order

DOM order matches visual order. Tab sequence across the full page:

```
1. Topic textarea
2. Platform select
3. Tone select
4. Hashtag count input
5. Generate Captions button
   — [Tab into results section after successful generation] —
6. Copy button (Caption 1)
7. Copy button (Caption 2)
8. Copy button (Caption 3)
9. Regenerate button
   — [Tab continues to SEO body content links and footer] —
```

No `tabindex` values above 0 are used. Positive `tabindex` is not permitted.

### 9.4 Focus Ring

All focusable elements use a visible focus indicator:

```css
:focus-visible {
  outline: 2px solid #6366F1;   /* --color-primary */
  outline-offset: 2px;
}
```

The `:focus-visible` pseudo-class ensures the ring only appears for keyboard navigation, not mouse clicks (per browser default behavior).

### 9.5 Colour Contrast Compliance (WCAG 2.1 AA)

| Element | Foreground | Background | Ratio | Pass |
|---|---|---|---|---|
| Body text | #111827 | #F9FAFB | 18.1:1 | AA |
| Generate button | #FFFFFF | #6366F1 | 5.2:1 | AA |
| Error text | #991B1B | #FEF2F2 | 7.1:1 | AA |
| Muted text (hashtags) | #6B7280 | #FFFFFF | 4.6:1 | AA |
| Label text | #374151 | #FFFFFF | 9.7:1 | AA |

### 9.6 Touch Target Sizes

Copy button and Regenerate button minimum touch target: **44 × 44px** (WCAG 2.5.5 Level AAA — adopted as a hard requirement per UIUX spec).

```css
.copyButton {
  min-height: 44px;
  min-width: 44px;
  padding: 0 12px;
}

.regenerateButton {
  min-height: 44px;
  width: 100%;
}
```

---

## Section 10 — Responsive CSS

### CSS Variables (Global, in root layout or `globals.css`)

```css
:root {
  --color-primary:         #6366F1;
  --color-primary-hover:   #4F46E5;
  --color-primary-text:    #FFFFFF;
  --color-secondary:       #FFFFFF;
  --color-secondary-border:#D1D5DB;
  --color-secondary-text:  #374151;
  --color-bg-page:         #F9FAFB;
  --color-bg-card:         #FFFFFF;
  --color-border:          #E5E7EB;
  --color-text-primary:    #111827;
  --color-text-muted:      #6B7280;
  --color-error-bg:        #FEF2F2;
  --color-error-border:    #FCA5A5;
  --color-error-text:      #991B1B;
  --color-success:         #10B981;
  --color-skeleton-from:   #E5E7EB;
  --color-skeleton-to:     #F3F4F6;

  --font-stack: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
}
```

### Page Layout (`CaptionGeneratorPage.module.css`)

```css
.pageMain {
  background-color: var(--color-bg-page);
  font-family: var(--font-stack);
  padding: 0 16px 64px;
}

.pageHero {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 0 32px;
}

.h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin-bottom: 16px;
}

.introParagraph {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0;
}

.seoBody {
  max-width: 720px;
  margin: 64px auto 0;
}

.seoBody h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: 48px;
  margin-bottom: 16px;
}

/* Breakpoint: < 480px */
@media (max-width: 479px) {
  .h1 {
    font-size: 28px;
  }

  .pageHero {
    padding: 24px 0 20px;
  }
}
```

### Form Card (`CaptionForm.module.css`)

```css
.formCard {
  max-width: 720px;
  margin: 0 auto;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
}

.dropdownRow {
  display: grid;
  grid-template-columns: 1fr;   /* Mobile-first: stacked */
  gap: 16px;
}

.generateButton {
  width: 100%;
  height: 48px;
  background: var(--color-primary);
  color: var(--color-primary-text);
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 150ms ease;
}

.generateButton:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.generateButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Breakpoint: < 480px */
@media (max-width: 479px) {
  .formCard {
    padding: 16px;      /* Reduced padding on small phones */
  }
}

/* Breakpoint: 480px – 767px */
@media (min-width: 480px) and (max-width: 767px) {
  .dropdownRow {
    grid-template-columns: 1fr;   /* Still stacked */
  }
}

/* Breakpoint: ≥ 1024px */
@media (min-width: 1024px) {
  .dropdownRow {
    grid-template-columns: 1fr 1fr;   /* Side-by-side */
    gap: 16px;
  }
}
```

### Ad Slot (`AdSlot.module.css`)

```css
.adSlot {
  max-width: 720px;
  margin: 24px auto;
  background: #F3F4F6;
  border: 1px dashed #D1D5DB;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 200ms ease;

  /* Mobile-first: 320 × 50 */
  width: 320px;
  height: 50px;
}

.adLabel {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adSlotHidden {
  opacity: 0;
  pointer-events: none;
}

.adSlotVisible {
  opacity: 1;
}

/* Breakpoint: ≥ 768px — switch to leaderboard */
@media (min-width: 768px) {
  .adSlot {
    width: 728px;
    height: 90px;
  }
}
```

### Caption Cards and Results (`ResultsSection.module.css` and `CaptionCard.module.css`)

```css
/* ResultsSection.module.css */

.resultsSection {
  max-width: 720px;
  margin: 0 auto;
}

.cardList {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.regenerateButton {
  width: 100%;
  min-height: 44px;
  background: var(--color-secondary);
  color: var(--color-secondary-text);
  border: 1px solid var(--color-secondary-border);
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.regenerateButton:hover {
  background: #F9FAFB;
}

.errorBanner {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.errorMessage {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-error-text);
  margin: 0;
}

.retryButton {
  min-height: 44px;
  padding: 0 20px;
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.retryButton:hover {
  background: var(--color-primary-hover);
}

/* CaptionCard.module.css */

.captionCard {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.captionLabel {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0 0 12px;
}

.captionText {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0 0 8px;
}

.captionHashtags {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-muted);
  margin: 0;
}

.copyButton {
  min-height: 44px;
  min-width: 44px;
  padding: 0 12px;
  background: var(--color-secondary);
  color: var(--color-secondary-text);
  border: 1px solid var(--color-secondary-border);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 150ms ease;
}

.copyButton:hover {
  background: #F9FAFB;
}

.copyButtonCopied {
  color: var(--color-success);
  border-color: var(--color-success);
}
```

### Breakpoint Summary Table

| Breakpoint | Key Layout Changes |
|---|---|
| `< 480px` | Form padding: 16px; H1: 28px; Platform + Tone: stacked |
| `480px – 767px` | Single column; Platform + Tone: stacked; Ad slot: 320 × 50 |
| `768px – 1023px` | Single column; max-width 680px centered; Ad slot: 728 × 90 |
| `≥ 1024px` | Platform + Tone dropdowns: 2-column grid; max-width 720px centered; Ad slot: 728 × 90 |

Caption cards are always full-width within the `ResultsSection` container at all breakpoints — no multi-column card grid is used.

---

## Acceptance Criteria Checklist

Cross-referenced from `tasks/task-001-caption-generator.md`:

- [ ] Form validates all required fields before submission — inline errors on blur; Generate button disabled until valid
- [ ] API returns exactly 3 caption variants — enforced by backend; frontend renders whatever is in `captions[]` (always 3)
- [ ] Each caption includes body text + hashtags as separate fields — `CaptionCard` renders `text` and `hashtags` in separate `<p>` elements
- [ ] Copy button copies full caption (text + hashtags) to clipboard — `text + "\n" + hashtags.join(" ")` via `navigator.clipboard.writeText`
- [ ] Regenerate triggers a new API call with the same inputs — `handleRegenerate` uses `lastPayload` with `regenerate: true`
- [ ] Loading state is visible during API call — skeleton cards + disabled Generate button with "Generating…" label
- [ ] Error state shown if API fails (with retry option) — error banner with `role="alert"` and "Try Again" button
- [ ] Page has correct SEO title, meta description, and H1 — `generateMetadata` export + H1 in page JSX
- [ ] Ad slot placeholder renders above the results section — `AdSlot` rendered inside `ResultsSection`, always in DOM
- [ ] Mobile responsive (single-column layout on < 768px) — CSS Module breakpoints; stacked layout is the mobile-first default
- [ ] Response time < 5 seconds under normal conditions — frontend has no control; backend Claude timeout is 15s; no additional frontend delay introduced

---

*Document produced by the Frontend agent. All upstream dependency gates cleared. This file is the implementation reference for building `app/caption-generator/page.tsx` and its constituent components.*
