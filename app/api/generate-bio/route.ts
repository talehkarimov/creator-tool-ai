import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { GenerateBioSchema } from "@/lib/bio-generator/types";
import { buildUserMessage } from "@/lib/bio-generator/buildPrompt";
import { parseClaudeResponse } from "@/lib/bio-generator/parseResponse";
import { validateBios } from "@/lib/bio-generator/validateBio";
import { isBlocked } from "@/lib/caption-generator/blocklist";
import { checkRateLimit } from "@/middleware/rateLimiter";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/bio-generator/buildPrompt";

const MOCK_MODE = process.env.MOCK_AI === "true";

const MOCK_RESPONSE = JSON.stringify({
  bios: [
    {
      id: 1,
      text: "Fitness coach turning everyday people into marathon finishers 🏅\nDog walks. Black coffee. Big goals.\n⬇️ Your first race starts here",
    },
    {
      id: 2,
      text: "I run 26.2 miles so I know you can run one more rep 💪\nCoaching bodies & mindsets | Dog mom | Fueled by espresso ☕",
    },
    {
      id: 3,
      text: "Certified coach. Marathon runner. Proof that consistency beats talent every time 🔥\nBringing the dog, the coffee & the plan 👇",
    },
  ],
});

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5";
const MAX_TOKENS = 400;
const TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS ?? "15000", 10);
const BASE_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE ?? "0.9");
const REGEN_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE_REGEN ?? "1.0");

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: true, code, message }, { status });
}

async function callClaude(userMessage: string, regenerate: boolean): Promise<string> {
  if (MOCK_MODE) {
    console.log("[generate-bio] MOCK_AI=true — returning mock response");
    await new Promise((r) => setTimeout(r, 1200));
    return MOCK_RESPONSE;
  }

  const temperature = regenerate ? REGEN_TEMPERATURE : BASE_TEMPERATURE;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      },
      { signal: controller.signal }
    );
    const block = response.content[0];
    if (block.type !== "text") throw new Error("Unexpected response content type from Claude");
    return block.text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  // 2. Validate with Zod
  let input: ReturnType<typeof GenerateBioSchema.parse>;
  try {
    input = GenerateBioSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.errors[0];
      const field = first.path[0] as string;
      const isPresenceError = first.code === "invalid_type" && first.received === "undefined";
      const code = `${isPresenceError ? "MISSING" : "INVALID"}_${field.toUpperCase()}`;
      return errorResponse(code, first.message, 400);
    }
    return errorResponse("VALIDATION_ERROR", "Invalid request.", 400);
  }

  const { platform, tone, niche, traits, char_limit = 0, regenerate = false } = input;

  // 3. Whitespace checks
  if (!niche.trim()) return errorResponse("MISSING_NICHE", "niche is required", 400);
  if (!traits.trim()) return errorResponse("MISSING_TRAITS", "traits is required", 400);

  // 4. Blocklist — check both niche and traits
  if (isBlocked(niche) || isBlocked(traits)) {
    return errorResponse(
      "UNSAFE_CONTENT",
      "We weren't able to generate bios for this content. Please try different inputs.",
      422
    );
  }

  // 5. Rate limit
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
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateResult.reset),
        },
      }
    );
  }

  // 6. Call Claude with one retry on validation failure
  let retryInstruction: string | undefined;

  for (let attempt = 0; attempt <= 1; attempt++) {
    const userMessage = buildUserMessage({
      platform,
      tone,
      niche,
      traits,
      char_limit,
      regenerate,
      retryInstruction,
    });

    let rawResponse: string;
    try {
      rawResponse = await callClaude(userMessage, regenerate);
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.toLowerCase().includes("abort"));
      if (isTimeout) {
        return errorResponse("TIMEOUT", "The request took too long. Please try again.", 503);
      }
      console.error("[generate-bio] Claude API error:", err);
      return errorResponse(
        "CLAUDE_API_ERROR",
        "The bio service is temporarily unavailable. Please try again.",
        503
      );
    }

    // 7. Parse
    const parsed = parseClaudeResponse(rawResponse);

    if (!parsed.ok) {
      if (parsed.reason === "safety_refusal") {
        return errorResponse(
          "UNSAFE_CONTENT",
          "We weren't able to generate bios for this content. Please try different inputs.",
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
          "IMPORTANT: You must return exactly 3 bios in the bios array — no more, no fewer. Your previous response did not contain exactly 3 items.";
        continue;
      }
    }

    if (!parsed.ok) break;

    // 8. Validate per-bio fields
    const validated = validateBios({ bios: parsed.bios, platform, char_limit });

    if (!validated.ok) {
      if (validated.reason === "wrong_count") {
        retryInstruction =
          "IMPORTANT: You must return exactly 3 bios in the bios array — no more, no fewer.";
        continue;
      }
      retryInstruction =
        "IMPORTANT: Each bio must have a non-empty text field. Please ensure all 3 bios have valid text content.";
      continue;
    }

    // 9. Success
    return NextResponse.json(
      { bios: validated.bios },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": String(rateResult.remaining),
          "X-RateLimit-Reset": String(rateResult.reset),
        },
      }
    );
  }

  console.error("[generate-bio] Generation failed after retries");
  return errorResponse(
    "GENERATION_FAILED",
    "We couldn't generate bios right now. Please try again.",
    500
  );
}
