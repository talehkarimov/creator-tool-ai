import { Platform, Tone } from "./types";

export const TONE_GUIDANCE: Record<Tone, Record<Platform, string>> = {
  casual: {
    instagram:
      "Write the way you would talk to a friend. Use contractions, everyday vocabulary, and a relaxed sentence structure. Avoid jargon, buzzwords, and anything that sounds like a press release. Short punchy sentences and relatable observations work well.",
    tiktok:
      "Sound like a real person, not a brand. Lowercase is fine. Slang is fine. Keep it short and high-energy. If it sounds like something you'd say on camera, it's working.",
    linkedin:
      "Casual on LinkedIn still means professional. Use \"I\" statements, speak directly, drop the corporate jargon, and write how you would talk in a team meeting — approachable but credible.",
    twitter:
      "Relaxed, conversational, and direct. Use contractions. Skip formalities. If it sounds like something you'd text a friend who works in your field, that's the right register.",
  },
  professional: {
    instagram:
      "Polished but not cold. Use complete sentences and correct grammar. Avoid slang. Suitable for business accounts, product launches, or B2B brands. Maintain warmth without being informal.",
    tiktok:
      "Professional TikTok means confident and clear, not stiff. Speak with authority. Use plain language. Avoid corporate-speak — the TikTok audience will scroll past it instantly.",
    linkedin:
      "Formal, substantive, and insight-driven. Use industry-appropriate vocabulary. Back up claims with specifics. Write in the first person. Proofread-level polish expected.",
    twitter:
      "Concise and authoritative. Strip all filler. Every word must carry weight. Use precise vocabulary. Avoid hedging language.",
  },
  funny: {
    instagram:
      "Light humor, relatable comedy, or clever wordplay. Avoid puns that require too much setup — Instagram truncates. The punchline should land in the first two lines. Self-deprecating humor resonates with lifestyle audiences.",
    tiktok:
      "TikTok humor is absurdist, fast, and self-aware. Lean into irony, unexpected twists, or \"main character\" energy. Reference formats the platform already finds funny without copying a specific trend verbatim.",
    linkedin:
      "Rare but powerful when done right. Dry wit and self-aware professional humor work (e.g., poking fun at corporate clichés). Avoid anything that could be misread as sarcasm about your field or audience. Never punch down.",
    twitter:
      "This is humor's home platform. One-liners, dry takes, and absurdist observations thrive. The setup-punchline format works in a single post. Don't over-explain the joke.",
  },
  inspirational: {
    instagram:
      "Warm, uplifting, and personal. Share a genuine moment of growth, struggle overcome, or lesson learned. Avoid generic motivational-poster phrases — make it feel lived-in and specific. End with an empowering call to action or question.",
    tiktok:
      "Inspirational on TikTok means high energy and relatable, not preachy. Frame it as a personal win or a challenge accepted. Keep it brief — the video carries the emotional weight.",
    linkedin:
      "Frame inspiration as professional growth, resilience, or industry insight. Story-driven openings perform well. Avoid fluffy affirmations — the LinkedIn audience wants actionable takeaways tied to the inspiration.",
    twitter:
      "Keep inspirational posts short and punchy — no multi-line manifestos. A single powerful sentence or a bold reframe of a common belief is more effective than a paragraph of motivation.",
  },
};
