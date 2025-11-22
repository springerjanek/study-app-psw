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

    try {
      const response = await fetch(`http://localhost:7777/api${url}`, config);

      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error("Authentication failed");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  };

  return { authFetch };
}
