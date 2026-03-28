import { Platform, Tone } from "./types";
import { PLATFORM_GUIDANCE } from "./platformGuidance";
import { TONE_GUIDANCE } from "./toneGuidance";

export const SYSTEM_PROMPT = `You are an expert social media copywriter. Your only job is to write social media captions for content creators.

Rules you must follow without exception:
1. Always return exactly 3 caption variants — no more, no fewer.
2. Always return valid JSON matching the exact schema provided. Never add prose, explanation, or markdown outside the JSON block.
3. Each caption must be unique in structure, opening hook, and phrasing. Do not produce three versions of the same sentence.
4. Tailor every caption to the target platform's culture, character limits, and audience expectations.
5. Match the requested tone precisely. Do not blend tones unless explicitly instructed.
6. Include exactly the number of hashtags specified by hashtag_count. If hashtag_count is 0, return an empty array for hashtags.
7. Hashtags must be relevant, specific, and cased in standard hashtag style (e.g., #ContentCreator, not #contentcreator or #CONTENTCREATOR).
8. Never include hashtags inside the text field. Hashtags belong only in the hashtags array.
9. Do not produce captions that contain hate speech, harassment, explicit sexual content, self-harm glorification, or instructions for illegal activity. If the input topic implies any of these, return: {"error":true,"code":"UNSAFE_TOPIC","message":"The topic provided cannot be used to generate captions."}
10. Do not add commentary about the topic, the user, or your own output. Return only the JSON.`;

interface BuildPromptOptions {
  topic: string;
  platform: Platform;
  tone: Tone;
  hashtag_count: number;
  regenerate?: boolean;
  retryInstruction?: string;
}

export function buildUserMessage(options: BuildPromptOptions): string {
  const { topic, platform, tone, hashtag_count, regenerate, retryInstruction } = options;

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

  // Sanitize topic: strip URLs, truncate — no HTML escaping for LLM prompts
  let sanitizedTopic = topic
    .replace(/https?:\/\/\S+/g, "[link removed]")
    .slice(0, 200)
    .trim();

  const shortTopicNote =
    sanitizedTopic.length <= 3
      ? "\nNote: The topic provided is very short. Use reasonable creative interpretation to build relevant captions around it."
      : "";

  const platformGuidance = PLATFORM_GUIDANCE[platform];
  const toneGuidance = TONE_GUIDANCE[tone][platform];

  let message = `Generate 3 social media captions using the following inputs:

- Topic: ${sanitizedTopic}${shortTopicNote}
- Platform: ${displayPlatform[platform]}
- Tone: ${displayTone[tone]}
- Hashtag count: ${hashtag_count}

Platform-specific guidance:
${platformGuidance}

Tone-specific guidance:
${toneGuidance}

Return your response as a single JSON object matching this exact schema:
{
  "captions": [
    { "id": 1, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 2, "text": "...", "hashtags": ["#...", "#..."] },
    { "id": 3, "text": "...", "hashtags": ["#...", "#..."] }
  ]
}

Do not include any text outside the JSON object.`;

  if (regenerate) {
    message +=
      "\n\nImportant: This is a regeneration request. The previous response has already been shown to the user. You must produce 3 entirely new captions that differ meaningfully from a typical first response. Use different opening hooks, different structural approaches, and different angles on the topic. Do not repeat any phrase, sentence structure, or hook style from the most obvious interpretation of this topic.";
  }

  if (retryInstruction) {
    message += `\n\n${retryInstruction}`;
  }

  return message;
}
