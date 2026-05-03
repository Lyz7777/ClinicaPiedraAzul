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
            <div className="login-icon"><HeartPulse size={30} /></div>
            <h1>PiedraAzul Salud</h1>
            <p>Plataforma de gestión clínica inteligente</p>
          </div>

          <div className="login-form">
            <p style={{ marginBottom: "1rem", opacity: 0.75 }}>
              Seras redirigido a nuestro portal seguro de autenticacion
            </p>
            <button
              className="login-submit-btn"
              onClick={() => loginWithRedirect()}
            >
              Iniciar sesion con Auth0
            </button>
            {!isAuth0Configured && (
              <p style={{ marginTop: "0.75rem", opacity: 0.75 }}>
                Configura las variables de entorno de Auth0 en .env para continuar.
                {domainValue ? ` Dominio actual: ${domainValue}` : " Dominio actual: no definido"}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="login-panel login-panel-right">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h2>
            Agenda, coordina y
            <br />
            atiende mejor
          </h2>
          <p>
            Visualiza disponibilidad en tiempo real, optimiza el flujo de citas y brinda una experiencia moderna a tus pacientes.
          </p>
          <div className="hero-stats">
            <div>
              <strong>24/7</strong>
              <span>Operación continua</span>
            </div>
            <div>
              <strong>99.9%</strong>
              <span>Disponibilidad</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;