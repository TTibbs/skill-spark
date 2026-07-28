import { ApiError } from "./errors";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void | Promise<void>;
  fetch?: typeof fetch;
  credentials?: RequestCredentials;
};

export type RequestOptions = {
  body?: unknown;
  signal?: AbortSignal;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: ApiClientOptions["getAccessToken"];
  private readonly onUnauthorized?: ApiClientOptions["onUnauthorized"];
  private readonly fetchImpl: typeof fetch;
  private readonly credentials?: RequestCredentials;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.getAccessToken = options.getAccessToken;
    this.onUnauthorized = options.onUnauthorized;
    this.fetchImpl = options.fetch || globalThis.fetch.bind(globalThis);
    this.credentials = options.credentials;
  }

  get<TResponse>(path: string, options: RequestOptions = {}) {
    return this.request<TResponse>("GET", path, options);
  }

  post<TResponse>(path: string, options: RequestOptions = {}) {
    return this.request<TResponse>("POST", path, options);
  }

  patch<TResponse>(path: string, options: RequestOptions = {}) {
    return this.request<TResponse>("PATCH", path, options);
  }

  delete<TResponse>(path: string, options: RequestOptions = {}) {
    return this.request<TResponse>("DELETE", path, options);
  }

  async request<TResponse>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {}
  ): Promise<TResponse> {
    const headers = new Headers();
    const init: RequestInit = {
      method,
      headers,
      signal: options.signal,
      credentials: this.credentials,
    };

    const accessToken = await this.getAccessToken?.();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
    const parsedBody = await parseResponseBody(response);

    if (!response.ok) {
      if (response.status === 401) {
        await this.onUnauthorized?.();
      }
      throw new ApiError(response.status, asErrorBody(parsedBody));
    }

    return parsedBody as TResponse;
  }
}

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
};

const asErrorBody = (body: unknown): { message: string } | null => {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const maybeError = body as { message?: unknown };
  if (typeof maybeError.message === "string") {
    return maybeError as { message: string };
  }

  return null;
};

export const createApiClient = (options: ApiClientOptions) =>
  new ApiClient(options);
