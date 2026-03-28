import { Platform, Tone, resolveCharLimit } from "./types";
import { PLATFORM_GUIDANCE } from "./platformGuidance";
import { TONE_GUIDANCE } from "./toneGuidance";

export const SYSTEM_PROMPT = `You are an expert social media profile writer. Your only job is to write social media bios for content creators.

Rules you must follow without exception:
1. Always return exactly 3 bio variants — no more, no fewer.
2. Always return valid JSON matching the exact schema provided. Never add prose, explanation, or markdown outside the JSON block.
3. Each bio must be unique in structure, angle, and phrasing. Do not produce three versions of the same sentence or the same identity framing.
4. Tailor every bio to the target platform's culture, character limits, and profile conventions.
5. Match the requested tone precisely. Do not blend tones unless explicitly instructed.
6. Each bio is a single cohesive text string. There is no separate hashtags field. If hashtags are appropriate for the platform, embed them naturally within the bio text.
7. The bio text must not exceed the char_limit value provided. If char_limit is 0, apply the platform's default recommended maximum length.
8. Do not include the creator's name or any placeholder like "[Your Name]" in the bio — the user will add their own name if desired.
9. Do not produce bios that contain hate speech, harassment, explicit sexual content, self-harm glorification, or instructions for illegal activity. If the niche or traits imply any of these, return: {"error":true,"code":"UNSAFE_CONTENT","message":"The content provided cannot be used to generate bios."}
10. Do not add commentary about the inputs, the user, or your own output. Return only the JSON.`;

interface BuildPromptOptions {
  platform: Platform;
  tone: Tone;
  niche: string;
  traits: string;
  char_limit: number;
  regenerate?: boolean;
  retryInstruction?: string;
}

export function buildUserMessage(options: BuildPromptOptions): string {
  const { platform, tone, niche, traits, char_limit, regenerate, retryInstruction } = options;

  const displayPlatform: Record<Platform, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    twitter: "Twitter/X",
  };

  const displayTone: Record<Tone, string> = {
    casual: "Casual",
    professional: "Professional",
    funny: "Funny",
    inspirational: "Inspirational",
  };

  // Sanitize: strip URLs, truncate
  const sanitize = (s: string, max: number) =>
    s.replace(/https?:\/\/\S+/g, "[link removed]").slice(0, max).trim();

  const safeNiche = sanitize(niche, 100);
  const safeTraits = sanitize(traits, 150);

  const effectiveLimit = resolveCharLimit(platform, char_limit);

  const shortInputNote =
    safeNiche.length <= 3 || safeTraits.length <= 3
      ? "\nNote: One or more inputs are very short. Use reasonable creative interpretation to build a complete, coherent bio around the information provided."
      : "";

  const platformGuidance = PLATFORM_GUIDANCE[platform];
  const toneGuidance = TONE_GUIDANCE[tone][platform];

  let message = `Generate 3 social media bios using the following inputs:

- Platform: ${displayPlatform[platform]}
- Tone: ${displayTone[tone]}
- Niche / Profession: ${safeNiche}
- Key traits: ${safeTraits}
- Character limit: ${effectiveLimit}${shortInputNote}

Platform-specific guidance:
${platformGuidance}

Tone-specific guidance:
${toneGuidance}

Return your response as a single JSON object matching this exact schema:
{
  "bios": [
    { "id": 1, "text": "..." },
    { "id": 2, "text": "..." },
    { "id": 3, "text": "..." }
  ]
}

Each "text" value must be a single string no longer than ${effectiveLimit} characters (0 means use the platform default maximum). Do not include any text outside the JSON object.`;

  if (regenerate) {
    message +=
      "\n\nImportant: This is a regeneration request. The previous response has already been shown to the user. You must produce 3 entirely new bios that differ meaningfully from a typical first response. Use different angles, different structures, and different hooks on the same identity. Do not repeat any phrase or framing from the most obvious interpretation of these inputs.";
  }

  if (retryInstruction) {
    message += `\n\n${retryInstruction}`;
  }

  return message;
}
