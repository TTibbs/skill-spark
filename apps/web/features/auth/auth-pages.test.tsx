import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi, beforeEach } from "vitest";
import { ApiError } from "@skill-spark/api-client";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import ForgotPasswordPage from "@/app/forgot-password/page";
import { useAuth } from "@/features/auth/use-auth";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const createChildrenApi = vi.fn();

beforeEach(() => {
  push.mockReset();
  createChildrenApi.mockReset();
  mockedUseAuth.mockReturnValue({
    user: null,
    status: "unauthenticated",
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
    hasAccessToken: vi.fn().mockReturnValue(false),
    createChildrenApi,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("auth pages", () => {
  test("validates the login form", async () => {
    render(<LoginPage />);

    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      screen.getByText("Enter your email or username and password.")
    ).toBeInTheDocument();
  });

  test("shows login API errors", async () => {
    const login = vi
      .fn()
      .mockRejectedValue(new ApiError(401, { message: "Invalid email or password" }));
    mockedUseAuth.mockReturnValue({
      user: null,
      status: "unauthenticated",
      login,
      register: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasAccessToken: vi.fn().mockReturnValue(false),
      createChildrenApi,
    });
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email or username/i), "alex");
    await userEvent.type(screen.getByLabelText(/^password$/i), "badpassword");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  test("validates registration password confirmation", async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/username/i), "alex123");
    await userEvent.type(screen.getByLabelText(/email/i), "alex@example.test");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      "password456"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  test("shows the generic forgot-password completion message", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          message:
            "If your account exists, you will receive a password reset email shortly",
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ForgotPasswordPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "alex@example.test");
    await userEvent.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "If your account exists, you will receive a password reset email shortly"
        )
      ).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });
});
