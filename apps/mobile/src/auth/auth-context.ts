import { createContext } from "react";
import type { LoginInput, AuthenticatedUser } from "@skill-spark/contracts";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  accessToken: string | null;
  login(input: LoginInput): Promise<void>;
  logout(): Promise<void>;
  refreshSession(): Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
