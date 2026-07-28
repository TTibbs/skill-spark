# Skill Spark

Skill Spark is a pnpm monorepo for the web app, backend API, shared contracts, and a future mobile app.

## Structure

```text
skill-spark/
├── apps/
│   ├── web/        # Next.js frontend
│   ├── backend/    # Express/PostgreSQL API
│   └── mobile/     # Reserved for a future Expo app
├── packages/
│   └── contracts/  # Shared API-facing TypeScript types
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Requirements

- Node.js 20 or newer is recommended.
- pnpm 9 or newer is recommended.
- OrbStack must be running for local Supabase development. OrbStack provides the Docker-compatible container runtime used by the Supabase CLI.

## Install

```bash
pnpm install
```

Run the install command from the repository root so pnpm creates one root lockfile for all workspaces.

## Development

Start the isolated local Supabase stack first when you want the backend to use local Supabase Postgres:

```bash
pnpm supabase:start
pnpm supabase:status
```

Reset the local database from committed migrations and seed data:

```bash
pnpm db:reset
```

`db:reset` destroys and recreates local database data only. It does not touch production.

Run the web app and backend together:

```bash
pnpm dev
```

Run only the web app:

```bash
pnpm dev:web
```

Run only the backend:

```bash
pnpm dev:backend
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run backend tests against the local Supabase database:

```bash
pnpm test:backend:local
```

This resets the local Supabase database and runs Jest with `NODE_ENV=test` and a local-only `TEST_DATABASE_URL`.

Generate local database types:

```bash
pnpm db:types
```

The generated types live in `packages/contracts/src/database.types.ts` and describe the local schema.

## Family Rewards

Parents manage family-specific rewards through the Express API. Children request
available rewards with their stars, and stars are deducted transactionally when
the request is created. Parent approval finalises the request without deducting
again; rejection or cancellation refunds the snapshotted star cost once.

The active redemption statuses are:

```text
requested
approved
rejected
cancelled
```

Premium rewards, family reward shop polish, image uploads, and custom reward
redemption fulfilment remain separate future work.

## Environment Files

Keep environment files scoped to each app:

- `apps/web/.env.local`
- `apps/backend/.env.local`

Examples live beside each app:

- `apps/web/.env.example`
- `apps/backend/.env.example`

Do not commit real secrets.

For local Supabase development, `apps/backend/.env.local` overrides general
backend env values and can use:

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55422/postgres
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55422/postgres
CLIENT_URL=http://localhost:3000
```

Run `pnpm env:local` to create `apps/backend/.env.local` from the tracked
example only when it does not already exist. Keep JWT secrets and external
service keys local. Do not expose Supabase secret or service-role keys to the
web app. The backend supports only `DATABASE_URL` for development/production and
`TEST_DATABASE_URL` for tests; legacy split PostgreSQL variables are ignored by
the application.

## Local Supabase

Production already uses Supabase Postgres, but this repository is not linked to the hosted project by default. Local Supabase is used as:

- the Express backend's local PostgreSQL database;
- the local schema and migration environment;
- the local backend test database;
- a local Supabase Studio instance for inspecting tables and data.

Useful commands:

```bash
pnpm supabase:start
pnpm supabase:status
pnpm db:reset
pnpm dev
pnpm test:backend:local
pnpm supabase:stop
```

Current local service defaults:

- Supabase API: `http://127.0.0.1:55421`
- PostgreSQL: `postgresql://postgres:postgres@127.0.0.1:55422/postgres`
- Studio: `http://127.0.0.1:55423`
- Mailpit: `http://127.0.0.1:55424`

The local publishable and secret keys printed by `pnpm supabase:status` are for local development only. They are not required by the Express backend for normal database access.

The Express backend remains the application API:

```text
Next.js or future Expo app
          ↓
     Express API
          ↓
   Supabase Postgres
```

Custom JWT authentication remains in place. Do not replace it with Supabase Auth, direct Supabase client queries, Edge Functions, or Next.js route handlers as part of this setup.

Migrations and seed data are committed under `supabase/`. The initial local migration was created from the backend's existing custom TypeScript seed schema. It should be manually reviewed against production before any production schema workflow.

Production linking, remote schema pulls, remote pushes, migration repair, and hosted project changes are intentionally excluded. When ready, manually review the local migration history against production before running any Supabase link, pull or push commands.

## Deployment

- Deploy `apps/web` to Vercel.
- Deploy `apps/backend` to Render.
- Use `apps/mobile` for Expo/EAS later, after the mobile app is scaffolded.
