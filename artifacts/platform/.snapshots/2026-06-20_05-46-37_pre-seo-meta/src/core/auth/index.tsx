/**
 * @protected CORE ENGINE — src/core/auth/index.tsx
 * User session context and permission guard component.
 * Do not modify without approval.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logger } from "@/core/observability/logger";

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = "guest" | "user" | "admin" | "enterprise";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  plan: "free" | "pro" | "enterprise";
  sessionToken?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  hasPermission: (permission: string) => boolean;
}

// ── Permission Map ────────────────────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  guest: ["read:public"],
  user: ["read:public", "read:own", "write:own", "build:basic"],
  admin: ["read:public", "read:own", "write:own", "build:basic", "build:advanced", "admin:users"],
  enterprise: ["read:public", "read:own", "write:own", "build:basic", "build:advanced", "admin:users", "enterprise:all"],
};

// ── Default guest user (unauthenticated state) ────────────────────────────────
function loadLocalUser(): AuthUser {
  try {
    const stored = localStorage.getItem("sync_settings");
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      id: "local-user",
      name: parsed.name ?? "Developer",
      email: parsed.email ?? "dev@example.com",
      avatarUrl: parsed.avatarUrl ?? "",
      role: "user",
      plan: parsed.plan ?? "free",
    };
  } catch {
    return { id: "local-user", name: "Developer", email: "dev@example.com", role: "user", plan: "free" };
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // For now, we use the local settings as the "auth" state.
  // This is a scaffold — real auth (JWT, OAuth) plugs in here without changing features.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const localUser = loadLocalUser();
    setUser(localUser);
    setIsLoading(false);
    logger.info("Auth", "Session initialized", { userId: localUser.id, role: localUser.role });
  }, []);

  const signIn = async (_credentials: { email: string; password: string }) => {
    // Stub: replace with real auth call
    logger.audit("Auth", "Sign-in attempted", { email: _credentials.email });
    const localUser = loadLocalUser();
    setUser(localUser);
  };

  const signOut = () => {
    logger.audit("Auth", "User signed out", { userId: user?.id });
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/**
 * Guard component — renders children only if user has the required permission.
 * Renders `fallback` otherwise (defaults to null).
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
