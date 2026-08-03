# Skill Spark

Skill Spark is a pnpm monorepo for the web app, backend API, shared contracts, and Expo development-build mobile app.

## Structure

```text
skill-spark/
├── apps/
│   ├── web/        # Next.js frontend
│   ├── backend/    # Express/PostgreSQL API
│   └── mobile/     # Expo development-build app
├── packages/
│   ├── contracts/  # Shared API-facing TypeScript types
│   └── api-client/ # Framework-agnostic typed API client
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Requirements

- Node.js 20 or newer is recommended.
- Expo SDK 57 expects Node.js 22.13 or newer for mobile work.
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
The local seed account is `alice@example.com` / `password123`.

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

Start the Expo development-client Metro server after installing a development
build on your device:

```bash
pnpm mobile:start
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

Create a migration:

```bash
pnpm db:migration:new <migration_name>
```

Validate migrations by rebuilding the local Supabase database with seed data:

```bash
pnpm db:migrate:check
```

Preview and apply committed migrations to the linked Supabase project:

```bash
pnpm db:migrate:dry-run
pnpm db:migrate
```

These commands use `SUPABASE_PROJECT_REF` to link the Supabase project and then
run `supabase db push --linked`. They do not use a database URL. Env values are
loaded from `.env`, `.env.development`, `.env.local`, `apps/backend/.env`,
`apps/backend/.env.development`, and `apps/backend/.env.local`; shell variables
still take priority.

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
- `apps/mobile/.env.local`

Examples live beside each app:

- `apps/web/.env.example`
- `apps/backend/.env.example`
- `apps/mobile/.env.example`

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

For physical-device mobile testing, `apps/mobile/.env.local` must use the
development machine's LAN IP, not `localhost`:

```env
EXPO_PUBLIC_API_URL=http://<development-machine-lan-ip>:8181/api
```

The mobile device and development machine must be reachable on the same network
unless you use a tunnel or hosted API.

## Mobile Development Build

The mobile app uses Expo Router, NativeWind, `expo-dev-client`,
`expo-secure-store`, and the shared API client. It uses explicit refresh-token
mode for the Express API: refresh tokens are stored in SecureStore, access
tokens stay in memory, and the selected child ID is stored in non-sensitive
AsyncStorage.

Expo Go is not the testing workflow for this app. Build and install a
development client instead:

```bash
pnpm install
pnpm --filter @skill-spark/mobile exec eas login
pnpm --filter @skill-spark/mobile exec eas build:configure
pnpm mobile:build:dev:ios
```

For Android:

```bash
pnpm mobile:build:dev:android
```

After the development build is installed on the device:

```bash
pnpm --filter @skill-spark/mobile start --dev-client
```

Do not run production EAS builds from this workflow until the app has been
reviewed for production credentials, bundle identifiers, icons, and release
configuration.

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
pnpm db:migration:new add_example
pnpm db:migrate:check
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

Migrations and seed data are committed under `supabase/`. The initial local
migration was created from the backend's existing custom TypeScript seed schema.
It should be manually reviewed against production before any production schema
workflow.

Avoid making remote schema changes directly through Supabase Studio, the Table
Editor, or ad hoc SQL after adopting committed migrations because those changes
bypass local migration history. If a remote project already has schema changes
that are not represented locally, pull and review them before deploying new
migrations. Do not run `supabase db reset --linked` on production.

## Deployment

- Deploy `apps/web` to Vercel.
- Deploy `apps/backend` to Render.
- Use `apps/mobile` for Expo/EAS development builds. Production EAS submission
  remains a later release workflow.
