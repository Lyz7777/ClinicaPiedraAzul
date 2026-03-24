import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock3,
  Activity,
  Stethoscope,
  ShieldCheck,
  FolderKanban,
  Users,
  UserPlus,
  Repeat,
  Globe,
  TrendingUp,
  Zap,
  Settings,
  SlidersHorizontal,
  CheckCircle2,
  UserCog,
} from "lucide-react";
import Login from "./app/components/Login";
import Sidebar from "./app/components/Sidebar";
import Header from "./app/components/Header";
import Footer from "./app/components/Footer";
import Citas from "./app/pages/citas";
import Medicos from "./app/pages/medicos";
import Pacientes from "./app/pages/pacientes";
import AgendarWeb from "./app/components/AgendarWeb";
import "./style.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rolActivo, setRolActivo] = useState<"admin" | "agendador" | "paciente">("admin");
  const [vista, setVista] = useState("citas");

  const metricasVista: Record<string, { titulo: string; valor: string; nota: string; icono: any }[]> = {
    citas: [
      { titulo: "Citas hoy", valor: "18", nota: "6 confirmadas", icono: CalendarDays },
      { titulo: "Disponibilidad", valor: "82%", nota: "Promedio semanal", icono: Clock3 },
      { titulo: "No-show", valor: "4%", nota: "Últimos 30 días", icono: Activity },
    ],
    medicos: [
      { titulo: "Especialistas", valor: "12", nota: "9 activos hoy", icono: Stethoscope },
      { titulo: "Cobertura", valor: "7", nota: "Especialidades", icono: ShieldCheck },
      { titulo: "Turnos", valor: "132", nota: "Disponibles esta semana", icono: FolderKanban },
    ],
    pacientes: [
      { titulo: "Pacientes", valor: "246", nota: "Base registrada", icono: Users },
      { titulo: "Nuevos", valor: "14", nota: "Este mes", icono: UserPlus },
      { titulo: "Retención", valor: "74%", nota: "Pacientes recurrentes", icono: Repeat },
    ],
    "agendar-web": [
      { titulo: "Solicitudes web", valor: "31", nota: "Últimas 24h", icono: Globe },
      { titulo: "Conversión", valor: "67%", nota: "Solicitud a cita", icono: TrendingUp },
      { titulo: "Tiempo medio", valor: "2m", nota: "Por agendamiento", icono: Zap },
    ],
    configuracion: [
      { titulo: "Ventana", valor: "4 sem", nota: "Rango activo", icono: Settings },
      { titulo: "Reglas", valor: "9", nota: "Políticas configuradas", icono: SlidersHorizontal },
      { titulo: "Auditoría", valor: "OK", nota: "Sin alertas", icono: CheckCircle2 },
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol") as "admin" | "agendador" | "paciente" | null;
    if (token || rol === "paciente") {
      if (rol) {
        setRolActivo(rol);
      }
      if (rol === "paciente") setVista("agendar-web");
      if (rol === "admin") setVista("configuracion");
      if (rol === "agendador") setVista("citas");
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(rol) => {
          setRolActivo(rol);
          if (rol === "paciente") setVista("agendar-web");
          if (rol === "admin") setVista("configuracion");
          if (rol === "agendador") setVista("citas");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  const renderVista = () => {
    switch (vista) {
      case "citas":
        return <Citas />;
      case "medicos":
        return <Medicos rol={rolActivo} />;
      case "pacientes":
        return <Pacientes />;
      case "agendar-web":
        return <AgendarWeb />;
      case "configuracion":
        return <Medicos rol={rolActivo} modo="configuracion" />;
      default:
        return <Citas />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar setVista={setVista} activeVista={vista} rol={rolActivo} />
        <main className="main-content">
          <section className="role-banner">
            <div className="role-banner-icon">
              <UserCog size={18} />
            </div>
            <div>
              <p className="role-banner-title">
                {rolActivo === "admin"
                  ? "Dashboard Administrador"
                  : rolActivo === "agendador"
                  ? "Dashboard Agendador"
                  : "Dashboard Paciente"}
              </p>
              <span className="role-banner-subtitle">
                {rolActivo === "admin"
                  ? "Gestiona la configuración de horarios y parámetros de agenda"
                  : rolActivo === "agendador"
                  ? "Administra citas y operaciones del día"
                  : "Agenda tu cita de forma rápida y segura"}
              </span>
            </div>
          </section>
          <section className="metrics-grid">
            {(metricasVista[vista] ?? metricasVista.citas).map((m) => (
              <article className="metric-card" key={`${vista}-${m.titulo}`}>
                <div className="metric-icon"><m.icono size={20} /></div>
                <div>
                  <p className="metric-title">{m.titulo}</p>
                  <h3 className="metric-value">{m.valor}</h3>
                  <span className="metric-note">{m.nota}</span>
                </div>
              </article>
            ))}
          </section>
          {renderVista()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;