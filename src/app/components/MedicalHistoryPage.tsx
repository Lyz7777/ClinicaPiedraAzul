import { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Lock,
  Eye,
  Calendar,
  User,
  Stethoscope,
  AlertCircle,
  ClipboardList,
  Activity,
  Pill,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface MedicalRecord {
  id: number;
  patientName: string;
  patientId: string;
  appointmentId: number;
  professionalName: string;
  specialty: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
  prescriptions: string[];
  followUp?: string;
  accessedBy: string[];
}

export function MedicalHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [userRole] = useState<string>("Médico/Terapista"); // Simulación de rol

  // Datos de ejemplo
  const medicalRecords: MedicalRecord[] = [
    {
      id: 1,
      patientName: "María González López",
      patientId: "PAC-001",
      appointmentId: 1,
      professionalName: "Dr. Juan Pérez",
      specialty: "Cardiología",
      date: "2026-02-20",
      diagnosis: "Hipertensión arterial leve",
      symptoms: "Dolor de cabeza ocasional, mareos",
      treatment: "Cambios en dieta, ejercicio regular",
      notes: "Paciente refiere mejoría con tratamiento previo",
      vitalSigns: {
        bloodPressure: "130/85 mmHg",
        heartRate: "78 bpm",
        temperature: "36.5°C",
        weight: "68 kg",
      },
      prescriptions: ["Losartán 50mg - 1 vez al día", "Control en 30 días"],
      followUp: "Control en 1 mes",
      accessedBy: ["Dr. Juan Pérez", "Dra. María López"],
    },
    {
      id: 2,
      patientName: "Carlos Ramírez Torres",
      patientId: "PAC-002",
      appointmentId: 2,
      professionalName: "Dra. María López",
      specialty: "Pediatría",
      date: "2026-02-19",
      diagnosis: "Control de crecimiento - Normal",
      symptoms: "Ninguno",
      treatment: "Continuar con alimentación balanceada",
      notes: "Desarrollo psicomotor adecuado para la edad",
      vitalSigns: {
        bloodPressure: "90/60 mmHg",
        heartRate: "85 bpm",
        temperature: "36.8°C",
        weight: "25 kg",
      },
      prescriptions: ["Vitaminas multivitamínicas", "Próxima revisión en 6 meses"],
      followUp: "Control en 6 meses",
      accessedBy: ["Dra. María López"],
    },
    {
      id: 3,
      patientName: "Ana Martínez Ruiz",
      patientId: "PAC-003",
      appointmentId: 3,
      professionalName: "Lic. Carlos Ramírez",
      specialty: "Fisioterapia",
      date: "2026-02-18",
      diagnosis: "Rehabilitación post-quirúrgica de rodilla",
      symptoms: "Dolor moderado al caminar, limitación de movimiento",
      treatment: "Ejercicios de fortalecimiento, electroterapia",
      notes: "Paciente muestra progreso favorable, 70% de recuperación",
      vitalSigns: {
        bloodPressure: "120/80 mmHg",
        heartRate: "72 bpm",
        temperature: "36.6°C",
        weight: "62 kg",
      },
      prescriptions: [
        "Ejercicios en casa 2 veces al día",
        "Aplicar hielo después de ejercicios",
      ],
      followUp: "Sesión de seguimiento en 1 semana",
      accessedBy: ["Lic. Carlos Ramírez", "Dr. Roberto Sánchez"],
    },
  ];

  const filteredRecords = medicalRecords.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasClinicAccess = ["Médico/Terapista", "Administrador"].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Historia Clínica</h2>
          <p className="text-gray-600 mt-1">
            Registro médico con acceso restringido por rol
          </p>
        </div>
        {hasClinicAccess && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg h-12 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Historia
          </Button>
        )}
      </div>

      {/* Access Control Notice */}
      <Card className="p-4 rounded-3xl border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-l-purple-500">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Acceso Controlado - Rol: {userRole}
            </p>
            <p className="text-sm text-gray-600">
              Solo personal clínico autorizado puede acceder a historias clínicas. Todos
              los accesos son registrados en auditoría.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registros</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {medicalRecords.length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pacientes Únicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {new Set(medicalRecords.map((r) => r.patientId)).size}
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
                {new Set(medicalRecords.map((r) => r.specialty)).size}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6 rounded-3xl border-0 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por paciente, ID o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white"
          />
        </div>
      </Card>

      {/* Medical Records List */}
      {!hasClinicAccess ? (
        <Card className="p-12 rounded-3xl border-0 shadow-lg text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Acceso Denegado</h3>
            <p className="text-gray-600">
              No tienes permisos para acceder a las historias clínicas. Solo el personal
              clínico autorizado puede ver esta información.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="p-6 rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {record.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {record.patientName}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700 rounded-xl">
                          {record.patientId}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          <span>
                            {record.professionalName} - {record.specialty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{record.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis and Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <ClipboardList className="w-4 h-4" />
                        <span className="text-xs font-semibold">DIAGNÓSTICO</span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">
                        {record.diagnosis}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50">
                      <div className="flex items-center gap-2 text-cyan-600 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-semibold">SÍNTOMAS</span>
                      </div>
                      <p className="text-sm text-gray-900">{record.symptoms}</p>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 text-center">
                      <p className="text-xs text-gray-600">Presión Arterial</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {record.vitalSigns.bloodPressure}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 text-center">
                      <p className="text-xs text-gray-600">Frecuencia Cardíaca</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {record.vitalSigns.heartRate}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 text-center">
                      <p className="text-xs text-gray-600">Temperatura</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {record.vitalSigns.temperature}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 text-center">
                      <p className="text-xs text-gray-600">Peso</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        {record.vitalSigns.weight}
                      </p>
                    </div>
                  </div>

                  {/* Access Log */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>
                      Accedido por: {record.accessedBy.join(", ")} -{" "}
                      {record.accessedBy.length} acceso(s) registrado(s)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  onClick={() => {
                    setSelectedRecord(record);
                    setShowViewModal(true);
                  }}
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Completo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Historia Clínica Completa
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowViewModal(false)}
                  className="rounded-xl"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Patient Info */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50">
                  <h4 className="font-bold text-gray-900 mb-2">Información del Paciente</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nombre: </span>
                      <span className="font-semibold">{selectedRecord.patientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ID: </span>
                      <span className="font-semibold">{selectedRecord.patientId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha: </span>
                      <span className="font-semibold">{selectedRecord.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profesional: </span>
                      <span className="font-semibold">
                        {selectedRecord.professionalName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-purple-50">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-purple-600" />
                      Diagnóstico
                    </h4>
                    <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Síntomas
                    </h4>
                    <p className="text-gray-700">{selectedRecord.symptoms}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-green-50">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-green-600" />
                      Tratamiento
                    </h4>
                    <p className="text-gray-700">{selectedRecord.treatment}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-yellow-50">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-yellow-600" />
                      Prescripciones
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {selectedRecord.prescriptions.map((prescription, i) => (
                        <li key={i}>{prescription}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50">
                    <h4 className="font-bold text-gray-900 mb-2">Notas Adicionales</h4>
                    <p className="text-gray-700">{selectedRecord.notes}</p>
                  </div>

                  {selectedRecord.followUp && (
                    <div className="p-4 rounded-2xl bg-cyan-50">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                        Seguimiento
                      </h4>
                      <p className="text-gray-700">{selectedRecord.followUp}</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowViewModal(false)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
