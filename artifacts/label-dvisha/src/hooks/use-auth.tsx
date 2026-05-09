import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ld_token"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set the global token getter for the API client
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  // Fetch current user if we have a token but no user
  const { data: me, isLoading: isLoadingMe } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token && !user,
      retry: false,
    }
  });

  useEffect(() => {
    if (me) {
      setUser(me);
    }
    if (!isLoadingMe) {
      setIsLoading(false);
    }
  }, [me, isLoadingMe]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("ld_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("ld_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isLoading: isLoading || (!!token && !user && isLoadingMe),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
