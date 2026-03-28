import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./buildPrompt";

const MOCK_MODE = process.env.MOCK_AI === "true";

const MOCK_RESPONSE = JSON.stringify({
  captions: [
    {
      id: 1,
      text: "First sip hits different when you've got a plan for the day. ☕ My morning coffee routine is basically my unofficial productivity meeting — and it always shows up on time.",
      hashtags: ["#MorningCoffee", "#ProductivityHacks", "#CoffeeLover", "#MorningRoutine", "#GetThingsDone"],
    },
    {
      id: 2,
      text: "Hot coffee, quiet house, no notifications. That's my superpower right there. 🙌 What's the one thing that sets your morning up right?",
      hashtags: ["#CoffeeOClock", "#MorningVibes", "#ProductivityTips", "#SlowMorning", "#CoffeeCommunity"],
    },
    {
      id: 3,
      text: "Okay but who else literally cannot function before coffee? ☕✨ I turned my morning brew into a whole ritual and honestly my to-do list has never been more scared.",
      hashtags: ["#CoffeeFirst", "#MorningMotivation", "#ProductivityLife", "#CoffeeAddict", "#DailyRoutine"],
    },
  ],
});

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5";
const MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS ?? "600", 10);
const TIMEOUT_MS = parseInt(process.env.CLAUDE_TIMEOUT_MS ?? "15000", 10);
const BASE_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE ?? "0.9");
const REGEN_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE_REGEN ?? "1.0");

interface CallClaudeOptions {
  userMessage: string;
  regenerate?: boolean;
}

export async function callClaude(options: CallClaudeOptions): Promise<string> {
  if (MOCK_MODE) {
    console.log("[callClaude] MOCK_AI=true — returning mock response");
    await new Promise((r) => setTimeout(r, 1200)); // simulate network delay
    return MOCK_RESPONSE;
  }

  const { userMessage, regenerate } = options;
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
    if (block.type !== "text") {
      throw new Error("Unexpected response content type from Claude");
    }
    return block.text;
  } finally {
    clearTimeout(timeout);
  }
}
