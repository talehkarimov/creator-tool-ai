import { Bio, Platform, resolveCharLimit } from "./types";

interface ValidateOptions {
  bios: Bio[];
  platform: Platform;
  char_limit: number;
}

export type ValidationResult =
  | { ok: true; bios: Bio[] }
  | { ok: false; reason: "wrong_count" | "invalid_text" };

export function validateBios(options: ValidateOptions): ValidationResult {
  const { bios, platform, char_limit } = options;
  const limit = resolveCharLimit(platform, char_limit);

  if (bios.length !== 3) {
    return { ok: false, reason: "wrong_count" };
  }

  const validated: Bio[] = [];

  for (let i = 0; i < bios.length; i++) {
    const bio = bios[i];

    if (!bio.text || typeof bio.text !== "string" || bio.text.trim().length === 0) {
      return { ok: false, reason: "invalid_text" };
    }

    // Strip any rogue hashtags field (regression guard — bios schema has no hashtags)
    const { text } = bio as Bio & { hashtags?: unknown };

    // Truncate at last complete word before limit
    let finalText = text;
    if (finalText.length > limit) {
      const truncated = finalText.slice(0, limit);
      const lastSpace = truncated.lastIndexOf(" ");
      finalText = (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "…";
    }

    validated.push({ id: i + 1, text: finalText });
  }

  return { ok: true, bios: validated };
}
