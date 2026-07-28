import { PoolConfig, Pool } from "pg";
import { NODE_ENV } from "../config/env";

const LOCAL_TEST_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "host.docker.internal",
]);

const REMOTE_HOST_PATTERNS = [
  "supabase.co",
  "pooler.supabase.com",
  "onrender.com",
];

const isLocalHost = (host: string): boolean =>
  LOCAL_TEST_HOSTS.has(host) ||
  host.endsWith(".local") ||
  host.endsWith(".orb.local");

export const resolveDatabaseUrl = (
  nodeEnv: string,
  env: NodeJS.ProcessEnv
): string => {
  if (nodeEnv === "test") {
    const testDatabaseUrl = env.TEST_DATABASE_URL;

    if (!testDatabaseUrl) {
      throw new Error("TEST_DATABASE_URL must be set when NODE_ENV=test");
    }

    const { hostname } = new URL(testDatabaseUrl);

    if (
      !isLocalHost(hostname) ||
      REMOTE_HOST_PATTERNS.some((pattern) => hostname.includes(pattern))
    ) {
      throw new Error(
        `Refusing to run tests against non-local database host: ${hostname}`
      );
    }

    return testDatabaseUrl;
  }

  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set");
  }
  return databaseUrl;
};

const databaseUrl = resolveDatabaseUrl(NODE_ENV, process.env);

const config: PoolConfig = {
  max: 10,
};

if (databaseUrl) {
  config.connectionString = databaseUrl;

  const { hostname } = new URL(databaseUrl);
  if (NODE_ENV === "production" && !isLocalHost(hostname)) {
    config.ssl = { rejectUnauthorized: false };
  }
}

if (NODE_ENV === "development") {
  const { hostname, port, pathname } = new URL(databaseUrl);
  console.log(`Database: ${hostname}${port ? `:${port}` : ""}${pathname}`);
}

export default new Pool(config);
