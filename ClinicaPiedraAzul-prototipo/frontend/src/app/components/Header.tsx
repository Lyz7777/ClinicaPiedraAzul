import { useEffect, useState } from "react";
import { Cross, LogOut, UserRound } from "lucide-react";

function Header() {
  const [usuario, setUsuario] = useState("");
  const [rol, setRol] = useState("");
  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("rol") || "admin";
    const savedUsername = localStorage.getItem("username") || "Admin";
    setRol(savedRole);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuario(payload.username || payload.sub || "Admin");
      } catch {
        setUsuario(savedUsername);
      }
    } else {
      setUsuario(savedUsername);
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("username");
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-circle">
          <Cross size={20} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <h1>Clínica PiedraAzul</h1>
          <span className="header-subtitle">Centro de Especialidades Médicas</span>
        </div>
      </div>
      <div className="header-user">
        <div className="header-meta">
          <span className="status-pill">
            <span className="status-dot" />
            Sistema activo
          </span>
          <span className="header-date">{fechaHoy}</span>
        </div>
        <div className="user-avatar">
          <UserRound size={20} />
        </div>
        <div className="user-info">
          <span className="user-greeting">Bienvenido</span>
          <span className="user-name">{usuario}</span>
          <span className="user-greeting" style={{ textTransform: "capitalize" }}>
            {rol}
          </span>
        </div>
        <button className="logout-btn" onClick={cerrarSesion}>
          <LogOut size={14} />
          Salir
        </button>
      </div>
    </header>
  );
}

export default Header;