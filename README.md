# OfficeKorean AI

**Translate Language. Understand Workplace Culture.**

OfficeKorean AI helps foreigners working in Korea communicate professionally in
Korean workplaces. It's a no-login, no-database MVP powered by **Claude Opus**.

## Features

1. **Professional Translation** — English ↔ Korean in the right register
   (Casual Coworker, Team Member, Manager, Executive, Email, Meeting, Report),
   with a one-click copy button.
2. **Korean Cultural Filter** — rewrites blunt messages into polished,
   hierarchy-aware Korean that fits workplace etiquette. Returns the original,
   the professional version, and an explanation.
3. **Explain Korean** — paste a Korean message and get a literal translation,
   workplace meaning, tone analysis, hierarchy, an urgency score (1–10),
   cultural context, and suggested Korean + English replies.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **TailwindCSS** + **ShadCN UI** (Radix primitives)
- **Anthropic Claude API** (Claude Opus) via `@anthropic-ai/sdk`
- Dark mode via `next-themes`
- Deployable to **Vercel**

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── translate/route.ts          # Feature 1 endpoint
│   │   ├── cultural-filter/route.ts     # Feature 2 endpoint
│   │   └── explain-korean/route.ts      # Feature 3 endpoint
│   ├── globals.css                      # Tailwind + theme tokens
│   ├── layout.tsx                       # Root layout + ThemeProvider
│   └── page.tsx                         # Homepage (hero, cards, workspace)
├── components/
│   ├── ui/                              # ShadCN primitives (button, card, …)
│   ├── hero.tsx
│   ├── feature-cards.tsx
│   ├── workspace.tsx                    # Tabbed interface
│   ├── translation-tab.tsx
│   ├── cultural-filter-tab.tsx
│   ├── explain-korean-tab.tsx
│   ├── copy-button.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── anthropic.ts                     # Reusable Claude client + JSON helper
│   ├── prompts.ts                       # Prompt engineering for all 3 agents
│   └── utils.ts                         # cn() helper
└── types/
    └── index.ts                         # Shared types + UI option metadata
```

## Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** — copy the example and add your key:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   # Optional model override (defaults to claude-opus-4-8)
   # ANTHROPIC_MODEL=claude-opus-4-8
   ```

   Get an API key at <https://console.anthropic.com/>.

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Environment Variables

| Variable            | Required | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| `ANTHROPIC_API_KEY` | ✅       | Your Anthropic API key.                          |
| `ANTHROPIC_MODEL`   | ❌       | Override the model. Defaults to `claude-opus-4-8`. |

## Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **New Project → Import** the repo (the framework auto-detects as
   Next.js).
3. Under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` (and
   optionally `ANTHROPIC_MODEL`).
4. **Deploy.** That's it — the API routes run as serverless functions.

> The API routes set `maxDuration = 60` so Claude has time to respond. On
> Vercel's Hobby plan the effective cap is lower; upgrade if you hit timeouts on
> long inputs.

## How It Works

Each feature posts to its API route, which calls Claude Opus with a
purpose-built system prompt (see `lib/prompts.ts`). Every agent is instructed to
return **strict JSON**, which `lib/anthropic.ts` parses (tolerating code fences)
before sending it back to the typed React UI.

## Notes

- No authentication, database, subscriptions, OCR, voice, or payments — by design.
- All Claude calls happen server-side; your API key is never exposed to the browser.
