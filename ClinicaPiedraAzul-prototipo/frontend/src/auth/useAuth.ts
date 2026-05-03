import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { decodeTokenPayload, setAccessTokenGetter, UserRole } from "./authService";

const ROLE_CLAIM = "https://piedrazul.com/roles";

const normalizeRole = (role: string): UserRole | null => {
  const value = role.toLowerCase();
  if (value === "admin" || value === "administrator" || value === "administrador") {
    return "admin";
  }
  if (value === "scheduler" || value === "agendador") {
    return "scheduler";
  }
  if (value === "sheduler") {
    return "scheduler";
  }
  if (value === "patient" || value === "paciente") {
    return "patient";
  }
  return null;
};

const resolveRawRoles = (user: unknown): string[] => {
  const claims = user as Record<string, unknown> | null | undefined;
  const roles = claims?.[ROLE_CLAIM];
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.filter((role): role is string => typeof role === "string");
};

const resolveUserRoles = (user: unknown): UserRole[] => {
  return resolveRawRoles(user)
    .map((role) => normalizeRole(role))
    .filter((role): role is UserRole => Boolean(role));
};

const resolveUserRole = (user: unknown): UserRole | null => {
  const roles = resolveUserRoles(user);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("scheduler")) return "scheduler";
  if (roles.includes("patient")) return "patient";
  return null;
};

/**
 * Auth0 wrapper hook exposing auth state and role helpers.
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();
  const [idTokenClaims, setIdTokenClaims] = useState<Record<string, unknown> | null>(null);
  const [roleClaims, setRoleClaims] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setAccessTokenGetter(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIdTokenClaims(null);
      setRoleClaims(null);
      return;
    }
    const loadClaims = async () => {
      const claims = await getIdTokenClaims();
      setIdTokenClaims(claims ?? null);
      if (claims?.[ROLE_CLAIM]) {
        setRoleClaims(claims);
        return;
      }
      try {
        const accessToken = await getAccessTokenSilently();
        const payload = decodeTokenPayload(accessToken);
        setRoleClaims(payload);
      } catch {
        setRoleClaims(null);
      }
    };
    loadClaims();
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated]);

  const claimsSource = roleClaims ?? idTokenClaims ?? user;
  const getUserRole = () => resolveUserRole(claimsSource);
  const getUserRoles = () => resolveUserRoles(claimsSource);
  const getRawRoles = () => resolveRawRoles(claimsSource);

  const hasRole = (role: string) => {
    const currentRole = getUserRole();
    return Boolean(currentRole && currentRole === role);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getUserRole,
    getUserRoles,
    getRawRoles,
    hasRole,
  };
};
