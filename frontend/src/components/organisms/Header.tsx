import { Cross, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

function Header() {
  const { user, getUserRole, logout } = useAuth();
  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "2-digit", month: "long",
  });
  const role = getUserRole();
  const roleLabel = role === "admin" ? "Administrador"
    : role === "agendador" ? "Agendador"
    : role === "medico" ? "Médico"
    : role === "paciente" ? "Paciente" : "";
  const displayName = user?.name || user?.email || "Usuario";
  const greetingTarget = roleLabel || displayName;

  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-circle">
          <Cross size={18} strokeWidth={2.5} />
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
        <div className="user-avatar"><UserRound size={18} /></div>
        <div className="user-info">
          <span className="user-greeting-main">Bienvenido {greetingTarget}</span>
        </div>
        <button
          className="logout-btn"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          <LogOut size={14} /> Salir
        </button>
      </div>
    </header>
  );
}
export default Header;