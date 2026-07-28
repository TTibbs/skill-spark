declare module "pg" {
  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    ssl?: {
      rejectUnauthorized: boolean;
    };
  }

  export class Pool {
    constructor(config: PoolConfig);
    query<T>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export interface PoolClient {
    query<T>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
    release(): void;
  }
}
