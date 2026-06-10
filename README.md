# SeoroAI

**Translate Language. Understand Workplace Culture.**

SeoroAI helps foreigners working in Korea communicate professionally in
Korean workplaces. **Phase 2** turns the original AI tool into a full SaaS
platform — accounts, history, saved phrases, workplace templates, usage tracking
and plan enforcement — powered by **Claude Opus** and **Supabase**.

The core AI features still work anonymously when Supabase is not configured, so
the app degrades gracefully to the Phase 1 MVP.

## Features

### AI features (work logged-in or anonymously)

1. **Professional Translation** — English ↔ Korean in the right register
   (Casual Coworker → Executive, Email, Meeting, Report).
2. **Korean Cultural Filter** — rewrites blunt messages into polished,
   hierarchy-aware Korean that fits workplace etiquette.
3. **Explain Korean** — decode a Korean message: literal translation, workplace
   meaning, tone, hierarchy, urgency score, cultural context, suggested replies.

### Phase 2 SaaS platform (requires Supabase + login)

4. **Accounts** — Google OAuth, email/password, registration, password reset.
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
- **Supabase** (Postgres + Auth + Row Level Security) via `@supabase/ssr`
- **Zod** for request validation
- Deployable to **Vercel**

## Project Structure

```
.
├── middleware.ts                       # Session refresh + route protection
├── supabase/
│   └── migrations/                     # SQL schema, functions, RLS, seed
│       ├── 20260608000001_init.sql
│       ├── 20260608000002_functions.sql
│       ├── 20260608000003_rls.sql
│       └── 20260608000004_seed_templates.sql
├── app/
│   ├── (app)/                          # Protected app shell + pages
│   │   ├── layout.tsx                  #   requireProfile + AppShell + UpgradeModal
│   │   ├── dashboard/  history/  phrases/  templates/  settings/
│   ├── login/  register/  forgot-password/  reset-password/
│   ├── pricing/  features/             # Public marketing pages
│   ├── auth/callback/  auth/signout/   # OAuth + sign-out route handlers
│   └── api/                            # profile, history(+delete), usage,
│                                       # phrases(+create/update/delete),
│                                       # templates(+generate), favorites,
│                                       # translate, cultural-filter, explain-korean
├── components/
│   ├── ui/                             # ShadCN primitives
│   ├── app-shell.tsx  upgrade-modal.tsx  usage-chart.tsx  auth-shell.tsx …
├── hooks/                              # useAuth, useProfile, useSubscription,
│                                       # useUsage, useHistory, useSavedPhrases,
│                                       # useTemplates
├── lib/
│   ├── supabase/{client,server,middleware,config}.ts
│   ├── auth.ts  api.ts  usage.ts  plans.ts  validation.ts
│   ├── anthropic.ts  prompts.ts  client-api.ts  database.types.ts
└── types/index.ts
```

## Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment** — `cp .env.example .env.local` and fill in:

   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. **Set up the database** (see below), then run:

   ```bash
   npm run dev   # http://localhost:3000
   ```

## Database Setup (Supabase)

1. Create a project at <https://supabase.com>.
2. Apply the migrations in `supabase/migrations/` **in order**. Either:
   - **SQL editor:** paste each file's contents and run, oldest first; or
   - **Supabase CLI:**
     ```bash
     supabase link --project-ref YOUR-REF
     supabase db push
     ```
   The migrations create the tables, enum types, the `handle_new_user` trigger
   (auto-creates a profile on signup), the atomic usage RPCs, all RLS policies,
   and seed the 35 built-in templates.
3. **Auth providers** — in **Authentication → Providers**:
   - Enable **Email** (and "Confirm email" if you want email verification).
   - Enable **Google**, adding your OAuth client ID/secret.
4. **Redirect URLs** — in **Authentication → URL Configuration** add:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-DOMAIN/auth/callback`
   - `https://YOUR-DOMAIN/reset-password`

### Schema overview

| Table                 | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `profiles`            | 1:1 with `auth.users`; tier + preferences       |
| `usage_tracking`      | per-user / feature / day counters               |
| `translation_history` | every translation, filter, analysis             |
| `saved_phrases`       | user phrase library (capped by plan)            |
| `favorites`           | generic favorites across resource types         |
| `templates`           | system + custom workplace templates             |

Every table has **Row Level Security** scoping rows to `auth.uid()`.

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

- **Row Level Security** on all tables (owner-scoped).
- **Session validation** via `supabase.auth.getUser()` in middleware + every
  protected route.
- **Input validation** with Zod on all write endpoints.
- **Ownership verification** — every query filters by `user_id = auth.uid()`.
- **Rate limiting / quotas** via the usage engine.
- **Secure cookies** handled by `@supabase/ssr`.
- API keys stay server-side; only `NEXT_PUBLIC_*` Supabase keys reach the client.

## Deploy to Vercel

1. Push the repo and **Import** it in Vercel (auto-detected as Next.js).
2. Add environment variables: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optional `ANTHROPIC_MODEL`).
3. Add your production `…/auth/callback` and `…/reset-password` URLs to Supabase
   redirect URLs.
4. **Deploy.** API routes run as serverless functions (`maxDuration = 60`).

## Roadmap

- **Phase 3:** Stripe billing (the upgrade modal is wired and labelled
  "Stripe Integration Coming in Phase 3").
