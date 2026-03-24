import {
  CalendarDays,
  Globe,
  Stethoscope,
  Users,
  Settings,
  Hospital,
} from "lucide-react";

function Sidebar({ setVista, activeVista }: any) {

  const menuItems = [
    { id: "citas", icon: CalendarDays, label: "Agenda de Citas" },
    { id: "agendar-web", icon: Globe, label: "Reserva en Línea" },
    { id: "medicos", icon: Stethoscope, label: "Especialistas" },
    { id: "pacientes", icon: Users, label: "Pacientes" },
    { id: "configuracion", icon: Settings, label: "Configuración" }
  ];

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
          <h2>Panel Clínico</h2>
          <p>Gestión y agenda inteligente</p>
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
          <p>Resumen del módulo</p>
          <ul>
            <li><span className="list-dot" />Flujos por rol</li>
            <li><span className="list-dot" />Vista de disponibilidad</li>
            <li><span className="list-dot" />Registro de pacientes</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;