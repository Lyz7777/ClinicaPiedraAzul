import { useState } from "react";
import {
  Heart,
  Bell,
  Search,
  Menu,
  LogOut,
  Settings,
  Calendar,
  Clock,
  User,
  FileText,
  CalendarCheck,
  History,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { PatientSelfSchedulingPage } from "./PatientSelfSchedulingPage";

interface PatientDashboardProps {
  onNavigate: (page: string) => void;
}

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<string>("dashboard");

  // Datos del paciente (en producción vendrían del backend)
  const patientData = {
    name: "María González López",
    email: "maria@email.com",
    phone: "+52 123 456 7890",
    document: "1234567890",
    birthdate: "1990-05-15",
  };

  // Citas del paciente
  const myAppointments = [
    {
      id: 1,
      professional: "Dr. Juan Pérez",
      specialty: "Cardiología",
      date: "2026-03-20",
      time: "10:00",
      status: "Confirmada" as const,
      location: "Consultorio 201, Segundo Piso",
    },
    {
      id: 2,
      professional: "Dra. Ana Martínez",
      specialty: "Neurología",
      date: "2026-03-25",
      time: "14:30",
      status: "Programada" as const,
      location: "Consultorio 305, Tercer Piso",
    },
  ];

  const appointmentHistory = [
    {
      id: 1,
      professional: "Dr. Carlos Ruiz",
      specialty: "Medicina General",
      date: "2026-02-15",
      time: "11:00",
      status: "Completada" as const,
    },
    {
      id: 2,
      professional: "Dra. Laura Torres",
      specialty: "Oftalmología",
      date: "2026-01-20",
      time: "09:30",
      status: "Completada" as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-100 text-green-700 border-green-200";
      case "Programada":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelada":
        return "bg-red-100 text-red-700 border-red-200";
      case "Completada":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmada":
        return <CheckCircle className="w-4 h-4" />;
      case "Programada":
        return <Clock className="w-4 h-4" />;
      case "Cancelada":
        return <XCircle className="w-4 h-4" />;
      case "Completada":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "schedule":
        return <PatientSelfSchedulingPage />;
      case "my-appointments":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Mis Citas</h2>
              <p className="text-gray-600 mt-1">
                Gestiona y visualiza todas tus citas médicas
              </p>
            </div>

            {/* Próximas Citas */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Próximas Citas</h3>
              {myAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {new Date(appointment.date).getDate()}
                        <div className="text-xs">
                          {new Date(appointment.date).toLocaleDateString("es-ES", {
                            month: "short",
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {appointment.professional}
                        </h4>
                        <p className="text-gray-600">{appointment.specialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusBadge(
                        appointment.status
                      )}`}
                    >
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status}</span>
                    </span>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl border-2"
                    >
                      Re-agendar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Historial */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                Historial de Citas
              </h3>
              <div className="space-y-3">
                {appointmentHistory.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="p-4 rounded-2xl border-0 shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                          {new Date(appointment.date).getDate()}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {appointment.professional}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty} - {appointment.date} a las{" "}
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-medium border ${getStatusBadge(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status}</span>
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Mi Perfil</h2>
              <p className="text-gray-600 mt-1">
                Información personal y de contacto
              </p>
            </div>

            <Card className="p-8 rounded-3xl border-0 shadow-lg">
              <div className="flex items-start gap-6 mb-8">
                <Avatar className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {patientData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {patientData.name}
                  </h3>
                  <p className="text-gray-600">Paciente</p>
                  <Button className="mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500">
                    Editar Perfil
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm text-gray-600">Correo Electrónico</span>
                  </div>
                  <p className="font-semibold text-gray-900">{patientData.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm text-gray-600">Teléfono</span>
                  </div>
                  <p className="font-semibold text-gray-900">{patientData.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm text-gray-600">Documento</span>
                  </div>
                  <p className="font-semibold text-gray-900">{patientData.document}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm text-gray-600">Fecha de Nacimiento</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(patientData.birthdate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Bienvenido, {patientData.name.split(" ")[0]}
              </h2>
              <p className="text-gray-600">
                Gestiona tus citas médicas de forma rápida y sencilla
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Próximas Citas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {myAppointments.length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Historial</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {appointmentHistory.length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <History className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Confirmadas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {myAppointments.filter((a) => a.status === "Confirmada").length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Acción Rápida */}
            <Card className="p-8 rounded-3xl border-0 shadow-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">¿Necesitas una cita?</h3>
                  <p className="text-white/90">
                    Agenda tu próxima consulta de forma rápida y segura
                  </p>
                </div>
                <Button
                  onClick={() => setCurrentView("schedule")}
                  className="bg-white text-cyan-600 hover:bg-gray-100 rounded-2xl h-12 px-8"
                >
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  Agendar Cita
                </Button>
              </div>
            </Card>

            {/* Próximas Citas */}
            <Card className="p-6 rounded-3xl border-0 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Próximas Citas</h3>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView("my-appointments")}
                  className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-xl"
                >
                  Ver todas
                </Button>
              </div>
              <div className="space-y-4">
                {myAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex flex-col items-center justify-center text-white font-bold">
                          <div className="text-xl">
                            {new Date(appointment.date).getDate()}
                          </div>
                          <div className="text-xs">
                            {new Date(appointment.date).toLocaleDateString("es-ES", {
                              month: "short",
                            })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {appointment.professional}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-medium border ${getStatusBadge(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Información */}
            <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-blue-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Información Importante
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Por favor llega 10 minutos antes de tu cita</li>
                    <li>
                      • Recuerda traer tu documento de identidad y tarjeta de seguro
                    </li>
                    <li>
                      • Si necesitas cancelar, hazlo con al menos 24 horas de
                      anticipación
                    </li>
                  </ul>
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
                  placeholder="Buscar especialidades, doctores..."
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
                <Avatar className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {patientData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </Avatar>
                <div className="hidden lg:block">
                  <div className="text-sm font-semibold text-gray-900">
                    {patientData.name.split(" ").slice(0, 2).join(" ")}
                  </div>
                  <div className="text-xs text-gray-500">Paciente</div>
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
              <Heart className="w-5 h-5" />
              <span>Inicio</span>
            </button>
            <button
              onClick={() => setCurrentView("schedule")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "schedule"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Agendar Cita</span>
            </button>
            <button
              onClick={() => setCurrentView("my-appointments")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "my-appointments"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Mis Citas</span>
            </button>
            <button
              onClick={() => setCurrentView("profile")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                currentView === "profile"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <User className="w-5 h-5" />
              <span>Mi Perfil</span>
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
