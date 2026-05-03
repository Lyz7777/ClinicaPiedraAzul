export type UserRole = "admin" | "scheduler" | "patient";

export interface AuthUser {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

type AccessTokenGetter = () => Promise<string>;

let accessTokenGetter: AccessTokenGetter | null = null;

/**
 * Registers a token getter so non-React services can request a fresh token.
 */
export const setAccessTokenGetter = (getter: AccessTokenGetter) => {
  accessTokenGetter = getter;
};

/**
 * Retrieves auth headers with a fresh access token.
 */
export const getAuthHeaders = async () => {
  if (!accessTokenGetter) {
    throw new Error("Access token getter not configured.");
  }
  const token = await accessTokenGetter();
  return { Authorization: `Bearer ${token}` };
};

/**
 * Decodes the JWT payload for debugging (no signature verification).
 */
export const decodeTokenPayload = (token: string) => {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const json = atob(padded);
  return JSON.parse(json) as Record<string, unknown>;
};
