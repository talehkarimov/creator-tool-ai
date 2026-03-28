import { Caption, Platform, PLATFORM_TEXT_LIMITS } from "./types";

const HASHTAG_IN_TEXT = /#\w+/g;

interface ValidateOptions {
  captions: Caption[];
  hashtag_count: number;
  platform: Platform;
}

export type ValidationResult =
  | { ok: true; captions: Caption[] }
  | { ok: false; reason: "wrong_count" | "hashtag_mismatch" | "invalid_text" };

export function validateCaptions(options: ValidateOptions): ValidationResult {
  const { captions, hashtag_count, platform } = options;
  const limit = PLATFORM_TEXT_LIMITS[platform];

  if (captions.length !== 3) {
    return { ok: false, reason: "wrong_count" };
  }

  const validated: Caption[] = [];

  for (let i = 0; i < captions.length; i++) {
    const cap = captions[i];

    if (!cap.text || typeof cap.text !== "string") {
      return { ok: false, reason: "invalid_text" };
    }

    // Strip stray hashtags from text field
    let text = cap.text.replace(HASHTAG_IN_TEXT, "").trim();

    // Truncate to platform limit at last sentence boundary
    if (text.length > limit) {
      const truncated = text.slice(0, limit);
      const lastSentence = truncated.search(/[.!?][^.!?]*$/);
      text = lastSentence > 0 ? truncated.slice(0, lastSentence + 1) + "…" : truncated + "…";
    }

    // Normalize hashtags: ensure each starts with #
    const hashtags = (cap.hashtags ?? []).map((tag) =>
      typeof tag === "string" && !tag.startsWith("#") ? `#${tag}` : tag
    );

    if (hashtags.length !== hashtag_count) {
      return { ok: false, reason: "hashtag_mismatch" };
    }

    validated.push({ id: i + 1, text, hashtags });
  }

  return { ok: true, captions: validated };
}
