import {
  CalendarDays,
  Globe,
  Stethoscope,
  Users,
  Settings,
  Hospital,
  QrCode,
} from "lucide-react";

interface SidebarProps {
  setVista: (vista: string) => void;
  activeVista: string;
  rol: "admin" | "agendador" | "paciente" | "medico";
}

function Sidebar({ setVista, activeVista, rol }: SidebarProps) {
  const menuItemsAdmin = [
    { id: "citas", icon: CalendarDays, label: "Agenda de Citas" },
    { id: "medicos", icon: Stethoscope, label: "Especialistas" },
    { id: "pacientes", icon: Users, label: "Pacientes" },
    { id: "configuracion", icon: Settings, label: "Configuración Global" },
    { id: "validar", icon: QrCode, label: "Validar Códigos QR" },
  ];

  const menuItemsAgendador = [
    { id: "citas", icon: CalendarDays, label: "Agenda de Citas" },
    { id: "agendar-web", icon: Globe, label: "Reserva en Línea" },
    { id: "medicos", icon: Stethoscope, label: "Especialistas" },
    { id: "pacientes", icon: Users, label: "Pacientes" },
    { id: "validar", icon: QrCode, label: "Validar Códigos QR" },
  ];

  const menuItemsPaciente = [
    { id: "agendar-web", icon: Globe, label: "Agendar Cita" },
    { id: "mis-citas", icon: CalendarDays, label: "Mis Citas" },
  ];

  const menuItemsMedico = [
    { id: "mis-citas", icon: CalendarDays, label: "Mis Citas" },
    { id: "validar", icon: QrCode, label: "Validar Entrada" },
  ];

  const menuItems =
    rol === "admin"
      ? menuItemsAdmin
      : rol === "agendador"
      ? menuItemsAgendador
      : rol === "medico"
      ? menuItemsMedico
      : menuItemsPaciente;

  const handleClick = (id: string) => {
    setVista(id);
  };

  const getRoleTitle = () => {
    if (rol === "admin") return "Dashboard Administrador";
    if (rol === "agendador") return "Dashboard Agendador";
    if (rol === "medico") return "Panel Médico";
    return "Portal Paciente";
  };

  const getRoleDescription = () => {
    if (rol === "admin") return "Configuración y control del sistema";
    if (rol === "agendador") return "Gestión de citas y pacientes";
    if (rol === "medico") return "Seguimiento de tus citas";
    return "Autogestión de citas médicas";
  };

  const getRoleInfo = () => {
    if (rol === "admin") {
      return [
        "Configura ventana de agenda",
        "Define horarios por médico",
        "Gestiona especialistas",
        "Acceso total al sistema",
      ];
    }
    if (rol === "agendador") {
      return [
        "Crea y gestiona citas",
        "Registra nuevos pacientes",
        "Consulta disponibilidad",
        "Solo lectura de especialistas",
      ];
    }
    if (rol === "medico") {
      return [
        "Consulta tu agenda",
        "Reagenda citas",
        "Registra asistencia",
        "Ver historial de cambios",
      ];
    }
    return [
      "Selecciona especialidad",
      "Elige médico y horario",
      "Confirma tu cita",
      "Descarga tu código QR",
    ];
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Hospital size={22} />
        </div>
        <div className="brand-text">
          <h2>{getRoleTitle()}</h2>
          <p>{getRoleDescription()}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeVista === item.id ? "active" : ""}`}
            onClick={() => handleClick(item.id)}
          >
            <span className="nav-icon">
              <item.icon size={18} />
            </span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p>Funcionalidades disponibles</p>
          <ul>
            {getRoleInfo().map((text, idx) => (
              <li key={idx}>
                <span className="list-dot" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;