# Frontend Specification: Bio Generator

**Agent:** Frontend
**Status:** Complete
**Created:** 2026-03-28
**Feature:** Bio Generator (MVP)
**Page URL:** `/bio-generator`
**Depends On:**
- `tasks/task-002-bio-generator.md`
- `docs/uiux-bio-generator.md`
- `docs/seo-bio-generator.md`
- `features/backend-bio-generator.md`

---

## Section 1 — Page File Structure

All paths are relative to the Next.js project root (`creator-tool-ai/`). The project uses the App Router.

```
creator-tool-ai/
├── app/
│   └── bio-generator/
│       ├── page.tsx                         # NEW — Route entry point: BioGeneratorPage + generateMetadata
│       └── layout.tsx                       # NEW — Optional segment layout (inherits root layout)
│
├── components/
│   └── bio-generator/
│       ├── BioForm.tsx                      # NEW — Form card: platform, tone, niche, traits, submit
│       ├── BioCard.tsx                      # NEW — Single bio result: bio text, char count badge, copy button
│       └── ResultsSection.tsx               # NEW — Wrapper: bio cards list + regenerate button
│
├── styles/
│   └── bio-generator/
│       ├── BioForm.module.css               # NEW — Scoped styles for BioForm
│       ├── BioCard.module.css               # NEW — Scoped styles for BioCard (incl. skeleton shimmer)
│       ├── ResultsSection.module.css        # NEW — Scoped styles for ResultsSection
│       └── BioGeneratorPage.module.css      # NEW — Page-level layout, typography, breakpoints
│
└── lib/
    └── bio-generator/
        └── types.ts                         # NEW — Frontend TypeScript types: Bio, BioResponse, ApiError, GenerateBioPayload
```

### Shared Files Referenced (Do Not Duplicate)

| Shared file | Used by | Notes |
|---|---|---|
| `components/caption-generator/AdSlot.tsx` | `components/bio-generator/ResultsSection.tsx` | Import directly — no changes needed. Same sizing, position, and placeholder treatment as Caption Generator. |
| `styles/caption-generator/AdSlot.module.css` | `components/caption-generator/AdSlot.tsx` | Already scoped to AdSlot component — no action required. |
| `app/globals.css` | All new CSS modules | All new CSS modules reference existing CSS variables — do not redeclare tokens. |

### Notes on Structure

- CSS Modules are used for all new component styles to guarantee zero class-name collision.
- `lib/bio-generator/types.ts` defines the `Bio`, `BioResponse`, `ApiError`, and `GenerateBioPayload` interfaces consumed by the page and components.
- No global CSS modifications are made by this feature; all styles are scoped.
- The page file at `app/bio-generator/page.tsx` exports both the `generateMetadata` function (Next.js Metadata API) and the default page component.
- `AdSlot.tsx` is imported from `components/caption-generator/AdSlot.tsx` — it is not duplicated into the bio-generator component folder.
- The `@keyframes shimmer` animation is defined in `styles/caption-generator/CaptionCard.module.css`. Bio skeleton bars reuse the same keyframe name — CSS Modules will scope it locally, so the definition must be copied into `styles/bio-generator/BioCard.module.css` (one copy per module; no cross-module `@keyframes` sharing in CSS Modules).

---

## Section 2 — Component Breakdown

### 2.1 `BioForm`

**File:** `components/bio-generator/BioForm.tsx`

Do not import or extend `CaptionForm.tsx`. This component is built from scratch with bio-specific fields.

#### Props Interface

```typescript
interface BioFormProps {
  /** Called when the user submits the form with valid values. */
  onSubmit: (payload: GenerateBioPayload) => void;
  /** When true, the form submit button is disabled and shows "Generating…" */
  isLoading: boolean;
}

interface GenerateBioPayload {
  platform: 'instagram' | 'tiktok' | 'linkedin' | 'twitter';
  tone: 'casual' | 'professional' | 'funny' | 'inspirational';
  niche: string;    // Trimmed, max 100 chars
  traits: string;   // Trimmed, max 150 chars
}
```

#### Internal State

```typescript
const [platform, setPlatform]   = useState<string>('');
const [tone, setTone]           = useState<string>('');
const [niche, setNiche]         = useState<string>('');
const [traits, setTraits]       = useState<string>('');

// Per-field validation error messages; empty string = no error
const [platformError, setPlatformError] = useState<string>('');
const [toneError, setToneError]         = useState<string>('');
const [nicheError, setNicheError]       = useState<string>('');
const [traitsError, setTraitsError]     = useState<string>('');
```

#### Behavior

- The Generate button is disabled when any of: `platform === ''`, `tone === ''`, `niche.trim() === ''`, or `traits.trim() === ''`.
- `niche` is limited to 100 characters; the `<input>` does not accept further input at the limit (enforced via `maxLength={100}` attribute and confirmed in `onChange`).
- `niche` character counter displays `{niche.length} / 100`. Counter text color switches to `#EF4444` when `niche.length > 90`.
- `traits` is limited to 150 characters; the `<input>` does not accept further input at the limit (enforced via `maxLength={150}` attribute).
- `traits` character counter displays `{traits.length} / 150`. Counter text color switches to `#EF4444` when `traits.length > 135`.
- Inline validation fires **on blur** for each required field:
  - Platform unselected on blur → `platformError = "Please select a platform"`
  - Tone unselected on blur → `toneError = "Please select a tone"`
  - Niche empty on blur → `nicheError = "Please describe your niche or profession"`
  - Traits empty on blur → `traitsError = "Please list at least one key trait"`
  - Niche > 100 chars (reached via paste): counter turns red; `nicheError = "100 character maximum"`
  - Traits > 150 chars (reached via paste): counter turns red; `traitsError = "150 character maximum"`
- On submit: re-validates all fields; if any fail, focuses the first invalid field and does not call `onSubmit`. If all pass, calls `onSubmit` with the current payload.
- While `isLoading` is true: the submit button is disabled, its label reads "Generating…", and a spinner SVG is rendered inline to the left of the text.

#### JSX Outline

```tsx
<section
  className={styles.formCard}
  aria-labelledby="bio-form-heading"
>
  <h2 id="bio-form-heading" className={styles.visuallyHidden}>
    Generate your bios
  </h2>

  <form
    role="form"
    aria-label="Bio generator"
    onSubmit={handleSubmit}
    noValidate
  >
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

    {/* Niche */}
    <div className={styles.fieldGroup}>
      <label htmlFor="niche" className={styles.label}>
        Niche / Profession <span aria-hidden="true">*</span>
      </label>
      <input
        id="niche"
        name="niche"
        type="text"
        maxLength={100}
        value={niche}
        onChange={handleNicheChange}
        onBlur={handleNicheBlur}
        placeholder="e.g. fitness coach, travel photographer"
        aria-required="true"
        aria-describedby="niche-counter niche-error"
        aria-invalid={nicheError !== ''}
        className={styles.textInput}
      />
      <div className={styles.counterRow}>
        <span
          id="niche-error"
          role="alert"
          className={styles.fieldError}
          aria-live="polite"
        >
          {nicheError}
        </span>
        <span
          id="niche-counter"
          className={niche.length > 90 ? styles.counterRed : styles.counter}
          aria-label={`${niche.length} of 100 characters used`}
        >
          {niche.length} / 100
        </span>
      </div>
    </div>

    {/* Traits */}
    <div className={styles.fieldGroup}>
      <label htmlFor="traits" className={styles.label}>
        Key Traits <span aria-hidden="true">*</span>
      </label>
      <input
        id="traits"
        name="traits"
        type="text"
        maxLength={150}
        value={traits}
        onChange={handleTraitsChange}
        onBlur={handleTraitsBlur}
        placeholder="e.g. marathon runner, dog lover, coffee addict"
        aria-required="true"
        aria-describedby="traits-counter traits-error"
        aria-invalid={traitsError !== ''}
        className={styles.textInput}
      />
      <div className={styles.counterRow}>
        <span
          id="traits-error"
          role="alert"
          className={styles.fieldError}
          aria-live="polite"
        >
          {traitsError}
        </span>
        <span
          id="traits-counter"
          className={traits.length > 135 ? styles.counterRed : styles.counter}
          aria-label={`${traits.length} of 150 characters used`}
        >
          {traits.length} / 150
        </span>
      </div>
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
        : 'Generate Bios'
      }
    </button>
  </form>
</section>
```

---

### 2.2 `BioCard`

**File:** `components/bio-generator/BioCard.tsx`

Do not import or extend `CaptionCard.tsx`. This component is built from scratch. Key difference from `CaptionCard`: no hashtags sub-field; bio text is a single string; a character count badge is displayed in the card header.

#### Props Interface

```typescript
interface BioCardProps {
  /** 1-based index used for the heading label ("Bio 1", "Bio 2", "Bio 3"). */
  index: number;
  /** Complete bio text — single string, may include inline hashtags. */
  text: string;
  /** When true, renders the skeleton shimmer variant instead of real content. */
  isSkeleton: boolean;
}
```

#### Internal State

```typescript
const [copied, setCopied] = useState<boolean>(false);
```

#### Behavior

- When `isSkeleton` is true: renders shimmer bars (`aria-hidden="true"` on the entire card), Copy button is not rendered, character count badge is not rendered.
- When `isSkeleton` is false: renders bio body text, character count badge, and Copy button.
- Character count badge value: computed as `text.length` at render time — derived client-side, never fetched from the API.
- Copy button click handler:
  1. Calls `navigator.clipboard.writeText(text)` — passes `text` directly. No concatenation; no hashtag joining. Bio text is already a complete single string.
  2. On success: sets `copied = true`, changes button label to "Copied!", sets `aria-label` to `"Bio copied to clipboard"`, renders the checkmark icon.
  3. Sets a `setTimeout` of 2000ms; after 2 seconds `setCopied(false)` resets the button to its default "Copy" state.
  4. `copied` state is per-card; clicking Copy on Bio 2 does not affect Bio 1 or Bio 3.
- Minimum touch target for Copy button: 44 × 44px enforced via CSS `min-height` / `min-width`.

#### JSX Outline

```tsx
<article
  className={`${styles.bioCard} ${isSkeleton ? styles.skeletonCard : ''}`}
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
        <h3 className={styles.bioLabel}>Bio {index}</h3>
        <span
          className={styles.charCountBadge}
          aria-label={`${text.length} characters`}
        >
          {text.length} chars
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Bio copied to clipboard' : `Copy bio ${index}`}
          className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ''}`}
        >
          {copied
            ? <><CheckIcon aria-hidden="true" /> Copied!</>
            : 'Copy'
          }
        </button>
      </div>
      <hr className={styles.divider} />
      <p className={styles.bioText}>{text}</p>
    </>
  )}
</article>
```

---

### 2.3 `AdSlot` (Reused)

**File:** `components/caption-generator/AdSlot.tsx`
**Status:** Reused — import directly, no changes.

```typescript
// Import in ResultsSection.tsx:
import AdSlot from '@/components/caption-generator/AdSlot';
```

#### Props Interface (existing — do not modify)

```typescript
interface AdSlotProps {
  /** Controls visual prominence. false = muted/hidden-ish on initial load,
   *  true = fully visible after Generate is clicked. */
  isVisible: boolean;
}
```

#### Placement in Bio Generator

- Rendered inside `ResultsSection`, above the bio cards / error banner.
- Receives `isVisible={status !== 'idle'}`.
- Always present in the DOM on page load — do not conditionally render.
- Desktop: 728 × 90 leaderboard. Mobile (< 768px): 320 × 50 banner. Sizing is controlled by the existing `AdSlot.module.css` — no changes.

---

### 2.4 `ResultsSection`

**File:** `components/bio-generator/ResultsSection.tsx`

New component. Mirrors the ResultsArea pattern from Caption Generator but uses `BioCard` components and bio-specific nomenclature. The `AdSlot` is imported from the caption-generator component folder.

#### Props Interface

```typescript
interface ResultsSectionProps {
  /** Current UI state. Drives what the section renders. */
  status: 'idle' | 'loading' | 'success' | 'error';
  /** Bio data populated on successful API response. */
  bios: Bio[];
  /** Human-readable error message from the API or a generic fallback. */
  errorMessage: string;
  /** Called when the user clicks "Regenerate". */
  onRegenerate: () => void;
  /** Called when the user clicks "Try Again" in the error state. */
  onRetry: () => void;
}

interface Bio {
  id: number;     // 1 | 2 | 3
  text: string;   // Complete bio string
}
```

#### Behavior

- The `<section>` element is **always in the DOM** (never conditionally removed).
- When `status === 'idle'`: section has `visibility: hidden` and `aria-hidden="true"`. Height is collapsed via CSS so it occupies no visual space. Do not use `display: none` — this breaks `aria-live` announcement on first result.
- When `status === 'loading'`: section is visible; renders three `<BioCard isSkeleton={true} />` components. The `aria-live` region announces nothing yet.
- When `status === 'success'`: renders three real `<BioCard />` components and the Regenerate button. The `aria-live="polite"` region announces `"3 bios generated."`.
- When `status === 'error'`: renders the error banner in place of bio cards.
- The `AdSlot` component is rendered inside `ResultsSection`, above the bio cards / error banner, and receives `isVisible={status !== 'idle'}`.
- Regenerate button uses the last submitted payload stored in the parent page — it does not re-read the current form state.

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
    {status === 'success' ? '3 bios generated.' : ''}
  </div>

  <AdSlot isVisible={status !== 'idle'} />

  {/* Loading state */}
  {status === 'loading' && (
    <div className={styles.cardList}>
      <BioCard index={1} text="" isSkeleton={true} />
      <BioCard index={2} text="" isSkeleton={true} />
      <BioCard index={3} text="" isSkeleton={true} />
    </div>
  )}

  {/* Success state */}
  {status === 'success' && (
    <>
      <div className={styles.cardList}>
        {bios.map(bio => (
          <BioCard
            key={bio.id}
            index={bio.id}
            text={bio.text}
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

### 2.5 `BioGeneratorPage`

**File:** `app/bio-generator/page.tsx`

#### Props Interface

This is a Next.js page component; it receives no runtime props.

```typescript
// No props — Next.js App Router page component
export default function BioGeneratorPage() { ... }
```

#### State

```typescript
// Core UI state machine — single source of truth for what is rendered
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// Bio data — populated on successful response; persists across regenerate cycles
const [bios, setBios] = useState<Bio[]>([]);

// The payload that produced the current (or last attempted) results
// Used by Regenerate and Retry so they do not re-read the form
const [lastPayload, setLastPayload] = useState<GenerateBioPayload | null>(null);

// Error message shown in the error banner
const [errorMessage, setErrorMessage] = useState<string>('');

// Ref to the ResultsSection element — used for focus management on success
const resultsSectionRef = useRef<HTMLElement>(null);
```

#### Behavior

- Handles the full generate/regenerate/retry lifecycle.
- `handleSubmit(payload)`: stores payload in `lastPayload`, triggers `fetchBios(payload, false)`.
- `handleRegenerate()`: triggers `fetchBios(lastPayload!, true)` — uses the stored last-submitted payload, not the current form state.
- `handleRetry()`: triggers `fetchBios(lastPayload!, false)`.
- On first successful response, focus is moved programmatically to the `ResultsSection` element so keyboard users know content has appeared.

#### JSX Outline

```tsx
<main className={styles.pageMain}>
  {/* SEO intro — H1 and intro paragraph are always visible */}
  <div className={styles.pageHero}>
    <h1 className={styles.h1}>
      Free AI Bio Generator for Social Media
    </h1>
    <p className={styles.introParagraph}>
      Your social media bio is the first thing people read — and most creators
      struggle to write one that actually converts. This free AI bio generator
      creates three ready-to-use bio variants for Instagram, TikTok, LinkedIn,
      and Twitter in seconds. Just enter your niche, choose your tone, add a
      few key traits, and let the AI write your bio. Copy your favorite with
      one click. No sign-up. No cost. Just a bio that sounds like you.
    </p>
  </div>

  <BioForm
    onSubmit={handleSubmit}
    isLoading={status === 'loading'}
  />

  <ResultsSection
    ref={resultsSectionRef}
    status={status}
    bios={bios}
    errorMessage={errorMessage}
    onRegenerate={handleRegenerate}
    onRetry={handleRetry}
  />

  {/* SEO body content — H2 sections */}
  <div className={styles.seoBody}>
    <h2>How the AI Bio Generator Works</h2>
    {/* … */}
    <h2>Bios for Every Platform — Instagram, TikTok, LinkedIn &amp; Twitter</h2>
    {/* … */}
    <h2>Choose Your Tone: Casual, Funny, Professional or Inspirational</h2>
    {/* … */}
    <h2>Why a Great Bio Matters for Content Creators</h2>
    {/* … */}
    <h2>Get 3 Bio Variants and Pick the Best One</h2>
    {/* … */}
    <h2>Tips for Writing the Perfect Social Media Bio</h2>
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
POST /api/generate-bio
Content-Type: application/json
```

### Request Shape

Standard generation (first click of "Generate Bios"):

```typescript
interface GenerateBioRequest {
  platform: string;       // 'instagram' | 'tiktok' | 'linkedin' | 'twitter'
  tone: string;           // 'casual' | 'professional' | 'funny' | 'inspirational'
  niche: string;          // Trimmed, max 100 chars
  traits: string;         // Trimmed, max 150 chars
  regenerate?: boolean;   // Omitted on first call; true on Regenerate clicks
}
```

Regenerate call appends `"regenerate": true` to signal the backend to use a higher temperature (`1.0`) and inject the regenerate modifier into the prompt.

### Fetch Implementation

```typescript
async function fetchBios(
  payload: GenerateBioPayload,
  isRegenerate: boolean
): Promise<void> {
  setStatus('loading');
  setErrorMessage('');

  const body: GenerateBioRequest = {
    ...payload,
    ...(isRegenerate ? { regenerate: true } : {}),
  };

  try {
    const response = await fetch('/api/generate-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = getBioErrorMessage(response.status, data);
      setErrorMessage(message);
      setStatus('error');
      return;
    }

    // Success path
    setBios(data.bios);
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
function getBioErrorMessage(status: number, data: ApiErrorResponse): string {
  if (status === 422) {
    return data.message ?? "We weren't able to generate bios for this content. Please try different inputs.";
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
interface BioResponse {
  bios: Bio[];
}

interface Bio {
  id: number;    // 1 | 2 | 3
  text: string;  // Complete bio string — no separate hashtags field
}
```

There is no `hashtags` field on bio objects. This is an intentional schema difference from the Caption Generator. Do not attempt to read or join a hashtags field.

### Response Shape (Error — HTTP 4xx/5xx)

```typescript
interface ApiErrorResponse {
  error: true;
  code: string;    // e.g. 'RATE_LIMIT_EXCEEDED', 'UNSAFE_CONTENT', 'GENERATION_FAILED'
  message: string; // Human-readable; displayed directly in the error banner
}
```

### Error Message Strings by Status Code

| HTTP Status | Code | Message Shown to User |
|---|---|---|
| 400 | `MISSING_*` / `INVALID_*` | `"Please check your inputs and try again."` |
| 422 | `UNSAFE_CONTENT` | `"We weren't able to generate bios for this content. Please try different inputs."` |
| 429 | `RATE_LIMIT_EXCEEDED` | `"Too many requests. Please wait a moment and try again."` |
| 500 | `GENERATION_FAILED` | `"We couldn't generate bios right now. Please try again."` |
| 503 | `CLAUDE_API_ERROR` / `TIMEOUT` | `"The bio service is temporarily unavailable. Please try again."` |
| Network error | — | `"Something went wrong. Please try again."` |

The frontend always uses `data.message` from the API response when present, falling back to the strings in the table above.

---

## Section 4 — State Management

### State Definitions (in `BioGeneratorPage`)

```typescript
// UI state machine — single source of truth for what is rendered
const [status, setStatus] =
  useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// Bio data — populated on successful response; persists across regenerate cycles
const [bios, setBios] = useState<Bio[]>([]);

// The payload that produced the current (or last attempted) results
// Used by Regenerate and Retry so they do not re-read the form
const [lastPayload, setLastPayload] =
  useState<GenerateBioPayload | null>(null);

// Error message shown in the error banner
const [errorMessage, setErrorMessage] = useState<string>('');

// Ref to the ResultsSection element — used for focus management on success
const resultsSectionRef = useRef<HTMLElement>(null);
```

### State Transitions (matching UIUX state machine)

| Current State | Trigger | Next State | Side Effects |
|---|---|---|---|
| `idle` | User submits valid form | `loading` | Stores payload in `lastPayload`; calls `fetchBios(payload, false)` |
| `loading` | API returns 200 | `success` | Stores bios in `bios`; moves focus to `ResultsSection` |
| `loading` | API returns 4xx/5xx | `error` | Sets `errorMessage`; focus stays on last focused element |
| `loading` | `fetch()` throws (network) | `error` | Sets generic `errorMessage` |
| `success` | User clicks "Regenerate" | `loading` | Calls `fetchBios(lastPayload!, true)` — `lastPayload` is not updated |
| `success` | User clicks "Copy" on a card | (no page-level transition) | `BioCard` internal `copied` state toggles; resets after 2s |
| `error` | User clicks "Try Again" | `loading` | Calls `fetchBios(lastPayload!, false)` |
| Any | User modifies form, re-submits | `loading` | Updates `lastPayload` with new values |

### Per-Card Copied State (in `BioCard`)

```typescript
// Isolated per card instance — three cards = three independent state atoms
const [copied, setCopied] = useState<boolean>(false);
```

Transition: `false` → `true` on copy button click → `false` after 2000ms setTimeout.

### State Visibility Mapping

| `status` value | Form | AdSlot | Skeleton cards | Real bio cards | Regenerate button | Error banner |
|---|---|---|---|---|---|---|
| `idle` | Visible | In DOM, opacity 0 | Hidden | Hidden | Hidden | Hidden |
| `loading` | Visible, button disabled | Visible | Visible | Hidden | Hidden | Hidden |
| `success` | Visible | Visible | Hidden | Visible | Visible | Hidden |
| `error` | Visible | Visible | Hidden | Hidden | Hidden | Visible |

---

## Section 5 — SEO Implementation

### Next.js Metadata API

**File:** `app/bio-generator/page.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Bio Generator — Free & Instant | Creator Tool AI',
  description:
    'Generate 3 ready-to-use social media bios for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.',
  openGraph: {
    title: 'AI Bio Generator — Free & Instant | Creator Tool AI',
    description:
      'Generate 3 ready-to-use social media bios for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.',
    url: 'https://creatortoola.com/bio-generator',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bio Generator — Free & Instant | Creator Tool AI',
    description:
      'Generate 3 ready-to-use social media bios for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.',
  },
  alternates: {
    canonical: '/bio-generator',
  },
};
```

**Title tag (exact string from `docs/seo-bio-generator.md` Section 3):**
```
AI Bio Generator — Free & Instant | Creator Tool AI
```
Character count: 53. Under the 60-character limit.

**Meta description (exact string from `docs/seo-bio-generator.md` Section 4):**
```
Generate 3 ready-to-use social media bios for Instagram, TikTok, LinkedIn & Twitter in seconds. Free AI tool — pick your tone and copy instantly.
```
Character count: 149. Under the 155-character limit.

### H1 (exact string from `docs/seo-bio-generator.md` Section 5)

```html
<h1>Free AI Bio Generator for Social Media</h1>
```

This H1 must not be paraphrased. It contains the primary keyword `AI bio generator` and the high-intent qualifier `Free`.

### Intro Paragraph (exact copy from `docs/seo-bio-generator.md` Section 7)

Rendered as a `<p>` directly below the H1, verbatim:

> Your social media bio is the first thing people read — and most creators struggle to write one that actually converts. This free AI bio generator creates three ready-to-use bio variants for Instagram, TikTok, LinkedIn, and Twitter in seconds. Just enter your niche, choose your tone, add a few key traits, and let the AI write your bio. Copy your favorite with one click. No sign-up. No cost. Just a bio that sounds like you.

### H2 Sections (below the tool, in order from `docs/seo-bio-generator.md` Section 6)

```html
<h2>How the AI Bio Generator Works</h2>
<h2>Bios for Every Platform — Instagram, TikTok, LinkedIn &amp; Twitter</h2>
<h2>Choose Your Tone: Casual, Funny, Professional or Inspirational</h2>
<h2>Why a Great Bio Matters for Content Creators</h2>
<h2>Get 3 Bio Variants and Pick the Best One</h2>
<h2>Tips for Writing the Perfect Social Media Bio</h2>
<h2>More Free AI Tools for Creators</h2>
```

H2 sections are rendered below the `ResultsSection` in the page-level JSX. They are static HTML — no React state involved.

### Internal Links (from `docs/seo-bio-generator.md` Section 8)

Links to place within H2 section body copy:

| Anchor Text | Target | H2 Section |
|---|---|---|
| "generate captions to match your bio voice" | `/caption-generator` | How the AI Bio Generator Works |
| "find hashtags that fit your niche" | `/hashtag-generator` | Tips for Writing the Perfect Social Media Bio |
| "get content ideas that align with your bio" | `/post-idea-generator` | More Free AI Tools for Creators |

All internal links use Next.js `<Link>` component, not `<a>` tags.

---

## Section 6 — Copy-to-Clipboard

### Full Implementation (inside `BioCard.tsx`)

```typescript
const COPY_RESET_MS = 2000;

const handleCopy = async () => {
  // Bio text is already a single complete string — pass directly.
  // There is no hashtags array to join; no concatenation is performed.
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    // Auto-reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, COPY_RESET_MS);

  } catch (err) {
    // navigator.clipboard is unavailable (non-HTTPS, old browser)
    // Fallback: legacy execCommand (deprecated but supported)
    const textArea = document.createElement('textarea');
    textArea.value = text;
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
{bio.text}
```

The full bio text is passed directly to `writeText`. There is no string concatenation step — no hashtags field exists on bio response objects. This is the key difference from the Caption Generator, which appends `"\n" + hashtags.join(" ")`.

### Button State Transitions

| State | Button Label | Icon | `aria-label` |
|---|---|---|---|
| Default | `Copy` | None | `"Copy bio {index}"` |
| Copied (2s window) | `Copied!` | Checkmark (`#10B981`) | `"Bio copied to clipboard"` |
| After 2s | `Copy` | None | `"Copy bio {index}"` |

### Per-Card Independence

Each `BioCard` instance maintains its own `copied` state atom via `useState`. There is no shared clipboard state at the page or `ResultsSection` level. Clicking Copy on Bio 2 does not affect the `copied` state of Bios 1 or 3.

---

## Section 7 — Loading Skeleton

### Skeleton Structure

When `status === 'loading'`, three `<BioCard isSkeleton={true} />` instances are rendered. Each skeleton card contains:

- One narrow bar (simulating the "Bio N" heading)
- Two full-width bars (simulating body text lines)
- One short bar at 30% width (simulating the character count badge area — shorter than the body lines, not a hashtag line)

### CSS Shimmer Animation

**File:** `styles/bio-generator/BioCard.module.css`

The `@keyframes shimmer` definition is copied from `styles/caption-generator/CaptionCard.module.css` into this file. CSS Modules scope keyframe names locally, so both files must each contain the definition. Do not attempt to import across module files.

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
  width: 60px;       /* Narrow — matches "Bio N" label width */
  height: 14px;
  margin-bottom: 16px;
}

.skeletonBarShort {
  width: 30%;        /* Badge area — short bar simulating char count badge */
  margin-bottom: 0;
}

/* The skeleton card container */
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
  aria-hidden="true"        /* Hidden from screen readers — content not meaningful */
  aria-label="Loading bio"
>
```

The three skeleton cards are collectively hidden from assistive technology. Screen readers instead hear the `aria-live="polite"` region in `ResultsSection` announce `"3 bios generated."` when content arrives.

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

**Validation rules and messages (from `docs/uiux-bio-generator.md` Section 11.3):**

| Field | Condition | Inline Message |
|---|---|---|
| Platform | Unselected on blur | "Please select a platform" |
| Tone | Unselected on blur | "Please select a tone" |
| Niche | Empty on blur | "Please describe your niche or profession" |
| Niche | Exceeds 100 chars | "100 character maximum" (also blocked by `maxLength`) |
| Traits | Empty on blur | "Please list at least one key trait" |
| Traits | Exceeds 150 chars | "150 character maximum" (also blocked by `maxLength`) |

**ARIA wiring for field errors:**

Each field input has `aria-describedby` pointing to its error `<span>` ID and `aria-invalid="true"` when an error is active. Error spans have `role="alert"` and `aria-live="polite"` so screen readers announce the message immediately on blur.

### 8.2 API Error Banner

Rendered inside `ResultsSection` when `status === 'error'`. The form card remains fully editable and functional so users can adjust inputs and resubmit.

**Visual spec (from `docs/uiux-bio-generator.md` Section 6):**

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
- Behavior: Calls `fetchBios(lastPayload!, false)` — identical to the original request (not a regenerate).
- Min touch target: 44 × 44px.

---

## Section 9 — Accessibility

### 9.1 ARIA Attributes

| Element | ARIA Attributes | Notes |
|---|---|---|
| `<form>` | `role="form"` `aria-label="Bio generator"` | Provides a labelled landmark for screen readers |
| Platform `<select>` | `aria-required="true"` `aria-describedby="platform-error"` `aria-invalid={platformError !== ''}` | Links to error span |
| Tone `<select>` | `aria-required="true"` `aria-describedby="tone-error"` `aria-invalid={toneError !== ''}` | Links to error span |
| Niche `<input>` | `aria-required="true"` `aria-describedby="niche-counter niche-error"` `aria-invalid={nicheError !== ''}` | Links to both the char counter and the error span |
| Traits `<input>` | `aria-required="true"` `aria-describedby="traits-counter traits-error"` `aria-invalid={traitsError !== ''}` | Links to both the char counter and the error span |
| Field error `<span>` | `role="alert"` `aria-live="polite"` | Announces inline error on blur without focus move |
| Generate button (loading) | `aria-busy="true"` `aria-disabled="true"` | Communicates busy state to AT |
| Generate button (form invalid) | `aria-disabled="true"` | Button is disabled; AT reads reason via field errors |
| Spinner SVG | `aria-hidden="true"` | Decorative; button text label carries meaning |
| Results `<section>` | `aria-hidden={status === 'idle'}` | Hides empty section from AT on initial load |
| `aria-live` region (results) | `aria-live="polite"` `aria-atomic="true"` | Announces "3 bios generated." on success |
| Error banner | `role="alert"` | Announces immediately on error — no focus move needed |
| Copy button (default) | `aria-label="Copy bio {index}"` | Distinguishes three buttons for AT |
| Copy button (copied state) | `aria-label="Bio copied to clipboard"` | Confirms action for AT users |
| Character count badge | `aria-label="{n} characters"` | e.g. `aria-label="148 characters"` — provides accessible count for screen readers |
| Skeleton cards | `aria-hidden="true"` | Loading placeholders are not meaningful content |
| Checkmark icon | `aria-hidden="true"` | Decorative; button label carries meaning |
| Warning icon | `aria-hidden="true"` | Decorative; error message `<p>` carries meaning |
| Ad slot | `role="complementary"` `aria-label="Advertisement"` | Identifies as supplementary content (defined in imported AdSlot component) |

### 9.2 Focus Management

**Initial page load:** Focus is not moved programmatically. The browser's default focus starts at the first focusable element (Platform select) when the user tabs in.

**On successful bio generation:** Focus is moved to the `ResultsSection` `<section>` element programmatically:

```typescript
// In BioGeneratorPage, after setStatus('success')
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
1. Platform select
2. Tone select
3. Niche input
4. Traits input
5. Generate Bios button
   — [Tab into results section after successful generation] —
6. Copy button (Bio 1)
7. Copy button (Bio 2)
8. Copy button (Bio 3)
9. Regenerate button
   — [Tab continues to SEO body content links and footer] —
```

No `tabindex` values above 0 are used. Positive `tabindex` is not permitted.

### 9.4 Focus Ring

All focusable elements use a visible focus indicator (inherited from `globals.css`):

```css
:focus-visible {
  outline: 2px solid #6366F1;   /* --color-primary */
  outline-offset: 2px;
}
```

The `:focus-visible` pseudo-class ensures the ring only appears for keyboard navigation, not mouse clicks.

### 9.5 Colour Contrast Compliance (WCAG 2.1 AA)

| Element | Foreground | Background | Ratio | Pass |
|---|---|---|---|---|
| Body text | #111827 | #F9FAFB | 18.1:1 | AA |
| Generate button | #FFFFFF | #6366F1 | 5.2:1 | AA |
| Error text | #991B1B | #FEF2F2 | 7.1:1 | AA |
| Character count badge | #6B7280 | #F3F4F6 | 4.6:1 | AA |
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

### CSS Variables

All tokens are inherited from `app/globals.css`. No new tokens are introduced. All new CSS modules reference the existing variables via `var(--token-name)` — do not redeclare.

Reference: `docs/uiux-bio-generator.md` Section 10.

### Page Layout (`BioGeneratorPage.module.css`)

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

### Form Card (`BioForm.module.css`)

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

.textInput {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 15px;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  box-sizing: border-box;
}

.textInput:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 0;
  border-color: var(--color-primary);
}

.counterRow {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 4px;
}

.counter {
  font-size: 12px;
  font-weight: 400;
  color: #9CA3AF;
  white-space: nowrap;
}

.counterRed {
  font-size: 12px;
  font-weight: 400;
  color: #EF4444;
  white-space: nowrap;
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
  margin-top: 8px;
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
    padding: 16px;
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
    grid-template-columns: 1fr 1fr;   /* Platform + Tone side-by-side */
    gap: 16px;
  }
}
```

### Bio Cards and Results (`ResultsSection.module.css` and `BioCard.module.css`)

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

/* BioCard.module.css */

.bioCard {
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
  gap: 8px;
}

.bioLabel {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  flex-shrink: 0;
}

.charCountBadge {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);   /* #6B7280 */
  background: #F3F4F6;
  border-radius: 4px;
  padding: 4px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0 0 12px;
}

.bioText {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;   /* Preserve line breaks in bio text (e.g. Instagram \n) */
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
  flex-shrink: 0;
}

.copyButton:hover {
  background: #F9FAFB;
}

.copyButtonCopied {
  color: var(--color-success);
  border-color: var(--color-success);
}
```

Note on `white-space: pre-wrap` on `.bioText`: Instagram bios may contain `\n` line breaks returned in the bio text. This CSS property renders them as visible line breaks in the browser without requiring `dangerouslySetInnerHTML`.

### Breakpoint Summary Table

| Breakpoint | Key Layout Changes |
|---|---|
| `< 480px` | Form padding: 16px; H1: 28px; Platform + Tone: stacked; char count badge wraps below bio label |
| `480px – 767px` | Single column; Platform + Tone: stacked; Ad slot: 320 × 50 |
| `768px – 1023px` | Single column; max-width 680px centered; Ad slot: 728 × 90 |
| `≥ 1024px` | Platform + Tone dropdowns: 2-column grid; Niche + Traits remain full-width; max-width 720px centered; Ad slot: 728 × 90 |

BioCards are always full-width within the `ResultsSection` container at all breakpoints — no multi-column card grid is used.

---

## Section 11 — Reuse Map

This section explicitly documents every asset and its source to prevent duplication or incorrect imports.

### Imported Directly (no duplication)

| Asset | Source Path | Used In | Notes |
|---|---|---|---|
| `AdSlot` component | `components/caption-generator/AdSlot.tsx` | `components/bio-generator/ResultsSection.tsx` | Import unchanged. Zero modifications. |
| CSS design tokens | `app/globals.css` (`:root` variables) | All new CSS modules | All `var(--color-*)` and `var(--font-stack)` tokens. Do not redeclare. |
| Rate limiter middleware | `middleware/rateLimiter.ts` | `app/api/generate-bio/route.ts` | Backend concern — referenced for completeness. |
| Blocklist utility | `lib/caption-generator/blocklist.ts` | `app/api/generate-bio/route.ts` | Backend concern — referenced for completeness. |

### New Files (built from scratch)

| New file | Reason not reused from Caption Generator |
|---|---|
| `components/bio-generator/BioForm.tsx` | Different fields: platform + tone + niche (text, max 100) + traits (text, max 150). No topic textarea. No hashtag count. Different field count, layout, and validation messages. |
| `components/bio-generator/BioCard.tsx` | No hashtags sub-field. Char count badge in card header. Copy writes `bio.text` directly — no join. Different JSX structure. |
| `components/bio-generator/ResultsSection.tsx` | Uses `BioCard` (not `CaptionCard`). Announces "3 bios generated." Live region. Same `AdSlot` import but different card type. |
| `app/bio-generator/page.tsx` | Different route, different state shape (`bios[]` vs `captions[]`), different SEO metadata, different H1 and intro, different H2 order. |
| `lib/bio-generator/types.ts` | `Bio` type has no `hashtags` property. `GenerateBioPayload` has `niche` and `traits` fields, not `topic` and `hashtag_count`. |
| `styles/bio-generator/BioForm.module.css` | Bio-specific layout: no textarea, 2 text inputs with own char counters; dropdown row and breakpoints match bio form structure. |
| `styles/bio-generator/BioCard.module.css` | Char count badge styles; no hashtag row styles; `white-space: pre-wrap` on bio text; shimmer bars sized for bio card (2 body bars + 1 short badge bar, not hashtag bar). |
| `styles/bio-generator/ResultsSection.module.css` | Structurally identical to caption version but scoped to bio nomenclature. |
| `styles/bio-generator/BioGeneratorPage.module.css` | Same structure as `CaptionGeneratorPage.module.css` — separate scoped copy to avoid cross-feature coupling. |

### Not Reused (per `tasks/task-002-bio-generator.md` reuse notes)

| Caption Generator asset | Disposition |
|---|---|
| `components/caption-generator/CaptionForm.tsx` | Do NOT import. Build `BioForm.tsx` from scratch. |
| `components/caption-generator/CaptionCard.tsx` | Do NOT import. Build `BioCard.tsx` from scratch. |
| `components/caption-generator/ResultsSection.tsx` | Do NOT import. Build `components/bio-generator/ResultsSection.tsx` from scratch. |
| `lib/caption-generator/types.ts` | Do NOT import. Create `lib/bio-generator/types.ts` with bio-specific schemas. PLATFORMS and TONES enums may be copied as local constants. |
| `lib/caption-generator/platformGuidance.ts` | Do NOT import. Bio-specific guidance is in `lib/bio-generator/platformGuidance.ts`. |
| `lib/caption-generator/toneGuidance.ts` | Do NOT import. Bio-specific guidance is in `lib/bio-generator/toneGuidance.ts`. |

---

## Acceptance Criteria Checklist

Cross-referenced from `tasks/task-002-bio-generator.md`:

- [ ] Form validates all required fields before submission — inline errors on blur; Generate button disabled until all four fields are valid
- [ ] API returns exactly 3 bio variants — enforced by backend; frontend renders whatever is in `bios[]` (always 3)
- [ ] Each bio is a single text string (no separate hashtags field) — `BioCard` renders only `text`; no hashtags `<p>` element exists
- [ ] Copy button copies the full bio text to clipboard — `bio.text` passed directly to `navigator.clipboard.writeText()`; no concatenation
- [ ] Regenerate triggers a new API call with the same inputs — `handleRegenerate` uses `lastPayload` with `regenerate: true`; does not re-read form
- [ ] Loading state (skeleton) is visible during API call — skeleton cards + disabled Generate button with "Generating…" label and spinner
- [ ] Error state shown if API fails (with retry option) — error banner with `role="alert"` and "Try Again" button
- [ ] Page has correct SEO title, meta description, and H1 — `generateMetadata` export + verbatim H1 and intro paragraph in page JSX
- [ ] Ad slot placeholder renders above the results section — `AdSlot` (imported from caption-generator) rendered inside `ResultsSection`, always in DOM
- [ ] Mobile responsive (single-column layout on < 768px) — CSS Module breakpoints; stacked layout is the mobile-first default
- [ ] Response time < 5 seconds under normal conditions — frontend introduces no additional delay; backend Claude timeout is 15s
- [ ] Character count shown on each bio result — `charCountBadge` displays `{text.length} chars`, derived client-side from API response string

---

*Document produced by the Frontend agent. All upstream dependency gates cleared (UIUX: `docs/uiux-bio-generator.md`, SEO: `docs/seo-bio-generator.md`, Backend: `features/backend-bio-generator.md`). This file is the implementation reference for building `app/bio-generator/page.tsx` and its constituent components.*
