import { useState } from "react";
import { HeartPulse, ShieldUser, ClipboardList, UserRound } from "lucide-react";

function Login({ onLogin }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"admin" | "agendador" | "paciente">("admin");
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!username || !password) {
      alert("Por favor ingrese usuario y contraseña");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        alert(" Usuario o contraseña incorrectos");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      onLogin();
    } catch (error) {
      console.error("Error en login:", error);
      alert(" Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-panel login-panel-left">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon"><HeartPulse size={30} /></div>
            <h1>PiedraAzul Salud</h1>
            <p>Plataforma de gestión clínica inteligente</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={`role-chip ${rol === "admin" ? "active" : ""}`}
              onClick={() => setRol("admin")}
            >
              <span><ShieldUser size={16} /></span>
              Admin
            </button>
            <button
              type="button"
              className={`role-chip ${rol === "agendador" ? "active" : ""}`}
              onClick={() => setRol("agendador")}
            >
              <span><ClipboardList size={16} /></span>
              Agendador
            </button>
            <button
              type="button"
              className={`role-chip ${rol === "paciente" ? "active" : ""}`}
              onClick={() => setRol("paciente")}
            >
              <span><UserRound size={16} /></span>
              Paciente
            </button>
          </div>

          <div className="login-form">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <button onClick={login} disabled={cargando}>
              {cargando ? "Ingresando..." : "Entrar al sistema"}
            </button>
          </div>

          <div className="login-footer">
            <small>Credenciales de prueba: admin / admin</small>
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