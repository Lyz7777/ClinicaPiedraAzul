export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: "openid profile email",
  },
};

const hasPlaceholder = (value: string | undefined, placeholder: string) => {
  if (!value) return true;
  return value.includes(placeholder);
};

export const isAuth0Configured = !(
  hasPlaceholder(import.meta.env.VITE_AUTH0_DOMAIN, "your-tenant.auth0.com") ||
  hasPlaceholder(import.meta.env.VITE_AUTH0_CLIENT_ID, "your-client-id-here")
);
