import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

const containerStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(59, 130, 246, 0.18))",
};

const cardStyle: CSSProperties = {
  background: "rgba(15, 23, 42, 0.86)",
  color: "white",
  padding: "2.5rem",
  borderRadius: "20px",
  textAlign: "center",
  maxWidth: "420px",
  width: "90%",
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
};

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect, getUserRole, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div className="loading-spinner" />
          <h2 style={{ marginTop: "1.25rem" }}>Verificando acceso</h2>
          <p style={{ opacity: 0.75 }}>Conectando con el portal seguro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>Redirigiendo a Auth0</h2>
          <p style={{ opacity: 0.75 }}>Espera un momento...</p>
        </div>
      </div>
    );
  }

  const role = getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>Acceso denegado</h2>
          <p style={{ opacity: 0.75, marginBottom: "1.5rem" }}>
            Tu cuenta no tiene permisos para ver este panel.
          </p>
          <button
            className="login-submit-btn"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;