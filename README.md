# SeoroAI

**Translate Language. Understand Workplace Culture.**

SeoroAI helps foreigners working in Korea communicate professionally in
Korean workplaces. **Phase 2** turns the original AI tool into a full SaaS
platform — accounts, history, saved phrases, workplace templates, usage tracking
and plan enforcement — powered by **Claude Opus**, **Clerk** and **Neon**.

The core AI features still work anonymously for logged-out visitors, so the app
degrades gracefully to the Phase 1 MVP.

> Migrating from the old Supabase build? See **[MIGRATION.md](MIGRATION.md)**.

## Features

### AI features (work logged-in or anonymously)

1. **Professional Translation** — English ↔ Korean in the right register
   (Casual Coworker → Executive, Email, Meeting, Report).
2. **Korean Cultural Filter** — rewrites blunt messages into polished,
   hierarchy-aware Korean that fits workplace etiquette.
3. **Explain Korean** — decode a Korean message: literal translation, workplace
   meaning, tone, hierarchy, urgency score, cultural context, suggested replies.

### Phase 2 SaaS platform (requires Clerk + Neon + login)

4. **Accounts** — Clerk auth: Google OAuth, email/password, registration,
   password reset, user button.
5. **Dashboard** — usage stats, charts, plan limits, recent activity, counts.
6. **Translation History** — search, filter (feature / date / favorites), sort,
   favorite, delete.
7. **Phrase Library** — create / edit / delete / search / favorite saved phrases
   by category, with per-plan caps.
8. **Template Center** — 35+ built-in workplace templates that generate
   professional Korean + English + a cultural explanation.
9. **Settings** — name, avatar, preferred language, default mode, theme,
   notifications.
10. **Plan enforcement** — Free / Pro / Premium limits enforced server-side with
    structured errors and a reusable upgrade modal (Stripe stubbed for Phase 3).

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **TailwindCSS** + **ShadCN UI** (Radix primitives), dark/light mode
- **Anthropic Claude API** (Claude Opus) via `@anthropic-ai/sdk`
- **Clerk** for authentication (`@clerk/nextjs`) + webhook user sync (`svix`)
- **Neon** serverless Postgres (`@neondatabase/serverless`) + **Drizzle ORM**
- **Zod** for request validation
- Deployable to **Vercel**

## Project Structure

```
.
├── middleware.ts                       # clerkMiddleware route protection
├── drizzle.config.ts                   # Drizzle Kit config
├── drizzle/
│   └── 0000_init.sql                   # generated SQL migration
├── app/
│   ├── (app)/                          # Protected app shell + pages
│   │   ├── layout.tsx                  #   requireProfile + AppShell + UpgradeModal
│   │   ├── dashboard/  history/  phrases/  templates/  settings/
│   ├── login/[[...rest]]/              # Clerk <SignIn>
│   ├── register/[[...rest]]/           # Clerk <SignUp>
│   ├── forgot-password/                # redirects into Clerk reset flow
│   ├── pricing/  features/             # Public marketing pages
│   └── api/                            # profile, history(+delete), usage,
│       │                               # phrases(+create/update/delete),
│       │                               # templates(+generate), favorites,
│       │                               # translate, cultural-filter, explain-korean
│       └── webhooks/clerk/             # Clerk → Neon user sync (svix-verified)
├── components/
│   ├── ui/                             # ShadCN primitives
│   ├── app-shell.tsx  upgrade-modal.tsx  usage-chart.tsx  auth-shell.tsx …
├── hooks/                              # useAuth, useProfile, useSubscription,
│                                       # useUsage, useHistory, useSavedPhrases,
│                                       # useTemplates
├── lib/
│   ├── clerk.ts  auth.ts  api.ts  user-sync.ts       # auth + Clerk
│   ├── db/{schema,index,migrate,seed}.ts  neon.ts    # Neon + Drizzle
│   ├── usage.ts  plans.ts  validation.ts             # plan engine + validation
│   ├── anthropic.ts  prompts.ts  client-api.ts  database.types.ts
└── types/index.ts
```

## Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment** — `cp .env.example .env.local` and fill in
   `ANTHROPIC_API_KEY`, `DATABASE_URL` (Neon), and the Clerk keys
   (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
   `CLERK_WEBHOOK_SECRET`). See **[MIGRATION.md](MIGRATION.md) §3–5** for how to
   provision Neon and Clerk.

3. **Set up the database**, then run:

   ```bash
   npm run db:migrate   # create tables, enums, indexes in Neon
   npm run db:seed      # insert the 35 system templates
   npm run dev          # http://localhost:3000
   ```

## Database (Neon + Drizzle)

The schema lives in `lib/db/schema.ts` and is the single source of truth.

| Command               | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `npm run db:generate` | Generate a SQL migration into `drizzle/`         |
| `npm run db:migrate`  | Apply migrations to Neon                          |
| `npm run db:push`     | Push the schema directly (dev convenience)        |
| `npm run db:seed`     | Seed the 35 built-in workplace templates          |
| `npm run db:studio`   | Open Drizzle Studio                               |

### Schema overview

| Table                 | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `profiles`            | 1:1 with a Clerk user (`clerk_user_id`); tier + prefs  |
| `usage_tracking`      | per-user / feature / day counters                      |
| `translation_history` | every translation, filter, analysis                    |
| `saved_phrases`       | user phrase library (capped by plan)                   |
| `favorites`           | generic favorites across resource types                |
| `templates`           | system + custom workplace templates                    |

Ownership is enforced in application code: every query is scoped by
`profiles.id`, resolved from the Clerk session.

## Plan Limits

| Feature           | Free          | Pro       | Premium   |
| ----------------- | ------------- | --------- | --------- |
| Translations      | 20 / day      | Unlimited | Unlimited |
| Cultural filters  | 10 / day      | Unlimited | Unlimited |
| Explain Korean    | 10 / month    | Unlimited | Unlimited |
| Saved phrases     | 5             | 20        | Unlimited |

Limits live in `lib/plans.ts` and are enforced server-side in `lib/usage.ts`.
When a limit is hit, endpoints return:

```json
{ "success": false, "code": "LIMIT_REACHED", "message": "Daily translation limit reached (20). Upgrade for more." }
```

## Security

- **Clerk session validation** via `auth()` in `clerkMiddleware` + every
  protected route handler (`getAuthContext`).
- **Ownership verification** — every query filters by `profiles.id`; no row is
  reachable across users.
- **Input validation** with Zod on all write endpoints.
- **Webhook signature verification** — the Clerk webhook is svix-verified with
  `CLERK_WEBHOOK_SECRET` before any profile write.
- **Rate limiting / quotas** via the usage engine.
- API keys stay server-side; only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` reaches
  the client.

## Deploy to Vercel

1. Push the repo and **Import** it in Vercel (auto-detected as Next.js).
2. Add the environment variables from `.env.example` (Anthropic, Neon `DATABASE_URL`,
   all Clerk keys).
3. Point the Clerk webhook at `https://YOUR-DOMAIN/api/webhooks/clerk`
   (events: `user.created`, `user.updated`, `user.deleted`) and set
   `CLERK_WEBHOOK_SECRET`.
4. Run `npm run db:migrate` and `npm run db:seed` against the production
   `DATABASE_URL`.
5. **Deploy.** API routes run as serverless functions (`maxDuration = 60`).

## Roadmap

- **Phase 3:** Stripe billing (the upgrade modal is wired and labelled
  "Stripe Integration Coming in Phase 3").
