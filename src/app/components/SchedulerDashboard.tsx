import { useState } from "react";
import {
  Heart,
  Bell,
  Search,
  Menu,
  LogOut,
  Calendar,
  Clock,
  User,
  Plus,
  Filter,
  Users,
  Phone,
  Mail,
  Stethoscope,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { AppointmentSchedulingPage } from "./AppointmentSchedulingPage";

interface SchedulerDashboardProps {
  onNavigate: (page: string) => void;
}

interface Appointment {
  id: number;
  patientName: string;
  patientDocument: string;
  professionalName: string;
  specialty: string;
  date: string;
  time: string;
  status: "Confirmada" | "Pendiente" | "Cancelada";
  phone: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
}

export function SchedulerDashboard({ onNavigate }: SchedulerDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all");

  // Datos de citas del día
  const appointments: Appointment[] = [
    {
      id: 1,
      patientName: "María González López",
      patientDocument: "12345678",
      professionalName: "Dr. Juan Pérez",
      specialty: "Cardiología",
      date: "2026-03-14",
      time: "09:00",
      status: "Confirmada",
      phone: "+57 312 456 7890",
    },
    {
      id: 2,
      patientName: "Carlos Ruiz Martínez",
      patientDocument: "87654321",
      professionalName: "Dra. Ana López",
      specialty: "Neurología",
      date: "2026-03-14",
      time: "10:00",
      status: "Pendiente",
      phone: "+57 310 123 4567",
    },
    {
      id: 3,
      patientName: "Laura Torres Silva",
      patientDocument: "11223344",
      professionalName: "Dr. Juan Pérez",
      specialty: "Cardiología",
      date: "2026-03-14",
      time: "10:30",
      status: "Confirmada",
      phone: "+57 315 789 0123",
    },
    {
      id: 4,
      patientName: "Roberto Cruz García",
      patientDocument: "55667788",
      professionalName: "Dr. Juan Pérez",
      specialty: "Cardiología",
      date: "2026-03-14",
      time: "11:00",
      status: "Confirmada",
      phone: "+57 318 456 7890",
    },
  ];

  const professionals: Professional[] = [
    { id: "1", name: "Dr. Juan Pérez", specialty: "Cardiología" },
    { id: "2", name: "Dra. Ana López", specialty: "Neurología" },
    { id: "3", name: "Dra. Laura Martínez", specialty: "Pediatría" },
    { id: "4", name: "Dr. Carlos Rodríguez", specialty: "Dermatología" },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedProfessional !== "all" && apt.professionalName !== selectedProfessional)
      return false;
    if (selectedDate && apt.date !== selectedDate) return false;
    return true;
  });

  const stats = [
    {
      label: "Citas Hoy",
      value: appointments.filter((a) => a.date === selectedDate).length.toString(),
      color: "from-cyan-500 to-blue-500",
    },
    {
      label: "Confirmadas",
      value: filteredAppointments.filter((a) => a.status === "Confirmada").length.toString(),
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Pendientes",
      value: filteredAppointments.filter((a) => a.status === "Pendiente").length.toString(),
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Profesionales",
      value: professionals.length.toString(),
      color: "from-purple-500 to-pink-500",
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "new-appointment":
        return <AppointmentSchedulingPage />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamiento de Citas</h1>
          <p className="text-gray-600 mt-2">
            Gestión de citas médicas y terapéuticas
          </p>
        </div>
        <Button
          onClick={() => setCurrentView("new-appointment")}
          className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color}`}></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Búsqueda y filtros */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Buscar y Filtrar Citas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesional
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Todos los profesionales</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.name}>
                  {prof.name} - {prof.specialty}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setSelectedProfessional("all");
              }}
              variant="outline"
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de citas */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Citas del {new Date(selectedDate).toLocaleDateString("es-ES")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Profesional
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8" />
                        <div>
                          <p className="font-medium text-gray-900">{apt.patientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.patientDocument}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{apt.professionalName}</p>
                        <p className="text-xs text-gray-600">{apt.specialty}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {apt.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          apt.status === "Confirmada"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "Pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status === "Confirmada" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${apt.phone}`}
                          className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                    No hay citas para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total de citas: <span className="font-semibold">{filteredAppointments.length}</span>
          </p>
        </div>
      </Card>
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
            <Calendar className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Citas del Día</span>}
          </button>

          <button
            onClick={() => setCurrentView("new-appointment")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "new-appointment"
                ? "bg-gradient-to-r from-[#00B6DC] to-[#AB48FF] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Nueva Cita</span>}
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
                placeholder="Buscar citas o pacientes..."
                className="bg-gray-100 border-0 focus:ring-0"
              />
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="font-medium text-gray-900 text-sm">Agendador</p>
                <p className="text-gray-600 text-xs">scheduler@piedrazul.com</p>
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

