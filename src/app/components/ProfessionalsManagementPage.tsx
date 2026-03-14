import { useState } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  Edit,
  Clock,
  Award,
  ToggleLeft,
  ToggleRight,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

interface Professional {
  id: number;
  name: string;
  type: "Médico" | "Terapista" | "Especialista";
  specialty: string;
  appointmentInterval: number; // en minutos
  status: "Activo" | "Inactivo";
  patientsPerDay: number;
  experience: string;
}

export function ProfessionalsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Datos de ejemplo
  const professionals: Professional[] = [
    {
      id: 1,
      name: "Dr. Juan Pérez García",
      type: "Médico",
      specialty: "Cardiología",
      appointmentInterval: 30,
      status: "Activo",
      patientsPerDay: 16,
      experience: "15 años",
    },
    {
      id: 2,
      name: "Dra. María López Hernández",
      type: "Médico",
      specialty: "Pediatría",
      appointmentInterval: 20,
      status: "Activo",
      patientsPerDay: 24,
      experience: "10 años",
    },
    {
      id: 3,
      name: "Lic. Carlos Ramírez Torres",
      type: "Terapista",
      specialty: "Fisioterapia",
      appointmentInterval: 45,
      status: "Activo",
      patientsPerDay: 10,
      experience: "8 años",
    },
    {
      id: 4,
      name: "Dra. Ana Martínez Ruiz",
      type: "Especialista",
      specialty: "Neurología",
      appointmentInterval: 40,
      status: "Activo",
      patientsPerDay: 12,
      experience: "20 años",
    },
    {
      id: 5,
      name: "Dr. Roberto Sánchez Díaz",
      type: "Médico",
      specialty: "Traumatología",
      appointmentInterval: 25,
      status: "Inactivo",
      patientsPerDay: 0,
      experience: "12 años",
    },
  ];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Médico":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white";
      case "Terapista":
        return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
      case "Especialista":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch =
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || prof.type === selectedType;
    return matchesSearch && matchesType;
  });

  const specialties = Array.from(new Set(professionals.map((p) => p.specialty)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h2>
          <p className="text-gray-600 mt-1">
            Administra médicos, terapistas y especialistas del hospital
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Profesional
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Profesionales</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {professionals.length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Médicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {professionals.filter((p) => p.type === "Médico").length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Especialidades</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {specialties.length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profesionales Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {professionals.filter((p) => p.status === "Activo").length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <ToggleRight className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-12 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="Médico">Médico</option>
              <option value="Terapista">Terapista</option>
              <option value="Especialista">Especialista</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProfessionals.map((professional) => (
          <Card
            key={professional.id}
            className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                    {professional.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {professional.name}
                    </h3>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-xl mt-1 ${getTypeBadgeColor(
                        professional.type
                      )} text-sm font-medium shadow-md`}
                    >
                      {professional.type}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
                  <div className="flex items-center space-x-2 text-purple-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium">Especialidad</span>
                  </div>
                  <p className="font-semibold text-gray-900">{professional.specialty}</p>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50">
                  <div className="flex items-center space-x-2 text-cyan-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Intervalo de Citas</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {professional.appointmentInterval} min
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="flex items-center space-x-2 text-blue-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Pacientes/Día</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {professional.patientsPerDay}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50">
                  <div className="flex items-center space-x-2 text-pink-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium">Experiencia</span>
                  </div>
                  <p className="font-semibold text-gray-900">{professional.experience}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {professional.status === "Activo" ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      professional.status === "Activo"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {professional.status}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`rounded-xl ${
                    professional.status === "Activo"
                      ? "border-red-300 text-red-600 hover:bg-red-50"
                      : "border-green-300 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {professional.status === "Activo" ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Professional Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Registrar Profesional
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl"
                >
                  ✕
                </Button>
              </div>

              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input
                    placeholder="Ej: Dr. Juan Pérez García"
                    className="h-12 rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Profesional</Label>
                    <select className="w-full h-12 px-4 rounded-2xl border border-gray-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400">
                      <option>Médico</option>
                      <option>Terapista</option>
                      <option>Especialista</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Especialidad</Label>
                    <select className="w-full h-12 px-4 rounded-2xl border border-gray-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400">
                      <option>Cardiología</option>
                      <option>Pediatría</option>
                      <option>Neurología</option>
                      <option>Traumatología</option>
                      <option>Fisioterapia</option>
                      <option>Dermatología</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Intervalo entre Citas (minutos)</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Años de Experiencia</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado Inicial</Label>
                  <select className="w-full h-12 px-4 rounded-2xl border border-gray-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400">
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <strong>Nota:</strong> El intervalo entre citas determina cuántos
                    pacientes puede atender el profesional por día. Este valor se usará
                    para calcular la disponibilidad automática en el sistema de
                    agendamiento.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-12 rounded-2xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    Registrar Profesional
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
