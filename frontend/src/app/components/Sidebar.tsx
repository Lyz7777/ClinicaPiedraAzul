import { useState } from "react";

function Sidebar({ setVista }: any) {
  const [active, setActive] = useState("citas");

  const menuItems = [
    { id: "citas", icon: "📅", label: "Agenda de Citas" },
    { id: "agendar-web", icon: "🌐", label: "Reserva en Línea" },
    { id: "medicos", icon: "👨‍⚕️", label: "Especialistas" },
    { id: "pacientes", icon: "👤", label: "Pacientes" },
    { id: "configuracion", icon: "⚙️", label: "Configuración" }
  ];

  const handleClick = (id: string) => {
    setActive(id);
    setVista(id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#5e35b1" stroke="#5e35b1" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
          </svg>
        </div>
        <div className="brand-text">
          <h2>Clínica PiedraAzul</h2>
          <p>Centro de Especialidades</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => handleClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p>Atención médica integral</p>
          <ul>
            <li>✓ Agendamiento rápido</li>
            <li>✓ Especialistas certificados</li>
            <li>✓ Horarios flexibles</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;