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
    const response = await fetch(`https://localhost:7777/api${url}`, config);

    if (response.status === 401) {
      logout();
      throw new Error("Authentication failed");
    }

    const data = await response.json();

    if (!response.ok) {
      return { success: false, ...data };
    }

    return data;
  };

  return { authFetch };
}
