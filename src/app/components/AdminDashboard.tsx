import { useState } from "react";
import {
  Heart,
  Bell,
  Search,
  Menu,
  LogOut,
  Settings,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Shield,
  BarChart3,
  Users,
  Stethoscope,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { SystemConfigPage } from "./SystemConfigPage";
import { UsersManagementPage } from "./UsersManagementPage";
import { ProfessionalsManagementPage } from "./ProfessionalsManagementPage";
import { ReportsPage } from "./ReportsPage";
import { AuditLogPage } from "./AuditLogPage";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<string>("dashboard");

  // Datos de ejemplo para el dashboard administrativo
  const stats = [
    {
      icon: Users,
      label: "Total Usuarios",
      value: "245",
      change: "+12%",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Stethoscope,
      label: "Profesionales",
      value: "28",
      change: "+2%",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: Calendar,
      label: "Citas Este Mes",
      value: "456",
      change: "+8%",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: AlertCircle,
      label: "Alertas Pendientes",
      value: "3",
      change: "-1%",
      color: "from-pink-500 to-red-500",
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "users":
        return <UsersManagementPage />;
      case "professionals":
        return <ProfessionalsManagementPage />;
      case "system-config":
        return <SystemConfigPage />;
      case "reports":
        return <ReportsPage />;
      case "audit-log":
        return <AuditLogPage />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-600 mt-2">Bienvenido, Administrador</p>
        </div>
        <Button variant="outline" size="lg" className="gap-2">
          <Calendar className="w-4 h-4" />
          Hoy
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change} desde el mes pasado</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accesos Rápidos */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView("system-config")}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all text-left"
            >
              <Settings className="w-6 h-6 text-cyan-600 mb-2" />
              <p className="font-semibold text-gray-900">Configuración del Sistema</p>
              <p className="text-sm text-gray-600">Horarios y disponibilidad</p>
            </button>
            <button
              onClick={() => setCurrentView("professionals")}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <Stethoscope className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Profesionales</p>
              <p className="text-sm text-gray-600">Gestionar médicos y terapistas</p>
            </button>
            <button
              onClick={() => setCurrentView("users")}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Usuarios</p>
              <p className="text-sm text-gray-600">Gestionar usuarios del sistema</p>
            </button>
            <button
              onClick={() => setCurrentView("reports")}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all text-left"
            >
              <BarChart3 className="w-6 h-6 text-pink-600 mb-2" />
              <p className="font-semibold text-gray-900">Reportes</p>
              <p className="text-sm text-gray-600">Ver estadísticas y reportes</p>
            </button>
          </div>
        </Card>

        {/* Información del Sistema */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estado del Sistema</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Base de datos</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium">Conectado</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Servidor</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium">En línea</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Respuesta API</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-medium">120ms</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("audit-log")}
              className="w-full mt-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-900 font-medium text-sm"
            >
              Ver Log de Auditoría
            </button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white text-gray-900 transition-all duration-300 flex flex-col border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00B6DC] to-[#AB48FF] flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg">Piedra Azul</span>}
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "dashboard"
                ? "bg-gradient-to-r from-[#00B6DC] to-[#AB48FF] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentView("system-config")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "system-config"
                ? "bg-gradient-to-r from-[#00B6DC] to-[#AB48FF] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Configuración</span>}
          </button>

          <button
            onClick={() => setCurrentView("professionals")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "professionals"
                ? "bg-gradient-to-r from-[#00B6DC] to-[#AB48FF] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Stethoscope className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Profesionales</span>}
          </button>

          <button
            onClick={() => setCurrentView("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "users"
                ? "bg-gradient-to-r from-[#00B6DC] to-[#AB48FF] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Usuarios</span>}
          </button>

          <button
            onClick={() => setCurrentView("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "reports"
                ? "bg-gradient-to-r from-[#00B6DC] to-[#AB48FF] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Reportes</span>}
          </button>
        </nav>

        {/* Usuario y logout */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <button
            onClick={() => onNavigate("login")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
              <Search className="w-5 h-5 text-gray-600" />
              <Input
                placeholder="Buscar..."
                className="bg-gray-100 border-0 focus:ring-0"
              />
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="font-medium text-gray-900 text-sm">Administrador</p>
                <p className="text-gray-600 text-xs">admin@piedrazul.com</p>
              </div>
              <Avatar className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

