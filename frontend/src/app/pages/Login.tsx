import { HeartPulse } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { isAuth0Configured } from "../../auth/auth0-config";

function Login() {
  const { loginWithRedirect } = useAuth();
  const domainValue = import.meta.env.VITE_AUTH0_DOMAIN;

  return (
    <div className="login-shell">
      <section className="login-panel login-panel-left">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon"><HeartPulse size={26} color="white" /></div>
            <h1>PiedraAzul Salud</h1>
            <p>Plataforma de gestión clínica inteligente</p>
          </div>
          <div className="login-form">
            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 4 }}>
              Serás redirigido al portal seguro de autenticación
            </p>
            <button className="login-submit-btn" onClick={() => loginWithRedirect()}>
              Iniciar sesión con Auth0
            </button>
            {!isAuth0Configured && (
              <div className="login-warning">
                ⚠️ Configura las variables de entorno de Auth0 en <code>.env</code> para continuar.
                {domainValue ? ` Dominio actual: ${domainValue}` : " Dominio: no definido"}
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="login-panel login-panel-right">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h2>Agenda, coordina y atiende mejor</h2>
          <p>Visualiza disponibilidad en tiempo real, optimiza el flujo de citas y brinda una experiencia moderna a tus pacientes.</p>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            {[["24/7", "Operación continua"], ["99.9%", "Disponibilidad"], ["4 roles", "Control de acceso"]].map(([v, l]) => (
              <div key={v} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 16px", textAlign: "center", flex: 1 }}>
                <strong style={{ display: "block", fontSize: "1.2rem", fontWeight: 700, color: "white" }}>{v}</strong>
                <span style={{ fontSize: "0.68rem", opacity: 0.85, color: "rgba(255,255,255,0.9)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
export default Login;