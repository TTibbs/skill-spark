export function getApiBaseUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is required. Use your development machine LAN IP, for example http://192.168.1.136:8181/api."
    );
  }

  if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
    console.warn(
      "EXPO_PUBLIC_API_URL points to localhost. Physical devices need your development machine LAN IP."
    );
  }

  return apiUrl.replace(/\/+$/, "");
}
