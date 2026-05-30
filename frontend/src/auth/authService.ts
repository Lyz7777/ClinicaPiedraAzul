export type UserRole = "admin" | "agendador" | "paciente" | "medico";

export interface AuthUser {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

type AccessTokenGetter = () => Promise<string>;

let accessTokenGetter: AccessTokenGetter | null = null;

export const setAccessTokenGetter = (getter: AccessTokenGetter) => {
  accessTokenGetter = getter;
};

export const getAuthHeaders = async () => {
  if (!accessTokenGetter) {
    throw new Error("Access token getter not configured.");
  }
  const token = await accessTokenGetter();
  return { Authorization: `Bearer ${token}` };
};

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