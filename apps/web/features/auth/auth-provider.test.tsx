import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, afterEach } from "vitest";
import { AuthProvider } from "./auth-provider";
import { useAuth } from "./use-auth";

vi.mock("next/navigation", () => ({
  usePathname: () => "/parents",
}));

function Probe() {
  const { status, user } = useAuth();
  return (
    <div>
      <span>{status}</span>
      <span>{user?.username}</span>
    </div>
  );
}

const user = {
  id: 1,
  username: "alex123",
  display_name: "Alex",
  email: "alex@example.test",
  profile_image_url: "",
  is_parent: true,
  total_children: 0,
  timezone: "Europe/London",
  user_preferences: {
    notificationsEnabled: true,
    theme: "light",
    language: "en",
    has_pin: false,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AuthProvider", () => {
  test("settles to unauthenticated when refresh fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Refresh token is required" }), {
          status: 400,
        })
      )
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(await screen.findByText("unauthenticated")).toBeInTheDocument();
  });

  test("loads the current user after a successful refresh", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "success",
            data: { accessToken: "access", refreshToken: "refresh" },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "success",
            data: { user },
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("authenticated")).toBeInTheDocument();
      expect(screen.getByText("alex123")).toBeInTheDocument();
    });
  });
});
