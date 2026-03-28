import { Caption } from "./types";

export type ParseResult =
  | { ok: true; captions: Caption[] }
  | { ok: false; reason: "json_parse" | "wrong_count" | "safety_refusal" };

export function parseClaudeResponse(raw: string): ParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    return { ok: false, reason: "json_parse" };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, reason: "json_parse" };
  }

  // Safety refusal from Claude
  if ("error" in parsed && (parsed as Record<string, unknown>).error === true) {
    return { ok: false, reason: "safety_refusal" };
  }

  const obj = parsed as Record<string, unknown>;

  if (!Array.isArray(obj.captions)) {
    return { ok: false, reason: "wrong_count" };
  }

  if (obj.captions.length !== 3) {
    return { ok: false, reason: "wrong_count" };
  }

  return { ok: true, captions: obj.captions as Caption[] };
}
