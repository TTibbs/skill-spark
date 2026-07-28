"use client";

import * as React from "react";
import type {
  AuthenticatedUser,
  LoginInput,
  RegisterInput,
} from "@skill-spark/contracts";
import type { BrowserChildrenApi } from "@/features/children/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  login(input: LoginInput): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
  refreshSession(): Promise<boolean>;
  hasAccessToken(): boolean;
  createChildrenApi(): BrowserChildrenApi;
};

export const AuthContext = React.createContext<AuthContextValue | null>(null);
