"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./use-auth";

export function AuthNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, logout } = useAuth();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  const isProtectedAppPage =
    pathname?.startsWith("/parents") ||
    pathname?.startsWith("/chores") ||
    pathname?.startsWith("/rewards") ||
    false;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (status === "loading" || isAuthPage || isProtectedAppPage) {
    return null;
  }

  if (status === "authenticated") {
    return (
      <div className="fixed right-4 top-4 z-50 flex gap-2">
        <Link
          href="/parents"
          className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#244137] shadow-sm ring-1 ring-[#d5e2d8]"
        >
          Parent dashboard
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-[#244137] px-4 py-2 text-sm font-bold text-white shadow-sm"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex gap-2">
      <Link
        href="/login"
        className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#244137] shadow-sm ring-1 ring-[#d5e2d8]"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-[#244137] px-4 py-2 text-sm font-bold text-white shadow-sm"
      >
        Register
      </Link>
    </div>
  );
}
