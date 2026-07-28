import { resolveDatabaseUrl } from "../db/connection";

describe("database configuration", () => {
  test("uses DATABASE_URL outside tests despite conflicting split PostgreSQL variables", () => {
    const databaseUrl = "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
    const splitPrefix = "PG";

    expect(
      resolveDatabaseUrl("development", {
        DATABASE_URL: databaseUrl,
        [`${splitPrefix}DATABASE`]: "gamified_learning",
        [`${splitPrefix}HOST`]: "localhost",
        [`${splitPrefix}PORT`]: "5432",
        [`${splitPrefix}USER`]: "postgres",
        [`${splitPrefix}PASSWORD`]: "postgres",
      })
    ).toBe(databaseUrl);
  });

  test("requires DATABASE_URL outside tests", () => {
    expect(() => resolveDatabaseUrl("development", {})).toThrow(
      "DATABASE_URL must be set"
    );
  });

  test("requires TEST_DATABASE_URL in tests", () => {
    expect(() => resolveDatabaseUrl("test", {})).toThrow(
      "TEST_DATABASE_URL must be set when NODE_ENV=test"
    );
  });

  test("rejects remote test database hosts", () => {
    expect(() =>
      resolveDatabaseUrl("test", {
        TEST_DATABASE_URL:
          "postgresql://postgres:password@db.example.supabase.co:5432/postgres",
      })
    ).toThrow("Refusing to run tests against non-local database host");
  });
});
