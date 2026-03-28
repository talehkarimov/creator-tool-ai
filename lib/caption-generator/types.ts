import { z } from "zod";

export const PLATFORMS = ["instagram", "tiktok", "linkedin", "twitter"] as const;
export const TONES = ["casual", "professional", "funny", "inspirational"] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Tone = (typeof TONES)[number];

export const GenerateCaptionSchema = z.object({
  topic: z.string().min(1, "topic is required"),
  platform: z.enum(PLATFORMS, {
    errorMap: () => ({
      message: "platform must be one of: instagram, tiktok, linkedin, twitter",
    }),
  }),
  tone: z.enum(TONES, {
    errorMap: () => ({
      message: "tone must be one of: casual, professional, funny, inspirational",
    }),
  }),
  hashtag_count: z
    .number()
    .int()
    .min(0)
    .max(10)
    .default(5)
    .optional(),
  regenerate: z.boolean().optional().default(false),
});

export type GenerateCaptionInput = z.infer<typeof GenerateCaptionSchema>;

export interface Caption {
  id: number;
  text: string;
  hashtags: string[];
}

export interface CaptionResponse {
  captions: Caption[];
}

export interface ErrorResponse {
  error: true;
  code: string;
  message: string;
}

// Per-platform recommended max text length (chars)
export const PLATFORM_TEXT_LIMITS: Record<Platform, number> = {
  instagram: 220,
  tiktok: 150,
  linkedin: 700,
  twitter: 220,
};
