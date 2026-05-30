import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { decodeTokenPayload, setAccessTokenGetter, UserRole } from "./authService";

const ROLE_CLAIM = "https://piedrazul.com/roles";

const normalizeRole = (role: string): UserRole | null => {
  const value = role.toLowerCase();
  if (value === "admin" || value === "administrator" || value === "administrador") {
    return "admin";
  }
  if (value === "scheduler" || value === "sheduler" || value === "agendador") {
    return "agendador";
  }
  if (value === "patient" || value === "paciente") {
    return "paciente";
  }
  if (value === "medico" || value === "terapista") {
    return "medico";
  }
  return null;
};


const resolveRawRoles = (user: unknown): string[] => {
  const claims = user as Record<string, unknown> | null | undefined;
  
  // obtener roles del claim de Auth0
  const roles = claims?.[ROLE_CLAIM];
  if (Array.isArray(roles) && roles.length > 0) {
    return roles.filter((role): role is string => typeof role === "string");
  }
  
  // buscar en app_metadata si existe
  const appMetadata = claims?.["https://piedrazul.com/app_metadata"] as Record<string, unknown> | undefined;
  const appRoles = appMetadata?.roles;
  if (Array.isArray(appRoles) && appRoles.length > 0) {
    return appRoles.filter((role): role is string => typeof role === "string");
  }
  
  //asignar rol por email si no hay roles en el token
  const email = (claims?.email as string) || '';
  if (email === 'admin@gmail.com') return ['admin'];
  if (email === 'agendador@gmail.com') return ['agendador'];
  if (email === 'medico@gmail.com') return ['medico'];
  if (email === 'paciente@gmail.com') return ['paciente'];
  
  return ['paciente'];
};

const resolveUserRoles = (user: unknown): UserRole[] => {
  return resolveRawRoles(user)
    .map((role) => normalizeRole(role))
    .filter((role): role is UserRole => Boolean(role));
};

const resolveUserRole = (user: unknown): UserRole | null => {
  const roles = resolveUserRoles(user);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("agendador")) return "agendador";
  if (roles.includes("medico")) return "medico";
  if (roles.includes("paciente")) return "paciente";
  return null;
};

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

  // PRIMERO usar user (tiene email), luego roleClaims, luego idTokenClaims
  const claimsSource = user ?? roleClaims ?? idTokenClaims;
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