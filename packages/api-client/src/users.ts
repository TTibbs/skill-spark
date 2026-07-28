import type {
  PinPreferencesResponse,
  SetPinInput,
  UserResponse,
  VerifyPinInput,
  VerifyPinResponse,
} from "@skill-spark/contracts";
import type { ApiClient } from "./client";

export const createUsersApi = (client: ApiClient) => ({
  getUser(id: number, signal?: AbortSignal) {
    return client.get<UserResponse>(`/users/${id}`, { signal });
  },

  setPin(input: SetPinInput, signal?: AbortSignal) {
    return client.post<PinPreferencesResponse>("/users/me/pin", {
      body: input,
      signal,
    });
  },

  verifyPin(input: VerifyPinInput, signal?: AbortSignal) {
    return client.post<VerifyPinResponse>("/users/me/pin/verify", {
      body: input,
      signal,
    });
  },

  deletePin(signal?: AbortSignal) {
    return client.delete<PinPreferencesResponse>("/users/me/pin", { signal });
  },
});

export type UsersApi = ReturnType<typeof createUsersApi>;
