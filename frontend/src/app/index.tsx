import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Login from "./pages/Login";
import AgendarWeb from "./pages/AgendarWeb";
import Sidebar from "../components/organisms/Sidebar";
import Header from "../components/organisms/Header";
import Footer from "../components/organisms/Footer";
import DashboardLayout from "../components/templates/DashboardLayout";
import Citas from "./pages/citas";
import MisCitas from "./pages/MisCitas";
import Medicos from "./pages/medicos";
import Pacientes from "./pages/pacientes";
import ValidadorQR from "../components/molecules/ValidadorQR";
import AuthCallback from "../auth/AuthCallback";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../auth/authService";

// Componente para pacientes anónimos (sin Auth0)
function PacienteAnonimoDashboard() {
  const [vista, setVista] = useState("agendar-web");

  const metricasVista: Record<string, { titulo: string; valor: string; nota: string; icono: any }[]> = {
    "agendar-web": [
      { titulo: "Reserva en línea", valor: "24/7", nota: "Disponible siempre", icono: Globe },
      { titulo: "Especialistas", valor: "12", nota: "En nuestra clínica", icono: Stethoscope },
      { titulo: "Cobertura", valor: "7", nota: "Especialidades", icono: ShieldCheck },
    ],
    "mis-citas": [
      { titulo: "Próximas citas", valor: "0", nota: "Agenda la primera", icono: CalendarDays },
      { titulo: "Historial", valor: "0", nota: "Citas anteriores", icono: Clock3 },
      { titulo: "Recordatorios", valor: "Activos", nota: "Vía SMS/Email", icono: Activity },
    ],
  };

  const renderVista = () => {
    switch (vista) {
      case "agendar-web":
        return <AgendarWeb />;
      case "mis-citas":
        return <MisCitas rol="paciente" esAnonimo={true} />;
      default:
        return <AgendarWeb />;
    }
  };

  return (
    <DashboardLayout
      header={<Header esAnonimo={true} />}
      sidebar={<Sidebar setVista={setVista} activeVista={vista} rol="paciente" esAnonimo={true} />}
      footer={<Footer />}
    >
      <section className="role-banner">
        <div className="role-banner-icon">
          <UserCog size={18} />
        </div>
        <div>
          <p className="role-banner-title">Portal del Paciente</p>
          <span className="role-banner-subtitle">Agenda y consulta tus citas de forma rápida</span>
        </div>
      </section>
      <section className="metrics-grid">
        {(metricasVista[vista] ?? metricasVista["agendar-web"]).map((m) => (
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
    </DashboardLayout>
  );
}

// Componente para usuarios autenticados con Auth0
function AuthenticatedApp() {
  const { isAuthenticated, isLoading, getUserRole, getUserRoles, getRawRoles, logout, user } = useAuth();
  const [vista, setVista] = useState("citas");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

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
    "mis-citas": [
      { titulo: "Próximas citas", valor: "8", nota: "Esta semana", icono: CalendarDays },
      { titulo: "Pacientes", valor: "124", nota: "Atendidos este mes", icono: Users },
      { titulo: "Asistencia", valor: "92%", nota: "Tasa de confirmación", icono: Activity },
    ],
    validar: [
      { titulo: "Escaneos hoy", valor: "24", nota: "Códigos validados", icono: CheckCircle2 },
      { titulo: "Tasa éxito", valor: "98%", nota: "Validaciones correctas", icono: TrendingUp },
      { titulo: "Pendientes", valor: "3", nota: "Por validar", icono: Clock3 },
    ],
  };

  const availableRoles = getUserRoles();
  const rawRoles = getRawRoles();
  const authRole = selectedRole ?? getUserRole();
  const rolActivo = authRole === "admin"
    ? "admin"
    : authRole === "agendador"
    ? "agendador"
    : authRole === "medico"
    ? "medico"
    : authRole === "paciente"
    ? "paciente"
    : null;

  useEffect(() => {
    if (!rolActivo) return;
    if (rolActivo === "paciente") setVista("agendar-web");
    if (rolActivo === "admin") setVista("configuracion");
    if (rolActivo === "agendador") setVista("citas");
    if (rolActivo === "medico") setVista("mis-citas");
  }, [rolActivo]);

  useEffect(() => {
    setSelectedRole(null);
  }, [user?.sub]);

  if (isLoading) {
    return <AuthCallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (availableRoles.length === 0 && !isLoading) {
    return (
      <div className="login-shell">
        <section className="login-panel login-panel-left">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon"><UserCog size={30} /></div>
              <h1>Sin roles asignados</h1>
              <p>Tu cuenta no tiene roles. Contacta al administrador.</p>
            </div>
            <button
              className="login-submit-btn"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Cerrar sesión
            </button>
          </div>
        </section>
        <section className="login-panel login-panel-right">
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2>Acceso restringido</h2>
            <p>Se requiere al menos un rol para acceder al sistema.</p>
          </div>
        </section>
      </div>
    );
  }

  if (availableRoles.length > 0 && !selectedRole) {
    return (
      <div className="login-shell">
        <section className="login-panel login-panel-left">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon"><UserCog size={30} /></div>
              <h1>Elige tu rol</h1>
              <p>Selecciona el panel con el que deseas ingresar.</p>
            </div>
            <div className="login-form">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  className="login-submit-btn"
                  style={{ marginBottom: "0.75rem" }}
                  onClick={() => setSelectedRole(role)}
                >
                  {role === "admin"
                    ? "Ingresar como Administrador"
                    : role === "agendador"
                    ? "Ingresar como Agendador"
                    : role === "medico"
                    ? "Ingresar como Médico"
                    : "Ingresar como Paciente"}
                </button>
              ))}
              <p style={{ marginBottom: "0.75rem", opacity: 0.7 }}>
                Roles detectados: {rawRoles.length ? rawRoles.join(", ") : "ninguno"}
              </p>
              <button
                className="login-submit-btn"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </section>
        <section className="login-panel login-panel-right">
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2>Panel personalizado</h2>
            <p>Selecciona el rol adecuado para continuar.</p>
          </div>
        </section>
      </div>
    );
  }

  if (!rolActivo) {
    return (
      <div className="login-shell">
        <section className="login-panel login-panel-left">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon"><UserCog size={30} /></div>
              <h1>Acceso denegado</h1>
              <p>Tu cuenta no tiene un rol válido para este panel.</p>
            </div>
            <div className="login-form">
              <p style={{ marginBottom: "0.75rem", opacity: 0.75 }}>
                Roles detectados: {availableRoles.length ? availableRoles.join(", ") : "ninguno"}
              </p>
            </div>
            <button
              className="login-submit-btn"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Cerrar sesión
            </button>
          </div>
        </section>
        <section className="login-panel login-panel-right">
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2>Acceso restringido</h2>
            <p>Contacta al administrador para habilitar permisos.</p>
          </div>
        </section>
      </div>
    );
  }

  const renderVista = () => {
    switch (vista) {
        //case "citas":
        //return <Citas rol={rolActivo} />;
      case "citas":
        return rolActivo === "medico"
        ? <MisCitas rol={rolActivo} />
        : <Citas rol={rolActivo} />;
      case "medicos":
        return <Medicos rol={rolActivo} />;
      case "pacientes":
        return <Pacientes />;
      case "agendar-web":
        return <AgendarWeb />;
      case "configuracion":
        return <Medicos rol={rolActivo} modo="configuracion" />;
      case "mis-citas":
        return <MisCitas rol={rolActivo} />;
      case "validar":
        return <ValidadorQR rol={rolActivo} />;
      default:
        return <Citas rol={rolActivo} />;
    }
  };

  return (
    <DashboardLayout
      header={<Header />}
      sidebar={<Sidebar setVista={setVista} activeVista={vista} rol={rolActivo} />}
      footer={<Footer />}
    >
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
              : rolActivo === "medico"
              ? "Dashboard Médico"
              : "Dashboard Paciente"}
          </p>
          <span className="role-banner-subtitle">
            {rolActivo === "admin"
              ? "Gestiona la configuración de horarios y parámetros de agenda"
              : rolActivo === "agendador"
              ? "Administra citas y operaciones del día"
              : rolActivo === "medico"
              ? "Consulta y administra tus propias citas"
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
    </DashboardLayout>
  );
}

// Componente principal
function App() {
  // Verificar si es un paciente anónimo
  const isPacienteAnonimo = localStorage.getItem('paciente_anonimo') === 'true';

  if (isPacienteAnonimo) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<PacienteAnonimoDashboard />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;