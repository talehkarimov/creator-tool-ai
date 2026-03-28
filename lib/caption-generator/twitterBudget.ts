import { Caption } from "./types";

// Twitter/X hard limit: 280 chars total (text + space + hashtags)
const TWITTER_LIMIT = 280;

export function enforceTwitterBudget(captions: Caption[]): Caption[] {
  return captions.map((caption) => {
    const textLen = caption.text.length;
    const available = TWITTER_LIMIT - textLen - 1; // 1 for separator space

    if (available <= 0) {
      return { ...caption, hashtags: [] };
    }

    const trimmed: string[] = [];
    let used = 0;

    for (const tag of caption.hashtags) {
      const tagLen = used === 0 ? tag.length : tag.length + 1; // +1 for space between tags
      if (used + tagLen > available) break;
      trimmed.push(tag);
      used += tagLen;
    }

    return { ...caption, hashtags: trimmed };
  });
}
