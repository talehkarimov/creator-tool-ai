import { z } from "zod";
import { PLATFORMS, TONES } from "@/lib/caption-generator/types";

export { PLATFORMS, TONES };
export type Platform = (typeof PLATFORMS)[number];
export type Tone = (typeof TONES)[number];

// Platform default + hard character limits for bios
export const PLATFORM_BIO_LIMITS: Record<Platform, { default: number; hard: number }> = {
  instagram: { default: 150, hard: 150 },
  tiktok:    { default: 80,  hard: 80  },
  linkedin:  { default: 220, hard: 2600 },
  twitter:   { default: 160, hard: 160 },
};

export const GenerateBioSchema = z.object({
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
  niche: z
    .string()
    .min(1, "niche is required")
    .max(100, "niche must be 100 characters or fewer"),
  traits: z
    .string()
    .min(1, "traits is required")
    .max(150, "traits must be 150 characters or fewer"),
  char_limit: z.number().int().min(0).optional().default(0),
  regenerate: z.boolean().optional().default(false),
});

export type GenerateBioInput = z.infer<typeof GenerateBioSchema>;

export interface Bio {
  id: number;
  text: string;
}

export interface BioResponse {
  bios: Bio[];
}

export interface ErrorResponse {
  error: true;
  code: string;
  message: string;
}

/** Resolve effective char limit: 0 or undefined → platform default, over hard limit → cap at hard */
export function resolveCharLimit(platform: Platform, char_limit: number): number {
  const { default: def, hard } = PLATFORM_BIO_LIMITS[platform];
  if (!char_limit || char_limit === 0) return def;
  return Math.min(char_limit, hard);
}
