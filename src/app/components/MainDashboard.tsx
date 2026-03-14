import { useState } from "react";
import {
  Heart,
  Users,
  Calendar,
  Activity,
  Bell,
  Search,
  Menu,
  LogOut,
  Settings,
  User,
  FileText,
  Stethoscope,
  Pill,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
  Shield,
  BarChart3,
  CalendarCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { UsersManagementPage } from "./UsersManagementPage";
import { ProfessionalsManagementPage } from "./ProfessionalsManagementPage";
import { AppointmentSchedulingPage } from "./AppointmentSchedulingPage";
import { MedicalHistoryPage } from "./MedicalHistoryPage";
import { AuditLogPage } from "./AuditLogPage";
import { ReportsPage } from "./ReportsPage";
import { PatientSelfSchedulingPage } from "./PatientSelfSchedulingPage";
import { SystemConfigPage } from "./SystemConfigPage";

interface MainDashboardProps {
  onNavigate: (page: string) => void;
}

export function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<string>("dashboard");

  // Datos de ejemplo para el dashboard principal
  const stats = [
    {
      icon: Users,
      label: "Pacientes Hoy",
      value: "148",
      change: "+12%",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Calendar,
      label: "Citas Programadas",
      value: "32",
      change: "+5%",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: Activity,
      label: "Emergencias",
      value: "7",
      change: "-3%",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Stethoscope,
      label: "Doctores Activos",
      value: "24",
      change: "100%",
      color: "from-pink-500 to-red-500",
    },
  ];

  const recentPatients = [
    { id: 1, name: "María González", condition: "Revisión General", time: "10:30 AM", status: "En consulta" },
    { id: 2, name: "Carlos Ruiz", condition: "Cardiología", time: "11:00 AM", status: "Esperando" },
    { id: 3, name: "Ana Martínez", condition: "Pediatría", time: "11:30 AM", status: "Esperando" },
    { id: 4, name: "Luis Hernández", condition: "Traumatología", time: "12:00 PM", status: "Programado" },
  ];

  const upcomingAppointments = [
    { id: 1, patient: "Pedro Sánchez", doctor: "Dr. García", time: "14:00", specialty: "Neurología" },
    { id: 2, patient: "Laura Torres", doctor: "Dra. López", time: "14:30", specialty: "Oftalmología" },
    { id: 3, patient: "Roberto Cruz", doctor: "Dr. Mendoza", time: "15:00", specialty: "Dermatología" },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "users":
        return <UsersManagementPage />;
      case "professionals":
        return <ProfessionalsManagementPage />;
      case "appointments":
        return <AppointmentSchedulingPage />;
      case "patient-scheduling":
        return <PatientSelfSchedulingPage />;
      case "medical-history":
        return <MedicalHistoryPage />;
      case "audit":
        return <AuditLogPage />;
      case "reports":
        return <ReportsPage />;
      case "system-config":
        return <SystemConfigPage />;
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600">
                Bienvenido de nuevo, Dr. Pérez. Aquí está el resumen de hoy.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">{stat.change}</span>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pacientes Recientes */}
              <Card className="p-6 rounded-3xl border-0 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Pacientes Recientes</h3>
                  <Button
                    variant="ghost"
                    className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-xl"
                  >
                    Ver todos
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-cyan-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-600">{patient.condition}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{patient.time}</span>
                        </div>
                        <div className="text-xs mt-1">
                          <span
                            className={`px-2 py-1 rounded-lg ${
                              patient.status === "En consulta"
                                ? "bg-green-100 text-green-700"
                                : patient.status === "Esperando"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Próximas Citas */}
              <Card className="p-6 rounded-3xl border-0 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Próximas Citas</h3>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView("appointments")}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl"
                  >
                    Ver agenda
                  </Button>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {appointment.time}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{appointment.patient}</div>
                            <div className="text-sm text-gray-600">{appointment.doctor}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">{appointment.specialty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Alertas */}
            <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Alertas del Sistema</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <span className="text-sm text-gray-700">Paciente en sala de emergencias requiere atención inmediata</span>
                      <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                        Ver detalles
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                      <span className="text-sm text-gray-700">Inventario de medicamentos bajo - Requiere reabastecimiento</span>
                      <Button variant="outline" className="rounded-xl border-orange-500 text-orange-600 hover:bg-orange-50">
                        Revisar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-blue-50">
      {/* Navbar superior */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Izquierda: Logo y toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Piedra Azul
                </h1>
              </div>
            </div>

            {/* Centro: Búsqueda */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar pacientes, doctores, citas..."
                  className="pl-10 h-10 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Derecha: Notificaciones y perfil */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1666886573681-a8fbe983a3fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MTUwODU5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Usuario"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </Avatar>
                <div className="hidden lg:block">
                  <div className="text-sm font-semibold text-gray-900">Dr. Juan Pérez</div>
                  <div className="text-xs text-gray-500">Administrador</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden h-[calc(100vh-73px)] sticky top-[73px]`}
        >
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "dashboard"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView("users")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "users"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <User className="w-5 h-5" />
              <span>Usuarios</span>
            </button>
            <button
              onClick={() => setCurrentView("professionals")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "professionals"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Profesionales</span>
            </button>
            <button
              onClick={() => setCurrentView("appointments")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "appointments"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Citas</span>
            </button>
            <button
              onClick={() => setCurrentView("patient-scheduling")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "patient-scheduling"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Agendar Paciente</span>
            </button>
            <button
              onClick={() => setCurrentView("medical-history")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "medical-history"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Historia Clínica</span>
            </button>
            <button
              onClick={() => setCurrentView("audit")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "audit"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Auditoría</span>
            </button>
            <button
              onClick={() => setCurrentView("reports")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "reports"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reportes</span>
            </button>
            <button
              onClick={() => setCurrentView("system-config")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "system-config"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Configuración del Sistema</span>
            </button>

            <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-100 text-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </button>
              <button
                onClick={() => onNavigate("login")}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}