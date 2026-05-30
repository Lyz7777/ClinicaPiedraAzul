export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: "http://localhost:5173",
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: "openid profile email",
  },
  cacheLocation: "localstorage",
};

export const isAuth0Configured = true;