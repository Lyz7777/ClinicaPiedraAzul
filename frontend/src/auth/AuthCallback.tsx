import type { CSSProperties } from "react";
import { useEffect } from "react";
import { HeartPulse } from "lucide-react";
import { useAuth } from "./useAuth";
import { isAuth0Configured } from "./auth0-config";

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

function AuthCallback() {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole();
      if (role) {
        window.history.replaceState(null, "", window.location.origin);
      }
    }
  }, [isAuthenticated, isLoading, getUserRole]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div className="login-icon" style={{ marginBottom: "1rem" }}>
          <HeartPulse size={34} />
        </div>
        <h2>Verificando credenciales</h2>
        <p style={{ opacity: 0.75 }}>
          {isAuth0Configured
            ? "Estamos preparando tu panel seguro."
            : "Faltan las variables de Auth0 en .env. Actualiza la configuracion para continuar."}
        </p>
        {isAuth0Configured && <div className="loading-spinner" style={{ marginTop: "1.5rem" }} />}
      </div>
    </div>
  );
}

export default AuthCallback;