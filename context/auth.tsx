import { createContext, ReactNode, useContext } from "react";

import { GoogleUser, useGoogleAuth } from "@/hooks/use-google-auth";

interface AuthContextValue {
  user: GoogleUser | null;
  loading: boolean;
  error: string | null;
  request: ReturnType<typeof useGoogleAuth>["request"];
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useGoogleAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
