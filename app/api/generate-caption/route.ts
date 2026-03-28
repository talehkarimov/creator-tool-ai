import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { GenerateCaptionSchema } from "@/lib/caption-generator/types";
import { buildUserMessage } from "@/lib/caption-generator/buildPrompt";
import { callClaude } from "@/lib/caption-generator/callClaude";
import { parseClaudeResponse } from "@/lib/caption-generator/parseResponse";
import { validateCaptions } from "@/lib/caption-generator/validateCaption";
import { enforceTwitterBudget } from "@/lib/caption-generator/twitterBudget";
import { isBlocked } from "@/lib/caption-generator/blocklist";
import { checkRateLimit } from "@/middleware/rateLimiter";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function errorResponse(
  code: string,
  message: string,
  status: number,
  extra?: Record<string, string | number>
) {
  return NextResponse.json({ error: true, code, message }, { status, headers: extra });
}

export async function POST(req: NextRequest) {
  // 1. Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  // 2. Validate inputs with Zod
  let input: ReturnType<typeof GenerateCaptionSchema.parse>;
  try {
    input = GenerateCaptionSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.errors[0];
      const field = first.path[0] as string;
      const isPresenceError = first.code === "invalid_type" && first.received === "undefined";
      const prefix = isPresenceError ? "MISSING" : "INVALID";
      const code = `${prefix}_${field.toUpperCase()}`;
      return errorResponse(code, first.message, 400);
    }
    return errorResponse("VALIDATION_ERROR", "Invalid request.", 400);
  }

  const { topic, platform, tone, hashtag_count = 5, regenerate = false } = input;

  // 3. Topic: trim whitespace check
  if (topic.trim().length === 0) {
    return errorResponse("MISSING_TOPIC", "topic is required", 400);
  }

  // 4. Blocklist pre-check
  if (isBlocked(topic)) {
    return errorResponse(
      "UNSAFE_TOPIC",
      "We weren't able to generate captions for this topic. Please try a different topic.",
      422
    );
  }

  // 5. Rate limiting
  const ip = getClientIp(req);
  const rateResult = checkRateLimit(ip);

  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: true,
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.retryAfter),
          "X-RateLimit-Limit": String(10),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateResult.reset),
        },
      }
    );
  }

  // 6. Build prompt and call Claude (with one retry on validation failure)
  let retryInstruction: string | undefined;

  for (let attempt = 0; attempt <= 1; attempt++) {
    const userMessage = buildUserMessage({
      topic,
      platform,
      tone,
      hashtag_count,
      regenerate,
      retryInstruction,
    });

    let rawResponse: string;
    try {
      rawResponse = await callClaude({ userMessage, regenerate });
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.toLowerCase().includes("abort"));
      if (isTimeout) {
        return errorResponse(
          "TIMEOUT",
          "The request took too long. Please try again.",
          503
        );
      }
      console.error("[generate-caption] Claude API error:", err);
      return errorResponse(
        "CLAUDE_API_ERROR",
        "The caption service is temporarily unavailable. Please try again.",
        503
      );
    }

    // 7. Parse Claude's response
    const parsed = parseClaudeResponse(rawResponse);

    if (!parsed.ok) {
      if (parsed.reason === "safety_refusal") {
        return errorResponse(
          "UNSAFE_TOPIC",
          "We weren't able to generate captions for this topic. Please try a different topic.",
          422
        );
      }
      if (parsed.reason === "json_parse") {
        retryInstruction =
          "IMPORTANT: Your previous response could not be parsed as JSON. Return only a valid JSON object. Do not include any text, explanation, markdown, or code fences outside the JSON. Start your response with { and end with }.";
        continue;
      }
      if (parsed.reason === "wrong_count") {
        retryInstruction =
          "IMPORTANT: You must return exactly 3 captions in the captions array — no more, no fewer. Your previous response did not contain exactly 3 items.";
        continue;
      }
    }

    if (!parsed.ok) break; // Should not reach here, but guard

    // 8. Validate per-caption fields
    const validated = validateCaptions({
      captions: parsed.captions,
      hashtag_count,
      platform,
    });

    if (!validated.ok) {
      if (validated.reason === "wrong_count") {
        retryInstruction =
          "IMPORTANT: You must return exactly 3 captions in the captions array — no more, no fewer. Your previous response did not contain exactly 3 items.";
        continue;
      }
      if (validated.reason === "hashtag_mismatch") {
        retryInstruction = `IMPORTANT: The hashtags array for each caption must contain exactly ${hashtag_count} items. Count carefully before responding.`;
        continue;
      }
      // invalid_text — retry generically
      retryInstruction =
        "IMPORTANT: Each caption must have a non-empty text field. Please ensure all 3 captions have valid text.";
      continue;
    }

    // 9. Twitter budget enforcement
    let captions = validated.captions;
    if (platform === "twitter") {
      captions = enforceTwitterBudget(captions);
    }

    // 10. Return success
    return NextResponse.json(
      { captions },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(10),
          "X-RateLimit-Remaining": String(rateResult.remaining),
          "X-RateLimit-Reset": String(rateResult.reset),
        },
      }
    );
  }

  // All retries exhausted
  console.error("[generate-caption] Generation failed after retries");
  return errorResponse(
    "GENERATION_FAILED",
    "We couldn't generate captions right now. Please try again.",
    500
  );
}
