import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "skill-spark.refresh-token";
const SELECTED_CHILD_KEY = "skill-spark.selected-child-id";

export type RefreshTokenStorage = {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearRefreshToken(): Promise<void>;
};

export type SelectedChildStorage = {
  getSelectedChildId(): Promise<number | null>;
  setSelectedChildId(childId: number): Promise<void>;
  clearSelectedChildId(): Promise<void>;
};

export const secureRefreshTokenStorage: RefreshTokenStorage = {
  getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string) {
    return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },
  clearRefreshToken() {
    return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

export const selectedChildStorage: SelectedChildStorage = {
  async getSelectedChildId() {
    const value = await AsyncStorage.getItem(SELECTED_CHILD_KEY);
    if (!value) return null;

    const childId = Number(value);
    return Number.isInteger(childId) && childId > 0 ? childId : null;
  },
  setSelectedChildId(childId: number) {
    return AsyncStorage.setItem(SELECTED_CHILD_KEY, String(childId));
  },
  clearSelectedChildId() {
    return AsyncStorage.removeItem(SELECTED_CHILD_KEY);
  },
};
