# Creator Tool AI

> **AI-powered content generation platform for creators — built with an agentic workflow orchestrated by Claude Code.**

Creator Tool AI is a Next.js application that gives content creators production-ready AI generators (captions, bios, and more) powered by Anthropic's Claude. Every feature in the codebase is designed, planned, and implemented through a multi-agent pipeline where specialized Claude agents collaborate autonomously from product definition to shipped code.

---

## Features

| Generator | What it does |
|---|---|
| **Caption Generator** | Produces platform-optimised social captions with hooks, CTAs, and hashtags |
| **Bio Generator** | Crafts audience-targeted creator bios for any platform or tone |
| _(more coming)_ | Each new generator is spun up by the same agentic pipeline |

---

## Agentic Workflow

This project is built **feature-by-feature using a structured multi-agent pipeline**. No feature is coded ad-hoc — every one goes through the full agent chain below.

```
┌─────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                        │
│              (Claude Code / claude.md)                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
               ┌────────────────┐
               │  Product Agent │  ← defines task, scope, dependency map
               └───────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌─────────┐ ┌──────────┐ ┌──────────┐
     │   SEO   │ │  UI/UX   │ │  Prompt  │   (run in parallel)
     │  Agent  │ │  Agent   │ │  Agent   │
     └────┬────┘ └────┬─────┘ └────┬─────┘
          │           │            │
          └─────┬─────┘            │
                ▼                  ▼
          ┌──────────┐       ┌──────────┐
          │ Frontend │       │ Backend  │
          │  Agent   │       │  Agent   │
          └──────────┘       └──────────┘
```

### Agents

| Agent | Responsibility |
|---|---|
| **Product** | Creates task files with objectives, acceptance criteria, and dependency maps |
| **SEO** | Defines keyword strategy, meta copy, and discoverability requirements |
| **UI/UX** | Designs component hierarchy, user flow, and interaction spec |
| **Prompt** | Engineers and tests the Claude prompts used inside each generator |
| **Backend** | Implements API routes, Claude integration, rate limiting, and safety |
| **Frontend** | Builds React components and wires them to the API |

Task files live in [`/tasks`](./tasks/) and agent definitions live in [`/claude/agents`](./claude/agents/). The orchestrator reads [`/claude/claude.md`](./claude/claude.md) at the start of every session.

---

## Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router)
- **UI** — React 19
- **AI** — [Anthropic Claude](https://anthropic.com) via `@anthropic-ai/sdk`
- **Validation** — Zod
- **Language** — TypeScript 5
- **Agentic Orchestration** — Claude Code

---

## Getting Started

### Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/talehkarimov/creator-tool-ai.git
cd creator-tool-ai
npm install
```

### Environment

```bash
cp .env.example .env.local
```

Open `.env.local` and set your `ANTHROPIC_API_KEY`. All other values have sensible defaults for local development.

> **Tip:** Set `MOCK_AI=true` to skip real Claude API calls during UI development.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
creator-tool-ai/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # Server-side AI endpoints
│   ├── bio-generator/
│   └── caption-generator/
├── claude/                 # Agentic workflow configuration
│   ├── claude.md           # Orchestrator instructions
│   ├── agents/             # Per-agent role definitions
│   └── shared/             # Cross-agent context, rules & decisions
├── components/             # Shared React components
├── config/                 # App configuration (blocklist, constants)
├── features/               # Agent-produced specs per feature
├── lib/                    # Shared utilities & Claude client
├── styles/                 # Global styles
├── tasks/                  # Task files created by the Product agent
└── .env.example            # Environment variable reference
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | **Required.** Your Anthropic API key |
| `MOCK_AI` | `false` | Skip Claude API calls (returns mock data) |
| `CLAUDE_MODEL` | `claude-sonnet-4-5` | Claude model to use |
| `CLAUDE_MAX_TOKENS` | `600` | Max tokens per generation |
| `CLAUDE_TEMPERATURE` | `0.9` | Creativity for standard generations |
| `RATE_LIMIT_PER_MINUTE` | `10` | Per-IP rate limit |
| `RATE_LIMIT_PER_HOUR` | `60` | Per-IP hourly cap |

See [`.env.example`](.env.example) for the full list.

---

## Adding a New Generator

Every new AI generator follows the same agentic pipeline:

1. **Open a task file** — prompt the Product agent to create `tasks/task-NNN-<name>.md`
2. **Run parallel agents** — SEO, UI/UX, and Prompt agents work the spec in parallel
3. **Backend** — implements the API route using the Prompt agent's output
4. **Frontend** — builds the UI using the UI/UX agent's spec
5. **Ship** — all outputs are committed; task file is marked complete

This keeps every feature consistent, documented, and reproducible.

---

## License

MIT
