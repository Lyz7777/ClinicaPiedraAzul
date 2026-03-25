import {
  CalendarDays,
  Globe,
  Stethoscope,
  Users,
  Settings,
  Hospital,
} from "lucide-react";

function Sidebar({ setVista, activeVista, rol }: any) {
  const menuItemsAdmin = [
    { id: "citas", icon: CalendarDays, label: "Agenda de Citas" },
    { id: "medicos", icon: Stethoscope, label: "Especialistas" },
    { id: "pacientes", icon: Users, label: "Pacientes" },
    { id: "configuracion", icon: Settings, label: "Configuración" }
  ];

  const menuItemsAgendador = [
    { id: "citas", icon: CalendarDays, label: "Agenda de Citas" },
    { id: "agendar-web", icon: Globe, label: "Reserva en Línea" },
    { id: "medicos", icon: Stethoscope, label: "Especialistas" },
    { id: "pacientes", icon: Users, label: "Pacientes" },
  ];

  const menuItemsPaciente = [
    { id: "agendar-web", icon: Globe, label: "Agendar Cita" },
  ];

  const menuItems =
    rol === "paciente"
      ? menuItemsPaciente
      : rol === "admin"
      ? menuItemsAdmin
      : menuItemsAgendador;

  const handleClick = (id: string) => {
    setVista(id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Hospital size={22} />
        </div>
        <div className="brand-text">
          <h2>
            {rol === "paciente"
              ? "Portal Paciente"
              : rol === "admin"
              ? "Dashboard Admin"
              : "Dashboard Agendador"}
          </h2>
          <p>
            {rol === "paciente"
              ? "Autogestión de citas médicas"
              : rol === "admin"
              ? "Configuración y control del sistema"
              : "Gestión y agenda inteligente"}
          </p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeVista === item.id ? "active" : ""}`}
            onClick={() => handleClick(item.id)}
          >
            <span className="nav-icon"><item.icon size={18} /></span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p>
            {rol === "paciente"
              ? "Tu acceso"
              : rol === "admin"
              ? "Resumen administrativo"
              : "Resumen del módulo"}
          </p>
          {rol === "paciente" ? (
            <ul>
              <li><span className="list-dot" />Selecciona especialidad</li>
              <li><span className="list-dot" />Elige médico y horario</li>
              <li><span className="list-dot" />Confirma tu cita</li>
            </ul>
          ) : rol === "admin" ? (
            <ul>
              <li><span className="list-dot" />Configura ventanas de agenda</li>
              <li><span className="list-dot" />Define horarios por médico</li>
              <li><span className="list-dot" />Gestiona especialistas y pacientes</li>
            </ul>
          ) : (
            <ul>
              <li><span className="list-dot" />Flujos por rol</li>
              <li><span className="list-dot" />Vista de disponibilidad</li>
              <li><span className="list-dot" />Registro de pacientes</li>
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;