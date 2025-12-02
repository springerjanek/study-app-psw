import { useAuth } from "@/auth/AuthContext";

export function useAuthFetch() {
  const { token, logout } = useAuth();

  const authFetch = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };
    const response = await fetch(`http://localhost:7777/api${url}`, config);

    if (response.status === 401) {
      logout();
      throw new Error("Authentication failed");
    }

    const data = await response.json();

    if (!response.ok) {
      // Instead of throwing, return the JSON with success=false
      return { success: false, ...data };
    }

    return data;
  };

  return { authFetch };
}
