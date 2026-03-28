import { Platform, Tone } from "./types";

export const TONE_GUIDANCE: Record<Tone, Record<Platform, string>> = {
  casual: {
    instagram:
      "Write like you are introducing yourself to a new friend at a party. Contractions, everyday vocabulary, and a relaxed sentence structure. The bio should feel warm and approachable, not polished or corporate.",
    tiktok:
      "Sound like a real person, not a brand. Lowercase is fine. Slang is fine. Keep it short and high-energy. If it sounds like something you would say on camera before your first take, it is working.",
    linkedin:
      "Casual on LinkedIn still means professional — approachable but credible. Use first-person, drop corporate jargon, and write the way you would introduce yourself in a team meeting. No slang, but no stiffness either.",
    twitter:
      "Relaxed, direct, and a little self-aware. Use contractions. Skip formalities. A casual Twitter bio reads like a concise self-introduction from someone confident enough not to oversell themselves.",
  },
  professional: {
    instagram:
      "Polished and purposeful. Use complete, well-formed sentences. Lead with your expertise or credential. Suitable for business accounts, coaches, and B2B creators. Maintain warmth — professional does not mean cold.",
    tiktok:
      "Professional TikTok means confident and clear, not stiff. The 80-character limit forces precision — state your expertise in the fewest possible words. Avoid corporate-speak; the TikTok audience scrolls past it instantly.",
    linkedin:
      "Formal, substantive, and insight-driven. Lead with your value proposition or a specific area of expertise. Use industry-appropriate vocabulary. Write in first person. Proofread-level polish expected. No emoji.",
    twitter:
      "Concise and authoritative. Every word must carry weight. State your field, your angle, or your credentials in as few words as possible. Avoid hedging language. A professional Twitter bio reads like a business card, not a resume.",
  },
  funny: {
    instagram:
      "Light humor, clever wordplay, or a self-deprecating twist on your niche. The punchline should land in the first line — Instagram bios are read in one scan. Relatable comedy beats obscure references for broad appeal.",
    tiktok:
      "TikTok humor is absurdist, self-aware, and fast. An 80-character funny bio is a one-liner with a setup baked in. Lean into irony or unexpected juxtaposition of the niche and the traits provided. The weirder and more specific, the better.",
    linkedin:
      "Rare but powerful when done right. Dry wit and self-aware professional humor work well — poking fun at industry clichés or overly serious bios is a proven approach. Never punch down. Keep it smart and brief.",
    twitter:
      "Twitter is humor's home platform. A funny bio is a one-liner. Dry wit, absurdist self-description, or a subverted expectation all thrive here. Do not over-explain the joke — if it needs a preamble, it is not the right joke.",
  },
  inspirational: {
    instagram:
      "Write a bio that signals a journey or a mission, not just a job title. Lead with a belief, a transformation the creator enables, or a result they help their audience achieve. Avoid generic motivational-poster phrases — root the inspiration in the specific niche and traits provided.",
    tiktok:
      "Inspirational on TikTok means high-energy and relatable, not preachy. In 80 characters, frame the creator as proof that something is possible. A personal win, a challenge accepted, or a mission statement all work if they are specific and energetic.",
    linkedin:
      "Frame inspiration as professional growth, resilience, or industry impact. Lead with a mission or a belief that ties directly to the creator's niche. The LinkedIn audience values actionable inspiration over motivational abstraction — make the reader want to follow you to learn something.",
    twitter:
      "Keep inspirational bios short and punchy. A single powerful sentence or a bold reframe of a common belief is more effective than a mini-manifesto. 160 characters is enough to say one meaningful thing — say it well.",
  },
};
