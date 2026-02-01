# FitAI – Supabase migrations

Tables and schema are in **migrations**. You can apply them in two ways.

## Option 1: Supabase Dashboard (no CLI)

1. Open your project: [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Copy the full contents of `supabase/migrations/20260125000000_initial_fitai_schema.sql`.
4. Paste and run.  
   You should see no errors and the new tables in **Table Editor**.

## Option 2: Supabase CLI (recommended)

1. Install CLI: `npm install -g supabase`
2. Log in: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_REF`  
   (Project ref is in Dashboard → Settings → General.)
4. Push migrations: `supabase db push`

Migrations run in order; the initial one creates all FitAI tables, RLS, function, seed data, and indexes.

## What gets created

- **profiles** – user profile (fitness level, goals, time, subscription)
- **workout_plans** – AI-generated plans (exercises JSONB)
- **workout_sessions** – completed sessions (flexible rep logging)
- **exercises** – library (10 seeded)
- **nutrition_logs** – meal logs
- **user_streaks** – streak and totals
- RLS policies so users only see their own data
- `update_user_streak()` function
- Indexes for common queries

After running the migration (either option), the schema is applied; no extra “migrate” step is required in the app.
