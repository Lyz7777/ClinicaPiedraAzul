import { useState } from "react";

function Login({ onLogin }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🏥</div>
          <h1>Clínica PiedraAzul</h1>
          <p>Sistema de Reserva de Citas Médicas</p>
        </div>
        
        <div className="login-form">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && login()}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && login()}
          />
          <button onClick={login} disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar al Sistema"}
          </button>
        </div>
        
        <div className="login-footer">
          <small>Credenciales de prueba: admin / admin</small>
        </div>
      </div>
    </div>
  );
}

export default Login;