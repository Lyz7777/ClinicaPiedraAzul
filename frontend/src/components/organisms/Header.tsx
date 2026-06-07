import { Cross, LogOut, UserRound } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

interface HeaderProps {
  esAnonimo?: boolean;
}

function Header({ esAnonimo = false }: HeaderProps) {
  const { user, getUserRole, logout } = useAuth();
  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "2-digit", month: "long",
  });
  
  const salir = () => {
    if (esAnonimo) {
      localStorage.removeItem('paciente_anonimo');
      window.location.href = '/login';
    } else {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  // Si es anónimo, mostrar información genérica
  if (esAnonimo) {
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
              Modo Paciente
            </span>
            <span className="header-date">{fechaHoy}</span>
          </div>
          <div className="user-avatar"><UserRound size={18} /></div>
          <div className="user-info">
            <span className="user-greeting-main">Bienvenido Paciente</span>
          </div>
          <button className="logout-btn" onClick={salir}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>
    );
  }

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
        <button className="logout-btn" onClick={salir}>
          <LogOut size={14} /> Salir
        </button>
      </div>
    </header>
  );
}
export default Header;