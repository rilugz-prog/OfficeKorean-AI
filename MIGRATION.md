# SeoroAI — Supabase → Clerk + Neon Migration Guide

This document covers the Phase 2 migration from **Supabase** (auth + Postgres +
RLS) to **Clerk** (auth) + **Neon** (Postgres) + **Drizzle ORM**. The code
changes are already done; this guide is what you need to provision the external
services and run the database.

---

## 1. What changed (architecture)

| Concern              | Before (Supabase)                              | After (Clerk + Neon)                                            |
| -------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| Authentication       | `@supabase/ssr` cookies, `auth.getUser()`      | Clerk `<SignIn>/<SignUp>`, `auth()` / `currentUser()`           |
| Auth UI              | Custom forms (`/login`, `/register`)           | Clerk prebuilt components on `/login/[[...rest]]`, `/register/[[...rest]]` |
| Session / middleware | `updateSession` (Supabase)                     | `clerkMiddleware` in `middleware.ts`                            |
| User provisioning    | `handle_new_user` SQL trigger on `auth.users`  | Clerk webhook → `/api/webhooks/clerk` + lazy create fallback   |
| Database access      | `supabase.from(...)` (PostgREST)               | Drizzle ORM (`db.select()/insert()/...`) over Neon serverless  |
| Ownership / security | Postgres Row-Level Security                    | App-layer checks: every query scoped by `profiles.id`          |
| Usage SQL functions  | `increment_usage`, `usage_today`, `usage_this_month` | Reimplemented as Drizzle queries in `lib/usage.ts`       |
| Identity model       | `profiles.id = auth.users.id` (uuid)           | `profiles.id` uuid PK + `profiles.clerk_user_id` (unique)      |

**Key identity design:** `profiles.id` remains the internal owner id that every
table FKs to. `profiles.clerk_user_id` is the external Clerk identity. The auth
layer resolves `clerkUserId → profile`, then uses `profile.id` for all queries —
so the rest of the schema was unchanged.

---

## 2. Dependency changes (already applied to `package.json`)

```bash
# Removed
npm uninstall @supabase/ssr @supabase/supabase-js

# Added (runtime)
npm install @clerk/nextjs drizzle-orm @neondatabase/serverless svix

# Added (dev)
npm install -D drizzle-kit tsx dotenv
```

New scripts in `package.json`:

| Script              | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run db:generate` | Generate SQL migrations from `lib/db/schema.ts`  |
| `npm run db:migrate`  | Apply migrations in `drizzle/` to Neon           |
| `npm run db:push`     | Push schema directly (dev convenience)           |
| `npm run db:seed`     | Seed the 35 built-in workplace templates         |
| `npm run db:studio`   | Open Drizzle Studio                              |

---

## 3. Environment variables

Copy `.env.example` → `.env.local` and fill in real values.

| Removed (Supabase)                | Added (Clerk + Neon)                               |
| --------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | `DATABASE_URL` (Neon pooled connection string)     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`                |
| `SUPABASE_SERVICE_ROLE_KEY`       | `CLERK_SECRET_KEY`                                 |
|                                   | `CLERK_WEBHOOK_SECRET`                              |
|                                   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`             |
|                                   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register`          |
|                                   | `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard` |
|                                   | `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard` |

`ANTHROPIC_API_KEY` is unchanged and still required for the AI features.

---

## 4. Neon setup

1. Create a project at https://neon.tech and a database (e.g. `neondb`).
2. In **Connection Details**, copy the **Pooled connection** string.
3. Set it as `DATABASE_URL` in `.env.local` (keep `?sslmode=require`).
4. Apply the schema and seed the templates:

   ```bash
   npm run db:migrate   # creates all tables, enums, indexes
   npm run db:seed      # inserts the 35 system templates
   ```

   (`npm run db:push` is a faster alternative to `db:migrate` during local dev.)

---

## 5. Clerk setup

1. Create an application at https://dashboard.clerk.com.
2. **Email + Google:** under **User & Authentication → Email, Phone, Username**
   enable Email; under **Social Connections** enable Google. Password reset is
   handled automatically inside the `<SignIn>` flow.
3. **API keys:** copy the Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   and the Secret key → `CLERK_SECRET_KEY`.
4. **Paths:** point Clerk at the app's custom auth pages (Account Portal →
   Paths, or via the env vars in §3): Sign-in `/login`, Sign-up `/register`.
5. **Webhook (user sync):**
   - Dashboard → **Webhooks → Add Endpoint**.
   - URL: `https://<your-domain>/api/webhooks/clerk`
     (for local testing use the Clerk dashboard's "ngrok"/tunnel or `svix` CLI).
   - Subscribe to **`user.created`**, **`user.updated`**, **`user.deleted`**.
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`.

When a user signs up, Clerk fires `user.created`; the webhook upserts a row in
`profiles`. If the webhook hasn't landed yet, the server auth helpers
(`lib/auth.ts`, `lib/api.ts`) create the profile lazily on first request — so
sign-in always works even before the webhook is configured.

---

## 6. Migration checklist

- [x] Remove `@supabase/*` deps; add Clerk / Drizzle / Neon / svix.
- [x] Remove Supabase client init (`lib/supabase/*` deleted).
- [x] Replace auth with Clerk (`lib/auth.ts`, `lib/api.ts`, `lib/clerk.ts`).
- [x] Replace Supabase Postgres with Neon (`lib/db/*`, `lib/neon.ts`).
- [x] Replace Supabase middleware with `clerkMiddleware` (`middleware.ts`).
- [x] Replace session handling with Clerk `auth()` / `useUser()`.
- [x] Replace the signup trigger with the Clerk webhook + `lib/user-sync.ts`.
- [x] Convert all DB queries to Drizzle (`app/api/**`, `lib/usage.ts`).
- [x] Remove RLS; enforce ownership in app code via `ctx.userId`.
- [x] Update env vars, `.env.example`.
- [x] Generate migrations (`drizzle/0000_init.sql`) + seed script.
- [ ] **You:** provision Neon + Clerk, set `.env.local`, run `db:migrate` + `db:seed`.
- [ ] **You:** add the Vercel env vars and the Clerk webhook endpoint.

---

## 7. Folder structure (Phase 2)

```
app/
  (app)/                     # protected: dashboard, history, phrases, templates, settings
  api/
    translate|cultural-filter|explain-korean/   # AI features (anonymous-friendly)
    profile|usage|history|phrases|templates|favorites/  # account data (Drizzle)
    webhooks/clerk/route.ts  # NEW — Clerk → Neon user sync (svix-verified)
  login/[[...rest]]/         # Clerk <SignIn>
  register/[[...rest]]/      # Clerk <SignUp>
  forgot-password/           # redirects into Clerk reset flow
lib/
  clerk.ts                   # Clerk server re-exports + routing constants
  auth.ts                    # getUserId / requireProfile (Clerk-backed)
  api.ts                     # getAuthContext / structured error envelope
  user-sync.ts               # ensure/upsert/delete profile from Clerk
  usage.ts                   # plan-limit engine (Drizzle)
  db/
    schema.ts                # Drizzle schema (6 tables + enums)
    index.ts                 # Neon serverless `db` client
    migrate.ts               # apply migrations
    seed.ts                  # 35 system templates
  neon.ts                    # raw Neon SQL client
  plans.ts | validation.ts | prompts.ts | anthropic.ts   # unchanged
drizzle/
  0000_init.sql              # generated migration
middleware.ts                # clerkMiddleware route protection
drizzle.config.ts
```

---

## 8. Deployment (Vercel)

1. Push the branch and import the project (build command `npm run build`).
2. Add all env vars from §3 in **Project → Settings → Environment Variables**.
3. After the first deploy, set the Clerk webhook URL to the production domain
   (`https://<domain>/api/webhooks/clerk`) and copy its signing secret into
   `CLERK_WEBHOOK_SECRET`.
4. Run `npm run db:migrate` and `npm run db:seed` against the production
   `DATABASE_URL` (locally with prod env, or via a one-off CI step).

---

## 9. Notes

- **Anonymous use is preserved:** translate / cultural filter / explain Korean
  still work for logged-out visitors (unmetered). Plan limits and history apply
  only once signed in (`getOptionalAuthContext`).
- **Stripe** is still a Phase 3 placeholder (see the upgrade modal).
- The legacy `supabase/migrations/*.sql` files were removed; `drizzle/` is now
  the source of truth for the database schema.
```
